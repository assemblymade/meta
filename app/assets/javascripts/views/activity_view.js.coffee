#= require marked
#= require models/activity
#= require_tree ../../../templates/activities

class window.ActivityView extends Backbone.View
  className: 'timeline-item'
  model: Activity

  initialize: (options)->
    @listenTo(@model, 'change', @render)
    @subjectId = options.subjectId

  render: =>
    template = JST[@model.get('type')]
    if template
      @$el.html(template.render(@templateData()))
      $('[data-readraptor-track]', @$el).readraptor()
      $('.activity-content a').attr('target', '_blank')

      if app.product
        model = @model
        $('.js-insert-tips', @$el).each ->
          React.renderComponent(TipsUi({
            viaType: 'Activity',
            viaId: model.id,
            recipient: model.get('actor'),
            tips: model.get('tips')
          }), @)

  templateData: ->
    data = _.clone(@model.attributes)
    data.cid = @model.cid
    data.subject?.body_html = @bodyHTML()
    data

  bodyHTML: ->
    @model.get('subject').body_html || markdown(@model.get('subject').body)

  offsetTop: ->
    @$el.offset().top

# --

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
