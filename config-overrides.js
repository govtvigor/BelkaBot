const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

// Функция для отключения ESLint
const disableEslint = () => (config) => {
  config.module.rules = config.module.rules.filter(
    (rule) => !(rule.use && rule.use.some((use) => use.options && use.options.useEslintrc !== undefined))
  );
  return config;
};

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
  },
  disableEslint() // Отключаем ESLint
);
