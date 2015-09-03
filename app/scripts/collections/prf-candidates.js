// collections/prf-candidates.js

let _        = require('lodash'),
    Backbone = require('backbone'),
    Candidate = require('../models/prf-candidate');

module.exports = Backbone.Collection.extend({

  model: Candidate

});
