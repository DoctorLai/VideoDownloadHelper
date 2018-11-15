var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './js/getPagesSource.js',
    output: {
        filename: 'dist.min.js',
        path: path.resolve(__dirname, './dist')
    }
}          