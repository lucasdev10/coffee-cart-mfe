import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.state';

/**
 * Select the Cart State from the store
 */
export const selectCartState = createFeatureSelector<CartState>('cart');

/**
 * Select all cart items
 */
export const selectItems = createSelector(
  selectCartState,
  (state: CartState) => state.items
);

/**
 * Select cart subtotal
 */
export const selectSubtotal = createSelector(
  selectCartState,
  (state: CartState) => state.subtotal
);

/**
 * Select cart shipping
 */
export const selectShipping = createSelector(
  selectCartState,
  (state: CartState) => state.shipping
);

/**
 * Select cart tax
 */
export const selectTax = createSelector(
  selectCartState,
  (state: CartState) => state.tax
);

/**
 * Select cart total
 */
export const selectTotal = createSelector(
  selectCartState,
  (state: CartState) => state.total
);

/**
 * Select cart item count
 */
export const selectItemCount = createSelector(
  selectCartState,
  (state: CartState) => state.itemCount
);

/**
 * Select cart loading state
 */
export const selectLoading = createSelector(
  selectCartState,
  (state: CartState) => state.loading
);

/**
 * Select cart error
 */
export const selectError = createSelector(
  selectCartState,
  (state: CartState) => state.error
);

/**
 * Select if cart is empty
 */
export const selectIsEmpty = createSelector(
  selectItems,
  (items) => items.length === 0
);

/**
 * Select if cart has free shipping
 */
export const selectHasFreeShipping = createSelector(
  selectShipping,
  (shipping) => shipping === 0
);

/**
 * Select cart item by product ID
 */
export const selectItemByProductId = (productId: string) =>
  createSelector(
    selectItems,
    (items) => items.find((item) => item.product.id === productId)
  );

/**
 * Select the full state for debugging/testing
 */
export const selectState = selectCartState;
