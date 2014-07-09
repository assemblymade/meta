#= require collections/activity_stream

ENTER_KEY = 13

class window.ChatView extends Backbone.View
  collection: ActivityStream

  events:
    'click   .js-chat-load-more' : 'onLoadMore'
    'click   .js-chat-create-wip': 'onCreateWip'

  initialize: (options)->
    @readyToLoadMore = true
    @listenTo(@collection, 'add', @render)
    @scrollContainer = options.scrollContainer
    @scrollPadding = options.scrollPadding

    @stuckToBottom = true

    @scrollContainer.css(
      'height':'100px'
      'overflow-x':'hidden'
      'overflow-y':'scroll'
    )
    @scrollContainer.on 'scroll', this.loadMoreWhenNearTop

    $(window).resize(@onWindowResize.bind(this))
    @onWindowResize()

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
        body: comment.get('body')
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
    this.loadMore(e)

  loadMoreWhenNearTop: (e)=>
    nearTop = 200
    if e.currentTarget.scrollTop < nearTop
      this.loadMore(e)

  scrollToElement: (anchor)=>
    @scrollContainer.scrollTop $("#" + anchor).offset().top

  loadMore: (e)=>
    return if @readyToLoadMore == false
    @readyToLoadMore = false
    @stuckToBottom = false
    loadMoreButton = @$('.js-chat-load-more')
    originalText = loadMoreButton.text()
    currentTopEvent = @collection.first()
    loadMoreButton.attr('disabled', true).text('Loading…')
    oldHeight = @scrollContainer[0].scrollHeight

    $.ajax(
      type: 'GET'
      url: loadMoreButton .attr('href') + "?top_id=#{currentTopEvent.get('id')}"
      complete: =>
        @readyToLoadMore = true
        newHeight = @scrollContainer[0].scrollHeight
        @scrollContainer.scrollTop (newHeight - oldHeight)

      success: (datas) =>
        fixScroll =>
          for data in _.sortBy(datas, (data) -> data['created']).reverse()
            @collection.unshift(data)

          loadMoreButton.text(originalText).attr('disabled', false)
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

  onWindowResize: (e) ->
    @scrollContainer.css(
      height: $(window).height() - @scrollPadding
    )


fixScroll = (cb) ->
  documentHeight = $(document).height()
  cb()
  $(document).scrollTop(Math.max(0, $(document).height() - documentHeight))
