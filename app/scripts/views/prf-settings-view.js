// views/prf-settings-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    template = _.template(require('../templates/prf-settings.html'));

module.exports = Backbone.View.extend({

  className: 'viz-settings',

  events: {
    'click .viz-settings-perspectives a': 'clickPerspective',
    'click .viz-settings-sort button':    'sort',
    'click .viz-settings-views button':   'clickView',
    'keyup .viz-settings-search input':   'search',
    'change .viz-settings-search input':  'search'
  },

  initialize: function(options) {
    this.$el.html(template());
  },

  render: function () {
    return this;
  },

  clickPerspective: function (event) {
    event.preventDefault();
  },

  clickView: function (event) {
    event.preventDefault();

    // Set query
    let viewAttribute = $(event.currentTarget).data('value');
    router.setQuery({ view: viewAttribute });
  },

  sort: function (event) {
    let sortAttribute = $(event.currentTarget).data('value');
    router.setQuery({ sort: sortAttribute });
  },

  search: function (event) {
    this.trigger('search', $(event.currentTarget).val());
  },

  toggleSortButtons: function (show) {
    this.$('.viz-settings-sort').toggle(show);
  }

});
