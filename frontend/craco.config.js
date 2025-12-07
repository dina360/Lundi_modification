const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util/"),
        "buffer": require.resolve("buffer/"),
        "process": require.resolve("process/browser"),
        "url": require.resolve("url/"),
        "assert": require.resolve("assert/"),
        "crypto": require.resolve("crypto-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify")
      };
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
        })
      );
      return webpackConfig;
    }
  }
};
