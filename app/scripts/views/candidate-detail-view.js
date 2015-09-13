// views/candidate-detail-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    _s       = require('underscore.string'),
    Backbone = require('backbone'),
    Common   = require('../lib/common'),
    template = _.template(require('../templates/prf-candidate-detail.html'));

module.exports = Backbone.View.extend({

  className: 'viz-content viz-detail-candidate',

  initialize: function(options) {
    _.assign(this, _.pick(options, 'candidates'));
    
    this.render();

    // Scroll into view after switching perspective
    if (options.scrollToTop)
      $(document).scrollTop($('.viz').offset().top);
  },

  render: function () {
    // Format links
    let links = _.chain(this.model.get('links')).
      mapKeys((url, label) => {
        switch (label) {
          case 'partyProfile':
            return url.replace(/^https?:\/+/, '');
          case 'cvUrl':
            return 'C.V.';
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
