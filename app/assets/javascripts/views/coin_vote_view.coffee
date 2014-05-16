class window.CoinVoteView extends Backbone.View
  initialize: ->
    @options = @$el.data()

    if @voted()
      @coinsUnvoted = @options.coins - @options.coinsAdd
      @coinsVoted = @options.coins
    else
      @coinsUnvoted = @options.coins
      @coinsVoted = @options.coins + @options.coinsAdd

    @children =
      btn: @$('.js-coin-vote-btn')
      coins: @$('.js-coins')

  voted: =>
    @children.btn.hasClass('disabled')

  canDownvote: ->
    $(@el).attr('data-vote-downvotable') != undefined

  clicked: (e)->
    e.preventDefault()

    if app.isSignedIn()
      @toggleVote()
    else
      window.location = '/signup'

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
