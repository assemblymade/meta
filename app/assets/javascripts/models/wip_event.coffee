class window.WipEvent extends Backbone.Model
  toJSON: ->
    event_comment: _.clone( this.attributes )

  anchor: ->
    "comment-#{@get('number')}"

  body: ->
