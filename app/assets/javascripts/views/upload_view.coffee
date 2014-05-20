#= require dropzone

class window.UploadView extends Backbone.View
  initialize: (options)->
    @attachments = new Attachments()
    @onUpload = options.onUpload

    @children =
      ready: @$('.js-ready')
      uploading: @$('.js-uploading')

    dz = @$el.dropzone
      accept: @beforeUpload
      clickable: @$('.js-select-files')[0]
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
    @onUpload @attachment.toJSON()

  uiState: (state)->
    if state == 'ready'
      @children.ready.show()
      @children.uploading.hide()
    else
      @children.ready.hide()
      @children.uploading.show()
