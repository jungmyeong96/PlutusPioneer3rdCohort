"use strict";

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

const isDevelopment = process.env.NODE_ENV === "development";

const devtool = isDevelopment ? "eval-source-map" : false;

module.exports = {
    devtool,
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 8009,
        https: false,
        stats: "errors-warnings",
        proxy: {
            "/api": {
                target: "http://localhost:8080",
            },
        },
    },
    entry: "./entry.js",
    output: {
        filename: "[name].[contenthash].js",
        path: path.join(__dirname, "dist"),
        pathinfo: true,
        clean: true,
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.purs$/,
                use: [
                    {
                        loader: 'purs-loader',
                        options: {
                            bundle: !isDevelopment,
                            psc: "psa",
                            pscArgs: {
                                strict: true,
                                censorLib: true,
                                stash: isDevelopment,
                                isLib: ["generated", ".spago"],
                            },
                            spago: isDevelopment,
                            watch: isDevelopment,
                            src: isDevelopment
                                ? []
                                : [
                                    '.spago/*/*/src/**/*.purs',
                                    'src/**/*.purs',
                                    'test/**/*.purs',
                                    'generated/**/*.purs',
                                    "web-common-plutus/src/**/*.purs",
                                    "web-common-playground/src/**/*.purs",
                                ],
                        }
                    }
                ]
            }, {
                test: /\.tsx?$/,
                loader: "ts-loader",
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource",
            },
        ],
    },
    resolve: {
        modules: [
            "node_modules",
            // We need this entry for node to be able to locate `node_modules` from
            // client directory when modules are referenced from inside `web-common`.
            path.resolve(__dirname, "./node_modules"),
        ],
        alias: {
            static: path.resolve(__dirname, "./static"),
            src: path.resolve(__dirname, "./src"),
        },
        extensions: [".purs", ".js", ".ts", ".tsx"],
    },
    resolveLoader: {
        modules: [
            "node_modules",
            path.resolve(__dirname, "."),
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: `${process.env.WEB_COMMON_SRC}/static/index.html`,
            favicon: "static/favicon.ico",
            title: "Plutus Playground",
            productName: "plutus-playground",
            googleAnalyticsId: isDevelopment ? "UA-XXXXXXXXX-X" : "G-9FPZ01J8E4",
            segmentAnalyticsId: isDevelopment ? "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" : "0CEePM8LJUSpPoo2QGrXHDw4GKg4JFBo",
        }),
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css",
        }),
        new MonacoWebpackPlugin({
            languages: ["haskell"],
        }),
    ],
};
