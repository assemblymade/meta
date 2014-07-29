#= require notify.js
#= require collections/activity_stream
#= require views/activity_view

SCROLL_TOLERANCE = 10

class window.ActivityStreamView extends Backbone.View
  collection: ActivityStream

  initialize: (@options)->
    @documentTitle = document.title

    @collection.each (model, index, collection) =>
      @buildSubviewForModel(model, index)

    @listenTo(@collection, 'add', @onCollectionAdd)
    $(window).on('focus', @onWindowFocus)

  renderTimestamp: ->
    @$('.timeline-insert.js-timestamp').each ->
      React.unmountComponentAtNode(@)
      $(@).remove()

    tsContainer = $('<div class="timeline-insert js-timestamp"></div>').insertBefore('.timeline-item:last')
    lastTime = @collection.last().get('created')
    React.renderComponent(Timestamp({time: lastTime}), tsContainer[0])

  buildSubviewForModel: (model, index) ->
    view = new ActivityView(model: model, subjectId: @options.subjectId, tipsPath: @options.tipsPath)

    if index == 0
      @$el.prepend(view.el)
    else
      @$(".timeline-item:nth-child(#{index})").after(view.el)

    view.render()
    @renderTimestamp() if @collection.any()


  scrollToLatestActivity: ->
    $(window).scrollTop($(document).height())

  # Event Handlers

  onCollectionAdd: (model, collection, info) =>
    lockScrollToBottom(=>
      @buildSubviewForModel(model, collection.indexOf(model))
    )

# --


lockScrollToBottom = (cb) ->
  scrolled = $(document).scrollTop()
  windowHeight = $(window).height()
  documentHeight = $(document).height()

  cb()

  if (scrolled + windowHeight) >= (documentHeight - SCROLL_TOLERANCE)
    $(document).scrollTop($(document).height())
