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

  sync: (method, model, options)->
    return if @url() == undefined

    if method == 'create'
      matches = /^#?(\d+)\s*$/.exec(@get('title'))
      if matches
        @set('pending-number', matches[1])
        @fetch
          success: =>
            @save()
      else
        Backbone.sync.apply(@, arguments)

    else
      Backbone.sync.apply(@, arguments)

  complete: ->
    @get('state') == 'resolved'

  status: ->
    switch
      when @get('title') == '' then 'new-entry'
      when @complete() then 'complete'
      else 'incomplete'

  toJSON: ->
    task: _.clone(@attributes)
