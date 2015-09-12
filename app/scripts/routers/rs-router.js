// routers/rs-router.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    URL      = require('url'),
    Common   = require('../lib/common');

let Router = Backbone.Router.extend({

  query: {},

  routes: {
    'parliament(?*query)': 'parliament',
    'voteshare(?*query)':  'voteshare',
    'candidates/:id':      'candidates',
    '*invalid':            'invalid'
  },

  execute: function (callback, args, name) {
    let perspective = name;
    if (_.indexOf(['parliament', 'voteshare', 'candidates'], perspective) == -1) 
      return this.navigate('parliament', { trigger: true });

    // Check for perspective change
    let perspectiveChanged = (this.perspective != perspective);
    this.prevPerspective = this.perspective;
    this.perspective = perspective;

    // Parse query
    this.parseQuery();

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

    let options = { changed: {} };
    options.changed[key] = value;
    this.updateFragmentQuery(options);
  },

  parseQuery: function () {
    let queryString = Backbone.history.getFragment().split('?')[1];
    if (!queryString) return this.query = {};
    this.query = Common.parseQueryString(queryString);
  },

  updateFragmentQuery: function (options) {
    if (!options) options = {};
    
    // Parse query
    // Parliament
    if (this.perspective == 'parliament') {
      this.query = {};
    }
    // Voteshare
    else if (this.perspective == 'voteshare') {
      if (this.query.view == 'wards') {
        this.query = _.pick(this.query, 'view', 'sort');
        _.defaults(this.query, { sort: 'numVoters' });
      }
      else if (this.query.view == 'parties') {
        this.query = _.pick(this.query, 'view', 'sort');
        _.defaults(this.query, { sort: 'totalVotes' });
      }
    }
    else {
      this.query = {};
    }

    let queryString = Common.formatQueryString(this.query);
    if (!options.silent) this.trigger('didUpdateQuery', options);
    this.navigate(this.getFragment() + queryString, { replace: true });
  }

});

module.exports = new Router();
