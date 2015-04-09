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
    if @model.get('type') == 'activities/chat' && @model.attributes.subject
      subject = @model.attributes.subject
      tipsProps = null

      if @model.id and window.app.product
        tipsProps =
          viaType: 'Activity'
          viaId: @model.id
          recipient: @model.get('actor')
          tips: @model.get('tips')


      React.render(
        ChatEntry({
          id: @model.id,
          user: @model.attributes.actor,
          tips: tipsProps,
          entry: {
            number: subject.number,
            message: subject.body,
            message_html: subject.body_html,
          }
        }), @$el[0])

    else if template
      @$el.html(template.render(@templateData()))
      $('[data-readraptor-track]', @$el).readraptor()
      $('.activity-content a,.media-body a').attr('target', '_blank')

      if app.product
        model = @model
        $('.js-insert-tips', @$el).each ->
          React.render(TipsUi({
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
