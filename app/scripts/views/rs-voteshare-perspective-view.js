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
            id:    'contestedVoteShare',
            label: 'Contested vote share',
          }
        ]
      }
    ]
  },

  constituencyStatsTmpl: _.template('<% if (type == "grc") { %> <%= seats %>-seat group constituency<% } else { %>Single-member constituency<% } %> consisting of <%= voters.toLocaleString() %> voters won by <%= winningParty %>'),

  teamStatsTmpl: _.template('<%= votesWon.toLocaleString() %> / <%= (votesWonRatio * 100).toFixed(1) %>%'),

  teamCaptionTmpl: _.template('<% if (won) { %>Won<% } else { %>Lost<% } %> with <%= votesWon.toLocaleString() %> votes'),

  popvoteDescriptionTmpl: _.template('Took <%= totalVotesWon.toLocaleString() %> of <%= totalVotes.toLocaleString() %> total votes. Won <%= seatsWon %> of <%= seatsContested %> seats contested.'),

  contestedVoteShareDescriptionTmpl: _.template('Achieved <%= contestedVotesWon.toLocaleString() %> of <%= contestedVotes.toLocaleString() %> contested votes. Won <%= seatsWon %> of <%= seatsContested %> seats contested.'),


  initialize: function (options) {
    PerspectiveView.prototype.initialize.apply(this, arguments);
  },

  loadQuery: function (options) {
    if (options.view == 'wards') {
      // Sort teams
      this.constituencies.each(con => {
        con.teams.comparator = (a, b) => {
          return (a.get('votesWon') > b.get('votesWon')) ? -1 : 1;
        };
        con.teams.sort();
      });
      if (options.sort == 'numVoters') {
        // Sort constituencies
        this.constituencies.comparator = (a, b) => {
          return (a.get('voters') > b.get('voters')) ? -1 : 1;
        };
        this.constituencies.sort();
      }
      else if (options.sort == 'voteWard') {
        // Sort constituencies
        this.constituencies.comparator = (a, b) => {
          return (a.teams.at(0).get('votesWonRatio') > b.teams.at(0).get('votesWonRatio')) ? -1 : 1;
        };
        this.constituencies.sort();
      }
      else if (options.sort == 'closeFights') {
        // Sort constituencies
        this.constituencies.comparator = (a, b) => {
          return (a.teams.at(0).get('votesWonRatio') < b.teams.at(0).get('votesWonRatio')) ? -1 : 1;
        };
        this.constituencies.sort();
      }
      this.renderWards();
    }
    else if (options.view == 'parties') {
      if (options.sort == 'popvote') {
        this.contestingBodies.comparator = (a, b) => {
          return (a.get('totalVotesWon') > b.get('totalVotesWon')) ? -1 : 1;
        };
        this.contestingBodies.sort();
      }
      else if (options.sort == 'contestedVoteShare') {
        this.contestingBodies.comparator = (a, b) => {
          return (a.get('contestedVotesWonRatio') > b.get('contestedVotesWonRatio')) ? -1 : 1;
        };
        this.contestingBodies.sort();
      }
      this.renderParties(options);
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
  },

  renderParties: function (options) {
    let $sections = this.contestingBodies.map(contestingBody => {
      let description;
      if (options.sort == 'popvote') {
        description = this.popvoteDescriptionTmpl({
          totalVotesWon:  contestingBody.get('totalVotesWon'),
          totalVotes:     this.stats.totalVotes,
          seatsWon:       contestingBody.get('seatsWon'),
          seatsContested: contestingBody.get('seatsContested')
        });
      } else if (options.sort == 'contestedVoteShare') {
        description = this.contestedVoteShareDescriptionTmpl({
          contestedVotesWon: contestingBody.get('contestedVotesWon'),
          contestedVotes:    contestingBody.get('contestedVotes'),
          seatsWon:          contestingBody.get('seatsWon'),
          seatsContested:    contestingBody.get('seatsContested')
        });
      }

      let $section = $(vizSectionTmpl({
        headingIcon: true,
        title: contestingBody.model.get('name'),
        description: description
      }));

      // Insert party logo or candidate image
      let $headingIcon;
      if (contestingBody.get('type') == 'party') {
        $headingIcon = $('<div>').attr('class', 'party-logo ' + contestingBody.model.id);
      } else {
        $headingIcon = new CandidateView({ model: contestingBody.model }).render().el;
      }
      $section.find('.heading-icon').html($headingIcon);

      // Render content
      let value = (options.sort == 'popvote') ? contestingBody.get('totalVotesWonRatio') : contestingBody.get('contestedVotesWonRatio');
      let $bar = $(vizBarTmpl({
        filled: value
      }));
      if (options.sort == 'contestedVoteShare') {
        $bar.find('.wrapper').css('width', (contestingBody.get('contestedVotes') / this.stats.totalVotes * 100) + '%');
      }
      let $barFigure = $('<div>').
        attr('class', 'stats').
        html((value * 100).toFixed(1) + '%');
      $section.find('.content').
        addClass('content-split').
        html([$barFigure, $bar]);

      return $section;
    });

    this.$el.html($sections);
  }

});
