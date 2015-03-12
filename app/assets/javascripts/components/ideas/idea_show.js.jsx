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

        <div className="subnav bg-white md-show lg-show mb3">
          <div className="container clearfix center">
            <ProductStateIndicator activeStage={1} />
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

              <div className="mb3">
                <Checklist entity_type={"Idea"} entity={idea} />
                <Tile>
                  <ProductStateIndicator labeled={false} activeStage={1} />

                  <div className="p3">
                    <Heart size="button" heartable_id={nfi.id} heartable_type="NewsFeedItem" />
                  </div>

                  <Drawer open={this.state.heart.user_heart}>
                    <div className="p3 bg-gray-6 border-top border-gray-5">
                      <div className="h6 center gray-2">
                        Spread this idea to help it become reality
                      </div>

                      <ul className="h3 list-reset clearfix mxn1 mb0">
                        <li className="left p1">
                          <a className="gray-3 gray-2-hover bold clickable" onClick={this.handleTwitterClick}>
                            <Icon icon="twitter" />
                          </a>
                        </li>
                        <li className="left p1">
                          <a className="gray-3 gray-2-hover bold" href="#" onClick={this.handleFacebookClick}><Icon icon="facebook" /></a>
                        </li>
                        <li className="left p1">
                          <a className="gray-3 gray-2-hover bold" href={this.mailToLink()}>
                            <Icon icon="envelope" />
                          </a>
                        </li>
                      </ul>

                    </div>
                  </Drawer>

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
