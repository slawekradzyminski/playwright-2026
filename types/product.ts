export interface ProductCreateDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string | null;
}

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
