'use strict';

const Icon = require('./ui/icon.js.jsx');
const ProductFollowersStore = require('../stores/product_followers_store');
const ProductActionCreators = require('../actions/product_actions');
const UserActions = require('../actions/user_actions')
const UserStore = require('../stores/user_store')
const classnames = require('classnames')

module.exports = React.createClass({
  displayName: 'ProductFollowers',

  propTypes: {
    product_id: React.PropTypes.string.isRequired
  },

  render() {
    let cs = classnames('block py1', {
      'blue blue-focus black-hover': !this.state.following,
      'gray-3 gray-3-hover gray-3-focus': this.state.following
    })

    return (
      <a className={cs} href="javascript:void(0);" onClick={this.handleClick}>
        {this.renderCheckmark()}
        {this.state.following ? 'Following' : 'Follow' }
      </a>
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
        <span className="mr1">
          <Icon icon="star" />
        </span>
      );
    }

    return (
      <span className="mr1">
        <Icon icon="star" />
      </span>
    )
  }
});

window.ProductFollowers = module.exports
