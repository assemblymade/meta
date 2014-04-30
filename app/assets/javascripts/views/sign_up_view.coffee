class window.SignUpView extends Backbone.View
  events:
    'click .facebook-signin': 'facebookSignIn'
    'click a.js-sign-in': 'signinClicked'
    'click a.back':    'resetForm'
    'ajax:success .new-session': 'loginSucceeded'
    'ajax:success .new-user': 'signupSucceeded'

  initialize: ->
    window.app.on 'user:signed_in', @loginSucceeded

  facebookSignIn: (e)=>
    e.preventDefault()
    @facebookBusyState(true)

    success = (user)=>
      if user.id
        @loginSucceeded()
      else
        @showFacebookSignUpForm(user)

    error = =>
      @resetForm()

    @requireFacebookUser success, error

  requireFacebookUser: (success, error)=>
    @fbSuccess = success
    @fbError = error

    FB.login @onFacebookResponse, scope: @options.fbScope

  onFacebookResponse: (response)=>
    if response.status == 'connected'
      @facebookConnected()
    else
      @facebookCancelled()

  facebookConnected: =>
    $.getJSON @options.fbCallbackPath, @onCallbackResponse

  facebookCancelled: =>
    @fbError()

  onCallbackResponse: (user)=>
    @fbUser = user
    @fbSuccess(user)

  showFacebookSignUpForm: (user)=>
    @$('.signin-or').hide()
    @$('.facebook-signin-form').hide()
    @$('.facebook-signup-form').show()
    @$('.facebook-busy').hide()
    @$('.email-signup').hide()
    @$('.regular-sign-in').hide()

    @$('.user .avatar img').attr('src', user.image)
    @$('.user .name').text(user.name)
    @$('.user .location').text(user.location) if user.location

    @$('.facebook-signup-form #user_facebook_uid').val(user.uid)
    @$('.facebook-signup-form #user_username').val(user.extra.username)
    @$('.facebook-signup-form #user_name').val(user.name)
    @$('.facebook-signup-form #user_email').val(user.email)
    @$('.facebook-signup-form #user_location').val(user.location)
    @$('.facebook-signup-form #user_extra_data').val(JSON.stringify(user.extra))

  loginSucceeded: =>
    if @options.afterSignInPath
      app.redirectTo @options.afterSignInPath
    else
      window.location.reload()

  signupSucceeded: =>

  signinClicked: (e)->
    e.preventDefault()
    @showSignin()

  showSignin: ->
    $('.sign-up').hide()
    $('.sign-in').show()

  facebookBusyState: (busy)->
    if busy
      @$('.facebook-signin').hide()
      @$('.facebook-busy').show()
    else
      @$('.facebook-busy').hide()
      @$('.facebook-signin').show()

  resetForm: ()->
    @facebookBusyState(false)
    @$('[name="user[follow_product]"]').val(@options.follow) if @options.follow
    @$('.facebook').show()
    @$('.facebook-signin-form').show()
    @$('.facebook-signup-form').hide()
    @$('.email-signup').show()
    @$('.regular-sign-in').hide()

  display: (options, callback)=>
    if options && options.tab == 'signup'
      $('#sign-up').modal()
    else
      $('#sign-in').modal()
