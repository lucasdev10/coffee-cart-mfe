import { describe, it, expect } from 'vitest';
import { CartActions } from './cart.actions';
import { CartState, Product } from './cart.state';

describe('CartActions', () => {
  describe('addItem', () => {
    it('should create an action', () => {
      const product: Product = {
        id: '1',
        name: 'Coffee',
        price: 10.99,
        stock: 50,
      };
      const action = CartActions.addItem({ product, quantity: 2 });

      expect(action.type).toBe('[Cart] Add Item');
      expect(action.product).toEqual(product);
      expect(action.quantity).toBe(2);
    });

    it('should handle product with optional fields', () => {
      const product: Product = {
        id: '2',
        name: 'Premium Beans',
        price: 25.99,
        stock: 100,
        imageUrl: '/path/to/image.jpg',
      };
      const action = CartActions.addItem({ product, quantity: 1 });

      expect(action.product.imageUrl).toBe('/path/to/image.jpg');
    });
  });

  describe('removeItem', () => {
    it('should create an action with productId', () => {
      const action = CartActions.removeItem({ productId: '1' });

      expect(action.type).toBe('[Cart] Remove Item');
      expect(action.productId).toBe('1');
    });
  });

  describe('updateQuantity', () => {
    it('should create an action with productId and quantity', () => {
      const action = CartActions.updateQuantity({ productId: '1', quantity: 5 });

      expect(action.type).toBe('[Cart] Update Quantity');
      expect(action.productId).toBe('1');
      expect(action.quantity).toBe(5);
    });

    it('should handle zero quantity', () => {
      const action = CartActions.updateQuantity({ productId: '1', quantity: 0 });

      expect(action.quantity).toBe(0);
    });

    it('should handle negative quantity', () => {
      const action = CartActions.updateQuantity({ productId: '1', quantity: -1 });

      expect(action.quantity).toBe(-1);
    });
  });

  describe('clearCart', () => {
    it('should create an action', () => {
      const action = CartActions.clearCart();

      expect(action.type).toBe('[Cart] Clear Cart');
    });
  });

  describe('loadCartFromStorage', () => {
    it('should create an action with cart state', () => {
      const cart: CartState = {
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
        loading: false,
        error: null,
      };
      const action = CartActions.loadCartFromStorage({ cart });

      expect(action.type).toBe('[Cart] Load from Storage');
      expect(action.cart).toEqual(cart);
    });

    it('should handle populated cart state', () => {
      const cart: CartState = {
        items: [
          {
            product: {
              id: '1',
              name: 'Test',
              price: 10,
              stock: 10,
            },
            quantity: 2,
            subtotal: 20,
          },
        ],
        subtotal: 20,
        shipping: 0,
        tax: 2,
        total: 22,
        itemCount: 2,
        loading: false,
        error: null,
      };
      const action = CartActions.loadCartFromStorage({ cart });

      expect(action.cart.items.length).toBe(1);
      expect(action.cart.total).toBe(22);
    });
  });

  describe('updateCart', () => {
    it('should create an action with partial cart state', () => {
      const partialCart = { subtotal: 100, total: 120 };
      const action = CartActions.updateCart({ cart: partialCart });

      expect(action.type).toBe('[Cart] Update Cart');
      expect(action.cart).toEqual(partialCart);
    });

    it('should handle full cart state', () => {
      const cart: Partial<CartState> = {
        items: [],
        subtotal: 50,
        shipping: 10,
        tax: 6,
        total: 66,
        itemCount: 0,
      };
      const action = CartActions.updateCart({ cart });

      expect(action.cart).toEqual(cart);
    });
  });

  describe('cartOperationSuccess', () => {
    it('should create an action with success message', () => {
      const action = CartActions.cartOperationSuccess({ message: 'Item added' });

      expect(action.type).toBe('[Cart] Operation Success');
      expect(action.message).toBe('Item added');
    });

    it('should handle different success messages', () => {
      const messages = [
        'Item added to cart',
        'Item removed from cart',
        'Cart cleared',
        'Quantity updated',
      ];

      messages.forEach((message) => {
        const action = CartActions.cartOperationSuccess({ message });
        expect(action.message).toBe(message);
      });
    });
  });

  describe('cartOperationError', () => {
    it('should create an action with error message', () => {
      const action = CartActions.cartOperationError({ error: 'Product not found' });

      expect(action.type).toBe('[Cart] Operation Error');
      expect(action.error).toBe('Product not found');
    });

    it('should handle different error messages', () => {
      const errors = [
        'Product not found',
        'Stock insufficient',
        'Invalid quantity',
        'Cart operation failed',
      ];

      errors.forEach((error) => {
        const action = CartActions.cartOperationError({ error });
        expect(action.error).toBe(error);
      });
    });
  });

  describe('CartActions export', () => {
    it('should export all action creators', () => {
      expect(CartActions.addItem).toBeDefined();
      expect(CartActions.removeItem).toBeDefined();
      expect(CartActions.updateQuantity).toBeDefined();
      expect(CartActions.clearCart).toBeDefined();
      expect(CartActions.loadCartFromStorage).toBeDefined();
      expect(CartActions.updateCart).toBeDefined();
      expect(CartActions.cartOperationSuccess).toBeDefined();
      expect(CartActions.cartOperationError).toBeDefined();
    });

    it('should have correct number of actions', () => {
      const actions = Object.keys(CartActions);
      expect(actions.length).toBe(8);
    });
  });
});
