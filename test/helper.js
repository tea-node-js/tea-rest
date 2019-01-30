const assert = require('assert');
const helper = require('../lib/helper');

/* global describe it */
describe('lib/utils', () => {
  describe('console', () => {
    /* eslint no-underscore-dangle: 0 */
    /* eslint no-console: 0 */
    it('console.log', () => {
      const _log = console.log;
      const log = helper.console.log('hello', 'world');

      console.log = (arg1, arg2) => {
        assert.equal('hello', arg1);
        assert.equal('world', arg2);
      };

      log(null, () => {
        console.log = _log;
      });
    });

    it('console.info', () => {
      const _log = console.info;
      const log = helper.console.info('hello', 'world');

      console.info = (arg1, arg2) => {
        assert.equal('hello', arg1);
        assert.equal('world', arg2);
      };

      log(null, () => {
        console.info = _log;
      });
    });

    it('console.error', () => {
      const _log = console.error;
      const log = helper.console.error('hello', 'world');

      console.error = (arg1, arg2) => {
        assert.equal('hello', arg1);
        assert.equal('world', arg2);
      };

      log(null, () => {
        console.error = _log;
      });
    });

    it('console.warn', () => {
      const _log = console.warn;
      const log = helper.console.warn('hello', 'world');

      console.warn = (arg1, arg2) => {
        assert.equal('hello', arg1);
        assert.equal('world', arg2);
      };

      log(null, () => {
        console.warn = _log;
      });
    });

    it('console.time', () => {
      const _log = console.time;
      const log = helper.console.time('hello');

      console.time = (arg1) => {
        assert.equal('hello', arg1);
      };

      log(null, () => {
        console.error = _log;
      });
    });

    it('console.timeEnd', () => {
      const _log = console.timeEnd;
      const log = helper.console.timeEnd('hello');

      console.timeEnd = (arg1) => {
        assert.equal('hello', arg1);
      };

      log(null, () => {
        console.timeEnd = _log;
      });
    });
  });
});
