

(function() {
  var UserFilter = require ('./user_filter.js.jsx')
  var TagFilter = require ('./tag_filter.js.jsx')
  var SortOrder = require ('./sort_order.js.jsx')

  var BountyFilters = React.createClass({
    userFilter: function() {
      return <UserFilter {...this.props} buildUrl={this.buildUrl} />;
    },

    tagFilter: function() {
      return <TagFilter {...this.props} buildUrl={this.buildUrl} />;
    },

    sortOrder: function() {
      return <SortOrder {...this.props} buildUrl={this.buildUrl} />;
    },

    clearFilters: function() {
      if (this.props.selected_user_id || this.props.selected_tag || this.props.selected_sort) {
        return (
          <li>
            <a href={this.props.url} className="btn btn-default">
              Clear filters
            </a>
          </li>
        )
      }
    },

    buildUrl: function(options) {
      var url = this.props.url;

      var query = _.compact(_.map(['state', 'tag', 'sort', 'user_id'], function(query) {
        var value;
        if (query == 'user_id') {
          value = options['user'] && options['user'].id || this.props['selected_user_id']
        } else {
          value = options[query] || this.props['selected_' + query]
        }

        if (value) {
          return [query, value].join('=')
        }
      }.bind(this)))

      var query = query.join('&')
      return [url, query].join('?')
    },

    render: function() {
      return  (
        <ul className="nav nav-pills">
          {this.clearFilters()}
          {this.userFilter()}
          {this.tagFilter()}
          {this.sortOrder()}
        </ul>
      )
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyFilters
  }

  window.BountyFilters = BountyFilters
})();
