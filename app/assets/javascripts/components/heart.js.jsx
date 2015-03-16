var Button = require('./ui/button.js.jsx')
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
      'button',
      'huge'
    ]),
    heartable_id: React.PropTypes.string.isRequired,
    heartable_type: React.PropTypes.string.isRequired
  },

  getDefaultProps: function() {
    return {
      size: 'medium'
    }
  },

  render: function() {
    var sizes = {
      'small': this.renderSmall,
      'medium': this.renderMedium,
      'button': this.renderButton,
      'huge': this.renderHuge
    }
    return sizes[this.props.size]()
  },

  renderSmall: function() {
    var heartsCount = this.state.hearts_count;
    // Dammit, JavaScript

    if (heartsCount == null) {
      return <div />
    }

    var icon = <Icon icon="heart" verticalAlign={1} />
    if (!UserStore.isSignedIn()) {
      return icon;
    }

    var toggler = <IconToggler on={this.state.user_heart || false} icon={icon} action={this.handleClick} color="red" />
    return <IconWithNumber icon={toggler} n={heartsCount} />
  },

  renderMedium: function() {
    var heartsCount = this.state.hearts_count || 0;
    var classes = React.addons.classSet({
      'heart-medium': true,
      'action-icon': true,
      'hover-red': UserStore.isSignedIn(),
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

    var heartWithCount = <div>
      <div className={classes}>
        <SvgIcon type="heart" />
      </div>
      {count}
    </div>

    if (!UserStore.isSignedIn()) {
      return heartWithCount
    }

    return (
      <a className="inline-block valign-top fs6 gray no-focus" href="javascript:void(0);" onClick={this.handleClick}>
        {heartWithCount}
      </a>
    );
  },

  renderHuge: function() {
    var heartsCount = this.state.hearts_count || 0;
    var classes = React.addons.classSet({
      'huge-heart': true,
      'action-icon': true,
      'hover-red': UserStore.isSignedIn(),
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

    var heartWithCount = <div>
      <div className={classes}>
        <SvgIcon type="huge-heart" />
      </div>
      {count}
    </div>

    if (!UserStore.isSignedIn()) {
      return heartWithCount
    }

    return (
      <a className="inline-block valign-top fs6 gray no-focus" href="javascript:void(0);" onClick={this.handleClick}>
        {heartWithCount}
      </a>
    );
  },

  renderButton: function() {
    var heartsCount = this.state.hearts_count;
    // Dammit, JavaScript
    if (heartsCount == null) {
      return <div />
    }

    if (this.state.user_heart) {
      return <Button block={true}>Loved</Button>
    } else {
      return <Button block={true} type="primary" action={this.handleClick}>
        Love this idea
      </Button>
    }
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
      if (!this.state.user_heart) {
        LoveActionCreators.clickLove(this.props.heartable_type, this.props.heartable_id)
      }
    } else {
      // (@chrislloyd) horrible hack, couldn't think through how to do
      // this with actions etc.
      window.location = '/signup'
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
