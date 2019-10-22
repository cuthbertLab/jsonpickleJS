const path = require('path');
const webpack = require('webpack');
const PACKAGE = require('./package.json');
const version = PACKAGE.version;
const date_now = new Date().toISOString().replace(/T.*/, '');

const BANNER = `
jsonpickle.js ${version} built on ${date_now}
Copyright (c) 2013-2019 Michael Scott Cuthbert and cuthbertLab. BSD License

http://github.com/cuthbertLab/jsonpickleJS
`;

module.exports = {
    entry: './js/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'jsonpickle.min.js',
        library: 'jsonpickle',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    mode: 'production',
    devtool: 'source-map',
    // mode: 'development',
    // devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components|soundfont|soundfonts)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            // '@babel/transform-object-assign',
                            // '@babel/proposal-export-namespace-from',
                        ],
                    },
                }],
            },
        ],
    },
    plugins: [
        new webpack.BannerPlugin({banner: BANNER}),
    ],
};
