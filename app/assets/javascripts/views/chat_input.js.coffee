#= require collections/activity_stream

ENTER_KEY = 13

class window.ChatInput extends Backbone.View
  events:
    'keydown'   : 'onKeyDown'
    'keyup  '   : 'onKeyUp'
    'submit '   : 'onSubmit'

  initialize: ->
    @$ch =
      form: @$('form')
      textarea: @$('textarea')

  clearForm: =>
    @$ch.form[0].reset()
    @$ch.textarea.trigger('autosize.resize')

  onKeyDown: (e) =>
    return unless e.which == ENTER_KEY && !e.shiftKey
    e.preventDefault()

    comment = new Comment(
      body: @$ch.textarea.val()
    )

    if comment.isValid()
      @$ch.form.submit()

  onSubmit: (e) =>
    e.preventDefault()

    comment = new Comment(
      body: @$ch.textarea.val()
    )
    comment.url = @$ch.form.attr('action')

    app.trigger('comment:scheduled', comment)
    delay 0, @clearForm

  # onKeyUp: (e) =>
  #   actionsHeight = @$('.chat-bottom').height()
  #   @$('.chat-timeline').css('margin-bottom': actionsHeight)
