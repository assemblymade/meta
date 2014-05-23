#= require notify.js

class window.DiscussionView extends Backbone.View
  events:
    'click   .js-new-event' : 'onNewCommentClicked'
    'keydown .js-new-event' : 'newCommentKeyDown'
    'input   .js-new-event' : 'newCommentKeyUp'
    'change  .js-new-event' : 'newCommentKeyUp'

  keys:
    'enter': 13

  initialize: (options)->
    @eventDefaults =
      actor: (app.currentUser().toJSON() if app.isSignedIn())
      total_tips: 0
      current_user_can_tip: true

    @children =
      upvoteReminder: @$('.js-upvote-reminder')
      timestamp: @$('.js-timestamp')
      welcomeBox: @$('.js-welcome-chat')

    @validateComment ''

    @listenTo(@model, 'change:state', @wipStateChanged)
    @listenTo(@model, 'change:unreadCount', @unreadCountChanged)
    @listenTo(@model, 'change:own_comments', @ownCommentsChanged)
    @listenTo(app.wipEvents, 'add', @wipEventAdded)

    @wipStateChanged()
    @ownCommentsChanged()

    if window.pusher
      pusher.connection.bind 'connected', => @eventDefaults.socket_id = pusher.connection.socket_id

      channel = window.pusher.subscribe(@model.get('push_channel'))
      channel.bind 'changed', (msg) => @model.set msg
      channel.bind 'event.added', @eventPushed

    @foreground = true
    @originalTitle = document.title

    $(window).focus @onWindowFocused
    $(window).blur @onWindowBlurred

  onNewCommentClicked: (e)->
    body = $('#event_comment_body').val()
    switch $(e.target).attr('value')
      when 'Event::Comment'
        e.preventDefault()
        @addComment body
      when 'Event::Close'
        e.preventDefault()
        @addClose body
      when 'Event::Reopen'
        e.preventDefault()
        @addReopen body
      when 'Event::Unallocation'
        e.preventDefault()
        @addUnallocation body
      when 'Event::Rejection'
        e.preventDefault()
        @addRejection body

  addComment: (body)->
    @createEvent 'Event::Comment', body
    @showUpvotePrompt() unless @model.get('voted')
    @children.timestamp.remove()
    @model.set('own_comments', 1)

  addClose: (body)->
    @createEvent 'Event::Close', body
    @model.set('state', 'resolved')

  addReopen: (body)->
    @createEvent 'Event::Reopen', body
    @model.set('state', 'open')

  addUnallocation: (body)->
    @createEvent 'Event::Unallocation', body
    @model.set('state', 'open')

  addRejection: (body)->
    @createEvent 'Event::Rejection', body
    @model.set('state', 'allocated')

  createEvent: (type, body)->
    app.wipEvents.create _(@eventDefaults).extend(type: type, body: body)
    @resetCommentForm()

  wipEventAdded: (wipEvent)->
    view = new WipEventView(model: wipEvent)
    el = view.render().el
    @$('.timeline,.discussion').append el

  eventPushed: (msg) =>
    return if msg.socket_id == pusher.connection.socket_id

    event = new WipEvent(msg)
    unless app.wipEvents.get(event)
      app.wipEvents.add(event)
      unless @foreground
        @model.incrementUnreadCount()
        @pushNotification(event)

  wipStateChanged: ->
    switch @model.get('state')
      when 'open'      then @onWipOpen()
      when 'allocated' then @onWipAllocated()
      when 'reviewing' then @onWipReviewing()
      when 'resolved'  then @onWipResolved()

  onWipOpen: ->
    @$('[name=close]').show()
    @$('[name=reopen]').hide()
    @$('[name=unallocate]').hide()
    @$('[name=reject]').hide()

  onWipAllocated: ->
    @$('[name=close]').show()
    @$('[name=reopen]').hide()
    @$('[name=unallocate]').show()
    @$('[name=reject]').hide()

  onWipReviewing: ->
    @$('[name=close]').show()
    @$('[name=reopen]').hide()
    @$('[name=unallocate]').hide()
    @$('[name=reject]').show()

  onWipResolved: ->
    @$('[name=close]').hide()
    @$('[name=reopen]').show()
    @$('[name=unallocate]').hide()
    @$('[name=reject]').hide()

  newCommentKeyDown: (e)->
    cmdEnter = (e.ctrlKey || e.metaKey) && e.which == @keys.enter
    body = $('#event_comment_body').val()
    @addComment body if cmdEnter && @validComment(body)

  newCommentKeyUp: (e)->
    @validateComment $('#event_comment_body').val()

  resetCommentForm: ->
    @$('#event_comment_body').val('')
    @validateComment ''

  validateComment: (body)->
    $btn = @$('.form-actions button[type=submit]')
    if @validComment body
      $btn.removeAttr('disabled')
    else
      $btn.attr('disabled', 'disabled')

  validComment: (body)->
    return body.length > 1

  showUpvotePrompt: ->
    @children.upvoteReminder.fadeIn()

  pushNotification: (event)->
    n = new Notify "New message on #{event.get('wip').product_name}",
      body: "#{event.get('actor').username}: #{event.get('body')}"
      icon: 'https://d8izdk6bl4gbi.cloudfront.net/80x/http://f.cl.ly/items/1I2a1j0M0w0V2p3C3Q0M/Assembly-Twitter-Avatar.png'
      timeout: 5
      notifyClick: =>
        $(window).focus()

    n.show()

  onWindowFocused: =>
    @foreground = true
    @model.markAllAsRead()

  onWindowBlurred: =>
    @foreground = false

  unreadCountChanged: =>
    count = @model.get('unreadCount')
    if count == 0
      document.title = @originalTitle
    else
      document.title = "(#{count}) #{@originalTitle}"

  ownCommentsChanged: ->
    @children.welcomeBox.toggle !@model.hasOwnComments()
