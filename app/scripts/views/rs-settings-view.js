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

  renderPerspectiveSettings: function () {
    // Parliament
    if (Common.router.perspective == 'parliament') {
      this.$el.html(perspectiveTemplate({
        perspectives: this.perspectives,
        view: false,
        sort: false,
        search: true
      }));
    } 
    // Voteshare
    else if (Common.router.perspective == 'voteshare') {
      let options = {
        perspectives: this.perspectives,
        view: [{
          label: 'Wards'
        }, {
          label: 'Parties'
        }],
        search: false
      };

      if (Common.router.query.view == 'wards') {
        _.extend(options, {
          perspectives: this.perspectives,
          sort: [{
            label: 'Num of voters',
            value: 'numVoters'
          },{
            label: 'Close fights',
            value: 'closeFights'
          }]
        });
      } else if (Common.router.query.view == 'parties') {
        _.extend(options, {
          perspectives: this.perspectives,
          sort: [{
            label: 'Total votes',
            value: 'totalVotes'
          },{
            label: 'Avg vote share by ward',
            value: 'avgWard'
          }]
        });
      };

      this.$el.html(perspectiveTemplate(options));

      if (Common.router.query.view == 'wards') {
        var sortValue = Common.router.query.sort || 'numVoters';
        this.setActive('sort', sortValue);
      } else if (Common.router.query.view == 'parties') {
        var sortValue = Common.router.query.sort || 'totalVotes';
        this.setActive('sort', sortValue);
      }

      this.setActive('view', Common.router.query.view);
    }

    this.setActive('perspective', Common.router.perspective);
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
    Common.router.setQueryValue('view', $(event.currentTarget).data('value'));
  },

  setSort: function (event) {
    event.preventDefault();
    Common.router.setQueryValue('sort', $(event.currentTarget).data('value'));
  },

  search: function (event) {
    this.trigger('search', $(event.currentTarget).val());
  }

});
