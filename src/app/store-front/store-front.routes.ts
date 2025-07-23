import { Routes } from '@angular/router';
import { StoreFrontLayoutComponent } from './layouts/store-front-layout/store-front-layout.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProductPageComponent } from './pages/product-page/product-page.component';
import { NotFoundComponent } from '@shared/components/not-found/not-found.component';
import { ProductCartPageComponent } from './pages/product-cart-page/product-cart-page.component';
import { SharedCartsPageComponent } from './pages/shared-carts-page/shared-carts-page.component';

export const storeFrontRoutes: Routes = [
  {
    path: '',
    component: StoreFrontLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
      },

      {
        path: 'product/:idSlug',
        component: ProductPageComponent,
      },
      {
        path: 'cart',
        component: ProductCartPageComponent,
      },
      {
        path: 'shared',
        component: SharedCartsPageComponent,
      },

      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];

export default storeFrontRoutes;
