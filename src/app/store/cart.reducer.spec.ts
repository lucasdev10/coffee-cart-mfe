import { describe, it, expect } from 'vitest';
import { cartReducer } from './cart.reducer';
import { initialCartState } from './cart.state';
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
} from './cart.actions';
import { CartItem } from './cart.state';

describe('CartReducer', () => {
  it('should return the initial state', () => {
    const action = { type: 'UNKNOWN' } as any;
    const result = cartReducer(undefined, action);
    expect(result).toEqual(initialCartState);
  });

  it('should add an item to the cart', () => {
    const item: CartItem = {
      productId: '1',
      productName: 'Coffee',
      quantity: 1,
      price: 5.99,
    };
    const action = addItemToCart({ item });
    const result = cartReducer(initialCartState, action);

    expect(result.items.length).toBe(1);
    expect(result.items[0]).toEqual(item);
    expect(result.count).toBe(1);
    expect(result.total).toBe(5.99);
  });

  it('should increase quantity if item already exists', () => {
    const item: CartItem = {
      productId: '1',
      productName: 'Coffee',
      quantity: 1,
      price: 5.99,
    };
    const state = cartReducer(initialCartState, addItemToCart({ item }));
    const result = cartReducer(state, addItemToCart({ item }));

    expect(result.items.length).toBe(1);
    expect(result.items[0].quantity).toBe(2);
    expect(result.count).toBe(2);
    expect(result.total).toBe(11.98);
  });

  it('should remove an item from the cart', () => {
    const item: CartItem = {
      productId: '1',
      productName: 'Coffee',
      quantity: 1,
      price: 5.99,
    };
    const state = cartReducer(initialCartState, addItemToCart({ item }));
    const result = cartReducer(state, removeItemFromCart({ productId: '1' }));

    expect(result.items.length).toBe(0);
    expect(result.count).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should update item quantity', () => {
    const item: CartItem = {
      productId: '1',
      productName: 'Coffee',
      quantity: 1,
      price: 5.99,
    };
    const state = cartReducer(initialCartState, addItemToCart({ item }));
    const result = cartReducer(state, updateCartItemQuantity({ productId: '1', quantity: 3 }));

    expect(result.items[0].quantity).toBe(3);
    expect(result.count).toBe(3);
    expect(result.total).toBe(17.97);
  });

  it('should remove item if quantity is set to 0 or less', () => {
    const item: CartItem = {
      productId: '1',
      productName: 'Coffee',
      quantity: 2,
      price: 5.99,
    };
    const state = cartReducer(initialCartState, addItemToCart({ item }));
    const result = cartReducer(state, updateCartItemQuantity({ productId: '1', quantity: 0 }));

    expect(result.items.length).toBe(0);
    expect(result.count).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should clear all items from the cart', () => {
    const item1: CartItem = {
      productId: '1',
      productName: 'Coffee',
      quantity: 2,
      price: 5.99,
    };
    const item2: CartItem = {
      productId: '2',
      productName: 'Tea',
      quantity: 1,
      price: 3.99,
    };
    let state = cartReducer(initialCartState, addItemToCart({ item: item1 }));
    state = cartReducer(state, addItemToCart({ item: item2 }));
    const result = cartReducer(state, clearCart());

    expect(result.items.length).toBe(0);
    expect(result.count).toBe(0);
    expect(result.total).toBe(0);
  });
});
