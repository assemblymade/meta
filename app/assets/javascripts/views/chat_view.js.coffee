#= require collections/activity_stream

ENTER_KEY = 13
BOTTOM_SCROLL_MARGIN = 350

class window.ChatView extends Backbone.View
  collection: ActivityStream

  events:
    'click   .js-chat-load-more' : 'onLoadMore'
    'click   .js-chat-create-wip': 'onCreateWip'

  initialize: (options)->
    @stuckToBottom = true
    @scrollContainer = options.scrollContainer
    @displayLoadMore = true
    @pageSize = 50

    @ch =
      loadMore: @$('.js-chat-load-more')
      stream: @$('.js-activity-stream')

    $(window).on('focus', @onWindowFocus)
    @listenTo(@collection, 'add', @onCollectionAdd)
    @scrollContainer.on 'scroll', this.handleScroll
    app.on 'comment:scheduled', @optimisticallyCreateActivity.bind(@)

    @collection.each (model, index, collection) =>
      @buildSubviewForModel(model, index)

    @updateReadAt()

  render: =>
    @$('.js-chat-load-more').toggle(@displayLoadMore)

  renderTimestamp: ->
    @$('.timeline-insert.js-timestamp').each ->
      React.unmountComponentAtNode(@)
      $(@).remove()

    tsContainer = $('<div class="timeline-insert js-timestamp">&nbsp;</div>').insertBefore('.timeline-item:last')
    lastTime = @collection.last().get('created_at')
    React.render(Timestamp({time: lastTime}), tsContainer[0])

  onCollectionAdd: (model, collection, info) =>
    @listenTo(model, 'sync', => @preserveScrollPosition()) # scroll the content after message is fetched from the server
    @preserveScrollPosition(=>
      @buildSubviewForModel(model, collection.indexOf(model))
    )

  updateReadAt: _.debounce(=>
    Dispatcher.dispatch({
      action: CONSTANTS.CHAT_NOTIFICATIONS.ACTIONS.MARK_ROOM_AS_READ,
      data: {id: app.chatRoom.id, readraptor_url: app.chatRoom.readRaptorChatPath},
      sync: true
    });
  , 200)

  buildSubviewForModel: (model, index) ->
    view = new ActivityView(model: model, subjectId: @options.subjectId, tipsPath: @options.tipsPath)

    if index == 0
      @ch.stream.prepend(view.el)
    else
      # dodgy hack because of the timestamp in the DOM
      el = @$(".timeline-item:nth-child(#{index})")
      if el.length == 0
        el = @$(".timeline-item:nth-child(#{index + 1})")

      el.after(view.el)

    view.render()
    @renderTimestamp() if @collection.any()
    @updateReadAt()

  scrollToLatestActivity: =>
    @updateMembersHeight()
    $(@scrollContainer).scrollTop(999999)

  updateMembersHeight: ->
    $('.js-members').css({ 'max-height': ($(window).outerHeight() - 140) + 'px' });

  optimisticallyCreateActivity: (comment) ->
    activity = new Activity(
      type: 'activities/chat'
      created_at: (new Date()).toISOString()
      actor:  app.currentUser().attributes
      subject: {
        body: comment.get('body')
        tips: []
        total_tips: 0
      }
    )

    @collection.push(activity)
    comment.save({socket_id: @collection.socketId},
      success: (comment, data) =>
        Dispatcher.dispatch(
          type: 'CHAT_MESSAGE_RECEIVE_ACTIVITIES'
          activities: [comment.attributes]
        )
        @pushCommentToLandline(comment.attributes)
        activity.set(data)
    )
    activity

  onLoadMore: (e) =>
    e.preventDefault()
    this.loadMore(e)

  pushCommentToLandline: (comment) ->
    Landline.pushComment(comment)

  handleScroll: (e)=>
    @stuckToBottom = (@$el.height() - (e.currentTarget.scrollTop + @scrollContainer.height())) < BOTTOM_SCROLL_MARGIN

    if @displayLoadMore
      nearTop = 200
      if e.currentTarget.scrollTop < nearTop
        this.loadMore(e)

  loadMore: (e)=>
    @stuckToBottom = false
    originalText = @ch.loadMore.text()
    currentTopEvent = @collection.first()
    @ch.loadMore.attr('disabled', true).text('Loading…')

    $.ajax(
      type: 'GET'
      url: @ch.loadMore.attr('href') + "?top_id=#{currentTopEvent.get('id')}"
      complete: =>
        @ch.loadMore.text(originalText).attr('disabled', false)

      success: (datas) =>
        @displayLoadMore = datas.length >= @pageSize
        @render()
        @preserveScrollPosition =>
          for data in _.sortBy(datas, (data) -> data['created_at']).reverse()
            @collection.unshift(data)
    )

  onHidden: (e) ->
    $('#create-task').modal('hide');

  onCreateWip: (e) ->
    e.preventDefault()
    id = $(e.currentTarget).attr('href')
    body = $(id + ' .activity-content').text().trim()
    productAttributes = @collection.product.attributes
    renderedModal = React.render(
      CreateBounty({
        title: body,
        url: productAttributes.url + '/bounties',
        averageBounty: productAttributes.average_bounty,
        maxOffer: parseInt(6 * productAttributes.average_bounty, 10),
        product: productAttributes,
        onHidden: @onHidden
      }),
      document.getElementById('create-task')
    );

    # FIXME: (pletcher) We need to call this method in addition to the setup
    #        in CreateBounty's componentDidMount() because the context differs.
    #        We should fix this once we get rid of those Mustache templates and
    #        and move everything to React.
    $('#create-task').modal()

  preserveScrollPosition: (cb) ->
    if @stuckToBottom
      cb() if cb
      @scrollToLatestActivity()
    else
      container = @scrollContainer[0]
      scrollTop = container.scrollTop
      scrollHeight = container.scrollHeight
      cb() if cb
      container.scrollTop = (container.scrollHeight - scrollHeight + scrollTop)
