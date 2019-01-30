const fs = require('fs');
const _ = require('lodash');

const _require = require;

const { hasOwnProperty } = Object.prototype;

/** 随机字符串字典 */
const RAND_STR_DICT = {
  normal: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  strong: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&’()*+,-./:;<=>?@[]^_`{|}~',
};

const utils = {
  /* 将字符串转换为数字 */
  intval(value, mode) {
    return parseInt(value, mode || 10) || 0;
  },
  /* 根据设置的路径，获取对象 */
  getModules(path, exts, excludes) {
    const modules = {};

    if (!_.isString(path)) return path;
    if (!fs.existsSync(path)) return modules;

    const files = utils.readdir(path, exts, excludes);

    _.each(files, (file) => {
      const name = utils.file2Module(file);
      modules[name] = utils.es6import(_require(`${path}/${file}`));
    });

    return modules;
  },
  /* 兼容es6的export */
  es6import(obj) {
    const isES6 = _.size(obj) === 1 && hasOwnProperty.call(obj, 'default');
    return isES6 ? obj.default : obj;
  },
  /* 判断给定ip是否是白名单里的ip地址 */
  isPrivateIp(ip, whiteList = []) {
    return whiteList.includes(ip);
  },
  /* 真实的连接请求端ip */
  remoteIp(ctx) {
    const { connection, socket } = ctx.req;
    return ((connection && connection.remoteAddress)
    || (socket && socket.remoteAddress)
    || (connection && connection.socket && connection.socket.remoteAddress));
  },
  /* 获取客户端真实ip地址 */
  clientIp(ctx) {
    return ctx.req.ips && ctx.req.ips.length ? ctx.req.ips : utils.remoteIp(ctx);
  },
  /* 获取可信任的真实ip */
  realIp(ctx, proxyIps) {
    const remoteIp = utils.remoteIp(ctx);
    if (!_.includes(proxyIps || [], remoteIp)) return remoteIp;
    return ctx.req.headers['x-real-ip'] || remoteIp;
  },
  /* 读取录下的所有模块 */
  readdir(dir, ext, exclude) {
    if (!_.isString(dir)) throw Error('dir must be a string!');
    if (!fs.existsSync(dir)) throw Error('dir not existed!');
    const exts = _.isString(ext) ? [ext] : ext;
    const excludes = _.isString(exclude) ? [exclude] : exclude;
    return _.chain(fs.readdirSync(dir))
      .map(x => x.split('.'))
      .filter(x => _.includes(exts, x[1]) && !_.includes(excludes, x[0]))
      .map(x => x[0])
      .value();
  },
  /* 文件名称到moduleName的转换 */
  file2Module(file) {
    return file.replace(/(-\w)/g, m => m[1].toUpperCase());
  },
  /* 首字符大写 */
  ucwords(value) {
    if (!_.isString(value)) return value;
    return value[0].toUpperCase() + value.substring(1);
  },
  /* 将字符串里的换行，制表符替换为普通空格 */
  nt2space(value) {
    if (!_.isString(value)) return value;
    /* 将换行、tab、多个空格等字符换成一个空格 */
    return value.replace(/(\\[ntrfv]|\s)+/g, ' ').trim();
  },
  /* 获取accessToken */
  getToken(ctx) {
    return (ctx.headers['x-auth-token']
    || ctx.query.access_token
    || ctx.query.accessToken);
  },
  /* 生成随机字符串 */
  randStr(_len, type) {
    const dict = RAND_STR_DICT[type || 'normal'] || type;
    const { length } = dict;

    /* 随机字符串的长度不能等于 0 或者负数 */
    const len = utils.intval(_len) < 1 ? 3 : _len;

    return _.range(len)
      .map(() => dict[Math.floor(Math.random() * length)])
      .join('');
  },
  /* 处理日志 */
  logger: {
    info: console.info.bind(console), /* eslint no-console: 0 */
    error: console.error.bind(console),
    warn: console.warn.bind(console),
  },
  /* 加载模块，屏蔽错误 */
  require(path) {
    try {
      return _require(path);
    } catch (e) {
      return null;
    }
  },
  isTest: process.env.NODE_ENV === 'test',

  isDev: process.env.NODE_ENV === 'development',

  isProd: process.env.NODE_ENV === 'production',
};

module.exports = utils;
