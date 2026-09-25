import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { cartReducer } from './store/cart.reducer';
import { CartEffects } from './store/cart.effects';
import { CartSyncEffects } from './store/cart-sync.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({
      cart: cartReducer,
    }),
    provideEffects([CartEffects, CartSyncEffects]),
  ]
};

