/**
 * Product interface (minimal version for cart item)
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  stock: number;
}

/**
 * Cart Item Interface
 */
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number; // price * quantity
}

/**
 * Cart State Interface
 */
export interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

/**
 * Initial Cart State
 */
export const initialCartState: CartState = {
  items: [],
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,
};
