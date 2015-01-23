var AppIcon = require('../app_icon.js.jsx')
var BountyCard = require('../bounty_card.js.jsx')
var BountiesStore = require('../../stores/bounties_store.js')
var Nav = require('../nav.js.jsx')
var NavItem = require('../nav_item.js.jsx')
var NewsFeedItem = require('../news_feed/news_feed_item.js.jsx')
var NewsFeedItemsStore = require('../../stores/news_feed_items_store.js')
var NewsFeedItemsActionCreators = require('../../actions/news_feed_items_action_creators.js')
var ProductsStore = require('../../stores/products_store.js')
var UserBountiesStore = require('../../stores/user_bounties_store.js')
var UserStore = require('../../stores/user_store.js')
var Spinner = require('../spinner.js.jsx')
var Tile = require('../ui/tile.js.jsx')

var DashboardPage = React.createClass({
  getDefaultProps: function() {
    return  {
      filter: 'interests',
      initialShowAll: false,
      initialInterests: [],
      marks: {}
    }
  },

  getInitialState: function() {
    return {
      newsFeedItems: [],
      lockedBounties: [],
      reviewingBounties: [],
      followedProducts: [],
      interests: this.props.initialInterests,
      loading: false,
      showAll: this.props.initialShowAll,
      selected: [],
      currentUser: UserStore.getUser()
    }
  },

  componentDidMount: function() {
    NewsFeedItemsStore.addChangeListener(this.getStateFromStore)
    ProductsStore.addChangeListener(this.getStateFromStore)
    UserBountiesStore.addChangeListener(this.getStateFromStore)

    window.addEventListener('scroll', this.onScroll)

    this.getStateFromStore()
  },

  componentWillUnmount: function() {
    NewsFeedItemsStore.removeChangeListener(this.getStateFromStore)
    ProductsStore.removeChangeListener(this.getStateFromStore)
    UserBountiesStore.removeChangeListener(this.getStateFromStore)

    window.removeEventListener('scroll', this.onScroll)
  },

  onScroll: function() {
    var atBottom = $(window).scrollTop() + $(window).height() > $(document).height() - 200

    if (atBottom) {
      NewsFeedItemsActionCreators.requestNextPage(this.params())
    }
  },

  renderProduct: function() {
    var filter = this.props.filter

    var product = _.find(this.state.followedProducts, function(product) {
      return product.slug == filter
    })

    if (product && !_.contains(['all', 'interests', 'following'], filter)) {
      return (
        <div className="mb3" style={{ marginTop: 42 }}>
          <Tile>
            <a href={product.url}>
              <div className="p3">
                <div className="clearfix">
                  <div className="left mr2">
                    <AppIcon app={product} size={36} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="h2 mt0 mb0 black bold">{product.name}</div>
                  </div>
                </div>
              </div>
            </a>

            <div className="border-bottom mt0 mb0"></div>
            <div className="stat-group p3 mb0">
              <div className="stat">
                <a className="block" href={product.wips_url}>
                  <div className="h4 mt0 mb0">{product.wips_count}</div>
                  <div className="gray-2">Bounties</div>
                </a>
              </div>
              <div className="stat">
                <a className="block" href={product.people_url}>
                  <div className="h4 mt0 mb0">{product.partners_count}</div>
                  <div className="gray-2">Contributors</div>
                </a>
              </div>
            </div>
          </Tile>
        </div>
      )
    }
  },

  renderNav: function() {
    var filter = this.props.filter
    var showAll = this.state.showAll
    var followedProducts = showAll ? this.state.followedProducts : this.state.followedProducts.slice(0, 5)
    var followingNavItem = null
    var divider = null
    var showAllLink = null

    if (followedProducts.length) {
      followingNavItem = <NavItem label="What you follow" href='/dashboard/following' active={filter == 'following'} />
      divider = <NavItem divider={true} />
    }

    if (this.state.followedProducts.length > 5 && !showAll) {
      var click = function(event) {
        event.stopPropagation()
        event.preventDefault()

        this.setState({ showAll: true })
      }.bind(this)

      showAllLink = <NavItem label="Show all" onClick={click} small={true} />
    }

    return (
      <Nav>
        <NavItem label="Everything"      href='/dashboard/all'           active={filter == 'all'} />
        <NavItem label="Your interests"  href='/dashboard/interests' active={filter == 'interests'} />
        {followingNavItem}

        {divider}

        {followedProducts.map(function(product) {
          return <NavItem label={product.name} href={'/dashboard/' + product.slug } active={filter == product.slug} small={true} />
        })}

        {showAllLink}
      </Nav>
    )
  },

  renderSpinner: function() {
    if(this.state.loading) {
      return <Spinner />
    }
  },

  renderMarks: function(section) {
    var marks = this.props.marks[section]

    return (
      <div >
        <h6 className="gray-3 caps mt2 mb2">{section}</h6>
        {marks.map(function(mark) {
          return this.renderMark(mark)
        }.bind(this))}
      </div>
    )
  },

  renderMark: function(mark) {
    var selected = this.state.selected
    var index = selected.indexOf(mark)
    var isSelected = index >= 0

    var click = function(event) {
      event.stopPropagation()
      event.preventDefault()

      if (isSelected) {
        selected.splice(index, 1)
      } else {
        selected.push(mark)
      }

      this.setState({
        selected: selected
      })
    }.bind(this)

    var classes = ['mark']

    if (isSelected) {
      classes = classes.concat(['mark-is-selected'])
    }

    return (
      <a href="#" onClick={click} className={classes.join(' ')}>
        {mark}
      </a>
    )
  },

  renderProgress: function() {
    var progress = (this.state.selected.length / 3) * 360;

    return (
      <span className="mr2 pie-container">
        <div className={progress > 180 ? 'pie big' : 'pie'} data-start="0" data-value={progress}></div>
        <div className={progress < 180 ? 'pie big' : 'pie'} data-start={progress} data-value={360 - progress}></div>
      </span>
    )
  },

  renderSubmit: function() {
    var selected = this.state.selected
    var classes = ['pill-button', 'pill-button-theme-white', 'pill-button-border', 'pill-button-shadow', 'bold']
    var selectionsNeeded = 3 - selected.length
    var progress = null
    var text = null
    var padding = null
    var click = function() {}

    if (selectionsNeeded <= 0) {
      text = 'Yay! Take a look at your suggestions'

      click = function(event) {
        event.stopPropagation()
        event.preventDefault()

        $.ajax({
          url: '/user',
          method: 'PUT',
          dataType: 'json',
          data: {
            user: {
              mark_names: this.state.selected
            }
          },
          success: function() {
            window.location = '/dashboard/interests'
          }
        })
      }.bind(this)
    } else {
      classes = classes.concat(['gray', 'hover-gray'])

      switch(selectionsNeeded) {
        case 1:
          topics = '1 more topic'
          break
        case 2:
          topics = '2 more topics'
          break
        case 3:
          topics = '3 topics'
          break
      }

      text = 'Pick at least ' + topics

      var progress = (
        <div style={{ marginTop: 1, marginLeft: 3 }}>
          {this.renderProgress()}
        </div>
      )

      var padding = 46
    }

    return (
      <a onClick={click} className={classes.join(' ')} style={{ display: 'inline-block', lineHeight: '26px', paddingLeft: padding }}>
        {progress}
        {text}
      </a>
    )
  },

  renderNewsFeedItems: function() {
    var items = this.state.newsFeedItems
    var spinner = this.renderSpinner()
    var filter = this.props.filter
    var interests = this.state.interests
    var user = this.state.currentUser

    if (filter == 'interests' && !interests.length) {
      return (
        <div>
          <Tile>
            <div className="px4 py3 text-center">
              <h1 className="mt0 mb0">Hey there @{user.username}!</h1>
              <p className="gray-1">Looks like you're new around here.</p>
              <p className="gray-2"><strong>Tell us what you're into below</strong> and we show you where to get started. </p>
            </div>

            <div className="px3 py2 border-top" style={{ backgroundColor: '#f9f9f9' }}>
              {this.renderMarks('Growth')}
            </div>

            <div className="px3 py2 border-top" style={{ backgroundColor: '#f9f9f9' }}>
              {this.renderMarks('Design')}
            </div>

            <div className="px3 py2 border-top" style={{ backgroundColor: '#f9f9f9' }}>
              {this.renderMarks('Development')}
            </div>
          </Tile>

          <Tile>
            <div className="px3 py3 border-top text-center">
              {this.renderSubmit()}
            </div>
          </Tile>
        </div>
      )
    }

    return (
      <div>
        {items.map(function(item) {
          return (
            <div className="mb2">
              <NewsFeedItem {...item} />
            </div>
          )
        })}
        {spinner}
      </div>
    )
  },

  renderBounties: function() {
    if (!this.state.lockedBounties.length && !this.state.reviewingBounties.length) {
      return (
        <div style={{ marginTop: 42 }}>
          <Tile>
            <div className="center p3">
              <p className="mt0 mb2 h5 gray-1 bold">Find & help interesting products</p>
              <p className="gray-2 mb0">Products here are built and owned by the community. When you contribute to a product the community rewards you with an ownership stake in its success.</p>
            </div>
            <div className="p3 center" style={{ backgroundColor: '#f9f9f9' }}>
              <a href="/discover/products" className="pill-button pill-button-theme-white pill-button-border pill-button-shadow bold" style={{ display: 'inline-block', lineHeight: '24px' }}>
                Explore products
              </a>

              <div className="mt2 center">
                or <a href="/start" className="mt3 center">start your own</a>
              </div>
            </div>
          </Tile>
        </div>
      )
    }

    if (this.state.lockedBounties.length) {
      var lockedBounties = (
        <div className="mb3">
          <h6 className="gray-3 caps mt2 mb2">Bounties you&#8217;re working on</h6>
          {this.state.lockedBounties.map(function(bounty) {
            return (
              <div className="mt2">
                <BountyCard bounty={bounty} showLocker={true} />
              </div>
            )
          })}
        </div>
      )
    }

    if (this.state.reviewingBounties.length) {
      var reviewingBounties = (
        <div className="mb3">
          <h6 className="gray-3 caps mt2 mb2">Bounties to review</h6>
          {this.state.reviewingBounties.map(function(bounty) {
            return (
              <div className="mt2">
                <BountyCard bounty={bounty} />
              </div>
            )
          })}
        </div>
      )
    }

    var bounties = (
      <div>
        {lockedBounties}
        {reviewingBounties}
      </div>
    )

    return bounties
  },

  render: function() {
    var nav = this.renderNav()
    var newsFeedItems = this.renderNewsFeedItems()
    var product = this.renderProduct()
    var bounties = this.renderBounties()

    return (
      <div className="container clearfix mt1">
        <div className="mxn2">
          <div className="col col-2 px2">
            <div style={{ marginTop: 42 }}></div>
            {nav}
          </div>
          <div className="col col-6 px2 mb4">
            <h6 className="gray-3 caps mt2 mb2">What&#8217;s Happening</h6>
            {newsFeedItems}
          </div>
          <div className="col col-4 px2">
            {product}
            {bounties}
          </div>
        </div>
      </div>
    )
  },

  getStateFromStore: function() {
    this.setState({
      lockedBounties: UserBountiesStore.getLockedBounties(),
      reviewingBounties: UserBountiesStore.getReviewingBounties(),
      newsFeedItems: NewsFeedItemsStore.getNewsFeedItems(),
      loading: NewsFeedItemsStore.getLoading(),
      followedProducts: ProductsStore.getProducts()
    })
  },

  params: function() {
    return {
      filter: this.props.filter
    }
  }
})

window.DashboardPage = module.exports = DashboardPage
