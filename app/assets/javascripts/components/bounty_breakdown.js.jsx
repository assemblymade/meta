/** @jsx React.DOM */

(function() {
  var Lightbox = require('./lightbox.js.jsx')

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
        newOffer: this.props.averageBounty * 0.10,
        saving: false,
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
        <div className="row mt2">
          <div className="col-xs-12">
            <div className="h6 gray-dark mt0 mb1">Votes</div>
            <ul className="list-unstyled">
              {this.state.offers.map(function(offer) {
                return (
                  <li>
                    <span className="text-coins mt0 mb0" style={{ display: 'inline-block', width: '60px' }}>
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

            <p className="mt2">Not sure how this works? <a href="#">Read the guide</a></p>
          </div>
        </div>
      )
    },

    render: function() {
      return (
        <Lightbox title="Vote on this bounty">
          <div style={{ 'min-width': '300px' }}>
            <div className="row p2 border-bottom" style={{ 'margin-top': '-9px', 'padding-bottom': '18px' }}>
              <div className="col-xs-12">
                <div className="row">
                  <div className="col-xs-6">
                    <div className="h6 gray-dark mt0 mb1">Value</div>
                    <div className="text-coins bold h3 mt0 mb0">
                      <span className="icon icon-app-coin"></span>
                      {' '}
                      {numeral(this.props.contracts.earnable).format('0,0')}
                    </div>
                  </div>
                  <div className="col-xs-6">
                    <div className="h6 gray-dark mt0 mb1">Voters</div>
                    <div className="clearfix">
                      <ul className="list-reset mb0 mxn1 overflow-hidden full-width" style={{ height: '2rem' }}>
                        {this.renderVoters()}
                        {this.renderExtraVoters()}
                      </ul>
                    </div>
                  </div>
                </div>

                {this.renderDetails()}
              </div>
            </div>

            <div className="center" style={{ position: 'absolute', 'margin-top': '-16px', width: '90%' }}>
              <a onClick={this.handleShowDetailsClicked} className="h6 p1 gray bg-white" href="#">
                {this.state.showingDetails ? 'Hide' : 'Show'} details
              </a>
            </div>

            {this.renderNewOffer()}
          </div>
        </Lightbox>
      )
    },

    renderNewOffer: function() {
      return this.transferPropsTo(
        <SimpleNewBountyOffer />
      )
    },

    newOffer: function() {
      return <div>

        <h5>How many coins do you think this is worth?</h5>

        <form className="form">
          <NewBountyOffer
            product={this.props.product}
            user={this.props.user}
            maxOffer={this.props.maxOffer}
            newOffer={this.state.newOffer}
            averageBounty={this.props.averageBounty}
            onChange={this.handleOfferChanged} />

          {this.offerButton()}
        </form>
      </div>
    },

    handleOfferChanged: function(newOffer) {
      this.setState({newOffer: newOffer})
    },

    handleOfferClicked: function() {
      this.setState({saving: true})

      window.xhr.post(
        this.props.offersPath,
        { amount: this.state.newOffer },
        function(data) {
          window.location.reload()
        }
      )
      return false
    },

    offerButton: function() {
      if (this.state.saving) {
        return <a className="btn btn-default btn-block btn-xs" style={{"margin-top": "20px"}} disabled>
          Saving...
          <div className="pull-right spinner"><div className="spinner-icon"></div></div>
        </a>
      } else {
        return <a id="slider" className="btn btn-default btn-block btn-xs" style={{"margin-top": "20px"}} href="#" onClick={this.handleOfferClicked}>
          Value this at {numeral(this.state.newOffer).format('0,0')} {this.props.product.name} Coins
        </a>
      }
    },

    handleShowDetailsClicked: function() {
      this.setState({ showingDetails: !this.state.showingDetails })
      return false
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyBreakdown;
  }

  window.BountyBreakdown = BountyBreakdown;
})();
