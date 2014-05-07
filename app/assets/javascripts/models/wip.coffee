class window.Wip extends Backbone.Model

  initialize: ->
    window.app.on 'voted', => @set('voted', true)
    window.app.on 'unvoted', => @set('voted', false)