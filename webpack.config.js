const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const dirSource = path.join(__dirname, 'src');

// dev/prod flag
const IS_DEV = (process.env.NODE_ENV === 'dev');

// Plugin config
const htmlDocumentPlugin = new HtmlWebpackPlugin({
  template: './src/demo/demo.html',
  filename: 'index.html',
  inject: 'body',
});

const extractSass = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  disable: IS_DEV,
});

module.exports = {
  entry: {
    main: './src/knob-input.js',
    demo: './src/demo/demo.js',
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
      // JS
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          comments: true,
          compact: true,
        },
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      // CSS/SCSS
      {
        test: /\.css$/,
        use: extractSass.extract({
          use: [{
            loader: 'css-loader?importLoaders=1'
          }, {
            loader: 'sass-loader'
          }],
          // use style-loader in development
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(scss|sass)$/,
        use: extractSass.extract({
          use: [{
            loader: 'css-loader'
          }, {
            loader: 'sass-loader'
          }],
          // use style-loader in development
          fallback: 'style-loader'
        })
      },
    ]
  },
  plugins: [
    htmlDocumentPlugin,
    extractSass,
  ]
};
