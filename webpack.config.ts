import webpack = require('webpack')
import HtmlWebpackPlugin = require('html-webpack-plugin')
import chalk from 'chalk'
let env: any = {}
try {
  env = require('dotenv-safe').config().parsed
} catch (e) {
  if (process.env.NODE_ENV === 'production') {
    console.error(chalk.red(e))
    process.exit(1)
  }
  console.warn(chalk.yellow(e.message))
}

const envStrings = Object.assign(
  {},
  ...Object.keys(env).map((key) => ({
    ['process.env.' + key]: JSON.stringify(env[key]),
  })),
)

console.log({ envStrings })

const config: webpack.Configuration = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src',

  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new webpack.DefinePlugin({
      ...envStrings,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(tsx|jsx|ts|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              [
                'babel-plugin-styled-components',
                {
                  ssr: false,
                },
              ],
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-optional-chaining',
            ],
            presets: [
              '@babel/preset-typescript',
              '@babel/preset-react',
              [
                '@babel/preset-env',
                {
                  targets: {
                    chrome: 80,
                  },
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.(vert|frag)$/,
        use: 'raw-loader',
      },
      {
        test: /\.(png|svg)$/,
        use: 'url-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.tsx', '.ts', '.jsx', '*', '.scss'],
  },

  devServer: {
    // open: true,
    host: '0.0.0.0',
    port: 4141,
  },
}

export default config
