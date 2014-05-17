#= require_tree ../../../templates/events
#= require marked

markdown = (text) ->
  marked(text || '')

underscore = (text) ->
  text.replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase()

endsWith = (str, suffix)->
  str.indexOf(suffix, str.length - suffix.length) != -1

pluralize = (text)->
  if endsWith(text, 'y')
    "#{text.substr(0, text.length-1)}ies"
  else
    "#{text}s"

eventTypeToTemplate = (type)->
  underscored = underscore(type.replace('Event::',''))
  "events/#{pluralize(underscored)}/_#{underscored}"

class window.WipEventView extends Backbone.View
  initialize: ->
    @listenTo @model, 'change', @render

  template: ->
    template_name = eventTypeToTemplate(@model.get('type'))
    JST[template_name]

  render: =>
    @setElement @template().render(@templateAttributes())
    @$('time').timeago() # display new timestamp
    @

  templateAttributes: ->
    attrs = @model.attributes
    attrs.body_html = @body_html()
    attrs

  body_html: (text) ->
    @model.get('body_html') || markdown(@model.get('body'))
