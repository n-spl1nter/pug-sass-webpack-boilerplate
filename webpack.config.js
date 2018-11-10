const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const srcPath = './src/';
const buildPath = './build/';
const templates = [];

glob.sync(`${srcPath}markup/*.?(pug|jade)`).forEach((item) => {
  templates.push(
    new HtmlWebpackPlugin({
      filename: `${path.basename(item, path.extname(item))}.html`,
      template: item
    })
  );
});

module.exports = {

  mode: NODE_ENV,

  entry: {
    app: [
      '@babel/polyfill',
      path.resolve(__dirname, `${srcPath}scripts/main`),
      path.resolve(__dirname, `${srcPath}styles/main`),
    ]
  },

  output: {
    filename: NODE_ENV === 'development' ? 'js/[name].js?[hash]' : 'js/[name].min.js?[hash]',
    path: path.resolve(__dirname, buildPath),
    sourceMapFilename: '[name].js.map'
  },

  devtool: NODE_ENV === 'development' ? "eval-source-map" : false,

  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss']
  },

  watch: NODE_ENV === 'development',

  watchOptions: {
    aggregateTimeout: 100
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
        }
      },
      {
        test: /\.scss/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9',
                  ],
                  flexbox: 'no-2009'
                }),
              ],
              sourceMap: true
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(pug|jade)$/,
        loader: 'pug-loader',
        options: {
          pretty: true
        }
      },
      {
        test: /\.(eot|svg|otf|ttf|woff|woff2)$/,
        exclude: [/img/],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '/fonts/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(jp(e*)g|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8000,
              name: '/img/[name].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader'
          }
        ]
      },
      {
        test: /\.svg/,
        exclude: [/fonts/],
        use: {
          loader: 'svg-url-loader',
        }
      }
    ]
  },

  plugins: [
    ...templates,
    new MiniCssExtractPlugin({
      filename: NODE_ENV === 'development' ? 'css/[name].css?[hash]' : 'css/[name].min.css?[hash]'
    }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      server: { baseDir: [path.resolve(__dirname, buildPath)] }
    })
  ],

};

if (NODE_ENV === 'production') {
  module.exports.plugins.push(
    new webpack.NoEmitOnErrorsPlugin()
  );
  module.exports.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: {
            warnings:     false,
            drop_console: true,
            unsafe:       true
          },
          mangle: true
        },
      })
    ]
  }
}

