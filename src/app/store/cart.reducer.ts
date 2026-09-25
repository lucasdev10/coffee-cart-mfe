import { createReducer, on } from '@ngrx/store';
import { CartActions } from './cart.actions';
import { CartState, initialCartState } from './cart.state';

/**
 * Calculate cart totals based on items
 * Assumes: $50 minimum for free shipping, otherwise $10 shipping
 * Tax: 10% of subtotal
 */
function calculateTotals(items: any[]) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = items.length === 0 ? 0 : (subtotal >= 50 ? 0 : 10);
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return { subtotal, shipping, tax, total, itemCount };
}

export const cartReducer = createReducer(
  initialCartState,

  // Load from Storage
  on(CartActions.loadCartFromStorage, (state, { cart }) => ({
    ...state,
    ...cart,
    loading: false,
  })),

  // Add Item
  on(CartActions.addItem, (state, { product, quantity }) => {
    const existingItem = state.items.find((i) => i.product.id === product.id);

    let updatedItems;
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      updatedItems = state.items.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * product.price,
            }
          : item
      );
    } else {
      updatedItems = [
        ...state.items,
        {
          product,
          quantity,
          subtotal: product.price * quantity,
        },
      ];
    }

    const totals = calculateTotals(updatedItems);
    return { ...state, items: updatedItems, ...totals, error: null };
  }),

  // Remove Item
  on(CartActions.removeItem, (state, { productId }) => {
    const updatedItems = state.items.filter((item) => item.product.id !== productId);
    const totals = calculateTotals(updatedItems);
    return { ...state, items: updatedItems, ...totals, error: null };
  }),

  // Update Quantity
  on(CartActions.updateQuantity, (state, { productId, quantity }) => {
    if (quantity <= 0) {
      // Remove the item
      const updatedItems = state.items.filter((item) => item.product.id !== productId);
      const totals = calculateTotals(updatedItems);
      return { ...state, items: updatedItems, ...totals, error: null };
    }

    const updatedItems = state.items.map((item) =>
      item.product.id === productId
        ? {
            ...item,
            quantity,
            subtotal: item.product.price * quantity,
          }
        : item
    );

    const totals = calculateTotals(updatedItems);
    return { ...state, items: updatedItems, ...totals, error: null };
  }),

  // Clear Cart
  on(CartActions.clearCart, (state) => ({
    ...state,
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
    error: null,
  })),

  // Update Cart
  on(CartActions.updateCart, (state, { cart }) => ({
    ...state,
    ...cart,
    loading: false,
    error: null,
  })),

  // Operation Success
  on(CartActions.cartOperationSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),

  // Operation Error
  on(CartActions.cartOperationError, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
