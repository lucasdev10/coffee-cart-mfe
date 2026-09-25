import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';

/**
 * Global Store Service for Cart MFE
 * Provides access to Shell App's global NgRx store via Module Federation
 * 
 * In Module Federation, the Cart MFE can access the Shell App's store singleton
 * through dependency injection. Angular's DI container ensures the same store
 * instance is shared across the host and all remotes when configured as singleton.
 * 
 * Requirements:
 * - 3.4: Cart MFE SHALL inject global Store from Shell App
 * - 10.4: Store SHALL be shared as singleton via Module Federation
 * - 10.5: All MFEs SHALL receive same Store instance
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalStoreService {
  // This will receive the singleton Store instance from Shell App
  // When Module Federation is configured correctly with singletons
  constructor(private globalStore: Store) {}

  /**
   * Dispatch action to global store
   * Used to update cart state in Shell App's global store
   */
  dispatchToGlobal(action: any): void {
    this.globalStore.dispatch(action);
  }

  /**
   * Select from global store
   * Used to subscribe to global state changes
   */
  selectFromGlobal<T>(selector: (state: any) => T): Observable<T> {
    return this.globalStore.pipe(
      new (require('rxjs/operators').select)(selector)
    );
  }

  /**
   * Get global auth state
   * Returns whether user is authenticated
   */
  getIsAuthenticated(): Observable<boolean> {
    return this.selectFromGlobal(
      (state: any) => state.authGlobal?.isAuthenticated ?? false
    );
  }

  /**
   * Get global user data
   * Returns current user information
   */
  getGlobalUser(): Observable<any> {
    return this.selectFromGlobal((state: any) => state.userGlobal?.profile ?? null);
  }

  /**
   * Get global cart state
   * Returns current cart state from Shell App
   */
  getGlobalCartState(): Observable<any> {
    return this.selectFromGlobal((state: any) => state.cartGlobal ?? null);
  }

  /**
   * Sync local cart state to global store
   * Dispatches action to update cartGlobal slice
   */
  syncCartToGlobal(cartState: any): void {
    this.dispatchToGlobal({
      type: '[Global Cart] Update',
      payload: cartState
    });
  }

  /**
   * Listen for global cart state changes
   * Allows Cart MFE to react when other MFEs update cart
   */
  onGlobalCartStateChange(): Observable<any> {
    return this.getGlobalCartState();
  }
}
