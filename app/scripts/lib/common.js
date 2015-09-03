// lib/common.js

var URL = require('url');

module.exports = {

  parseQueryString: function (queryString) {
    if (!queryString) return null;
    return URL.parse('?' + queryString, true).query;
  }

};
