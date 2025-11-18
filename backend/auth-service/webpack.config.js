module.exports = function (options, webpack) {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
  ];

  return {
    ...options,
    externals: [],
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
      // Ignore optional dependencies from @mapbox/node-pre-gyp
      new webpack.IgnorePlugin({
        resourceRegExp: /^(mock-aws-s3|aws-sdk|nock)$/,
        contextRegExp: /@mapbox\/node-pre-gyp/,
      }),
      // Ignore HTML files from node-pre-gyp
      new webpack.IgnorePlugin({
        checkResource(resource) {
          // Ignore HTML files from node-pre-gyp
          if (resource.includes('@mapbox/node-pre-gyp') && resource.endsWith('.html')) {
            return true;
          }
          return false;
        },
      }),
    ],
    resolve: {
      ...options.resolve,
      fallback: {
        ...options.resolve?.fallback,
        'mock-aws-s3': false,
        'aws-sdk': false,
        'nock': false,
      },
    },
    module: {
      ...options.module,
      rules: [
        ...(options.module?.rules || []),
      ],
    },
  };
};

