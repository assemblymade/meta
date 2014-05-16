class window.ApplicationView extends Backbone.View
  events:
    'click   .js-enable-notifications' : 'onEnableNotificationsClicked'

  initialize: ->
    @children =
      enableNotifications: @$('.js-enable-notifications')

    if !Notify.isSupported() || !Notify.needsPermission()
      @children.enableNotifications.hide()

  onEnableNotificationsClicked: (e)->
    e.preventDefault()
    Notify.requestPermission(@permissionGranted)

  permissionGranted: =>
    @children.enableNotifications.hide()
