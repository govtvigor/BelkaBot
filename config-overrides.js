const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  addWebpackPlugin(new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  })),
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),  // Optional: Only if Buffer is needed
    };
    return config;
  }
);
