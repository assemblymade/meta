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
        <div className="bg-white py4 border-bottom overflow-hidden hidden-xs" data-dismissable="welcome">
          <div className="container relative">
            <div className="welcome-banner-left absolute"></div>
            <div className="welcome-banner-right absolute"></div>

            <div className="clearfix">
              <div className="sm-col sm-col-8">
            <button type="button" className="close js-dismiss mr2" onClick={this.onClick}>
              <span>&times;</span>
            </button>

                <h2 className="mt0 mb2">Welcome to Assembly</h2>
                <p className="h4 mt0 mb2 light">
                  We are a community of people who have ideas and build them. Everything here is a collaborative effort including the vision, development, design and marketing.
                </p>
                <p className="mb0">
                  <a href="/discover">Find products to work on</a>. Earn ownership when you <a href="/discover/bounties">complete bounties</a>.
                </p>
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
