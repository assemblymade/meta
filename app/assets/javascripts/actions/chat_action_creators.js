var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher')

var alreadyJoined = {};

var chatActionCreators = {
  connectToChat: function(activityStream) {
    window.pusher.connection.bind('connected', function() {
      activityStream.listenForRemote(pusher, pusher.connection);

      var presenceChannel = pusher.subscribe('presence-' + activityStream.channelName())

      Dispatcher.dispatch({
        type: ActionTypes.PUSHER_PRESENCE_CONNECTED,
        presenceChannel: presenceChannel
      })

      presenceChannel.bind('pusher:member_added',
        function memberJoined(rawMember) {
          Dispatcher.dispatch({
            type: ActionTypes.CHAT_USER_ONLINE,
            rawMember: rawMember
          })

          if (alreadyJoined[rawMember.id] === 1) {
            return;
          }

          alreadyJoined[rawMember.id] = 1;
        }
      );
    });
  }
}

// TODO: remove when the chat room show html doesn't reference this
window.ChatActionCreators = chatActionCreators

module.exports = chatActionCreators
