#= require dropzone

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

  $('a[data-authenticate]').click (e)->
    if app.isSignedIn()
      true
    else
      e.preventDefault()
      window.location = '/signup'

  $('form[data-local-storage]').each ->
    if typeof(localStorage) != 'undefined'
      key = $(@).data('local-storage')
      if val = localStorage.getItem(key)
        fields = JSON.parse(val)
        for field in fields
          $("input[name='#{field.name}'],textarea[name='#{field.name}']", @).val(field.value)
        localStorage.removeItem(key)
        $(@).submit()

  $(document).delegate '[data-vote-count]', 'click', (e) ->
    voteView = $(@).data('vote-view') || new VoteView(el: @)
    $(@).data('vote-view', voteView)
    voteView.clicked(e)
    return false

  $('[data-autosize]').autosize().css('resize', 'none')
  $('[data-toggle=tooltip]').tooltip()
  $('[data-pluralize-count]').pluralizer()

  $('time.timestamp').timeago()
  $('time[data-format]').each ->
    $(@).text moment($(@).attr('datetime')).format($(@).data('format'))
  $('time[data-diff]').each ->
    $(@).text moment($(@).attr('datetime')).diff(new Date(), 'days');

  $('[data-list-active-class]').click (e)->
    className = $(e.target).data('list-active-class')
    $(e.target).siblings().removeClass(className)
    $(e.target).addClass(className)

  $('[data-show-tab]').click (e)->
    tabId = $(e.target).data('show-tab')
    $(".tab-content ##{tabId}").siblings().hide()
    $(".tab-content ##{tabId}").show()

  $('[data-click-trigger]').click (e)->
    event = $(e.target).data('click-trigger')
    window.app.trigger(event)
    return false

  $('[data-track]').each ->
    analytics.trackLink @, $(@).data('track'), $(@).data('track-props')

  $('[data-dismissable]').each -> new DismissableView(el: @)

  new ApplicationView(el: $('body'))
