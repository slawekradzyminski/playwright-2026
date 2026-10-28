import { CART_FIELDS, MOVEMENT_FIELDS, ORDER_FIELDS, PRODUCT_FIELDS } from './selections';

export const CREATE_PRODUCT = `mutation CreateProduct($input: ProductCreateInput!) {
  createProduct(input: $input) { ${PRODUCT_FIELDS} }
}`;
export const UPDATE_PRODUCT = `mutation UpdateProduct($id: ID!, $input: ProductUpdateInput!) {
  updateProduct(id: $id, input: $input) { ${PRODUCT_FIELDS} }
}`;
export const DELETE_PRODUCT = 'mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) }';

export const ADD_CART_ITEM = `mutation AddCartItem($productId: ID!, $quantity: Int!, $username: String) {
  addCartItem(productId: $productId, quantity: $quantity, username: $username) { ${CART_FIELDS} }
}`;
export const UPDATE_CART_ITEM = `mutation UpdateCartItem($productId: ID!, $quantity: Int!, $username: String) {
  updateCartItem(productId: $productId, quantity: $quantity, username: $username) { ${CART_FIELDS} }
}`;
export const REMOVE_CART_ITEM = `mutation RemoveCartItem($productId: ID!, $username: String) {
  removeCartItem(productId: $productId, username: $username) { ${CART_FIELDS} }
}`;
export const CLEAR_CART = `mutation ClearCart($username: String) { clearCart(username: $username) { ${CART_FIELDS} } }`;

export const CHECKOUT = `mutation Checkout($address: AddressInput!) { checkout(address: $address) { ${ORDER_FIELDS} } }`;
export const CANCEL_ORDER = `mutation CancelOrder($id: ID!) { cancelOrder(id: $id) { ${ORDER_FIELDS} } }`;
export const UPDATE_ORDER_STATUS = `mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
  updateOrderStatus(id: $id, status: $status) { ${ORDER_FIELDS} }
}`;

export const ADJUST_INVENTORY = `mutation AdjustInventory($productId: ID!, $input: InventoryAdjustmentInput!) {
  adjustInventory(productId: $productId, input: $input) { ${MOVEMENT_FIELDS} }
}`;
