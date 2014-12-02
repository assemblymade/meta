/** @jsx React.DOM */

(function(){
  var LoveStore = require('../stores/love_store')
  var LoveActionCreators = require('../actions/love_action_creators')
  var xhr = require('../xhr')
  var Lovers = require('./lovers.jsx')

  var Love = React.createClass({
    propTypes: {
      heartable_id: React.PropTypes.string.isRequired,
      heartable_type: React.PropTypes.string.isRequired
    },

    render: function() {
      if (!window.app.featureEnabled('much-love') && !this.props.public) {
        return <span/>
      }

      if (this.state.hearts_count == null) {
        return <span/>
      }

      var style = {
        fontSize: 18,
      }
      if (this.state.user_heart) {
        style['color'] = 'rgba(236,55,79,1)'
      }

      return <span>
        <a className="gray left mr1" href="javascript:;" onClick={this.handleClick}>
          <span className="fa fa-heart" style={style}></span>
        </a>
        <Lovers heartable_id={this.props.heartable_id} hearts_count={this.state.hearts_count} />
      </span>
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
      this.replaceState(this.getStateFromStore() || {})
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = Love
  }

  window.Love = Love
})()
