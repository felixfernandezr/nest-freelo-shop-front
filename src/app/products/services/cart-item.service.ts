import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CartItem } from '@products/interfaces/cart-item.interface';
import { Product } from '@products/interfaces/product.interface';
import { ProductsService } from './products.service';
import { CartBackendAdapterService } from './cart-backend-adapter.service';
import { AuthService } from '@auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class CartItemService {
  private storageKey = 'cartItems';
  private cartItems: CartItem[] = [];
  private userCartSubject = new BehaviorSubject<CartItem[]>([]);
  public userCart$ = this.userCartSubject.asObservable();
  private loading = signal(true);
  readonly isLoading$ = this.loading.asReadonly();
  public cooldownMap: { [productId: string]: boolean } = {};

  public cartItemCount$: Observable<number> = this.userCart$.pipe(
    map((cartItems: CartItem[]) => cartItems.length)
  );

  constructor(
    private productService: ProductsService,
    private cartBackend: CartBackendAdapterService,
    private authService: AuthService,
  ) {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      this.cartItems = JSON.parse(data);
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems));
  }

  private updateUserCart(userId: string) {
    const userCart = this.cartItems.filter(item => item.userId === userId);
    this.userCartSubject.next(userCart);
  }

  initializeUserCart(userId: string) {
    this.loading.set(true);

    this.getCart(userId);
    this.updateUserCart(userId);

    this.loading.set(false);
  }

  getCart(userId: string): CartItem[] {
    // verifica si ya lo tiene en memoria
    const inMemory = this.cartItems.filter(item => item.userId === userId);
    if (inMemory.length) return inMemory;

    // intenta cargar desde localStorage
    const local = localStorage.getItem(this.storageKey);
    if (local) {
      this.cartItems = JSON.parse(local);
      const userCart = this.cartItems.filter(item => item.userId === userId);
      if (userCart.length > 0) {
        this.updateUserCart(userId);
        console.log('carrito local storage: ', userCart);
        return userCart;
      }
    }

    // si no esta, intenta cargar del backend y actualiza cuando llegue
    this.cartBackend.loadCart(userId).subscribe({
      next: restoredCart => {
        console.log('cart loaded from backend', restoredCart);
        this.cartItems.push(...restoredCart);
        this.saveCartToStorage();
        this.updateUserCart(userId);
      },
      error: err => console.error('Error loading cart from backend', err)
    });

    // devuelve vacio (se actualiza cuando llegue el backend)
    return [];
  }

  addToCart(userId: string, product: Product): void {
    const itemIndex = this.cartItems.findIndex(
      item => item.userId === userId && item.product.id === product.id
    );

    if (product.stock <= 0) return;

    product.stock -= 1;

    if (itemIndex !== -1) {
      this.cartItems[itemIndex].quantity += 1;
    } else {
      this.cartItems.push({ userId, product, quantity: 1 });
    }

    this.productService.updateProduct(product.id, { stock: product.stock }).subscribe({
      next: updated => {
        this.productService.updateProductCache(updated);
        this.saveCartToStorage();
        this.updateUserCart(userId);
        this.syncCartToBackend(userId);
      },
      error: err => console.error('Error actualizando producto', err),
    });
  }

  removeProductsFromCart(productIds: string[]) {
    const currentUser = this.authService.user();
    if (!currentUser) return;

    const removedItems: CartItem[] = this.cartItems.filter(
      item => item.userId == currentUser.id || productIds.includes(item.product.id)
    );

    removedItems.forEach(item => {
      this.changeCartQuant(currentUser.id, item.product, -item.quantity)
    });

    this.cartItems = this.cartItems.filter(
      item => item.userId !== currentUser.id || !productIds.includes(item.product.id)
    );

    this.saveCartToStorage();
    this.updateUserCart(currentUser.id);
    this.syncCartToBackend(currentUser.id);
  }

  private syncCartToBackend(userId: string) {
    const userCart = this.cartItems.filter(item => item.userId === userId);
    this.cartBackend.saveCart(userId, userCart).subscribe({
      next: () => console.log('Carrito sincronizado con backend'),
      error: (err) => console.error('Error sincronizando carrito', err)
    });
  }

  changeCartQuant(userId: string, product: Product, change: number): void {
    const productId = product.id;

    if (this.cooldownMap[productId]) return;

    const itemIndex = this.cartItems.findIndex(
      item => item.userId === userId && item.product.id === productId
    );

    const cartItem = this.cartItems[itemIndex];
    const currentQty = cartItem?.quantity || 0;
    const changeAbs = Math.abs(change);


    if (change > 0 && product.stock < changeAbs) return;

    if (change < 0 && changeAbs > currentQty) return;

    this.cooldownMap[productId] = true;

    const newQty = currentQty + change;

    if (newQty <= 0) {
      if (itemIndex !== -1) this.cartItems.splice(itemIndex, 1);
    } else if (itemIndex !== -1) {
      this.cartItems[itemIndex].quantity = newQty;
    } else {
      this.cartItems.push({ userId, product, quantity: changeAbs });
    }

    const stockChange = change > 0 ? -changeAbs : changeAbs;
    const newStock = product.stock + stockChange;

    this.productService.updateProduct(productId, { stock: newStock }).subscribe({
      next: (updatedProduct) => {
        product.stock = updatedProduct.stock; // Se modifica stock dsp de actualizar backend evita carrera
        this.productService.updateProductCache(updatedProduct);
        this.saveCartToStorage();
        this.updateUserCart(userId);
        this.syncCartToBackend(userId);
      },
      error: (err) => {
        console.error('Error actualizando producto', err);
        // Rollback del carrito
        if (itemIndex !== -1) {
          this.cartItems[itemIndex].quantity = currentQty;
        } else {
          this.cartItems.push({ userId, product, quantity: currentQty });
        }
      },
      complete: () => {
        setTimeout(() => {
          this.cooldownMap[productId] = false;
        }, 200);
      }
    });
  }
}
