const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { AngularWebpackPlugin } = require('@ngtools/webpack');

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      main: './src/main.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction
        ? 'scripts/[name].[contenthash].js'
        : 'scripts/[name].js',
      chunkFilename: isProduction
        ? 'scripts/[name].[contenthash].js'
        : 'scripts/[name].js',
      clean: true
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      modules: ['node_modules', 'src'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          include: /src\/app/,
          use: ['raw-loader']
        },
        {
          test: /\.css$/,
          include: /src\/app/,
          exclude: /styles\.css$/,
          resourceQuery: /ngResource/,
          use: ['to-string-loader', 'css-loader']
        },
        {
          test: /\.ts$/,
          use: [
            {
              loader: '@ngtools/webpack'
            }
          ],
          exclude: /node_modules/
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
                    path.resolve(__dirname, 'src')
                  ]
                }
              }
            }
          ]
        },
        {
          test: /\.css$/,
          exclude: /src\/app/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          exclude: /src\/assets\//,
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
        },
        {
          test: /\.html$/,
          exclude: /src\/app/,
          loader: 'html-loader'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        GOOGLE_MAPS_API_KEY: JSON.stringify(googleMapsApiKey)
      }),
      new AngularWebpackPlugin({
        tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
        jitMode: true,
        directTemplateLoading: false
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
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
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/assets'),
            to: path.resolve(__dirname, 'dist/assets'),
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/fonts/**']
            }
          }
        ]
      }),
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'styles/[name].[contenthash].css'
        })
      ] : [])
    ],
    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'src'),
          publicPath: '/'
        },
        {
          directory: path.join(__dirname, 'src/app'),
          publicPath: '/',
          serveIndex: true
        }
      ],
      port: 9016,
      open: true,
      hot: true,
      historyApiFallback: true,
      watchFiles: ['src/**/*'],
      proxy: [
        {
          context: ['/api/customers'],
          target: 'http://localhost:8082',
          changeOrigin: true,
          pathRewrite: { '^/api/customers': '/customers' }
        },
        {
          context: ['/api/stores'],
          target: 'http://localhost:8081',
          changeOrigin: true,
          pathRewrite: { '^/api/stores': '/stores' }
        }
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'initial',
            priority: 10,
            reuseExistingChunk: true
          }
        }
      }
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 2 * 1024 * 1024,
      maxAssetSize: 512 * 1024,
      assetFilter: (assetFilename) => !assetFilename.endsWith('.map')
    }
  };
};
