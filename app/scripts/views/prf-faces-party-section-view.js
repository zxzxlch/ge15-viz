// views/prf-faces-party-section-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    template = _.template(require('../templates/prf-faces-party-section.html'));

module.exports = Backbone.View.extend({

  className: 'party-section',

  initialize: function(options) {
  },

  render: function () {
    this.$el.html(template({ party: this.model }));

    // Render candidates
    let candidateViews = this.model.candidates.map(candidate => candidate.view.render().el);
    this.$('.party-section-candidates').html(candidateViews);

    return this;
  }

});
