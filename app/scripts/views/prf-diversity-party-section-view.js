// views/prf-diversity-party-section-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    template = _.template(require('../templates/prf-party-section.html'));
    // descriptionTemplate = _.template(require('../templates/prf-teams-party-section-description.html'))

module.exports = Backbone.View.extend({

  className: 'party-section party-section-diversity',

  initialize: function(options) {
    this.stats = {};

    // Group candidates by gender or minority
    this.candidateGroups = _.groupBy(this.model.candidates.models, candidate => {
      if ((options.sort == 'gender' && candidate.get('gender') == 'female') ||
        (options.sort == 'minorities' && candidate.get('minority')))
        return 'diverse';
      return 'norm';
    });

    if (!this.candidateGroups.diverse) this.candidateGroups.diverse = [];

    // Calculate stats
    this.diverseCount = this.candidateGroups.diverse.length
    this.diverseRatio = this.diverseCount / this.model.candidates.length;
    let diverseAdj = (options.sort == 'gender') ? 'female' : (options.sort == 'minorities') ? 'minority' : null;
    this.description = `${this.diverseCount} ${diverseAdj} candidates out of ${this.model.candidates.length} candidates with a ratio of ${this.diverseRatio.toFixed(2)}`;
  },

  render: function () {
    this.$el.html(template({
      party: this.model
    }));

    // Set description
    this.$('.party-section-description').html(this.description);

    // Render candidates groups
    let $diverseGroup = $('<div>').
      attr('class', 'viz-split-column candidate-group-diverse').
      html(_.map(this.candidateGroups.diverse, candidate => candidate.view.render().el));
    let $normGroup = $('<div>').
      attr('class', 'viz-split-column candidate-group-norm').
      html(_.map(this.candidateGroups.norm, candidate => candidate.view.render().el));
    this.$('.party-section-content').html([$diverseGroup, $normGroup]);

    return this;
  },

  isFiltered: function () {
    return _.every(this.model.candidates.models, candidate => candidate.get('filtered'));
  }

});
