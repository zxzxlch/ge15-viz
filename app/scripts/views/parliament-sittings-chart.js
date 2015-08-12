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
    data = _.sortBy(data, 'spoken').reverse();
    let $rows = _.map(data, (d) => {
      let $row = $(rowTemplate({ data: d, totalSittings: totalSittings }));
      let attendencePercent = d.attendence / totalSittings * 100;
      let spokenPercent = d.spoken / totalSittings * 100;
      $row.find('.bar-filled').css('width', `${ attendencePercent }%`);
      $row.find('.bar-icon-filled').css('width', `${ spokenPercent }%`);
      return $row;
    });
    $('.chart-content').html($rows);
  }

});
