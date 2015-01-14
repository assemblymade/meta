var Bounty = require('../bounty.js.jsx')
var BountiesStore = require('../../stores/bounties_store.js')
var Nav = require('../nav.js.jsx')
var NavItem = require('../nav_item.js.jsx')
var NewsFeedItem = require('../news_feed/news_feed_item.js.jsx')
var NewsFeedItemsStore = require('../../stores/news_feed_items_store.js')
var ProductsStore = require('../../stores/products_store.js')
var ProductChip = require('../product_chip.js.jsx')
var Tile = require('../ui/tile.js.jsx')

var DashboardPage = React.createClass({
  getDefaultProps: function() {
    return  {
      activeNavItem: 'all'
    }
  },

  getInitialState: function() {
    return {
      newsFeedItems: [],
      bounties: [],
      products: []
    }
  },

  componentDidMount: function() {
    BountiesStore.addChangeListener(this.getStateFromStore)
    NewsFeedItemsStore.addChangeListener(this.getStateFromStore)
    ProductsStore.addChangeListener(this.getStateFromStore)

    this.getStateFromStore()
  },

  componentWillUnmount: function() {
    BountiesStore.removeChangeListener(this.getStateFromStore)
    NewsFeedItemsStore.removeChangeListener(this.getStateFromStore)
    ProductsStore.removeChangeListener(this.getStateFromStore)
  },

  renderNav: function() {
    var activeNavItem = this.props.activeNavItem

    return (
      <Nav>
        <NavItem label="All Products" href='/dashboard'           active={activeNavItem == 'all'} />
        <NavItem label="Following"    href='/dashboard/following' active={activeNavItem == 'following'} />
        <NavItem label="Interests"    href='/dashboard/interests' active={activeNavItem == 'interests'} />
      </Nav>
    )
  },

  renderNewsFeedItems: function() {
    var items = this.state.newsFeedItems

    if (!items.length) {
      return this.renderSuggestProducts()
    } else {
      return (
        <div>
          {items.map(function(item) {
            return (
              <div>
                <NewsFeedItem {...item} />
              </div>
            )
          })}
        </div>
      )
    }
  },

  renderSuggestProducts: function() {
    var products = this.state.products

    return (
      <div>
        <div className="text-center mt4">
          <h3 className="gray-dark">You must be new around here.</h3>
          <p className="h4 mt0 mb0 gray-dark fw-400">Follow some products that you care about.</p>
        </div>

        <div className="mt4">
          {products.map(function(product) {
            return (
              <ProductChip product={product} />
            )
          })}
        </div>
      </div>
    )
  },

  renderBounties: function() {
    var items = this.state.bounties

    if (!items.length) {
      return (
        <Tile>
          <div className="center p3">
            <p className="mt0 mb0 h5 gray-darker bold">Find a bounty to work on.</p>
            <p className="gray-dark mb0">There are plenty of products that could use your help.</p>
          </div>
          <div className="p3 center" style={{ backgroundColor: '#f9f9f9' }}>
            <a href="/discover/bounties" className="pill-button pill-button-theme-white pill-button-border pill-button-shadow bold" style={{ display: 'inline-block', lineHeight: '24px' }}>
              Find bounties
            </a>
          </div>
        </Tile>
      )
    } else {
      return (
        <div>
          {items.map(function(bounty) {
            return (
              <div className="mb2">
                <Tile>
                  <div>
                    <a className="block px3 py2 mt0 mb0 h5 fw-500 blue" href={bounty.url}>
                      {bounty.title}
                    </a>
                  </div>
                  <div className="px3 py2 border-top h6 mb0 mt0">
                    <Avatar user={bounty.locker} size={18} style={{ display: 'inline-block' }} />
                    {' '}
                    <a href={bounty.locker.url} className="bold black">
                      {bounty.locker.username}
                    </a>
                    {' '}
                    <span className="gray-dark">
                      has {moment(bounty.locked_at).add(60, 'hours').fromNow(true)} to work on this
                    </span>
                  </div>
                </Tile>
              </div>
            )
          })}
        </div>
      )
    }
  },

  render: function() {
    var nav = this.renderNav()
    var newsFeedItems = this.renderNewsFeedItems()
    var bounties = this.renderBounties()

    return (
      <div className="container clearfix mt2">
        <div className="mxn2">
          <div className="col col-2 px2">
            <div style={{ marginTop: 36 }}></div>
            {nav}
          </div>
          <div className="col col-6 px2">
            <h6 className="gray caps mt2 mb2">Activity</h6>
            {newsFeedItems}
          </div>
          <div className="col col-4 px2">
            <h6 className="gray caps mt2 mb2">Your Bounties</h6>
            {bounties}
          </div>
        </div>
      </div>
    )
  },

  getStateFromStore: function() {
    this.setState({
      bounties: BountiesStore.getBounties(),
      newsFeedItems: NewsFeedItemsStore.getNewsFeedItems(),
      products: ProductsStore.getProducts()
    })
  },
})

window.DashboardPage = module.exports = DashboardPage
