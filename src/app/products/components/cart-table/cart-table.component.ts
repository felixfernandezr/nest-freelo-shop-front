import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Output, input, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '@products/interfaces/cart-item.interface';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';
import { CartItemService } from '@products/services/cart-item.service';
import { Router } from '@angular/router';

@Component({
  selector: 'cart-table',
  standalone: true,
  imports: [ProductImagePipe, RouterLink, CurrencyPipe],
  templateUrl: './cart-table.component.html',
})
export class CartTableComponent {
  cartService = inject(CartItemService)
  private router = inject(Router);

  products = input.required<CartItem[]>();


  // Estado de selección
  private selectedIds = signal<Set<string>>(new Set());
  hasSelection = computed(() => this.selectedIds().size > 0);

  @Output() deleteSelected = new EventEmitter<string[]>(); // emite los IDs de los productos a eliminar

  // Selección general
  readonly allSelected = computed(() =>
    this.products().length > 0 &&
    this.products().every(p => this.selectedIds().has(p.product.id))
  );

  readonly totalAmount = computed(() =>
    this.products()?.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0) ?? 0
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

  deleteSelectedItems() {
      this.deleteSelected.emit([...this.selectedIds()]);
      this.selectedIds.set(new Set()); // limpiamos selección
  }

  changeQuantity(productId: string, change: number) {
    const product = this.products().find(p => p.product.id === productId);

    if (product) {
      this.cartService.changeCartQuant(product.userId, product.product, change);
    }
  }

  buyNow() {
    this.toggleSelectAll();
    this.deleteSelectedItems();
    this.router.navigate(['/buy']);
  }
}
