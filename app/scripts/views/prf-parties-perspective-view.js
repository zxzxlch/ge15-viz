// views/prf-parties-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    PerspectiveView           = require('../views/perspective-view'),
    CandidateView             = require('../views/candidate-view'),
    TweetsPartySectionView    = require('../views/prf-tweets-party-section-view'),
    TeamsPartySectionView     = require('../views/prf-teams-party-section-view'),
    DiversityPartySectionView = require('../views/prf-diversity-party-section-view');


module.exports = PerspectiveView.extend({

  className: 'viz-content viz-profiles-parties',

  definition: {
    id:        'parties',
    label:     'Parties',
    search:    false,
    views: [{
      id:     'teams',
      label:  'Teams',
      search: true,
      sorts:  false
    }, {
      id:    'tweets',
      label: 'Tweets',
      sorts: false
    }, {
      id:    'diversity',
      label: 'Diversity',
      sorts: [{
        id:    'gender',
        label: 'Gender',
      }, {
        id:    'minorities',
        label: 'Minorities',
      }]
    }]
  },

  initialize: function (options) {
    PerspectiveView.prototype.initialize.apply(this, arguments);

    // Set view for each candidate model
    this.candidateViews = this.candidates.map((model) => {
      let view = new CandidateView({ model: model, grid: true });
      model.view = view;
      return view;
    });
  },

  loadQuery: function (options) {
    _.assign(this, _.pick(options, 'view', 'sort'));

    if (this.view == 'teams') {
      this.renderTeamsView();
    } else if (this.view == 'tweets') {
      this.renderTweetsView();
    } else if (this.view == 'diversity') {
      this.renderDiversityView();
    }
  },

  renderTweetsView: function () {
    let $parties = _.map(this.parties.models, party => {
      return new TweetsPartySectionView({ model: party }).el;
    });
    this.$el.html($parties);
  },

  renderTeamsView: function () {
    let partySectionViews = _.chain(this.parties.models).
      map(party => new TeamsPartySectionView({ model: party })).
      filter(partyView => !partyView.isFiltered()).
      map(partyView => partyView.render().el).
      value();
    this.$el.html(partySectionViews);
  },

  renderDiversityView: function () {
    let partySectionViews = _.chain(this.parties.models).
      map(party => new DiversityPartySectionView({ model: party, sort: this.sort })).
      sortByOrder('diverseRatio', 'desc').
      map(partyView => partyView.render().el).
      value();
    this.$el.html(partySectionViews);
  },

  search: function (searchString) {
    if (this.view == 'teams')
      this.renderTeamsView();
  }

});
