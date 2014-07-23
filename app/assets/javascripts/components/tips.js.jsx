/** @jsx React.DOM */

(function() {

COIN_INCREMENT = 100
DEBOUNCE_TIMEOUT = 2000

window.TipsUI = React.createClass({
  getDefaultProps: function() {
    var currentUser = app.currentUser()
    if (currentUser) {
      currentUser = currentUser.attributes
    }

    return {
      currentUser: currentUser,
      url: app.product.get('url') + '/tips'
    }
  },

  getInitialState: function() {
    return {
      tips: _.reduce(this.props.tips, function(h, tip) { h[tip.from.id] = tip; return h }, {}),
      userCents: app.currentProductBalance(),
      pendingCents: 0
    }
  },

  componentDidMount: function() {
    $(this.refs.button.getDOMNode()).tooltip()
  },

  render: function() {
    var totalCents = this.totalCents()

    var tooltip = null
    if (this.props.currentUser == null) {
      tooltip = 'You need to sign up before you can tip'
    } else if (this.state.userCents <= 0) {
      tooltip = 'You have no coins to tip'
    } else if (this.currentUserIsRecipient()) {
      tooltip = "You can't tip yourself"
    }

    var tippers = null
    if (totalCents > 0) {
      tippers = <Tippers tips={this.tips()} />
    }

    return (
      <div className="js-tips">
        <div className={totalCents > 0 ? 'text-coins' : null}>
          <a ref="button" href="javascript:;" data-placement="top" data-toggle="tooltip" title={tooltip} onClick={this.currentUserCanTip() ? this.handleClick : null}>
            <span className="icon icon-app-coin"></span>
            {numeral(this.totalCents() / 100).format('0,0')}
          </a>
          {tippers}
        </div>
      </div>
    )
  },

  optimisticTip: function() {
    var update = { pendingCents: { $set: this.state.pendingCents + COIN_INCREMENT }, tips: {}}

    var tip = this.state.tips[this.props.currentUser.id]
    if (tip) {
      update.tips[this.props.currentUser.id] = { $merge: { cents: tip.cents + COIN_INCREMENT } }
    } else {
      update.tips[this.props.currentUser.id] = { $set: { from: this.props.currentUser, cents: COIN_INCREMENT } }
    }

    this.setState(React.addons.update(this.state, update))
  },

  save: _.debounce(function() {
    $.ajax({
      type: "POST",
      url: this.props.url,
      dataType: 'json',
      data: {
        tip: {
          add: this.state.pendingCents,
          via_type: this.props.viaType,
          via_id: this.props.viaId
        }
      },
      complete: function() {
        this.setState({pendingCents: 0})
    }.bind(this)})
  }, DEBOUNCE_TIMEOUT),

  handleClick: function() {
    this.optimisticTip()
    this.save()
  },

  currentUserCanTip: function() {
    return this.state.userCents > 0 && !this.currentUserIsRecipient()
  },

  currentUserIsRecipient: function() {
    return this.props.currentUser.id == this.props.recipient.id
  },

  totalCents: function() {
    return _.reduce(_.map(this.tips(), func.dot('cents')), func.add, 0)
  },

  tips: function() {
    return _.values(this.state.tips)
  }
})

var Tippers = React.createClass({
  render: function() {
    return (
      <span className="text-muted">&mdash; tipped by
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
})

})();
