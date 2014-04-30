class Toggler
  click: (e) ->
    $(e.target).trigger('toggler:toggle')

  toggle: (e) ->
    $container = $(e.currentTarget)
    $container.attr('data-toggle', !$container.attr('data-toggle'))


$(document).ready ->
  toggler = new Toggler

  $(document)
    .on('click', '.js-toggle-container .js-toggle-target', toggler.click)
    .on('toggler:toggle', '.js-toggle-container', toggler.toggle)
