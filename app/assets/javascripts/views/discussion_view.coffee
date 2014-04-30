class window.DiscussionView extends Backbone.View
  events:
    'click   .js-new-event' : 'onNewCommentClicked'
    'keydown .js-new-event' : 'newCommentKeyDown'
    'input   .js-new-event' : 'newCommentKeyUp'
    'change  .js-new-event' : 'newCommentKeyUp'

  keys:
    'enter': 13

  initialize: (options)->
    @eventDefaults = {}

    if user = app.currentUser()
      @eventDefaults.author_name = user.get('name')
      @eventDefaults.avatar_url = user.get('avatar_url')
    @eventDefaults.number = app.wipEvents.nextNumber()

    @validateComment ''

    @listenTo(@model, 'change:state', @wipStateChanged)
    @listenTo(app.wipEvents, 'add', @wipEventAdded)

    @wipStateChanged()

    if window.pusher
      channel = window.pusher.subscribe(@model.get('push_channel'))

      channel.bind 'changed', (msg) => @model.set msg
      channel.bind 'event.added', (msg) =>
        model = new WipEvent(msg)
        app.wipEvents.add model unless app.wipEvents.get(model)

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
    event = app.wipEvents.create _(@eventDefaults).extend(type: type, body: body)

    @resetCommentForm()

  wipEventAdded: (wipEvent)->
    view = new WipEventView(model: wipEvent)
    @$('.timeline,.discussion').append view.render().el

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


