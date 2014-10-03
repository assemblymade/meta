#= require models/activity

class window.ActivityStream extends Backbone.Collection
  model: Activity

  channelName: ->
    ['activitystream', @id].join('.')

  listenForRemote: (pusher, connection) ->
    @socketId = connection.socket_id
    window.chatChannel = pusher.subscribe(@channelName())
    chatChannel.bind 'add', (attributes)=>
      @add(attributes)
      model = @get(attributes.id)
      model.url = '/activities/' + model.id
      model.fetch()
