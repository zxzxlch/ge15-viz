// views/prf-teams-party-section-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    DivisionView = require('../views/prf-teams-division-view'),
    template = _.template(require('../templates/prf-party-section.html')),
    descriptionTemplate = _.template(require('../templates/prf-teams-party-section-description.html'));

module.exports = Backbone.View.extend({

  className: 'party-section party-section-teams',

  initialize: function(options) {
    this.stats = {};

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
          // Calculate stats
          this.stats = {
            candidates: this.model.candidates.length,
            wards: partitions[0].length + partitions[1].length,
            grc: partitions[0].length,
            smc: partitions[1].length
          };
          return partitions[0].concat(smcs);
        } else {
          // Calculate stats
          this.stats = {
            candidates: this.model.candidates.length,
            wards: partitions[0].length,
            grc: partitions[0].length,
            smc: 0
          };
          return partitions[0];
        }
      }).
      value();
  },

  render: function () {
    this.$el.html(template({
      party: this.model
    }));

    this.$('.party-section-description').
      html(descriptionTemplate(this.stats));

    // Render divisions
    let $divisions = _.map(this.divisionGroups, group => {
      // Stack candidates
      return new DivisionView(group).render().el;
    });
    this.$('.party-section-content').
      addClass('candidate-face-group').
      html($divisions);

    // Hide if all candidates are filtered
    let hide = _.every($divisions, elem => $(elem).hasClass('hide'));
    this.$el.toggleClass('hide', hide);

    return this;
  },

  isFiltered: function () {
    return _.every(this.model.candidates.models, candidate => candidate.get('filtered'));
  }

});
