// config-overrides.js
const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  addWebpackPlugin(new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  })),
  (config) => {
    config.resolve.fallback = {
      buffer: require.resolve('buffer/'),
      // add other fallbacks if needed
    };
    return config;
  }
);
