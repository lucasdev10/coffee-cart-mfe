import { describe, it, expect } from 'vitest';
import {
  selectItems,
  selectTotal,
  selectItemCount,
  selectIsEmpty,
  selectSubtotal,
  selectShipping,
  selectTax,
  selectHasFreeShipping,
} from './cart.selectors';
import { CartState, Product } from './cart.state';

describe('Cart Selectors', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Coffee',
    price: 5.99,
    stock: 10,
  };

  const mockState: CartState = {
    items: [{
      product: mockProduct,
      quantity: 2,
      subtotal: 11.98,
    }],
    subtotal: 11.98,
    shipping: 0,
    tax: 1.198,
    total: 13.178,
    itemCount: 2,
    loading: false,
    error: null,
  };

  it('should select cart items', () => {
    const result = selectItems.projector(mockState);
    expect(result).toEqual(mockState.items);
  });

  it('should select cart subtotal', () => {
    const result = selectSubtotal.projector(mockState);
    expect(result).toBe(11.98);
  });

  it('should select cart shipping', () => {
    const result = selectShipping.projector(mockState);
    expect(result).toBe(0);
  });

  it('should select cart tax', () => {
    const result = selectTax.projector(mockState);
    expect(result).toBe(1.198);
  });

  it('should select cart total', () => {
    const result = selectTotal.projector(mockState);
    expect(result).toBe(13.178);
  });

  it('should select cart item count', () => {
    const result = selectItemCount.projector(mockState);
    expect(result).toBe(2);
  });

  it('should indicate cart is not empty', () => {
    const result = selectIsEmpty.projector(mockState.items);
    expect(result).toBe(false);
  });

  it('should indicate cart is empty', () => {
    const result = selectIsEmpty.projector([]);
    expect(result).toBe(true);
  });

  it('should indicate cart has free shipping', () => {
    const result = selectHasFreeShipping.projector(0);
    expect(result).toBe(true);
  });

  it('should indicate cart does not have free shipping', () => {
    const result = selectHasFreeShipping.projector(10);
    expect(result).toBe(false);
  });
});

