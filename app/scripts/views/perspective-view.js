// views/perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Common   = require('../lib/common');

module.exports = Backbone.View.extend({

  className: 'viz-content',

  definition: {},

  initialize: function (options) {
    _.assign(this, _.pick(options, 'parties', 'candidates', 'constituencies', 'contestingBodies', 'stats'));
  },

  getDefinition: function () {
    return _.clone(this.definition, true);
  },

  setQuery: function (query) {
    this.query = query;
  },

  /**
   * @abstract
   */
  loadQuery: function (query) {
    this.render();
  },

  /**
   * @abstract
   */
  search: function (searchString) {
  }

});
