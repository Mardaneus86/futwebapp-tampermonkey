const webpack = require('webpack');

module.exports = {
  entry: './app/index.js',
  output: {
    filename: './dist/fut-enhancer.user.js',
  },
  node: {
    fs: 'empty',
    tls: 'empty',
    net: 'empty'
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
        'UA_TOKEN': JSON.stringify('UA-126264296-1')
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: [
              'transform-class-properties',
            ],
          },
        },
      },
      {
        test: /\.scss$|\.css$/,
        use: [{
          loader: 'style-loader', // creates style nodes from JS strings
        }, {
          loader: 'css-loader', // translates CSS into CommonJS
        }, {
          loader: 'sass-loader', // compiles Sass to CSS
        }],
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true,
            removeComments: false,
            collapseWhitespace: false,
          },
        }],
      },
    ],
  },
};
