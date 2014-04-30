class Counter
  success: (e, data)->
    $(e.target).trigger('counter:count', data.count)

  count: (e, n) ->
    $(e.currentTarget).find('.js-count-target').text(n)

  increment: (e)->
    data = $(e.currentTarget).data()

    if data.increment
      window.app.trigger "#{data.increment}:incremented"

$(document).ready ->
  counter = new Counter

  $(document)
    .on('ajax:beforeSend', '.js-count-container', counter.increment)
    .on('ajax:success', '.js-count-container', counter.success)
    .on('counter:count', '.js-count-container', counter.count)
