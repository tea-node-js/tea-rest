module.exports = (r) => {
  r.get('/', 'home#index');
  r.get('/json', 'home#json');
  r.get('/unexception', 'home#unexception');
  r.get('/params', 'home#params');
  r.post('/body', 'home#body');
  return r;
};
