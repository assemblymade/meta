#= require dropzone

signUpload = (file, xhr, formData) ->
  _.each file.form, (v,k) -> formData.append k, v

class DropzoneView extends Backbone.View
  initialize: (options) ->
    @dz = new Dropzone(@el,
      accept: @onAccept
      sending: @onSending
      clickable: @$('.dropzone-inner')[0]
      url: options.url
    )

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

$(document).ready ->
  # FIXME: extract pattern into a helper
  url = $('meta[name=attachment-upload-url]').attr('content')
  thow 'error' unless url

  $('.js-dropzone').each ->
    view = new DropzoneView(el: @, url: url)
    $(@).data('dz', view.dz)
