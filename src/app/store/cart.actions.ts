import { createAction, props } from '@ngrx/store';
import { CartItem, CartState } from './cart.state';
import { Product } from './cart.state';

// Add Item Action
export const addItem = createAction(
  '[Cart] Add Item',
  props<{ product: Product; quantity: number }>()
);

// Remove Item Action
export const removeItem = createAction(
  '[Cart] Remove Item',
  props<{ productId: string }>()
);

// Update Quantity Action
export const updateQuantity = createAction(
  '[Cart] Update Quantity',
  props<{ productId: string; quantity: number }>()
);

// Clear Cart Action
export const clearCart = createAction(
  '[Cart] Clear Cart'
);

// Load Cart from Storage Action
export const loadCartFromStorage = createAction(
  '[Cart] Load from Storage',
  props<{ cart: CartState }>()
);

// Update Cart
export const updateCart = createAction(
  '[Cart] Update Cart',
  props<{ cart: Partial<CartState> }>()
);

// Cart Operation Success Action
export const cartOperationSuccess = createAction(
  '[Cart] Operation Success',
  props<{ message: string }>()
);

// Cart Operation Error Action
export const cartOperationError = createAction(
  '[Cart] Operation Error',
  props<{ error: string }>()
);

export const CartActions = {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  loadCartFromStorage,
  updateCart,
  cartOperationSuccess,
  cartOperationError,
};
