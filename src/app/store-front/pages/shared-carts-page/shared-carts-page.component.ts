import { Component, computed, effect, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { CartItem } from '@products/interfaces/cart-item.interface';
import { User } from '@auth/interfaces/user.interface';
import { CartItemService } from '@products/services/cart-item.service';
import { SharedCartListComponent } from '@products/components/shared-cart-list/shared-cart-list.component';
import { UserSearchComponent } from '@store-front/components/user-search/user-search.component';
import { SharedCartService } from '@products/services/shared-carts.service';
import { SharedCartTableComponent } from "@products/components/shared-cart-table/shared-cart-table.component";

import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'shared-carts-page',
  standalone: true,
  imports: [
    SharedCartListComponent,
    UserSearchComponent,
    SharedCartTableComponent
  ],
  templateUrl: './shared-carts-page.component.html',
})
export class SharedCartsPageComponent implements OnInit {
  private authService = inject(AuthService);
  private sharedCartService = inject(SharedCartService);
  private cartService = inject(CartItemService);
  private router = inject(Router);

  readonly selectedCart = signal<CartItem[] | null>(null);
  readonly loading = this.cartService.isLoading$;

  readonly sharedCarts = signal<{
    sharedBy: User;
    cart: CartItem[];
    sharedAt: string;
  }[]>([]);

  readonly currentUser = computed(() => this.authService.user());
  wasSaved = signal(false);

  private routerSubscription!: Subscription;

  constructor() {
    // Cargar carritos compartidos cuando hay usuario
    effect(() => {
      const user = this.currentUser();
      if (!user) {
        this.sharedCarts.set([]);
        return;
      }

      this.sharedCartService.refreshSharedCarts(user.id).subscribe({
        next: (carts) => this.sharedCarts.set(carts),
        error: () => this.sharedCarts.set([]),
      });
    });
  }

  ngOnInit(): void {
    const user = this.authService.user();
    if (user?.id) {
      this.refreshCarts(user.id);
    }

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (this.router.url === '/shared') {
          this.selectedCart.set(null);

          const user = this.authService.user();
          if (user?.id) {
            this.refreshCarts(user.id);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  shareCartWith(user: Partial<User>) {
    const currentUser = this.currentUser();
    if (!currentUser?.id || !user.id) return;

    this.sharedCartService.shareCartWithUser(currentUser.id, user as User).subscribe({
      next: () => {
        this.wasSaved.set(true);

        // 🔁 Recargar carritos compartidos para reflejar cambios en UI
        this.sharedCartService.refreshSharedCarts(currentUser.id).subscribe({
          next: (carts) => this.sharedCarts.set(carts),
          error: () => this.sharedCarts.set([]),
        });

        setTimeout(() => {
          this.wasSaved.set(false);
        }, 3000);
      },
      error: (err) => console.error('Error al compartir carrito', err),
    });
  }

  private refreshCarts(userId: string) {
    this.sharedCartService.refreshSharedCarts(userId).subscribe({
      next: (carts) => this.sharedCarts.set(carts),
      error: () => this.sharedCarts.set([]),
    });
  }
}
