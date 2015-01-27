var LoveStore = require('../stores/love_store')
var LoveActionCreators = require('../actions/love_action_creators')
var Icon = require('./ui/icon.js.jsx')
var IconToggler = require('./ui/icon_toggler.js.jsx')
var IconWithNumber = require('./ui/icon_with_number.js.jsx')
var SvgIcon = require('./ui/svg_icon.js.jsx');
var UserStore = require('../stores/user_store')

var Heart = React.createClass({
  propTypes: {
    size: React.PropTypes.oneOf([
      'small',
      'medium',
      'large'
    ]),
    heartable_id: React.PropTypes.string.isRequired,
    heartable_type: React.PropTypes.string.isRequired
  },

  render: function() {
    var sizes = {
      'small': this.renderSmall,
      'medium': this.renderMedium,
      'large': this.renderLarge
    }
    return sizes[this.props.size]()
  },

  renderSmall: function() {
    var heartsCount = this.state.hearts_count;
    // Dammit, JavaScript

    if (heartsCount == null) {
      return <div />
    }

    var icon = <Icon icon="heart" />
    var toggler = <IconToggler on={this.state.user_heart} icon={icon} action={this.handleClick} color="red" />

    return <IconWithNumber icon={toggler} n={heartsCount} />
  },

  renderMedium: function() {
    var heartsCount = this.state.hearts_count || 0;
    var classes = React.addons.classSet({
      'action-icon': true,
      gray: !this.state.user_heart,
      'inline-block': true,
      red: this.state.user_heart
    });

    var count = null

    if (heartsCount > 0) {
      count = (
        <span className="h6 mt2 mb0 gray-2 ml1">{heartsCount}</span>
      )
    }

    return (
      <a className="inline-block valign-top fs6 gray no-focus" href="javascript:void(0);" onClick={this.handleClick}>
        <div className={classes}>
          <SvgIcon type="heart" />
        </div>
        {count}
      </a>
    );
  },

  renderLarge: function() {
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

module.exports = Heart
