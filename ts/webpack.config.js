const path = require('path');
// eslint-disable-next-line import/no-unresolved
const slsw = require('serverless-webpack');

module.exports = {
  mode: 'production',
  entry: slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      { test: /\.ts(x?)$/, use: 'ts-loader' },
    ],
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".json", ".ts"],
  },
};
