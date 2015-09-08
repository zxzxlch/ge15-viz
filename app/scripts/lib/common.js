// lib/common.js

var URL = require('url');

module.exports = {

  parseQueryString: function (queryString) {
    if (!queryString) return null;
    return URL.parse('?' + queryString, true).query;
  },

  formatQueryString: function (queryObj) {
    let url = URL.parse('')
    url.query = queryObj;
    return url.format();
  }

};
