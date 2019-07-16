const path = require('path');

module.exports = {
  entry: './src/glavni.js',
  devtool:'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
  
};