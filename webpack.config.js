const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    //devtool: 'inline-source-map',
    devtool: 'eval',
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: {minimize: true}
                    }
                ]
            },
            {
                test: /datatables\.net.*/,
                loader: 'imports-loader?define=>false'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            d3: 'd3',
            _: 'lodash',
            $: 'jquery',
            jQuery: 'jquery'
        }),
        //new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new CopyWebpackPlugin([
            {from: 'static/img', to: 'img'},
            {from: 'static/data', to: 'data'}
        ])
    ],
    devServer: {
        hot: true,
        inline: false,
        disableHostCheck: true,
        host: '0.0.0.0',
        port: 2018,
        contentBase: path.join(__dirname + '/dist'),
        compress: true,
        proxy: {
            '/api': {
                target: 'http://ivaderlab.unist.ac.kr:2019',
                secure: false
            }
        }
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};