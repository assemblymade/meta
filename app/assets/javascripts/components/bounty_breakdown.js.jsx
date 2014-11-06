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
        <Lightbox title="How many coins is this bounty worth?">
          <div style={{ 'min-width': '300px' }}>
            <div className="row border-bottom mb1" style={{ padding: '6px 30px' }}>
              <div className="col-xs-12">
                <a onClick={this.handleShowDetailsClicked} className="h6 gray bg-white right" href="#">
                  {this.state.showingDetails ? 'Hide' : 'Show'} details
                </a>

                <div className="mt1">
                  <span className="bold mr1 h6">Current value</span>
                  {' '}
                  <span className="text-coins bold mt1 mb0 h6">
                    <span className="icon icon-app-coin"></span>
                    {' '}
                    {numeral(this.props.contracts.earnable).format('0,0')}
                  </span>
                </div>

                {this.renderDetails()}
              </div>
            </div>

            <div>
              {this.renderNewOffer()}
            </div>
          </div>

          <div className="modal-footer form-actions">
            <div className="left left-align" style={{ 'line-height': 36 }}>
              <div className="bold mt0 mb1 h6">
                Your vote
              </div>
              <div className="text-coins bold mt0 mb0 h1">
                <span className="icon icon-app-coin"></span>
                {' '}
                {numeral(this.state.offer).format('0,0')}
              </div>
            </div>

            <div style={{ 'margin-top': 27 }}>
              <button className="btn btn-primary" name="button" type="submit" onClick={this.handleOfferClicked}>Vote</button>
            </div>
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
