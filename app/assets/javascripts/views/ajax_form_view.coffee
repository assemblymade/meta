class window.AjaxFormView extends Backbone.View
  events:
    'ajax:error': 'ajaxError'
    'ajax:success': 'ajaxSuccess'

  initialize: ->
    @$('input[type=text],input[type=email],textarea').typing
      delay: 1500
      start: (e, $el) => @typingStarted($(e.target))
      stop: (e, $el) => @typingStopped($(e.target))

  ajaxSuccess: (evt, data, status, xhr) ->
    @$('.form-error').hide()

    # turn off re-enabling disabled buttons as we're going to redirect anyway
    $(document).off('ajax:complete.rails')

    redirect = @$el.data('redirect') || xhr.getResponseHeader('Location')
    if redirect != 'override'
      if redirect
        window.app.redirectTo redirect
      else
        window.location.hash = ""
        window.location.reload()

  ajaxError: (e, xhr)->
    if xhr.responseJSON
      @appendErrors(xhr)
    else
      alert('Sorry! There was an unexpected error, Assembly has been notified')

  appendErrors: (xhr)->
    resource = @$el.data('resource')
    @$('.inline-error-message').remove()

    el = @$('.form-error .message')
    if xhr.responseJSON && xhr.responseJSON.errors
      for field, errors of xhr.responseJSON.errors
        @$("[name='#{resource}[#{field}]']").
          addClass('error').
          before($('<div class="inline-error-message">' + errors[0] + '</div>'))

    $('form-error').show()

  typingStarted: ($el)->
    $wrapper = $el.parents('.error-wrap')
    $('.error', $wrapper).removeClass('error')
    $('.inline-error-message', $wrapper).remove()

  typingStopped: ($el)->
