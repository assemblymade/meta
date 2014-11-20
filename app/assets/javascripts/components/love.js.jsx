/** @jsx React.DOM */

(function(){
  var LoveStore = require('../stores/love_store')
  var LoveActionCreators = require('../actions/love_action_creators')
  var xhr = require('../xhr')

  var Love = React.createClass({
    propTypes: {
      heartable_id: React.PropTypes.string.isRequired,
      heartable_type: React.PropTypes.string.isRequired
    },

    render: function() {
      if (!window.app.featureEnabled('much-love')) {
        return <span/>
      }

      if (this.state.hearts_count == null) {
        return <span/>
      }

      var style = {}

      if (this.state.user_heart) {
        style['color'] = 'red'
      }

      return <span>
        <a className="gray" href="javascript:;" onClick={this.handleClick}>
          <span className="fa fa-heart" style={style}></span>
          <span> {numeral(this.state.hearts_count).format('0,0')}</span>
        </a>
      </span>
    },

    getInitialState: function() {
      return this.getStateFromStore()
    },

    componentDidMount: function() {
      LoveStore.addChangeListener(this._onChange)
    },

    componentWillUnmount: function() {
      LoveStore.removeChangeListener(this._onChange)
    },

    handleClick: function() {
      if (this.state.user_heart) {
        LoveActionCreators.clickUnlove(this.props.heartable_type, this.props.heartable_id)
      } else {
        LoveActionCreators.clickLove(this.props.heartable_type, this.props.heartable_id)
      }
    },

    getStateFromStore: function() {
      return LoveStore.get(this.props.heartable_id)
    },

    _onChange: function() {
      this.replaceState(this.getStateFromStore())
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = Love
  }

  window.Love = Love
})()
