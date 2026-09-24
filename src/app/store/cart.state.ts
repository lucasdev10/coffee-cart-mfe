/**
 * Cart Item Interface
 */
export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

/**
 * Cart State Interface
 */
export interface CartState {
  items: CartItem[];
  total: number;
  count: number;
  loading: boolean;
  error: string | null;
}

/**
 * Initial Cart State
 */
export const initialCartState: CartState = {
  items: [],
  total: 0,
  count: 0,
  loading: false,
  error: null,
};
