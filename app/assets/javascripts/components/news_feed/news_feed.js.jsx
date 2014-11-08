/** @jsx React.DOM */

(function() {
  var NewsFeedItem = require('./news_feed_item.js.jsx');
  var MasonryMixin = require('../../mixins/masonry_mixin.js')

  var NewsFeed = React.createClass({

    mixins: [MasonryMixin('masonryContainer', {transitionDuration: 0})],

    count: function(count) {
      if (count) {
        return <div className="gray">About {count} bounties</div>;
      }
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

    fetchMoreNewsFeedItems: function(e) {
      this.setState({
        page: this.state.page + 1
      }, function() {
        var url = window.location.pathname + '?page=' + this.state.page +
          '&filter=' + this.state.filter;

        window.xhr.get(
          url,
          this._handleMoreNewsFeedItems
        );
      }.bind(this));
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
        <ul className="nav nav-skills bg-white mb2">
          {_.map(_.keys(this.props.filters), this.renderFilterListItem)}
        </ul>
      );
    },

    getInitialState: function() {
      return {
        filter: (window.parseUri(window.location).queryKey.filter || ''),
        news_feed_items: this.props.news_feed_items,
        page: (window.parseUri(window.location).queryKey.page || 1)
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

    render: function() {
      window.analytics.track(
        'news_feed_item.viewed', {
          product: (window.app.currentAnalyticsProduct())
        }
      );

      return (
        <div>

          {this.filters()}

          <div className="container py2">
            <div className="py1 text-center">
              {this.displayCount()}
            </div>
            <div className="clearfix mxn2" ref="masonryContainer">
              {this.renderItems()}
            </div>

            <div className="mb4">
              <a href="javascript:void(0);"
                  onClick={this.fetchMoreNewsFeedItems}
                  className="btn btn-default btn-block">
                Load more
              </a>
            </div>
          </div>
        </div>
      )
    },

    renderItems: function() {
      return _.map(this.state.news_feed_items, function(item) {
        return (
          <div className="sm-col sm-col-6 p2" key={item.id}>
            {NewsFeedItem(item)}
          </div>
        )
      });
    },

    renderEmpty: function() {
      return (
        <div className="well text-center">
          There hasn't been any activity on this product yet. Why not <a href="#">start some tasks</a>?
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
        news_feed_items: items
      });
    },

    _handleMoreNewsFeedItems: function(err, results) {
      if (err) {
        return console.log(error);
      }

      var newItems;
      try {
        newItems = JSON.parse(results);
      } catch (e) {
        return console.log(e);
      }

      this.setState(React.addons.update(
        this.state, {
          news_feed_items: { $push: newItems }
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
