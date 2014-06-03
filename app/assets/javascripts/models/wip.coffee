class window.Wip extends Backbone.Model
  defaults:
    own_comments: 0

  initialize: ->
    window.app.on 'voted', => @set('voted', true)
    window.app.on 'unvoted', => @set('voted', false)

  hasOwnComments: ->
    @get('own_comments') > 0