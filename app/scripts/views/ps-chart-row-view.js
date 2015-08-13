// views/ps-chart-row-view.js

let $        = require('jquery');
let _        = require('underscore');
let Backbone = require('backbone');
let template = _.template(require('../templates/ps-chart-row.html'));

module.exports = Backbone.View.extend({

  initialize: function(options) {
    let { data, maxAttendence, meanAttendencePercent, meanSpokenPercent } = options;
    let attendencePercent = data.attendence / maxAttendence * 100;
    let spokenPercent = data.spoken / maxAttendence * 100;

    let $elem = $(template({ data: data, attendenceRate: Math.round(attendencePercent * 10) / 10 }));
    $elem.find('.bar-filled').css('width', `${ attendencePercent }%`);
    $elem.find('.bar-icon-filled').css('width', `${ spokenPercent }%`);
    $elem.find('.marker-1').css('left', `${ meanAttendencePercent }%`);
    $elem.find('.marker-2').css('left', `${ meanSpokenPercent }%`);

    this.setElement($elem);
  }

});
