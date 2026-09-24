import { createAction, props } from '@ngrx/store';
import { CartItem } from './cart.state';

// Add Item Action
export const addItemToCart = createAction(
  '[Cart] Add Item',
  props<{ item: CartItem }>()
);

// Remove Item Action
export const removeItemFromCart = createAction(
  '[Cart] Remove Item',
  props<{ productId: string }>()
);

// Update Quantity Action
export const updateCartItemQuantity = createAction(
  '[Cart] Update Item Quantity',
  props<{ productId: string; quantity: number }>()
);

// Clear Cart Action
export const clearCart = createAction(
  '[Cart] Clear Cart'
);

// Load Cart from Storage Action
export const loadCartFromStorage = createAction(
  '[Cart] Load from Storage'
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
