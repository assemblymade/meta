class window.TaskItemView extends Backbone.View
  tagName: 'li'
  className: ->
    "task-list-item task-list-item-#{@model.status()} hover-base"

  template: ->
    _.template($('#task-item-template').html())

  events:
    'dblclick':            'edit'
    'keypress .js-input':  'updateOnEnter'
    'keydown  .js-input':  'revertOnEscape'
    'blur     .js-input':  'close'
    'click    .js-edit':   'edit'
    'click    .js-remove': 'clear'

  keys:
    ESC: 27
    ENTER: 13

  initialize: ->
    @listenTo @model, 'change', @render
    @listenTo @model, 'remove', @remove
    @listenTo @model, 'destroy', @remove

  render: ->
    @$el.html(@template()(@model.toJSON().task))
    @$el.attr('class', @className())

    @$input = @$('.js-input')
    if !@$input.parent().hasClass('textcomplete-wrapper')
      $.applyTextcomplete(@$input)

    @

  edit: ->
    @$el.addClass('js-editing')
    $('.textcomplete-wrapper', @$el).show()
    @$input.focus()

  close: ->
    return unless @$el.hasClass('js-editing')

    val = @$input.val().trim()
    if val
      @model.save({title: val}, {patch: true})
    else
      @clear()

    @$el.removeClass('js-editing')

  updateOnEnter: (e)->
    if e.which == @keys.ENTER
      e.preventDefault()
      @close()

  revertOnEscape: (e)->
    @$el.removeClass('js-editing') if e.which == @keys.ESC

  clear: ->
    @model.destroy()
