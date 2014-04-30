class window.CodeNameGeneratorView extends Backbone.View
  events:
    'click .js-refresh': 'onRefreshClicked'

  initialize: ->
    @input = @$('.js-name-input')
    @requestAndUpdateName()

  onRefreshClicked: (e)->
    e.preventDefault()
    @requestAndUpdateName()

  requestAndUpdateName: =>
    $.ajax
      url: '/products/generate-name'
      type: 'POST'
      dataType: 'json'
      success: (data) =>
        @updateName data.name

  updateName: (name)->
    @input.val(name)
    @input.trigger('change')




