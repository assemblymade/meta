#= require_tree ../../../templates/events
#= require ../dispatcher
#= require ../constants
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
  className: 'timeline-item'

  initialize: (@options) ->
    @listenTo @model, 'change', @render
    Dispatcher.dispatch
      action: CONSTANTS.NEWS_FEED.ACTIONS.MARK_STORY_AS_READ
      data: { key: 'Story_' + app.wip.id, readraptor_url: app.wip.readRaptorUrl }
      sync: true

  template: ->
    template_name = eventTypeToTemplate(@model.get('type'))
    JST[template_name]

  render: =>
    @$el.html(@template().render(@templateData()))

    $('.activity', @$el).readraptor()
    unless @model.isNew()
      model = @model

      $('.js-insert-tips', @$el).each ->
        React.renderComponent(TipsUi({
          viaType: 'Event',
          viaId: model.id,
          recipient: model.get('actor'),
          tips: model.get('tips')
        }), @)

    @$('time').timeago() # display new timestamp
    @

  templateData: ->
    attrs = @model.attributes
    attrs.body_html = @model.get('body_html') || markdown(@model.get('body'))
    attrs
