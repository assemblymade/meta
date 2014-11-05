/** @jsx React.DOM */

(function() {
  var GoogleAnalyticsIntegration = require('./google_analytics/integration.js.jsx');

  var Integrations = React.createClass({
    propTypes: {
      product: React.PropTypes.object.isRequired
    },

    configure: function(provider) {

    },

    render: function() {
      var product = this.props.product;

      return (
        <table className="table">
          {GoogleAnalyticsIntegration(_.extend({}, this.props.google, { product: product }))}
        </table>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Integrations;
  }

  window.Integrations = Integrations;
})();
