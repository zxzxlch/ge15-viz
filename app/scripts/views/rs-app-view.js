// views/rs-app-view.js

let $              = require('jquery'),
    _              = require('lodash'),
    _s             = require('underscore.string'),
    Backbone       = require('backbone'),
    Common         = require('../lib/common'),
    router         = require('../routers/rs-router'),
    SettingsView   = require('../views/rs-settings-view'),
    NewParliamentPerspectiveView = require('../views/rs-new-parliament-perspective-view'),
    VotesharePerspectiveView = require('../views/rs-voteshare-perspective-view'),
    CandidateDetailView = require('../views/prf-candidate-detail-view'),
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

  query: {},

  initialize: function(options) {
    Common.router = router;

    this.initModels();

    // Perspective views
    this.perspectiveViews = _.map([NewParliamentPerspectiveView, VotesharePerspectiveView], perspectiveClass => {
      return new perspectiveClass(_.pick(this,
        'candidates',
        'parties',
        'constituencies',
        'contestingBodies',
        'stats'));
    });

    // Settings view
    let $vizContent = $('<div>').attr('class', 'viz-content');
    let perspectives = _.map(this.perspectiveViews, perspectiveView => {
      return _.pick(perspectiveView.getDefinition(), 'id', 'label');
    });
    this.settingsView = new SettingsView({ perspectives: perspectives });
    $('.viz').html([this.settingsView.el, $vizContent]);
    this.listenTo(this.settingsView, 'search', this.search);
    this.listenTo(this.settingsView, 'setQueryValue', this.setQueryValue);

    // Router
    this.listenTo(router, 'route:perspective', this.loadPerspective);
    this.listenTo(router, 'route:detail', this.loadDetail);
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

  loadPerspective: function (perspective) {
    // Find setting for current perspective
    let newPerspectiveView = _.findWhere(this.perspectiveViews, { definition: { id: perspective } });
    if (!newPerspectiveView) {
      // Navigate to default perspective
      return router.navigate(this.perspectiveViews[0].getDefinition().id, { trigger: true });
    }
    this.currentPerspectiveView = newPerspectiveView;

    // Remember previous perspectives for detail views
    this.history.unshift(this.currentPerspectiveView.getDefinition().id);

    // Set query from url
    this.validateQuery(router.parseQuery());
    router.setFragmentQuery(this.query);

    // Update settings view
    this.updateSettings();

    // Reset search
    this.clearSearch();

    this.currentPerspectiveView.loadQuery(_.clone(this.query));

    // Render perspective content
    $('.viz-content').replaceWith(this.currentPerspectiveView.el);
  },

  /**
   * Parse query to match perspective definition
   */
  validateQuery: function (query) {
    query = (query) ? _.pick(query, 'view', 'sort') : {};
    let definition = this.currentPerspectiveView.getDefinition();

    // Set query attribute to match attribute in definition
    let viewDefinition;
    if (definition.views) {
      // Default to first view definition
      viewDefinition = _.findWhere(definition.views, { id: query.view }) || definition.views[0];
      query.view = viewDefinition.id;
    } else {
      // Remove view attribute
      delete query.view;
    }

    // Look for sort definition in view attribute first before looking in root
    let sort, sortDefinitions;
    if (viewDefinition && viewDefinition.sorts) {
      sortDefinitions = viewDefinition.sorts;
    } else if (definition.sorts) {
      sortDefinitions = definition.sorts;
    }
    if (sortDefinitions) {
      let sortDefinition = _.findWhere(sortDefinitions, { id: query.sort }) || sortDefinitions[0];
      query.sort = sortDefinition.id;
    } else {
      // Remove view attribute
      delete query.sort;
    }

    // Update query
    this.query = query;

    // Update url
    router.setFragmentQuery(this.query);
  },

  setQueryValue: function (key, value) {
    // Check for change in value
    if (this.query[key] == value) return;
    this.query[key] = value;

    let options = { changed: {} };
    options.changed[key] = value;

    this.changeQuery(options);
  },

  updateSettings: function () {
    // Parse query to match perspective settings
    let definition = this.currentPerspectiveView.getDefinition(),
        query = this.query;

    // Update settings
    let settings = {
      perspective: definition.id,
      search: !!definition.search
    };
    let activeView;
    if (definition.views) {
      settings.views = _.map(definition.views, view => _.pick(view, 'id', 'label'));
      _.findWhere(settings.views, { id: query.view }).active = true;
      activeView = _.findWhere(definition.views, { id: query.view });
    }
    if (activeView) {
      settings.sorts = activeView.sorts;
    } else {
      settings.sorts = definition.sorts;
    }
    if (settings.sorts) {
      _.findWhere(settings.sorts, { id: query.sort }).active = true;
    }

    this.settingsView.loadSettings(settings);
  },

  loadDetail: function (id) {
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
    this.updateSettings();
  },

  changeQuery: function (options) {
    this.validateQuery(this.query);
    router.setFragmentQuery(this.query, { replace: false });

    this.currentPerspectiveView.loadQuery(_.assign({}, this.query, options));
    this.updateSettings();

    if (options.changed && options.changed.view)
      this.clearSearch();
  },

  clearSearch: function () {
    this.search(null);
  },

  search: function (searchString) {
    // Update filter state for candidate models
    this.candidates.invoke('setFilter', searchString);

    if (this.currentPerspectiveView.search)
      this.currentPerspectiveView.search(searchString);
  }

});
