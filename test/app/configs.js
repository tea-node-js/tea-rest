module.exports = {
  name: 'tea-rest test service',
  service: {
    name: 'tea-rest',
    version: '1.0.0',
    host: '127.0.0.1',
    port: '8080',
    env: process.env.NODE_ENV || 'development',
  },
  logger: {
    name: 'tea-logger',
    streams: [{
      type: 'stream',
      stream: process.stdout,
      level: 'debug',
    }],
  },
};
