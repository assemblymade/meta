#= require models/activity

class window.ActivityStream extends Backbone.Collection
  model: Activity

  channelName: ->
    ['activitystream', @product.id].join('.')

  listenForRemote: (pusher, connection) ->
    @socketId = connection.socket_id
    channel = pusher.subscribe(@channelName())
    channel.bind('add', _.bind(@add, @))
