// views/prf-faces-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    CandidateView  = require('../views/prf-candidate-view'),
    FacesPartySectionView = require('../views/prf-faces-party-section-view');

module.exports = Backbone.View.extend({

  className: 'viz-content viz-profiles-face',

  initialize: function (options) {
    _.assign(this, _.pick(options, 'candidates', 'parties'));

    // Set view for each candidate model
    this.candidateViews = this.candidates.map((model) => {
      let view = new CandidateView({ model: model });
      model.view = view;
      return view;
    });

    // Router events
    this.listenTo(router, 'didUpdateQuery', this.routerDidUpdateQuery);

    this.render();
  },

  render: function () {
    if (router.query.view == 'teams') {
      this.renderTeamsView();
    }
    else {
      this.renderDefaultView();
    }
  },

  renderDefaultView: function () {
    // Get candidate views from parties
    let sortedCandidateViews;

    if (router.query.sort == 'party') {
      // Get candidates from parties collection
      sortedCandidateViews = _.chain(this.parties.models).
        pluck('candidates.models').
        flatten();
    } else {
      // A-Z name sort
      sortedCandidateViews = _.chain(this.candidates.models);
    }

    // Filter candidates
    sortedCandidateViews = sortedCandidateViews.filter(candidate => !candidate.get('filtered'));

    // Get candidate views
    sortedCandidateViews = sortedCandidateViews.
      pluck('view').
      map(view => view.render().el);


    let $faceGroup = $('<div>').attr('class', 'candidate-face-group');
    $faceGroup.html(sortedCandidateViews.value());

    this.$el.html($faceGroup);
  },

  renderTeamsView: function () {
    let partySectionViews = _.chain(this.parties.models).
      map(party => new FacesPartySectionView({ model: party })).
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
