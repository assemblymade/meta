/** @jsx React.DOM */

(function() {
  var BountyFilter = require('./bounty_filter.js.jsx')
  var BountyList = require('./bounty_list.js.jsx')
  var PaginationLinks = require('./pagination_links.js.jsx')
  var Spinner = require('./spinner.js.jsx')

  var BountyIndex = React.createClass({
    getInitialState: function() {
      return {
        bounties: this.props.initialBounties,
        filters: this.props.initialFilters,
        loading: false,
        page: 1,
        pages: 1
      }
    },

    getBounties: function(filters, page) {
      var path = this.getBountiesPath()
      var params = this.params(filters, page)

      $.getJSON(path, params, function(response) {
        this.setState({
          bounties: response.bounties,
          loading: false,
          page: response.meta.pagination.page,
          pages: response.meta.pagination.pages,
        });
      }.bind(this));
    },

    handleFiltersChange: function(filters) {
      this.setState({
        filters: filters,
        loading: true,
        page: 1
      })

      this.getBounties(filters, 1)
    },

    handlePageChange: function(page) {
      this.setState({
        loading: true,
        page: page
      })

      this.getBounties(this.state.filters, page)
    },

    render: function() {
      bountyFilterProps = _.pick(this.props, 'tags', 'creators', 'workers')

      return (
        <div>
          <BountyFilter {...bountyFilterProps} filters={this.state.filters} onChange={this.handleFiltersChange} />

          <div className="border-top mt2 mb2"></div>

          {this.state.loading ? <Spinner /> : null}
          
          <BountyList bounties={this.state.bounties} product={this.props.product} />

          <PaginationLinks page={this.state.page} pages={this.state.pages} onPageChanged={this.handlePageChange} />
        </div>
      )
    },

    getBountiesPath: function() {
      return ['/', this.props.product.slug, '/', 'bounties', '.', 'json'].join('')
    },

    params: function(filters, page) {
      var params = _.reduce(filters, function(memo, filter) {
        if(filter.type == 'order') {
          memo[filter.type] = filter.value
        } else {
          memo[filter.type] = _.compact(_.flatten([memo[filter.type], filter.value]))
        }

        return memo
      }, {})

      if(params.order) {
        params.sort = params.order
        delete params.order
      }

      params.page = page

      return params
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyIndex
  }

  window.BountyIndex = BountyIndex
})();
