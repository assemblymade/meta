#= require dropzone
#= require marked

Dropzone.autoDiscover = false

# Fuzzify timestamps
$.timeago.settings.strings.months = "more than a month"
$.timeago.settings.strings.days = (n) ->
  if n < 7
    "%d days"
  else
    "more than a week"

window.app = new Application()

$(document).ready ->
  app.trigger('init')

  $('[data-autosize]').autosize().css('resize', 'none')
  $('[data-toggle=tooltip]').tooltip()

  $('time.timestamp').timeago()

  $('[data-track]').each ->
    analytics.trackLink @, $(@).data('track'), $(@).data('track-props')

  $('[data-dismissable]').each -> new DismissableView(el: @)
