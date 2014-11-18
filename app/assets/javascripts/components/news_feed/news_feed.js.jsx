/** @jsx React.DOM */

(function() {
  var MasonryMixin = require('../../mixins/masonry_mixin.js');
  var NewsFeedItem = require('./news_feed_item.js.jsx');
  var Spinner = require('../spinner.js.jsx');
  var ActionTypes = require('../../constants').ActionTypes

  var NewsFeed = React.createClass({
    mixins: [MasonryMixin('masonryContainer', {transitionDuration: 0})],
    propTypes: {
      filter_counts: React.PropTypes.object.isRequired,
      url: React.PropTypes.string.isRequired
    },

    componentDidMount: function() {
      window.analytics.track(
        'news_feed_item.viewed', {
          product: (window.app.currentAnalyticsProduct())
        }
      );

      this.initializeEagerFetching();
    },

    countFor: function(filter) {
      return this.props.filter_counts[filter];
    },

    displayCount: function() {
      var filter = this.state.hoverFilter;

      if (filter) {
        var count = this.countFor(filter);

        return (
          <span className="gray-darker text-large">
            There are about
            <span className="bold">
              {' '}<span className="text-info">{count}</span> {filter}
            </span>
            {' '} bounties
          </span>
        );
      }

      return <span className="text-large">&nbsp;</span>
    },

    eagerlyFetchMoreNewsFeedItems: function(e) {
      this.setState({
        disableLoadMoreButton: true,
        page: this.state.page + 1
      }, function() {
        var url = window.location.pathname + '?page=' + this.state.page;

        if (this.state.filter) {
          url += '&filter=' + this.state.filter;
        }

        // TODO: This business should move to action creators and stores

        window.xhr.get(
          url,
          this._handleMoreNewsFeedItems
        );
      }.bind(this));
    },

    fetchMoreNewsFeedItems: _.debounce(this.eagerlyFetchMoreNewsFeedItems, 200),

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

      // if (window.app.featureEnabled('hot-updates')) {
      //   filters['Hot'] = 'hot';
      // } else {
      //   filters['Mobile'] = 'mobile';
      // }

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

    initializeEagerFetching: function() {
      this.previousDistance = 0;
      this.farthestTraveled = 0;

      var self = this;
      var body = $(document);

      if (body) {
        body.scroll(function(e) {
          var distanceFromTop = document.body.scrollTop;

          if (distanceFromTop > self.farthestTraveled &&
              distanceFromTop - self.previousDistance > 3000) {
            self.eagerlyFetchMoreNewsFeedItems();
            self.previousDistance = distanceFromTop;
            self.farthestTraveled = distanceFromTop;
          }
        });
      }
    },

    render: function() {
      var disabled = false;

      if (this.state.disableLoadMoreButton) {
        disabled = true;
      }

      return (
        <div>
          {this.filters()}
          {this.spinner()}

          <div className="container" key="news-feed-container">
            <div className="py1 text-center" key="news-feed-filter-count">
              {this.displayCount()}
            </div>
            <div className="clearfix mxn2" ref="masonryContainer" key="news-feed-items">
              {this.renderItems()}
            </div>

            <div className="mb4" key="news-feed-load-more">
              <a href="javascript:void(0);"
                    onClick={this.fetchMoreNewsFeedItems}
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
        <div className="well text-center">
          There hasn't been any activity yet. Why not <a href="/chat/meta">jump into chat</a> to see where you can help?
        </div>
      );
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
              onClick={onClick}
              onMouseOver={this.handleFilterMouseOver.bind(this, filter)}
              onMouseOut={this.handleFilterMouseOut.bind(this, filter)}>
            {label}
          </a>
        </li>
      );
    },

    renderItems: function() {
      return _.map(this.state.items, function(item) {
        return (
          <div className="sm-col sm-col-6 p2" key={item.id}>
            <NewsFeedItem {...item} />
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
        return console.log(err);
      }

      var items;
      try {
        items = JSON.parse(results);
      } catch (e) {
        return console.log(e);
      }

      this.setState({
        items: items
      });
    },

    _handleMoreNewsFeedItems: function(err, results) {
      if (err) {
        return console.log(err);
      }

      var newItems;
      try {
        newItems = JSON.parse(results);
      } catch (e) {
        return console.log(e);
      }

      // TODO: this should happen in an action creator
      Dispatcher.handleServerAction({
        type: ActionTypes.NEWS_FEED_RECEIVE_RAW_ITEMS,
        items: newItems
      })

      this.setState(React.addons.update(
        this.state, {
          items: { $push: newItems },
          loading: { $set: false }
        }
      ));
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

  if (typeof module !== 'undefined') {
    module.exports = NewsFeed;
  }

  window.NewsFeed = NewsFeed;
})();
