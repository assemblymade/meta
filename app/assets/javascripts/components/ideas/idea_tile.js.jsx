var Avatar = require('../ui/avatar.js.jsx');
var Drawer = require('../ui/drawer.js.jsx');
var Heart = require('../heart.js.jsx');
var IdeaProgressBar = require('./idea_progress_bar.js.jsx');
var IdeaSharePanel = require('./idea_share_panel.js.jsx');
var Markdown = require('../markdown.js.jsx');
var OverflowFade = require('../ui/overflow_fade.js.jsx')
var ProgressBar = require('../ui/progress_bar.js.jsx');
var Share = require('../ui/share.js.jsx');
var SvgIcon = require('../ui/svg_icon.js.jsx');
var Tile = require('../ui/tile.js.jsx');
var UserStore = require('../../stores/user_store');

var Idea = React.createClass({
  displayName: 'Idea',

  propTypes: {
    idea: React.PropTypes.shape({
      comments_count: React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired,
      news_feed_item: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      }),
      short_body: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired,
      user: React.PropTypes.object.isRequired
    }).isRequired
  },

  getInitialState() {
    return {
      currentUserId: UserStore.getId(),
      isDrawerOpen: false
    };
  },

  handleShareClick(e) {
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen
    });
  },

  render() {
    var idea = this.props.idea;
    var item = idea.news_feed_item;
    var user = idea.user;

    return (
      <Tile>
        <OverflowFade dimension="vertical" width="100%" height="16rem">
          <div className="p3">
            <a className="h4 mt0 mb2 block" href={idea.path}>{idea.name}</a>
            <Markdown content={idea.short_body} normalized={true} />
          </div>
        </OverflowFade>

        <a href={user.url} className="block clearfix h6 mt0 mb0 black bold px3 py2">
          <div className="left mr1">
            <Avatar user={user} size={18} />
          </div>
          <div className="overflow-hidden">
            {user.username}
          </div>
        </a>

        <Drawer open={this.state.isDrawerOpen}>
          <IdeaSharePanel idea={idea} />
        </Drawer>

        <div className="clearfix gray-2 fill-gray-2 h6 border-top">
          <a href={idea.path} className="py2 px3 block left gray-2 bold">
            <span className="mr1 fill-gray-3"><SvgIcon type="comment" /></span>
            {idea.comments_count} {idea.comments_count === 1 ? 'comment' : 'comments'}
          </a>

          <div className="border-left right p2">
            <Heart size="medium" heartable_id={item.id} heartable_type="NewsFeedItem" />
          </div>

          <a href="javascript:void(0);" onClick={this.handleShareClick} className="border-left p2 block right">
            <SvgIcon type="share" />
          </a>
        </div>

        <div className="border-top px3 py2">
          <div className="mb2">
            <IdeaProgressBar idea={idea} />
          </div>
        </div>

      </Tile>
    );
  }
});

module.exports = Idea;
