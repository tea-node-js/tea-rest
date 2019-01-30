module.exports = {
  index: async (ctx, next) => {
    ctx.body = 'Hello world, I am tea-rest.';
    await next();
  },
  json: async (ctx, next) => {
    ctx.body = {
      message: 'Hello world, I am tea-rest.',
    };
    await next();
  },
  unexception: [
    async (ctx, next) => {
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        data: 'Ooh, there are some errors in unexception.',
        message: 'Ooh, there are some errors in unexception.',
      };
      await next();
    },
  ],
  params: [
    async (ctx, next) => {
      ctx.res.ok({
        data: ctx.params,
      });
      await next();
    },
  ],
  body: [
    async (ctx, next) => {
      ctx.res.ok({
        data: ctx.params,
      });
      await next();
    },
  ],
};
