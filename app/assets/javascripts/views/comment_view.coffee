#= require dropzone

Dropzone.autoDiscover = false

class window.CommentView extends Backbone.View
  initialize: (options)->
    @attachments = new Attachments()
    @$textarea = @$('textarea')

    dz = @$('.js-dropzone').dropzone
      accept: @beforeUpload
      clickable: @$('.dropzone a')[0]
      sending: @signUpload
      success: @fileUploaded
      url: options.attachmentUploadUrl

  beforeUpload: (file, done)=>
    @addUploadPlaceholder file.name
    attributes =
      name: file.name
      content_type: file.type
      size: file.size

    @attachment = @attachments.create attributes,
      success: (attachment)->
        # the attachment contains signed s3 upload form data, save it to dropzone's file object for later
        file.form = attachment.get('form')
        done()

  signUpload: (file, xhr, formData)->
    _.each file.form, (v,k)-> formData.append k, v

  fileUploaded: =>
    @replaceUploadPlaceholder @attachment.get('name'), @attachment.get('href')

  addUploadPlaceholder: (key)->
    @insertTextAtCursor(@uploadPlaceholder(key))

  replaceUploadPlaceholder: (key, href)->
    placeholder = @uploadPlaceholder(key)
    @$textarea.val(@$textarea.val().replace(placeholder, "![#{key}](#{href})"))

  uploadPlaceholder: (key)->
    "![Uploading #{key} . . .]()"

  insertTextAtCursor: (text)->
    el = @$textarea[0]

    current = el.value
    if (typeof el.selectionStart != "undefined" && typeof el.selectionEnd != "undefined")
      endIndex = el.selectionEnd
      el.value = current.slice(0, el.selectionStart) + text + current.slice(endIndex)
      el.selectionStart = el.selectionEnd = endIndex + text.length

    else if (typeof document.selection != "undefined" && typeof document.selection.createRange != "undefined")
      el.focus()
      range = document.selection.createRange()
      range.collapse(false)
      range.text = text
      range.select()

    @$textarea.trigger('change')


$(document).ready ->
  $('.js-dropzone').dropzone(
    url: 'foobar'
  )
