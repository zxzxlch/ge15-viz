// views/viz-app-view.js

let $              = require('jquery'),
    _              = require('lodash'),
    _s             = require('underscore.string'),
    Backbone       = require('backbone'),
    Common         = require('../lib/common'),
    router         = require('../routers/viz-router'),
    SettingsView   = require('../views/viz-settings-view'),
    CandidateDetailView = require('../views/candidate-detail-view');

/**
 * @namespace
 * @property {Backbone.View[]} perspectiveViews
 */
module.exports = Backbone.View.extend({

  history: [],

  query: {},

  initialize: function(options) {
    Common.router = router;

    this.initModels();
    this.initPerspectiveViews();

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

  /**
   * @abstract
   */
  initPerspectiveViews: function () {
    this.perspectiveViews = [];
  },

  /**
   * @abstract
   */
  initModels: function () {
  },

  loadDefaultPerspective: function () {
    router.navigate(this.perspectiveViews[0].getDefinition().id, { trigger: true });
  },

  loadPerspective: function (perspective) {
    // Find setting for current perspective
    let newPerspectiveView = _.findWhere(this.perspectiveViews, { definition: { id: perspective } });
    if (!newPerspectiveView) {
      return this.loadDefaultPerspective();
    }
    this.currentPerspectiveView = newPerspectiveView;

    // Remember previous perspectives for detail views
    this.history.unshift(this.currentPerspectiveView.getDefinition().id);

    // Set query from url
    this.validateQuery(router.parseQuery());

    // Update settings view
    this.updatePerspectiveSettings();

    this.currentPerspectiveView.loadQuery(_.clone(this.query));

    // Reset search
    this.clearSearch();

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

  updatePerspectiveSettings: function () {
    // Parse query to match perspective settings
    let definition = this.currentPerspectiveView.getDefinition(),
        query = this.query;

    // Update settings
    let settings = {
      perspective: definition.id,
      search: !!definition.search
    };
    // Views
    let activeView;
    if (definition.views) {
      settings.views = _.map(definition.views, view => _.pick(view, 'id', 'label'));
      _.findWhere(settings.views, { id: query.view }).active = true;
      activeView = _.findWhere(definition.views, { id: query.view });
    }
    // Sorts
    if (activeView) {
      settings.sorts = activeView.sorts;
    } else {
      settings.sorts = definition.sorts;
    }
    if (settings.sorts) {
      _.findWhere(settings.sorts, { id: query.sort }).active = true;
    }
    // Search
    if (activeView && activeView.search != undefined) {
      settings.search = activeView.search;
    } else {
      settings.search = definition.search;
    }


    this.settingsView.loadPerspectiveSettings(settings);
  },

  changeQuery: function (options) {
    this.validateQuery(this.query);

    this.currentPerspectiveView.loadQuery(_.assign({}, this.query, options));
    this.updatePerspectiveSettings();

    if (options.changed && options.changed.view)
      this.clearSearch();
  },

  clearSearch: function () {
    this.search(null);
  },

  search: function (searchString) {
    this.currentPerspectiveView.search(searchString);
  },

  /**
   * @abstract
   * @return {Backbone.Collection}
   */
  getDetailCollection: function (detail) {

  },

  /**
   * @abstract
   * @return detail view class
   */
  getDetailViewClass: function (detail) {

  },

  loadDetail: function (detail, id) {
    let collection = this.getDetailCollection(detail);

    if (!collection) {
      this.loadDefaultPerspective();
      return;
    }

    let currentModel = collection.get(id);

    let detailViewClass = this.getDetailViewClass(detail);
    let detailView = new detailViewClass({ model: currentModel });
    $('.viz-content').replaceWith(detailView.el);

    // Get models before and after
    // Wrap first and last
    let index = collection.indexOf(currentModel),
        prevIndex = (index - 1 >= 0) ? index - 1 : collection.length - 1,
        prev = collection.at(prevIndex),
        nextIndex = (index + 1 < collection.length) ? index + 1 : 0,
        next = collection.at(nextIndex);

    let settings = {};

    // Trace previous perspective that is not currentModel
    let backPerspective = this.history[0];
    if (backPerspective) {
      settings.back = {
        label: _.findWhere(this.perspectiveViews, { definition: { id: backPerspective } }).definition.label,
        path:  '#' + backPerspective
      };
    } else {
      // Default to first perspective
      let perspective = this.perspectiveViews[0].definition;
      settings.back = {
        label: perspective.label,
        path:  '#' + perspective.id
      };
    }

    if (prev) {
      settings.left = {
        label: prev.get('name'),
        path:  `#${detail}/${prev.id}`
      }
    }
    if (next) {
      settings.right = {
        label: next.get('name'),
        path:  `#${detail}/${next.id}`
      }
    }

    // Update settings view
    this.settingsView.loadDetailSettings(settings);
  }

});
