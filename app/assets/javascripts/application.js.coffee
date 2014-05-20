#= require jquery
#= require jquery_ujs
#= require underscore
#= require backbone
#= require hogan

#= require bootstrap
#= require numeral
#= require jquery-textcomplete
#= require jquery-cookie
#= require jquery.autosize
#= require jquery-timeago

#= require_tree ./lib

#= require_self
#= require ./main
#= require_tree ./models
#= require_tree ./collections
#= require_tree ./views
#= require ./textcomplete

class window.Application
  _.extend(@.prototype, Backbone.Events)

  setCurrentUser: (user) ->
    @_currentUser = new User(user)
    @trigger 'change:currentUser', @_currentUser
    @_currentUser

  currentUser: ->
    @_currentUser

  isSignedIn: ->
    @currentUser()?

  redirectTo: (path) ->
    window.location = path
    if window.location.hash
      window.location.reload()

  formAttributes: (form) ->
    arr = $(form).serializeArray()
    _(arr).reduce (acc, field) ->
      acc[field.name] = field.value
      acc

  pluralize: (val, name)->
    if val == 1
      "#{val} #{name}"
    else
      "#{val} #{name}s"
