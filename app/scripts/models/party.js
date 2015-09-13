// models/party.js

let _         = require('lodash'),
    Backbone  = require('backbone'),
    Candidate = require('../models/candidate'),
    Team      = require('../models/team');

/**
 * @namespace
 * @property {string} id  - pap/wp/nsp...
 * @property {string} attributes.name
 * @property {Backbone.collection} candidates
 * @property {Backbone.collection} teams
 */
module.exports = Backbone.Model.extend({

  initialize: function (options) {
    this.candidates = new Backbone.Collection([], { model: Candidate });
    this.listenTo(this.candidates, 'add', this.didAddCandidate);
    this.listenTo(this.candidates, 'remove', this.didRemoveCandidate);
    this.teams = new Backbone.Collection([], { model: Team });
    this.listenTo(this.teams, 'add', this.didAddTeam);
    this.listenTo(this.teams, 'remove', this.didRemoveTeam);
  },

  didAddCandidate: function (candidate) {
    candidate.party = this;
  },

  didRemoveCandidate: function (candidate) {
    delete candidate.party;
  },

  didAddTeam: function (team) {
    team.party = this;
  },

  didRemoveTeam: function (team) {
    delete team.party;
  }

});
