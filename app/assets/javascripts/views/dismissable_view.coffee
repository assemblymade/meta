class window.DismissableView extends Backbone.View
  events:
    'click .js-dismiss': 'dismissClicked'

  initialize: ->
    @key = "dismissed-#{@$el.data('dismissable')}"
    if $.cookie(@key) == "true"
      @$el.hide()
    else
      @$el.show()

  dismissClicked: (e)=>
    e.preventDefault()
    $.cookie(@key, "true", { path: '/' })
    @$el.fadeOut()
