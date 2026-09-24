import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.state';

/**
 * Select the Cart State from the store
 */
export const selectCartState = createFeatureSelector<CartState>('cart');

/**
 * Select all cart items
 */
export const selectCartItems = createSelector(
  selectCartState,
  (state: CartState) => state.items
);

/**
 * Select cart total
 */
export const selectCartTotal = createSelector(
  selectCartState,
  (state: CartState) => state.total
);

/**
 * Select cart item count
 */
export const selectCartCount = createSelector(
  selectCartState,
  (state: CartState) => state.count
);

/**
 * Select cart loading state
 */
export const selectCartLoading = createSelector(
  selectCartState,
  (state: CartState) => state.loading
);

/**
 * Select cart error
 */
export const selectCartError = createSelector(
  selectCartState,
  (state: CartState) => state.error
);

/**
 * Select if cart is empty
 */
export const selectIsCartEmpty = createSelector(
  selectCartItems,
  (items) => items.length === 0
);

/**
 * Select cart item by product ID
 */
export const selectCartItemByProductId = (productId: string) =>
  createSelector(
    selectCartItems,
    (items) => items.find((item) => item.productId === productId)
  );
