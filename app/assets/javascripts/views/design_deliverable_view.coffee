class window.DesignDeliverableView extends Backbone.View
  initialize: (options)->
    @deliverables = new DesignDeliverables(wip_path: options.wip_path)

    dropzone = @$el.data('dz')
    dropzone.on('success', @onSuccess)

  onSuccess: (e) =>
    attachment = e.attachment
    attributes = { attachment_id: attachment.get('id') }
    @deliverables.create attributes,
      success: =>
        app.redirectTo @options.wip_path
