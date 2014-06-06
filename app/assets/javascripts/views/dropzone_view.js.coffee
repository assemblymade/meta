#= require dropzone

signUpload = (file, xhr, formData) ->
  _.each file.form, (v,k) -> formData.append k, v

class DropzoneView extends Backbone.View
  initialize: (options) ->
    @targetForm = $(options.targetForm)

    @dz = new Dropzone(@el,
      accept: @onAccept
      sending: @onSending
      clickable: @$('.js-dropzone-select')[0]
      url: options.url
    )

    @dz.on 'complete', @onComplete

  onAccept: (file, done) =>
    @accept(file, done)

  # the attachment contains signed s3 upload form data, save it to dropzone's
  # file object for later

  accept: (file, done) ->
    attachment = new Attachment()
    attachment.save(
      name: file.name
      content_type: file.type
      size: file.size
    ,
      success: (attachment) ->
        file.form = attachment.get('form')
        file.attachment = attachment
        done()
    )

  onSending: (file, xhr, formData) =>
    signUpload(file, xhr, formData)

  onComplete: (file)=>
    @targetForm.each ->
      $('[name="asset[attachment_id]"]', @).val(file.attachment.id)
      $('[name="asset[name]"]', @).val(file.name)
    @targetForm.submit()

$(document).ready ->
  # FIXME: extract pattern into a helper
  url = $('meta[name=attachment-upload-url]').attr('content')
  thow 'error' unless url

  $('.js-dropzone').each ->
    view = new DropzoneView(el: @, url: url, targetForm: $(@).data('target-form'))
    $(@).data('dz', view.dz)

  # listen for modal creation and attach a dropzone
  # TODO: Consolidate this code and markdown_editor_view's code
  $('#create-task').on('show.bs.modal', (e) ->
    modalDropzone = $('.modal-body .js-dropzone')
    view = new DropzoneView(el: modalDropzone, url: url, targetForm: $(modalDropzone).data('target-form'))
    $(modalDropzone).data('dz', view.dz)
  )
