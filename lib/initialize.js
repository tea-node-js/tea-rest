const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const Router = require('tea-router');
const assign = require('lodash/assign');
const requestId = require('./middlewares/requestId');
const responseHandler = require('./middlewares/responseHandler');
const errorHandler = require('./middlewares/errorHandler');
const logMiddleware = require('./middlewares/logger');
const utils = require('./utils');

/* rest plugins */
const plugins = [];

/* tea-rest object */
const rest = {};

/* 激活插件 */
const activePlugin = (path) => {
  plugins.forEach(x => x(rest, path));
};

/* 注册插件 */
rest.plugin = (...values) => {
  values.forEach(x => plugins.push(x));
  return rest;
};

/* 根据传递进来的 path 构建 restapi 服务 */
rest.start = (path, callback) => {
  // 1. 激活插件
  activePlugin(path);

  const { service, logger } = utils.require(`${path}/configs`);
  const routes = utils.require(`${path}/routes`);
  const middlewares = utils.require(`${path}/middlewares`);
  const controllers = utils.getModules(`${path}/controllers`, 'js');

  const app = new Koa();

  /* 设置中间件 */
  app.use(bodyParser(service.bodyParser));
  app.use(requestId());
  app.use(cors(service.cors));
  app.use(async (ctx, next) => {
    /* hooks 数据钩子 */
    ctx.hooks = {};
    /* 整合ctx.request.body, ctx.query */
    ctx.params = assign({}, ctx.query, ctx.request.body);
    /* req.route 存储evtName */
    ctx.req.route = {};
    await next();
  });

  /* 响应工具中间件优先设置 */
  app.use(responseHandler());
  /* 自定义中间件 */
  middlewares.forEach((middleware) => {
    app.use(async (ctx, next) => {
      try {
        await middleware(ctx, next);
      } catch (error) {
        utils.logger.error(ctx.req.url, error);
        const statusCode = error.statusCode || error.status || 500;
        ctx.status = statusCode;
        ctx.body = {
          message: error.message,
          status: 'error',
          data: error.message,
        };
      }
    });
  });
  app.use(errorHandler());
  app.use(logMiddleware({ logger }));

  /* 路由初始化，控制器载入 */
  const router = routes(new Router(app, controllers, null, service.route));

  /* 启用路由 */
  app.use(router.routes());
  app.use(router.allowedMethods());

  function onError(err, ctx) {
    if (ctx == null) {
      utils.logger.error({ err, event: 'error' }, 'Unhandled exception occured');
    }
  }

  app.on('error', onError);

  const server = app.listen(service.port, service.host, () => {
    callback(server);
  });

  server.on('error', onError);

  return server;
};

module.exports = rest;
