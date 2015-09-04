// views/ps-app-view.js

let $        = require('jquery');
let _        = require('underscore');
let d3       = require('d3');
let Backbone = require('backbone');
let data     = JSON.parse(require('../data/mp.json'));
let ChartGroupView  = require('../views/ps-chart-group-view');
let ChartRowView    = require('../views/ps-chart-row-view');
let SettingsBar     = require('../views/ps-chart-settings-bar');

let maxAttendance = 115;

module.exports = Backbone.View.extend({

  initialize: function(options) {
    // Calculate aggregate stats
    this.meanAttendance = d3.mean(data, d => d.attendance);
    this.meanSpoken = d3.mean(data, d => d.spoken);
    this.meanAttendancePercent = this.meanAttendance / maxAttendance * 100;
    this.meanSpokenPercent = this.meanSpoken / maxAttendance * 100;

    // Add settings bar
    this.settingsBar = new SettingsBar({ el: $('.viz-settings') });
    this.listenTo(this.settingsBar, 'settingsDidChange', this.renderRows);

    this.initChartGuide();
    this.renderRows();
  },


  initChartGuide: function() {

    // Chart guide
    let $chartGuide = $('.chart-guide');

    let attendancePercent = 80;
    let spokenPercent = 40;

    $chartGuide.find('.bar-filled, .tip-attendance').css('width', `${ attendancePercent }%`);
    $chartGuide.find('.bar-icon-filled, .tip-spoken').css('width', `${ spokenPercent }%`);

    $chartGuide.find('.marker-1').css('left', `${ this.meanAttendancePercent }%`);
    $chartGuide.find('.marker-2').css('left', `${ this.meanSpokenPercent }%`);
    $chartGuide.find('.marker-line-1').css('margin-left', `${ this.meanAttendancePercent }%`);
    $chartGuide.find('.marker-line-2').css('margin-left', `${ this.meanSpokenPercent }%`);
    $chartGuide.find('.js-stat-mean-attendance-rate').html(this.meanAttendancePercent.toFixed(1));
    $chartGuide.find('.js-stat-mean-attendance-count').html(Math.round(this.meanAttendance));
    $chartGuide.find('.js-stat-mean-spoken-count').html(Math.round(this.meanSpoken));
  },


  getFormattedData: function() {
    let sortAttribute = this.settingsBar.getSortAttribute();
    let groupAttribute = this.settingsBar.getGroupAttribute();

    let formattedData;
    if (sortAttribute == "spoken/attended") {
      formattedData = _.sortBy(data, d => (d.spoken / d.attendance)).reverse();
    } else {
      formattedData = _.sortBy(data, sortAttribute).reverse();
    }

    // Group by attribute
    if (groupAttribute != 'none') {
      formattedData = d3.nest().key(d => d[groupAttribute]).entries(formattedData)
      // Aggregate members of each group
      formattedData = _.chain(formattedData)
        .each(group => {
          // Set attributes for convenience
          group.party = group.values[0].party;
          if (groupAttribute == 'grc') {
            group.grc = group.values[0].grc;
          }

          // Calculate mean of sort attribute for each group
          group.stats = {};
          group.stats.attendance = d3.mean(group.values, d => d.attendance);
          group.stats.spoken = d3.mean(group.values, d => d.spoken);
          if (sortAttribute == "spoken/attended") {
            group.sortValue = d3.mean(group.values, d => (d.spoken / d.attendance));
          } else {
            group.sortValue = group.stats[sortAttribute];
          }
        })
        .sortBy(group => group.sortValue)
        .value()
        .reverse();
    }
    
    return formattedData;
  },


  renderRows: function() {
    let formattedData = this.getFormattedData();

    if (formattedData[0].stats) {

      let $groups = _.map(formattedData, group => {
        let groupView = new ChartGroupView(_.extend(group, {
          maxAttendance,
          meanAttendancePercent: this.meanAttendancePercent,
          meanSpokenPercent:     this.meanSpokenPercent
        }));
        return groupView.el
      });
      $('.viz-content').html($groups);

    } else {

      let $rows = _.map(formattedData, d => {
        let row = new ChartRowView({
          data: d,
          maxAttendance,
          meanAttendancePercent: this.meanAttendancePercent,
          meanSpokenPercent:     this.meanSpokenPercent });
        return row.el
      });
      $('.viz-content').html($rows);
    }
  }

});
