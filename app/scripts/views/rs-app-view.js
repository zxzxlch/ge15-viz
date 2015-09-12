// views/rs-app-view.js

let $              = require('jquery'),
    _              = require('lodash'),
    _s             = require('underscore.string'),
    Backbone       = require('backbone'),
    Common         = require('../lib/common'),
    router         = require('../routers/rs-router'),
    SettingsView   = require('../views/rs-settings-view'),
    NewParliamentPerspectiveView   = require('../views/rs-new-parliament-perspective-view'),
    // PartiesPerspectiveView = require('../views/prf-parties-perspective-view'),
    CandidateDetailView    = require('../views/prf-candidate-detail-view'),
    Parties        = require('../collections/prf-parties'),
    Candidate      = require('../models/prf-candidate'),
    Party          = require('../models/prf-party'),
    Team           = require('../models/team'),
    ContestingBody = require('../models/contesting-body'),
    Constituency   = require('../models/constituency'),
    candidatesData = JSON.parse(require('../data/candidates.json')).data,
    constituenciesData = JSON.parse(require('../data/constituencies.json'));

/**
 * @namespace
 * @property {Backbone.collection} candidates
 * @property {Backbone.collection} parties
 */
module.exports = Backbone.View.extend({

  history: [],

  perspectives: [{
    label: 'New parliament',
    value: 'parliament'
  }, {
    label: 'Vote share',
    value: 'voteshare'
  }],

  initialize: function(options) {
    Common.router = router;

    this.initModels();

    // Settings view
    let $vizContent = $('<div>').attr('class', 'viz-content');
    this.settingsView = new SettingsView({ perspectives: this.perspectives });
    $('.viz').html([this.settingsView.el, $vizContent]);
    this.listenTo(this.settingsView, 'search', this.search);

    // Router
    this.listenTo(router, 'route:parliament', this.showParliament);
    this.listenTo(router, 'route:voteshare', this.showVoteshare);
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

  showParliament: function () {
    this.loadPerspectiveView(new NewParliamentPerspectiveView({
      parties: this.parties,
      candidates: this.candidates
    }));
    this.settingsView.updateSettings();
  },

  showVoteshare: function () {
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
