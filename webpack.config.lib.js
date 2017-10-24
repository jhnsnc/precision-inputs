const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// Plugin config
const extractSass = new ExtractTextPlugin({
  filename: '../css/[name].css',
});

module.exports = function(env) {

  const outputTarget = {
    // path set below
    filename: 'knob-input.js',
    library: 'KnobInput',
    libraryExport: 'default',
    // libraryTarget set below
  };

  if (!env || !env.target) {
    return false;
  } else if (env.target === 'window') {
    outputTarget.path = path.join(__dirname, 'scripts');
    outputTarget.libraryTarget = 'window';
  } else if (env.target === 'umd') {
    outputTarget.path = path.join(__dirname, 'umd');
    outputTarget.libraryTarget = 'umd';
  } else if (env.target === 'common') {
    outputTarget.path = path.join(__dirname, 'common');
    outputTarget.libraryTarget = 'commonjs2';
  } else {
    return false;
  }

  return {
    entry: {
      'knob-input': './src/knob-input.js',
    },
    output: outputTarget,
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
        // SCSS
        {
          test: /\.(scss|sass)$/,
          use: extractSass.extract({
            use: [{
              loader: 'css-loader',
              options: {
                minimize: true,
              }
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
      new UglifyJSPlugin(),
      extractSass,
    ]
  };

};
