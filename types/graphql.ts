import type { AddressDto, OrderStatus } from './order';

// GraphQL wire contract: IDs are strings and money is an exact decimal string.
// Do not reuse the numeric REST DTOs for these responses.

export interface GraphQlRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export type GraphQlErrorCode = 'BAD_REQUEST' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT';

export interface GraphQlError {
  message: string;
  path?: (string | number)[];
  locations?: { line: number; column: number }[];
  extensions?: { code?: GraphQlErrorCode; classification?: string };
}

export interface GraphQlResponse<T = Record<string, unknown>> {
  data?: T | null;
  errors?: GraphQlError[];
}

export interface GqlProduct {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stockQuantity: number;
  category: string | null;
  imageUrl: string | null;
}

export interface GqlProductPage {
  items: GqlProduct[];
  total: number;
  offset: number;
  limit: number;
}

export interface GqlPage<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface GqlCartItem {
  product: GqlProduct;
  quantity: number;
  unitPrice: string;
}

export interface GqlCart {
  username: string;
  items: GqlCartItem[];
  totalPrice: string;
  totalItems: number;
}

export interface GqlOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface GqlOrder {
  id: string;
  username: string;
  items: GqlOrderItem[];
  totalAmount: string;
  status: OrderStatus;
  shippingAddress: AddressDto;
  createdAt: string;
  updatedAt: string;
}

export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';
export type InventoryMovementType = 'INITIAL_STOCK' | 'ADMIN_ADJUSTMENT' | 'ORDER_DEDUCTED' | 'ORDER_RESTORED';

export interface GqlInventoryItem {
  productId: string;
  name: string;
  category: string | null;
  availableQuantity: number;
  stockStatus: StockStatus;
  lastChangedAt: string;
}

export interface GqlInventoryMovement {
  id: string;
  productId: string;
  orderId: string | null;
  type: InventoryMovementType;
  delta: number;
  quantityAfter: number;
  actor: string;
  reason: string;
  requestId: string | null;
  createdAt: string;
}

export interface GqlProductInput {
  name: string;
  description: string;
  price: string;
  stockQuantity: number;
  category: string;
  imageUrl?: string | null;
}

export type GqlProductUpdateInput = {
  [Field in keyof GqlProductInput]?: GqlProductInput[Field] | null;
};

export interface GqlInventoryAdjustmentInput {
  delta: number;
  reason: string;
  requestId: string;
}
