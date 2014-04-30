class window.WipEvents extends Backbone.Collection
  model: WipEvent

  lastNumber: ->
    @last()?.get('number')

  nextNumber: ->
    (@lastNumber() or 0) + 1
