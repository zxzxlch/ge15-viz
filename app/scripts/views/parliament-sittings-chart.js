// views/parliament-sittings-chart.js

let $        = require('jquery');
let _        = require('underscore');
let d3       = require('d3');
let Backbone = require('backbone');
let data     = JSON.parse(require('../data/mp.json'));
let rowTemplate = _.template(require('../templates/chart_mp_row.html'));

let totalSittings = 115;

module.exports = Backbone.View.extend({

  initialize: function(options) {
    this.initChartGuide();
    this.initRows();
  },


  initChartGuide: function() {
    // Calculate aggregate stats
    let meanAttendence = d3.mean(data, (d) => d.attendence);
    let meanSpoken = d3.mean(data, (d) => d.spoken);

    // Chart guide
    let $chartGuide = $('.chart-guide');

    let attendencePercent = 80;
    let spokenPercent = 40;
    let meanAttendencePercent = meanAttendence / totalSittings * 100;
    let meanSpokenPercent = meanSpoken / totalSittings * 100;

    $chartGuide.find('.bar-filled').css('width', `${ attendencePercent }%`);
    $chartGuide.find('.tip-attendence').css('width', `${ attendencePercent }%`);

    $chartGuide.find('.bar-icon-filled').css('width', `${ spokenPercent }%`);
    $chartGuide.find('.tip-spoken').css('width', `${ spokenPercent }%`);

    $chartGuide.find('.marker-1, .marker-line-1, .tip-mean-attendence').css('left', `${ meanAttendencePercent }%`);
    $chartGuide.find('.marker-2, .marker-line-2, .tip-mean-spoken').css('left', `${ meanSpokenPercent }%`);
    $chartGuide.find('.js-stat-mean-attendence-rate').html(meanSpokenPercent.toFixed(1));
    $chartGuide.find('.js-stat-mean-attendence-count').html(Math.round(meanAttendence));
    $chartGuide.find('.js-stat-mean-spoken-count').html(Math.round(meanSpoken));
  },


  initRows: function() {
    data = _.sortBy(data, 'attendence').reverse();
    let $rows = _.map(data, (d) => {
      let attendencePercent = d.attendence / totalSittings * 100;
      let spokenPercent = d.spoken / totalSittings * 100;

      let $row = $(rowTemplate({ data: d, attendenceRate: Math.round(attendencePercent * 10) / 10 }));
      $row.find('.bar-filled').css('width', `${ attendencePercent }%`);
      $row.find('.bar-icon-filled').css('width', `${ spokenPercent }%`);
      return $row;
    });
    $('.chart-content').html($rows);
  }

});
