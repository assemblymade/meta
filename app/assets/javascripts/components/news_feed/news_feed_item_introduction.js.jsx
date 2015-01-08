var Avatar = require('../ui/avatar.js.jsx');
var NewsFeedItemModalMixin = require('../../mixins/news_feed_item_modal_mixin');

module.exports = React.createClass({
  displayName: 'NewsFeedItemIntroduction',

  propTypes: {
    user: React.PropTypes.object.isRequired,
    product: React.PropTypes.object.isRequired,
    target: React.PropTypes.shape({
      bio: React.PropTypes.string.isRequired
    }).isRequired,
    url: React.PropTypes.string.isRequired
  },

  mixins: [NewsFeedItemModalMixin],

  render: function() {
    if (!this.props.enableModal) {
      return this.renderIntroduction();
    }

    var user = this.props.user;
    var product = this.props.product;
    var target = this.props.target;

    return (
      <a className="block p3 center" href={this.props.url} onClick={this.handleClick}>
        <div className="h4 black mt0 mb0">Welcome @{user.username}</div>
        <div className="h5 gray-2 mt0 mb0">to {product.name}</div>

        <div className="py2 mx-auto mb2" style={{width: 144}}>
          <Avatar user={user} size={144} />
        </div>

        <div className="h5 bold mt0 mb0 gray-1">{user.username}:</div>

        <div className="gray-darker">
          {target.bio}
        </div>
      </a>
    );
  },

  renderIntroduction: function() {
    var user = this.props.user;
    var product = this.props.product;
    var target = this.props.target;

    return (
      <span className="block p3 center">
        <div className="h4 black mt0 mb0">Welcome
          {' '} <a href={user.url}>@{user.username}</a>
        </div>

        <div className="h5 gray-2 mt0 mb0">to {product.name}</div>

        <div className="py2 mx-auto mb2" style={{width: 144}}>
          <Avatar user={user} size={144} />
        </div>

        <div className="h5 bold mt0 mb0 gray-1">{user.username}:</div>

        <div className="gray-darker">
          {target.bio}
        </div>
      </span>
    );
  }
});
