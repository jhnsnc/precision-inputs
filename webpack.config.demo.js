const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: {
    demo: './src/demo/demo.js',
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].bundle.js',
  },
  devtool: 'eval-source-map',
  devServer: {
    static: path.join(__dirname, 'public'),
    liveReload: true,
    port: 8080,
    open: true,
  },
  module: {
    rules: [
      // JS
      {
        test: /\.m?js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }]
            ],
            comments: true,
            compact: true,
          },
        },
      },
      // SCSS
      {
        test: /\.(scss|sass)$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: "[local]",
                namedExport: true,
              },
            }
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Precision Inputs Test Page',
      template: './src/demo/demo.html',
      filename: 'index.html',
      inject: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'precision-inputs.[name].css',
    }),
  ]
};
