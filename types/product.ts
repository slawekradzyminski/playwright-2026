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

// PUT ignores omitted/null fields; empty description and imageUrl are valid updates.
export type ProductUpdateDto = {
  [Field in keyof ProductCreateDto]?: ProductCreateDto[Field] | null;
};
