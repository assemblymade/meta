'use strict'

var HeartsReceivedStore = require('../../stores/hearts_received_store')
var Routes = require('../../routes')
var UserStore = require('../../stores/user_store')

module.exports = React.createClass({
  displayName: 'HeartsReceived',

  getInitialState() {
    return this.getStateFromStore()
  },

  render() {
    return (
      <a className="block py2" href={Routes.user_path({id: UserStore.getUsername()})}>
        <div className="">
          <span className="red" ref="heart">
            <Icon icon="heart" />
          </span>
          <span className="gray-1"> {this.state.heartsCount}</span>
        </div>
      </a>
    )
  },

  getStateFromStore() {
    return {
      heartsCount: HeartsReceivedStore.getHeartsCount()
    }
  },

  componentDidUpdate(props, state) {
    if (this.state.heartsCount != state.heartsCount) {
      let node = this.refs.heart.getDOMNode()
      node.className += ' pulse'
      setTimeout(() => {
        node.className = node.className.replace(' pulse','')
      }, 500)
    }
  },

  componentDidMount() {
    HeartsReceivedStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    HeartsReceivedStore.removeChangeListener(this._onChange)
  },

  _onChange() {
    this.setState(this.getStateFromStore())
  }
})
