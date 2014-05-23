#= require notify.js

class window.ChatView extends Backbone.View
  events:
    'click   .js-new-event' : 'onNewCommentClicked'
    'keydown .js-new-event' : 'newCommentKeyDown'

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
    $(document).ready @scrollToBottom

  onNewCommentClicked: (e)->
    e.preventDefault()
    @addComment($('#event_comment_body').val())

  addComment: (body)->
    @createEvent 'Event::Comment', body
    @children.timestamp.remove()
    @model.set('own_comments', 1)

  createEvent: (type, body)->
    app.wipEvents.create _(@eventDefaults).extend(type: type, body: body)
    @resetCommentForm()

  wipEventAdded: (wipEvent)->
    view = new WipEventView(model: wipEvent)
    el = view.render().el
    @$('.timeline,.discussion').append el
    @scrollToBottom()

  eventPushed: (msg) =>
    return if msg.socket_id == pusher.connection.socket_id

    event = new WipEvent(msg)
    unless app.wipEvents.get(event)
      app.wipEvents.add(event)
      unless @foreground
        @model.incrementUnreadCount()
        @pushNotification(event)

  newCommentKeyDown: (e) ->
    submitKeyPressed = (
      e.which == @keys.enter && !(e.ctrlKey || e.shiftKey || e.altKey)
    )
    body = $('#event_comment_body').val()
    if submitKeyPressed && @validComment(body)
      e.preventDefault()
      @addComment(body)

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
        @scrollToBottom()

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

  scrollToBottom: ->
    $(document).scrollTop($(document).height())

  ownCommentsChanged: ->
    @children.welcomeBox.toggle !@model.hasOwnComments()
