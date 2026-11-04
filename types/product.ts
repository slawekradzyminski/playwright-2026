export interface ProductCreateDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string | null;
}

export interface ProductDto extends ProductCreateDto {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDto {
  productId: number;
  quantity: number;
}

export interface CartDto {
  username: string;
  items: CartItemDto[];
  totalPrice: number;
  totalItems: number;
}
