// views/prf-tweets-party-section-view.js

let $        = require('jquery'),
    _        = require('lodash'),
    Backbone = require('backbone'),
    Twitter  = require('../lib/twitter'),
    template = _.template(require('../templates/prf-party-section.html')),
    contentTemplate = _.template(require('../templates/prf-tweets-party-section-content.html'));

let twitterData = {
  'pap': {
    embedId: '641232449146519556',
    hashtags: ['PAPRally'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%23paprally+from%3ASGmiddleground%2C+OR+from%3ATODAYonline%2C+OR+from%3AYahooSG%2C+OR+from%3Asingapolitics+include%3Aretweets'
  },
  'wp': {
    embedId: '641274479809708034',
    hashtags: ['WPRally'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%23wprally+from%3ASGmiddleground%2C+OR+from%3ATODAYonline%2C+OR+from%3AYahooSG%2C+OR+from%3Asingapolitics+include%3Aretweets'
  },
  'nsp': {
    embedId: '641274737188933632',
    hashtags: ['NSPRally'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%23nsprally+from%3ASGmiddleground%2C+OR+from%3ATODAYonline%2C+OR+from%3AYahooSG%2C+OR+from%3Asingapolitics+include%3Aretweets'
  },
  'singfirst': {
    embedId: '641274925391605764',
    hashtags: ['SingFirstRally'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%23singfirstrally+from%3ASGmiddleground%2C+OR+from%3ATODAYonline%2C+OR+from%3AYahooSG%2C+OR+from%3Asingapolitics+include%3Aretweets'
  },
  'sdp': {
    embedId: '641275198298157057',
    hashtags: ['SDPRally'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%23sdprally+from%3ASGmiddleground%2C+OR+from%3ATODAYonline%2C+OR+from%3AYahooSG%2C+OR+from%3Asingapolitics+include%3Aretweets'
  },
  'sda': {
    embedId: '641275364291969026',
    hashtags: ['SDARally'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%23sdarally+from%3ASGmiddleground%2C+OR+from%3ATODAYonline%2C+OR+from%3AYahooSG%2C+OR+from%3Asingapolitics+include%3Aretweets'
  },
  'spp': {
    embedId: '641275550032531456',
    hashtags: ['SPPRally'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%23spprally+from%3ASGmiddleground%2C+OR+from%3ATODAYonline%2C+OR+from%3AYahooSG%2C+OR+from%3Asingapolitics+include%3Aretweets'
  },
  'rp': {
    embedId: '641275691929964547',
    hashtags: ['RPRally'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%23rprally+from%3ASGmiddleground%2C+OR+from%3ATODAYonline%2C+OR+from%3AYahooSG%2C+OR+from%3Asingapolitics+include%3Aretweets'
  },
  'ppp': {
    embedId: '641275815821336576',
    hashtags: ['PPPRally'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%23ppprally+from%3ASGmiddleground%2C+OR+from%3ATODAYonline%2C+OR+from%3AYahooSG%2C+OR+from%3Asingapolitics+include%3Aretweets'
  },
  'ind': {
    embedId: '641281731903926273',
    hashtags: ['SamirSalimNeji', 'HanHuiHui'],
    twitterSearchUrl: 'https://twitter.com/search/?q=%22samir+salim+neji%22+OR+%22han+hui+hui%22+include%3Aretweets&ref_src=twsrc%5Etfw'
  }
}

module.exports = Backbone.View.extend({

  className: 'party-section',

  initialize: function(options) {
    _.assign(this, twitterData[this.model.id]);

    this.render();
  },

  render: function () {
    this.$el.html(template({
      party: this.model
    }));

    let $hashtags = _.map(this.hashtags, hashtag => {
      return $('<a>').
        attr('class', 'hashtag-link').
        attr('target', '_blank').
        attr('href', 'https://twitter.com/search/?q=%23' + hashtag).
        html('#' + hashtag);
    });
    this.$('.party-section-description').
      html($hashtags);

    this.$('.party-section-content').
      addClass('party-section-tweets').
      html(contentTemplate({
        twitterSearchUrl: this.twitterSearchUrl
      }));

    // Render tweets
    this.loadTwitterTimeline();

    return this;
  },

  loadTwitterTimeline: function () {
    Twitter.ready(twitter => {
      twitter.widgets.createTimeline(this.embedId, this.$('.party-section-tweets-embed').get(0), {
        width: '520',
        tweetLimit: 3,
        chrome: 'noheader, nofooter, noborders, noscrollbar',
        related: 'SGmiddleground,TODAYonline,YahooSG,singapolitics'
      });
    })
  }

});
