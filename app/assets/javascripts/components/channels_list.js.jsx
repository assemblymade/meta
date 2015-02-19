var ChatRoomStore = require('../stores/chat_notifications_store')
var shortListLength = 5

function getStateFromStore() {
  return {
    rooms: ChatRoomStore.getChatRooms()
  }
}

// short list should be: unread mixed with most recently read

var ChannelsList = React.createClass({
  propTypes: {
    currentRoom: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return _.extend(getStateFromStore(), {
      showAll: false
    })
  },

  componentDidMount: function() {
    ChatRoomStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function() {
    ChatRoomStore.removeChangeListener(this._onChange)
  },

  render: function() {
    var rooms = this.state.showAll ? _.keys(this.state.rooms) : this.shortList(shortListLength)

    return (
      <div>
        {rooms.map(function(roomId){
          var room = this.state.rooms[roomId],
              hasUnread = room.updated_at > room.last_read_at,
              isActive = this.props.currentRoom === roomId

          var classes = React.addons.classSet({
            'block clearfix white': true,
            'bold': hasUnread,
            'channel-list-active': isActive
          })

          return (
            <a className={classes} href={room.url} key={room.url}>
              #{room.label}
            </a>
          )
        }.bind(this))}

        {this.state.showAll ? null : this.showAll()}
      </div>
    )
  },

  // take the top X rooms, sorted by ones with unread messages, then most recently visited
  shortList: function(count) {
    var rooms = this.state.rooms
    if (rooms && _.keys(rooms).length > 0) {
      var unreadRecentRoomIds = _.sortBy(_.keys(rooms), function(roomId){
        var unread = rooms[roomId].updated_at > rooms[roomId].last_read_at
        return -rooms[roomId].last_read_at * (unread ? 2 : 1)
      })

      unreadRecentRoomIds = [this.props.currentRoom].concat(_.without(unreadRecentRoomIds, this.props.currentRoom))
      unreadRecentRoomIds = _.first(unreadRecentRoomIds, count)

      return _.sortBy(unreadRecentRoomIds, function(roomId){
        return rooms[roomId].label == 'general' ? '_______' : rooms[roomId].label
      })
    }
    return []
  },

  showAll: function() {
    var rooms = _.size(this.state.rooms)
    if (rooms > shortListLength){
      return (
        <a className="block py1 caps small bold" onClick={this.handleShowAllClicked} href="javascript:;" style={{color: "rgba(255,255,255,0.2)"}}>Show all {rooms}</a>
      )
    } else {
      return null
    }
  },

  handleShowAllClicked: function() {
    this.setState({ showAll: true })
  },

  // change from stores
  _onChange: function() {
    this.setState(getStateFromStore())
  }
})

module.exports = window.ChannelsList = ChannelsList;
