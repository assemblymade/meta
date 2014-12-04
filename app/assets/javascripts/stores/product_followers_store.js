var EventEmitter = require('events').EventEmitter
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken,
    _productFollowerCounts = {},
    _userFollowings = {};

class FollowedProductsStore extends EventEmitter {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.PRODUCT_RECEIVE_FOLLOWER_COUNTS:
          _(action.products).each((p) => {
            _productFollowerCounts[p.id] = p.followers_count
          })
          _(action.userFollowings).each((f) => {
            _userFollowings[f] = f
          })
          this.emit('change')
          break

        case ActionTypes.PRODUCT_FOLLOW_CLICKED:
          _productFollowerCounts[action.product_id] = (_productFollowerCounts[action.product_id] || 0) + 1
          _userFollowings[action.product_id] = action.product_id
          this.emit('change')
          break

        case ActionTypes.PRODUCT_UNFOLLOW_CLICKED:
          _productFollowerCounts[action.product_id] = (_productFollowerCounts[action.product_id] || 1) - 1
          delete _userFollowings[action.product_id]
          this.emit('change')
          break
      }
    })
  }

  getCount(product_id) {
    return _productFollowerCounts[product_id]
  }

  getFollowing(product_id) {
    return _userFollowings.hasOwnProperty(product_id)
  }
}

var store = new FollowedProductsStore()

var dataTag = document.getElementById('ProductFollowersStore')
if (dataTag) {
  var data = JSON.parse(dataTag.innerHTML)
  Dispatcher.dispatch({
    type: ActionTypes.PRODUCT_RECEIVE_FOLLOWER_COUNTS,
    products: data.products,
    userFollowings: data.userFollowings
  })
}

module.exports = store
