const path = require("path");
const autoprefixer = require("autoprefixer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const plugins = [
    new HtmlWebpackPlugin({
        template: "./index.html",
        title: "TodoList",
        favicon: "./app/assets/img/favicon.ico",
    }),
];

module.exports = (env, options) => {
    console.log(`This is the Webpack 4 'mode': ${options.mode}`);
    const prodMode = options.mode === "production";
    if (prodMode) {
        plugins.push(new MiniCssExtractPlugin());
    }
    return {
        plugins,
        entry: "./app/index.js",
        output: {
            path: path.join(__dirname, "/dist"),
            filename: "index-bundle.js",
        },
        devtool: prodMode ? "inline-source-map" : false,
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"],
                        plugins: [["@babel/plugin-proposal-class-properties"]],
                    },
                },
                {
                    test: /\.(le|c)ss$/,
                    use: [
                        prodMode ? MiniCssExtractPlugin.loader : "style-loader",
                        "css-loader",
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: [autoprefixer],
                                sourceMap: true,
                            },
                        },
                        "less-loader",
                    ],
                },
                {
                    test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "fonts/",
                    },
                },
                {
                    test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "img/",
                    },
                },
            ],
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        format: {
                            comments: false,
                        },
                    },
                    extractComments: false,
                }),
                new CssMinimizerPlugin(),
            ],
        },
    };
};
