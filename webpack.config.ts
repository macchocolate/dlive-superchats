import webpack = require("webpack")
import HtmlWebpackPlugin = require("html-webpack-plugin")

const config: webpack.Configuration = {
  mode: "development",
  entry: "./src",

  plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })],

  module: {
    rules: [
      {
        test: /\.(tsx|jsx|ts|js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              [
                "babel-plugin-styled-components",
                {
                  ssr: false
                }
              ],
              "@babel/plugin-proposal-class-properties"
            ],
            presets: [
              "@babel/preset-typescript",
              "@babel/preset-react",
              [
                "@babel/preset-env",
                {
                  targets: {
                    chrome: 80
                  }
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.(vert|frag)$/,
        use: "raw-loader"
      },
      {
        test: /\.(png)$/,
        use: "url-loader"
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader"
        ]
      }
    ]
  },

  resolve: {
    extensions: [".js", ".tsx", ".ts", ".jsx", "*", ".scss"]
  },

  devServer: {
    // open: true,
    host: "0.0.0.0",
    port: 4141
  }
}

export default config
