// views/rs-voteshare-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Common   = require('../lib/common'),
    PerspectiveView = require('../views/perspective-view'),
    CandidateView = require('../views/prf-candidate-view'),
    vizSectionTmpl = _.template(require('../templates/viz-section.html')),
    vizTeamSubsectionTmpl = _.template(require('../templates/viz-team-subsection.html')),
    vizBarTmpl = _.template(require('../templates/viz-bar.html'));

module.exports = PerspectiveView.extend({

  className: 'viz-content viz-rs viz-rs-voteshare',

  definition: {
    id:        'voteshare',
    label:     'Vote share',
    search:    false,
    views: [
      {
        id:    'wards',
        label: 'Wards',
        sorts: [
          {
            id:    'closeFights',
            label: 'Close fights',
          }, {
            id:    'voteWard',
            label: 'Biggest wins',
          }, {
            id:    'numVoters',
            label: 'Electorate size',
          }
        ]
      }, {
        id:    'parties',
        label: 'Parties',
        sorts: [
          {
            id:    'popvote',
            label: 'Popular vote',
          }, {
            id:    'avgWard',
            label: 'Avg. vote share by ward',
          }
        ]
      }
    ]
  },

  constituencyStatsTmpl: _.template('<% if (type == "grc") { %> <%= seats %>-seat group constituency<% } else { %>Single-member constituency<% } %> consisting of <%= voters.toLocaleString() %> voters won by <%= winningParty %>'),

  teamStatsTmpl: _.template('<%= votesWon.toLocaleString() %> / <%= (votesWonRatio * 100).toFixed(1) %>%'),

  teamCaptionTmpl: _.template('<% if (won) { %>Won<% } else { %>Lost<% } %> with <%= votesWon.toLocaleString() %> votes'),


  initialize: function (options) {
    PerspectiveView.prototype.initialize.apply(this, arguments);
  },

  loadQuery: function (options) {
    if (options.view == 'wards') {
      if (options.sort == 'numVoters') {
        // Sort teams
        this.constituencies.each(con => {
          con.teams.comparator = (a, b) => {
            return (a.get('votesWon') > b.get('votesWon')) ? -1 : 1;
          };
          con.teams.sort();
        });
        // Sort constituencies
        this.constituencies.comparator = (a, b) => {
          return (a.get('voters') > b.get('voters')) ? -1 : 1;
        };
        this.constituencies.sort();
      }
      else if (options.sort == 'voteWard') {
        // Sort teams
        this.constituencies.each(con => {
          con.teams.comparator = (a, b) => {
            return (a.get('votesWon') > b.get('votesWon')) ? -1 : 1;
          };
          con.teams.sort();
        });
        // Sort constituencies
        this.constituencies.comparator = (a, b) => {
          return (a.teams.at(0).get('votesWonRatio') > b.teams.at(0).get('votesWonRatio')) ? -1 : 1;
        };
        this.constituencies.sort();
      }
      else if (options.sort == 'closeFights') {
        // Sort teams
        this.constituencies.each(con => {
          con.teams.comparator = (a, b) => {
            return (a.get('votesWon') > b.get('votesWon')) ? -1 : 1;
          };
          con.teams.sort();
        });
        // Sort constituencies
        this.constituencies.comparator = (a, b) => {
          return (a.teams.at(0).get('votesWonRatio') < b.teams.at(0).get('votesWonRatio')) ? -1 : 1;
        };
        this.constituencies.sort();
      }
      this.renderWards();
    }
  },

  renderWards: function () {
    let $constituencies = this.constituencies.map(constituency => {
      // Already sorted by winning team
      let winningTeam = constituency.teams.at(0);
      let stats = this.constituencyStatsTmpl({
        type:         constituency.get('type'),
        seats:        constituency.get('seats'),
        voters:       constituency.get('voters'),
        winningParty: winningTeam.party.get('name')
      });
      let $constituency = $(vizSectionTmpl({
        title: constituency.get('name'),
        description: stats
      }));

      // Render teams
      let $teams = constituency.teams.map(team => {
        let $team = $(vizTeamSubsectionTmpl({
          partyId: team.party.id,
          stats: (team.get('votesWonRatio') * 100).toFixed(1) + '%',
          caption: this.teamCaptionTmpl({
            won: team.get('won'),
            votesWon: team.get('votesWon')
          })
        }));

        // Candidates
        let $candidates = team.candidates.map(candidate => {
          return new CandidateView({ model: candidate }).render().el;
        });
        $team.find('.team-candidates').html($candidates);

        // Bar
        let $bar = $(vizBarTmpl({
          filled: team.get('votesWonRatio')
        }));
        $team.find('.content').html($bar);

        return $team;
      });
      $constituency.find('.content').html($teams);

      return $constituency;
    });

    this.$el.html($constituencies);
  }

});
