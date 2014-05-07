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
      coins: @$('.js-coins')

  voted: ->
    $(@el).attr('data-vote-voted') != undefined

  canDownvote: ->
    $(@el).attr('data-vote-downvotable') != undefined

  clicked: (e)->
    e.preventDefault()

    if app.isSignedIn()
      @toggleVote()
    else
      window.signup.display()

  toggleVote: ->
    if @voted()
      @unvote() if @canDownvote()
    else
      @vote()

  vote: ->
    $(@el).attr('data-vote-voted', 'true')
    @children.coins.text(numeral(@coinsVoted).format('0,0'))
    @createVote()
    window.app.trigger('voted')

  unvote: ->
    $(@el).removeAttr('data-vote-voted')
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
