const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'cart',
  filename: 'remoteEntry.js',
  exposes: {
    './Routes': './src/app/cart.routes.ts',
  },
  shared: shareAll({
    singleton: true,
    strictVersion: false,
    requiredVersion: 'auto',
  }),
});
