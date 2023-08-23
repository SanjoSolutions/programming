import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin'
import dev from '@sanjo/webpack/webpack.dev.js'
import { merge } from 'webpack-merge'

const config = merge(dev, {
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
