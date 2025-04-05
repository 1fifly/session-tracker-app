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
        { from: 'src/images/icon.png', to: 'images/icon.png' },
        { from: 'src/images/icon_no_bg.png', to: 'images/icon_no_bg.png' },
      ],
    }),
  ],
};