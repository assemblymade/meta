#= require jquery
#= require jquery_ujs
#= require underscore
#= require backbone
#= require hogan

#= require bootstrap
#= require numeral
#= require jquery-textcomplete
#= require jquery-cookie
#= require jquery-autosize
#= require jquery-timeago
#= require es5-shim
#= require react
#= require notify.js
#= require zeroclipboard

#= require_tree ./lib

#= require_self
#= require ./main
#= require functional
#= require landline_migration
#= require_tree ./models
#= require_tree ./collections
#= require_tree ./views
#= require ./textcomplete
#= require ./polyfills
#= require ./components

class window.Application
  _.extend(@.prototype, Backbone.Events)

  setCurrentUser: (user) ->
    if !window.__rot && user.username == 'mdeiters'
      window.__rot = 0.001
      window.__acc = 0.001
      every 1000, ->
        window.__rot += window.__acc
        window.__acc += 0.0001
        $('body').css('-webkit-transform', "rotate(#{window.__rot}deg)")


    @_currentUser = new User(user)
    @trigger 'change:currentUser', @_currentUser
    @_currentUser

  currentUser: ->
    @_currentUser

  defaultBio: ->
    """
    Hi everyone, I'm Maeby! I love coding in VB6 across the stack.
     I also ping-pong a lot between concept and design. Hoping to get involved
     with UX, to help kickstart ideas, and to provide tangible feedback.

    I'm here partly because I think the app idea is great, but also because I
     think your team is outstanding and well-rounded – so I'm excited to learn
     alongside you. I'd like to free up to 8-16 hours a week (mostly evenings –
     I'm on CST here in Madison) to help ship this product. Great to see so many
     people working on this!
    """

  setCurrentAnalyticsProduct: (product) ->
    @_currentAnalyticsProduct = new Product(product)
    @trigger 'change:currentAnalyticsProduct', @_currentAnalyticsProduct
    @_currentAnalyticsProduct

  currentAnalyticsProduct: ->
    @_currentAnalyticsProduct

  setSuggestedTags: (tags) ->
    @_suggestedTags = tags

  suggestedTags: ->
    @_suggestedTags

  isSignedIn: ->
    @currentUser()?

  assetsPromotionSlug: ->
    'assemblycoins'

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

  pluralized: (val, singular, plural)->
    if val == 1
      singular
    else
      plural

  currentProductBalance: ->
    if user = @currentUser()
      return 0 unless app.product
      product_balance = user.get('product_balance')
      (product_balance && product_balance[app.product.id]) || 0

  mountReactComponents: (el)->
    for node in el.querySelectorAll('[data-react-class]')
      className = node.getAttribute('data-react-class')
      constructor = window[className]
      propsJson = node.getAttribute('data-react-props')
      props = propsJson && JSON.parse(propsJson)
      React.render(constructor(props), node)


  featureEnabled: (feature)->
    @staff()

  staff: ()->
    @currentUser() && @currentUser().get('staff')
