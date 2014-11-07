/** @jsx React.DOM */

(function() {
  var Lightbox = require('./lightbox.js.jsx')
  var SimpleBountyOffer = require('./simple_bounty_offer.js.jsx')

  var BountyBreakdown = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    getDefaultProps: function() {
      return {
        user: app.currentUser()
      };
    },

    getInitialState: function() {
      return {
        offers: this.props.offers,
        offer: this.props.steps[2],
        showingDetails: false
      };
    },

    componentDidMount: function() {
      var modal = $(this.getDOMNode()).modal({ show: true })
      modal.on('hidden.bs.modal', this.props.onHidden)
    },

    renderVoters: function() {
      return this.state.offers.map(function(offer) {
        return (
          <li className="left ml1">
            <Avatar user={offer.user} />
          </li>
        )
      });
    },

    renderExtraVoters: function() {
      if(this.state.offers.length <= 5) {
        return
      }

      return (
        <li className="left ml1">
          <span className="badge bg-light-gray">
            <span className="icon icon-users"></span>
            + {this.state.offers.length - 5}
          </span>
        </li>
      )
    },

    renderDetails: function() {
      if(!this.state.showingDetails) {
        return
      }

      return (
        <div className="row mt2 mb2">
          <div className="col-xs-7">
            <div className="h6 gray-dark mt0 mb1">Votes</div>

            <ul className="list-unstyled">
              {this.state.offers.map(function(offer) {
                return (
                  <li>
                    <span className="text-coins mt0 mb0" style={{ display: 'inline-block', width: '65px' }}>
                      <span className="icon icon-app-coin"></span>
                      {' '}
                      {numeral(offer.earnable).format('0,0')}
                    </span>
                    {' '}
                    by <a href={offer.user.url}>@{offer.user.username}</a>
                    {' '}
                    <span className="h6 gray-dark">
                      (owns {numeral(offer.influence).format('0%')})
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="col-xs-5">
            <div className="h6 gray-dark mt0 mb1">Tip Contracts</div>
            {BountyContracts({contracts: this.props.contracts, product: this.props.product})}
          </div>
        </div>
      )
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

            <div className="gray-dark h6">
              Your vote will be weighted according to your ownership in {this.props.product.name}.
            </div>
          </div>

          <div style={{ 'min-width': '300px' }}>
            <div className="border-bottom px3 py2">
              <a onClick={this.handleShowDetailsClicked} className="h6 mt0 mb0 gray-dark bg-white right" href="#">
                {this.state.showingDetails ? 'Hide' : 'Show'} details
              </a>

              <div className="bold h6 mt0 mb0">
                <span className="mr1">
                  Current value
                </span>
                <span className="text-coins">
                  <span className="icon icon-app-coin"></span>
                  {' '}
                  {numeral(this.props.contracts.earnable).format('0,0')}
                </span>
              </div>

              {this.renderDetails()}
            </div>

            {this.renderNewOffer()}
          </div>

          <div className="p3 border-top clearfix">
            <div className="bold mt0 mb1 h6">
              Your vote
            </div>

            <div className="left text-coins bold mt0 mb0 h1" style={{ 'line-height': 38 }}>
              <span className="icon icon-app-coin"></span>
              {' '}
              {numeral(this.state.offer).format('0,0')}
            </div>

            <button className="btn btn-primary right px4" name="button" type="submit" onClick={this.handleOfferClicked}>Vote</button>
          </div>
        </Lightbox>
      )
    },

    renderNewOffer: function() {
      return this.transferPropsTo(
        <VoteBountyOffer onChange={this.handleOfferChanged} />
      )
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
