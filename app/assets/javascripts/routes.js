// make sure you name these routes the same as they are in the rails app so we can grep for them
// It would be awesome if there was a way to generate this file from the ruby routes

module.exports = {
  notifications_path: function() {
    return '/notifications'
  },
  product_follow_path: function(product) {
    return '/' + product + '/follow'
  },
  product_unfollow_path: function(product) {
    return '/' + product + '/unfollow'
  },
  readraptor_path: function(article_id) {
    return '/user/tracking/' + article_id
  }
}
