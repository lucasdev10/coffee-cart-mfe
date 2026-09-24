import { describe, it, expect } from 'vitest';
import {
  selectCartItems,
  selectCartTotal,
  selectCartCount,
  selectIsCartEmpty,
} from './cart.selectors';
import { CartState } from './cart.state';
import { CartItem } from './cart.state';

describe('Cart Selectors', () => {
  const mockCartItem: CartItem = {
    productId: '1',
    productName: 'Coffee',
    quantity: 2,
    price: 5.99,
  };

  const mockState: CartState = {
    items: [mockCartItem],
    total: 11.98,
    count: 2,
    loading: false,
    error: null,
  };

  it('should select cart items', () => {
    const result = selectCartItems.projector(mockState);
    expect(result).toEqual([mockCartItem]);
  });

  it('should select cart total', () => {
    const result = selectCartTotal.projector(mockState);
    expect(result).toBe(11.98);
  });

  it('should select cart count', () => {
    const result = selectCartCount.projector(mockState);
    expect(result).toBe(2);
  });

  it('should indicate cart is not empty', () => {
    const result = selectIsCartEmpty.projector([mockCartItem]);
    expect(result).toBe(false);
  });

  it('should indicate cart is empty', () => {
    const result = selectIsCartEmpty.projector([]);
    expect(result).toBe(true);
  });
});
