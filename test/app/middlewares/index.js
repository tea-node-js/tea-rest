module.exports = [
  async (ctx, next) => {
    /* eslint no-underscore-dangle: 0 */
    ctx.req._middleWare = 'This is the first middleWare.';

    if (ctx.query.middleWareThrowError) {
      throw Error('Sorry, there are some errors in middle-ware.');
    }

    await next();
  },
];
