#= require dropzone

class window.DesignDeliverableView extends Backbone.View
  initialize: (options)->
    @attachments = new Attachments()
    @deliverables = new DesignDeliverables(wip_path: options.wip_path)

    dz = @$el.dropzone
      accept: @beforeUpload
      clickable: @$('.file-drop-select')[0]
      sending: @signUpload
      success: @fileUploaded
      url: options.attachmentUploadUrl

    @uiState('ready')

  beforeUpload: (file, done)=>
    @uiState('uploading')

    attributes =
      name: file.name
      content_type: file.type
      size: file.size

    @attachment = @attachments.create attributes,
      success: (attachment)=>
        # the attachment contains signed s3 upload form data, save it to dropzone's file object for later
        file.form = attachment.get('form')
        done()

  signUpload: (file, xhr, formData)->
    _.each file.form, (v,k)-> formData.append k, v

  fileUploaded: =>
    @uiState('ready')

    attributes = { attachment_id: @attachment.get('id') }
    @deliverables.create attributes,
      success: =>
        app.redirectTo @options.wip_path

  uiState: (state)->
    if state == 'ready'
      @$('.upload-state-ready').show()
      @$('.upload-state-uploading').hide()
    else
      @$('.upload-state-ready').hide()
      @$('.upload-state-uploading').show()
