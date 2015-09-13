// models/constituency.js

let _        = require('lodash'),
    Backbone = require('backbone'),
    Team     = require('../models/team'),
    Party     = require('../models/prf-party');

/**
 * @namespace
 * @property {string}  attributes.name
 * @property {string}  attributes.type  - 'smc' or 'grc'
 * @property {number}  attributes.seats
 * @property {number}  attributes.voters
 * @property {number}  attributes.votesValid
 * @property {number}  attributes.votesInvalid
 * @property {string}  attributes.url
 * @property {Backbone.Collection} teams
 * @method {Team} getWinningTeam
 */
module.exports = Backbone.Model.extend({

  initialize: function (options) {
    this.teams = new Backbone.Collection([], { model: Team });
    this.listenTo(this.teams, 'add', this.didAddTeam);
    this.listenTo(this.teams, 'remove', this.didRemoveTeam);
    
    if (options.teams)
      this.teams.add(options.teams);
  },

  didAddTeam: function (team) {
    team.constituency = this;
  },

  didRemoveTeam: function (team) {
    delete team.constituency;
  },

  parse: function (options) {
    return _.pick(options, 'name', 'type', 'seats', 'voters', 'votesValid', 'votesInvalid', 'url');
  },

  getWinningTeam: function () {
    return this.teams.findWhere({ won: true });
  }

});
