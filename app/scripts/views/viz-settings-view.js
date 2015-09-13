// views/viz-settings-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Common   = require('../lib/common'),
    perspectiveTemplate = _.template(require('../templates/rs-perspective-settings.html')),
    detailTemplate = _.template(require('../templates/prf-detail-settings.html'));

module.exports = Backbone.View.extend({

  className: 'viz-settings',

  events: {
    'click .viz-settings-sort a':         'setSort',
    'click .viz-settings-view a':         'setView',
    'keyup .viz-settings-search input':   'search',
    'change .viz-settings-search input':  'search'
  },

  initialize: function (options) {
    _.assign(this, _.pick(options, 'perspectives'));
  },

  /**
   * Update view with new settings
   * @param {Object}  settings
   * @param {string}  settings.perspective - Perspective to set active
   * @param {boolean} settings.search
   * @param {LinkSetting[]} settings.views
   * @param {LinkSetting[]} settings.sorts
   *
   * @typedef  {Object}  LinkSetting
   * @property {boolean} id
   * @property {boolean} active
   * @property {boolean} label
   */
  loadPerspectiveSettings: function (settings) {
    let perspectives = _.clone(this.perspectives, true);
    _.findWhere(perspectives, { id: settings.perspective }).active = true;

    _.assign(settings, { perspectives: perspectives });
    _.defaults(settings, { search: false, views: false, sorts: false });

    this.$el.html(perspectiveTemplate(settings));
  },

  /**
   * @param {Object} settings
   * @param {string} settings.back.path
   * @param {string} settings.back.label
   * @param {Object} [settings.left]
   * @param {string} settings.left.path
   * @param {string} settings.left.label
   * @param {Object} [settings.right]
   * @param {string} settings.right.path
   * @param {string} settings.right.label
   */
  loadDetailSettings: function (settings) {
    _.defaults(settings, {
      left: false,
      right: false
    });
    this.$el.html(detailTemplate(settings));
  },

  setView: function (event) {
    event.preventDefault();
    this.trigger('setQueryValue', 'view', $(event.currentTarget).data('id'));
  },

  setSort: function (event) {
    event.preventDefault();
    this.trigger('setQueryValue', 'sort', $(event.currentTarget).data('id'));
  },

  search: function (event) {
    this.trigger('search', $(event.currentTarget).val());
  }

});
