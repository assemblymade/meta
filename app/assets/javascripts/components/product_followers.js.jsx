'use strict';

const Icon = require('./ui/icon.js.jsx');
const ProductFollowersStore = require('../stores/product_followers_store');
const ProductActionCreators = require('../actions/product_action_creators');
const UserActions = require('../actions/user_actions')
const UserStore = require('../stores/user_store')

module.exports = React.createClass({
  displayName: 'ProductFollowers',

  propTypes: {
    product_id: React.PropTypes.string.isRequired
  },

  render() {
    let linkClasses = React.addons.classSet({
      'gray-2': !this.state.following,
      'gray-3': this.state.following,
      bold: true
    });

    return (
      <div className="inline-block py1">
        {this.renderCheckmark()}
        <a href="javascript:void(0);" onClick={this.handleClick} className={linkClasses}>
          {this.state.following ? 'Following' : 'Follow' }
        </a>
      </div>
    );
  },

  handleClick() {
    if (!UserStore.isSignedIn()) {
      UserActions.newSession()
      return
    }
    if (this.state.following) {
      ProductActionCreators.unfollowClicked(this.props.product_id)
    } else {
      ProductActionCreators.followClicked(this.props.product_id)
    }
  },

  // stores
  getInitialState() {
    return this.getStateFromStore()
  },

  componentDidMount() {
    ProductFollowersStore.addListener('change', this._onChange)
  },

  componentWillUnmount() {
    ProductFollowersStore.removeListener('change', this._onChange);
  },

  _onChange() {
    this.setState(this.getStateFromStore())
  },

  getStateFromStore() {
    return {
      count: ProductFollowersStore.getCount(this.props.product_id),
      following: ProductFollowersStore.getFollowing(this.props.product_id)
    }
  },

  renderCheckmark() {
    if (this.state.following) {
      return (
        <span className="green mr1">
          <Icon icon="star" />
        </span>
      );
    }

    return (
      <span className="gray-2 mr1">
        <Icon icon="star" />
      </span>
    )
  }
});

window.ProductFollowers = module.exports
