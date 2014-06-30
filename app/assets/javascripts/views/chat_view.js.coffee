#= require collections/activity_stream

ENTER_KEY = 13

class window.ChatView extends Backbone.View
  collection: ActivityStream

  events:
    'keydown .js-chat-actions'   : 'onKeyDown'
    'keyup   .js-chat-actions'   : 'onKeyUp'
    'submit  .js-chat-actions'   : 'onSubmit'
    'click   .js-chat-load-more' : 'onLoadMore'
    'click   .js-chat-create-wip': 'onCreateWip'

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
      type: 'activities/chat'
      created: (new Date()).toISOString()
      actor:  app.currentUser().attributes
      subject: {
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
    originalText = $('.js-chat-load-more').text()
    @$('.js-chat-load-more').attr('disabled', true).text('Loading…')
    $.ajax(
      type: 'GET'
      url: $(e.target).attr('href') + "?top_id=#{@collection.first().get('id')}"
      success: (datas) =>
        fixScroll =>
          for data in _.sortBy(datas, (data) -> data['created']).reverse()
            @collection.unshift(data)

          @$('.js-chat-load-more').text(originalText).attr('disabled', false)
    )

  onCreateWip: (e) ->
    e.preventDefault()
    id = $(e.currentTarget).attr('href')
    body = $(id + ' .activity-content').text().trim()
    token = $('meta[name=csrf-token]').attr('content')
    renderedModal = JST['activities/wip'].render({
      title: body,
      action: @collection.product.attributes.url,
      token: token
    })
    $('#create-task').html(renderedModal).modal()
    selectedTags = React.renderComponent(
      TagList({
         tags: [],
         destination: true
       }),
      document.getElementById('selected-tags')
    );
    textComplete = React.renderComponent(
      TextComplete({
        width: '125px',
        size: 'small',
        label: 'Add tag',
        prepend: '#',
        prompt: 'Add',
      }),
      document.getElementById('new-tags')
    );
    suggestedTags = React.renderComponent(
      TagList({
         tags: window.app.suggestedTags(),
         destination: false
       }),
      document.getElementById('suggested-tags')
    );

fixScroll = (cb) ->
  documentHeight = $(document).height()
  cb()
  $(document).scrollTop(Math.max(0, $(document).height() - documentHeight))
