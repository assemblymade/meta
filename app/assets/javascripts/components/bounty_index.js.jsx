/** @jsx React.DOM */

(function() {
  var BountiesStore = require('../stores/bounties_store.js')
  var BountyActionCreators = require('../actions/bounty_action_creators.js')
  var BountyFilter = require('./bounty_filter.js.jsx')
  var BountyList = require('./bounty_list.js.jsx')
  var PaginationLinks = require('./pagination_links.js.jsx')
  var Spinner = require('./spinner.js.jsx')

  var BountyIndex = React.createClass({
    propTypes: {
      tags: React.PropTypes.object,
      pages: React.PropTypes.number,
      product: React.PropTypes.object,
      valuation: React.PropTypes.object
    },

    getInitialState: function() {
      return {
        value: 'is:open',
        sort: 'priority'
      }
    },

    componentDidMount: function() {
      window.addEventListener('scroll', this.onScroll);
    },

    componentWillUnmount: function() {
      window.removeEventListener('scroll', this.onScroll);
    },

    onScroll: function() {
      var atBottom = $(window).scrollTop() + $(window).height() > $(document).height() - 200

      if (atBottom) {
        BountyActionCreators.requestNextPage(this.props.product.slug, this.params(this.state.value, this.state.sort))
      }
    },

    getBounties: function(value, sort, page) {
      BountyActionCreators.requestBountiesDebounced(
        this.props.product.slug,
        this.params(value, sort, page)
      )
    },

    handleValueChange: function(event) {
      var value = event.target.value

      this.setState({ value: value })

      this.getBounties(value, this.state.sort, 1)
    },

    handleSortChange: function(event) {
      var sort = event.target.value

      this.setState({ sort: sort })

      this.getBounties(this.state.value, sort, 1)
    },

    handlePageChange: function(page) {
      this.getBounties(this.state.value, this.state.sort, page)
    },

    addTag: function(tag) {
      return function(event) {
        var value = this.state.value + ' ' + 'tag:' + tag

        this.setState({ value: value })

        this.getBounties(value, this.state.sort, 1)
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

      return (
        <div className="mxn2"> /* parent container */
          <div class="create-task">
            <a href="">
              Create A New Task
            </a>
          </div>


          // <div className="sm-col sm-col-3 px2" style={{float: 'right !important'}}>
          //   <div className="px3">
          //     <div className="h5 mt0 bold">Tags</div>
          //
          //     <ul className="mt1 list-unstyled">
          //       {this.renderTags()}
          //     </ul>
          //   </div>
          //
          // </div>
          //
          // <div className="sm-col sm-col-9 px2 mtn1">
          //   <BountyFilter {...bountyFilterProps} value={this.state.value} onValueChange={this.handleValueChange} sort={this.state.sort} onSortChange={this.handleSortChange} />
          //
          //   <BountyList product={this.props.product} valuation={this.props.valuation} onPageChange={this.handlePageChange} draggable={this.draggable()} />
          // </div>
        </div>
      )
    },

    params: function(value, sort, page) {
      var terms = value.split(' ')

      var params = _.reduce(terms, function(memo, value) {
        var filter = value.split(':')

        if (filter.length == 2) {
          memo[filter[0]] = _.compact(_.flatten([memo[filter[0]], filter[1]]))
        } else {
          memo.query = _.compact([memo.query, value]).join(' ')
        }

        return memo
      }, {})

      var renames = { is: 'state', by: 'created' }

      params = _.reduce(params, function(result, value, key) {
        key = renames[key] || key
        result[key] = value
        return result
      }, {});

      params.sort = sort
      params.page = page

      return params
    },

    draggable: function() {
      if(!this.props.product.can_update) {
        return false
      }

      var params = this.params(this.state.value, this.state.sort)
      return params.sort == 'priority' && params.state == 'open'
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyIndex
  }

  window.BountyIndex = BountyIndex
})();
