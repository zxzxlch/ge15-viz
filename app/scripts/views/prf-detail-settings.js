// views/prf-detail-settings-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    router   = require('../routers/prf-router'),
    template = _.template(require('../templates/prf-detail-settings.html'));

module.exports = Backbone.View.extend({

  /**
   * @param options.back.path
   * @param options.back.label
   * @param options.left.path
   * @param options.left.label
   * @param options.right.path
   * @param options.right.label
   */
  updateSettings: function (options) {
    _.defaults(options, {
      left: false,
      right: false
    });
    this.$el.html(template(options));
  }

});
