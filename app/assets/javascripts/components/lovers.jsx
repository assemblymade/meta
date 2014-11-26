var LoveStore = require('../stores/love_store')

var Lovers = React.createClass({
  render: function() {
    return (
      <span className="text-muted">
        {this.renderAvatars()}
      </span>
    )
  },

  getInitialState: function() {
    return this.getStateFromStore()
  },

  componentDidMount: function() {
    LoveStore.addChangeListener(this._onChange)
  },

  renderAvatars: function() {
    if (this.state.recentLovers.length < 1) {
      return null
    }

    var plus = null
    if (this.state.hearts_count > this.state.recentLovers.length) {
      plus = <span> +</span>
    }

    return <span> &mdash;
      <ul className="list-inline-media">
        {_.map(this.state.recentLovers, this.renderAvatar)}
      </ul>{plus}
    </span>
  },

  renderAvatar: function(user) {
    return (
      <li key={user.id}>
        <img
          className="img-circle"
          src={user.avatar_url}
          alt={'@' + user.username}
          data-toggle="tooltip"
          data-placement="top"
          title={'@' + user.username}
          width="16" height="16" />
      </li>
    )
  },

  getStateFromStore: function() {
    var heartable = LoveStore.get(this.props.heartable_id)
    var hearts = (heartable.hearts || [])
    var lovers = _(hearts).reduce(function(memo, h) {
      memo.push(h.user)
      return memo
    }, [])

    return {
      recentLovers: lovers,
      hearts_count: heartable.hearts_count
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  }
})

window.Lovers = Lovers
module.exports = Lovers
