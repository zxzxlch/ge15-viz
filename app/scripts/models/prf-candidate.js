// models/prf-candidate.js

let _        = require('lodash'),
    Backbone = require('backbone');

/**
 * @namespace
 * @property {string}   id
 * @property {string}   attributes.name
 * @property {string}   attributes.nameNative
 * @property {string}   attributes.division
 * @property {number}   attributes.age
 * @property {string}   attributes.maritalStatus
 * @property {string}   attributes.religion
 * @property {Date}     attributes.birthdate
 * @property {string}   attributes.birthplace
 * @property {string[]} attributes.partyRoles
 * @property {string[]} attributes.occupation
 * @property {string[]} attributes.almaMater
 * @property {string[]} attributes.education
 * @property {string}   attributes.email
 * @property {object}   attributes.links
 * @property {string}   attributes.links.partyProfile
 * @property {string}   attributes.links.wikipedia
 * @property {string}   attributes.links.facebook
 * @property {string}   attributes.links.cv
 * @property {Backbone.Model} attributes.party
 */
module.exports = Backbone.Model.extend({

  parse: function (data) {
    return _.pick(data,
      'id',
      'name',
      'nameNative',
      'division',
      'age',
      'maritalStatus',
      'religion',
      'birthdate',
      'birthplace',
      'partyRoles',
      'occupation',
      'almaMater',
      'education',
      'email',
      'links'
    );
  }

});
