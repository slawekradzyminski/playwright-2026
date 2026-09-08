export type CartDto = {
  username: string;
  items: { productId: number; quantity: number }[];
  totalPrice: number;
  totalItems: number;
};
