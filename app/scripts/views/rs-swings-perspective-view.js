// views/rs-swings-perspective-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Common   = require('../lib/common'),
    PerspectiveView = require('../views/perspective-view'),
    CandidateView = require('../views/candidate-view'),
    vizSectionTmpl = _.template(require('../templates/viz-section.html')),
    vizTeamSubsectionTmpl = _.template(require('../templates/viz-team-subsection.html')),
    vizBarTmpl = _.template(require('../templates/viz-bar.html'));

module.exports = PerspectiveView.extend({

  className: 'viz-content viz-rs viz-rs-swings',

  definition: {
    id:        'voteswings',
    label:     'Vote swings',
    search:    false,
    views: [
      {
        id:    'wards',
        label: 'Wards'
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

  constituencyStatsTmpl: _.template('<% if (type == "grc") { %> <%= seats %>-seat group constituency<% } else { %>Single-member constituency<% } %> consisting of <%= voters %> voters won by <%= winningParty %>.'),

  voteSwingCaptionTmpl: _.template('<%= voteSwingPercent %>% <%= (voteSwingPercent > 0) ? "increase" : "decrease" %> in vote share from <%= prevVotesWonRatioPercent %>% in 2011 to <%= votesWonRatioPercent %>% in 2015.'),

  popvoteDescriptionTmpl: _.template('<%= totalVoteSwingPercent %>% <%= (totalVoteSwingPercent > 0) ? "increase" : "decrease" %> in popular vote share from <%= prevTotalVotesWonRatio %>% in 2011 to <%= totalVotesWonRatio %>% in 2015.'),

  contestedVoteShareDescriptionTmpl: _.template('<%= contestedVoteSwing %>% <%= (contestedVoteSwing > 0) ? "increase" : "decrease" %> in average vote share of contested wards from <%= prevContestedVotesWonRatio %>% in 2011 to <%= contestedVotesWonRatio %>% in 2015.'),


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
      
      // Sort constituencies
      this.constituencies.comparator = (a, b) => {
        a = _.chain(a.teams.models).
          filter(team => team.has('voteSwing')).
          max('attributes.voteSwing').
          value();
        a = (_.isObject(a)) ? a.get('voteSwing') : -100;
        b = _.chain(b.teams.models).
          filter(team => team.has('voteSwing')).
          max('attributes.voteSwing').
          value();
        b = (_.isObject(b)) ? b.get('voteSwing') : -100;
        return (a > b) ? -1 : 1;
      };
      this.constituencies.sort();

      this.renderWards();
    } 
    else if (options.view == 'parties') {
      let sortAttribute = (options.sort == 'popvote') ? 'totalVoteSwing' : 'contestedVoteSwing';
      let secondarySortAttribute = (options.sort == 'popvote') ? 'totalVotesWonRatio' : 'contestedVotesWonRatio';
      this.contestingBodies.comparator = (a, b) => {
        if (!a.has('previous') && !b.has('previous'))
          return (a.get(secondarySortAttribute) > b.get(secondarySortAttribute)) ? -1 : 1;
        if (!b.has('previous')) return -1;
        if (!a.has('previous')) return 1;
        return (a.get(sortAttribute) > b.get(sortAttribute)) ? -1 : 1;
      };
      this.contestingBodies.sort();
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
        voters:       Common.formatNumberCommas(constituency.get('voters')),
        winningParty: winningTeam.party.get('name')
      });
      let $constituency = $(vizSectionTmpl({
        title: constituency.get('name'),
        description: stats
      }));

      // Render teams
      let $teams = constituency.teams.map(team => {
        let stats;
        if (team.has('previous')) {
          let className = team.get('voteSwing') > 0 ? 'text-increase' : 'text-decrease';
          stats = $('<span>').
            attr('class', className).
            html(Common.formatPercentage(team.get('voteSwing')) + '%');
          stats = $('<div>').append(stats).html();
        } else {
          stats = '';
        }

        let caption;
        if (team.has('previous')) {
          caption = this.voteSwingCaptionTmpl({
            voteSwingPercent: Common.formatPercentage(team.get('voteSwing')),
            prevVotesWonRatioPercent: Common.formatPercentage(team.get('previous').votesWonRatio),
            votesWonRatioPercent: Common.formatPercentage(team.get('votesWonRatio'))
          });
        } else {
          caption = 'Did not contest in 2011 elections.'
        }
        let $team = $(vizTeamSubsectionTmpl({
          partyId: team.party.id,
          stats: stats,
          caption: caption
        }));

        // Candidates
        let $candidates = team.candidates.map(candidate => {
          return new CandidateView({ model: candidate }).render().el;
        });
        $team.find('.team-candidates').html($candidates);

        let $bar;
        // Render bar to show vote swing
        if (team.has('previous')) {
          if (team.get('votesWonRatio') > team.get('previous').votesWonRatio) {
            // Show increase
            $bar = $(vizBarTmpl({
              filled: team.get('votesWonRatio'),
              filledSecondary: team.get('previous').votesWonRatio
            }));
            $bar.find('.bar-filled').addClass('bar-increase');
          } 
          else {
            // Show decrease
            $bar = $(vizBarTmpl({
              filled: team.get('previous').votesWonRatio,
              filledSecondary: team.get('votesWonRatio')
            }));
            $bar.find('.bar-filled').addClass('bar-decrease');
          }
        }

        if (!$bar) {
          $bar = $(vizBarTmpl({ filled: team.get('votesWonRatio') }));
        }

        // Bar
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
      if (!contestingBody.has('previous')) {
        description = 'Did not contest in 2011 elections.';
      } 
      else if (options.sort == 'popvote') {
        description = this.popvoteDescriptionTmpl({
          totalVoteSwingPercent:  Common.formatPercentage(contestingBody.get('totalVoteSwing')),
          prevTotalVotesWonRatio: Common.formatPercentage(contestingBody.get('previous').totalVotesWonRatio),
          totalVotesWonRatio:     Common.formatPercentage(contestingBody.get('totalVotesWonRatio'))
        });
      }
      else if (options.sort == 'contestedVoteShare') {
        description = this.contestedVoteShareDescriptionTmpl({
          contestedVoteSwing:         Common.formatPercentage(contestingBody.get('contestedVoteSwing')),
          prevContestedVotesWonRatio: Common.formatPercentage(contestingBody.get('previous').contestedVotesWonRatio),
          contestedVotesWonRatio:     Common.formatPercentage(contestingBody.get('contestedVotesWonRatio'))
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
      let prevValue = (!contestingBody.has('previous')) ? null : (options.sort == 'popvote') ? contestingBody.get('previous').totalVotesWonRatio : contestingBody.get('previous').contestedVotesWonRatio;

      let $bar;
      // Render bar to show vote swing
      if (contestingBody.has('previous')) {
        if (value > prevValue) {
          // Show increase
          $bar = $(vizBarTmpl({
            filled: value,
            filledSecondary: prevValue
          }));
          $bar.find('.bar-filled').addClass('bar-increase');
        } 
        else {
          // Show decrease
          $bar = $(vizBarTmpl({
            filled: prevValue,
            filledSecondary: value
          }));
          $bar.find('.bar-filled').addClass('bar-decrease');
        }
      }

      if (!$bar) {
        $bar = $(vizBarTmpl({ filled: value }));
      }
      if (options.sort == 'contestedVoteShare') {
        $bar.find('.wrapper').css('width', (contestingBody.get('contestedVotes') / this.stats.totalVotes * 100) + '%');
      }
      
      let barFigure = (!contestingBody.has('previous')) ? '' : (options.sort == 'popvote') ? Common.formatPercentage(contestingBody.get('totalVoteSwing')) + '%' : Common.formatPercentage(contestingBody.get('contestedVoteSwing')) + '%';
      let $barFigure = $('<div>').
        attr('class', 'stats').
        html(barFigure);
      $section.find('.content').
        addClass('content-split').
        html([$barFigure, $bar]);

      return $section;
    });

    this.$el.html($sections);
  }

});
