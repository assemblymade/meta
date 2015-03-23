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
    var user = idea.user

    return (
      <Tile>
        <div className="clearfix px2 py1">
          <div className="left pr1 py3">
            <Heart size="medium" heartable_id={item.id} heartable_type="NewsFeedItem" />
          </div>

          <div className="right py2 sm-show">
            <a href={user.url} className="right p2">
              <Avatar user={user} />
            </a>

            <a href={idea.path} className="py2 px1 block right gray-3 fill-gray-3 gray-2-hover fill-gray-2-hover bold">
              <span className="mr1">
                <Icon icon="comment" />
              </span>
              {idea.comments_count}
            </a>
          </div>

          <a className="block overflow-hidden py2 pl2" href={idea.url}>
            <h4 className="mt0 mb1 black underline-hover">{idea.name}</h4>
            <OverflowFade dimension="horizontal" width="100%" height="2rem">
              <p className="gray-2">{idea.sanitized_body}</p>
            </OverflowFade>
          </a>


        </div>
      </Tile>

    );
  }
});

module.exports = Idea;
