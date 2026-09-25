import { describe, it, expect } from 'vitest';
import { cartReducer } from './cart.reducer';
import { initialCartState } from './cart.state';
import { CartActions } from './cart.actions';
import { CartItem, Product } from './cart.state';

describe('CartReducer', () => {
  it('should return the initial state', () => {
    const action = { type: 'UNKNOWN' } as any;
    const result = cartReducer(undefined, action);
    expect(result).toEqual(initialCartState);
  });

  it('should add an item to the cart', () => {
    const product: Product = {
      id: '1',
      name: 'Coffee',
      price: 5.99,
      stock: 10,
    };
    const action = CartActions.addItem({ product, quantity: 1 });
    const result = cartReducer(initialCartState, action);

    expect(result.items.length).toBe(1);
    expect(result.items[0].product.id).toBe('1');
    expect(result.items[0].quantity).toBe(1);
    expect(result.itemCount).toBe(1);
    expect(result.total).toBeGreaterThan(0);
  });

  it('should increase quantity if item already exists', () => {
    const product: Product = {
      id: '1',
      name: 'Coffee',
      price: 5.99,
      stock: 10,
    };
    const state = cartReducer(initialCartState, CartActions.addItem({ product, quantity: 1 }));
    const result = cartReducer(state, CartActions.addItem({ product, quantity: 1 }));

    expect(result.items.length).toBe(1);
    expect(result.items[0].quantity).toBe(2);
    expect(result.itemCount).toBe(2);
  });

  it('should remove an item from the cart', () => {
    const product: Product = {
      id: '1',
      name: 'Coffee',
      price: 5.99,
      stock: 10,
    };
    const state = cartReducer(initialCartState, CartActions.addItem({ product, quantity: 1 }));
    const result = cartReducer(state, CartActions.removeItem({ productId: '1' }));

    expect(result.items.length).toBe(0);
    expect(result.itemCount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should update item quantity', () => {
    const product: Product = {
      id: '1',
      name: 'Coffee',
      price: 5.99,
      stock: 10,
    };
    const state = cartReducer(initialCartState, CartActions.addItem({ product, quantity: 1 }));
    const result = cartReducer(state, CartActions.updateQuantity({ productId: '1', quantity: 3 }));

    expect(result.items[0].quantity).toBe(3);
    expect(result.itemCount).toBe(3);
  });

  it('should remove item if quantity is set to 0 or less', () => {
    const product: Product = {
      id: '1',
      name: 'Coffee',
      price: 5.99,
      stock: 10,
    };
    const state = cartReducer(initialCartState, CartActions.addItem({ product, quantity: 2 }));
    const result = cartReducer(state, CartActions.updateQuantity({ productId: '1', quantity: 0 }));

    expect(result.items.length).toBe(0);
    expect(result.itemCount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should clear all items from the cart', () => {
    const product1: Product = {
      id: '1',
      name: 'Coffee',
      price: 5.99,
      stock: 10,
    };
    const product2: Product = {
      id: '2',
      name: 'Tea',
      price: 3.99,
      stock: 10,
    };
    let state = cartReducer(initialCartState, CartActions.addItem({ product: product1, quantity: 2 }));
    state = cartReducer(state, CartActions.addItem({ product: product2, quantity: 1 }));
    const result = cartReducer(state, CartActions.clearCart());

    expect(result.items.length).toBe(0);
    expect(result.itemCount).toBe(0);
    expect(result.total).toBe(0);
  });
});

