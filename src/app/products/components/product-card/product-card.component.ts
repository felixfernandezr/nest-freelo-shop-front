import { Component, computed, inject, input } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@products/interfaces/product.interface';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';
import { AuthService } from '@auth/services/auth.service';
import { CartItemService } from '@products/services/cart-item.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  product = input.required<Product>();

  productService = inject(ProductsService);
  authService = inject(AuthService);
  cartService = inject(CartItemService);

  imageUrl = computed(() => {
    return `http://localhost:3000/api/files/product/${
      this.product().images[0]
    }`;
  });
}
