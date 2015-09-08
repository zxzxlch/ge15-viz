// views/prf-parties-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    CandidateView  = require('../views/prf-candidate-view'),
    TweetsPartySectionView  = require('../views/prf-tweets-party-section-view'),
    TeamsPartySectionView = require('../views/prf-teams-party-section-view');

module.exports = Backbone.View.extend({

  className: 'viz-content viz-profiles-parties',

  initialize: function (options) {
    _.assign(this, _.pick(options, 'candidates', 'parties'));

    // Set view for each candidate model
    this.candidateViews = this.candidates.map((model) => {
      let view = new CandidateView({ model: model });
      model.view = view;
      return view;
    });

    this.render();
  },

  render: function () {
    if (router.query.view == 'tweets') {
      this.renderTweetsView();
    } else {
      this.renderTeamsView();
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

  routerDidUpdateQuery: function () {
    this.render();
  },

  search: function (searchString) {
    this.render();
  }

});
