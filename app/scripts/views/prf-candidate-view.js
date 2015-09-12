// views/prf-candidate-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    template = _.template(require('../templates/prf-candidate-face.html'));

module.exports = Backbone.View.extend({

  className: 'candidate-face candidate-face-grid',

  initialize: function(options) {
    // Tooltip
    this.$el.
      attr('data-toggle', 'tooltip').
      attr('title', this.model.get('name'));

    // Use jQuery loaded from page with Bootstrap
    jQuery(this.el).tooltip({ placement:  'bottom' });
  },

  render: function () {
    this.$el.html(template({
      candidate: this.model
    }));
    return this;
  }

});
