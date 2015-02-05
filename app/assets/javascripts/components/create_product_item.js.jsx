var routes = require('../routes')
var UserActions = require('../actions/user_actions')
var UserStore = require('../stores/user_store')

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
          label='Create bounty'
          action="javascript:showCreateBounty();void(0);" />

    var createPostMenuItem = <DropdownMenu.Item
          label='Create post'
          action={routes.new_product_post_path({product_id: this.props.product.slug})} />

    var createAssetMenuItem = <DropdownMenu.Item
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

    var dropdownMenu = <DropdownMenu position='right'>
      {_.values(menuItems)}
    </DropdownMenu>

    return <ButtonDropdown
      type='primary'
      dropdownMenu={dropdownMenu}
      action={this.handleClick(primaryAction)}>
      {primaryLabel}
    </ButtonDropdown>
  },

  handleClick: function(action) {
    return function() {
      if (UserStore.isSignedIn()) {
        window.location = action
      } else {
        UserActions.newSession()
      }
    }
  }
})

module.exports = window.CreateProductItem = CreateProductItem
