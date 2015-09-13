// views/rs-app-view.js

let $              = require('jquery'),
    _              = require('lodash'),
    _s             = require('underscore.string'),
    Backbone       = require('backbone'),
    Common         = require('../lib/common'),
    VizAppView     = require('../views/viz-app-view'),
    NewParliamentPerspectiveView = require('../views/rs-new-parliament-perspective-view'),
    VotesharePerspectiveView = require('../views/rs-voteshare-perspective-view'),
    CandidateDetailView = require('../views/candidate-detail-view'),
    Parties        = require('../collections/prf-parties'),
    Candidate      = require('../models/candidate'),
    Party          = require('../models/party'),
    Team           = require('../models/team'),
    ContestingBody = require('../models/contesting-body'),
    Constituency   = require('../models/constituency'),
    candidatesData = JSON.parse(require('../data/candidates.json')).data,
    constituenciesData = JSON.parse(require('../data/constituencies.json'));

/**
 * @namespace
 * @property {Object} stats
 * @property {Backbone.View[]} perspectiveViews
 * @property {Backbone.Collection} candidates
 * @property {Backbone.Collection} parties
 * @property {Backbone.Collection} constituencies
 * @property {Backbone.Collection} contestingBodies
 */
module.exports = VizAppView.extend({

  initPerspectiveViews: function () {
    this.perspectiveViews = _.map([NewParliamentPerspectiveView, VotesharePerspectiveView], perspectiveClass => {
      return new perspectiveClass(_.pick(this,
        'candidates',
        'parties',
        'constituencies',
        'contestingBodies',
        'stats'));
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

    // Parties
    let parties = _.map(constituenciesData.data.parties, party => {
      return new Party(_.pick(party, 'id', 'name'));
    })
    this.parties = new Backbone.Collection(parties, { model: Party });
    this.parties.comparator = function (a, b) {
      // Sort by candidates size
      if (a.candidates.length > b.candidates.length) {
        return -1;
      } else if (a.candidates.length < b.candidates.length) {
        return 1;
      }
      return 0;
    };

    // Candidates
    let candidates = _.map(candidatesData, d => {
      let candidate = new Candidate(d, { parse: true });

      // Set party
      let party = this.parties.findWhere({ id: d.partyId });
      party.candidates.add(candidate);

      // Set image path
      candidate.set('imagePath', imageReferences[candidate.id]);

      return candidate;
    });
    this.candidates = new Backbone.Collection(candidates, { model: Candidate });

    // Contesting bodies
    let contestingBodies = _.chain(this.parties.models).
      reject(party => party.id == 'ind').
      map(party => {
        let attributes = _.findWhere(constituenciesData.data.parties, { id: party.id });
        _.extend(attributes, {
          model: party,
          type: 'party',
        });
        return new ContestingBody(attributes);
      }).
      value();

    let contestingIndependents = _.chain(this.candidates.models).
      where({ party: { id: 'ind' } }).
      map(candidate => {
        let attributes = _.findWhere(constituenciesData.data.independents, { id: candidate.id });
        _.extend(attributes, {
          model: candidate,
          type: 'candidate',
        });
        return new ContestingBody(attributes);
      }).
      value();

    this.contestingBodies = new Backbone.Collection(contestingBodies.concat(contestingIndependents), { model: ContestingBody });

    // Constituencies and teams
    let constituencies = _.map(constituenciesData.data.constituencies, con => {
      let attributes = _.omit(con, 'teams');

      attributes.teams = _.map(con.teams, team => {
        let attributes = _.pick(team, 'votesWon', 'votesWonRatio', 'won');
        attributes.party = this.parties.findWhere({ id: team.partyId });
        attributes.candidates = _.map(team.candidates, candidate => {
          return this.candidates.findWhere({ id: candidate.id });
        });
        return new Team(attributes, { parse: true });
      });

      return new Constituency(attributes, { parse: true });
    });
    this.constituencies = new Backbone.Collection(constituencies, { model: Constituency });

    // Stats
    this.stats = {
      totalVotes: _.sum(this.constituencies.models, 'attributes.voters'),
      totalSeats: _.sum(this.constituencies.models, 'attributes.seats')
    }
  },

  getDetailCollection: function (detail) {
    if (detail == 'candidates')
      return this.candidates;
  },

  getDetailViewClass: function (detail) {
    if (detail == 'candidates')
      return CandidateDetailView;
  }

});
