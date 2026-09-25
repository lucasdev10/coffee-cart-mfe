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

### Starting the Development Server

Start the MFE development server on port 4202:

```bash
npm start
```

The MFE will be available at `http://localhost:4202` with automatic live reload enabled.

The remote entry file will be at `http://localhost:4202/remoteEntry.js`.

**Watch Mode**: To run the development server with watch mode for continuous rebuilds:

```bash
npm run watch
```

### Debugging

The development server includes source maps for debugging. You can:

1. Open the browser DevTools (F12)
2. Navigate to the Sources tab
3. Set breakpoints in your TypeScript code
4. The debugger will map compiled JavaScript back to TypeScript

## Build

### Production Build

Create a production build optimized for deployment:

```bash
npm run build
```

Output will be in the `dist/` directory. This build includes:

- Minified code (reduced file size)
- Optimized bundle splitting
- Hash-based cache busting
- Source maps disabled for security

### Build Configurations

The build process supports different configurations:

- **Production** (default): Optimized for performance with all optimizations enabled
- **Development**: Includes source maps and skips optimizations for faster builds

To build for development:

```bash
ng build --configuration development
```

### Build Output

The production build generates:

- `remoteEntry.js` - Module Federation entry point (exposed to Shell App)
- Chunked JavaScript files with content hashes
- CSS files extracted and minified
- Assets folder with optimized images

**Size Budget**: The build enforces size limits:
- Initial bundle: Maximum 500KB warning, 1MB error
- Component styles: Maximum 2KB warning, 4KB error

## Testing

### Running Unit Tests

Run all unit tests:

```bash
npm test
```

This runs tests in run mode using Vitest and reports any failures.

### Watch Mode Testing

Run tests in watch mode for continuous testing during development:

```bash
npm run test:watch
```

Tests will re-run automatically when source files change.

### Coverage Reports

Generate a coverage report showing test coverage for the codebase:

```bash
npm run test:coverage
```

This generates:
- Console output with coverage percentages
- HTML coverage report (optional, depends on vitest configuration)
- Coverage summaries for statements, branches, functions, and lines

**Coverage Target**: Minimum 80% code coverage is required for all MFEs.

### Test Structure

Tests are located alongside source files with `.spec.ts` extension:

```
src/app/
├── pages/
│   ├── cart-page.component.ts
│   └── cart-page.component.spec.ts    ← Tests for CartPageComponent
└── store/
    ├── cart.reducer.ts
    ├── cart.reducer.spec.ts            ← Tests for reducers
    ├── cart.selectors.ts
    └── cart.selectors.spec.ts          ← Tests for selectors
```

### Testing Best Practices

1. **Test Components**: Test user interactions and rendered output
2. **Test Store**: Verify state transitions with different actions
3. **Test Services**: Mock dependencies and verify behavior
4. **Coverage**: Aim for >80% code coverage to catch regressions

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

The Shell App loads this MFE remotely using Module Federation. To fully integrate:

### Local Development Integration

1. **Ensure Shell App is running** on `http://localhost:4200`:
   ```bash
   cd ../CoffeeWorkshop  # Shell App directory
   npm start
   ```

2. **Ensure Cart MFE is running** on `http://localhost:4202`:
   ```bash
   npm start
   ```

3. **Verify Shell App configuration**:
   - Check that the Shell App has cart remote configured in webpack.config.js
   - The remote URL should point to `http://localhost:4202/remoteEntry.js`

4. **Navigate to the cart route**:
   - Open `http://localhost:4200/cart`
   - The Cart MFE should load dynamically

### Shared State Management

The Cart MFE interacts with the Shell App's global NgRx store:

- **Read**: Select cart items from global store
- **Write**: Dispatch actions to update global cart state
- **Sync**: Local cart state synchronizes with global store via effects

### Custom Events Communication

The Cart MFE emits custom events for inter-MFE communication:

- `cart:item-added` - When an item is added to cart
- `cart:item-removed` - When an item is removed
- `cart:cleared` - When the cart is emptied

Listen to these events in other MFEs:

```typescript
window.addEventListener('cart:item-added', (event) => {
  console.log('Item added:', event.detail);
});
```

### Production Deployment

For production, update the remote URL in the Shell App configuration:

```javascript
// Shell App webpack.config.js
remotes: {
  cart: 'cart@https://cdn.coffeeworkshop.com/cart/latest/remoteEntry.js',
  // ...
}
```

The Cart MFE will be loaded from the CDN URL instead of localhost.

## Troubleshooting

### MFE not loading in Shell App

**Problem**: The cart route loads but shows a blank screen or error.

**Solutions**:
1. Verify the Cart MFE is running: `http://localhost:4202` should respond
2. Check remoteEntry.js is accessible: `http://localhost:4202/remoteEntry.js`
3. Open browser DevTools → Console tab and look for CORS or network errors
4. Verify webpack.config.js has the correct remotes configuration in Shell App
5. Clear browser cache and reload

### CORS errors

**Problem**: Cross-Origin Resource Sharing errors when loading remoteEntry.js

**Solutions**:
1. Ensure Cart MFE is running (dev server includes CORS headers)
2. Check that the remote URL in Shell App matches the running port
3. Clear browser cache
4. Try incognito/private window to bypass cached headers

### Version conflicts

**Problem**: "Angular version mismatch" or "rxjs version mismatch" errors

**Solutions**:
1. Verify all MFEs use Angular 21.x:
   ```bash
   npm list @angular/core
   ```
2. Check package.json dependencies against Shell App
3. Update all dependencies to match:
   ```bash
   npm install @angular/core@^21.1.0 --save
   ```

### Store not syncing

**Problem**: Changes in Cart MFE store don't reflect in Shell App or other MFEs

**Solutions**:
1. Verify the global store is provided at Shell App root level
2. Check that actions are dispatched to the global store (not local store)
3. Verify state selectors use the correct store path
4. Open DevTools → Redux DevTools extension and check action dispatch
5. Check browser console for errors in effects

### Build fails

**Problem**: `npm run build` fails with errors

**Solutions**:
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```
3. Verify all imports are correct (especially from shared-lib)
4. Check that shared dependencies versions match in package.json

### Tests fail

**Problem**: `npm test` or `npm run test:coverage` shows failing tests

**Solutions**:
1. Run tests in watch mode to see which specific tests fail:
   ```bash
   npm run test:watch
   ```
2. Check error messages for missing mocks or incorrect test setup
3. Verify that dependencies are properly mocked in test files
4. Run a single test file to isolate the issue:
   ```bash
   npx vitest src/app/pages/cart-page.component.spec.ts
   ```

### Port already in use

**Problem**: "Port 4202 is already in use" error when running `npm start`

**Solutions**:
1. Find the process using port 4202:
   ```bash
   netstat -ano | findstr :4202  # Windows
   lsof -i :4202                  # Mac/Linux
   ```
2. Kill the process or use a different port:
   ```bash
   npm start -- --port 4300
   ```

### Dependencies not installing

**Problem**: `npm install` fails with shared-lib dependency

**Solutions**:
1. Verify coffee-shared-lib exists at `../coffee-shared-lib`
2. Ensure shared-lib is built:
   ```bash
   cd ../coffee-shared-lib
   npm run build
   ```
3. If using npm registry instead of file path, verify the published version:
   ```bash
   npm view @coffeeworkshop/shared versions
   ```

## Getting Help

For issues or questions:

1. Check this README and Troubleshooting section first
2. Review the [Shell App documentation](../CoffeeWorkshop/docs/MFE_DEVELOPMENT.md)
3. Check the [Architecture documentation](../CoffeeWorkshop/docs/MFE_ARCHITECTURE.md)
4. Search existing issues in the project repositories
5. Open a new issue with:
   - Detailed description of the problem
   - Steps to reproduce
   - Error messages and console logs
   - Your environment (Node version, OS, etc.)

## Scripts Summary

| Script | Description | Use Case |
|--------|-------------|----------|
| `npm start` | Start dev server on port 4202 with live reload | Local development |
| `npm run build` | Create optimized production build | Preparing for deployment |
| `npm run watch` | Run build in watch mode with continuous rebuilds | Development without dev server |
| `npm test` | Run all unit tests once | CI/CD pipelines, pre-commit checks |
| `npm run test:watch` | Run tests in watch mode, re-run on file changes | Development, test-driven development |
| `npm run test:coverage` | Run tests and generate coverage report | Code quality checks, coverage tracking |
| `npm run lint` | Run linter to check code style | Code quality, finding style issues |

### Quick Start Commands

```bash
# Complete development setup
npm install                    # Install dependencies
npm start                      # Start dev server (4202)
npm test                       # Run tests
npm run test:coverage          # Check coverage (target: >80%)
npm run build                  # Create production build
```

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
