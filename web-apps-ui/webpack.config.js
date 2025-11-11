const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      main: './app/scripts/main.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction 
        ? 'scripts/[name].[contenthash].js' 
        : 'scripts/[name].js',
      clean: true
    },
    resolve: {
      modules: ['node_modules', 'app'],
      alias: {
        'bower_components': path.resolve(__dirname, 'node_modules'),
        'bootstrap-fonts': path.resolve(__dirname, 'node_modules/bootstrap/dist/fonts')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.less$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                url: true,
                import: true
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('autoprefixer')
                  ]
                }
              }
            },
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  paths: [
                    path.resolve(__dirname, 'node_modules'),
                    path.resolve(__dirname, 'app')
                  ]
                }
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './app/index.webpack.html',
        filename: 'index.html',
        inject: 'body',
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptLoadAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true
        } : false
      }),
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'styles/[name].[contenthash].css'
        })
      ] : [])
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'app'),
        publicPath: '/'
      },
      port: 9900,
      open: true,
      hot: true,
      historyApiFallback: true,
      watchFiles: ['app/**/*'],
      proxy: [
        {
          context: ['/customers'],
          target: 'http://localhost:9000',
          changeOrigin: true
        },
        {
          context: ['/stores'],
          target: 'http://localhost:8081',
          changeOrigin: true
        }
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10,
            reuseExistingChunk: true
          }
        }
      }
    }
  };
};

