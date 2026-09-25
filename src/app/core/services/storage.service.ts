import { Injectable } from '@angular/core';

/**
 * Storage Service for Cart MFE
 * Handles localStorage persistence for cart state
 * 
 * In a real application with Shell App, this would:
 * 1. Attempt to use Shell App's StorageService via window object
 * 2. Fall back to localStorage if Shell App service not available
 * 3. Sync persistence across all MFEs
 * 
 * Requirements:
 * - 3.11: Cart MFE SHALL persist state via StorageService
 * - 10.7: Store_Compartilhada SHALL persist via StorageService to localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly CART_STATE_KEY = 'coffee-cart-state';
  private readonly SYNC_TIMESTAMP_KEY = 'coffee-cart-sync-timestamp';

  constructor() {}

  /**
   * Set item in storage
   * Tries to use Shell App's StorageService if available, falls back to localStorage
   */
  setItem(key: string, value: string): void {
    try {
      // Try to use Shell App's StorageService via window
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

  /**
   * Get item from storage
   */
  getItem(key: string): string | null {
    try {
      // Try to use Shell App's StorageService if available
      if (this.hasShellStorageService()) {
        return (window as any).SHELL_STORAGE_SERVICE?.getItem(key) ?? null;
      }
      // Fall back to localStorage
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get storage item '${key}':`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    try {
      // Try to use Shell App's StorageService if available
      if (this.hasShellStorageService()) {
        (window as any).SHELL_STORAGE_SERVICE?.removeItem(key);
        return;
      }
      // Fall back to localStorage
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove storage item '${key}':`, error);
    }
  }

  /**
   * Clear all items from storage
   */
  clear(): void {
    try {
      // Try to use Shell App's StorageService if available
      if (this.hasShellStorageService()) {
        (window as any).SHELL_STORAGE_SERVICE?.clear();
        return;
      }
      // Fall back to localStorage clear
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Save cart state to persistent storage
   */
  saveCartState(cartState: any): void {
    this.setItem(this.CART_STATE_KEY, JSON.stringify(cartState));
    this.setItem(this.SYNC_TIMESTAMP_KEY, Date.now().toString());
  }

  /**
   * Load cart state from persistent storage
   */
  loadCartState<T>(): T | null {
    const cartData = this.getItem(this.CART_STATE_KEY);
    if (cartData) {
      try {
        return JSON.parse(cartData) as T;
      } catch (error) {
        console.error('Failed to parse cart state from storage:', error);
      }
    }
    return null;
  }

  /**
   * Get cart sync timestamp
   */
  getCartSyncTimestamp(): number | null {
    const timestamp = this.getItem(this.SYNC_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  }

  /**
   * Check if Shell App's StorageService is available
   */
  private hasShellStorageService(): boolean {
    return !!(window as any).SHELL_STORAGE_SERVICE;
  }
}
