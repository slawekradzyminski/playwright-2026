import { CART_FIELDS, INVENTORY_ITEM_FIELDS, MOVEMENT_FIELDS, ORDER_FIELDS, PRODUCT_FIELDS } from './selections';

export const PRODUCTS = `query Products($offset: Int!, $limit: Int!, $category: String, $inStockOnly: Boolean) {
  products(offset: $offset, limit: $limit, category: $category, inStockOnly: $inStockOnly) {
    total offset limit items { ${PRODUCT_FIELDS} }
  }
}`;
export const PRODUCT = `query Product($id: ID!) { product(id: $id) { ${PRODUCT_FIELDS} } }`;

export const CART = `query Cart($username: String) { cart(username: $username) { ${CART_FIELDS} } }`;
export const CARTS = `query Carts($page: Int!, $size: Int!) {
  carts(page: $page, size: $size) { total page size items { ${CART_FIELDS} } }
}`;

export const ORDERS = `query Orders($username: String, $status: OrderStatus, $page: Int!, $size: Int!) {
  orders(username: $username, status: $status, page: $page, size: $size) { total page size items { ${ORDER_FIELDS} } }
}`;
export const ORDER = `query Order($id: ID!) { order(id: $id) { ${ORDER_FIELDS} } }`;

export const INVENTORY = `query Inventory($page: Int!, $size: Int!, $search: String, $category: String,
  $status: StockStatus, $lowStockThreshold: Int!) {
  inventory(page: $page, size: $size, search: $search, category: $category, status: $status,
    lowStockThreshold: $lowStockThreshold) { total page size items { ${INVENTORY_ITEM_FIELDS} } }
}`;
export const INVENTORY_ITEM = `query InventoryItem($productId: ID!, $lowStockThreshold: Int!) {
  inventoryItem(productId: $productId, lowStockThreshold: $lowStockThreshold) { ${INVENTORY_ITEM_FIELDS} }
}`;
export const INVENTORY_MOVEMENTS = `query InventoryMovements($productId: ID!, $page: Int!, $size: Int!) {
  inventoryMovements(productId: $productId, page: $page, size: $size) { total page size items { ${MOVEMENT_FIELDS} } }
}`;

// Introspect one root type per request; the server rejects repeated __type lookups as bad faith.
export const ROOT_FIELDS = 'query RootFields($type: String!) { __type(name: $type) { fields { name } } }';
