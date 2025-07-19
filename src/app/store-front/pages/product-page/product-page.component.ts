import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '@products/services/products.service';
import { ProductCarouselComponent } from '../../../products/components/product-carousel/product-carousel.component';
import { NotFoundComponent } from '@shared/components/not-found/not-found.component';

@Component({
  selector: 'app-product-page',
  imports: [ProductCarouselComponent, NotFoundComponent],
  templateUrl: './product-page.component.html',
})
export class ProductPageComponent {
  activatedRoute = inject(ActivatedRoute);
  productService = inject(ProductsService);

  productIdSlug = this.activatedRoute.snapshot.params['idSlug'];

  productResource = rxResource({
    request: () => ({ idSlug: this.productIdSlug }),
    loader: ({ request }) =>
      this.productService.getProductByIdSlug(request.idSlug),
  });

}


