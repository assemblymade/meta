var Avatar = require('../ui/avatar.js.jsx');
var Footer = require('../ui/footer.js.jsx');
var ProgressBar = require('../ui/progress_bar.js.jsx');
var SmallTile = require('../ui/small_tile.js.jsx');
var SvgIcon = require('../ui/svg_icon.js.jsx');
var UserStore = require('../../stores/user_store');

var Idea = React.createClass({
  displayName: 'Idea',

  propTypes: {
    idea: React.PropTypes.shape({
      comments_count: React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired,
      short_body: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired,
      user: React.PropTypes.object.isRequired
    }).isRequired
  },

  getInitialState: function() {
    return {
      currentUserId: UserStore.getId()
    };
  },

  render: function() {
    var idea = this.props.idea;
    var user = idea.user;

    return (
      <div className="item">
        <SmallTile>
          <div className="main">
            <a href={idea.url}>
              <div className="xh4">
                {idea.name}
              </div>

              <div className="content">
                <p dangerouslySetInnerHTML={{ __html: idea.short_body }} />
              </div>
            </a>
          </div>

          <Footer>
            <div className="action-bar">
              <div className="item">
                <div className="details-group">
                  <a href={user.url} className="inline-block">
                    <Avatar user={user} />
                    <span>{this.renderUsername()}</span>
                  </a>
                </div>
              </div>

              <div className="item">
                <div className="action-group">
                  <div className="item">
                    <a href={idea.url} className="comment-count">
                      <SvgIcon type={'svg-icon-comment'} />
                      {idea.comments_count} {idea.comments_count === 1 ? 'Comment' : 'Comments'}
                    </a>
                  </div>

                  <div className="item">
                    <a href="#" className="action-icon">
                      <SvgIcon type={'svg-icon-share'} />
                    </a>
                  </div>

                  <div className="item">
                    <a href="#" className="action-icon">
                      <SvgIcon type={'svg-icon-heart'} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="item">
                <ProgressBar progress={idea.temperature} />
              </div>
            </div>
          </Footer>
        </SmallTile>
      </div>
    );
  },

  renderUsername: function() {
    var user = this.props.idea.user;

    if (this.state.currentUserId === user.id) {
      return 'you';
    }

    return user.username;
  }
});

module.exports = Idea;
