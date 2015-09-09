// routers/prf-router.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    URL      = require('url'),
    Common   = require('../lib/common');

let Router = Backbone.Router.extend({

  query: {},

  routes: {
    'faces(?*query)':   'faces',
    'parties(?*query)': 'parties',
    'candidates/:id':   'candidates',
    '*invalid':         'invalid'
  },

  execute: function (callback, args, name) {
    let perspective = name;
    if (_.indexOf(['faces', 'parties', 'candidates'], perspective) == -1) 
      return this.navigate('faces', { trigger: true });

    // Check for perspective change
    let perspectiveChanged = (this.perspective != perspective);
    this.prevPerspective = this.perspective;
    this.perspective = perspective;

    // Parse query
    this.parseQuery();
    
    // Update query
    if (perspective == 'faces') {
      this.query = _.chain(this.query).
        pick('sort').
        defaults({ sort: 'name' }).
        value();
    } else if (perspective == 'parties') {
      if (this.query.view == 'tweets') {
        this.query = _.pick(this.query, 'view');
      } else {
        this.query = { view: 'teams' };
      }
    } else {
      this.query = {};
    }

    // Don't trigger 'didUpdateQuery' if perspective is changed
    this.updateFragmentQuery({ silent: perspectiveChanged });

    Backbone.Router.prototype.execute.apply(this, arguments);
  },

  getFragment: function () {
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
    this.navigate(this.getFragment() + queryString, { replace: true });
  }

});

module.exports = new Router();
