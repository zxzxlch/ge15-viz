// models/candidate.js

let _        = require('lodash'),
    Backbone = require('backbone');

/**
 * @namespace
 * @property {string}   attributes.name
 * @property {string}   attributes.nameNative
 * @property {string}   attributes.division
 * @property {number}   attributes.age
 * @property {string}   attributes.gender   - 'male' or 'female'
 * @property {boolean}  attributes.minority
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
 * @property {boolean}  attributes.filtered
 * @property {Backbone.Model} party
 * @property {Backbone.Model} constituency
 * @property {Backbone.Model} team
 * @property {Backbone.View}  view
 * @method getPartyId
 * @method setFilter
 */
module.exports = Backbone.Model.extend({

  initialize: function (options) {
    this.set('filtered', false, { silent: true });
  },

  parse: function (data) {
    return _.pick(data,
      'id',
      'name',
      'nameNative',
      'age',
      'gender',
      'minority',
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

  setFilter: function (searchString) {
    if (!searchString) {
      this.set('filtered', false);
      return;
    }

    let re = new RegExp(searchString, 'i');

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

    this.set('filtered', !matched);
  },

  getPartyId: function () {
    return this.party.id;
  }

});
