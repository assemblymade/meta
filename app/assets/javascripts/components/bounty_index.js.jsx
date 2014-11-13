/** @jsx React.DOM */

(function() {
  var BountyFilter = require('./bounty_filter.js.jsx')
  var BountyList = require('./bounty_list.js.jsx')
  var Spinner = require('./spinner.js.jsx')

  var BountyIndex = React.createClass({
    getInitialState: function() {
      return {
        bounties: this.props.initialBounties,
        filters: this.props.initialFilters,
        loading: false
      }
    },

    getBounties: function(filters) {
      var path = this.getBountiesPath()
      var params = this.filtersAsParams(filters)

      $.getJSON(path, params, function(response) {
        this.setState({
          bounties: response,
          loading: false
        });
      }.bind(this));
    },

    handleChange: function(filters) {
      this.setState({
        filters: filters,
        loading: true
      })

      this.getBounties(filters)
    },

    render: function() {
      bountyFilterProps = _.pick(this.props, 'tags', 'creators', 'workers')

      return (
        <div>
          <BountyFilter {...bountyFilterProps} onChange={this.handleChange} />

          <div className="border-top mt2 mb2"></div>

          {this.state.loading ? <Spinner /> : null}
          
          <BountyList bounties={this.state.bounties} product={this.props.product} />
        </div>
      )
    },

    getBountiesPath: function() {
      return ['/', this.props.product.slug, '/', 'bounties', '.', 'json'].join('')
    },

    filtersAsParams: function(filters) {
      var params = _.reduce(filters, function(memo, filter) {
        memo[filter.type] = filter.value
        return memo
      }, {})

      if(params.order) {
        params.sort = params.order
        delete params.order
      }

      return params
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyIndex
  }

  window.BountyIndex = BountyIndex
})();
