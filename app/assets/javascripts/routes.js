module.exports = {
  product_follow_path: function(product) {
    return '/' + product + '/follow'
  },
  product_unfollow_path: function(product) {
    return '/' + product + '/unfollow'
  }
}
