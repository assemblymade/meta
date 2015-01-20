var LoveActionCreators = require('../actions/love_action_creators')
var Lovers = require('./lovers.jsx')
var IconToggler = require('./ui/icon_toggler.js.jsx')
var IconWithNumber = require('./ui/icon_with_number.js.jsx')
var Icon = require('./ui/icon.js.jsx')
var SvgIcon = require('./ui/svg_icon.js.jsx');
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

    return (
      <div className="clearfix">
        {this.renderHeart()}
      </div>
    );
  },

  renderHeart: function() {
    var heartsCount = this.state.hearts_count || 0;
    var classes = React.addons.classSet({
      'action-icon': true,
      gray: !this.state.user_heart,
      'inline-block': true,
      _mr0_25: true,
      red: this.state.user_heart
    });

    return (
      <a className="inline-block valign-top mr1 fs6 gray no-focus" href="javascript:void(0);" onClick={this.handleClick}>
        <div className={classes}>
          <SvgIcon type="heart" />
        </div>
        <span className="mt2">{heartsCount > 0 ? heartsCount : null}</span>
      </a>
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
