var CONSTANTS = window.CONSTANTS;
var ProductFollowersStore = require('../stores/product_followers_store');
var ProductActionCreators = require('../actions/product_action_creators');

module.exports = React.createClass({
  propTypes: {
    product_id: React.PropTypes.string.isRequired
  },

  render: function() {
    return (
      <div className="dropdown">
        <button className={this.togglerClasses()} type="button" onClick={this.handleClick}>
          <div className="toggler-label">{this.state.following ? 'Following' : 'Follow' }</div>

          <div className="toggler-badge">
            {this.state.count}
          </div>
        </button>
      </div>
    );
  },

  handleClick: function() {
    if (this.state.following) {
      ProductActionCreators.unfollowClicked(this.props.product_id)
    } else {
      ProductActionCreators.followClicked(this.props.product_id)
    }
  },

  togglerClasses: function() {
    return React.addons.classSet({
      'dropdown-toggle': true,
      'toggler': true,
      'block': true,
      'full-width': true,
      'toggler-primary': (!this.state.following)
    })
  },

  // stores
  getInitialState: function() {
    return this.getStateFromStore()
  },

  componentWillMount: function() {
    ProductFollowersStore.addListener('change', this._onChange)
  },

  componentWillUnmount: function() {
    ProductFollowersStore.removeListener('change', this._onChange);
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  },

  getStateFromStore: function() {
    return {
      count: ProductFollowersStore.getCount(this.props.product_id),
      following: ProductFollowersStore.getFollowing(this.props.product_id)
    }
  }
});

window.ProductFollowers = module.exports
