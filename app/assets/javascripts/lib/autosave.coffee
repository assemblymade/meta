(($) ->
  $.fn.autosave = (options) ->
    typingStarted = ($el) ->
      $el.removeClass('saving saved error')
      $el.addClass('typing')
      window.onbeforeunload = ->
        "You sure!?"

    typingStopped = ($el) ->
      window.onbeforeunload = null
      $el.removeClass('typing')
      $el.addClass('saving')
      # we only want to save the hidden inputs and the current field being edited:
      save($('input[type=hidden]').add($el))

    save = ($inputs) ->
      $form = $inputs.parents('form:first')
      $.ajax
        type: "POST"
        url: $form.attr('action')
        data: $inputs.serialize()
        dataType: "json"
        success: (data) ->
          applyErrors $inputs, data

    applyErrors = ($inputs, errors) ->
      $inputs.removeClass('saving')

      if _.isEmpty(errors)
        $inputs.addClass('saved')

      for name in _.keys(errors)
        $inputs.filter("[name=#{name}]").addClass('error')

    @each ->
      $(@).typing
        delay: 1500
        start: (e, $el) -> typingStarted($el)
        stop: (e, $el) -> typingStopped($el)
)(jQuery)