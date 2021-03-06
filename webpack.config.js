const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const getFilesFromDir = require('./config/files');

const PAGE_DIR = path.join('src', 'pages', path.sep);

const htmlPlugins = getFilesFromDir(PAGE_DIR, ['.html']).map((filePath) => {
  const fileName = filePath.replace(PAGE_DIR, '');
  // { chunks:['contact', 'vendor'], template: 'src/pages/contact.html',  filename: 'contact.html'}
  return new HtmlWebPackPlugin({
    chunks: [fileName.replace(path.extname(fileName), ''), 'vendor'],
    template: filePath,
    filename: fileName,
  });
});

// { contact: './src/pages/contact.js' }
const entry = getFilesFromDir(PAGE_DIR, ['.js']).reduce((obj, filePath) => {
  const returnObj = obj;
  const entryChunkName = filePath.replace(path.extname(filePath), '').replace(PAGE_DIR, '');
  returnObj[entryChunkName] = `./${filePath}`;
  return returnObj;
}, {});

module.exports = (env, argv) => ({
  // stats: 'verbose',
  entry: entry,
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].[hash:4].js'
  },
  devtool: argv.mode === 'production' ? false : 'eval-source-maps',
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src', 'components')
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader', options: { modules: true } }],
        exclude: /node_modules/,
      },
      {
        test: /\.(sass|scss)$/,
        // include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'sass-loader',
            // {
            //   loader: 'sass-loader',
            //   options: {
            //     sourceMap: true,
            //   },
            // },
            // {
            //   loader: 'css-loader',
            //   options: {
            //     sourceMap: true,
            //     minimize: true,
            //     url: false,
            //   },
            // },
          ],
        }),
      },
      {
        test: /\.(svg|jpg|gif|png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: (url, resourcePath, context) => {
                if (argv.mode === 'development') {
                  const relativePath = path.relative(context, resourcePath);
                  return `/${relativePath}`;
                }
                return `/assets/images/${path.basename(resourcePath)}`;
              },
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: (url, resourcePath, context) => {
                if (argv.mode === 'development') {
                  const relativePath = path.relative(context, resourcePath);
                  return `/${relativePath}`;
                }
                return `/assets/fonts/${path.basename(resourcePath)}`;
              },
            },
          },
        ],
      }],
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...htmlPlugins,
    new ExtractTextPlugin('styles.css'),
    new CopyWebpackPlugin([{
      from: 'src/assets/images/**',
      to: path.resolve(__dirname, 'build/assets/images'),
      // to: 'assets/images',
      toType: 'dir',
      force: true,
      flatten: true,
    }]),
    // new ImageminPlugin({
    //   // cacheFolder: path.resolve(__dirname, 'cache'),
    //   bail: false, // Ignore errors on corrupted images
    //   cache: false,
    //   // filter: (source, sourcePath) => {
    //   //   console.log(source, sourcePath);
    //   // },
    //   // test: path.resolve(__dirname, 'build/assets/images/**'),
    //   test: /\.(jpe?g|png|gif|svg)$/i,
    //   include: 'build/assets/images/**',
    //   disable: process.env.NODE_ENV !== 'production', // Disable during development
    //   // pngquant: ({
    //   //   quality: [0.5, 0.5],
    //   // }),
    //   plugins: [
    //     ['gifsicle', { interlaced: true }],
    //     ['mozjpeg', { quality: 80 }],
    //     // ['jpegtran', { progressive: true }],
    //     ['optipng', { optimizationLevel: 5 }],
    //     [
    //       'svgo',
    //       {
    //         plugins: [
    //           {
    //             removeViewBox: false
    //           },
    //         ],
    //       },
    //     ],
    //   ],
    // }),
  ],
  optimization: {
    minimize: argv.mode === 'production' ? true : false,
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true,
        },
      },
    },
  },
});
