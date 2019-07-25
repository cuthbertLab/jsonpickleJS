const path = require('path');
const webpack = require('webpack');

const BANNER = `
jsonpickle.js <%= pkg.version %> built on
<%= grunt.template.today("yyyy-mm-dd") %>.
Copyright (c) 2013-<%= grunt.template.today("yyyy") %> Michael Scott Cuthbert and cuthbertLab.

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
        // new webpack.BannerPlugin({banner: BANNER}),
    ],
};
