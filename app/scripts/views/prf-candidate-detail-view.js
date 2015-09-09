// views/prf-candidate-detail-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    _s       = require('underscore.string'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    template = _.template(require('../templates/prf-candidate-detail.html'));

module.exports = Backbone.View.extend({

  className: 'viz-content viz-profiles-candidate',

  initialize: function(options) {
    this.render();

    // Scroll into view after switching perspective
    if (router.prevPerspective != 'candidates')
      $(document).scrollTop($('.viz').offset().top);
  },

  render: function () {
    // Format links
    let links = _.chain(this.model.get('links')).
      mapKeys((url, label) => {
        switch (label) {
          case 'partyProfile':
            return url.replace(/^https?:\/+/, '');
        }
        return _s.capitalize(label);
      }).
      value();

    this.$el.html(template(_.extend({ links }, {
      candidate: this.model
    })));
    return this;
  }

});
