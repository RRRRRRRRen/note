const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    main: path.resolve(__dirname, "../src/main.js"),
  },
  output: {
    // filename: "[name].[hash:10].js",
    // assetModuleFilename: 'images/[hash:8][ext][query]',
    path: path.resolve(__dirname, "../dist/assets/[fullhash]"),
    publicPath: 'https://cdn.example.com/assets/[fullhash]/',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "postcss-loader", "less-loader"],
      },
      {
        test: /\.png/,
        type: 'asset/resource'
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
    }),
  ],
};
