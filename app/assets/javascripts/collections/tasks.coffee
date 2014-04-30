class window.Tasks extends Backbone.Collection
  model: TaskItem

  nextOrder: ->
    return 1 unless @length

    @last().get('order') + 1

  newItems: ->
    @filter (task)-> task.isNew()
