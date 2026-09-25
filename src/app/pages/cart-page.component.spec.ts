import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartPageComponent } from './cart-page.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialCartState, CartState, Product, CartItem } from '../store/cart.state';
import { Router } from '@angular/router';
import { CartActions } from '../store/cart.actions';
import * as CartSelectors from '../store/cart.selectors';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

describe('CartPageComponent', () => {
  let component: CartPageComponent;
  let fixture: ComponentFixture<CartPageComponent>;
  let store: MockStore;
  let router: Router;

  const mockProduct1: Product = {
    id: '1',
    name: 'Premium Coffee',
    price: 15.99,
    stock: 50,
    imageUrl: '/coffee.jpg',
  };

  const mockProduct2: Product = {
    id: '2',
    name: 'Coffee Maker',
    price: 89.99,
    stock: 20,
    imageUrl: '/maker.jpg',
  };

  const mockCartItem1: CartItem = {
    product: mockProduct1,
    quantity: 2,
    subtotal: 31.98,
  };

  const mockCartItem2: CartItem = {
    product: mockProduct2,
    quantity: 1,
    subtotal: 89.99,
  };

  const mockCartStateWithItems: CartState = {
    items: [mockCartItem1, mockCartItem2],
    subtotal: 121.97,
    shipping: 10,
    tax: 12.197,
    total: 144.167,
    itemCount: 3,
    loading: false,
    error: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        provideMockStore({
          initialState: { cart: mockCartStateWithItems },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);

    // Setup store overrides
    store.overrideSelector(CartSelectors.selectItems, mockCartStateWithItems.items);
    store.overrideSelector(CartSelectors.selectSubtotal, mockCartStateWithItems.subtotal);
    store.overrideSelector(CartSelectors.selectShipping, mockCartStateWithItems.shipping);
    store.overrideSelector(CartSelectors.selectTax, mockCartStateWithItems.tax);
    store.overrideSelector(CartSelectors.selectTotal, mockCartStateWithItems.total);
    store.overrideSelector(CartSelectors.selectItemCount, mockCartStateWithItems.itemCount);
    store.overrideSelector(CartSelectors.selectIsEmpty, false);
    store.overrideSelector(CartSelectors.selectHasFreeShipping, false);

    fixture.detectChanges();
  });

  describe('Component Setup', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have store injected', () => {
      expect(component['store']).toBeTruthy();
    });

    it('should have router injected', () => {
      expect(component['router']).toBeTruthy();
    });

    it('should have all required observable properties', () => {
      expect(component.items$).toBeTruthy();
      expect(component.total$).toBeTruthy();
      expect(component.isEmpty$).toBeTruthy();
      expect(component.subtotal$).toBeTruthy();
      expect(component.shipping$).toBeTruthy();
      expect(component.tax$).toBeTruthy();
      expect(component.itemCount$).toBeTruthy();
      expect(component.hasFreeShipping$).toBeTruthy();
    });
  });

  describe('Item Removal', () => {
    it('should dispatch removeItem action when onRemoveItem is called', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      component.onRemoveItem('1');

      expect(dispatchSpy).toHaveBeenCalledWith(CartActions.removeItem({ productId: '1' }));
    });

    it('should dispatch removeItem with correct productId', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const productId = 'test-product-id';

      component.onRemoveItem(productId);

      expect(dispatchSpy).toHaveBeenCalledWith(CartActions.removeItem({ productId }));
    });
  });

  describe('Quantity Update - Increment', () => {
    it('should dispatch updateQuantity action with incremented quantity', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      store.overrideSelector(CartSelectors.selectItems, [mockCartItem1]);
      store.refreshState();

      component.onIncrement('1');

      await new Promise(resolve => setTimeout(resolve, 20));
      expect(dispatchSpy).toHaveBeenCalledWith(
        CartActions.updateQuantity({ productId: '1', quantity: 3 })
      );
    });

    it('should not dispatch if item not found in cart', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      store.overrideSelector(CartSelectors.selectItems, []);
      store.refreshState();

      component.onIncrement('non-existent-id');

      await new Promise(resolve => setTimeout(resolve, 20));
      expect(dispatchSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: '[Cart] Update Quantity' })
      );
    });
  });

  describe('Quantity Update - Decrement', () => {
    it('should dispatch updateQuantity action with decremented quantity', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      store.overrideSelector(CartSelectors.selectItems, [mockCartItem1]);
      store.refreshState();

      component.onDecrement('1');

      await new Promise(resolve => setTimeout(resolve, 20));
      expect(dispatchSpy).toHaveBeenCalledWith(
        CartActions.updateQuantity({ productId: '1', quantity: 1 })
      );
    });

    it('should allow decrement to zero', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const singleItemCart: CartItem = {
        product: mockProduct1,
        quantity: 1,
        subtotal: 15.99,
      };
      store.overrideSelector(CartSelectors.selectItems, [singleItemCart]);
      store.refreshState();

      component.onDecrement('1');

      await new Promise(resolve => setTimeout(resolve, 20));
      expect(dispatchSpy).toHaveBeenCalledWith(
        CartActions.updateQuantity({ productId: '1', quantity: 0 })
      );
    });
  });

  describe('Cart Clearing', () => {
    it('should dispatch clearCart action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      component.onClearCart();

      expect(dispatchSpy).toHaveBeenCalledWith(CartActions.clearCart());
    });
  });

  describe('Navigation', () => {
    it('should navigate to products when onContinueShopping is called', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onContinueShopping();

      expect(navigateSpy).toHaveBeenCalledWith(['/products']);
    });

    it('should navigate to correct products route', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onContinueShopping();

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      const args = navigateSpy.mock.calls[0][0] as string[];
      expect(args[0]).toBe('/products');
    });
  });

  describe('Checkout', () => {
    it('should handle checkout button click', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await component.onCheckout();

      expect(consoleSpy).toHaveBeenCalledWith('Checkout clicked');
    });
  });

  describe('Observables', () => {
    it('should expose items$ observable', async () => {
      const items = await component.items$.pipe(take(1)).toPromise();
      expect(items).toEqual(mockCartStateWithItems.items);
      expect(items?.length).toBe(2);
    });

    it('should expose subtotal$ observable', async () => {
      const subtotal = await component.subtotal$.pipe(take(1)).toPromise();
      expect(subtotal).toBe(mockCartStateWithItems.subtotal);
    });

    it('should expose total$ observable', async () => {
      const total = await component.total$.pipe(take(1)).toPromise();
      expect(total).toBe(mockCartStateWithItems.total);
    });

    it('should expose itemCount$ observable', async () => {
      const count = await component.itemCount$.pipe(take(1)).toPromise();
      expect(count).toBe(mockCartStateWithItems.itemCount);
    });

    it('should expose isEmpty$ observable', async () => {
      const isEmpty = await component.isEmpty$.pipe(take(1)).toPromise();
      expect(isEmpty).toBe(false);
    });

    it('should expose hasFreeShipping$ observable', async () => {
      const hasFreeShipping = await component.hasFreeShipping$.pipe(take(1)).toPromise();
      expect(hasFreeShipping).toBe(false);
    });
  });

  describe('Empty Cart State', () => {
    it('should show empty state when cart is empty', () => {
      store.overrideSelector(CartSelectors.selectIsEmpty, true);
      store.overrideSelector(CartSelectors.selectItems, []);
      store.refreshState();

      fixture.detectChanges();

      component.isEmpty$.subscribe((isEmpty) => {
        expect(isEmpty).toBe(true);
      });
    });

    it('should show items list when cart has items', () => {
      store.overrideSelector(CartSelectors.selectIsEmpty, false);
      store.overrideSelector(CartSelectors.selectItems, mockCartStateWithItems.items);
      store.refreshState();

      fixture.detectChanges();

      component.isEmpty$.subscribe((isEmpty) => {
        expect(isEmpty).toBe(false);
      });
    });
  });

  describe('Free Shipping Logic', () => {
    it('should indicate free shipping when available', async () => {
      store.overrideSelector(CartSelectors.selectHasFreeShipping, true);
      store.overrideSelector(CartSelectors.selectShipping, 0);
      store.refreshState();

      const hasFreeShipping = await component.hasFreeShipping$.pipe(take(1)).toPromise();
      const shipping = await component.shipping$.pipe(take(1)).toPromise();
      expect(hasFreeShipping).toBe(true);
      expect(shipping).toBe(0);
    });

    it('should show shipping cost when free shipping not available', async () => {
      store.overrideSelector(CartSelectors.selectHasFreeShipping, false);
      store.overrideSelector(CartSelectors.selectShipping, 10);
      store.refreshState();

      const hasFreeShipping = await component.hasFreeShipping$.pipe(take(1)).toPromise();
      const shipping = await component.shipping$.pipe(take(1)).toPromise();
      expect(hasFreeShipping).toBe(false);
      expect(shipping).toBe(10);
    });
  });

  describe('Tax Calculation', () => {
    it('should expose tax$ observable', async () => {
      const tax = await component.tax$.pipe(take(1)).toPromise();
      expect(tax).toBe(mockCartStateWithItems.tax);
    });

    it('should display tax as 10% of subtotal', async () => {
      const expectedTax = mockCartStateWithItems.subtotal * 0.1;
      const tax = await component.tax$.pipe(take(1)).toPromise();
      expect(tax).toBeCloseTo(expectedTax, 2);
    });
  });
});

