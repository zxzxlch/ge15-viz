// views/parliament-sittings-chart.js

let $        = require('jquery');
let _        = require('underscore');
let d3       = require('d3');
let Backbone = require('backbone');
let data     = JSON.parse(require('../data/mp.json'));
let ChartGroupView  = require('../views/ps-chart-group-view');
let ChartRowView    = require('../views/ps-chart-row-view');
let SettingsBar     = require('../views/ps-chart-settings-bar');

let maxAttendence = 115;

module.exports = Backbone.View.extend({

  initialize: function(options) {
    // Calculate aggregate stats
    this.meanAttendence = d3.mean(data, d => d.attendence);
    this.meanSpoken = d3.mean(data, d => d.spoken);
    this.meanAttendencePercent = this.meanAttendence / maxAttendence * 100;
    this.meanSpokenPercent = this.meanSpoken / maxAttendence * 100;

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
    let sortAttribute = this.settingsBar.getSortAttribute();
    let groupAttribute = this.settingsBar.getGroupAttribute();

    let formattedData = _.sortBy(data, sortAttribute).reverse();;

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
          group.stats.attendence = d3.mean(group.values, d => d.attendence);
          group.stats.spoken = d3.mean(group.values, d => d.spoken);
          group.sortValue = group.stats[sortAttribute];
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
          maxAttendence,
          meanAttendencePercent: this.meanAttendencePercent,
          meanSpokenPercent:     this.meanSpokenPercent
        }));
        return groupView.el
      });
      $('.chart-content').html($groups);

    } else {

      let $rows = _.map(formattedData, d => {
        let row = new ChartRowView({
          data: d,
          maxAttendence,
          meanAttendencePercent: this.meanAttendencePercent,
          meanSpokenPercent:     this.meanSpokenPercent });
        return row.el
      });
      $('.chart-content').html($rows);
    }
  }

});
