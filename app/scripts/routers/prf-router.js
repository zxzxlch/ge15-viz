// routers/prf-router.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    URL      = require('url'),
    Common   = require('../lib/common');

let Router = Backbone.Router.extend({

  routes: {
    '':                   'root',
    'facewall(?*query)':  'faces',
    'wards(?*query)':     'wards'
  },

  setQuery: function (query) {
    let [fragment, currentQuery] = window.location.hash.split('?');
    // Remove #
    if (fragment) fragment = fragment.slice(1);

    let newQuery;

    if (currentQuery) {
      currentQuery = Common.parseQueryString(currentQuery);

      // Check that query is not already in url
      let different = _.chain(query).
        keys().
        any(key => {
          return currentQuery[key] != query[key];
        }).
        value();

      if (!different) return;

      // Merge into old query
      newQuery = _.extend(currentQuery, query);
    } else {
      newQuery = query;
    }

    // Update query
    let urlObj = URL.parse('')
    urlObj.query = newQuery;
    let queryString = urlObj.format();

    this.navigate(fragment + queryString, { trigger: true });
  }

});

module.exports = new Router();
