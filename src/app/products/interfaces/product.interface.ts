import { User } from '@auth/interfaces/user.interface';

export interface ProductsResponse {
  count: number;
  pages: number;
  products: Product[];
}

export interface Product {
  title: string;
  price: number;
  stock: number;
  description: string;
  slug: string;
  sizes: Size[];
  gender: Gender;
  tags: string[];
  images: string[];
  user: User;
  id: string;
}

export enum Gender {
  Kid = 'kid',
  Men = 'men',
  Unisex = 'unisex',
  Women = 'women',
}

export enum Size {
  L = 'L',
  M = 'M',
  S = 'S',
  XS = 'XS',
  Xl = 'XL',
  Xs = 'XS',
  Xxl = 'XXL',
}
