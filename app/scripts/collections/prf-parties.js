// collections/prf-candidates.js

let _        = require('lodash'),
    Backbone = require('backbone'),
    Party    = require('../models/prf-party');

module.exports = Backbone.Collection.extend({

  model: Party

});
