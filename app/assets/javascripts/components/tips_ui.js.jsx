var ProductStore = require('../stores/product_store');
var TipActions = require('../actions/tip_actions')
var TipsStore = require('../stores/tips_store')

var COIN_INCREMENT = [1, 1, 1, 2, 5, 5, 5, 5, 25, 25, 25, 50]
var DEBOUNCE_TIMEOUT = 2000

var TipsUi = React.createClass({
  getInitialState: function() {
    return this.getStateFromStore()
  },

  render: function() {
    var totalCents = this.state.totalTip,
        opacity = 1.0,
        tooltip = null,
        currentUser = window.app.currentUser() && window.app.currentUser().attributes,
        product = ProductStore.getProduct() || app.product,
        url = (product.url || (product && product.get && product.get('url'))) + '/tips';

    if (!currentUser) {
      tooltip = 'You need to sign up before you can tip'
    } else if (this.state.userCents <= 0) {
      opacity = 0.5
      tooltip = 'You have no coins to tip'
    } else if (this.currentUserIsRecipient()) {
      tooltip = "You can't tip yourself"
    }

    return (
      <div className="js-tips" style={{opacity: opacity}}>
        <div className={totalCents > 0 ? 'yellow' : null}>
          <a ref="button"
              href="javascript:void(0);"
              data-placement="top"
              data-toggle="tooltip"
              title={tooltip}
              onClick={this.currentUserCanTip() ? this.handleClick : null}
              style={{ color: totalCents > 0 ? '#f0ad4e' : '#d3d3d3' }}>
            <span className="icon icon-app-coin"></span>
            {this.renderTotalCents()}
          </a>
        </div>
      </div>
    )
  },

  renderTotalCents: function() {
    var totalCents = this.state.totalTip + this.state.pendingCents

    if (totalCents > 0) {
      return (
        <span>
          {numeral(totalCents).format('0,0')}
        </span>
      );
    }
  },

  componentDidMount: function() {
    $(this.refs.button.getDOMNode()).tooltip()
    TipsStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function() {
    TipsStore.removeChangeListener(this._onChange)
  },


  optimisticTip: function() {
    var currentUser = window.app.currentUser().attributes
    var increment = COIN_INCREMENT[Math.min(this.state.pendingClicks, COIN_INCREMENT.length-1)]

    this.setState({
      pendingClicks: this.state.pendingClicks + 1,
      pendingCents: Math.min(this.state.userCents, this.state.pendingCents + increment)
    })
  },

  save: _.debounce(function() {
    TipActions.tip(ProductStore.getSlug(), this.props.viaType, this.props.viaId, this.state.pendingCents)

    this.setState({
      userTip: this.state.userTip + this.state.pendingCents,
      totalTip: this.state.totalTip + this.state.pendingCents,
      pendingCents: 0,
      pendingClicks: 0
    })
  }, DEBOUNCE_TIMEOUT),

  handleClick: function() {
    this.optimisticTip()
    this.save()
  },

  currentUserCanTip: function() {
    return this.state.userCents > 0 && !this.currentUserIsRecipient()
  },

  currentUserIsRecipient: function() {
    var currentUser = window.app.currentUser().attributes
    return currentUser.id == this.props.recipient.id
  },

  tips: function() {
    return _.values(this.state.tips)
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  },

  getStateFromStore: function() {
    return {
      totalTip: TipsStore.getTotalTip(this.props.viaId),
      userTip: TipsStore.getUserTip(this.props.viaId),
      userCents: app.currentProductBalance(),
      pendingCents: 0,
      pendingClicks: 0
    }
  }
})

var Tippers = React.createClass({
  render: function() {
    return (
      <span className="gray-2">&mdash; tipped by &nbsp;
        <ul className="list-inline-media">
          {_.map(this.props.tips, this.row)}
        </ul>
      </span>
    )
  },

  row: function(tip) {
    return (
      <li key={tip.from.id}>
        <img
          className="img-circle"
          src={tip.from.avatar_url}
          alt={'@' + tip.from.username}
          data-toggle="tooltip"
          data-placement="top"
          title={'@' + tip.from.username}
          width="16" height="16" />
      </li>
    )
  }
});

module.exports = window.TipsUi = TipsUi;
