// views/prf-parties-party-section-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    template = _.template(require('../templates/prf-parties-party-section.html'));

module.exports = Backbone.View.extend({

  className: 'party-section',

  initialize: function(options) {
    this.render();
  },

  render: function () {
    this.$el.html(template({ party: this.model }));

    // Render tweets
    this.$('.party-section-tweets').html('Tweets');

    return this;
  }

});
