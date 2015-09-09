// views/prf-app-view.js

let $              = require('jquery'),
    _              = require('lodash'),
    _s             = require('underscore.string'),
    Backbone       = require('backbone'),
    Common         = require('../lib/common'),
    router         = require('../routers/prf-router'),
    SettingsView   = require('../views/prf-settings-view'),
    FacesPerspectiveView   = require('../views/prf-faces-perspective-view'),
    PartiesPerspectiveView = require('../views/prf-parties-perspective-view'),
    CandidateDetailView    = require('../views/prf-candidate-detail-view'),
    Candidates     = require('../collections/prf-candidates'),
    Parties        = require('../collections/prf-parties'),
    Candidate      = require('../models/prf-candidate'),
    Party          = require('../models/prf-party'),
    candidatesData = JSON.parse(require('../data/candidates.json')).data;

/**
 * @namespace
 * @property {Backbone.collection} candidates
 * @property {Backbone.collection} parties
 */
module.exports = Backbone.View.extend({

  history: [],

  initialize: function(options) {
    this.initModels();

    // Settings view
    let $vizContent = $('<div>').attr('class', 'viz-content');
    this.settingsView = new SettingsView();
    $('.viz').html([this.settingsView.el, $vizContent]);
    this.listenTo(this.settingsView, 'search', this.search);

    // Router
    this.listenTo(router, 'route:faces', this.showFaces);
    this.listenTo(router, 'route:parties', this.showParties);
    this.listenTo(router, 'route:candidates', this.showCandidates);
    this.listenTo(router, 'didUpdateQuery', this.routerDidUpdateQuery);
  },

  initModels: function () {
    // Get image references
    var imageReferences = _.chain($('.js-image-ref img')).
      reduce((result, elem) => {
        result[$(elem).data('candidate-id')] = $(elem).attr('src');
        return result;
      }, {}).
      value();

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
      candidate.set('imagePath', imageReferences[candidate.id]);
      candidate.party = party;
      party.candidates.add(candidate);

      return candidate;
    }));
  },

  loadPerspectiveView: function (view) {
    // Remember previous perspectives for detail views
    if (router.perspective != _.first(this.history)) 
      this.history.unshift(router.perspective);
    
    this.perspectiveView = view;
    $('.viz-content').replaceWith(this.perspectiveView.el);

    // Reset search
    this.search(null);
  },

  routerDidUpdateQuery: function (options) {
    if (this.perspectiveView.routerDidUpdateQuery) {
      this.perspectiveView.routerDidUpdateQuery();
      this.settingsView.updateSettings();
    }
    if (options.changed && options.changed.view)
      this.search(null);
  },

  search: function (searchString) {
    // Update filter state for candidate models
    this.candidates.invoke('setFilter', searchString);

    if (this.perspectiveView.search)
      this.perspectiveView.search(searchString);
  },

  showFaces: function () {
    this.loadPerspectiveView(new FacesPerspectiveView({
      candidates: this.candidates,
      parties:    this.parties
    }));
    this.settingsView.updateSettings();
  },

  showParties: function () {
    this.loadPerspectiveView(new PartiesPerspectiveView({
      candidates: this.candidates,
      parties:    this.parties
    }));
    this.settingsView.updateSettings();
  },

  showCandidates: function (id) {
    let candidate = this.candidates.get(id);

    this.loadPerspectiveView(new CandidateDetailView({
      model: candidate
    }));

    // Get candidates before and after
    // Wrap first and last
    let index = this.candidates.indexOf(candidate),
        prevIndex = (index - 1 >= 0) ? index - 1 : this.candidates.length - 1,
        prev = this.candidates.at(prevIndex),
        nextIndex = (index + 1 < this.candidates.length) ? index + 1 : 0,
        next = this.candidates.at(nextIndex);

    let settingsOptions = {}

    // Trace previous perspective that is not candidate
    for (var perspective of this.history) {
      if (perspective != 'candidates') {
        settingsOptions.back = {
          label: _s.capitalize(perspective),
          path:  '#' + perspective
        };
        break;
      }
    }
    // Default to faces view
    if (!settingsOptions.back) {
      settingsOptions.back = {
        label: 'Faces',
        path:  '#faces'
      };
    }

    if (prev) {
      settingsOptions.left = {
        label: prev.get('name'),
        path:  '#candidates/' + prev.id
      }
    }
    if (next) {
      settingsOptions.right = {
        label: next.get('name'),
        path:  '#candidates/' + next.id
      }
    }

    // Update settings view
    this.settingsView.updateSettings(settingsOptions);
  }

});
