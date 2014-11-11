#= require notify.js

# this is the bounty/discussions view

class window.DiscussionView extends Backbone.View
  events:
    'click   .js-new-event' : 'onNewCommentClicked'
    'keydown .js-new-event' : 'newCommentKeyDown'
    'input   .js-new-event' : 'newCommentKeyUp'
    'change  .js-new-event' : 'newCommentKeyUp'

  keys:
    'enter': 13

  initialize: (@options)->
    @eventDefaults =
      actor: (app.currentUser().toJSON() if app.isSignedIn())
      total_tips: 0
      current_user_can_tip: true

    @children =
      timestamp: @$('.js-timestamp')
      welcomeBox: @$('.js-welcome-chat')

    @validateComment ''

    @listenTo(@model, 'change:state', @wipStateChanged)
    @listenTo(@model, 'change:own_comments', @ownCommentsChanged)
    @listenTo(app.wipEvents, 'add', @wipEventAdded)

    @wipStateChanged()
    @ownCommentsChanged()

    if window.pusher
      pusher.connection.bind 'connected', => @eventDefaults.socket_id = pusher.connection.socket_id

      channel = window.pusher.subscribe(@model.get('push_channel')) unless window.pusher.channels.find(@model.get('push_channel'))
      channel?.bind 'changed', (msg) => @model.set msg
      channel?.bind 'event.added', @eventPushed

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
      when 'Event::ReviewReady'
        e.preventDefault()
        @addReviewReady body
      when 'Event::Unallocation'
        e.preventDefault()
        @addUnallocation body
      when 'Event::Rejection'
        e.preventDefault()
        @addRejection body

  addComment: (body)->
    @createEvent 'Event::Comment', body
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

  addReviewReady: (body)->
    @createEvent 'Event::Comment', body
    @createEvent 'Event::ReviewReady'
    @model.set('state', 'reviewing')

  createEvent: (type, body)->
    app.wipEvents.create _(@eventDefaults).extend(type: type, body: body)
    @resetCommentForm()

  wipEventAdded: (wipEvent)->
    # TODO: Initialize WipEventViews more like regular TipViews
    view = new WipEventView(
      model: wipEvent,
      id: @model.get('id'),
      tipsPath: @options.tipsPath
    )
    el = view.render().el
    @$('.timeline,.discussion').append el

  eventPushed: (msg) =>
    return if msg.socket_id == pusher.connection.socket_id

    event = new WipEvent(msg)
    unless app.wipEvents.get(event)
      app.wipEvents.add(event)
      event.fetch()

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
    @$('#event_comment_body').val('').text('')
    @validateComment ''

  validateComment: (body)->
    $btn = @$('.form-actions button[type=submit]')
    if @validComment body
      $btn.removeAttr('disabled')
    else
      $btn.attr('disabled', 'disabled')

  validComment: (body)->
    return body.length > 1

  ownCommentsChanged: ->
    @children.welcomeBox.toggle !@model.hasOwnComments()
