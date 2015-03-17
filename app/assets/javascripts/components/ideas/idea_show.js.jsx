'use strict';

const Avatar = require('../ui/avatar.js.jsx');
const Button = require('../ui/button.js.jsx');
const Discussion = require('../ui/discussion.js.jsx');
const Drawer = require('../ui/drawer.js.jsx');
const Heart = require('../heart.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const Idea = require('./idea.js.jsx');
const IdeaLovers = require('./idea_lovers.js.jsx');
const IdeaProgressBar = require('./idea_progress_bar.js.jsx');
const IdeaSharePanel = require('./idea_share_panel.js.jsx');
const IdeaStore = require('../../stores/idea_store');
const IdeaTile = require('./idea_tile.js.jsx');
const LoveStore = require('../../stores/love_store');
const Markdown = require('../markdown.js.jsx');
const moment = require('moment');
const NewCommentActionCreators = require('../../actions/new_comment_action_creators');
const page = require('page');
const ProgressBar = require('../ui/progress_bar.js.jsx');
const SvgIcon = require('../ui/svg_icon.js.jsx');
const TextPost = require('../ui/text_post.js.jsx');
const Tile = require('../ui/tile.js.jsx');
const UserStore = require('../../stores/user_store');
const Checklist = require('../checklist.js.jsx');
const ProductStateIndicator = require('../product_state_indicator.js.jsx');
const ProductStateWidget = require('../product_state_widget.js.jsx');

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

let IdeaShow = React.createClass({
  propTypes: {
    navigate: React.PropTypes.func,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    window.scrollTo(0, 0);

    if (this.state.idea) {
      document.title = this.state.idea.name;
    }

    IdeaStore.addChangeListener(this.onIdeaChange)
    LoveStore.addChangeListener(this.onLoveChange)
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onIdeaChange)
    LoveStore.removeChangeListener(this.onLoveChange)
  },

  getInitialState() {
    return {
      idea: IdeaStore.getIdea(),
      isSocialDrawerOpen: false,
      isHowItWorksDrawerOpen: false,
      heart: {}
    };
  },

  handlePingClick(e) {
    e.stopPropagation();

    let idea = this.state.idea;
    let item = idea.news_feed_item;
    let thread = item.id;
    let text = 'Hey @' + idea.user.username + ', how can I help you build this?';

    NewCommentActionCreators.updateComment(thread, text);

    let $commentBox = $('#event_comment_body');

    $('html, body').animate({
      scrollTop: $commentBox.offset().top
    }, 'fast');

    $commentBox.focus();
  },

  handleShareClick() {
    this.setState({
      isSocialDrawerOpen: !this.state.isSocialDrawerOpen
    });
  },

  onIdeaChange() {
    this.setState({
      idea: IdeaStore.getIdea()
    });
  },

  onLoveChange: function() {
    if (!_.isNull(this.state.idea)) {
      this.setState({
        heart: (LoveStore.get(this.state.idea.news_feed_item.id) || {})
      })
    }
  },

  onRelatedIdeasChange() {
    this.setState({
      relatedIdeas: RelatedIdeaStore.getRelatedIdeas()
    });
  },

  render() {
    let idea = this.state.idea

    if (_.isEmpty(idea)) {
      return null;
    }

    let nfi = idea.news_feed_item;

    // Discussion expects the NFI to have a url
    nfi.url = idea.url;

    return (
      <div>
        <div className="subnav bg-white py3 md-show lg-show mb3">
          <div className="container clearfix">
            <div className="left">
              <h3 className="mt2 mb2">
                What inspires you?
              </h3>
              <h4 className="gray-2">The ideas with the most hearts will be built by the community.</h4>
            </div>
            <div className="center right py1">
              <Button type="primary" action={function() { page('/ideas/new'); }}>
                Start your product idea
              </Button>
              <p className="mt2"><a href="/start">Learn more</a></p>
            </div>
          </div>
        </div>

        <div className="container">

          <div className="clearfix mxn2">
            <div className="col col-8 px2">
              <Discussion newsFeedItem={nfi}>
                <Idea idea={idea} />
              </Discussion>
            </div>
            <div className="col col-4 px2">
              <ProductStateWidget entity={idea} />
              <div className="mb3 ">
                <Tile>
                  <div className="p3">
                    <IdeaSharePanel idea={idea} size="large" />
                  </div>
                </Tile>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  },

  // Stuff for the share thingy

  handleTwitterClick(e) {
    e.preventDefault()
    window.open(
      twitterUrl(this.shareUrl(), this.state.idea.name),
      'twitterwindow',
      'height=450, width=550, top=' +
        ($(window).height()/2 - 225) +
        ', left=' +
        $(window).width()/2 +
        ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0'
    )
  },

  handleFacebookClick(e) {
    e.preventDefault()

    FB.ui({
      method: 'share',
      display: 'popup',
      href: this.shareUrl()
    });
  },

  shareUrl() {
    return this.state.idea.url
  },

  mailToLink() {
    return "mailto:?subject=Check this out&body=Check out this on Assembly: " + this.shareUrl()
  }
});

module.exports = IdeaShow;

function twitterUrl(url, message) {
  return `http://twitter.com/share?url=${url}&text=${message}&`;
}
