#= require tips

COIN_INCREMENT = 100
DEBOUNCE_TIMEOUT = 2000

class window.TipsView extends Backbone.View
  className: 'tips'
  template:  JST['tips']

  events:
    'click a': 'onClick'

  initialize: (@options)->
    @addCents = 0

  render: =>
    @$el.html(@template.render(@templateData()))

  templateData: ->
    {
      coins: numeral(@totalCoins() / 100).format('0,0')
      "any_coins?": (@totalCoins() > 0)
      path: @path()
      "signed_in?": app.isSignedIn()
      "current_user_has_coins?": @currentUserHasCoins()
      "current_user_owner?": @currentUserOwner()
      "tips": @tips()
    }

  path: ->
    @$el.data('tips-path')

  totalCoins: ->
    _.reduce(@tips(), ((sum, tip) -> sum + tip.cents), 0)

  tips: ->
    @$el.data('tips') || @options.tips

  onClick: (e) ->
    e.preventDefault()
    if @currentUserCanTip()
      @optimisticTip()
      @save()
    else
      @$('[data-toggle=tooltip]').tooltip('show')

  currentUserCanTip: ->
    app.isSignedIn() && @currentUserHasCoins() && !@currentUserOwner()

  currentUserHasCoins: ->
    app.isSignedIn() &&
    app.currentUser().get('product_balance')[@$el.data('tips-product-id')] > 0

  currentUserOwner: ->
    app.isSignedIn() &&
    app.currentUser().get('username') == @$el.data('tips-to')

  optimisticTip: ->
    @addCents += COIN_INCREMENT
    @updateUserTip(COIN_INCREMENT)
    @render()

  updateUserTip: (cents)->
    @userTip().cents += cents

  userTip: ->
    user = app.currentUser().attributes
    tip = _.find(@tips(), (tip)-> tip.from.username == user.username )
    if !tip
      tip = {from: user, cents: 0}
      @tips().push(tip)
    tip

  save: _.debounce(->
    $.ajax(
      type: "POST"
      url: @path()
      data: { tip: { add: @addCents } }
      dataType: 'json'
      complete: =>
        @$el.data('coins', @addCents)
        @addCents = 0
    )
  , DEBOUNCE_TIMEOUT)

$(document).ready(->
  $('.js-tips').each ->
    $el = $(@)
    view = new TipsView(el: $el)
    view.render()
)
