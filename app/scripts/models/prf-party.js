// models/prf-party.js

let _        = require('lodash'),
    Backbone = require('backbone'),
    Candidates = require('../collections/prf-candidates');

/**
 * @namespace
 * @property {string} id  - pap/wp/nsp...
 * @property {string} attributes.name
 * @property {Backbone.collection} candidates
 * @method   {object} getCandidatesCount
 * @method   {object} getDivisions
 */
module.exports = Backbone.Model.extend({

  initialize: function () {
    this.candidates = new Candidates();
    this.listenTo(this.candidates, 'add', this.didAddCandidate);
    this.listenTo(this.candidates, 'remove', this.didRemoveCandidate);
  },

  didAddCandidate: function (candidate) {
    candidate.set('party', this);
  },

  didRemoveCandidate: function (candidate) {
    candidate.unset('party', this);
  }

});
