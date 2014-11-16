#= require jquery.inview

do ($ = jQuery, window, document) ->
	class Plugin
		constructor: (@el) ->
      @tracking = $(@el).data('readraptorTrack')
      @tracked = false

      visible = window.visibility(@onVisibilityChange)
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
        $('body').append("<img class='hidden' src='#{@tracking}' width='0' height='0'>")
        # $(document).trigger('readraptor.tracked') # this is a hack to notify that something new is tracked


	$.fn.readraptor = () ->
		@each ->
			unless $.data @, "plugin_readraptor"
				$.data @, "plugin_readraptor", new Plugin @


$(document).ready(->
  $('[data-readraptor-track]').readraptor()
)
