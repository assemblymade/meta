dismiss = '[data-dismiss="alert"]'

class window.Alert
  constructor: (el) ->
    $(el).on('click', dismiss, @close)

  close: (e) ->
    $el = $(@)
    selector = $el.attr('data-target')
    target = $(selector)

    if not target.length
      target = if $el.hasClass('alert') then $el else $el.parent()

    e.preventDefault()
    target.trigger('closed').remove()

# Bind events with data-api
$(document).on('click.alert', dismiss, Alert.prototype.close)
