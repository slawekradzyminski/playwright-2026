// Field selections shared by queries and mutations; they follow the wire types in types/graphql.ts.

export const PRODUCT_FIELDS = 'id name description price stockQuantity category imageUrl';
export const CART_FIELDS = `username totalItems totalPrice items { quantity unitPrice product { ${PRODUCT_FIELDS} } }`;
export const ORDER_FIELDS = `id username totalAmount status createdAt updatedAt
  shippingAddress { street city state zipCode country }
  items { id productId productName quantity unitPrice totalPrice }`;
export const INVENTORY_ITEM_FIELDS = 'productId name category availableQuantity stockStatus lastChangedAt';
export const MOVEMENT_FIELDS = 'id productId orderId type delta quantityAfter actor reason requestId createdAt';
