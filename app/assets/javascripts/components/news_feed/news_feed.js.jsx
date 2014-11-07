/** @jsx React.DOM */

(function() {
  var NewsFeedItem = require('./news_feed_item.js.jsx');
  var MasonryMixin = require('../../mixins/masonry_mixin.js')

  var NewsFeed = React.createClass({

    mixins: [MasonryMixin('masonryContainer', {transitionDuration: 0})],

    getDefaultProps: function() {
      var filters = lowerCaseAndReflect([
        'Frontend',
        'Backend',
        'Design',
        'Marketing',
        'Writing'
      ]);

      if (window.app.featureEnabled('hot-updates')) {
        filters['Hot'] = 'hot';
      } else {
        filters['Mobile'] = 'mobile';
      }

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
          {_.map(_.keys(this.props.filters), renderFilterListItem.bind(this))}
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

    render: function() {
      window.analytics.track(
        'news_feed_item.viewed', {
          product: (window.app.currentAnalyticsProduct())
        }
      );

      return (
        <div>
          <div>
            {this.filters()}
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
      )
    },

    renderItems: function() {
      return this.state.news_feed_items.map(function(item) {
        return (
          <div className="sm-col sm-col-4 p2" key={item.id}>
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

  function renderFilterListItem(filter) {
    var label = this.props.filters[filter];

    var buttonClass = filter === this.state.filter ?
      'active' :
      '';

    // var onClick= this.filterBy.bind(this, filter);

    return (
      <li className={buttonClass} key={filter}>
        <a href={"?filter=" + filter}>
          {label}
        </a>
      </li>
    );
  }

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
