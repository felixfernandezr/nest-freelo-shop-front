import { Product } from "./product.interface";

export interface CartItem {
  userId: string;
  product: Product;
  quantity: number;
}
