class window.WipSearchResultView extends Backbone.View
  tagName: "li"
  className: "search-result"
  events:
    click: "select"

  render: ->
    @$el.html @template().render(@model.attributes)
    @

  template: ->
    JST["wips/search_result"]

  select: ->
    @options.parent.hide().select @model
    false


class window.WipSearchView extends Backbone.View
  tagName: "ul"
  className: "search-results"
  wait: 300
  queryParameter: "query"
  minKeywordLength: 2
  currentText: ""
  itemView: WipSearchResultView

  initialize: (options)->
    _.extend @, options
    @input = $("input[name=query]")
    @filter = _.debounce(@filter, @wait)
    @render()

  render: =>
    @input.
      keyup(@keyup).
      keydown(@keydown).
      after @$el

    @

  keydown: (event)=>
    return @move(-1)   if event.keyCode is 38
    return @move(+1)   if event.keyCode is 40
    return @onEnter()  if event.keyCode is 13
    @hide()  if event.keyCode is 27

  keyup: =>
    keyword = @input.val()

    if @isChanged(keyword)
      if @isValid(keyword)
        @filter keyword
      else
        @hide()

  filter: (keyword) ->
    keyword = keyword.toLowerCase()

    parameters = {}
    parameters[@queryParameter] = keyword

    @model.fetch
      success: => @loadResult @model.models, keyword
      data: parameters

  isValid: (keyword) ->
    keyword.length > @minKeywordLength

  isChanged: (keyword) ->
    @currentText isnt keyword

  move: (position) ->
    current = @$el.children(".active")
    siblings = @$el.children()
    index = current.index() + position

    if siblings.eq(index).length
      current.removeClass "active"
      siblings.eq(index).addClass "active"

    false

  onEnter: ->
    @$el.children(".active").click()
    false

  loadResult: (model, keyword) ->
    @currentText = keyword
    @show().reset()
    if model.length
      _.forEach model, @addItem, @
      @show()
    else
      @hide()

  addItem: (model) ->

    view = new @itemView(
      model: model
      parent: @
    )

    @$el.append view.render().$el

  select: (model) ->
    label = model.label()
    @input.val label
    @currentText = label
    @onSelect model

  reset: ->
    @$el.empty()
    @

  hide: ->
    @$el.hide()
    @

  show: ->
    @$el.show()
    @

  onSelect: (model)->
    app.redirectTo(model.get('url'))
