// webpack.main.config.js
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/main.js',
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/splash.html', to: 'splash.html' },
        { from: 'src/images/logo.png', to: 'images/logo.png' },
      ],
    }),
  ],
};