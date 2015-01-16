var IconToggler = require('./ui/icon_toggler.js.jsx')
var IconWithNumber = require('./ui/icon_with_number.js.jsx')
var LoveActionCreators = require('../actions/love_action_creators')
var Lovers = require('./lovers.jsx')
var LoveStore = require('../stores/love_store')
var UserStore = require('../stores/user_store')
var xhr = require('../xhr')


var Love = React.createClass({
  propTypes: {
    heartable_id: React.PropTypes.string.isRequired,
    heartable_type: React.PropTypes.string.isRequired
  },

  render: function() {
    var heartsCount = this.state.hearts_count;
    // Dammit, JavaScript
    if (heartsCount == null) {
      return <div />
    }

    var icon = <Icon icon="heart" />
    var toggler = <IconToggler on={this.state.user_heart} icon={icon} action={this.handleClick} color="red" />

    return <IconWithNumber icon={toggler} n={heartsCount} />
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

  handleClick: function(e) {
    if (UserStore.isSignedIn()) {
      if (this.state.user_heart) {
        LoveActionCreators.clickUnlove(this.props.heartable_type, this.props.heartable_id)
      } else {
        LoveActionCreators.clickLove(this.props.heartable_type, this.props.heartable_id)
      }
    }
  },

  getStateFromStore: function() {
    return LoveStore.get(this.props.heartable_id) || {}
  },

  _onChange: function() {
    this.replaceState(this.getStateFromStore())
  }
})

if (typeof module !== 'undefined') {
  module.exports = Love
}

window.Love = Love
