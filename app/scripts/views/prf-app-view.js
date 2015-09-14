// views/prf-app-view.js

let $              = require('jquery'),
    _              = require('lodash'),
    _s             = require('underscore.string'),
    Backbone       = require('backbone'),
    Common         = require('../lib/common'),
    router         = require('../routers/viz-router'),
    SettingsView   = require('../views/viz-settings-view'),
    VizAppView     = require('../views/viz-app-view'),
    FacesPerspectiveView = require('../views/prf-faces-perspective-view'),
    PartiesPerspectiveView = require('../views/prf-parties-perspective-view'),
    CandidateDetailView = require('../views/candidate-detail-view'),
    Candidate      = require('../models/candidate'),
    Party          = require('../models/party'),
    candidatesData = JSON.parse(require('../data/candidates.json')).data;

/**
 * @namespace
 * @property {Backbone.Collection} candidates
 * @property {Backbone.Collection} parties
 */
module.exports = VizAppView.extend({

  initPerspectiveViews: function () {
    this.perspectiveViews = _.map([FacesPerspectiveView, PartiesPerspectiveView], perspectiveClass => {
      return new perspectiveClass(_.pick(this,
        'candidates',
        'parties'));
    });
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
    this.parties = new Backbone.Collection([], { model: Party });
    this.parties.comparator = function (a, b) {
      // Sort by candidates size
      if (a.candidates.length > b.candidates.length) {
        return -1;
      } else if (a.candidates.length < b.candidates.length) {
        return 1;
      }
      return 0;
    }

    let candidates = _.map(candidatesData, d => {
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
    });
    this.candidates = new Backbone.Collection(candidates, { model: Candidate });
  },

  getDetailCollection: function (detail) {
    if (detail == 'candidates')
      return this.candidates;
  },

  getDetailViewClass: function (detail) {
    if (detail == 'candidates')
      return CandidateDetailView;
  },

  search: function (searchString) {
    this.candidates.invoke('setFilter', searchString);
    VizAppView.prototype.search.apply(this, arguments);
  }

});
