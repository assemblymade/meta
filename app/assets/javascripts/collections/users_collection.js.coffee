#= require backbone
#= require models/user

class window.UsersCollection extends Backbone.Collection
  model: window.User
