import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FrontNavbarComponent } from '../../components/front-navbar/front-navbar.component';

import { AuthService } from '@auth/services/auth.service';
import { CartItemService } from '@products/services/cart-item.service';
import { SharedCartService } from '@products/services/shared-carts.service';

@Component({
  selector: 'app-store-front-layout',
  standalone: true,
  imports: [RouterOutlet, FrontNavbarComponent],
  templateUrl: './store-front-layout.component.html',
})
export class StoreFrontLayoutComponent {
  constructor(
    private authService: AuthService,
    private cartService: CartItemService,
    private sharedCartService: SharedCartService
  ) {
    effect(() => {
      const status = this.authService.authStatus();
      const user = this.authService.user();

      if (status === 'authenticated' && user?.id) {
        this.cartService.initializeUserCart(user.id);
        this.sharedCartService.refreshSharedCarts(user.id);
      }
    });
  }
}

