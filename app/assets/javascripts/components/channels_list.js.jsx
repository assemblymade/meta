/** @jsx React.DOM */

(function(){
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

      return <div>
        {rooms.map(function(roomId){
          var room = this.state.rooms[roomId]
          var unread = this.state.rooms[roomId].updated > this.state.rooms[roomId].last_read_at
          var badge = null
          if (unread) {
            badge = <span
                className="indicator indicator-info"
                style={{ 'position': 'relative', 'left': '3px', 'top': '-1px' }} />
          }

          var classes = React.addons.classSet({
            'block': true,
            'text-white': this.props.currentRoom == roomId
          })

          return <a className={classes} href={room.url}>#{room.label} {badge}</a>
        }.bind(this))}

        {this.state.showAll ? null : this.showAll()}
      </div>
    },

    // take the top X rooms, sorted by ones with unread messages, then most recently visited
    shortList: function(count) {
      var rooms = this.state.rooms
      if (rooms) {
        var unreadRecentRoomIds = _.first(_.sortBy(_.keys(rooms), function(roomId){
          var unread = rooms[roomId].updated > rooms[roomId].last_read_at
          return -rooms[roomId].last_read_at * (unread ? 2 : 1)
        }), count)

        return _.sortBy(unreadRecentRoomIds, function(roomId){
          return rooms[roomId].label == 'general' ? '_______' : rooms[roomId].label
        })
      }
      return []
    },

    showAll: function() {
      var rooms = _.size(this.state.rooms)
      if (rooms > shortListLength){
        return <a className="block clickable" onClick={this.handleShowAllClicked}>Show all {_.size(this.state.rooms)}</a>
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

  if (typeof module !== 'undefined') {
    module.exports = ChannelsList
  }

  window.ChannelsList = ChannelsList
})()

// <% @rooms.each do |chan| %>
//   <a class="block" href="<%= chat_room_path(chan) %>">#<%= chan.slug %></a>
// <% end %>
