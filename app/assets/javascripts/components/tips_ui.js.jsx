/** @jsx React.DOM */

(function() {

  COIN_INCREMENT = [1, 1, 1, 2, 5, 5, 5, 5, 25, 25, 25, 50]
  DEBOUNCE_TIMEOUT = 2000

  var TipsUi = React.createClass({
    getInitialState: function() {
      return {
        tips: _.reduce(this.props.tips, function(h, tip) { h[tip.from.id] = tip; return h }, {}),
        userCents: app.currentProductBalance(),
        pendingCents: 0,
        pendingClicks: 0
      }
    },

    componentDidMount: function() {
      $(this.refs.button.getDOMNode()).tooltip()
    },

    render: function() {
      var totalCents = this.totalCents(),
          opacity = 1.0,
          tooltip = null,
          currentUser = window.app.currentUser().attributes,
          url = app.product && app.product.get('url') + '/tips'

      if (!currentUser) {
        tooltip = 'You need to sign up before you can tip'
      } else if (this.state.userCents <= 0) {
        opacity = 0.5
        tooltip = 'You have no coins to tip'
      } else if (this.currentUserIsRecipient()) {
        tooltip = "You can't tip yourself"
      }

      var tippers = null
      if (totalCents > 0) {
        tippers = <Tippers tips={this.tips()} />
      }

      return (
        <div className="js-tips" style={{opacity: opacity}}>
          <div className={totalCents > 0 ? 'text-coins' : null}>
            <a ref="button" href="javascript:;" data-placement="top" data-toggle="tooltip" title={tooltip} onClick={this.currentUserCanTip() ? this.handleClick : null}>
              <span className="icon icon-app-coin"></span>
              <span> {numeral(this.totalCents()).format('0,0')}</span>
            </a>
            {tippers}
          </div>
        </div>
      )
    },

    optimisticTip: function() {
      var currentUser = window.app.currentUser().attributes
      var increment = COIN_INCREMENT[Math.min(this.state.pendingClicks, COIN_INCREMENT.length-1)]
      var update = {
        pendingClicks: { $set: this.state.pendingClicks + 1 },
        pendingCents: {
          $set: this.state.pendingCents + increment
        }, tips: {}}

      var tip = this.state.tips[currentUser.id]
      if (tip) {
        update.tips[currentUser.id] = { $merge: { cents: tip.cents + increment } }
      } else {
        update.tips[currentUser.id] = { $set: { from: this.props.currentUser, cents: increment } }
      }

      this.setState(React.addons.update(this.state, update))
    },

    save: _.debounce(function() {
      var url = app.product && app.product.get('url') + '/tips';

      $.ajax({
        type: "POST",
        url: url,
        dataType: 'json',
        data: {
          tip: {
            add: this.state.pendingCents,
            via_type: this.props.viaType,
            via_id: this.props.viaId
          }
        },
        complete: function() {
          this.setState({pendingCents: 0, pendingClicks: 0})
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
      var currentUser = window.app.currentUser().attributes
      return currentUser.id == this.props.recipient.id
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
        <span className="text-muted">&mdash; tipped by &nbsp;
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

  if (typeof module !== 'undefined') {
    module.exports = TipsUi;
  }

  window.TipsUi = TipsUi;
})();
