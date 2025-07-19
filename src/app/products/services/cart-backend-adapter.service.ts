import { Injectable } from '@angular/core';
import { ProductsService } from './products.service';
import { CartItem } from '@products/interfaces/cart-item.interface';
import { Gender, Product, Size } from '@products/interfaces/product.interface';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '@auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class CartBackendAdapterService {
  private carritoPrefix = '__CARRITO__';

  constructor(
    private productService: ProductsService,
    private authService: AuthService,
  ) {}

  loadCart(userId: string): Observable<CartItem[]> {
    return this.productService.getProductByIdSlug(`carrito-${userId}`).pipe(
      map(product => {
        if (!product?.description?.startsWith(this.carritoPrefix)) return [];
        const json = product.description.replace(this.carritoPrefix, '');
        const items: CartItem[] = JSON.parse(json);
        items.map(item => ({
          userId,
          product,
          quantity: item.quantity
        }))
        console.log('LOADER CART', items)
        return items;
      }),
      catchError(() => of([]))
    );
  }

  saveCart(userId: string, cartItems: CartItem[]): Observable<void> {

    const serialized = JSON.stringify(cartItems);

    const user = this.authService.user()!;

    const carritoProduct: Partial<Product> = {
      title: `Carrito virtual-${user.fullName}-${userId}`,
      price: 100,
      stock: 100,
      description: `${this.carritoPrefix}${serialized}`,
      slug: `carrito-${userId}`,
      sizes: [Size.L],
      gender: Gender.Unisex,
      tags: ['carrito'],
      images: [],
    };

    return this.productService.getProductByIdSlug(carritoProduct.slug!).pipe(
      switchMap(existingProduct => {
        if (!existingProduct?.id) {
          throw new Error('Producto de carrito no encontrado por slug.');
        }

        console.log('Carrito encontrado con ID:', existingProduct.id);

        const { id, ...productNoID } = existingProduct;

        const productToUpdate: Partial<Product> = {
          ...productNoID,
          description: `${this.carritoPrefix}${serialized}`,
        };

        console.log('[saveCart] Producto ya existe, actualizado con valores:', productToUpdate);

        return this.productService.updateProduct(existingProduct.id!, productToUpdate);
      }),
      catchError(error => {
        console.error('[saveCart] Error en updateProduct, se intentará crear:', carritoProduct);
        return this.productService.createProduct(carritoProduct);
      }),
      map(() => void 0),
      catchError(err => {
        console.error('[saveCart] Error final (falló creación también):', err);
        throw err;
      })
    );
  }
}
