#= require notify.js
#= require collections/activity_stream
#= require views/activity_view

class window.ActivityStreamView extends Backbone.View
  collection: ActivityStream

  initialize: (options)->
    @unreadCount = 0
    @documentTitle = document.title

    @listenTo(@collection, 'add', @onCollectionAdd)
    $(window).on('focus', @onWindowFocus)

  render: ->
    @$el.empty()
    views = @collection.map (model) -> new ActivityView(model: model)
    for view in _.sortBy(views, (view) -> view.model.get('created'))
      @$el.append(view.el)
      view.render()

  setDocumentTitle: ->
    document.title = unreadDocumentTitle(@documentTitle, @unreadCount)

  incrementUnread: ->
    if !document.hasFocus()
      @unreadCount += 1
      @setDocumentTitle()

  scrollToLatestActivity: ->
    $(window).scrollTop($(document).height())

  # Event Handlers

  onCollectionAdd: (model) =>
    lockScrollToBottom(_.bind(@render, @))
    @incrementUnread()

  onWindowFocus: =>
    @unreadCount = 0
    @setDocumentTitle()

# --

unreadDocumentTitle = (title, unread) ->
  if unread != 0
    "(#{unread}) #{title}"
  else
    title

lockScrollToBottom = (cb) ->
  scrolled = $(document).scrollTop()
  windowHeight = $(window).height()
  documentHeight = $(document).height()

  cb()

  if (scrolled + windowHeight) >= documentHeight
    $(document).scrollTop($(document).height())
