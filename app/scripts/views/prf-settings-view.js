// views/prf-settings-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    template = _.template(require('../templates/prf-settings.html'));

module.exports = Backbone.View.extend({

  className: 'viz-settings',

  events: {
    'click .viz-settings-sort button': 'sort'
  },

  initialize: function(options) {
    this.$el.html(template());
  },

  render: function () {
    return this;
  },

  sort: function (event) {
    let sortAttribute = $(event.currentTarget).data('value');
    router.setQuery({ sort: sortAttribute });
  }

});
