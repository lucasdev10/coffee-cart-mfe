# Coffee Cart MFE (Micro Frontend)

This is a standalone Angular 21 Micro Frontend (MFE) application for the shopping cart functionality in the CoffeeWorkshop project. It uses Webpack 5 Module Federation to be dynamically loaded by the Shell App.

## Prerequisites

- Node.js 18.x or higher
- npm 10.x or higher
- Angular CLI 21.x

## Installation

```bash
npm install
```

### Local Dependency Setup

This MFE depends on `coffee-shared-lib`. If you're developing locally, it's configured as a file dependency:

```bash
# The shared library should be in ../coffee-shared-lib
npm install
```

If the shared library is published to npm, update `package.json` to use the npm version instead of the file path.

## Development

Start the MFE development server on port 4202:

```bash
npm start
```

The MFE will be available at `http://localhost:4202`.

The remote entry file will be at `http://localhost:4202/remoteEntry.js`.

## Build

Create a production build:

```bash
npm run build
```

Output will be in the `dist/` directory.

## Testing

Run unit tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Module Federation Configuration

This MFE is configured as a **remote** in the Module Federation setup:

- **Remote Name**: `cart`
- **Exposed Module**: `./Routes` → `src/app/cart.routes.ts`
- **Port**: 4202

### Shared Dependencies

The following dependencies are shared as singletons with the Shell App and other MFEs:

- @angular/core
- @angular/common
- @angular/router
- @angular/forms
- @angular/platform-browser
- @ngrx/store
- @ngrx/effects
- rxjs
- coffee-shared-lib

This ensures all MFEs use the same instances of these libraries, preventing duplication and ensuring consistent state management.

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   └── cart-page.component.ts    # Cart page component
│   ├── store/
│   │   ├── cart.actions.ts           # NgRx actions (to be implemented)
│   │   ├── cart.reducer.ts           # NgRx reducer (to be implemented)
│   │   ├── cart.selector.ts          # NgRx selectors (to be implemented)
│   │   └── cart.effects.ts           # NgRx effects (to be implemented)
│   ├── app.ts                        # Root component
│   ├── app.config.ts                 # Application configuration
│   ├── app.routes.ts                 # Internal routing
│   └── cart.routes.ts                # Routes exposed via Module Federation
├── main.ts                           # Application entry point
├── index.html                        # HTML template
└── styles.scss                       # Global styles
```

## Communication with Shell App

### Store Synchronization

The Cart MFE can access the global store from the Shell App through dependency injection. The shared NgRx store is provided at the application root level.

### Custom Events

Custom events can be emitted and listened to for inter-MFE communication:

```typescript
// Emit a custom event
window.dispatchEvent(new CustomEvent('cart:item-added', { detail: { product, quantity } }));

// Listen to custom events
window.addEventListener('cart:item-added', (event) => {
  console.log(event.detail);
});
```

### Storage Service

Persist data using the StorageService from the Shell App:

```typescript
inject(StorageService).setItem('key', value);
const value = inject(StorageService).getItem('key');
```

## Integration with Shell App

The Shell App loads this MFE remotely. To integrate:

1. Ensure the Shell App is running on `http://localhost:4200`
2. The Shell App should have this MFE configured in its webpack.config.js remotes
3. The route `/cart` should load this MFE's routes

## Troubleshooting

### MFE not loading
- Check that the Cart MFE is running on port 4202
- Verify the remoteEntry.js is accessible at `http://localhost:4202/remoteEntry.js`
- Check browser console for CORS or network errors

### Version conflicts
- Ensure all MFEs and the Shell App use the same versions of shared dependencies
- Update dependencies in package.json and run `npm install`

### Store not syncing
- Verify that the global store is properly provided in the Shell App
- Check that actions are dispatched correctly to the global store
- Verify state selectors are returning the expected data

## Scripts Summary

| Script | Description |
|--------|-------------|
| `npm start` | Start dev server on port 4202 |
| `npm run build` | Create production build |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run watch` | Watch mode during development |

## Dependencies

### Core Dependencies
- **@angular/core**: Angular framework core
- **@angular/common**: Angular common utilities
- **@angular/router**: Angular routing
- **@angular/forms**: Angular forms
- **@angular/platform-browser**: Angular browser platform
- **rxjs**: Reactive programming library
- **coffee-shared-lib**: Shared components, pipes, directives, and utilities

### Dev Dependencies
- **@angular/cli**: Angular CLI tool
- **@angular/compiler-cli**: Angular compiler
- **@angular/build**: Angular build tools
- **typescript**: TypeScript compiler
- **vitest**: Unit testing framework
- **jsdom**: DOM implementation for Node.js

## License

Part of the CoffeeWorkshop project.
