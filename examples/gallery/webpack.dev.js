const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        proxy: {
            '/api': 'http://localhost:8000'
        },
        host: '0.0.0.0',
        historyApiFallback: true,
        port: 9000,
        hot: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});