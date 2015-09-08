// views/prf-app-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Common   = require('../lib/common'),
    router         = require('../routers/prf-router'),
    SettingsView   = require('../views/prf-settings-view'),
    FacesPerspectiveView = require('../views/prf-faces-perspective-view'),
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

  initialize: function(options) {
    // Get image references
    var imageReferences = _.chain($('.js-image-ref img')).
      reduce((result, elem) => {
        result[$(elem).data('candidate-id')] = $(elem).attr('src');
        return result;
      }, {}).
      value();

    this.$viz = $('.viz');
    let $vizContent = $('<div>').
      attr('class', 'viz-content');
    this.settingsView = new SettingsView();
    this.$viz.html([this.settingsView.el, $vizContent]);

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

    // Router
    this.listenTo(router, 'route:faces', this.showFaces);
    this.listenTo(router, 'route:wards', this.showWards);

    // Events
    this.listenTo(this.settingsView, 'search', this.search);
  },

  getVizContent: function () {
    return $('.viz-content');
  },

  showFaces: function () {
    this.perspectiveView = new FacesPerspectiveView({
      candidates: this.candidates,
      parties:    this.parties
    });
    this.getVizContent().replaceWith(this.perspectiveView.el);
  },

  showWards: function () {
    // this.$viz.removeClass('viz-profiles-face').
    //   addClass('viz-profiles-wards');
  },

  search: function (searchString) {
    // Update filter state for candidate models
    this.candidates.invoke('setFilter', searchString);

    this.perspectiveView.search(searchString);
  }

});
