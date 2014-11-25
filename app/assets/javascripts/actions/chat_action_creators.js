// var Dispatcher = require('../dispatcher')
var ActionTypes = window.CONSTANTS.ActionTypes
var alreadyJoined = {};

var chatActionCreators = {
  connectToChat: function(activityStream) {
    window.pusher.connection.bind('connected', function() {
      activityStream.listenForRemote(pusher, pusher.connection);

      var presenceChannel = pusher.subscribe('presence-' + activityStream.channelName())

      Dispatcher.handleServerAction({
        type: ActionTypes.PUSHER_PRESENCE_CONNECTED,
        presenceChannel: presenceChannel
      })

      presenceChannel.bind('pusher:member_added',
        function memberJoined(rawMember) {
          Dispatcher.handleServerAction({
            type: ActionTypes.CHAT_USER_ONLINE,
            rawMember: rawMember
          })

          // Slight hack to prevent multiple join messages
          // for one person
          if (alreadyJoined[rawMember.id] === 1) {
            return;
          }

          alreadyJoined[rawMember.id] = 1;

          var activity = new Activity({
            id: rawMember.id + rand(10000),
            actor: rawMember.info,
            // TODO: change 'type' to 'verb'
            type: 'activities/join',
            created: moment().toISOString()
          });

          console.log('adding activity', activity)
          activityStream.add(activity);
        }
      );
    });
  }
}

// TODO: remove when the chat room show html doesn't reference this
window.ChatActionCreators = chatActionCreators

module.exports = chatActionCreators
