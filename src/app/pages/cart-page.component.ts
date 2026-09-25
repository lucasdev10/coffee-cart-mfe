import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take, map } from 'rxjs';
import { CartActions } from '../store/cart.actions';
import * as CartSelectors from '../store/cart.selectors';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    CurrencyPipe,
    AsyncPipe,
  ],
  template: `
    <div class="cart-container" role="region" aria-label="Shopping cart">
      @if ((isEmpty$ | async) === false) {
        <div class="cart-header">
          <h1 class="cart-title" id="cart-heading">
            <mat-icon class="title-icon" aria-hidden="true">shopping_cart</mat-icon>
            <span>Shopping Cart</span>
          </h1>
          <span
            class="items-count"
            role="status"
            aria-live="polite"
            [attr.aria-label]="(itemCount$ | async) + ' items in cart'"
          >
            {{ itemCount$ | async }} {{ (itemCount$ | async) === 1 ? 'item' : 'items' }}
          </span>
        </div>

        <div class="cart-content">
          <!-- Lista de produtos -->
          <div class="cart-items" role="list" aria-labelledby="cart-heading">
            @for (item of items$ | async; track item.product.id) {
              <mat-card
                class="cart-item"
                appearance="outlined"
                role="listitem"
                [attr.aria-label]="'Cart item: ' + item.product.name"
              >
                <div class="item-wrapper">
                  <div class="item-image-container">
                    <img
                      [src]="item.product.imageUrl"
                      [alt]="item.product.name + ' product image'"
                      class="item-image"
                    />
                  </div>

                  <div class="item-main">
                    <div class="item-header">
                      <div class="item-info">
                        <h3 class="item-name" id="item-name-{{ item.product.id }}">
                          {{ item.product.name }}
                        </h3>
                        <div class="item-meta">
                          <span class="meta-badge" aria-label="Price">{{
                            item.product.price | currency
                          }}</span>
                        </div>
                      </div>
                      <button
                        mat-icon-button
                        class="remove-button"
                        color="warn"
                        (click)="onRemoveItem(item.product.id)"
                        [attr.aria-label]="'Remove ' + item.product.name + ' from cart'"
                        tabindex="0"
                      >
                        <mat-icon aria-hidden="true">close</mat-icon>
                      </button>
                    </div>

                    <div class="item-footer">
                      <div class="item-price-section">
                        <span class="price-label" id="price-label-{{ item.product.id }}"
                          >Unit Price</span
                        >
                        <span
                          class="price-value"
                          [attr.aria-labelledby]="'price-label-' + item.product.id"
                          >{{ item.product.price | currency }}</span
                        >
                      </div>

                      <div
                        class="item-quantity-section"
                        role="group"
                        [attr.aria-label]="'Quantity controls for ' + item.product.name"
                      >
                        <span class="quantity-label" id="qty-label-{{ item.product.id }}"
                          >Quantity</span
                        >
                        <div class="quantity-controls">
                          <button
                            mat-icon-button
                            class="quantity-btn"
                            (click)="onDecrement(item.product.id)"
                            [attr.aria-label]="'Decrease quantity of ' + item.product.name"
                            tabindex="0"
                          >
                            <mat-icon aria-hidden="true">remove</mat-icon>
                          </button>
                          <span
                            class="quantity-value"
                            role="status"
                            aria-live="polite"
                            [attr.aria-label]="'Quantity: ' + item.quantity"
                            >{{ item.quantity }}</span
                          >
                          <button
                            mat-icon-button
                            class="quantity-btn"
                            (click)="onIncrement(item.product.id)"
                            [attr.aria-label]="'Increase quantity of ' + item.product.name"
                            tabindex="0"
                          >
                            <mat-icon aria-hidden="true">add</mat-icon>
                          </button>
                        </div>
                      </div>

                      <div class="item-subtotal-section">
                        <span class="subtotal-label" id="subtotal-label-{{ item.product.id }}"
                          >Subtotal</span
                        >
                        <span
                          class="subtotal-value"
                          [attr.aria-labelledby]="'subtotal-label-' + item.product.id"
                          >{{ item.subtotal | currency }}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card>
            }
          </div>

          <!-- Resumo do carrinho -->
          <div class="cart-summary-wrapper">
            <mat-card
              class="cart-summary"
              appearance="outlined"
              role="complementary"
              aria-label="Order summary"
            >
              <mat-card-header>
                <mat-card-title id="summary-heading">
                  <mat-icon class="summary-icon" aria-hidden="true">receipt_long</mat-icon>
                  <span>Order Summary</span>
                </mat-card-title>
              </mat-card-header>

              <mat-card-content>
                <div class="summary-section" role="list" aria-labelledby="summary-heading">
                  <div class="summary-row" role="listitem">
                    <span class="summary-label" id="subtotal-label"
                      >Subtotal ({{ itemCount$ | async }} items)</span
                    >
                    <span class="summary-amount subtotal-value" aria-labelledby="subtotal-label">{{
                      subtotal$ | async | currency
                    }}</span>
                  </div>
                  <div class="summary-row" role="listitem">
                    <span class="summary-label" id="shipping-label">Shipping</span>
                    @if (hasFreeShipping$ | async) {
                      <span class="summary-amount shipping-badge" aria-labelledby="shipping-label"
                        >Free</span
                      >
                    } @else {
                      <span class="summary-amount shipping-value" aria-labelledby="shipping-label">{{
                        shipping$ | async | currency
                      }}</span>
                    }
                  </div>
                  <div class="summary-row" role="listitem">
                    <span class="summary-label" id="tax-label">Tax (10%)</span>
                    <span class="summary-amount tax-value" aria-labelledby="tax-label">{{
                      tax$ | async | currency
                    }}</span>
                  </div>
                </div>

                <mat-divider role="separator"></mat-divider>

                <div class="summary-total" role="status" aria-live="polite">
                  <span class="total-label" id="total-label">Total</span>
                  <div class="total-amount-wrapper" aria-labelledby="total-label">
                    <span class="total-currency" aria-hidden="true">USD</span>
                    <span
                      class="total-amount"
                      [attr.aria-label]="'Total amount: ' + (total$ | async | currency)"
                      >{{ total$ | async | currency }}</span
                    >
                  </div>
                </div>

                @if ((hasFreeShipping$ | async) === false) {
                  <div class="free-shipping-notice" role="status" aria-live="polite">
                    <mat-icon aria-hidden="true">local_shipping</mat-icon>
                    <span
                      >Add {{ 50 - ((subtotal$ | async) || 0) | currency }} more for free
                      shipping!</span
                    >
                  </div>
                }
              </mat-card-content>

              <mat-card-actions>
                <button
                  mat-raised-button
                  color="primary"
                  class="checkout-button"
                  (click)="onCheckout()"
                  [disabled]="isEmpty$ | async"
                  aria-label="Proceed to secure checkout"
                  tabindex="0"
                >
                  <mat-icon aria-hidden="true">lock</mat-icon>
                  <span>Secure Checkout</span>
                </button>
                <button
                  mat-stroked-button
                  class="continue-button"
                  (click)="onContinueShopping()"
                  aria-label="Continue shopping for more products"
                  tabindex="0"
                >
                  <mat-icon aria-hidden="true">arrow_back</mat-icon>
                  <span>Continue Shopping</span>
                </button>
              </mat-card-actions>

              <div class="trust-badges" role="list" aria-label="Security features">
                <div class="badge-item" role="listitem">
                  <mat-icon aria-hidden="true">verified_user</mat-icon>
                  <span>Secure Payment</span>
                </div>
                <div class="badge-item" role="listitem">
                  <mat-icon aria-hidden="true">local_shipping</mat-icon>
                  <span>Free Shipping</span>
                </div>
              </div>
            </mat-card>
          </div>
        </div>
      } @else {
        <!-- Carrinho vazio -->
        <div class="empty-cart" role="status" aria-live="polite">
          <div class="empty-content">
            <div class="empty-icon-wrapper" aria-hidden="true">
              <mat-icon class="empty-icon">shopping_cart</mat-icon>
            </div>
            <h2 class="empty-title">Your cart is empty</h2>
            <p class="empty-description">Looks like you haven't added anything to your cart yet</p>
            <button
              mat-raised-button
              color="primary"
              class="start-shopping-button"
              (click)="onContinueShopping()"
              aria-label="Start shopping for products"
              tabindex="0"
            >
              <mat-icon aria-hidden="true">storefront</mat-icon>
              <span>Start Shopping</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px;
      min-height: calc(100vh - 64px);
    }

    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--mat-sys-outline-variant);
    }

    .cart-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      color: var(--mat-sys-on-surface);
    }

    .title-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--mat-sys-primary);
    }

    .items-count {
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant);
      background: var(--mat-sys-surface-container-high);
      padding: 6px 16px;
      border-radius: 16px;
      font-weight: 500;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item {
      transition: all 0.2s ease;
    }

    .cart-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .item-wrapper {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 20px;
      padding: 16px;
    }

    .item-image-container {
      border-radius: 8px;
      overflow: hidden;
      background: var(--mat-sys-surface-container-highest);
      aspect-ratio: 1;
    }

    .item-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-main {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      margin: 0 0 6px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
    }

    .item-meta {
      display: flex;
      gap: 8px;
    }

    .meta-badge {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 4px 8px;
      border-radius: 4px;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      letter-spacing: 0.5px;
    }

    .item-footer {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .item-price-section,
    .item-quantity-section,
    .item-subtotal-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .price-label,
    .quantity-label,
    .subtotal-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .price-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quantity-btn {
      background: var(--mat-sys-surface-container-high);
      width: 32px;
      height: 32px;
    }

    .quantity-value {
      min-width: 32px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
    }

    .subtotal-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--mat-sys-primary);
    }

    .cart-summary-wrapper {
      position: relative;
    }

    .cart-summary {
      position: sticky;
      top: 24px;
    }

    mat-card-header {
      background: var(--mat-sys-primary-container);
      padding: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: var(--mat-sys-on-primary-container);
      margin: 0;
    }

    .summary-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-card-content {
      padding: 20px;
    }

    mat-card-actions {
      padding: 0 20px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .summary-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }

    .summary-label {
      color: var(--mat-sys-on-surface-variant);
    }

    .summary-amount {
      font-weight: 600;
      color: var(--mat-sys-on-surface);
    }

    .shipping-badge {
      color: var(--mat-sys-primary);
      font-weight: 700;
    }

    mat-divider {
      margin: 16px 0;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }

    .total-label {
      font-size: 16px;
      font-weight: 600;
    }

    .total-amount-wrapper {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .total-currency {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
    }

    .total-amount {
      font-size: 28px;
      font-weight: 700;
      color: var(--mat-sys-primary);
    }

    .free-shipping-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
      border-radius: 8px;
      font-size: 13px;
      margin-top: 16px;
    }

    .checkout-button,
    .continue-button {
      width: 100%;
      height: 44px;
    }

    .trust-badges {
      display: flex;
      justify-content: space-around;
      padding: 16px 20px;
      background: var(--mat-sys-surface-container-low);
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .badge-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--mat-sys-on-surface-variant);
    }

    .empty-cart {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 400px;
    }

    .empty-icon-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--mat-sys-surface-container-high);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .empty-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--mat-sys-on-surface-variant);
    }

    .empty-title {
      margin: 0 0 10px;
      font-size: 24px;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }

    .empty-description {
      margin: 0 0 28px;
      font-size: 15px;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.5;
    }

    .start-shopping-button {
      height: 44px;
      padding: 0 28px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPageComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly items$ = this.store.select(CartSelectors.selectItems);
  readonly subtotal$ = this.store.select(CartSelectors.selectSubtotal);
  readonly shipping$ = this.store.select(CartSelectors.selectShipping);
  readonly tax$ = this.store.select(CartSelectors.selectTax);
  readonly total$ = this.store.select(CartSelectors.selectTotal);
  readonly itemCount$ = this.store.select(CartSelectors.selectItemCount);
  readonly isEmpty$ = this.store.select(CartSelectors.selectIsEmpty);
  readonly hasFreeShipping$ = this.store.select(CartSelectors.selectHasFreeShipping);

  onRemoveItem(productId: string): void {
    this.store.dispatch(CartActions.removeItem({ productId }));
  }

  onUpdateQuantity(productId: string, quantity: number): void {
    this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
  }

  onIncrement(productId: string): void {
    this.items$.pipe(
      take(1),
      map(items => {
        const item = items.find(i => i.product.id === productId);
        if (item) {
          this.store.dispatch(CartActions.updateQuantity({
            productId,
            quantity: item.quantity + 1
          }));
        }
      })
    ).subscribe();
  }

  onDecrement(productId: string): void {
    this.items$.pipe(
      take(1),
      map(items => {
        const item = items.find(i => i.product.id === productId);
        if (item) {
          this.store.dispatch(CartActions.updateQuantity({
            productId,
            quantity: item.quantity - 1
          }));
        }
      })
    ).subscribe();
  }

  onClearCart(): void {
    this.store.dispatch(CartActions.clearCart());
  }

  onContinueShopping(): void {
    this.router.navigate(['/products']);
  }

  async onCheckout(): Promise<void> {
    // TODO: Implement checkout flow
    console.log('Checkout clicked');
  }
}
