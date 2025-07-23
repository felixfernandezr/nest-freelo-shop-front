import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { CartItemService } from '@products/services/cart-item.service';
import { SharedCartService } from '@products/services/shared-carts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'front-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './front-navbar.component.html',
})
export class FrontNavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  cartService = inject(CartItemService);
  sharedCartService = inject(SharedCartService);
  sharedCartCount = 0;

  count: number = 0;
  private subscription!: Subscription;

  isMobileMenuOpen = false;
  isUserDropdownOpen = false;

  displayName = this.authService.user()?.fullName.split(' ').slice(0, 2).join(' ');

  ngOnInit(): void {
    this.subscription = this.cartService.cartItemCount$.subscribe(count => {
      this.count = count;
    });

    this.sharedCartService.sharedCartCount$.subscribe(count => {
      this.sharedCartCount = count;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeMenus() {
    this.isMobileMenuOpen = false;
    this.isUserDropdownOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeMenus();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Si el click NO es dentro de alguno de los dropdowns o sus botones, cerrar menús
    if (!target.closest('.dropdown') && !target.closest('.btn-ghost')) {
      this.closeMenus();
    }
  }
}
