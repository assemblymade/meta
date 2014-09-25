#= require collections/activity_stream

ENTER_KEY = 13

class window.ChatView extends Backbone.View
  collection: ActivityStream

  events:
    'click   .js-chat-load-more' : 'onLoadMore'
    'click   .js-chat-create-wip': 'onCreateWip'

  initialize: (options)->
    @ch =
      loadMore: @$('.js-chat-load-more')

    @listenTo(@collection, 'add', @render)
    @scrollContainer = options.scrollContainer

    @stuckToBottom = true

    @scrollContainer.css(
      'overflow-x':'hidden'
      'overflow-y':'scroll'
    )
    @scrollContainer.on 'scroll', this.loadMoreWhenNearTop
    @displayLoadMore = true
    @pageSize = 50

    app.on 'comment:scheduled', @optimisticallyCreateActivity.bind(@)

  render: =>
    @$('.js-chat-load-more').toggle(@displayLoadMore)
    @scrollToLatestActivity() if @stuckToBottom

  scrollToLatestActivity: =>
    @updateMembersHeight()
    $(@scrollContainer).scrollTop(999999)

  updateMembersHeight: ->
    $('.js-members').css({ 'max-height': ($(window).outerHeight() - 150) + 'px' });

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
    if @displayLoadMore
      nearTop = 200
      if e.currentTarget.scrollTop < nearTop
        this.loadMore(e)

  loadMore: (e)=>
    @stuckToBottom = false
    originalText = @ch.loadMore.text()
    currentTopEvent = @collection.first()
    @ch.loadMore.attr('disabled', true).text('Loading…')
    oldHeight = @scrollContainer[0].scrollHeight

    $.ajax(
      type: 'GET'
      url: @ch.loadMore.attr('href') + "?top_id=#{currentTopEvent.get('id')}"
      complete: =>
        @ch.loadMore.text(originalText).attr('disabled', false)

      success: (datas) =>
        @displayLoadMore = datas.length >= @pageSize
        @render()
        preserveScrollPosition @scrollContainer[0], =>
          for data in _.sortBy(datas, (data) -> data['created']).reverse()
            @collection.unshift(data)
    )

  onHidden: (e) ->
    $('#create-task').modal('hide');

  onCreateWip: (e) ->
    e.preventDefault()
    id = $(e.currentTarget).attr('href')
    body = $(id + ' .activity-content').text().trim()
    productAttributes = @collection.product.attributes
    renderedModal = React.renderComponent(
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

preserveScrollPosition = (container, cb) ->
  scrollTop = container.scrollTop
  scrollHeight = container.scrollHeight
  cb()
  container.scrollTop = (container.scrollHeight - scrollHeight + scrollTop)
