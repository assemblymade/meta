class IdeaStatsView extends Backbone.View
  initialize: (options)->
    @data = options.data
    window.app.on 'counters:votes:incremented', @votesIncremented
    @render(options.data)

  render: ->
    @$('.value[data-stat=votes]').text(@data.votes)

  votesIncremented: =>
    @data.votes += 1
    @render()
    @$('.value[data-stat=votes]').parent().addClass('value-changed')

$(document).ready ->
  $('.idea-stats').each -> new IdeaStatsView(el: @, data: $(@).data())
