var fs = require("fs");

const webpack = require('webpack');
const config = require('./webpack.config');

const header = fs.readFileSync('./tampermonkey-headers.js', 'utf8');

config.devtool = 'none';
config.plugins = [
  new webpack.BannerPlugin({ 
    banner: header,
    raw: true, 
    entryOnly: true 
  }),
];

module.exports = config;
