#!/usr/bin/env node

var fs = require('fs');
var mkdirp = require('mkdirp');
var jsdom = require('jsdom').jsdom;
var _ = require('underscore');
var jquery = require('jquery');
var $;

function loadHTML(path) {
  var html = fs.readFileSync(path, { encoding: 'utf8' });
  var window = jsdom(html).parentWindow;
  $ = jquery(window);
}

// Load MP attendance data
loadHTML('./tasks/mp_attendance.html');

// Parse html
var data = $('tbody tr').map(function(index, elem) {
  var cols = $(elem).find('td');
  return {
    party: $(cols[0]).html().trim(),
    name: $(cols[1]).html().trim(),
    grc: $(cols[2]).html().trim(),
    attendance: parseInt($(cols[3]).html())
  };
}).get();

// Load MP spoken in sessions data
loadHTML('./tasks/mp_spoken.html');

$('tbody tr').each(function(index, elem) {
  var cols = $(elem).find('td');
  var name = $(cols[1]).html();
  var mp = _.find(data, function(d){ return d.name.toLowerCase() == name.toLowerCase().trim() });
  if (!mp) {
    console.log('Cannot find MP with name"' + name + '"');
    return
  }
  mp.spoken = parseInt($(cols[3]).html());
});

// Write JSON
var path = './app/scripts/data';
mkdirp.sync(path);
fs.writeFileSync(path + '/mp.json', JSON.stringify(data));


// Load GPC data
loadHTML('./tasks/gpc.html');

// Parse html
var data = $('tbody tr').map(function(index, elem) {
  var cols = $(elem).find('td');
  return {
    name:             $(cols[0]).html().trim(),
    portfolio:        $(cols[1]).html().trim(),
    spokenNonRelated: parseInt($(cols[2]).html()),
    spokenRelated:    parseInt($(cols[3]).html()),
    spoken:           parseInt($(cols[4]).html())
  };
}).get();

// Write JSON
fs.writeFileSync(path + '/gpc.json', JSON.stringify(data));
