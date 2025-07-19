export interface CreateProductDto {
  title: string;
  price?: number;
  description?: string;
  slug?: string;
  stock?: number;
  sizes: string[];
  gender: 'men' | 'women' | 'kid' | 'unisex';
  tags?: string[];
  images?: string[];
}
