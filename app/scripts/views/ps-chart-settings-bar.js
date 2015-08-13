// views/ps-chart-settings-bar.js

let $        = require('jquery');
let _        = require('underscore');
let d3       = require('d3');
let Backbone = require('backbone');
let template = _.template(require('../templates/chart-settings-bar.html'));

module.exports = Backbone.View.extend({

  events: {
    'click .dropdown-menu a': 'didClickMenuItem'
  },


  initialize: function(options) {
    this.$el.html(template());
  },


  didClickMenuItem: function(event) {
    event.preventDefault();

    let $menuItem = $(event.currentTarget).parent();
    if ($menuItem.hasClass('disabled')) { return; }

    // Set disabled only for clicked item
    let $dropdown = $('.dropdown').has($menuItem);
    $dropdown.find('.dropdown-menu li').removeClass('disabled');
    $menuItem.addClass('disabled');

    // Update dropdown label
    let label = $menuItem.text();
    $dropdown.find('.dropdown-toggle .selected-attribute').html(label);

    this.trigger('settingsDidChange', this);
  },


  getSortAttribute: function() {
    return this.$('.sort-dropdown .dropdown-menu li.disabled a').data('value');
  },


  getGroupAttribute: function() {
    return this.$('.group-dropdown .dropdown-menu li.disabled a').data('value');
  }

});
