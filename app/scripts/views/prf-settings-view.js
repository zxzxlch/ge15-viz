// views/prf-settings-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    template = _.template(require('../templates/prf-settings.html'));

module.exports = Backbone.View.extend({

  className: 'viz-settings',

  events: {
    'click .viz-settings-perspective a': 'setPerspective',
    'click .viz-settings-sort a':         'setSort',
    'click .viz-settings-view a':         'setView',
    'keyup .viz-settings-search input':   'search',
    'change .viz-settings-search input':  'search'
  },

  initialize: function(options) {
    this.$el.html(template());
  },

  render: function () {
    return this;
  },

  updateSettings: function () {
    // Faces
    if (router.perspective == 'faces') {
      this.setActive('perspective', 'faces');
      this.toggleGroupDisplay('view', true);
      
      if (router.query.view == 'teams') {
        this.toggleGroupDisplay('sort', false);
        this.setActive('view', 'teams');
      } else {
        this.toggleGroupDisplay('sort', true);
        this.setActive('view', 'default');
        var sortValue = router.query.sort || 'name';
        this.setActive('sort', sortValue);
      }
    } 
    // Parties
    else if (router.perspective == 'parties') {
      this.setActive('perspective', 'parties');
      this.toggleGroupDisplay('view', false);
      this.toggleGroupDisplay('sort', false);
    }
  },

  setPerspective: function (event) {
    // event.preventDefault();
  },

  setActive: function (group, value) {
    _.each(this.$(`.viz-settings-${group} .settings-link`), elem => {
      $(elem).toggleClass('active', $(elem).data('value') == value);
    });
  },

  setView: function (event) {
    event.preventDefault();
    router.setQueryValue('view', $(event.currentTarget).data('value'));
  },

  setSort: function (event) {
    event.preventDefault();
    router.setQueryValue('sort', $(event.currentTarget).data('value'));
  },

  search: function (event) {
    this.trigger('search', $(event.currentTarget).val());
  },

  toggleGroupDisplay: function (group, show) {
    this.$('.viz-settings-' + group).toggle(show);
  }

});
