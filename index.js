const rest = require('./lib/initialize');

rest.Router = require('tea-router');
rest.helper = require('./lib/helper');
rest.utils = require('./lib/utils');
rest.koa = require('koa');

process.on('uncaughtException', (error) => {
  rest.utils.logger.error(error);
});

process.on('unhandledRejection', (reason, p) => {
  rest.utils.logger.error(reason, p);
});

process.on('rejectionHandled', (error) => {
  rest.utils.logger.error(error);
});

module.exports = rest;
