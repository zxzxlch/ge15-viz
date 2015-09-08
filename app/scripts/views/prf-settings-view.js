// views/prf-settings-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    template = _.template(require('../templates/prf-settings.html'));

module.exports = Backbone.View.extend({

  className: 'viz-settings',

  events: {
    'click .viz-settings-perspectives a': 'setPerspective',
    'click .viz-settings-sort a':         'setSort',
    'click .viz-settings-view a':         'setView',
    'keyup .viz-settings-search input':   'search',
    'change .viz-settings-search input':  'search'
  },

  initialize: function(options) {
    this.$el.html(template());
    this.listenTo(router, 'didUpdateQuery', this.updateSettings);
  },

  render: function () {
    return this;
  },

  updateSettings: function (query) {
    // Perspective
    let perspective = router.getPerspective();
    if (perspective == 'faces') {
      if (query.view == 'teams') {
        this.toggleSortButtons(false);
        this.setActive('view', 'teams');
      } else {
        this.toggleSortButtons(true);
        this.setActive('view', 'default');
        var sortValue = query.sort || 'name';
        this.setActive('sort', sortValue);
      }
    }
  },

  setPerspective: function (event) {
    event.preventDefault();
  },

  setActive: function (group, value) {
    _.each(this.$(`.viz-settings-${group} .settings-link`), elem => {
      $(elem).toggleClass('active', $(elem).data('value') == value);
    });
  },

  setView: function (event) {
    event.preventDefault();

    // Set query
    router.setQueryValue('view', $(event.currentTarget).data('value'));
  },

  setSort: function (event) {
    event.preventDefault();
    
    // Set query
    router.setQueryValue('sort', $(event.currentTarget).data('value'));
  },

  search: function (event) {
    this.trigger('search', $(event.currentTarget).val());
  },

  toggleSortButtons: function (show) {
    this.$('.viz-settings-sort').toggle(show);
  }

});