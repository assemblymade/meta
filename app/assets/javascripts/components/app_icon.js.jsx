/** @jsx React.DOM */

(function() {
  var AppIcon = React.createClass({
    getDefaultProps: function() {
      return {
        size: 24
      };
    },

    render: function() {
      var size = this.props.size.toString();

      return <img className="app-icon" src={this.props.app.logo_url} height={size} width={size} />;
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = AppIcon;
  }

  window.AppIcon = AppIcon;
})();
