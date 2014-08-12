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

      return <img className="avatar img-circle" height={size} src={this.avatarUrl()} width={size} />;
    },

    avatarUrl: function() {
      if (!this.props.user || this.props.alwaysDefault) {
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
