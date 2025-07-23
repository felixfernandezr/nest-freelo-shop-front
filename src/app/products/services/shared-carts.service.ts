import { computed, Injectable } from '@angular/core';
import { CartItem } from '@products/interfaces/cart-item.interface';
import { SharedCartsBackendAdapterService } from './shared-carts-backend-adapter.service';
import { User } from '@auth/interfaces/user.interface';
import { CartItemService } from './cart-item.service';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

type SharedCart = {
  sharedBy: User;
  cart: CartItem[];
  sharedAt: string;
};

@Injectable({ providedIn: 'root' })
export class SharedCartService {
  private lastFetchedUserId: string | null = null;
  private sharedCartsSubject = new BehaviorSubject<SharedCart[]>([]);
  readonly sharedCartCount$: Observable<number> = this.sharedCartsSubject.pipe(
      map((carts) => carts.length)
    );

  constructor(
    private sharedBackend: SharedCartsBackendAdapterService,
    private cartService: CartItemService
  ) {}

  shareCartWithUser(senderUserId: string, targetUser: User): Observable<void> {
    const cartToShare = this.cartService.getCart(senderUserId);
    return this.sharedBackend.addSharedCart(targetUser, cartToShare);
  }

  getSharedCarts(userId: string): Observable<SharedCart[]> {
    this.sharedBackend.loadSharedCarts(userId).subscribe({
      next: (carts) => this.sharedCartsSubject.next(carts),
      error: () => this.sharedCartsSubject.next([]),
    });
    this.lastFetchedUserId = userId;

    return this.sharedCartsSubject.asObservable();
  }


  refreshSharedCarts(userId: string): Observable<SharedCart[]> {
    const obs = this.sharedBackend.loadSharedCarts(userId).pipe(
      catchError(() => of([])),
      tap((carts) => this.sharedCartsSubject.next(carts))
    );
    obs.subscribe(); // mantiene comportamiento anterior
    this.lastFetchedUserId = userId;
    return obs;
  }

  clearCache() {
    this.lastFetchedUserId = null;
    this.sharedCartsSubject.next([]); // limpia la lista actual
  }
}


