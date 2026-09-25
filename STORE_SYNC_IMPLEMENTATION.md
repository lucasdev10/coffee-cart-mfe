# Cart MFE Store Synchronization Implementation

## Overview

This document describes the implementation of store synchronization for the Cart MFE, which synchronizes the local Cart MFE store with the Shell App's global NgRx store and persists cart state to localStorage.

## Task 5.4 Implementation

**Requirements Addressed:**
- Req 3.4: Cart MFE SHALL synchronize cart state with Store_Compartilhada
- Req 3.11: Cart MFE SHALL persist state to StorageService
- Req 10.7: Store_Compartilhada SHALL persist cart slice to localStorage

## Architecture

### Components Implemented

#### 1. `CartSyncEffects` (src/app/store/cart-sync.effects.ts)

Main effects class that handles store synchronization with four key effects:

##### `syncLocalToGlobal$` Effect
- **Trigger:** Any cart mutation (addItem, removeItem, updateQuantity, clearCart)
- **Action:** Dispatches cart state to global Shell App store via GlobalStoreService
- **Side Effect:** Emits custom event `'cart:state-changed'` for inter-MFE communication
- **Purpose:** Keeps global store in sync with Cart MFE local state

```typescript
syncLocalToGlobal$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(addItem, removeItem, updateQuantity, clearCart),
      withLatestFrom(this.store$.pipe(select(selectCartState))),
      tap(([action, cartState]) => {
        this.globalStoreService.syncCartToGlobal(cartState);
        this.emitCartSyncEvent('cart:state-changed', cartState);
      })
    ),
  { dispatch: false }
);
```

##### `persistToLocalStorage$` Effect
- **Trigger:** Any cart mutation (addItem, removeItem, updateQuantity, clearCart)
- **Action:** Persists cart state to localStorage via StorageService
- **Purpose:** Enables cart recovery after page reload or session restoration

```typescript
persistToLocalStorage$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(addItem, removeItem, updateQuantity, clearCart),
      withLatestFrom(this.store$.pipe(select(selectCartState))),
      tap(([action, cartState]) => {
        this.persistCartState(cartState);
      })
    ),
  { dispatch: false }
);
```

##### `syncGlobalToLocal$` Effect
- **Trigger:** Global store cart state changes
- **Condition:** Filters out local updates to prevent circular synchronization
- **Action:** Updates local cart store with changes from global store
- **Purpose:** Handles scenarios where other MFEs or Shell App modify cart

```typescript
syncGlobalToLocal$ = createEffect(
  () =>
    this.globalStoreService.onGlobalCartStateChange().pipe(
      filter((globalCart) => globalCart && !this.isLocalUpdate),
      filter((globalCart) => this.hasCartStateChanged(globalCart)),
      map((globalCart) =>
        loadCartFromStorage({ cart: globalCart as CartState })
      )
    ),
  { dispatch: true }
);
```

##### `initializeCartFromStorage$` Effect
- **Trigger:** On app startup when cart state is empty
- **Action:** Loads previously persisted cart from localStorage
- **Purpose:** Restores user's cart on application start

```typescript
initializeCartFromStorage$ = createEffect(
  () =>
    this.store$.pipe(
      select(selectCartState),
      filter((cartState) => cartState.items.length === 0),
      map(() => {
        const savedCart = this.getPersistedCartState();
        if (savedCart) {
          return loadCartFromStorage({ cart: savedCart });
        }
        return { type: '[Cart] No Persisted State' };
      }),
      filter((action) => action.type !== '[Cart] No Persisted State')
    ),
  { dispatch: true }
);
```

#### 2. `StorageService` (src/app/core/services/storage.service.ts)

Service that abstracts localStorage persistence and provides integration with Shell App's StorageService.

**Key Features:**
- Attempts to use Shell App's StorageService if available (via `window.SHELL_STORAGE_SERVICE`)
- Falls back to native localStorage for MFE autonomy
- Provides cart-specific persistence methods

**Methods:**
- `setItem(key, value)`: Store item in localStorage
- `getItem(key)`: Retrieve item from localStorage
- `removeItem(key)`: Remove item from localStorage
- `saveCartState(cartState)`: Save complete cart state
- `loadCartState<T>()`: Load cart state from storage
- `getCartSyncTimestamp()`: Get last sync timestamp
- `clear()`: Clear all storage

**Implementation Details:**
```typescript
setItem(key: string, value: string): void {
  try {
    // Try Shell App's StorageService first
    if (this.hasShellStorageService()) {
      (window as any).SHELL_STORAGE_SERVICE?.setItem(key, value);
      return;
    }
    // Fall back to localStorage
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to set storage item '${key}':`, error);
  }
}
```

#### 3. `GlobalStoreService` (src/app/core/services/global-store.service.ts)

Service that provides access to Shell App's global NgRx store through Module Federation dependency injection.

**Key Features:**
- Accesses Shell App's singleton Store instance
- Dispatches actions to global store
- Subscribes to global cart state changes
- Provides convenience methods for auth and user data access

**Methods:**
- `dispatchToGlobal(action)`: Dispatch action to global store
- `syncCartToGlobal(cartState)`: Sync cart state to global [Global Cart] Update action
- `onGlobalCartStateChange()`: Observable of global cart state changes
- `getIsAuthenticated()`: Get authentication status from global store
- `getGlobalUser()`: Get user data from global store
- `getGlobalCartState()`: Get cart state from global store

**Dependency Injection Pattern:**
```typescript
constructor(private globalStore: Store) {}
```

The Store is shared as a singleton across Shell App and all MFEs when configured correctly in webpack.config.js with Module Federation singletons.

### Configuration

#### Module Federation Setup

The Cart MFE shares the global Store via Module Federation singleton configuration in webpack.config.js:

```javascript
shared: {
  '@ngrx/store': { singleton: true, strictVersion: false },
  '@ngrx/effects': { singleton: true, strictVersion: false },
  rxjs: { singleton: true, strictVersion: false },
}
```

This ensures that both Shell App and Cart MFE receive the same Store instance.

#### App Configuration

The CartSyncEffects is registered in app.config.ts:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({
      cart: cartReducer,
    }),
    provideEffects([CartEffects, CartSyncEffects]),
  ]
};
```

### State Synchronization Flow

#### Adding an Item to Cart

1. **User Action:** User clicks "Add to Cart"
2. **Dispatch:** Component dispatches `addItem` action
3. **Store Update:** Reducer updates local cart state
4. **Effect Triggers:**
   - `syncLocalToGlobal$`: Sends updated cart to global store
   - `persistToLocalStorage$`: Persists cart to localStorage
   - Emits `'cart:state-changed'` custom event
5. **Global Update:** Shell App's global store receives update
6. **Persistence:** Cart state saved in localStorage for recovery

#### Other MFE Modifying Cart

1. **External Update:** Products MFE or Shell App updates global cart
2. **Global Store Change:** Global cart state slice updates
3. **Effect Trigger:** `syncGlobalToLocal$` detects change
4. **Local Update:** Cart MFE's local store updates via `loadCartFromStorage` action
5. **Component Update:** CartPage component sees updated state via selectors

#### Application Initialization

1. **App Start:** Cart MFE initializes
2. **Empty State:** Cart reducer starts with empty items
3. **Effect Trigger:** `initializeCartFromStorage$` detects empty state
4. **Storage Check:** Attempts to load persisted cart from localStorage
5. **State Restore:** If saved cart found, loads it into local store
6. **User Ready:** Cart page displays restored cart

### Custom Events

The implementation emits custom events for inter-MFE communication:

#### `cart:state-changed`
**When:** Any cart state mutation (add, remove, update, clear)
**Payload:**
```typescript
{
  source: 'cart-mfe',
  timestamp: number,
  cart: CartState
}
```
**Usage:** Shell App and other MFEs can listen to react to cart changes

### Error Handling

The implementation includes robust error handling:

1. **Storage Errors:** Try/catch around all localStorage operations
2. **Parsing Errors:** Safely parse and validate JSON from storage
3. **Missing State:** Gracefully handle missing persisted state
4. **Shell Integration:** Fallback to localStorage if Shell StorageService unavailable
5. **Circular Updates:** `isLocalUpdate` flag prevents circular synchronization

### Integration with Shell App

#### Expected in Shell App:
1. Global store configured with `cartGlobal` slice
2. Global cart actions: `[Global Cart] Update`
3. StorageService exposed via `window.SHELL_STORAGE_SERVICE` (optional)
4. Shared NgRx store singleton via Module Federation

#### Cart MFE Provides:
1. Dispatches to global `cartGlobal` slice via GlobalStoreService
2. Listens to global cart changes
3. Persists cart state using StorageService
4. Emits custom events for inter-MFE communication

### Testing

All existing tests pass:
- Cart actions and reducer tests
- Cart selectors tests
- Store initialization tests

The implementation is backward-compatible with existing test suites.

### Usage in Components

#### CartPageComponent Integration

```typescript
export class CartPageComponent {
  cartState$ = this.store.select(selectCartState);
  cartItems$ = this.store.select(selectCartItems);
  cartTotal$ = this.store.select(selectCartTotal);
  cartCount$ = this.store.select(selectCartCount);

  constructor(private store: Store) {}

  onAddItem(product: Product, quantity: number): void {
    this.store.dispatch(addItem({ product, quantity }));
    // CartSyncEffects automatically:
    // 1. Syncs to global store
    // 2. Persists to localStorage
    // 3. Emits custom event
  }

  onRemoveItem(productId: string): void {
    this.store.dispatch(removeItem({ productId }));
    // Same effects triggered
  }
}
```

### Performance Considerations

1. **Circular Sync Prevention:** Uses `isLocalUpdate` flag to prevent feedback loops
2. **State Change Detection:** Only updates on actual state changes (deep comparison)
3. **LocalStorage Throttling:** Not throttled (per-action), acceptable for cart updates
4. **Memory Efficiency:** Uses RxJS observables for efficient state subscription

### Future Enhancements

1. **Debounce:** Add debouncing to reduce storage writes
2. **Compression:** Compress cart state for storage efficiency
3. **Versioning:** Track cart state versions for compatibility
4. **Analytics:** Add event tracking for cart interactions
5. **Sync Conflict Resolution:** Handle conflicts if multiple tabs update cart

## Summary

Task 5.4 successfully implements cart state synchronization with the global Shell App store and localStorage persistence. The implementation provides:

✅ Global store synchronization via GlobalStoreService
✅ localStorage persistence via StorageService
✅ Circular update prevention
✅ Custom event emission for inter-MFE communication
✅ Robust error handling
✅ Backward compatibility with existing tests
✅ Clean architecture with separation of concerns
