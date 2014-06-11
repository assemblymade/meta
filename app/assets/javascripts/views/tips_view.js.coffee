#= require tips

COIN_INCREMENT = 100
DEBOUNCE_TIMEOUT = 2000

class window.TipsView extends Backbone.View
  className: 'tips'
  template:  JST['tips']

  events:
    'click a': 'onClick'

  initialize: ->
    @coins = 0

  render: =>
    @$el.html(@template.render(@templateData()))

  templateData: ->
    {
      coins: numeral(@totalCoins() / 100).format('0,0')
      "any_coins?": (@totalCoins() > 0)
      path: @path()
      "signed_in?": app.isSignedIn()
      "current_user_has_coins?": @currentUserHasCoins()
      "tips": @$el.data('tips')
    }

  path: ->
    @$el.data('tips-path')

  totalCoins: ->
    parseInt(@$el.data('tips-total'), 10) + @coins

  onClick: (e) ->
    e.preventDefault()
    if @currentUserCanTip()
      @optimisticTip()
      @save()
    else
      @$('[data-toggle=tooltip]').tooltip('show')

  currentUserCanTip: ->
    app.isSignedIn() && @currentUserHasCoins()

  currentUserHasCoins: ->
    app.isSignedIn() &&
    app.currentUser().get('product_balance')[@$el.data('tips-product-id')] > 0


  optimisticTip: ->
    @coins += COIN_INCREMENT
    @render()

  save: _.debounce(->
    $.ajax(
      type: "POST"
      url: @path()
      data: { tip: { add: @coins } }
      dataType: 'json'
      complete: =>
        @$el.data('coins', @coins)
        @coins = 0
    )
  , DEBOUNCE_TIMEOUT)

$(document).ready(->
  $('.js-tips').each ->
    $el = $(@)
    view = new TipsView(el: $el)
    view.render()
)
