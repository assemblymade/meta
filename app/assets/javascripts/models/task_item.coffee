class window.TaskItem extends Backbone.Model
  defaults:
    state: 'open'
    id: null
    number: null
    title: ''
    url: null

  url: ->
    switch
      when @get('number') then "#{@collection.url}/#{@get('number')}"
      when @get('pending-number') then "#{@collection.url}/#{@get('pending-number')}"
      else
        @collection.url

  complete: ->
    @get('state') == 'resolved'

  status: ->
    switch
      when @get('title') == '' then 'new-entry'
      when @complete() then 'complete'
      else 'incomplete'

  toJSON: ->
    task: _.clone(@attributes)

  isNew: ->
    this.number == null
