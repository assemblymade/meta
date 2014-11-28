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
        loading: false,
        page: 1,
        pages: this.props.pages,
        value: 'state:open',
        sort: 'priority'
      }
    },

    getBounties: function(value, sort, page) {
      if(timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(function() {
        var path = this.getBountiesPath()
        var params = this.params(value, sort, page)

        $.getJSON(path, params, function(response) {
          this.setState({
            bounties: response.bounties,
            loading: false,
            page: response.meta.pagination.page,
            pages: response.meta.pagination.pages,
          });
        }.bind(this));
      }.bind(this), 300)
    },

    handleValueChange: function(event) {
      var value = event.target.value

      this.setState({
        value: value,
        loading: true,
        page: 1
      })

      this.getBounties(value, this.state.sort, 1)
    },

    handleSortChange: function(event) {
      var sort = event.target.value

      this.setState({
        loading: true,
        page: 1,
        sort: sort
      })

      this.getBounties(this.state.value, sort, 1)
    },

    handlePageChange: function(page) {
      this.setState({
        loading: true,
        page: page
      })

      this.getBounties(this.state.value, this.state.sort, page)
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

    renderBounties: function() {
      if(this.state.loading) {
        return <Spinner />
      } else {
        return (
          <div>
            <BountyList bounties={this.state.bounties} product={this.props.product} />
            <PaginationLinks page={this.state.page} pages={this.state.pages} onPageChanged={this.handlePageChange} />
          </div>
        )
      }
    },

    render: function() {
      var bountyFilterProps = _.pick(this.props, 'tags', 'creators', 'workers')

      return (
        <div>
          <div className="sm-col sm-col-3 px2" style={{float: 'right !important'}}>
            <CreateBountyButton {...this.props} classes={['btn btn-primary btn-block py2']} />

            <div className="px3 py2 mt2">
              <div className="h5 bold">Tags</div>

              <ul className="mt1 list-unstyled">
                {this.renderTags()}
              </ul>
            </div>

          </div>

          <div className="sm-col sm-col-9 px2">
            <BountyFilter {...bountyFilterProps} value={this.state.value} onValueChange={this.handleValueChange} sort={this.state.sort} onSortChange={this.handleSortChange} />

            <div className="border-top mt2 mb2"></div>

            {this.renderBounties()}
          </div>
        </div>
      )
    },

    getBountiesPath: function() {
      return ['/', this.props.product.slug, '/', 'bounties', '.', 'json'].join('')
    },

    params: function(value, sort, page) {
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

      params.sort = sort
      params.page = page

      return params
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyIndex
  }

  window.BountyIndex = BountyIndex
})();
