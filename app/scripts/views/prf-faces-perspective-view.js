// views/prf-faces-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    CandidateView  = require('../views/prf-candidate-view');

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

    this.render();
  },

  render: function () {
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

  routerDidUpdateQuery: function () {
    this.render();
  },

  search: function (searchString) {
    this.render();
  }

});
