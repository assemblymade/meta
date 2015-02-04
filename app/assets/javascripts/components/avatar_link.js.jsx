var Avatar = require('./ui/avatar.js.jsx')
var UserLink = require('./user_link.js.jsx')

var AvatarLink = React.createClass({
  render: function() {
    return (
      <UserLink {...this.props}>
        <Avatar user={this.props} />
      </UserLink>
    );
  }
});

module.exports = window.AvatarLink = AvatarLink;
