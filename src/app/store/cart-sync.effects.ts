import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { tap, map, filter, withLatestFrom } from 'rxjs/operators';
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  loadCartFromStorage,
} from './cart.actions';
import { selectCartState } from './cart.selectors';
import { CartState } from './cart.state';
import { StorageService } from '../core/services/storage.service';
import { GlobalStoreService } from '../core/services/global-store.service';

/**
 * Cart Store Synchronization Effects
 * Synchronizes local Cart MFE state with global Shell App store
 * and persists cart data to localStorage via StorageService
 *
 * Requirements:
 * - 3.4: Cart MFE SHALL synchronize cart state with Store_Compartilhada
 * - 3.11: Cart MFE SHALL persist state to StorageService
 * - 10.7: Store_Compartilhada SHALL persist cart slice to localStorage
 */
@Injectable()
export class CartSyncEffects {
  /**
   * Effect: Synchronize local cart state to global store
   * Triggered on any cart mutation (add, remove, update, clear)
   * Dispatches action to update global cart slice in Shell App's NgRx store
   */
  syncLocalToGlobal$ = createEffect(
    () =>
      this.actions$.pipe(
        // Listen for all cart state changes
        ofType(addItem, removeItem, updateQuantity, clearCart),
        // Get latest local cart state
        withLatestFrom(this.store$.pipe(select(selectCartState))),
        // Sync to global store and emit event
        tap(([action, cartState]) => {
          // Dispatch to global store via GlobalStoreService
          this.globalStoreService.syncCartToGlobal(cartState);
          // Emit custom event for Shell App and other MFEs
          this.emitCartSyncEvent('cart:state-changed', cartState);
        })
      ),
    { dispatch: false }
  );

  /**
   * Effect: Persist cart state to localStorage
   * Triggered on any cart state change
   * Uses window.localStorage to persist cart across sessions
   *
   * Note: In production, this would use StorageService from Shell App
   * For now, using window.localStorage directly for MFE autonomy
   */
  persistToLocalStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addItem, removeItem, updateQuantity, clearCart),
        // Get latest cart state after mutation
        withLatestFrom(this.store$.pipe(select(selectCartState))),
        // Persist to localStorage
        tap(([action, cartState]) => {
          this.persistCartState(cartState);
        })
      ),
    { dispatch: false }
  );

  /**
   * Effect: Listen for global cart state changes from Shell App
   * When Shell App's cart slice updates (from other MFEs or sources),
   * sync those changes back to local Cart MFE state
   *
   * This handles scenarios where:
   * - Another MFE modifies cart state
   * - Shell App initializes cart from localStorage
   * - Cart state is restored after navigation
   */
  syncGlobalToLocal$ = createEffect(
    () =>
      this.globalStoreService.onGlobalCartStateChange().pipe(
        // Filter out our own updates to prevent circular sync
        filter((globalCart) => globalCart && !this.isLocalUpdate),
        // Only update if state has actually changed
        filter((globalCart) => this.hasCartStateChanged(globalCart)),
        // Dispatch action to update local store
        map((globalCart) =>
          loadCartFromStorage({ cart: globalCart as CartState })
        )
      ),
    { dispatch: true }
  );

  /**
   * Effect: Initialize cart from localStorage on app startup
   * Loads previously persisted cart state to restore user's cart
   */
  initializeCartFromStorage$ = createEffect(
    () =>
      this.store$.pipe(
        // Trigger on first initialization (when cart state is empty)
        select(selectCartState),
        filter((cartState) => cartState.items.length === 0),
        // Load from localStorage
        map(() => {
          const savedCart = this.getPersistedCartState();
          if (savedCart) {
            return loadCartFromStorage({ cart: savedCart });
          }
          return { type: '[Cart] No Persisted State' };
        }),
        // Only dispatch if we have a saved state
        filter((action) => action.type !== '[Cart] No Persisted State')
      ),
    { dispatch: true }
  );

  private isLocalUpdate = false;
  private lastSyncedGlobalCart: CartState | null = null;

  constructor(
    private actions$: Actions,
    private store$: Store<{ cart: CartState }>,
    private storageService: StorageService,
    private globalStoreService: GlobalStoreService
  ) {}

  /**
   * Emit custom event for cart state synchronization
   * Allows Shell App and other MFEs to react to cart changes
   */
  private emitCartSyncEvent(eventType: string, cartState: CartState): void {
    this.isLocalUpdate = true;
    window.dispatchEvent(
      new CustomEvent(eventType, {
        detail: {
          source: 'cart-mfe',
          timestamp: Date.now(),
          cart: cartState,
        },
        bubbles: true,
        cancelable: true,
      })
    );
    // Reset after event emission
    setTimeout(() => {
      this.isLocalUpdate = false;
    }, 0);
  }

  /**
   * Check if global cart state has changed since last sync
   * Prevents unnecessary state updates
   */
  private hasCartStateChanged(newCartState: CartState): boolean {
    if (!this.lastSyncedGlobalCart) {
      this.lastSyncedGlobalCart = newCartState;
      return true;
    }

    const changed =
      JSON.stringify(this.lastSyncedGlobalCart) !==
      JSON.stringify(newCartState);

    if (changed) {
      this.lastSyncedGlobalCart = newCartState;
    }

    return changed;
  }

  /**
   * Persist cart state to localStorage via StorageService
   * Uses 'coffee-cart-state' key for storage
   */
  private persistCartState(cartState: CartState): void {
    try {
      this.storageService.saveCartState(cartState);
    } catch (error) {
      console.error('Failed to persist cart state:', error);
    }
  }

  /**
   * Retrieve persisted cart state from localStorage via StorageService
   * Returns null if no saved state exists or on parsing error
   */
  private getPersistedCartState(): CartState | null {
    try {
      return this.storageService.loadCartState<CartState>();
    } catch (error) {
      console.error('Failed to retrieve cart state:', error);
    }
    return null;
  }
}
