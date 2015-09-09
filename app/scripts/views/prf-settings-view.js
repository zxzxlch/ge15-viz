// views/prf-settings-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    PerspectiveSettingsView = require('../views/prf-perspective-settings'),
    DetailSettingsView = require('../views/prf-detail-settings');

module.exports = Backbone.View.extend({

  className: 'viz-settings',

  initialize: function(options) {
    this.perspectiveSettingsView = new PerspectiveSettingsView();
    this.detailSettingsView = new DetailSettingsView();
    this.listenTo(this.perspectiveSettingsView, 'search', () => {
      this.trigger.apply(arguments);
    });
  },

  updateSettings: function (options) {
    switch (router.perspective) {
      case 'faces':
      case 'parties':
        this.currentSettingsView = this.perspectiveSettingsView;
        break;
      case 'candidates':
        this.currentSettingsView = this.detailSettingsView;
        break;
    }
    this.currentSettingsView.updateSettings(options);
    this.$el.html(this.currentSettingsView.el);
  }

});
