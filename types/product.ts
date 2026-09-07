export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductCreateDto = Pick<ProductDto, 'name' | 'description' | 'price' | 'stockQuantity' | 'category'> & { imageUrl?: string };
export type ProductUpdateDto = Partial<ProductCreateDto>;
