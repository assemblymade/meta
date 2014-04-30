class window.DismissableView extends Backbone.View
  events:
    'click .js-dismiss': 'dismissClicked'

  initialize: ->
    @key = "dismissed-#{@$el.data('dismissable')}"
    @$el.hide() if $.cookie(@key) == "true"

  dismissClicked: (e)=>
    e.preventDefault()
    $.cookie(@key, "true")
    @$el.fadeOut()
