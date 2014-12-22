var LoveStore = require('../stores/love_store')
var LoveActionCreators = require('../actions/love_action_creators')
var xhr = require('../xhr')
var Lovers = require('./lovers.jsx')
var UserStore = require('../stores/user_store')

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
        <Lovers heartable_id={this.props.heartable_id} hearts_count={heartsCount} />
      </div>
    );
  },

  renderHeart: function() {
    var style = { }
    if (this.state.user_heart) {
      style['color'] = 'rgba(236,55,79,1)'
    }

    return (
      <a className="inline-block valign-mid mr1 fs6 gray no-focus" href="javascript:;" onClick={this.handleClick}>
          <div className="fa fa-heart inline-block gray" style={style}></div>
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

if (typeof module !== 'undefined') {
  module.exports = Love
}

window.Love = Love
