import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { CartItemService } from '@products/services/cart-item.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'front-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './front-navbar.component.html',
})
export class FrontNavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  cartService = inject(CartItemService);

  count: number = 0;
  private subscription!: Subscription;

  ngOnInit(): void {
    this.subscription = this.cartService.cartItemCount$.subscribe(c => {
      this.count = c;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
