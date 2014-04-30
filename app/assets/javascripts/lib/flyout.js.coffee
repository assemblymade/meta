# Close popovers on body click
$(document).ready ->
  $('[data-toggle=popover]').popover
    content: $('#mission-popover-el').html()

  # close popovers on inner close link clicked
  $('[data-toggle=popover]').on 'shown.bs.popover', ->
    $('[data-close=popover]').click ->
      $('[data-toggle=popover]').popover('hide')

  # close popovers on body clicked but not if it's inside popover
  $('body').on 'click', (e)->
    $('[data-toggle="popover"]').each ->
      if (!$(@).is(e.target) && $(@).has(e.target).length == 0 && $('.popover').has(e.target).length == 0)
        $(this).popover('hide')
