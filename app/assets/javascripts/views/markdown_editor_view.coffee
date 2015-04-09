#= require jquery-autosize
#= require dropzone

insertTextAtCursor = (el, text)->
  current = el.value
  if el.selectionStart? && el.selectionEnd?
    endIndex = el.selectionEnd
    el.value = current.slice(0, el.selectionStart) + text + current.slice(endIndex)
    el.selectionStart = el.selectionEnd = endIndex + text.length

  else if typeof document.selection? && document.selection.createRange?
    el.focus()
    range = document.selection.createRange()
    range.collapse(false)
    range.text = text
    range.select()

uploadPlaceholder = (text) -> "![Uploading... #{text}]()"

class window.MarkdownEditorView extends Backbone.View
  className: 'js-markdown-editor'

  initialize: (options) ->
    @textarea = @$('textarea')
    @textarea.autosize(append: '')
    $.applyTextcomplete(@textarea)
    dropzone = options['dropzone'] || @$el.data('dz')

    dropzone.on('addedfile', @onAddedFile)
    dropzone.on('success', @onSuccess)
    dropzone.on('complete', @onComplete)

  onAddedFile: (file) =>
    @addUploadPlaceholder(file.name)

  onSuccess: (file) =>
    @replaceUploadPlaceholder(file.type, file.name, file.attachment.get('href'))

  onComplete: (file) =>
    @textarea.trigger('autosize.resize').trigger('change')

  addUploadPlaceholder: (key) ->
    insertTextAtCursor(@textarea[0], uploadPlaceholder(key))

  replaceUploadPlaceholder: (type, key, href) ->
    placeholder = uploadPlaceholder(key)
    replacement = if type.match(/image|pdf|png|psd/)
      "![#{key}](#{href})"
    else
      "[#{key}](#{href})"

    @textarea.val(@textarea.val().replace(placeholder, replacement))


$(document).ready ->
  $('.js-markdown-editor').each ->
    view = new MarkdownEditorView(el: @)
    $(@).data('view', view)

