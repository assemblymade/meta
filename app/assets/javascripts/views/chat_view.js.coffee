#= require collections/activity_stream

ENTER_KEY = 13

class window.ChatView extends Backbone.View
  collection: ActivityStream

  events:
    'click   .js-chat-load-more' : 'onLoadMore'
    'click   .js-chat-create-wip': 'onCreateWip'

  initialize: (options)->
    @listenTo(@collection, 'add', @render)
    @scrollContainer = options.scrollContainer
    @scrollPadding = options.scrollPadding

    @stuckToBottom = true

    @scrollContainer.css(
      'height':'100px'
      'overflow-x':'hidden'
      'overflow-y':'scroll'
    )

    $(window).resize(@onWindowResize.bind(this))
    @onWindowResize()
    $('.js-members').hide()

    app.on 'comment:scheduled', @optimisticallyCreateActivity.bind(@)

  render: =>
    @$('.js-chat-load-more').toggle(@collection.length >= 25)
    @scrollToLatestActivity() if @stuckToBottom

  scrollToLatestActivity: ->
    $(@scrollContainer).scrollTop(999999)

  optimisticallyCreateActivity: (comment) ->
    @stuckToBottom = true

    activity = new Activity(
      type: 'activities/chat'
      created: (new Date()).toISOString()
      actor:  app.currentUser().attributes
      subject: {
        body: comment.body
        tips: []
        total_tips: 0
      }
    )

    @collection.push(activity)
    comment.save({socket_id: @collection.socketId},
      success: (comment, data) ->
        activity.set(data)
    )
    activity

  onLoadMore: (e) =>
    e.preventDefault()
    @stuckToBottom = false
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
    renderedModal = JST['activities/wip'].render({ title: body, action: @collection.product.attributes.url, token: token })
    $('#create-task').html(renderedModal).modal()

  onWindowResize: (e) ->
    @scrollContainer.css(
      height: $(window).height() - @scrollPadding
    )


fixScroll = (cb) ->
  documentHeight = $(document).height()
  cb()
  $(document).scrollTop(Math.max(0, $(document).height() - documentHeight))
