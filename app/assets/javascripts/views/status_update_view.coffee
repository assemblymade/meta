class window.StatusUpdateView extends Backbone.View
  events:
    'focus .update': 'onFocus'
    # 'blur .update': 'onBlur'

  onFocus: ->
    @$('.update').height('180px')
    @$('.form-actions').show()

  onBlur: ->
    @$('.update').removeAttr('style')
    @$('.form-actions').hide()
