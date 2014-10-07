/** @jsx React.DOM */

(function() {
  var Avatar = React.createClass({
    getDefaultProps: function() {
      return {
        size: 24
      };
    },

    render: function() {
      var size = this.props.size && this.props.size.toString();

      return <img className="avatar img-circle" src={this.avatarUrl()} height={size} width={size} />;
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
