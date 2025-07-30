const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const dotenv = require('dotenv');

// Load .env file
const env = dotenv.config({ path: path.resolve(__dirname, '.env') }).parsed;

// Prepare environment variables for DefinePlugin
const envKeys = Object.keys(env || {}).reduce((prev, key) => {
  prev[`process.env.${key}`] = JSON.stringify(env[key]);
  return prev;
}, {});

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  mode: 'development',
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new webpack.DefinePlugin(envKeys),
  ],
};
