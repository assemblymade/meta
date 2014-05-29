#= require jquery.inview

visibility = ->
  keys =
    hidden: "visibilitychange",
    webkitHidden: "webkitvisibilitychange",
    mozHidden: "mozvisibilitychange",
    msHidden: "msvisibilitychange"

  for stateKey, value of keys
    if (stateKey of document)
      eventKey = keys[stateKey]
      break

  (c) ->
    if (c)
      document.addEventListener eventKey, -> c(!document[stateKey])
    !document[stateKey]

visibility = visibility()

do ($ = jQuery, window, document) ->
	class Plugin
		constructor: (@el) ->
      @tracking = $(@el).data('readraptorTrack')
      @tracked = false

      visible = visibility(@onVisibilityChange)
      @onVisibilityChange(visible)

    onVisibilityChange: (visible)=>
      if visible
        @bindInView()
      else
        @unbindInView()

    bindInView: =>
      unless @tracked
        $(@el).one('inview', @visible)

    unbindInView: =>
      $(@el).unbind('inview')

		visible: (event, isInView, visiblePartX, visiblePartY)=>
      if (isInView)
        console.log('view', @tracking)
        $('body').append("<img class='hidden' src='#{@tracking}' width='0' height='0'>")


	$.fn.readraptor = (options) ->
		@each ->
			unless $.data @, "plugin_readraptor"
				$.data @, "plugin_readraptor", new Plugin @, options


$(document).ready(->
  $('[data-readraptor-track]').readraptor()
)
