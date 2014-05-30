#= require collections/activity_stream

ENTER_KEY = 13

class window.ChatView extends Backbone.View
  collection: ActivityStream

  events:
    'keydown .js-chat-actions'   : 'onKeyDown'
    'keyup   .js-chat-actions'   : 'onKeyUp'
    'submit  .js-chat-actions'   : 'onSubmit'
    'click   .js-chat-load-more' : 'onLoadMore'

  initialize: ->
    @listenTo(@collection, 'add', @render)

  render: =>
    @$('.js-activity-stream').css(
      'margin-bottom': @$('.js-chat-actions').outerHeight()
    )
    @$('.js-chat-load-more').toggle(@collection.length >= 25)

  scrollToLatestActivity: ->
    $(window).scrollTop($(document).height())

  clearForm: ->
    @$('.js-chat-actions form')[0].reset()
    @$('.js-chat-actions textarea').trigger('autosize.resize')

  optimisticallyCreateActivity: (body) ->
    activity = new Activity(
      type: 'activities/comment'
      created: (new Date()).toISOString()
      actor:  app.currentUser().attributes
      target: {
        body: body
        tips: []
        total_tips: 0
      }
    )
    @collection.push(activity)

    comment = new Comment(
      body: body
    )

    comment.url = @$('.js-chat-actions form').attr('action')
    comment.save({socket_id: @collection.socketId},
      success: (comment, data) ->
        activity.set(data)
    )
    activity

  # --

  onKeyDown: (e) =>
    return unless e.which == ENTER_KEY && !e.shiftKey
    e.preventDefault()

    comment = new Comment(
      body: @$('.js-chat-actions textarea').val()
    )

    if comment.isValid()
      @$('.js-chat-actions form').submit()

  onSubmit: (e) =>
    e.preventDefault()
    body = @$('.js-chat-actions textarea').val()
    @optimisticallyCreateActivity(body)
    delay 0, @clearForm

  onKeyUp: (e) =>
    actionsHeight = @$('.chat-bottom').height()
    @$('.chat-timeline').css('margin-bottom': actionsHeight)

  onLoadMore: (e) =>
    e.preventDefault()
    $.ajax(
      type: 'GET'
      url: $(e.target).attr('href') + "?top_id=#{@collection.first().get('id')}"
      success: (datas) =>
        fixScroll =>
          @collection.unshift(data) for data in datas
    )

# --

fixScroll = (cb) ->
  documentHeight = $(document).height()
  cb()
  $(document).scrollTop(Math.max(0, $(document).height() - documentHeight))
