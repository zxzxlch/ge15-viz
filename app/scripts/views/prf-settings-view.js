// views/prf-settings-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    template = _.template(require('../templates/prf-settings.html'));

module.exports = Backbone.View.extend({

  className: 'viz-settings',

  events: {
    'click .viz-settings-sort a':         'setSort',
    'click .viz-settings-view a':         'setView',
    'keyup .viz-settings-search input':   'search',
    'change .viz-settings-search input':  'search'
  },

  initialize: function(options) {
    this.$el.html(template());
  },

  render: function () {
    return this;
  },

  updateSettings: function () {
    // Perspective
    this.setActive('perspective', router.perspective);
      
    // Faces
    if (router.perspective == 'faces') {
      this.setActive('perspective', 'faces');
      this.configureSettings({
        view:   false,
        search: true,
        sort: [{
          value: 'name',
          label: 'A to Z'
        }, {
          label: 'Party'
        }]
      });
      
      this.setActive('view', 'default');
      var sortValue = router.query.sort || 'name';
      this.setActive('sort', sortValue);
    } 
    // Parties
    else if (router.perspective == 'parties') {
      this.configureSettings({
        sort: false,
        view: [{
          label: 'Teams'
        }, {
          label: 'Tweets'
        }]
      });

      if (router.query.view == 'tweets') {
        this.configureSettings({ search: false });
      } else {
        this.configureSettings({ search: true });
      }
    }
    this.setActive('view', router.query.view);
  },

  setActive: function (group, value) {
    _.each(this.$(`.viz-settings-${group} .settings-link`), elem => {
      $(elem).toggleClass('active', $(elem).data('value') == value);
    });
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
  },

  configureSettings: function (options) {
    _.each(options, (value, key) => {
      let $group = this.$('.viz-settings-' + key);
      if (key == 'view' || key == 'sort') {
        // Create setting links
        let $settingLinks = _.map(value, linkOptions => {
          // Generate value from label
          if (!linkOptions.value)
            linkOptions.value = linkOptions.label.toLowerCase();
          return $('<a>').
            attr('class', 'settings-link').
            attr('href', '#').
            data('value', linkOptions.value).
            html(linkOptions.label);
        });
        $group.find('.settings-link-group').html($settingLinks);
      }
      // Show or hide settings group
      $group.toggle(!!value);
    });
  }

});
