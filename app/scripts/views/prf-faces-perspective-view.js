// views/prf-faces-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    PerspectiveView = require('../views/perspective-view'),
    CandidateView  = require('../views/candidate-view');

    
module.exports = PerspectiveView.extend({

  className: 'viz-content viz-profiles-face',

  definition: {
    id:        'faces',
    label:     'Faces',
    search:    true,
    sorts: [
      {
        id:    'name',
        label: 'A to Z',
      }, {
        id:    'party',
        label: 'Party',
      }
    ]
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
    let sortedCandidates;
    if (options.sort == 'name') {
      sortedCandidates = this.candidates.models;
    }
    else if (options.sort == 'party') {
      // Get candidates from parties collection
      sortedCandidates = _.chain(this.parties.models).
        pluck('candidates.models').
        flatten().
        value();
    }

    // Get candidate views
    let $candidateViews = _.chain(sortedCandidates).
      pluck('view').
      map(view => view.render().el).
      value();

    let $faceGroup = $('<div>').attr('class', 'candidate-face-group');
    $faceGroup.html($candidateViews);
    this.$el.html($faceGroup);
  },

  search: function (searchString) {
    this.candidates.each(candidate => {
      let filtered = candidate.get('filtered');
      candidate.view.$el.toggleClass('hide', filtered);
    });
  }

});
