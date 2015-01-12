var Bounty = require('../bounty.js.jsx')
var BountiesStore = require('../../stores/bounties_store.js')
var Nav = require('../nav.js.jsx')
var NavItem = require('../nav_item.js.jsx')
var NewsFeedItem = require('../news_feed/news_feed_item.js.jsx')
var NewsFeedItemsStore = require('../../stores/news_feed_items_store.js')
var Tile = require('../ui/tile.js.jsx')

var DashboardPage = React.createClass({
  getInitialState: function() {
    return {
      newsFeedItems: [],
      bounties: []
    }
  },

  componentDidMount: function() {
    NewsFeedItemsStore.addChangeListener(this.getStateFromStore)
    BountiesStore.addChangeListener(this.getStateFromStore)

    this.getStateFromStore()
  },

  componentWillUnmount: function() {
    NewsFeedItemsStore.removeChangeListener(this.getStateFromStore)
    BountiesStore.removeChangeListener(this.getStateFromStore)
  },

  renderNav: function() {
    return (
      <Nav>
        <NavItem label="All Products" />
        <NavItem label="Following" active={true} />
        <NavItem label="Interests" />
      </Nav>
    )
  },

  renderNewsFeedItems: function() {
    var items = this.state.newsFeedItems

    if (items) {
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

  renderBounties: function() {
    var items = this.state.bounties

    if (items) {
      return (
        <div>
          {items.map(function(bounty) {
            return (
              <Tile>
                <a className="block px3 py2" href={bounty.url}>
                  {bounty.title}
                </a>
              </Tile>
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
            <div className="mt4"></div>
            {nav}
          </div>
          <div className="col col-6 px2">
            <h6 className="gray caps mt2 mb1">Activity</h6>
            {newsFeedItems}
          </div>
          <div className="col col-4 px2">
            <h6 className="gray caps mt2 mb1">Your Bounties</h6>
            {bounties}
          </div>
        </div>
      </div>
    )
  },

  getStateFromStore: function() {
    this.setState({
      newsFeedItems: NewsFeedItemsStore.getNewsFeedItems(),
      bounties: BountiesStore.getBounties()
    })
  },
})

window.DashboardPage = module.exports = DashboardPage
