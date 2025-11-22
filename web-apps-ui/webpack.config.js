const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { AngularWebpackPlugin } = require('@ngtools/webpack');

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
      port: 9900,
      open: true,
      hot: true,
      historyApiFallback: true,
      watchFiles: ['src/**/*'],
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
