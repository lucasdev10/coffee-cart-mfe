import { createReducer, on } from '@ngrx/store';
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
  cartOperationSuccess,
  cartOperationError,
  loadCartFromStorage,
} from './cart.actions';
import { CartState, initialCartState } from './cart.state';

/**
 * Calculate cart total and count
 */
function calculateCartTotals(items: any[]): { total: number; count: number } {
  return {
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    count: items.reduce((count, item) => count + item.quantity, 0),
  };
}

export const cartReducer = createReducer(
  initialCartState,

  // Add Item
  on(addItemToCart, (state, { item }) => {
    const existingItem = state.items.find((i) => i.productId === item.productId);

    if (existingItem) {
      const updatedItems = state.items.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
      const { total, count } = calculateCartTotals(updatedItems);
      return { ...state, items: updatedItems, total, count, error: null };
    } else {
      const updatedItems = [...state.items, item];
      const { total, count } = calculateCartTotals(updatedItems);
      return { ...state, items: updatedItems, total, count, error: null };
    }
  }),

  // Remove Item
  on(removeItemFromCart, (state, { productId }) => {
    const updatedItems = state.items.filter((item) => item.productId !== productId);
    const { total, count } = calculateCartTotals(updatedItems);
    return { ...state, items: updatedItems, total, count, error: null };
  }),

  // Update Quantity
  on(updateCartItemQuantity, (state, { productId, quantity }) => {
    if (quantity <= 0) {
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== productId),
        ...calculateCartTotals(state.items.filter((item) => item.productId !== productId)),
        error: null,
      };
    }

    const updatedItems = state.items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    const { total, count } = calculateCartTotals(updatedItems);
    return { ...state, items: updatedItems, total, count, error: null };
  }),

  // Clear Cart
  on(clearCart, (state) => ({
    ...state,
    items: [],
    total: 0,
    count: 0,
    error: null,
  })),

  // Load from Storage
  on(loadCartFromStorage, (state) => ({
    ...state,
    loading: true,
  })),

  // Operation Success
  on(cartOperationSuccess, (state, { message }) => ({
    ...state,
    loading: false,
    error: null,
  })),

  // Operation Error
  on(cartOperationError, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
