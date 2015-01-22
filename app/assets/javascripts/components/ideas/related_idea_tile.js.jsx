var Avatar = require('../ui/avatar.js.jsx');
var SvgIcon = require('../ui/svg_icon.js.jsx');
var UserStore = require('../../stores/user_store');

var RelatedIdeaTile = React.createClass({
  propTypes: {
    idea: React.PropTypes.shape({
      comments_count: React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired,
      news_feed_item: React.PropTypes.shape({
        hearts_count: React.PropTypes.number.isRequired
      }),
      url: React.PropTypes.string.isRequired,
      user: React.PropTypes.object.isRequired
    }).isRequired
  },

  getInitialState() {
    return {
      currentUserId: UserStore.getId()
    };
  },

  render() {
    var idea = this.props.idea;
    var item = idea.news_feed_item;
    var user = idea.user;
    return (
      <div className="bg-white shadow rounded p2">
        <h5 className="mb2 mt0" style={{ fontWeight: 'normal' }}>
          <a href={idea.url}>{idea.name}</a>
        </h5>

        <div className="clearfix">
          <div className="left">
            <a href={user.url} className="clearfix">
              <span className="left mr2"><Avatar user={user} /></span>
              <span className="black bold right">{user.username}</span>
            </a>
          </div>

          <div className="right">
            <a href={idea.url} className="gray-2 comment-count mr2">
              <SvgIcon type="comment" /> {idea.comments_count}
            </a>

            <a href={idea.url} className="gray-2 comment-count">
              <SvgIcon type="heart" /> {item.hearts_count}
            </a>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = RelatedIdeaTile;
