// models/prf-candidate.js

let _        = require('lodash'),
    Backbone = require('backbone');

/**
 * @namespace
 * @property {string}   id
 * @property {Backbone.Model} party
 * @property {Backbone.View}  view
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
 * @property {string}   attributes.imagePath
 * @property {object}   attributes.links
 * @property {string}   attributes.links.partyProfile
 * @property {string}   attributes.links.wikipedia
 * @property {string}   attributes.links.facebook
 * @property {string}   attributes.links.cv
 * @method setFilter
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
  },

  setFilter: function (query) {
    let re = new RegExp(query, 'i');

    // Filter name, nameNative, party, division
    let matched = _.chain(this.attributes).
      pick('name', 'nameNative', 'division').
      values().
      thru(values => {
        return values.concat(this.party.get('name'));
      }, this).
      any((value, key) => {
        return re.test(value);
      }).
      value();

    this.trigger('filter', !matched);
  }

});
