/** @jsx React.DOM */

(function() {
  var WB = require('../constants').WELCOME_BANNER;
  var Dispatcher = require('../dispatcher');
  var WelcomeBannerStore = require('../stores/welcome_banner_store');

  var WelcomeBanner = React.createClass({
    onClick: function() {
      Dispatcher.dispatch({
        action: WB.ACTIONS.WELCOME_BANNER_DISMISSED,
        data: this.props.userPath
      });
    },

    render: function() {
      return (
        <div className="bg-primary hidden-xs" style={{ padding: '15px 0' }} data-dismissable="welcome">
          <button type="button" className="close js-dismiss pull-right" style={{ 'margin-right': '25px' }} onClick={this.onClick}>
            <span>&times;</span>
          </button>

          <div className="container">
            <div className="row">
              <div className="col-md-6 lead omega">
                <strong>Welcome to Assembly,</strong> a community of people who have ideas and build them. Everything here is a collaborative effort including the vision, development, design and marketing.
              </div>
              <div className="col-md-2">
                <span className="lead"><strong>Collaborate</strong><br/></span> Jump into any

                <a href={this.props.discoverBountiesPath} style={{ color: 'white', 'text-decoration': 'underline' }}>open bounties</a>

                on products that interest you.
              </div>
              <div className="col-md-2">
                <span className="lead"><strong>Earn</strong><br/></span> Your contributions to products are rewarded with its App Coins.
              </div>
              <div className="col-md-2">
                <span className="lead"><strong>Share</strong><br/></span>Each month the products revenue is split with those that have App Coins.
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = WelcomeBanner;
  }

  window.WelcomeBanner = WelcomeBanner;
})();
