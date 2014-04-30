class window.DesignDeliverables extends Backbone.Collection
  model: DesignDeliverable

  initialize: (options)->
    @options = options

  url: =>
    @options.wip_path + '/deliverables'
