var MasonryMixin = require('../../mixins/masonry_mixin.js');
var NewsFeedItem = require('./news_feed_item.js.jsx');
var NewsFeedItemsStore = require('../../stores/news_feed_items_store');
var NewsFeedMixin = require('../../mixins/news_feed_mixin.js.jsx');
var Spinner = require('../spinner.js.jsx');

var NewsFeed = React.createClass({
  mixins: [MasonryMixin('masonryContainer', {transitionDuration: 0}), NewsFeedMixin],
  propTypes: {
    filterCounts: function(props, propName, componentName) {
      if (!props.productPage && !props.filterCounts) {
        return new Error('Required prop `filterCounts` was not found.');
      }
    },

    productPage: React.PropTypes.bool,
    url: React.PropTypes.string.isRequired
  },

  componentDidMount: function() {
    this.initializeEagerFetching();

    NewsFeedItemsStore.addChangeListener(this.onNewsFeedItemsChange);
  },

  componentWillUnmount: function() {
    NewsFeedItemsStore.removeChangeListener(this.onNewsFeedItemsChange);
  },

  countFor: function(filter) {
    return this.props.filterCounts[filter];
  },

  displayCount: function() {
    var filter = this.state.hoverFilter;

    if (filter) {
      var count = this.countFor(filter);

      return (
        <span className="gray-1 text-large">
          There are about
          <span className="bold">
            {' '}<span className="green">{count}</span> {filter}
          </span>
          {' '} bounties
        </span>
      );
    }

    return <span className="text-large">&nbsp;</span>
  },

  fetchMoreNewsFeedItems: function() {
    return _.debounce(this.eagerlyFetchMoreNewsFeedItems, 200);
  },

  filterBy: function(filter, e) {
    this.setState({
      filter: filter
    }, function() {
      var url = window.location.pathname + '?page=' + this.state.page +
        '&filter=' + filter;

      window.xhr.get(url, this._handleFilteredNewsFeedItems);
    }.bind(this));
  },

  filters: function() {
    return (
      <ul className="nav nav-skills bg-white mb2" key="news-feed-filter-list">
        {_.map(_.keys(this.props.filters), this.renderFilterListItem)}
      </ul>
    );
  },

  getDefaultProps: function() {
    var filters = lowerCaseAndReflect([
      'Frontend',
      'Backend',
      'Design',
      'Marketing',
      'Writing',
      'Mobile'
    ]);

    return {
      filters: filters
    };
  },

  getInitialState: function() {
    var queryKey = window.parseUri(window.location).queryKey || {};

    return {
      filter: (queryKey.filter || ''),
      items: this.props.items,
      loading: false,
      page: (queryKey.page || 1)
    };
  },

  handleFilterMouseOver: function(filter, e) {
    this.setState({
      hoverFilter: filter,
    });
  },

  handleFilterMouseOut: function(filter, e) {
    this.setState({
      hoverFilter: null,
    });
  },

  onNewsFeedItemsChange: function() {
    this.setState({
      items: NewsFeedItemsStore.getNewsFeedItems()
    });
  },

  render: function() {
    var disabled = false;

    if (this.state.disableLoadMoreButton) {
      disabled = true;
    }

    if (this.props.productPage) {
      var style = null

      if (this.props.items.length) {
        style = { marginTop: '-1rem' }
      }

      return <div>{this.renderItems()}</div>
    }

    return (
      <div>
        {this.filters()}
        {this.spinner()}

        <div className="container" key="news-feed-container">
          <div className="py1 center" key="news-feed-filter-count">
            {this.displayCount()}
          </div>
          <div className="clearfix mxn2" ref="masonryContainer" key="news-feed-items">
            {this.renderItems()}
          </div>

          <div className="mb4" key="news-feed-load-more">
            <a href="javascript:void(0);"
                  onClick={this.fetchMoreNewsFeedItems()}
                  className="btn btn-default btn-block" disabled={disabled}>
              {this.state.disabled ? <Spinner /> : 'Load more'}
            </a>
          </div>
        </div>
      </div>
    )
  },

  renderEmpty: function() {
    return (
      <div className="well center">
        There hasn't been any activity yet. Why not <a href="/chat/meta">jump into chat</a> to see where you can help?
      </div>
    ); // '
  },

  renderFilterListItem: function(filter) {
    var label = this.props.filters[filter];
    var buttonClass = filter === this.state.filter ?
      'active' :
      '';

    // var onClick = this.filterBy.bind(this, filter);
    var onClick = function() {
      window.analytics.track('news_feed_item.filter.clicked', { filter: filter });
    };

    return (
      <li className={buttonClass} key={filter}>
        <a href={"?filter=" + filter}
            onMouseOver={this.handleFilterMouseOver.bind(this, filter)}
            onMouseOut={this.handleFilterMouseOut.bind(this, filter)}>
          {label}
        </a>
      </li>
    );
  },

  renderItems: function() {
    var productPage = this.props.productPage;

    return _.map(this.state.items, function(item) {
      var target = item.target;

      if (target.type === 'team_membership' && !productPage) {
        return null;
      }

      var classes = React.addons.classSet({
        'sm-col': !productPage,
        'sm-col-6': !productPage,
        'px1': !productPage
      });

      return (
        <div className={classes} key={item.id}>
          <NewsFeedItem {...item} productPage={productPage} />
        </div>
      )
    });
  },

  spinner: function() {
    if (this.state.loading) {
      return (
        <div className="fixed top-0 left-0 z4 full-width" style={{ height: '100%' }}>
          <div className="absolute bg-darken-4 full-width" style={{ opacity: '0.4', height: '100%' }} />
          <div className="relative" style={{ top: '40%' }}>
            <Spinner />
          </div>
        </div>
      );
    }
  },

  _handleFilteredNewsFeedItems: function(err, results) {
    if (err) {
      return console.error(err);
    }

    var items;
    try {
      items = JSON.parse(results);
    } catch (e) {
      return console.error(e);
    }

    this.setState({
      items: items
    });
  }
});

function lowerCaseAndReflect(array) {
  var map = {};

  for (var i = 0, l = array.length; i < l; i++) {
    var item = array[i];

    map[item.toLowerCase()] = item;
  }

  return map;
}

module.exports = window.NewsFeed = NewsFeed;
