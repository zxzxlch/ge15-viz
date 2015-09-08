// views/prf-parties-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    CandidateView  = require('../views/prf-candidate-view'),
    PartySectionView  = require('../views/prf-parties-party-section-view');

module.exports = Backbone.View.extend({

  className: 'viz-content viz-profiles-parties',

  initialize: function (options) {
    _.assign(this, _.pick(options, 'candidates', 'parties'));

    /*// Set view for each candidate model
    this.candidateViews = this.candidates.map((model) => {
      let view = new CandidateView({ model: model });
      model.view = view;
      return view;
    });*/

    this.render();
  },

  render: function () {
    let $parties = _.map(this.parties.models, party => {
      return new PartySectionView({ model: party }).el;
    });
    this.$el.html($parties)
  },

  routerDidUpdateQuery: function () {
    this.render();
  },

  search: function (searchString) {
    this.render();
  }

});
