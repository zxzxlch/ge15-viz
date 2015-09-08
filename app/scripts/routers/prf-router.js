// routers/prf-router.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    URL      = require('url'),
    Common   = require('../lib/common');

let Router = Backbone.Router.extend({

  query: {},

  routes: {
    '':               'root',
    'faces(?*query)': 'faces',
    'wards(?*query)': 'wards',
    '*unknown'      : 'root'
  },

  execute: function () {
    let perspective = this.getPerspective();
    if (perspective == '') 
      return this.navigate('faces', { trigger: true });

    // Parse query
    this.parseQuery();
    
    // Update query
    if (perspective == 'faces') {
      if (this.query.view == 'teams') {
        this.query = _.pick(this.query, 'view');
      } else {
        this.query = _.chain(this.query).
          pick('view', 'sort').
          defaults({
            view: 'default',
            sort: 'name'
          }).
          value();
      }
    }

    this.updateFragmentQuery({ silent: true });

    Backbone.Router.prototype.execute.apply(this, arguments);
  },

  getPerspective: function () {
    return Backbone.history.getFragment().split('?')[0];
  },

  setQueryValue: function (key, value) {
    // Check for change in value
    if (this.query[key] == value) return;
    this.query[key] = value;

    this.updateFragmentQuery();
  },

  parseQuery: function () {
    let queryString = Backbone.history.getFragment().split('?')[1];
    if (!queryString) return this.query = {};
    this.query = Common.parseQueryString(queryString);
  },

  updateFragmentQuery: function (options) {
    if (!options) options = {};

    let queryString = Common.formatQueryString(this.query);
    this.trigger('didUpdateQuery', this.query);
    this.navigate(this.getPerspective() + queryString, { trigger: !options.silent });
  }

});

module.exports = new Router();
