'use strict'

const Accordion = require('./ui/accordion.js.jsx')
const BountiesStore = require('../stores/bounties_store.js')
const Bounty = require('./bounty.js.jsx');
const BountyActionCreators = require('../actions/bounty_action_creators.js')
const BountyFilter = require('./bounty_filter.js.jsx')
const BountyList = require('./bounty_list.js.jsx')
const Button = require('./ui/button.js.jsx')
const Callout = require('./callout.js.jsx')
const Label = require('./ui/label.js.jsx')
const PaginationLinks = require('./pagination_links.js.jsx')
const Spinner = require('./spinner.js.jsx')
const Tile = require('./ui/tile.js.jsx')
const UserStore = require('../stores/user_store.js')
const StoryTimeline = require('./story_timeline.js.jsx');

const BountyIndex = React.createClass({
  propTypes: {
    tags: React.PropTypes.array,
    assets: React.PropTypes.array,
    pages: React.PropTypes.number,
    product: React.PropTypes.object,
    valuation: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      value: 'is:open ',
      sort: 'priority',
      user: null
    }
  },

  componentDidMount: function() {
    UserStore.addChangeListener(this.getStateFromStore)

    this.getStateFromStore();

    window.addEventListener('scroll', this.onScroll);
    window.TrackEngagement.track('bounties')
  },

  componentWillUnmount: function() {
    window.removeEventListener('scroll', this.onScroll);
    UserStore.removeChangeListener(this.getStateFromStore)
  },

  onScroll: function() {
    var atBottom = $(window).scrollTop() + $(window).height() > $(document).height() - 200

    if (atBottom) {
      BountyActionCreators.requestNextPage(
        this.props.product.slug,
        this.params(this.state.value, this.state.sort)
      )
    }
  },

  getBounties: function(value, sort, page) {
    BountyActionCreators.requestBountiesDebounced(
      this.props.product.slug,
      this.params(value, sort, page)
    )
  },

  handleValueChange: function(event) {
    var value = event.target.value

    this.setState({ value: value })

    this.getBounties(value, this.state.sort, 1)
  },

  handleSortChange: function(event) {
    var sort = event.target.value

    this.setState({ sort: sort })

    this.getBounties(this.state.value, sort, 1)
  },

  handlePageChange: function(page) {
    this.getBounties(this.state.value, this.state.sort, page)
  },

  addTag: function(tag) {
    return function(event) {
      event.preventDefault()

      var value = this.state.value + ' ' + 'tag:' + tag
      this.setState({ value: value })

      this.getBounties(value, this.state.sort, 1)
    }.bind(this)
  },

  renderTags: function() {
    let tags = this.props.tags.map(function(tag, i) {
      return (
        <li key={tag + '-' + i}>
          <a href="#" onClick={this.addTag(tag)}>
            <Label name={tag} />
          </a>
        </li>
      )
    }.bind(this)).toJS();

    return <Accordion title="Tags">
      <ul className="list-reset">
        {tags}
      </ul>
    </Accordion>
  },

  renderAssets: function() {
    var assets = this.props.assets
    var product = this.props.product
    var assets_url = product.url+'/assets'

    return (
      <div className="clearfix mxn1">
        {assets.map(function(asset, i) {
          if (['jpg', 'png', 'gif'].indexOf(asset.attachment.extension) < 0) {
            return null
          }

          return (
            <div className="sm-col sm-col-6 px1 mb1" key={asset.name + '-' + i}>
              <a href={assets_url} title={asset.name} className="block bg-gray-4 bg-size-cover bg-repeat-none bg-position-center" style={{backgroundImage: 'url('+asset.thumbnail_url+')', height: '80px'}}></a>
            </div>
          )
        })}
      </div>
    )
  },

  render: function() {
    var bountyFilterProps = _.pick(this.props, 'tags', 'creators', 'workers')

    var product = this.props.product

    if (typeof product === "undefined" || product === null) {
      return null;
    }

    var callout = null

    if (this.state.user && !this.state.user.coin_callout_viewed_at) {
      callout = (
        <Callout>
          <div className="sm-show">
            <div style={{ padding: '1.5rem 2rem' }}>
              <strong>Coins determine your ownership of a product.</strong>
              {' '}
              <span>
                You'll notice each bounty below is assigned a coin value.
                Complete the bounty and you'll be awarded those coins which
                represent your ownership.
              </span>
              {' '}
              <a href="/guides/platform#earning-coins">Learn more</a>
            </div>
          </div>
          <div className="sm-hide">
            <div style={{ padding: '1.5rem 2rem' }}>
              <strong>Coins determine your ownership.</strong>
              {' '}
              <a href="/guides/platform#earning-coins">Learn more</a>
            </div>
          </div>
        </Callout>
      )
    }

    return (
      <div>
        {callout}
        <div className="clearfix mxn3">

          <div className="sm-col-right sm-col-4 px3">
            <div className="mb3">
              <Button action={Bounty.showCreateBounty.bind(null, product)} block={true}>Create a new bounty</Button>
            </div>

            <div className="mb3">
              <Tile>
                <StoryTimeline product={product} />
              </Tile>
            </div>

            <div className="mb3">
              {this.renderTags()}
            </div>

            <div className="mb3">
              <Accordion title="Assets" >
                {this.renderAssets()}
              </Accordion>
            </div>
          </div>

          <div className="sm-col sm-col-8 px3">
            <BountyFilter {...bountyFilterProps}
                value={this.state.value}
                onValueChange={this.handleValueChange}
                sort={this.state.sort}
                onSortChange={this.handleSortChange} />
            <BountyList product={this.props.product}
                valuation={this.props.valuation}
                onPageChange={this.handlePageChange}
                draggable={this.draggable()} />
          </div>
        </div>
      </div>
    );
  },

  params: function(value, sort, page) {
    var terms = value.split(' ')

    var params = _.reduce(terms, function(memo, value) {
      var filter = value.split(':')

      if (filter.length == 2) {
        memo[filter[0]] = _.compact(_.flatten([memo[filter[0]], filter[1]]))
      } else {
        memo.query = _.compact([memo.query, value]).join(' ')
      }

      return memo
    }, {})

    var renames = { is: 'state', by: 'created' }

    params = _.reduce(params, function(result, value, key) {
      key = renames[key] || key
      result[key] = value
      return result
    }, {});

    params.sort = sort
    params.page = page

    return params
  },

  draggable: function() {
    if (!this.props.product.can_update) {
      return false
    }

    var params = this.params(this.state.value, this.state.sort)
    return params.sort == 'priority' && params.state == 'open'
  },

  getStateFromStore: function() {
    this.setState({
      user: UserStore.getUser()
    });
  }
});

module.exports = window.BountyIndex = BountyIndex;
