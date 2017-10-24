const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const dirSource = path.join(__dirname, 'src');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    main: './src/knob-input.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'knob-input.js',
    library: 'KnobInput',
    libraryExport: 'default',
    libraryTarget: 'window',
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
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin()
  ]
};
