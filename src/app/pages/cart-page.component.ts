import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-page">
      <h1>Shopping Cart</h1>
      <p>Cart page content will be implemented here.</p>
    </div>
  `,
  styles: [`
    .cart-page {
      padding: 20px;
    }
  `]
})
export class CartPageComponent {}
