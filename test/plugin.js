const assert = require('assert');
const rest = require('../');

/* global describe it */
describe('plugin', () => {
  it('normal', (done) => {
    let count = 2;

    const plugin1 = (teaRest, path) => {
      assert.equal(rest, teaRest);
      assert.equal(`${__dirname}/app`, path);
      assert.equal(2, count);
      count -= 1;
    };

    const plugin2 = (teaRest, path) => {
      assert.equal(rest, teaRest);
      assert.equal(`${__dirname}/app`, path);
      assert.equal(1, count);
      count -= 1;
    };

    rest
      .plugin(plugin1, plugin2)
      .start(`${__dirname}/app`, (server) => {
        assert.ok(server);
        assert.equal(0, count);
        server.close();
        done();
      });
  });
});
