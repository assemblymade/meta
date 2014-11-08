/** @jsx React.DOM */

(function() {
  var AppIcon = React.createClass({
    propTypes: {
      app: React.PropTypes.object.isRequired,
      size: React.PropTypes.number,
      style: React.PropTypes.object
    },

    getDefaultProps: function() {
      return {
        size: 24,
        style: {}
      };
    },

    render: function() {
      var size = this.props.size.toString();

      return <img className="app-icon"
          src={this.props.app.logo_url}
          height={size}
          width={size}
          style={this.props.style} />;
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = AppIcon;
  }

  window.AppIcon = AppIcon;
})();
