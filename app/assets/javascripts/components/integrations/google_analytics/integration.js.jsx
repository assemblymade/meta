

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
        return <span className="px1 glyphicon glyphicon-ok green" />
      }

      return <span />;
    },

    configure: function(e) {
      e.stopPropagation();

      this.setState({
        modalShown: true
      });
    },

    configureColumn: function() {
      if (this.props.editable) {
        return (
          <td>
            <a href="javascript:void(0);"
                className="btn btn-sm btn-default"
                onClick={this.configure}>
              Configure
            </a>
            {this.modal()}
          </td>
        );
      }

      return <td />;
    },

    getInitialState: function() {
      return {
        activated: this.props.initialActivated,
        modalShown: false
      };
    },

    integrationLink: function() {
      var product = this.props.product;
      var provider = 'google';

      if (this.props.editable) {
        return (
          <a href={'/' + product.slug + '/integrations/' + provider + '/authorize'} id={provider}>
            <img height="20" src={this.props.logo} />
          </a>
        );
      }

      return <img height="20" src={this.props.logo} />;
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
            {this.integrationLink()}
          </td>
          <td className="gray-2">
            {this.props.description}
          </td>
          {this.configureColumn()}
        </tr>
      );
    }
  });
})();
