module.exports = {
  log(...args) {
    return async (ctx, next) => {
      console.log(...args);
      await next();
    };
  },
  error(...args) {
    return async (ctx, next) => {
      console.error(...args);
      await next();
    };
  },
  info(...args) {
    return async (ctx, next) => {
      console.info(...args);
      await next();
    };
  },
  warn(...args) {
    return async (ctx, next) => {
      console.warn(...args);
      await next();
    };
  },
  time(key) {
    return async (ctx, next) => {
      console.time(key);
      await next();
    };
  },
  timeEnd(key) {
    return async (ctx, next) => {
      console.timeEnd(key);
      await next();
    };
  },
};
