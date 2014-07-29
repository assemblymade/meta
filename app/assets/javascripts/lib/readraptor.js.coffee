#= require jquery.inview
#= require constants
#= require dispatcher

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
        $(document).trigger('readraptor.tracked') # this is a hack to notify that something new is tracked
				Dispatcher.dispatch
					event: CONSTANTS.DROPDOWN_NEWS_FEED.EVENTS.STORIES_FETCHED
					action: CONSTANTS.DROPDOWN_NEWS_FEED.ACTIONS.FETCH_STORIES
					data: null


	$.fn.readraptor = () ->
		@each ->
			unless $.data @, "plugin_readraptor"
				$.data @, "plugin_readraptor", new Plugin @


$(document).ready(->
  $('[data-readraptor-track]').readraptor()
)
