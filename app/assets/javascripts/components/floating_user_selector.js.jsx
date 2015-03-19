'use strict';

const Tile = require('./ui/tile.js.jsx')
const User = require('./user.js.jsx')
const UserStore = require('../stores/user_store')
const UserSearchStore = require('../stores/user_search_store')

module.exports = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  displayName: 'FloatingUserSelector',

  propTypes: {
    onRequestClose: React.PropTypes.func.isRequired,
    onUserSelected: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      offset: [-20,48],
      searchResults: this.orderedSearchResults()
    }
  },

  render() {
    let style = {
      position: 'absolute',
      zIndex: 100,
      display: 'block',
      left: this.state.offset[0],
      top: this.state.offset[1]
    }

    return <div style={style} onKeyDown={this.handleKeyDown}>
      <Tile>
        <div className="p2">
          <input placeholder="Search users" className="form-control full-width mb2" />

          {this.state.searchResults.map(this.renderUserRow).toJS()}
        </div>
      </Tile>
    </div>
  },

  renderUserRow(user) {
    return <div key={user.id} className="p1 pointer bg-gray-4-hover" style={{minWidth: 200}} onClick={this.handleClick(user)}>
      <div className="left mr1">
        <Avatar user={user} />
      </div>

      @{UserStore.isCurrent(user) ? `${user.username} (me)` : user.username}
    </div>
  },

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false)
    UserSearchStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown)
    UserSearchStore.removeChangeListener(this._onChange)
  },

  handleKeyDown(e) {
    if (e.keyCode == 27 /*esc*/) {
      this.requestClose()
    }
  },

  handleClick(user) {
    return (e) => this.props.onUserSelected(user)
  },

  handleChange(e) {
    console.log('change', e)
  },

  requestClose() {
    if (this.props.onRequestClose) {
      this.props.onRequestClose()
    }
  },

  orderedSearchResults() {
    return UserSearchStore.getResults().sortBy(u =>
      (UserStore.isCurrent(u) ? 'a' : 'z') + u.username.toLowerCase()
    )
  },

  _onChange() {
    this.setState({
      searchResults: this.orderedSearchResults()
    })
  }
})
