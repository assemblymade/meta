class window.CoinVoteView extends Backbone.View
  initialize: ->
    @options = @$el.data()

    @children =
      btn: @$('.js-coin-vote-btn')
      coins: @$('.js-coins')

    if @voted()
      @coinsUnvoted = @options.coins - @options.coinsAdd
      @coinsVoted = @options.coins
    else
      @coinsUnvoted = @options.coins
      @coinsVoted = @options.coins + @options.coinsAdd

  voted: =>
    @children.btn.hasClass('disabled')

  canDownvote: ->
    $(@el).attr('data-vote-downvotable') != undefined

  onClick: (e) =>
    e.preventDefault()
    @toggleVote()

  toggleVote: ->
    if @voted()
      @unvote() if @canDownvote()
    else
      @vote()

  vote: ->
    @children.btn.addClass('disabled')
    @children.coins.text(numeral(@coinsVoted).format('0,0'))
    @createVote()
    window.app.trigger('voted')

  unvote: ->
    @children.btn.removeClass('disabled')
    @children.coins.text(numeral(@coinsUnvoted).format('0,0'))
    @deleteVote()
    window.app.trigger('unvoted')

  createVote: ->
    $.ajax
      type: "POST"
      url: $(@el).data('vote-path')
      dataType: "json"

  deleteVote: ->
    $.ajax
      type: "DELETE"
      url: $(@el).data('vote-path')
      dataType: "json"

$(document).ready ->
  $(document).on 'click', '.js-coin-vote-btn', (e) ->
    $el = $(e.target)
    viewEl = $el.parents('.js-coin-vote')[0]
    view = $el.data('js-data-view') || new CoinVoteView(el: viewEl)
    $el.data('js-data-view', view)
    view.onClick(e)
    return false
