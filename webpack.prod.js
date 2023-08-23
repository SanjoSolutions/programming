import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin'
import prod from '@sanjo/webpack/webpack.prod.js'
import { merge } from 'webpack-merge'

const config = merge(prod, {
  output: {
    library: {
      type: undefined,
    },
    scriptType: 'text/javascript',
  },
  module: {
    rules: [
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [new MonacoWebpackPlugin()],
  experiments: {
    outputModule: undefined,
  },
})

export default config
