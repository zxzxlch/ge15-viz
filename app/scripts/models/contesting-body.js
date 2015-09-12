// models/contesting-body.js

let _        = require('lodash'),
    Backbone = require('backbone');

/**
 * @namespace
 * @property {string} attributes.type - 'party' or 'model'
 * @property {number} attributes.seatsContested
 * @property {number} attributes.seatsWon
 * @property {number} attributes.contestedVotes
 * @property {number} attributes.contestedVotesWon
 * @property {number} attributes.contestedVotesWonRatio
 * @property {number} attributes.totalVotesWon
 * @property {number} attributes.totalVotesWonRatio
 * @property {number} attributes.seatsWonRatio
 * @property {object} attributes.previous
 * @property {Backbone.Model} model
 */
module.exports = Backbone.Model.extend({

  initialize: function (options) {
    if (options.model)
      this.model = options.model;
  },

  parse: function (options) {
    return _.pick(options, 
      'seatsContested',
      'seatsWon',
      'contestedVotes',
      'contestedVotesWon',
      'contestedVotesWonRatio',
      'totalVotesWon',
      'totalVotesWonRatio',
      'seatsWonRatio',
      'previous');
  }

});
