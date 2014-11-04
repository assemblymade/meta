/** @jsx React.DOM */

(function() {
  var GoogleAnalyticsModal = require('./modal.js.jsx');

  module.exports = React.createClass({
    displayName: 'GoogleAnalyticsIntegration',
    propTypes: {
      initialActivated: React.PropTypes.bool.isRequired,
      initialAccount: React.PropTypes.string,
      initialProfile: React.PropTypes.string,
      initialProperty: React.PropTypes.string,
      description: React.PropTypes.string.isRequired,
      logo: React.PropTypes.string.isRequired,
      product: React.PropTypes.object.isRequired
    },

    check: function() {
      if (this.state.activated) {
        return <span className="px1 glyphicon glyphicon-ok text-success" />
      }

      return <span />;
    },

    configure: function(e) {
      e.stopPropagation();

      this.setState({
        modalShown: true
      });
    },

    getInitialState: function() {
      return {
        activated: this.props.initialActivated,
        modalShown: false
      };
    },

    modal: function() {
      if (this.state.modalShown) {
        return GoogleAnalyticsModal(_.extend({}, this.props, { onHidden: this.onModalHidden} ));
      }

      return null;
    },

    onModalHidden: function() {
      this.setState({
        modalShown: false
      });
    },

    render: function() {
      var product = this.props.product;
      var provider = 'google';

      return (
        <tr>
          <td style={{ width: '10px' }}>
            {this.check()}
          </td>
          <td>
            <a href={'/' + product.slug + '/integrations/' + provider} id={provider}>
              <img height="20" src={this.props.logo} />
            </a>
          </td>
          <td className="text-muted">
            {this.props.description}
          </td>
          <td>
            <a href="javascript:void(0);"
                className="btn btn-sm btn-default"
                onClick={this.configure}>
              Configure
            </a>
            {this.modal()}
          </td>
        </tr>
      );
    }
  });
})();
