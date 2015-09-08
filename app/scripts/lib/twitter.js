// lib/twitter.js

let Q = require('q');

let twitterPromise = function (tt) {
  let deferred = Q.defer();
  tt.ready(function (tt) {
    deferred.resolve(tt);
  });
  return deferred.promise;
}(window.twttr);

module.exports = {

  ready: function (callback) {
    twitterPromise.then(function (tt) {
      callback(tt);
    });
  }

};
