

(function() {
  var GoogleAnalyticsIntegration = require('./google_analytics/integration.js.jsx');

  var Integrations = React.createClass({
    propTypes: {
      product: React.PropTypes.object.isRequired
    },

    render: function() {
      var product = this.props.product;

      return (
        <table className="table">
          <GoogleAnalyticsIntegration {...this.props.google} product={product} editable={this.props.editable} />
        </table>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Integrations;
  }

  window.Integrations = Integrations;
})();
