/** @jsx React.DOM */

(function() {
  var Avatar = require('./ui/avatar.js.jsx')
  var UserLink = require('./user_link.js.jsx')

  var AvatarLink = React.createClass({
    render: function() {
      return UserLink(this.props, Avatar(this.props))
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = AvatarLink
  }

  window.AvatarLink = AvatarLink
})();
