import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
  cartOperationSuccess,
} from './cart.actions';

/**
 * Cart Effects
 * Handles side effects for cart operations
 */
@Injectable()
export class CartEffects {
  // Effect to handle item addition
  addItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addItemToCart),
      map((action) => {
        // Emit custom event for inter-MFE communication
        window.dispatchEvent(
          new CustomEvent('cart:item-added', {
            detail: {
              productId: action.item.productId,
              quantity: action.item.quantity,
              productName: action.item.productName,
            },
          })
        );
        return cartOperationSuccess({ message: 'Item added to cart' });
      })
    )
  );

  // Effect to handle item removal
  removeItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeItemFromCart),
      map((action) => {
        // Emit custom event for inter-MFE communication
        window.dispatchEvent(
          new CustomEvent('cart:item-removed', {
            detail: { productId: action.productId },
          })
        );
        return cartOperationSuccess({ message: 'Item removed from cart' });
      })
    )
  );

  // Effect to handle quantity update
  updateQuantity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCartItemQuantity),
      map((action) => {
        // Emit custom event for inter-MFE communication
        window.dispatchEvent(
          new CustomEvent('cart:item-quantity-updated', {
            detail: {
              productId: action.productId,
              quantity: action.quantity,
            },
          })
        );
        return cartOperationSuccess({ message: 'Item quantity updated' });
      })
    )
  );

  // Effect to handle cart clear
  clearCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(clearCart),
      map(() => {
        // Emit custom event for inter-MFE communication
        window.dispatchEvent(new CustomEvent('cart:cleared', { detail: {} }));
        return cartOperationSuccess({ message: 'Cart cleared' });
      })
    )
  );

  constructor(private actions$: Actions) {}
}
