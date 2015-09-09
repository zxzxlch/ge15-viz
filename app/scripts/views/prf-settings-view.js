// views/prf-settings-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    perspectiveTemplate = _.template(require('../templates/prf-perspective-settings.html')),
    detailTemplate = _.template(require('../templates/prf-detail-settings.html'));

module.exports = Backbone.View.extend({

  className: 'viz-settings',

  events: {
    'click .viz-settings-sort a':         'setSort',
    'click .viz-settings-view a':         'setView',
    'keyup .viz-settings-search input':   'search',
    'change .viz-settings-search input':  'search'
  },

  updateSettings: function (options) {
    switch (router.perspective) {
      case 'faces':
      case 'parties':
        this.renderPerspectiveSettings();
        break;
      case 'candidates':
        this.renderDetailSettings(options);
        break;
    }
  },

  renderPerspectiveSettings: function () {
    // Faces
    if (router.perspective == 'faces') {
      this.$el.html(perspectiveTemplate({
        view: false,
        search: true,
        sort: [{
          value: 'name',
          label: 'A to Z'
        }, {
          label: 'Party'
        }]
      }));
      
      var sortValue = router.query.sort || 'name';
      this.setActive('sort', sortValue);
    } 
    // Parties
    else if (router.perspective == 'parties') {
      this.$el.html(perspectiveTemplate({
        search: router.query.view != 'tweets',
        sort: false,
        view: [{
          label: 'Teams'
        }, {
          label: 'Tweets'
        }]
      }));

      this.setActive('view', router.query.view);
    }

    this.setActive('perspective', router.perspective);
  },

  setActive: function (group, value) {
    _.each(this.$(`.viz-settings-${group} .settings-link`), elem => {
      $(elem).toggleClass('active', $(elem).data('value') == value);
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
    router.setQueryValue('view', $(event.currentTarget).data('value'));
  },

  setSort: function (event) {
    event.preventDefault();
    router.setQueryValue('sort', $(event.currentTarget).data('value'));
  },

  search: function (event) {
    this.trigger('search', $(event.currentTarget).val());
  }

});
