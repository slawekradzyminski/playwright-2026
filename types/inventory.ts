export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItemDto {
  productId: number;
  name: string;
  category: string;
  availableQuantity: number;
  stockStatus: StockStatus;
  lastChangedAt: string;
}

export interface InventoryMovementDto {
  id: number;
  productId: number;
  orderId: number | null;
  type: 'INITIAL_STOCK' | 'ADMIN_ADJUSTMENT' | 'ORDER_DEDUCTED' | 'ORDER_RESTORED';
  delta: number;
  quantityAfter: number;
  actor: string;
  reason: string;
  requestId: string | null;
  createdAt: string;
}

export interface PageDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface InventoryAdjustmentDto {
  delta: number;
  reason: string;
  requestId: string;
}
