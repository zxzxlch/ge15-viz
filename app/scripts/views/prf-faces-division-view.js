// views/prf-faces-division-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    template = _.template(require('../templates/prf-faces-division.html'));

module.exports = Backbone.View.extend({

  className: 'faces-division',

  initialize: function(options) {
    this.candidates = options.candidates;
    this.division = options.division;
    this.$el.html(template({ division: this.division }));
  },

  render: function () {
    this.$('.candidates-group').html(_.map(this.candidates, (candidate) => candidate.view.render().el));
    return this;
  }

});
