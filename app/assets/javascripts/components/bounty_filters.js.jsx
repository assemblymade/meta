/** @jsx React.DOM */

(function() {
  var UserFilter = require ('./user_filter.js.jsx')
  var TagFitler = require ('./tag_filter.js.jsx')
  var SortOrder = require ('./sort_order.js.jsx')

  var BountyFilters = React.createClass({
    userFilter: function() {
      return;
      return this.transferPropsTo(<UserFilter buildUrl={this.buildUrl} />)
    },

    tagFilter: function() {
      return this.transferPropsTo(<TagFitler buildUrl={this.buildUrl} />)
    },

    sortOrder: function() {
      return this.transferPropsTo(<SortOrder buildUrl={this.buildUrl} />)
    },

    buildUrl: function(options) {
      var url = this.props.url;

      var query = _.compact(_.map(['state', 'tag', 'sort', 'user'], function(query) {
        var value = options[query] || this.props['selected_' + query]

        if(query == 'user' && value) {
          value = value.id
        }

        if(value) {
          return [query, value].join('=')
        }
      }.bind(this)))

      var query = query.join('&')
      return [url, query].join('?')
    },

    render: function() {
      return  (
        <ul className="nav nav-pills">
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
