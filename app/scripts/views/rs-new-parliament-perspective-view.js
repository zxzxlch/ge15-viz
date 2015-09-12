// views/rs-new-parliament-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Common         = require('../lib/common'),
    CandidateView  = require('../views/prf-candidate-view'),
    template = _.template(require('../templates/rs-new-parliament.html'));

module.exports = Backbone.View.extend({

  className: 'viz-content viz-rs-parliament',

  initialize: function (options) {
    _.assign(this, _.pick(options, 'parties', 'candidates'));

    // Divide won and lost candidates
    this.candidateGroups = _.chain(this.parties.models).
      map(party => party.candidates.models).
      flatten().
      each(candidate => candidate.view = new CandidateView({ model: candidate }).render()).
      groupBy(candidate => candidate.team.get('won') ? 'won' : 'lost').
      value();

    this.render();
  },

  render: function () {
    this.$el.html(template());

    let $wonCandidates = _.pluck(this.candidateGroups.won, 'view.el');
    this.$('.section-won .candidates-group').html($wonCandidates);

    let $lostCandidates = _.pluck(this.candidateGroups.lost, 'view.el');
    this.$('.section-lost .candidates-group').html($lostCandidates);

    return this;
  },

  routerDidUpdateQuery: function () {
    this.render();
  },

  search: function (searchString) {
    this.candidates.each(candidate => {
      candidate.view.$el.toggleClass('hide', candidate.get('filtered'));
    });
  }

});
