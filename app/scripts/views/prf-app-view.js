// views/prf-app-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Common   = require('../lib/common'),
    CandidateView  = require('../views/prf-candidate-view'),
    SettingsView   = require('../views/prf-settings-view'),
    FacesPartySectionView = require('../views/prf-faces-party-section-view'),
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
      candidate.party = party;
      party.candidates.add(candidate);

      return candidate;
    }));

    // Create candidate views
    this.candidateViews = this.candidates.map((model) => {
      let view = new CandidateView({ model: model });
      model.view = view;
      return view;
    });

    // Router
    this.listenTo(router, 'route:root', () => {
      router.navigate('faces', { replace: true });
      this.showFaces();
    });
    this.listenTo(router, 'route:faces', (query) => this.showFaces(query));
    this.listenTo(router, 'route:wards', (query) => this.showWards(query));

    // Events
    this.listenTo(this.settingsView, 'search', this.search);
  },

  showFaces: function (query) {
    if (query) query = Common.parseQueryString(query);
    else query = {};
    
    this.$viz.removeClass('viz-profiles-wards').
      addClass('viz-profiles-face');

    if (query.view == 'teams') {
      // Hide sort filters
      this.settingsView.toggleSortButtons(false);

      // Teams view
      let partySectionViews = this.parties.map(party => {
        let view = new FacesPartySectionView({ model: party });
        return view.render().el;
      });

      this.$vizContent.html(partySectionViews);
    } 
    else {
      // Hide sort filters
      this.settingsView.toggleSortButtons(true);

      // Default view
      // Get candidate views from parties
      let sortedCandidateViews;

      if (query.sort == 'party') {
        // Get candidates from parties collection
        sortedCandidateViews = _.chain(this.parties.models).
          pluck('candidates.models').
          flatten();
      } else {
        // A-Z name sort
        sortedCandidateViews = _.chain(this.candidates.models);
      }

      sortedCandidateViews = sortedCandidateViews.
        pluck('view').
        map(view => view.render().el);

      let $faceGroup = $('<div>').attr('class', 'candidate-face-group');
      $faceGroup.html(sortedCandidateViews.value());

      this.$vizContent.html($faceGroup);
    }
  },

  showWards: function (query) {
    if (query) query = Common.parseQueryString(query);
    
    this.$viz.removeClass('viz-profiles-face').
      addClass('viz-profiles-wards');
  },

  search: function (query) {
    this.candidates.invoke('setFilter', query);
  }

});
