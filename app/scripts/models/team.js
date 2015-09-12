// models/team.js

let _         = require('lodash'),
    Backbone  = require('backbone'),
    Candidate = require('../models/prf-candidate');

/**
 * @namespace
 * @property {number}  attributes.votesWon
 * @property {number}  attributes.votesWonRatio
 * @property {boolean} attributes.won
 * @property {Party}   party
 * @property {Constituency} constituency
 * @property {Backbone.Collection} candidates
 */
module.exports = Backbone.Model.extend({

  initialize: function (options) {
    this.candidates = new Backbone.Collection([], { model: Candidate, comparator: 'name' });
    this.listenTo(this.candidates, 'add', this.didAddCandidate);
    this.listenTo(this.candidates, 'remove', this.didRemoveCandidate);
    
    if (options.candidates) {
      this.candidates.add(options.candidates);
    }
    if (options.party) {
      options.party.teams.add(this);
    }
  },

  didAddCandidate: function (candidate) {
    candidate.team = this;
  },

  didRemoveCandidate: function (candidate) {
    delete candidate.team;
  },

  parse: function (options) {
    return _.pick(options, 'votesWon', 'won', 'votesWonRatio');
  }

});
