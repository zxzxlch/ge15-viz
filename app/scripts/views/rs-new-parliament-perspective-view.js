// views/rs-new-parliament-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Common         = require('../lib/common'),
    PerspectiveView = require('../views/perspective-view'),
    CandidateView  = require('../views/prf-candidate-view'),
    vizSectionTmpl = _.template(require('../templates/viz-section.html'));

module.exports = PerspectiveView.extend({

  className: 'viz-content viz-rs-parliament',

  definition: {
    id:        'parliament',
    label:     'New parliament',
    search:    true
  },

  initialize: function (options) {
    PerspectiveView.prototype.initialize.apply(this, arguments);

    // Divide won and lost candidates
    this.candidateGroups = _.chain(this.parties.models).
      map(party => party.candidates.models).
      flatten().
      each(candidate => candidate.view = new CandidateView({ model: candidate, grid: true }).render()).
      groupBy(candidate => candidate.team.get('won') ? 'won' : 'lost').
      value();

    this.render();
  },

  render: function () {
    let $wonSection = $(vizSectionTmpl({
      title: 'The new parliament',
      description: 'These are the candidates who were voted into parliament.'
    }));

    $wonSection.find('.content').
      addClass('candidates-group').
      html(_.pluck(this.candidateGroups.won, 'view.el'));

    let $lostSection = $(vizSectionTmpl({
      title: 'Candidates who lost',
      description: ''
    }));

    $lostSection.find('.content').
      addClass('candidates-group').
      html(_.pluck(this.candidateGroups.lost, 'view.el'));

    this.$el.html([$wonSection, $lostSection]);

    return this;
  },

  search: function (searchString) {
    this.candidates.each(candidate => {
      candidate.view.$el.toggleClass('hide', candidate.get('filtered'));
    });
  }

});
