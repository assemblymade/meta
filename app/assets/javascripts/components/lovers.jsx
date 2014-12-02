var LoveStore = require('../stores/love_store')

var Lovers = React.createClass({
  render: function() {
    if (this.state.recentLovers.length < 1) {
      return null
    }

    var message = "likes this"
    var count = this.state.hearts_count

    if (count == 2) {
      message = "and 1 other like this"
    } else if (count > 2) {
      message = "and " + (count - 1) + " others like this"
    }

    return <div className="gray-2 left">
      {this.renderAvatar(this.state.recentLovers[0])}
      <span className="black bold"> {this.state.recentLovers[0].username} </span>
      {message}
    </div>
  },

  getInitialState: function() {
    return this.getStateFromStore()
  },

  componentDidMount: function() {
    LoveStore.addListener('change', this._onChange)
  },

  componentWillUnmount: function() {
    LoveStore.removeListener('change', this._onChange)
  },

  renderAvatar: function(user) {
    return <div className="left mr1" style={{paddingTop: 4}}><Avatar user={user} size={18} /></div>
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
