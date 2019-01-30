const assert = require('assert');
const _ = require('lodash');
const axios = require('axios');
const rest = require('../');
const U = require('../lib/utils');


function throwNextTick(error) {
  process.nextTick(() => {
    throw error;
  });
}

/* global describe it */
describe('integrate', () => {
  describe('#un-init', () => {
    it('check type', (done) => {
      assert.ok(rest instanceof Object);
      assert.ok(rest.start instanceof Function);
      assert.ok(rest.plugin instanceof Function);
      assert.equal(rest.plugin(), rest);
      assert.equal(U, rest.utils);
      assert.ok(rest.Router);
      assert.ok(rest.helper);
      assert.ok(rest.koa);
      done();
    });

    it('uncaughtException', (done) => {
      const error = new Error('Hello this is a uncaught expection.');

      const originalException = process.listeners('uncaughtException').pop();
      process.removeListener('uncaughtException', originalException);
      process.once('uncaughtException', (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Hello this is a uncaught expection.', err.message);
      });

      throwNextTick(error);

      process.nextTick(() => {
        process.listeners('uncaughtException').push(originalException);
        done();
      });
    });
    it('rejectionHandled', (done) => {
      const errorLog = rest.utils.logger.error;
      rest.utils.logger.error = (error) => {
        assert.ok(error instanceof Error);
        assert.equal('Hello this is a unregist rejection', error.message);
        rest.utils.logger.error = errorLog;
        done();
      };

      const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(Error('Hello this is a unregist rejection'));
        }, 10);
      });

      setTimeout(() => {
        promise.then(() => {
          /* eslint no-console: 0 */
          console.log('Dont run here!');
        });
      }, 10);
    });

    it('unhandleRejection', (done) => {
      const errorLog = rest.utils.logger.error;
      rest.utils.logger.error = (error) => {
        assert.ok(error instanceof Error);
        assert.equal('Hello this is a unregist rejection', error.message);
        rest.utils.logger.error = errorLog;
        done();
      };

      const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(Error('Hello this is a unregist rejection'));
        }, 10);
      });
      promise.then(() => {
        /* eslint no-console: 0 */
        console.log('Dont run here!');
      });
    });

    it('attach object check', () => {
      const attachs = ['Router', 'helper', 'utils', 'koa'];
      _.each(attachs, (x) => {
        assert.ok(rest[x]);
      });
    });
  });
  describe('#inited', () => {
    it('default', (done) => {
      rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);
        server.close();
        done();
      });
    });

    it('request home /', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);
        axios
          .get('http://127.0.0.1:8080/')
          .then((response) => {
            try {
              assert.equal(200, response.status);
              assert.equal('OK', response.statusText);
              assert.equal(
                'text/plain; charset=utf-8',
                response.headers['content-type'],
              );
              assert.equal('Hello world, I am tea-rest.', response.data);
            } catch (e) {
              return done(e);
            }
            listen.close();
            return done();
          })
          .catch(() => {
            listen.close();
            done();
          });
      });
    });

    it('request home /json', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);
        axios
          .get('http://127.0.0.1:8080/json')
          .then((response) => {
            try {
              assert.equal(200, response.status);
              assert.equal('OK', response.statusText);
              assert.equal(
                'application/json; charset=utf-8',
                response.headers['content-type'],
              );
              assert.equal('Hello world, I am tea-rest.', response.data.message);
            } catch (e) {
              return done(e);
            }
            listen.close();
            return done();
          })
          .catch(() => {
            listen.close();
            done();
          });
      });
    });

    it('request home / middleWareThrowError', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);

        axios
          .get('http://127.0.0.1:8080?middleWareThrowError=yes')
          .catch((err) => {
            assert.equal(500, err.response.status);
            assert.equal('Internal Server Error', err.response.statusText);
            assert.equal('Sorry, there are some errors in middle-ware.', err.response.data.message);
            assert.equal('Sorry, there are some errors in middle-ware.', err.response.data.data);
            listen.close();
            done();
          });
      });
    });

    it('request /unexpetion', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);

        axios.get('http://127.0.0.1:8080/unexception').catch((err) => {
          assert.equal(500, err.response.status);
          assert.equal('Internal Server Error', err.response.statusText);
          assert.deepEqual(
            {
              status: 'error',
              data: 'Ooh, there are some errors in unexception.',
              message: 'Ooh, there are some errors in unexception.',
            },
            err.response.data,
          );
          listen.close();
          done();
        });
      });
    });

    it('request /abc not found', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);

        axios.get('http://127.0.0.1:8080/abc').catch((err) => {
          assert.equal(404, err.response.status);
          assert.equal('Not Found', err.response.statusText);
          assert.deepEqual({
            status: 'fail',
            code: 'UNKNOWN_ENDPOINT',
            message: 'The requested endpoint does not exist.',
          }, err.response.data);
          listen.close();
          done();
        });
      });
    });

    it('request /params no query', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);

        axios.get('http://127.0.0.1:8080/params').then((response) => {
          assert.equal(200, response.status);
          assert.equal('OK', response.statusText);
          assert.deepEqual({
            status: 'success',
            data: {},
            message: null,
          }, response.data);
          listen.close();
          done();
        });
      });
    });

    it('request /params with query', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);

        axios.get('http://127.0.0.1:8080/params?a=1&b=2').then((response) => {
          assert.equal(200, response.status);
          assert.equal('OK', response.statusText);
          assert.deepEqual({
            status: 'success',
            data: {
              a: 1,
              b: 2,
            },
            message: null,
          }, response.data);
          listen.close();
          done();
        });
      });
    });

    it('request /body no body', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);

        axios.post('http://127.0.0.1:8080/body').then((response) => {
          assert.equal(200, response.status);
          assert.equal('OK', response.statusText);
          assert.deepEqual({
            status: 'success',
            data: {},
            message: null,
          }, response.data);
          listen.close();
          done();
        });
      });
    });

    it('request /body with body', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);

        axios.post('http://127.0.0.1:8080/body', { a: 1, b: 2 }).then((response) => {
          assert.equal(200, response.status);
          assert.equal('OK', response.statusText);
          assert.deepEqual({
            status: 'success',
            data: {
              a: 1,
              b: 2,
            },
            message: null,
          }, response.data);
          listen.close();
          done();
        });
      });
    });

    it('request /body with body and query', (done) => {
      const listen = rest.start(`${__dirname}/app`, (server) => {
        assert.ok(server);

        axios.post('http://127.0.0.1:8080/body?a=1&b=2', { a: 3, c: 4 }).then((response) => {
          assert.equal(200, response.status);
          assert.equal('OK', response.statusText);
          assert.deepEqual({
            status: 'success',
            data: {
              a: 3,
              b: 2,
              c: 4,
            },
            message: null,
          }, response.data);
          listen.close();
          done();
        });
      });
    });
  });
});
