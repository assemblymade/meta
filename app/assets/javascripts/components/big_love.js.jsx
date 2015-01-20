var LoveStore = require('../stores/love_store')
var LoveActionCreators = require('../actions/love_action_creators')
var xhr = require('../xhr')
var Lovers = require('./lovers.jsx')
var Icon = require('./ui/icon.js.jsx')
var SvgIcon = require('./ui/svg_icon.js.jsx');
var UserStore = require('../stores/user_store')

var BigLove = React.createClass({
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

    return (
      <div className={"pointer heart-circle heart-circle-" + (this.state.user_heart ? 'white' : 'green')} onClick={this.handleClick}>
        <SvgIcon type="heart" />
      </div>
    );
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

  handleClick: function() {
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

module.exports = BigLove
