/** @jsx React.DOM */

(function() {
  var BountyFilter = require('./bounty_filter.js.jsx')
  var BountyList = require('./bounty_list.js.jsx')
  var PaginationLinks = require('./pagination_links.js.jsx')
  var Spinner = require('./spinner.js.jsx')

  var timeout = null

  var BountyIndex = React.createClass({
    getInitialState: function() {
      return {
        bounties: this.props.initialBounties,
        filters: this.props.initialFilters,
        loading: false,
        page: 1,
        pages: 1,
        value: ''
      }
    },

    getBounties: function(value, page) {
      if(timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(function() {
        var path = this.getBountiesPath()
        var params = this.params(value, page)

        $.getJSON(path, params, function(response) {
          this.setState({
            bounties: response.bounties,
            loading: false,
            page: response.meta.pagination.page,
            pages: response.meta.pagination.pages,
          });
        }.bind(this));
      }.bind(this), 200)
    },

    handleInputChange: function(event) {
      var value = event.target.value

      this.setState({
        value: value,
        loading: true,
        page: 1
      })

      this.getBounties(value, 1)
    },

    handlePageChange: function(page) {
      this.setState({
        loading: true,
        page: page
      })

      this.getBounties(this.state.filters, page)
    },

    addTag: function(tag) {
      return function(event) {
        var value = this.state.value + ' ' + 'tag:' + tag

        this.setState({
          loading: true,
          value: value
        })

        this.getBounties(value, 1)
      }.bind(this)
    },

    renderTags: function() {
      return this.props.tags.map(function(tag) {
        return (
          <li>
            <a href="#" onClick={this.addTag(tag)}>
              <span className="caps">{tag}</span>
            </a>
          </li>
        )
      }.bind(this))
    },

    render: function() {
      var bountyFilterProps = _.pick(this.props, 'tags', 'creators', 'workers')

      var tags = ['design', 'code', 'frontend', 'backend']

      return (
        <div>
          <div className="sm-col sm-col-4 px2" style={{float: 'right !important'}}>
            <CreateBountyButton {...this.props} classes={['btn btn-primary btn-block']} />

            <div className="py2">
              <strong>Tags</strong>

              <ul className="mt1 list-unstyled">
                {this.renderTags()}
              </ul>
            </div>

          </div>

          <div className="sm-col sm-col-8 px2">
            <BountyFilter {...bountyFilterProps} filters={this.state.filters} value={this.state.value} onChange={this.handleInputChange} />

            <div className="border-top mt2 mb2"></div>

            {this.state.loading ? <Spinner /> : null}
            
            <BountyList bounties={this.state.bounties} product={this.props.product} />

            <PaginationLinks page={this.state.page} pages={this.state.pages} onPageChanged={this.handlePageChange} />
          </div>
        </div>
      )
    },

    getBountiesPath: function() {
      return ['/', this.props.product.slug, '/', 'bounties', '.', 'json'].join('')
    },

    params: function(value, page) {
      var terms = value.split(' ')

      var params = _.reduce(terms, function(memo, value) {
        var filter = value.split(':')

        if(filter.length == 2) {
          memo[filter[0]] = _.compact(_.flatten([memo[filter[0]], filter[1]]))
        } else {
          memo.query = _.compact([memo.query, value]).join(' ')
        }

        return memo
      }, {})

      params.page = page

      return params
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyIndex
  }

  window.BountyIndex = BountyIndex
})();
