import { Component, computed, effect, inject, signal } from '@angular/core';
import { CartTableComponent } from '@products/components/cart-table/cart-table.component';
import { AuthService } from '@auth/services/auth.service';
import { CartItem } from '@products/interfaces/cart-item.interface';
import { User } from '@auth/interfaces/user.interface';
import { CartItemService } from '@products/services/cart-item.service';
import { SharedCartListComponent } from '@products/components/shared-cart-list/shared-cart-list.component';
import { UserSearchComponent } from '@store-front/components/user-search/user-search.component';
import { SharedCartService } from '@products/services/shared-carts.service';


@Component({
  selector: 'shared-carts-page',
  standalone: true,
  imports: [
    CartTableComponent,
    SharedCartListComponent,
    UserSearchComponent,
  ],
  templateUrl: './shared-carts-page.component.html',
})
export class SharedCartsPageComponent {
  private authService = inject(AuthService);
  private sharedCartService = inject(SharedCartService);
  private cartService = inject(CartItemService);

  readonly selectedCart = signal<CartItem[] | null>(null);
  readonly loading = this.cartService.isLoading$;

  readonly sharedCarts = signal<{
    sharedBy: User;
    cart: CartItem[];
    sharedAt: string;
  }[]>([]);

  readonly currentUser = computed(() => this.authService.user());
  wasSaved = signal(false);

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (!user) {
        this.sharedCarts.set([]);
        return;
      }

      this.sharedCartService.refreshSharedCarts(user.id);
      this.sharedCartService.getSharedCarts(user.id).subscribe({
        next: (carts) => this.sharedCarts.set(carts),
        error: () => this.sharedCarts.set([]),
      });
    });
  }

  shareCartWith(user: Partial<User>) {
    const currentUser = this.currentUser();
    if (!currentUser?.id || !user.id) return;

    this.sharedCartService.shareCartWithUser(currentUser.id, user as User).subscribe({
      next: () => {
        this.wasSaved.set(true);
        setTimeout(() => {
          this.wasSaved.set(false);
        }, 3000);
      },
      error: (err) => console.error('Error al compartir carrito', err),
    });
  }


}
