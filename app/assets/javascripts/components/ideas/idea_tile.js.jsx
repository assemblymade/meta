var Avatar = require('../ui/avatar.js.jsx');
var Drawer = require('../ui/drawer.js.jsx');
var Footer = require('../ui/footer.js.jsx');
var Heart = require('../heart.js.jsx');
var IdeaProgressBar = require('./idea_progress_bar.js.jsx');
var IdeaSharePanel = require('./idea_share_panel.js.jsx');
var ProgressBar = require('../ui/progress_bar.js.jsx');
var Share = require('../ui/share.js.jsx');
var SmallTile = require('../ui/small_tile.js.jsx');
var SvgIcon = require('../ui/svg_icon.js.jsx');
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
      <SmallTile>
        <div className="main">
          <div className="xh4">
            <a href={idea.url}> {idea.name}</a>
          </div>

          <div className="content">
            <p dangerouslySetInnerHTML={{ __html: idea.short_body }} />
          </div>
        </div>

        <Footer>
          <div className="action-bar">
            <div className="item">
              <div className="details-group">
                <a href={user.url} className="inline-block">
                  <Avatar user={user} />
                  <span>{user.username}</span>
                </a>
              </div>
            </div>

            <div className="mxn3">
              <Drawer open={this.state.isDrawerOpen}>
                <IdeaSharePanel idea={idea} />
              </Drawer>
            </div>

            <div className="item">
              <div className="action-group">
                <div className="item">
                  <a href={idea.url} className="comment-count">
                    <SvgIcon type="comment" />
                    {idea.comments_count} {idea.comments_count === 1 ? 'Comment' : 'Comments'}
                  </a>
                </div>

                <div className="item">
                  <a href="javascript:void(0);" onClick={this.handleShareClick}>
                    <SvgIcon type="share" />
                  </a>
                </div>

                <div className="item">
                  <Heart size="medium" heartable_id={item.id} heartable_type="NewsFeedItem" />
                </div>
              </div>
            </div>

            <div className="item">
              <div className="py3 px3">
                <IdeaProgressBar idea={idea} />
              </div>
            </div>
          </div>
        </Footer>
      </SmallTile>
    );
  }
});

module.exports = Idea;
