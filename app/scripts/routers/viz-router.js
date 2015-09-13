// routers/viz-router.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    URL      = require('url'),
    Common   = require('../lib/common');

let Router = Backbone.Router.extend({

  query: {},

  routes: {
    ':detail/:id': 'detail',
    ':perspective(?*query)': 'perspective',
    '': 'perspective'
  },

  getFragment: function () {
    return Backbone.history.getFragment().split('?')[0];
  },

  setFragmentQuery: function (query) {
    let queryString = Common.formatQueryString(query);
    this.navigate(this.getFragment() + queryString);
  },

  /**
   * Convert query portion of fragment to object
   */
  parseQuery: function () {
    let queryString = Backbone.history.getFragment().split('?')[1];
    if (!queryString) return this.query = {};
    return Common.parseQueryString(queryString);
  }

});

module.exports = new Router();
