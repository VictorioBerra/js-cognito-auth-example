import path from 'path';

export default {
    resolve: {
        extensions: ['.js'],
    },
    devServer: {
        port: process.env.PORT,
        host: process.env.IP,
        disableHostCheck: true,
        publicPath: '/dist/'
    },
    devtool: "cheap-eval-source-map",
    entry: ['./src/main.js'],
    output: {
        path: path.resolve(__dirname, "dist"), // string,
        filename: 'main.bundle.js'
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'postcss-loader']
            }
        ]
    }
};
