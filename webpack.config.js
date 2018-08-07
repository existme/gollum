let path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');
// const prod = process.argv.indexOf('-p') !== -1;
module.exports = (env) => {

  const prod = (env === 'prod');
  console.log(env);
  return {
    mode: prod ? 'production' : 'development',
    // mode: 'development',
    // resolve: {
    //   alias:{
    //     'jquery':'jquery/src/jquery'
    //   }
    // },
    optimization: {
      minimize: prod ? true : false
    },
    entry: {
      editor: './assets/scripts/editor.js',
      viewer: './assets/scripts/viewer.js',
    },
    output: {
      path: path.resolve(__dirname, 'lib/gollum/public/gollum/assets/scripts'),
      filename: '[name]-bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: ['url-loader']
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: "style-loader"
            }, {
              loader: "css-loader", options: {
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
            }
          ]
        }
      ],
    },
    "plugins": [
      new MiniCssExtractPlugin({filename: "lib/gollum/public/gollum/css/[name]-[contenthash:8].css"}),
      // Placeholder for injecting variables inside javascript bundles
      // The variable is accessible with: alert(WIKI_NAME); inside java script!
      new webpack.DefinePlugin({"WIKI_NAME": JSON.stringify("Gollum-Custom")}),
    ]
  }
};
