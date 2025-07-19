import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { CartItemService } from '@products/services/cart-item.service';
import { AuthService } from '@auth/services/auth.service';
import { CartTableComponent } from '@products/components/cart-table/cart-table.component';

@Component({
  selector: 'product-cart-page',
  standalone: true,
  imports: [CartTableComponent],
  templateUrl: './product-cart-page.component.html',
})
export class ProductCartPageComponent {
  private cartService = inject(CartItemService);
  private authService = inject(AuthService);

  readonly user = this.authService.user();
  readonly loading = this.cartService.isLoading$;
  readonly cartItems = toSignal(this.cartService.userCart$, { initialValue: [] });

  // Inicializa el carrito del usuario
  constructor() {
    if (this.user) {
      this.cartService.initializeUserCart(this.user.id);
    }
  }

  handleDeleteSelected(productIds: string[]) {
    this.cartService.removeProductsFromCart(productIds);
  }
}
