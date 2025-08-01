import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Output, input, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '@products/interfaces/cart-item.interface';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';
import { CartItemService } from '@products/services/cart-item.service';

@Component({
  selector: 'shared-cart-table',
  imports: [ProductImagePipe, RouterLink, CurrencyPipe],
  templateUrl: './shared-cart-table.component.html',
})
export class SharedCartTableComponent {
  cartService = inject(CartItemService)

  products = input.required<CartItem[]>();

  // Estado de selección
  private selectedIds = signal<Set<string>>(new Set());
  hasSelection = computed(() => this.selectedIds().size > 0);

  // Selección general
  readonly allSelected = computed(() =>
    this.products().length > 0 &&
    this.products().every(p => this.selectedIds().has(p.product.id))
  );

  toggleSelect(productId: string) {
    const current = new Set(this.selectedIds());
    if (current.has(productId)) {
      current.delete(productId);
    } else {
      current.add(productId);
    }
    this.selectedIds.set(current);
  }

  toggleSelectAll() {
    const current = new Set(this.selectedIds());
    if (this.allSelected()) {
      current.clear();
    } else {
      this.products().forEach(p => current.add(p.product.id));
    }
    this.selectedIds.set(current);
  }

  isSelected(productId: string) {
    return this.selectedIds().has(productId);
  }

  changeQuantity(productId:string, change: number) {
    const product = this.products().find(p => p.product.id === productId);

    product!.quantity -= change;
  }

}


