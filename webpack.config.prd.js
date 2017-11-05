var fs = require("fs");

const webpack = require('webpack');
const config = require('./webpack.config');

let header = fs.readFileSync('./tampermonkey-headers.js', 'utf8');
header = header.replace('VERSION', require("./package.json").version);

console.log('Changed Tampermonkey header version to ' + require("./package.json").version);

config.devtool = 'none';
config.plugins = [
  new webpack.BannerPlugin({ 
    banner: header,
    raw: true, 
    entryOnly: true 
  }),
];

module.exports = config;
