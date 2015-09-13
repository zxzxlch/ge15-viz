// views/prf-settings-view.js

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

  updateSettings: function (options) {
    switch (Common.router.perspective) {
      case 'parliament':
      case 'voteshare':
        this.renderPerspectiveSettings();
        break;
      case 'candidates':
        this.renderDetailSettings(options);
        break;
    }
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
  loadSettings: function (settings) {
    let perspectives = _.clone(this.perspectives, true);
    _.findWhere(perspectives, { id: settings.perspective }).active = true;

    _.assign(settings, { perspectives: perspectives });
    _.defaults(settings, { search: false, views: false, sorts: false });

    this.$el.html(perspectiveTemplate(settings));
  },

  setActive: function (group, id) {
    _.each(this.$(`.viz-settings-${group} .settings-link`), elem => {
      $(elem).toggleClass('active', $(elem).data('id') == id);
    });
  },

  /**
   * @param options.back.path
   * @param options.back.label
   * @param options.left.path
   * @param options.left.label
   * @param options.right.path
   * @param options.right.label
   */
  renderDetailSettings: function (options) {
    _.defaults(options, {
      left: false,
      right: false
    });
    this.$el.html(detailTemplate(options));
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
