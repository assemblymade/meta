class window.MissionStepsView extends Backbone.View
  events:
    'shown.bs.popover': 'onPopover'

  initialize: (options)->
    @cookieKey = "mission_#{options.productId}"
    @mission = options.mission
    @showMissionCompleted = options.showMissionCompleted
    @missionAnalytics = options.missionAnalytics
    @children =
      missionName: @$('.js-mission-name')
      prevMissionName: @$('.js-prev-mission-name')
      missionProgress: @$('.js-mission-progress')
      progressBar: @$('.js-progress-bar')

    window.app.on 'mission.flyout.open', =>
      $.cookie(@cookieKey, 'description')
      @popOpen()

    if options.autoOpen and not $.cookie(@cookieKey)
      $.cookie(@cookieKey, 'intro')
      @popOpen()

    @$el.click => analytics.track('mission.flyout.clicked', @missionAnalytics)

    @children.prevMissionName.hide()

    if @showMissionCompleted
      @children.missionName.hide()
      @children.prevMissionName.show()
      @children.missionProgress.text(@mission.steps)
      @children.progressBar.css('width', "100%")
      @popOpen()

  onPopover: =>
    $flyout = $('.popover .js-mission-flyout')
    @children.startMission = $('.js-start-mission', $flyout)
    @children.nextMission  = $('.js-next-mission', $flyout)
    @children.hintLinks    = $('.js-hints a', $flyout)

    @steps =
      all: $('.js-mission-step', $flyout)
      intro: $('.js-mission-step-intro', $flyout)
      description: $('.js-mission-step-description', $flyout)
      reward: $('.js-mission-step-reward', $flyout)

    analytics.trackLink @children.hintLinks, 'mission.flyout.hint.clicked', @missionAnalytics

    @children.startMission.click @startMissionClicked
    @children.nextMission.click @nextMissionClicked
    @showCurrentStep()

  startMissionClicked: =>
    analytics.track('mission.flyout.start.clicked', @missionAnalytics)
    $.cookie(@cookieKey, 'description')

    @showCurrentStep()

  nextMissionClicked: =>
    analytics.track('mission.flyout.next.clicked', @missionAnalytics)
    @showMissionCompleted = false
    @children.missionName.show()
    @children.prevMissionName.hide()
    @children.missionProgress.text(@mission.progress)
    @children.progressBar.css('width', "#{(@mission.progress / @mission.steps) * 100}%")

    @showCurrentStep()

  showCurrentStep: =>
    @steps.all.hide()

    if @showMissionCompleted
      @steps.reward.show()
    else if $.cookie(@cookieKey) == 'description'
      @steps.description.show()
    else
      @steps.intro.show()

  popOpen: ->
    @$el.popover('show')
    @onPopover()