import path from 'path';
import webpack from 'webpack';
import ESLintPlugin from 'eslint-webpack-plugin';

import { readPackageUp } from 'read-pkg-up';

const { packageJson: PACKAGE, path: packagePath } = await readPackageUp();
const __dirname = path.dirname(packagePath);
const version = PACKAGE.version;
const date_now = new Date().toISOString().replace(/T.*/, '');

const BANNER = `
jsonpickle.js ${version} built on ${date_now}
Copyright (c) 2013–2025 Michael Scott Asato Cuthbert. BSD License

http://github.com/cuthbertLab/jsonpickleJS
`;

export default {
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
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components|soundfont|soundfonts)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [],
                    },
                }],
            },
        ],
    },
    plugins: [
        new webpack.BannerPlugin({ banner: BANNER }),
        new ESLintPlugin({
            extensions: ['js'],
            exclude: ['node_modules', 'bower_components', 'soundfont', 'soundfonts'],
            failOnError: false,
        }),
    ],
};
