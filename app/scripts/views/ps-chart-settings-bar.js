// views/ps-chart-settings-bar.js

let $        = require('jquery');
let _        = require('underscore');
let d3       = require('d3');
let Backbone = require('backbone');
let template = _.template(require('../templates/ps-settings.html'));

module.exports = Backbone.View.extend({

  className: 'viz-settings',

  events: {
    'click .settings-link': 'didClickMenuItem'
  },


  initialize: function(options) {
    this.delegateEvents();
    this.$el.html(template());
  },


  didClickMenuItem: function(event) {
    event.preventDefault();

    let $menuItem = $(event.currentTarget);
    if ($menuItem.hasClass('active')) { return; }

    // Set active only for clicked item
    $menuItem.siblings().removeClass('active');
    $menuItem.addClass('active');

    this.trigger('settingsDidChange', this);
  },


  getSortAttribute: function() {
    return this.$('.viz-settings-sort .settings-link.active').data('value');
  },


  getGroupAttribute: function() {
    return this.$('.viz-settings-group .settings-link.active').data('value');
  }

});
