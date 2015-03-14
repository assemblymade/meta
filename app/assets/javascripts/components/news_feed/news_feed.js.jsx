'use strict';

const { List } = require('immutable');
const NewsFeedItem = require('./news_feed_item.js.jsx');
const NewsFeedItemsStore = require('../../stores/news_feed_items_store');
const NewsFeedMixin = require('../../mixins/news_feed_mixin.js.jsx');
const Spinner = require('../spinner.js.jsx');
const url = require('url');

let NewsFeed = React.createClass({
  mixins: [React.addons.PureRenderMixin, NewsFeedMixin],
  propTypes: {
    filterCounts: function(props, propName, componentName) {
      if (!props.filterCounts) {
        return new Error('Required prop `filterCounts` was not found.');
      }
    },
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
    let filter = this.state.hoverFilter;

    if (filter) {
      let count = this.countFor(filter);

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

  getInitialState: function() {
    let queryKey = url.parse(window.location.toString(), true).query || {};

    return {
      filter: (queryKey.filter || ''),
      items: NewsFeedItemsStore.getNewsFeedItems(),
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
      items: NewsFeedItemsStore.getNewsFeedItems(),
      page: NewsFeedItemsStore.getPage(),
      pages: NewsFeedItemsStore.getPages()
    });
  },

  render: function() {
    let disabled = false;

    if (this.state.disableLoadMoreButton) {
      disabled = true;
    }

    return (
      <div>
        {this.spinner()}
        {this.renderItems()}
      </div>
    )
  },

  renderEmpty: function() {
    return (
      <div className="well center">
        There hasn't been any activity yet. Why not <a href="/chat/meta">jump into chat</a> to see where you can help?
      </div>
    );
  },

  renderItems: function() {

    return (this.state.items || List()).map(function(item) {
      let target = item.target;

      // FIXME: (pletcher) We should probably cull this sort of thing on the server.
      if (!target) {
        return;
      }

      if (target.type === 'team_membership') {
        return null;
      }

      return (
        <div className="mb2" key={'news-feed-' + item.id}>
          <NewsFeedItem {...item} />
        </div>
      )
    }).toJS();
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
  }
});

function lowerCaseAndReflect(array) {
  let map = {};

  for (let i = 0, l = array.length; i < l; i++) {
    let item = array[i];

    map[item.toLowerCase()] = item;
  }

  return map;
}

module.exports = window.NewsFeed = NewsFeed;
