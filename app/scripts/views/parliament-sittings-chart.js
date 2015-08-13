// views/parliament-sittings-chart.js

let $        = require('jquery');
let _        = require('underscore');
let d3       = require('d3');
let Backbone = require('backbone');
let data     = JSON.parse(require('../data/mp.json'));
let SettingsBar = require('../views/ps-chart-settings-bar');
let rowTemplate = _.template(require('../templates/ps-chart-row.html'));

let totalSittings = 115;

module.exports = Backbone.View.extend({

  initialize: function(options) {
    // Calculate aggregate stats
    this.meanAttendence = d3.mean(data, (d) => d.attendence);
    this.meanSpoken = d3.mean(data, (d) => d.spoken);
    this.meanAttendencePercent = this.meanAttendence / totalSittings * 100;
    this.meanSpokenPercent = this.meanSpoken / totalSittings * 100;

    // Add settings bar
    this.settingsBar = new SettingsBar({ el: $('.chart-settings') });
    this.listenTo(this.settingsBar, 'settingsDidChange', this.renderRows);

    this.initChartGuide();
    this.renderRows();
  },


  initChartGuide: function() {

    // Chart guide
    let $chartGuide = $('.chart-guide');

    let attendencePercent = 80;
    let spokenPercent = 40;

    $chartGuide.find('.bar-filled, .tip-attendence').css('width', `${ attendencePercent }%`);
    $chartGuide.find('.bar-icon-filled, .tip-spoken').css('width', `${ spokenPercent }%`);

    $chartGuide.find('.marker-1').css('left', `${ this.meanAttendencePercent }%`);
    $chartGuide.find('.marker-2').css('left', `${ this.meanSpokenPercent }%`);
    $chartGuide.find('.marker-line-1').css('margin-left', `${ this.meanAttendencePercent }%`);
    $chartGuide.find('.marker-line-2').css('margin-left', `${ this.meanSpokenPercent }%`);
    $chartGuide.find('.js-stat-mean-attendence-rate').html(this.meanAttendencePercent.toFixed(1));
    $chartGuide.find('.js-stat-mean-attendence-count').html(Math.round(this.meanAttendence));
    $chartGuide.find('.js-stat-mean-spoken-count').html(Math.round(this.meanSpoken));
  },


  getFormattedData: function() {
    let formattedData = data;

    switch (this.settingsBar.getSortSetting()) {
      case 'attendence':
        formattedData = _.sortBy(formattedData, 'attendence').reverse();
        break;
      case 'spoken':
        formattedData = _.sortBy(formattedData, 'spoken').reverse();
        break;
    }
    
    return formattedData;
  },


  renderRows: function() {
    let $rows = _.map(this.getFormattedData(), (d) => {
      let attendencePercent = d.attendence / totalSittings * 100;
      let spokenPercent = d.spoken / totalSittings * 100;

      let $row = $(rowTemplate({ data: d, attendenceRate: Math.round(attendencePercent * 10) / 10 }));
      $row.find('.bar-filled').css('width', `${ attendencePercent }%`);
      $row.find('.bar-icon-filled').css('width', `${ spokenPercent }%`);
      $row.find('.marker-1').css('left', `${ this.meanAttendencePercent }%`);
      $row.find('.marker-2').css('left', `${ this.meanSpokenPercent }%`);

      return $row;
    });
    $('.chart-content').html($rows);
  }

});
