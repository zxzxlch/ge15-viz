// views/prf-app-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Common   = require('../lib/common'),
    CandidateView  = require('../views/prf-candidate-view'),
    SettingsView   = require('../views/prf-settings-view'),
    Candidate      = require('../models/prf-candidate'),
    Candidates     = require('../collections/prf-candidates'),
    Party          = require('../models/prf-party'),
    Parties        = require('../collections/prf-parties'),
    router         = require('../routers/prf-router'),
    candidatesData = JSON.parse(require('../data/candidates.json')).data;

/**
 * @namespace
 * @property {Backbone.collection} candidates
 * @property {Backbone.collection} parties
 */
module.exports = Backbone.View.extend({

  initialize: function(options) {
    this.$viz = $('.viz');
    this.$vizContent = $('<div>').
      attr('class', 'viz-content');
    this.settingsView = new SettingsView();
    this.$viz.html([this.settingsView.el, this.$vizContent]);

    // Create candidate and party models
    this.parties = new Parties();
    this.parties.comparator = function (a, b) {
      // Sort by candidates size
      if (a.candidates.length > b.candidates.length) {
        return -1;
      } else if (a.candidates.length < b.candidates.length) {
        return 1;
      }
      return 0;
    }

    this.candidates = new Candidates(_.map(candidatesData, d => {
      let party = this.parties.findWhere({ id: d.partyId });
      if (!party) {
        // Create party
        party = new Party({
          id: d.partyId,
          name: d.party
        });
        this.parties.add(party);
      }

      // Create candidate
      let candidate = new Candidate(d);
      party.candidates.add(candidate);

      return candidate;
    }));

    // Create candidate views
    this.candidateViews = this.candidates.map((model) => {
      return new CandidateView({ model: model });
    });

    // Router
    this.listenTo(router, 'route:root', () => this.showFacewall() );
    this.listenTo(router, 'route:facewall', (query) => this.showFacewall(query));
    this.listenTo(router, 'route:wards', (query) => this.showWards(query));
  },

  showFacewall: function (query) {
    if (query) query = Common.parseQueryString(query);
    else query = {};
    
    this.$viz.removeClass('viz-profiles-wards').
      addClass('viz-profiles-face');

    // Get candidate views from parties
    let sortedCandidateViews;

    if (query.sort == 'party') {
      // Get candidates from parties collection
      sortedCandidateViews = _.chain(this.parties.models).
        map(party => party.candidates.models).
        flatten();
    } else {
      // A-Z name sort
      sortedCandidateViews = _.chain(this.candidates.models);
    }

    sortedCandidateViews = sortedCandidateViews.
      map(candidate => {
        return _.find(this.candidateViews, view => {
          return view.model.id == candidate.id;
        });
      }).
      map(view => view.render().el);

    this.$vizContent.html(sortedCandidateViews.value());
  },

  showWards: function (query) {
    if (query) query = Common.parseQueryString(query);

  }

});
