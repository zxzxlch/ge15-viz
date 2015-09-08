// routers/prf-router.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    URL      = require('url'),
    Common   = require('../lib/common');

let Router = Backbone.Router.extend({

  query: {},

  routes: {
    'faces(?*query)': 'faces',
    'parties(?*query)': 'parties'
  },

  execute: function () {
    let perspective = this.getFragmentPerspective();
    if (perspective == '') 
      return this.navigate('faces', { trigger: true });

    // Check for perspective change
    let perspectiveChanged = (this.perspective != perspective);
    this.perspective = perspective;

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
    } else if (perspective == 'parties') {
      this.query = {};
    }

    // Don't trigger 'didUpdateQuery' if perspective is changed
    this.updateFragmentQuery({ silent: perspectiveChanged });

    Backbone.Router.prototype.execute.apply(this, arguments);
  },

  getFragmentPerspective: function () {
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
    if (!options.silent) this.trigger('didUpdateQuery', this.query);
    this.navigate(this.perspective + queryString, { trigger: false });
  }

});

module.exports = new Router();
