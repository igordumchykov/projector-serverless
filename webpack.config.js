const path = require('path')
const slsw = require('serverless-webpack')
const isLocal = slsw.lib.webpack.isLocal

module.exports = {
    mode: isLocal ? 'development' : 'production',
    devtool: isLocal ? 'source-map' : false,
    entry: slsw.lib.entries,
    target: 'node',
    resolve: {
        extensions: ['.json', '.ts', '.js'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                // Include ts, js files.
                test: /\.(ts|js)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'cache-loader',
                        options: {
                            cacheDirectory: path.resolve('.webpackCache'),
                        },
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
            },
        ],
    },
}
