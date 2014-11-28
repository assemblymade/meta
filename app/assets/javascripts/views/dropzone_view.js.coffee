#= require dropzone

signUpload = (file, xhr, formData) ->
  _.each file.form, (v,k) -> formData.append k, v

class window.DropzoneView extends Backbone.View
  initialize: (options) ->
    @targetForm = $(options.targetForm)

    @dz = new Dropzone(@el,
      accept: @onAccept
      sending: @onSending
      uploadprogress: @onUploadProgress
      clickable: options['selectEl'] || @$('.js-dropzone-select')[0]
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

  onUploadProgress: (progress, bytesSent) =>
    @showProgress(progress)

  onComplete: (file)=>
    @targetForm.each ->
      $('[name="asset[attachment_id]"]', @).val(file.attachment.id)
      $('[name="asset[name]"]', @).val(file.name)
    @targetForm.submit()
    @hideProgress()

    attachmentInput = "<input class=\"comment_attachments\" name=\"event_comment[attachments][]\" type=\"hidden\" value=\"" + file.attachment.id + "\" />"
    $(@el).append(attachmentInput)

  showProgress: (progress) =>
    $('.progress', @el).show()
    $('.progress-bar', @el).css(width: "#{progress.upload.progress}%")

  hideProgress: =>
    $('.progress', @el).hide()

$(document).ready ->
  # FIXME: extract pattern into a helper
  url = $('meta[name=attachment-upload-url]').attr('content')
  # Throwing an error here causes issues with the rest of
  # the app's JavaScript loading. Changed to return for now.
  return 'error' unless url

  $('.js-dropzone').each ->
    view = new DropzoneView(el: @, url: url, targetForm: $(@).data('target-form'))
    $(@).data('dz', view.dz)
