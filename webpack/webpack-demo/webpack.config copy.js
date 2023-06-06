const path = require("path");
const toml = require("toml");
const yaml = require("yamljs");
const json5 = require("json5");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  // mode: "production",
  mode: "development",
  // devtool: "inline-source-map",
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    static: "./dist",
    // hot: true,
  },
  stats: 'summary',
  optimization: {
    runtimeChunk: "single",
    moduleIds: "deterministic",
    splitChunks: {
      cacheGroups: {
        modules: {
          test: /[\\/]node_modules[\\/]/,
          name: "modules",
          chunks: "all",
        },
      },
    },
  },
  entry: {
    main: path.resolve(__dirname, "./src/main.js"),
    // print: path.resolve(__dirname, "./src/print.js"),
  },
  output: {
    filename: "[name].[contenthash:10].js",
    // assetModuleFilename: 'images/[hash:8][ext][query]',
    path: path.resolve(__dirname, "dist"),
    // publicPath: 'https://cdn.example.com/assets/[fullhash]/',
    clean: true,
    // chunkFilename: '[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.less$/i,
        use: ["style-loader", "css-loader", "postcss-loader", "less-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(csv|tsv)$/i,
        use: ["csv-loader"],
      },
      {
        test: /\.xml$/i,
        use: ["xml-loader"],
      },
      {
        test: /\.toml$/i,
        type: "json",
        parser: {
          parse: toml.parse,
        },
      },
      {
        test: /\.yaml$/i,
        type: "json",
        parser: {
          parse: yaml.parse,
        },
      },
      {
        test: /\.json5$/i,
        type: "json",
        parser: {
          parse: json5.parse,
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Development",
      // template: path.resolve(__dirname, "./public/index.html"),
    }),
    new webpack.ProgressPlugin(),
  ],
};
