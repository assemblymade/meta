#= require jquery

class window.Comment extends Backbone.Model
  validate: (attrs, options) ->
    return "body too short" unless $.trim(attrs.body).length > 0
