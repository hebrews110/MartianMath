const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const prod = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '../'),
    filename: 'game.[contenthash].js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          filename: '[name].[contenthash].js'
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(['./*.js'], { root: path.resolve(__dirname, '../') }),
  ]
}

module.exports = merge(common, prod)
