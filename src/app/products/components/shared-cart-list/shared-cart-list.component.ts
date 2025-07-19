import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import { CartItem } from '@products/interfaces/cart-item.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'shared-cart-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './shared-cart-list.component.html'
})
export class SharedCartListComponent {
  @Input() sharedCarts: {
    sharedBy: User;
    cart: CartItem[];
    sharedAt: string;
  }[] = [];

  @Output() selectCart = new EventEmitter<CartItem[]>();
}
