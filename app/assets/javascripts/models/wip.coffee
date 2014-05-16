class window.Wip extends Backbone.Model
  defaults:
    unreadCount: 0
    
  initialize: ->
    window.app.on 'voted', => @set('voted', true)
    window.app.on 'unvoted', => @set('voted', false)
    @set 'unreadCount', 1
  
  incrementUnreadCount: ->
    @set('unreadCount', @get('unreadCount') + 1)
  
  markAllAsRead: ->
    @set('unreadCount', 0)