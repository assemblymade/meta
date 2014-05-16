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

  $('form[data-redirect]').each -> new AjaxFormView(el: @)

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

  $('form[data-require-user] button,form[data-require-user] input[type=submit]').click (e)->
    return if $(e.target).data('require-user') == false

    if app.isSignedIn()
      true
    else
      e.preventDefault()
      $form = $(e.target).parents('form:first')
      if key = $form.data('local-storage')
        if typeof(localStorage) != 'undefined'
          localStorage.setItem(key, JSON.stringify($form.serializeArray()))

      window.signup.display
        afterSignInPath: $(e.target).parents('form:first').data('require-user')

  $(document).delegate '[data-vote-count]', 'click', (e) ->
    voteView = $(@).data('vote-view') || new VoteView(el: @)
    $(@).data('vote-view', voteView)
    voteView.clicked(e)
    return false

  $(document).delegate '[data-view=coin-vote]', 'click', (e)->
    view = $(@).data('js-data-view') || new CoinVoteView(el: @)
    $(@).data('js-data-view', view)
    view.clicked(e)
    return false

  $('[data-autosize]').autosize().css('resize', 'none')
  $('[data-toggle=tooltip]').tooltip()
  $('[data-pluralize-count]').pluralizer()

  $('time.timestamp').timeago()
  $('time[data-format]').each ->
    $(@).text moment($(@).attr('datetime')).format($(@).data('format'))

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
  $('[data-view=tips]').each -> new TipBoxView(el: @)
