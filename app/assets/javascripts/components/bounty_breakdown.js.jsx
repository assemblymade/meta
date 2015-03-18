(function() {
  var Lightbox = require('./lightbox.js.jsx')
  var SimpleBountyOffer = require('./simple_bounty_offer.js.jsx')
  var UserStore = require('../stores/user_store')

  var BountyBreakdown = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    getInitialState: function() {
      return {
        offers: this.props.offers,
        offer: this.props.steps[2],
        currentUser: UserStore.getUser()
      };
    },

    render: function() {
      return (
        <Lightbox>
          <div className="p3 border-bottom">
            <a className="close" data-dismiss="modal">
              <span className="h3" aria-hidden="true">&times;</span>
              <span className="sr-only">Close</span>
            </a>

            <div className="h3 mt0 mb0">
              How many coins is this bounty worth?
            </div>
          </div>

          <div style={{ minWidth: '300px' }}>
            {this.state.currentUser ? this.renderNewOffer() : null}
          </div>

          {this.state.currentUser ? this.renderActions() : null}
        </Lightbox>
      )
    },

    componentDidMount: function() {
      var modal = $(this.getDOMNode()).modal({ show: true })
      modal.on('hidden.bs.modal', this.props.onHidden)

      var product = app.currentAnalyticsProduct();

      if (product) {
        analytics.track('bounty.valuation.view', { product: app.currentAnalyticsProduct().get('product_slug') });
      } else {
        analytics.track('bounty.valuation.view');
      }
    },

    renderNewOffer: function() {
      return VoteBountyOffer(
        _.extend({}, this.props, {
          onChange: this.handleOfferChanged,
          user: this.state.currentUser
        })
      );
    },

    renderActions: function() {
      return <div className="p3 border-top clearfix">
        <div className="left yellow bold mt0 mb0 h1" style={{ lineHeight: '38px' }}>
          <span className="icon icon-app-coin"></span>
          {' '}
          {numeral(this.state.offer).format('0,0')}
        </div>

        <button className="btn btn-primary right px4" name="button" type="submit" onClick={this.handleOfferClicked}>Save</button>
      </div>
    },

    handleOfferChanged: function(event) {
      this.setState({
        offer: event.target.value
      })
    },

    handleOfferClicked: function() {
      window.xhr.post(
        this.props.offers_url,
        { earnable: this.state.offer },
        function(data) {
          window.location.reload()
        }
      )

      return false
    },

    handleShowDetailsClicked: function() {
      this.setState({
        showingDetails: !this.state.showingDetails
      })

      return false
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyBreakdown;
  }

  window.BountyBreakdown = BountyBreakdown;
})();
