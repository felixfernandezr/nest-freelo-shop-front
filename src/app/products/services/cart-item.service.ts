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
    if (product.stock <= 0 && change > 0) return; // Si no hay stock y estamos intentando aumentar

    const itemIndex = this.cartItems.findIndex(
      item => item.userId === userId && item.product.id === product.id
    );

    const changeAbs = Math.abs(change); // Siempre positivo

    if (change > 0) {
      product.stock -= changeAbs;
    } else if (change < 0 && this.cartItems[itemIndex]?.quantity > 1) {
      product.stock += changeAbs;
    } else {
      return;
    }

    if (itemIndex !== -1) {
      this.cartItems[itemIndex].quantity += change;
    } else {
      this.cartItems.push({ userId, product, quantity: 1 });
    }

    // Sincronizamos el cambio con el backend (actualizando el stock del producto)
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
}
