class window.WipSearchResults extends Backbone.Collection
  model: WipSearchResult

  initialize: (options)->
    _.extend @, options