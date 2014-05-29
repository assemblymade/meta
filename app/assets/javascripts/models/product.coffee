class window.Product extends Backbone.Model

  # TODO Should be on the ActivityStream, but there isn't a link there yet.
  channelName: ->
    ["activity-stream", @id].join('.')
