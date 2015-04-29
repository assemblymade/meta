'use strict';

const App = require('../app.js.jsx')
const AppIcon = require('../app_icon.js.jsx')
const BountyCard = require('../bounty_card.js.jsx')
const BountiesStore = require('../../stores/bounties_store.js')
const Button = require('../ui/button.js.jsx')
const DashboardStore = require('../../stores/dashboard_store.js')
const Heart = require('../heart.js.jsx')
const { List } = require('immutable');
const Nav = require('../ui/nav.js.jsx')
const NewsFeedItemsStore = require('../../stores/news_feed_items_store.js')
const NewsFeedItemsActionCreators = require('../../actions/news_feed_items_action_creators.js')
const page = require('page')
const ProductsStore = require('../../stores/products_store.js')
const UserBountiesStore = require('../../stores/user_bounties_store.js')
const UserStore = require('../../stores/user_store.js')
const Spinner = require('../spinner.js.jsx')
const SvgIcon = require('../ui/svg_icon.js.jsx')
const Tile = require('../ui/tile.js.jsx')
const UserStoryTimeline = require('../stories/user_story_timeline.js.jsx')

let DashboardIndex = React.createClass({
  propTypes: {
    navigate: React.PropTypes.func,
  },

  getInitialState: function() {
    return {
      currentUser: UserStore.getUser(),
      filter: null,
      followedProducts: [],
      interests: [],
      loading: false,
      lockedBounties: [],
      marks: [],
      newsFeedItems: List(),
      reviewingBounties: [],
      selected: [],
      showAll: false,
      currentProduct: null,
      recentProducts: []
    }
  },

  componentDidMount: function() {
    DashboardStore.addChangeListener(this.getStateFromStore)
    NewsFeedItemsStore.addChangeListener(this.getStateFromStore)
    ProductsStore.addChangeListener(this.getStateFromStore)
    UserBountiesStore.addChangeListener(this.getStateFromStore)
    UserStore.addChangeListener(this.getStateFromStore)

    window.addEventListener('scroll', this.onScroll)

    this.getStateFromStore()
  },

  componentWillUnmount: function() {
    DashboardStore.addChangeListener(this.getStateFromStore)
    NewsFeedItemsStore.removeChangeListener(this.getStateFromStore)
    ProductsStore.removeChangeListener(this.getStateFromStore)
    UserBountiesStore.removeChangeListener(this.getStateFromStore)
    UserStore.removeChangeListener(this.getStateFromStore)

    window.removeEventListener('scroll', this.onScroll)
  },

  onScroll: function() {
    let atBottom = $(window).scrollTop() + $(window).height() > $(document).height() - 200

    if (atBottom) {
      NewsFeedItemsActionCreators.requestNextPage(this.params())
    }
  },

  renderProduct: function() {
    let filter = this.state.filter

    let product = _.find(this.state.followedProducts, function(product) {
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
            <div className="center flex flex-around p3 mb0">
              <div className="inline-block">
                <a className="block" href={product.wips_url}>
                  <div className="h4 mt0 mb0">{product.wips_count}</div>
                  <div className="gray-2">Bounties</div>
                </a>
              </div>
              <div className="inline-block">
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
    let filter = this.state.filter
    let showAll = this.state.showAll
    let followedProducts = showAll ? this.state.followedProducts : this.state.followedProducts.slice(0, 8)
    let divider = null
    divider = <Nav.Divider />

    if (this.state.followedProducts.length > 8 && !showAll) {
      let click = function(event) {
        event.stopPropagation()
        event.preventDefault()

        this.setState({ showAll: true })
      }.bind(this)

    }

    return (
      <div>
        <Nav orientation="stacked">
          <Nav.Item label="Everything"      href='/dashboard/all'       active={filter == 'all'} />
        </Nav>

        <div className="md-show">
          <Nav orientation="stacked">
            {divider}

            {followedProducts.map(function(product) {
              return <Nav.Item label={product.name} href={'/dashboard/' + product.slug } active={filter == product.slug} key={product.slug} small={true} />
            })}

          </Nav>
        </div>
      </div>
    )
  },

  renderSpinner: function() {
    if(this.state.loading) {
      return <Spinner />
    }
  },

  renderMarks: function(section) {
    let marks = this.state.marks[section]

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
    let selected = this.state.selected
    let index = selected.indexOf(mark)
    let isSelected = index >= 0

    let click = function(event) {
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

    let classes = ['mark']

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
    let progress = (this.state.selected.length / 3) * 360;

    return (
      <span className="mr2 pie-container">
        <div className={progress > 180 ? 'pie big' : 'pie'} data-start="0" data-value={progress}></div>
        <div className={progress < 180 ? 'pie big' : 'pie'} data-start={progress} data-value={360 - progress}></div>
      </span>
    )
  },

  renderSubmit: function() {
    let selected = this.state.selected
    let classes = ['pill-button', 'pill-button-theme-white', 'pill-button-border', 'pill-button-shadow', 'bold']
    let selectionsNeeded = 3 - selected.length
    let progress = null
    let text = null
    let topics = null
    let padding = null
    let click = function() {}

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
            page('/dashboard/interests')
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

      let progress = (
        <div style={{ marginTop: 1, marginLeft: 3 }}>
          {this.renderProgress()}
        </div>
      )

      let padding = 46
    }

    return (
      <a onClick={click} className={classes.join(' ')} style={{ display: 'inline-block', lineHeight: '26px', paddingLeft: padding }}>
        {progress}
        {text}
      </a>
    )
  },

  renderStoryGroups: function() {
    let items = this.state.newsFeedItems.toJS()
    let spinner = this.renderSpinner()
    var filter = this.state.filter
    let interests = this.state.interests
    let user = this.state.currentUser

    if (filter != null) {
      return (
        <div>
          <UserStoryTimeline user={user} filter={filter} />
        </div>
      )
    }
  },

  renderNewsFeedItems: function() {
   let items = this.state.newsFeedItems.toJS()
   let spinner = this.renderSpinner()
   let filter = this.state.filter
   let interests = this.state.interests
   let user = this.state.currentUser

   if (filter == 'interests' && !interests.length) {
     return (
       <div>
         <Tile>
           <div className="px4 py3 center">
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
           <div className="px3 py3 border-top center">
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
              <Button action="/discover">Explore products</Button>

              <div className="mt2 center">
                or <a href="/start" className="mt3 center">start your own</a>
              </div>
            </div>
          </Tile>
        </div>
      )
    }

    let lockedBounties;
    if (this.state.lockedBounties.length) {
      lockedBounties = (
        <div className="mb3">
          <h6 className="gray-3 caps mt2 mb2">Bounties you&#8217;re working on</h6>
          {this.state.lockedBounties.map(function(bounty) {
            return (
              <a className="block mb2" href={bounty.url}>
                <Tile>
                  <div className="px3 py2">
                    <BountyCard bounty={bounty} showProduct={true} />
                  </div>
                </Tile>
              </a>
            )
          })}
        </div>
      )
    }

    let reviewingBounties;
    if (this.state.reviewingBounties.length) {
      reviewingBounties = (
        <div className="mb3">
          <h6 className="gray-3 caps mt2 mb2">Bounties to review</h6>
          {this.state.reviewingBounties.map(function(bounty) {
            return (
              <a className="block mb2" href={bounty.url}>
                <Tile>
                  <div className="px3 py2">
                    <BountyCard bounty={bounty} showProduct={true} />
                  </div>
                </Tile>
              </a>
            )
          })}
        </div>
      )
    }

    let bounties = (
      <div>
        {lockedBounties}
        {reviewingBounties}
      </div>
    )

    return bounties
  },

  renderBanner: function() {
    if (this.state.user) {
      return <ShowcaseBanner
        current={this.state.currentProduct}
        recent={this.state.recentProducts}
        user={this.state.user} />
    }
  },

  render: function() {
    let nav = this.renderNav()
    let storyGroups = this.renderStoryGroups()
    let currentUser = window.app.currentUser();
    let isStaff = currentUser && currentUser.get('staff');

    let newsFeedItems = this.renderNewsFeedItems()
    let product = this.renderProduct()
    let bounties = this.renderBounties()

    if (isStaff) {
        var activityFeed = storyGroups;
    }
    else
    {
        var activityFeed = newsFeedItems;
    }

    return (
      <div>
        <div className="container clearfix mt1">
          <div className="mxn2">
            <div className="md-col md-col-2 px2">
              <div style={{ marginTop: 42 }}></div>
              {nav}
            </div>
            <div className="md-col md-col-right md-col-4 px2">
              {product}
              {bounties}
            </div>
            <div className="md-col md-col-6 px2 mb4">
              <h6 className="gray-3 caps mt2 mb2">What&#8217;s Happening</h6>

              {activityFeed}
            </div>
          </div>
        </div>
      </div>
    )
  },

  getStateFromStore: function() {
    if (!this.isMounted()) {
      return
    }
    let dashboard = DashboardStore.getDashboard()

    this.setState({
      filter: dashboard.filter,
      interests: dashboard.initial_interests,
      marks: dashboard.marks,
      followedProducts: ProductsStore.getProducts(),
      loading: NewsFeedItemsStore.getLoading(),
      lockedBounties: UserBountiesStore.getLockedBounties(),
      newsFeedItems: NewsFeedItemsStore.getNewsFeedItems(),
      reviewingBounties: UserBountiesStore.getReviewingBounties(),
      currentProduct: dashboard.current_product,
      recentProducts: dashboard.recent_products,
      user: UserStore.getUser()
    })
  },

  params: function() {
    return {
      filter: this.state.filter
    }
  }
})

module.exports = window.DashboardIndex = DashboardIndex
