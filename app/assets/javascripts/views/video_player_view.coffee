class window.VideoPlayerView extends Backbone.View
  events:
    'click': 'hideVideo'

  initialize: ->
    iframe = $("#player1")[0]
    @player = $f(iframe)
    @watched = 0

    $('#video-poster,#watch-video').click @showVideo

    # When the player is ready, add listeners
    @player.addEvent "ready", =>
      @player.addEvent "finish", @videoFinished
      @player.addEvent "playProgress", @videoProgress

  videoFinished: =>
    @trackWatch 1.0
    @$el.fadeOut()
    $("#signup").click()

  showVideo: =>
    @$el.fadeIn()
    @player.api "play"

  hideVideo: ->
    @$el.fadeOut()
    @player.api "pause"

  videoProgress: (progress)=>
    progressPoints = [0.9, 0.75, 0.25, 0.01]

    if progress.percent > @watched
      for point, i in progressPoints
        if progress.percent > point
          @watched = progressPoints[i-1]
          @trackWatch point
          return

  trackWatch: (percent)->
    analytics.track 'video.watched', percent: percent

