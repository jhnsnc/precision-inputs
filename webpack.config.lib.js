const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: {
    // 'base': './src/base/index.js',
    // 'fl-controls': './src/fl-controls/index.js',
    'precision-inputs': './src/index.js',
  },
  output: {
    filename: '[name].js',
    library: 'PrecisionInputs',
    libraryExport: 'default',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
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
                localIdentName: "[local]__[hash:base64:6]",
                namedExport: true,
              },
            },
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
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ]
};
