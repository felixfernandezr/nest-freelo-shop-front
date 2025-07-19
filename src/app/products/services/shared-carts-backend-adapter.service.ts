import { Injectable } from '@angular/core';
import { ProductsService } from './products.service';
import { CartItem } from '@products/interfaces/cart-item.interface';
import { Gender, Product, Size } from '@products/interfaces/product.interface';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '@auth/services/auth.service';
import { User } from '@auth/interfaces/user.interface';

type SharedCart = {
  sharedBy: User;
  cart: CartItem[];
  sharedAt: string;
};

@Injectable({ providedIn: 'root' })
export class SharedCartsBackendAdapterService {
  private sharedPrefix = '__CARRITOS_COMPARTIDOS__';


  constructor(
    private productService: ProductsService,
    private authService: AuthService
  ) {}

  /** Devuelve los carritos compartidos con este usuario */
  loadSharedCarts(forUserId: string): Observable<{ sharedBy: User, cart: CartItem[], sharedAt: string }[]> {
    return this.productService.getProductByIdSlug(`carrito-compartido-${forUserId}`).pipe(
      map(product => {
        if (!product?.description?.startsWith(this.sharedPrefix)) return [];
        const json = product.description.replace(this.sharedPrefix, '');
        return JSON.parse(json);
      }),
      catchError(() => of([]))
    );
  }

  /** Agrega un carrito compartido al usuario destino */
  addSharedCart(targetUser: Partial<User>, cart: CartItem[]): Observable<void> {
    const currentUser = this.authService.user()!;
    const snapshot = {
      sharedBy: {
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName
      },
      cart,
      sharedAt: new Date().toISOString()
    };

    const productSlug = `carrito-compartido-${targetUser.id}`;

    console.log(productSlug);

    return this.productService.getProductByIdSlug(productSlug).pipe(
      switchMap(existingProduct => {
        let sharedArray = [];

        if (existingProduct?.description?.startsWith(this.sharedPrefix)) {
          sharedArray = JSON.parse(existingProduct.description.replace(this.sharedPrefix, ''));
          // reemplaza si ya existe uno del mismo usuario
          sharedArray = sharedArray.filter((e: any) => e.sharedBy.id !== currentUser.id);
        }

        sharedArray.push(snapshot);

        const { id, ...productNoID } = existingProduct;

        const description = `${this.sharedPrefix}${JSON.stringify(sharedArray)}`;

        const productToUpdate: Partial<Product> = {
          ...productNoID,
          description
        };

        console.log("CARRITO COMPARTIDO", productToUpdate);

        return this.productService.updateProduct(existingProduct.id!, productToUpdate);
      }),
      catchError(() => {
        // Si no existe, creamos uno
        const newProduct: Partial<Product> = {
          title: `Carritos compartidos con ${targetUser.fullName}-${targetUser.id}`,
          price: 100,
          stock: 100,
          description: `${this.sharedPrefix}${JSON.stringify([snapshot])}`,
          slug: productSlug,
          sizes: [Size.L],
          gender: Gender.Unisex,
          tags: ['carrito-compartido'],
          images: [],
        };

        console.log('carrito compartido no existe, creando: ', newProduct);

        return this.productService.createProduct(newProduct);
      }),
      map(() => void 0)
    );
  }
}
