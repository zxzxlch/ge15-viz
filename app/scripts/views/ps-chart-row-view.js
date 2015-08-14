// views/ps-chart-row-view.js

let $        = require('jquery');
let _        = require('underscore');
let Backbone = require('backbone');
let template = _.template(require('../templates/ps-chart-row.html'));

module.exports = Backbone.View.extend({

  initialize: function(options) {
    let { data, maxAttendance, meanAttendancePercent, meanSpokenPercent } = options;
    let attendancePercent = data.attendance / maxAttendance * 100;
    let spokenPercent = data.spoken / maxAttendance * 100;

    let $elem = $(template({ data: data, attendanceRate: Math.round(attendancePercent * 10) / 10 }));
    $elem.find('.bar-filled').css('width', `${ attendancePercent }%`);
    $elem.find('.bar-icon-filled').css('width', `${ spokenPercent }%`);
    $elem.find('.marker-1').css('left', `${ meanAttendancePercent }%`);
    $elem.find('.marker-2').css('left', `${ meanSpokenPercent }%`);

    this.setElement($elem);
  }

});
