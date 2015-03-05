

(function() {
  var Cookie = require('../cookie');
  var Lightbox = require('./lightbox.js.jsx');
  var marked = require('marked');
  var COOKIE_NAME = 'asm_product_info';

  var InfoModal = React.createClass({
    assembly: function() {
      return (
        <div>
          <p>
            Startups on Assembly are unlike traditional companies. They don't have investors,
            shareholders, or even employees. Instead, a global community creates and owns them, together.
          </p>

          <p>
            Anyone can dive in and contribute &mdash; even Assembly is being built <a href='/chat'>out in the open</a>.
            At the end of each month, a product's proceeds are split among its contributors.
          </p>
        </div>
      );
    },

    componentDidMount: function() {
      var product = this.props.product;

      if (app.currentUser() || Cookie.getCookie(COOKIE_NAME)) {
        return;
      }

      analytics.track('product.getting_started_modal.view', { product: app.currentAnalyticsProduct().get('product_slug') });

      Cookie.createCookie(COOKIE_NAME, true);

      $(this.getDOMNode()).modal();
    },

    gettingStarted: function() {
      return (
        <p>
          Whether you're a developer who writes x86 assembly in her sleep, a designer who rivals Michalengelo,
          a marketer who sells ice to penguins, or anything in between, there's a product on Assembly that would
          love your help. Sign up, claim a bounty, submit work, repeat.
        </p>
      );
    },

    logo: function() {
      return <img src={this.props.product.poster} className='alpha mb2' style={{ width: '100px', paddingTop: '0px' }} />;
    },

    render: function() {
      var product = this.props.product;

      return (
        <Lightbox id="info-modal" title={product.name + ' is being crowd-built on Assembly.'}>
          <div className="modal-body">
            {this.what()}

            <hr />

            <h4>Crowd-building on Assembly</h4>
            {this.assembly()}

            <hr />
            <h4>How do I get started?</h4>
            {this.gettingStarted()}

            <hr />

            <a className="btn btn-primary btn-block" style={{ cursor: 'pointer' }} onClick={this.signUp}>Start building</a>
          </div>
        </Lightbox>
      );
    },

    signUp: function(e) {
      e.preventDefault();

      analytics.track('product.getting_started_modal.sign_up', { product: app.currentAnalyticsProduct().get('product_slug') });

      window.location = this.props.signup_path;
    },

    what: function() {
      var product = this.props.product;

      return (
        <div className="alpha" style={{ 'text-align': 'center' }}>
          <h4 className>{product.name}</h4>
          {this.logo()}
          <p>
            {product.pitch}
          </p>
        </div>
      );
    }
  });


  if (typeof module !== 'undefined') {
    module.exports = InfoModal;
  }

  window.InfoModal = InfoModal;
})();

