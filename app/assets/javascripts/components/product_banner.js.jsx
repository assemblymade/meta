/** @jsx React.DOM */

(function() {
  var COOKIE_NAME = 'asm_banner';
  var Cookie = require('../cookie');

  var ProductBanner = React.createClass({
    componentWillMount: function() {
      if (app.currentUser() || Cookie.getCookie(COOKIE_NAME)) {
        this.setState({
          display: 'none'
        });
      }
    },

    componentDidMount: function() {
      if (this.state.display !== 'none') {
        $('#hide-banner').tooltip();
      }
    },

    dismiss: function(e) {
      e.preventDefault();

      Cookie.createCookie(COOKIE_NAME, true, 1);

      this.setState({
        display: 'none'
      });
    },

    getInitialState: function() {
      return {
        display: 'inline-block'
      };
    },

    render: function() {
      return (
        <div className="banner" style={{
          'margin-top': '10px',
          display: this.state.display,
          'background-color': '#f3f3f3',
          'width': '100%',
          'padding': '10px',
          'margin': '0px',
          'line-height': '1.5em',
          'font-size': '1.1em',
          'font-weight': 'bold'
        }}>
          How do I <a style={{ cursor: 'pointer' }} onClick={this.showModal}>get started</a>?
          <span id="hide-banner"
                style={{
                  cursor: 'pointer',
                  'padding-left': '10px'
                }}
                onClick={this.dismiss}
                data-toggle="tooltip"
                data-placement="right"
                title="Hide this banner">
            <span className="icon icon-close"></span>
          </span>
        </div>
      );
    },

    showModal: function(e) {
      e.preventDefault();

      $('#info-modal').modal();

      analytics.track('product.getting_started_modal.show', { product: app.currentAnalyticsProduct().get('product_slug') });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ProductBanner;
  }

  window.ProductBanner = ProductBanner;
})();
