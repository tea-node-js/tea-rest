const assert = require('assert');
const _ = require('lodash');
const utils = require('../lib/utils');

/* global describe it */
describe('lib/utils', () => {
  describe('#intval', () => {
    it('normal', () => {
      assert.equal(2, utils.intval(2));
    });
    it('string 2', () => {
      assert.equal(2, utils.intval('2'));
    });
    it('string 2aa', () => {
      assert.equal(2, utils.intval('2aa'));
    });
    it('8 mode 10', () => {
      assert.equal(8, utils.intval('10', 8));
    });
    return it('string aaa, result is number 0', () => {
      assert.equal(0, utils.intval('aaa'));
    });
  });
  describe('#file2Module', () => {
    it('filename return filename', () => {
      assert.equal('filename', utils.file2Module('filename'));
    });

    it('file-name return fileName', () => {
      assert.equal('fileName', utils.file2Module('file-name'));
    });
  });
  describe('#nt2space', () => {
    it('行首和行尾的空格应该被替换掉', () => {
      assert.equal('first', utils.nt2space(' first '));
    });

    it('换行符、空格和制表符应该被替换为一个空格', () => {
      const result = utils.nt2space(
        'first\n\t\r\f\v  second\\n\\t\\f\\v\\r end',
      );
      assert.equal('first second end', result);
    });

    it('n,t,r,f,v不应该被替换掉', () => {
      assert.equal('ntrfv', utils.nt2space('ntrfv'));
    });

    it('isnt a string', () => {
      assert.equal(0, utils.nt2space(0));
      assert.equal(1, utils.nt2space(1));
      assert.deepEqual([1], utils.nt2space([1]));
      assert.deepEqual({ name: 'Hello' }, utils.nt2space({ name: 'Hello' }));
    });
  });

  describe('#getToken', () => {
    it('优先获取头信息里的 x-auth-token', () => {
      const req = {
        headers: {
          'x-auth-token': 'Hi, I\'m token',
        },
        query: {
          access_token: 'access_token',
          accessToken: 'accessToken',
        },
      };

      const ctx = Object.assign({}, { req }, req);
      assert.equal('Hi, I\'m token', utils.getToken(ctx));
    });

    it('其次是query.access_token', () => {
      const req = {
        headers: {},
        query: {
          access_token: 'access_token',
          accessToken: 'accessToken',
        },
      };
      const ctx = Object.assign({}, { req }, req);
      assert.equal('access_token', utils.getToken(ctx));
    });

    it('最后query.accessToken', () => {
      const req = {
        headers: {},
        query: {
          access_token: null,
          accessToken: 'accessToken',
        },
      };
      const ctx = Object.assign({}, { req }, req);
      assert.equal('accessToken', utils.getToken(ctx));
    });
  });

  describe('#randStr', () => {
    it('Length is 5', () => {
      assert.equal(5, utils.randStr(5).length);
      assert.equal(5, utils.randStr(5).length);
      assert.equal(5, utils.randStr(5).length);
    });

    it('Type must be string', () => {
      assert.equal('string', typeof utils.randStr(5));
      assert.equal('string', typeof utils.randStr(5));
      assert.equal('string', typeof utils.randStr(5));
    });

    it('Strong RAND_STR_DICT', () => {
      assert.equal(5, utils.randStr(5, 'strong').length);
      assert.equal('string', typeof utils.randStr(5, 'strong'));
    });

    it('len lt 1', () => {
      assert.equal(3, utils.randStr(-1).length);
    });

    it('type non-exists, type as dist', () => {
      assert.equal(11111, +utils.randStr(5, '1'));
    });
  });

  describe('#ucwords', () => {
    it('value isnt a string', () => {
      assert.equal(123456, utils.ucwords(123456));
    });

    it('normal', () => {
      assert.equal('String', utils.ucwords('string'));
      assert.equal('String', utils.ucwords(String('string')));
    });
  });

  describe('#getModules', () => {
    it('path isnt a string', () => {
      assert.equal(0, utils.getModules(0));
      assert.deepEqual([0], utils.getModules([0]));
    });

    it('path non-exists', () => {
      assert.deepEqual(
        {},
        utils.getModules(`${__dirname}/non-exists-dir`, ['js'], ['index']),
      );
    });

    it('path exists, exclude ', () => {
      assert.deepEqual(
        {
          hello: 'This is a module, name is hello',
          es6Default: 'This is a es6 module, name is es6Default',
          helloWorld: 'This is a module, name is helloWorld',
        },
        utils.getModules(`${__dirname}/dir`, ['js'], ['index']),
      );
    });

    it('path exists, exclude unset ', () => {
      assert.deepEqual(
        {
          hello: 'This is a module, name is hello',
          es6Default: 'This is a es6 module, name is es6Default',
          helloWorld: 'This is a module, name is helloWorld',
          index: 'This is a module, name is index',
        },
        utils.getModules(`${__dirname}/dir`, ['js']),
      );
    });
  });

  describe('#readdir', () => {
    it('path isnt a string', () => {
      try {
        utils.readdir(['hello'], 'js');
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message === 'dir must be a string!');
      }
    });

    it('path not existed', () => {
      try {
        utils.readdir(`${__dirname}/non-exists-dir`);
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message === 'dir not existed!');
      }
    });

    it('path exists, exclude ', () => {
      const actual = _.sortBy(utils.readdir(`${__dirname}/dir`, 'js', 'index'));

      assert.deepEqual(['es6-default', 'hello', 'hello-world'], actual);
    });

    it('path exists, exclude unset ', () => {
      const actual = _.sortBy(utils.readdir(`${__dirname}/dir`, ['js']));
      assert.deepEqual(
        ['es6-default', 'hello', 'hello-world', 'index'],
        actual,
      );
    });
  });

  describe('#isPrivateIp', () => {
    const whiteList = ['192.168.4.115', '192.168.4.114'];

    it('return true', () => {
      assert.equal(true, utils.isPrivateIp('192.168.4.114', whiteList));
      assert.equal(true, utils.isPrivateIp('192.168.4.115', whiteList));
    });

    it('return false', () => {
      assert.equal(false, utils.isPrivateIp('192.168.6.114', whiteList));
      assert.equal(false, utils.isPrivateIp('192.168.6.115', whiteList));
    });

    it('whiteList is null', () => {
      assert.equal(false, utils.isPrivateIp('192.168.6.114'));
    });
  });

  describe('#remoteIp', () => {
    it('connection.remoteAddress exists', () => {
      const req = { connection: { remoteAddress: '58.215.168.153' } };
      const ctx = { req };
      assert.equal('58.215.168.153', utils.remoteIp(ctx));
    });

    it('socket.remoteAddress exists', () => {
      const req = { socket: { remoteAddress: '58.215.168.153' } };
      const ctx = { req };
      assert.equal('58.215.168.153', utils.remoteIp(ctx));
    });

    it('connection.socket.remoteAddress exists', () => {
      const req = {
        connection: { socket: { remoteAddress: '58.215.168.153' } },
      };
      const ctx = { req };
      assert.equal('58.215.168.153', utils.remoteIp(ctx));
    });
  });
  describe('#clientIp', () => {
    it('req.ips exists', () => {
      const req = {
        ips: ['10.0.0.20'],
        connection: { remoteAddress: '58.215.168.153' },
      };
      const ctx = { req };
      assert.deepEqual(['10.0.0.20'], utils.clientIp(ctx));
    });

    it('req.ips non-exists, x-real-ip exists', () => {
      const req = {
        ips: ['10.0.0.30'],
        connection: { remoteAddress: '58.215.168.153' },
      };
      const ctx = { req };
      assert.deepEqual(['10.0.0.30'], utils.clientIp(ctx));
    });

    it('x-forwarded-for non-exists, x-real-ip non-exists', () => {
      const req = {
        connection: { remoteAddress: '58.215.168.153' },
      };
      const ctx = { req };
      assert.equal('58.215.168.153', utils.clientIp(ctx));
    });
  });

  describe('#require', () => {
    it('require non-exists module', () => {
      assert.equal(null, utils.require(`${__dirname}/hello-world`));
    });
  });

  describe('#realIp', () => {
    it('realIp not exist in remoteIp', () => {
      const req = { connection: { remoteAddress: '58.215.168.153' } };
      const ctx = { req };
      assert.equal('58.215.168.153', utils.realIp(ctx, []));
    });

    it('realIp from req.headers[\'x-real-ip\']', () => {
      const req = {
        connection: {
          remoteAddress: '58.215.168.153',
        },
        headers: {
          'x-real-ip': '127.0.0.1',
        },
      };
      const ctx = { req };
      assert.equal('127.0.0.1', utils.realIp(ctx, ['58.215.168.153']));
    });
  });
});
