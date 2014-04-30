class window.VoteView extends Backbone.View
  initialize: ->
    console.log 'init'
    @options = @$el.data()

    if @voted()
      @scoreUnvoted = @options.voteCount - @options.voteInc
      @scoreVoted = @options.voteCount
    else
      @scoreUnvoted = @options.voteCount
      @scoreVoted = @options.voteCount + @options.voteInc

  voted: ->
    console.log $(@el).attr('data-vote-voted')
    $(@el).attr('data-vote-voted') != undefined

  canDownvote: ->
    $(@el).attr('data-vote-downvotable') != undefined

  clicked: ->
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
    $(@el).attr('data-want-wanted', 'true')
    @$('.vote-box-count').text(@scoreVoted)
    @$('.want-module-count .vote').text(@scoreVoted)
    # This is a bad hack because the class isn't scoped broadly enough.
    @$el.parent().find('.badge').text(@scoreVoted)
    @createVote()

  unvote: ->
    $(@el).removeAttr('data-vote-voted')
    @$('.vote-box-count').text(@scoreUnvoted)
    @deleteVote()

  createVote: ->
    $.ajax
      type: "POST"
      url: @votePath()
      dataType: "json"

  votePath: ->
    @$el.attr('href') || @$el.data('vote-path')

  deleteVote: ->
    $.ajax
      type: "DELETE"
      url: @votePath()
      dataType: "json"
