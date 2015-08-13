// views/ps-chart-group-view.js

let $        = require('jquery');
let _        = require('underscore');
let Backbone = require('backbone');
let ChartRowView = require('../views/ps-chart-row-view');
let template = _.template(require('../templates/ps-chart-group.html'));

module.exports = Backbone.View.extend({

  initialize: function(options) {
    let { party, grc, stats, values, maxAttendence, meanAttendencePercent, meanSpokenPercent } = options;

    let $elem = $(template({
      title:    grc ? grc : party,
      subtitle: grc ? party : '',
      stats:    `Attended an average of ${Math.round(stats.attendence)} parliament sitting with a ${(stats.attendence / maxAttendence * 100).toFixed(1)}% attendence rate. Spoke up for ${Math.round(stats.spoken)} sittings on average.`
    }));
    this.setElement($elem);

    // Create chart rows
    let $rows = _.map(values, d => {
      let row = new ChartRowView({
        data: d,
        maxAttendence,
        meanAttendencePercent,
        meanSpokenPercent
      });
      return row.el
    });
    this.$('.chart-group-rows').html($rows);
  }

});
