// views/prf-teams-division-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    template = _.template(require('../templates/prf-teams-division.html'));

module.exports = Backbone.View.extend({

  className: 'party-division',

  initialize: function(options) {
    this.candidates = options.candidates;
    this.division = options.division;
    this.$el.html(template({
      division: this.division,
      description: _.pluck(this.candidates, 'attributes.name').join(' &bull; ')
    }));
  },

  render: function () {
    // Hide if all candidates are filtered
    let hide = _.every(this.candidates, candidate => candidate.get('filtered'));
    this.$el.toggleClass('hide', hide);

    // Render candidate views
    let candidateViews = _.map(this.candidates, candidate => {
      let $view = candidate.view.render().$el;
      // Dim candidate if filt$ered
      $view.toggleClass('dim', candidate.get('filtered'));
      return $view;
    });

    this.$('.candidates-group').html(candidateViews);
    return this;
  }

});
