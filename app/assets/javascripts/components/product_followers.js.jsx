var CONSTANTS = window.CONSTANTS;
var ProductFollowersStore = require('../stores/product_followers_store');
var ProductActionCreators = require('../actions/product_action_creators');

module.exports = React.createClass({
  propTypes: {
    product_id: React.PropTypes.string.isRequired
  },

  render: function() {
    return (
      <button className={this.togglerClasses()} type="button" onClick={this.handleClick}>
        <span className="title fs3">{this.state.following ? 'Following' : 'Follow' }</span>
      </button>
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
      'pill-button': true,
      'pill-button-theme-white-blue': true,
      'pill-button-border': true,
      'pill-button-shadow': true,
      'mcenter': true,
      'dropdown-toggle': true,
      'toggler': true,
      'active': (this.state.following),
      'pill-button-success': (this.state.following),
      'r768_mright': true,
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
