/** @jsx React.DOM */

(function() {
  var Avatar = React.createClass({
    propTypes: {
      avatar_url: React.PropTypes.string,
      size: React.PropTypes.oneOfType([ React.PropTypes.number, React.PropTypes.string ]),
      user: React.PropTypes.object
    },

    getDefaultProps: function() {
      return {
        size: 24,
        style: {}
      };
    },

    render: function() {
      var size = this.props.size.toString();

      return <img className="avatar"
          src={this.avatarUrl()}
          height={size}
          width={size}
          style={this.props.style} />;
    },

    avatarUrl: function() {
      if (this.props.avatar_url) {
        return this.props.avatar_url
      }

      if (!this.props.user || !this.props.user.avatar_url || this.props.alwaysDefault) {
        return '/assets/avatars/default.png';
      }

      return this.props.user.avatar_url;
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Avatar;
  }

  window.Avatar = Avatar;
})();
