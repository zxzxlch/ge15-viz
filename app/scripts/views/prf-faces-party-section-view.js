// views/prf-faces-party-section-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    DivisionView = require('../views/prf-faces-division-view'),
    template = _.template(require('../templates/prf-faces-party-section.html'));

module.exports = Backbone.View.extend({

  className: 'party-section',

  initialize: function(options) {
    // Group candidates by division
    this.divisionGroups = _.chain(this.model.candidates.models).
      groupBy('attributes.division').
      map((value, key) => {
        return {
          division: key,
          candidates: value
        };
      }).
      sortByOrder(group => group.candidates.length, 'desc').
      // Group smcs together
      partition(group => group.candidates.length > 1).
      thru(partitions => {
        if (partitions[1].length) {
          let smcs = {
            division: 'Single Member Constituencies',
            candidates: _.map(partitions[1], (group) => group.candidates[0])
          };
          return partitions[0].concat(smcs);
        } else {
          return partitions[0];
        }
      }).
      value();

    let smc = _.last(this.divisionGroups).candidates.length,
        grc = this.divisionGroups.length - 1,
        wards = smc + grc;
    this.stats = { wards, smc, grc };
  },

  render: function () {
    this.$el.html(template({
      party:    this.model,
      numWards: this.stats.wards,
      numGRC:   this.stats.grc,
      numSMC:   this.stats.smc
    }));

    // Render candidates
    let candidateViews = _.map(this.divisionGroups, group => {
      // Stack candidates
      return new DivisionView(group).render().el;
    });
    this.$('.party-section-candidates').html(candidateViews);

    return this;
  }

});
