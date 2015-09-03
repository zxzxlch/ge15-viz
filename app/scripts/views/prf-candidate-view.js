// views/prf-candidate-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    template = _.template(require('../templates/prf-candidate-face.html'));

module.exports = Backbone.View.extend({

  initialize: function(options) {
    this.$el.attr('class', 'candidate candidate-face');
  },

  render: function () {
    this.$el.html(template({
      model: this.model
    }));
    return this;
  }

});
