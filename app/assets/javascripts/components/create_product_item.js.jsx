var Bounty = require('./bounty.js.jsx');
var page = require('page');
var routes = require('../routes');
var NewPostModal = require('./posts/new_post_modal.js.jsx');
var UserActions = require('../actions/user_actions');
var UserStore = require('../stores/user_store');

var CreateProductItem = React.createClass({
  propTypes: {
    activeMenuItem: React.PropTypes.oneOf([
        'asset',
        'bounty',
        'post'
    ]).isRequired,
    product: React.PropTypes.object.isRequired
  },

  render: function() {
    var createBountyMenuItem = <DropdownMenu.Item
          key="create bounty"
          label='Create bounty'
          action={Bounty.showCreateBounty.bind(null, this.props.product)} />

    var createPostMenuItem = <DropdownMenu.Item
          key="create post"
          label='Create post'
          action="javascript:window.showCreatePost();void(0);" />

    var createAssetMenuItem = <DropdownMenu.Item
          key="create asset"
          label='Create asset'
          action={routes.new_product_asset_path({product_id: this.props.product.slug})} />

    var menuItems = {
      bounty: createBountyMenuItem,
      post:   createPostMenuItem,
      asset:  createAssetMenuItem
    }

    var activeMenuItem = this.props.activeMenuItem;

    var primaryAction = menuItems[activeMenuItem].props.action
    var primaryLabel = menuItems[activeMenuItem].props.label
    delete menuItems[activeMenuItem]

    var dropdownMenu = (
      <DropdownMenu position='right'>
        {_.values(menuItems)}
      </DropdownMenu>
    );

    return (
      <ButtonDropdown
          type='default'
          dropdownMenu={dropdownMenu}
          action={this.handleClick(primaryAction)}>
        {primaryLabel}
      </ButtonDropdown>
    );
  },

  handleClick: function(action) {
    return function() {
      if (UserStore.isSignedIn()) {
        page(action);
      } else {
        UserActions.newSession()
      }
    }
  }
})

module.exports = window.CreateProductItem = CreateProductItem
