export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type AddressDto = { street: string; city: string; state: string; zipCode: string; country: string };
export type OrderDto = {
  id: number;
  username: string;
  items: { id: number; productId: number; productName: string; quantity: number; unitPrice: number; totalPrice: number }[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: AddressDto;
  createdAt: string;
  updatedAt: string;
};
export type OrderPage = { content: OrderDto[]; pageNumber: number; pageSize: number; totalElements: number; totalPages: number };
