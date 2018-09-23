var fs = require("fs");

const webpack = require('webpack');
const config = require('./webpack.config');

module.exports = env => {
  let header = fs.readFileSync('./tampermonkey-headers.js', 'utf8');
  header = header.replace('VERSION', process.env.TM_VERSION); // set by the build process on Travis
  
  console.log('Changed Tampermonkey header version to ' + process.env.TM_VERSION);
  
  config.devtool = 'none';
  config.plugins = [
    new webpack.DefinePlugin({
        'UA_TOKEN': JSON.stringify('UA-126264296-2')
    }),
    new webpack.BannerPlugin({ 
      banner: header,
      raw: true, 
      entryOnly: true 
    }),
  ];

  return config;
};
