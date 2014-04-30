class window.NewSessionView extends Backbone.View
  events:
    'ajax:complete': 'signin'
    'click .new-facebook-session .btn-sign-in': 'facebookSignin'
    'click .forgot-password': 'showPasswordReset'
    'click a.js-sign-up': 'signupClicked'
    'ajax:success .password-reset': 'passwordResetSent'

  initialize: ()->
    window.app.on 'user:selected', @userSelected
    window.app.on 'user:deselected', @userDeselected
    window.app.on 'user:email-entered', @emailEntered
    window.app.on 'user:email-removed', @emailRemoved
    @render({})

  render: (data)->
    # TODO: Figure out why this was needed
    # @$('.new-facebook-session').toggle(data.facebook == true)
    # @$('.new-assembly-session').toggle(data.password == true && !data.facebook)

    @$('input[name="user[id]"]').val(data.id)
    @$('input[name="user[login]"]').val(data.id)

    @$('.impersonate-session').toggle(data.facebook == true || data.password == true)
    @$('a.impersonate').attr('href', "/impersonate/#{data.id}?return_to=#{window.signup.options.afterSignInPath}")

    if data.avatar_url
      @$('.selected-user-avatar').attr('src', data.avatar_url).show()
    else
      @$('.selected-user-avatar').hide()

  showPasswordReset: =>
    @$('.new-session').hide()
    @$('.password-reset-sent').hide()
    @$('.password-reset').show()
    @$('input[name="user[email]"]').focus()

  passwordResetSent: =>
    @$('.password-reset').hide()
    @$('.password-reset-sent').show()

  userSelected: (data)=>
    @render(data)

  userDeselected: (data)=>
    @render({})
    @$('.new-session').show()
    @$('.password-reset').hide()
    @$('.password-reset-sent').hide()

  signin: (e, xhr, status)=>
    if xhr.status == 201 || xhr.status == 200
      @signinSuccess()
    else
      @signinError(xhr.responseJSON)

  signinError: (data)=>

  signinSuccess: =>
    window.app.trigger 'user:signed_in'

  facebookSignin: (e)->
    e.preventDefault()
    FB.login (response)=>
      if response.authResponse
        @$('input[name=signed_request]').val(response.authResponse.signedRequest)
        @$('.new-facebook-session form').submit()

  emailEntered: (email)=>
    @$('input[name="user[email]"]').val(email)
    @$('.password-reset .email').hide()
    @render(id: email, password: true, focus: false)

  emailRemoved: =>
    @$('.password-reset .email').show()
    @$('input[name="user[email]"]').val('')
    @render({})

  signupClicked: (e) ->
    e.preventDefault()
    @showSignup()

  showSignup: ->
    $('.sign-in').hide()
    $('.sign-up').show()
