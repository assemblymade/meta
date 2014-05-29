#= require marked
#= require models/activity
#= require views/tips_view
#= require_tree ../../../templates/activities

class window.ActivityView extends Backbone.View
  className: 'timeline-item'
  model: Activity

  initialize: ->
    @listenTo(@model, 'change', @render)
    @subviews = {
      '.js-tips': new TipsView()
    }

  render: =>
    @$el.html(JST[@model.get('type')].render(@templateData()))

    for selector, view of @subviews
      view.setElement(@$(selector))
      view.render()

  templateData: ->
    data = _.clone(@model.attributes)
    data.target.body_html = @bodyHTML()
    data

  bodyHTML: ->
    @model.get('target').body_html || markdown(@model.get('target').body)

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
