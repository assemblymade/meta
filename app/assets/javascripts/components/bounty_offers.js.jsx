/** @jsx React.DOM */

(function() {
  var BountyOffers = React.createClass({
    render: function() {
      return <table className="table table-sm small">
        <tbody>
          {this.props.offers.map(function(offer){
            return <BountyOffer offer={offer} product={this.props.product} />
          }.bind(this))}
        </tbody>
      </table>
    }
  })

  var BountyOffer = React.createClass({
    render: function() {
      var offer = this.props.offer
      return <tr>
        <td>
          <a href={offer.user.url}>@{offer.user.username}</a>
          <span className="text-muted">
            ({numeral(offer.influence).format('0%')})
          </span>
        </td>
        <td className="text-right">
          <span className="icon icon-app-coin icon-left text-coins">
            {numeral(offer.amount).format('0,0')}
          </span>
          <span>
            {this.props.product.name}
            coins
          </span>
        </td>
      </tr>
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyOffers;
  }

  window.BountyOffers = BountyOffers;
})();
