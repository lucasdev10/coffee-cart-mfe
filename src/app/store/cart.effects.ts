import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { Optional } from '@angular/core';

import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  cartOperationSuccess,
} from './cart.actions';

// EventBusService interface - allows graceful fallback if service not available
interface IEventBusService {
  emit<T extends Record<string, unknown> | null | undefined>(
    eventType: string,
    detail: T,
    source: string
  ): void;
}

/**
 * Cart Effects
 * Handles side effects for cart operations and emits custom events for inter-MFE communication
 */
@Injectable()
export class CartEffects {
  /**
   * Effect to handle item addition
   * Emits "cart:item-added" custom event with product and quantity
   */
  addItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addItem),
      map((action) => {
        // Emit custom event for inter-MFE communication using EventBusService
        this.emitCustomEvent('cart:item-added', {
          product: action.product,
          quantity: action.quantity,
        });
        return cartOperationSuccess({ message: 'Item added to cart' });
      })
    )
  );

  /**
   * Effect to handle item removal
   * Emits "cart:item-removed" custom event with productId
   */
  removeItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeItem),
      map((action) => {
        // Emit custom event for inter-MFE communication using EventBusService
        this.emitCustomEvent('cart:item-removed', {
          productId: action.productId,
        });
        return cartOperationSuccess({ message: 'Item removed from cart' });
      })
    )
  );

  /**
   * Effect to handle quantity update
   * Emits "cart:item-quantity-updated" custom event
   */
  updateQuantity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateQuantity),
      map((action) => {
        // Emit custom event for inter-MFE communication using EventBusService
        this.emitCustomEvent('cart:item-quantity-updated', {
          productId: action.productId,
          quantity: action.quantity,
        });
        return cartOperationSuccess({ message: 'Item quantity updated' });
      })
    )
  );

  /**
   * Effect to handle cart clear
   * Emits "cart:cleared" custom event
   */
  clearCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(clearCart),
      map(() => {
        // Emit custom event for inter-MFE communication using EventBusService
        this.emitCustomEvent('cart:cleared', {});
        return cartOperationSuccess({ message: 'Cart cleared' });
      })
    )
  );

  /**
   * Emits custom events using EventBusService if available, falls back to window.dispatchEvent
   * @param eventType - The event type identifier
   * @param detail - The event payload
   */
  private emitCustomEvent<T extends Record<string, unknown> | null>(
    eventType: string,
    detail: T
  ): void {
    if (this.eventBus) {
      // Use EventBusService for structured event emission
      this.eventBus.emit(eventType, detail, 'cart-mfe');
    } else {
      // Fallback to window.dispatchEvent if EventBusService is not available
      window.dispatchEvent(
        new CustomEvent(eventType, {
          detail: {
            type: eventType,
            detail,
            timestamp: Date.now(),
            source: 'cart-mfe',
          },
          bubbles: true,
          cancelable: true,
        })
      );
    }
  }

  constructor(
    private actions$: Actions,
    @Optional() private eventBus?: IEventBusService
  ) {}
}
