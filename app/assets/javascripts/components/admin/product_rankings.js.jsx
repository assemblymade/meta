

(function() {
  var xhr = require('../../xhr')
  var PaginationLinks = require('../pagination_links.js.jsx')
  var parseUri = require('../../lib/parseuri')
  var Timestamp = require('../timestamp.js.jsx')
  var ProductState = require('./product_state.js.jsx')

  var ProductRankings = React.createClass({
    getInitialState: function() {
      var q = parseUri(window.location).queryKey

      var s = {
        page: q.page || 1,
        sortCol: q.sort || 'created_at',
        sortAsc: (q.direction === 'asc'),
        showRanked: (q.showranked === 'true'),
        query: q.q || '',
        products: {}
      }

      return s
    },

    componentDidMount: function() {
      this.fetchProducts(this.state.page)
    },

    render: function() {
      return <div>
        <input type="text" onChange={this.handleSearchChanged} value={this.state.query} />
        <div className="checkbox">
          <label>
            <input type="checkbox" defaultChecked={this.state.showRanked} onChange={this.handleFilterChanged} /> Show ranked products
          </label>
        </div>

        <table className="table table-striped">
          <thead>
            <tr>
              <TableSortHeader width={150} onClick={this.handleSortToggled('name')} asc={this.sortOrder('name')} label="Name" />
              <TableSortHeader width={300} onClick={this.handleSortToggled('pitch')} asc={this.sortOrder('pitch')} label="Pitch" />
              <TableSortHeader width={150} onClick={this.handleSortToggled('created_at')} asc={this.sortOrder('created_at')} label="Created" />
              <TableSortHeader width={150} onClick={this.handleSortToggled('last_activity_at')} asc={this.sortOrder('last_activity_at')} label="Updated" />
              <TableSortHeader width={150} onClick={this.handleSortToggled('watchings_count')} asc={this.sortOrder('watchings_count')} label="Followers" align="right" />
              <TableSortHeader width={150} onClick={this.handleSortToggled('open_tasks_count')} asc={this.sortOrder('open_tasks_count')} label="Open Tasks" align="right" />
              <TableSortHeader width={150} onClick={this.handleSortToggled('state')} asc={this.sortOrder('state')} label="State" />
              <TableSortHeader width={150} onClick={this.handleSortToggled('quality')} asc={this.sortOrder('quality')} label="Quality Score" align="right" />
            </tr>
          </thead>

          <tbody>
            {_.values(this.state.products).map(function(product) {
              return ProductRow(React.addons.update(product, {
                key: { $set: product.id },
                onChange: { $set: this.handleQualityChanged(product.id) }
              }))
            }.bind(this))}
          </tbody>
        </table>

        <PaginationLinks page={this.state.page} pages={this.props.totalPages} onPageChanged={this.handlePageChanged} />
      </div>
    },

    handleSearchChanged: function(e) {
      this.fetchProducts(this.state.page)
      this.setState({query: e.target.value})
    },

    handleQualityChanged: function(productId) {
      return function(quality) {
        var products = this.state.products
        products[productId].editState = 'saving'
        products[productId].quality = quality
        this.setState({
          products: products
        })

        window.xhr.put('/admin/products/' + productId, { quality: quality }, function() {
          products[productId].editState = 'saved'
          this.setState({
            products: products
          })
        }.bind(this))
      }.bind(this)
    },

    handlePageChanged: function(page) {
      this.fetchProducts(page)
      document.body.scrollTop = document.documentElement.scrollTop = 0
    },

    handleFilterChanged: function(e) {
      this.setState({showRanked: e.target.checked}, function() {
        this.fetchProducts(this.state.page)
      }.bind(this))
    },

    handleSortToggled: function(sortCol) {
      return function(e) {
        this.setState({
          sortCol: sortCol,
          sortAsc: !this.state.sortAsc
        }, this.fetchProducts)
      }.bind(this)
    },

    fetchProducts: _.debounce(function(page, query) {
      page = page || this.state.page
      query = query || this.state.query

      var sortDir = this.state.sortAsc ? 'asc' : 'desc'
      var url = '/admin/products?page=' + page +
        '&sort=' + this.state.sortCol +
        '&direction=' + sortDir +
        '&showranked=' + this.state.showRanked +
        '&q=' + query

      window.history.replaceState({}, document.title, url)
      NProgress.start();
      window.xhr.get(url, function(err, responseText) {
        var products = {}
        JSON.parse(responseText).map(function(p){
          products[p.id] = p
        })
        this.setState({products: products, page: page})
        NProgress.done()
      }.bind(this))
    }, 500),

    sortOrder: function(col) {
      return this.state.sortCol == col ? this.state.sortAsc : null
    }
  })

  var ProductRow = React.createClass({
    getInitialState: function() {
      return {
        pendingQualityScore: null,
        dirty: false,
        state: this.props.state
      }
    },

    render: function() {
      var bgColor = '#fff'
      if (this.state.pendingQualityScore || this.props.editState == 'saving') {
        bgColor = '#fcf8e3'
      } else if (this.props.editState == 'saved') {
        bgColor = '#dff0d8'
      }

      return <tr>
        <td>
          <strong>
            <a href={this.props.url} target="_blank" tabIndex="-1">{this.props.name}</a>
          </strong>
        </td>
        <td>{this.props.pitch}</td>
        <td><Timestamp time={this.props.created_at} /></td>
        <td><Timestamp time={this.props.last_activity_at} /></td>
        <td className="right-align">{this.props.watchings_count}</td>
        <td className="right-align">{this.props.open_tasks_count}</td>
        <td><ProductState state={this.state.state} url={'/admin/products/' + this.props.id} /></td>
        <td className="right-align">
          <input type="text" className="form-control" value={this.state.dirty ? this.state.pendingQualityScore : this.props.quality} style={{ backgroundColor: bgColor }}
            onChange={this.handleChange}
            onBlur={this.persistChange}
          />
        </td>
      </tr>
    },

    handleChange: function(e) {
      this.setState({
        dirty: true,
        pendingQualityScore: e.target.value
      })
    },

    persistChange: function() {
      if (this.state.dirty && (this.state.pendingQualityScore != this.props.quality)) {
        this.props.onChange(this.state.pendingQualityScore)
        this.setState({pendingQualityScore: null, dirty: false})
      }
    }
  })

  var SortArrow = React.createClass({
    render: function() {
      if (this.props.asc === false) {
        return <span className="caret" />
      } else if (this.props.asc === true) {
        return <span className="dropup"><span className="caret" /></span>
      }
      return <span />
    }
  })

  var TableSortHeader = React.createClass({
    render: function() {
      var classes = React.addons.classSet({
        'right-align': (this.props.align == 'right')
      });

      return <th style={{"width": this.props.width}} className={classes}>
      <a href="#" onClick={this.props.onClick} className="text-stealth-link">
      {this.props.label}
      <SortArrow asc={this.props.asc} />
      </a>
      </th>
    }
  })


  if (typeof module !== 'undefined') {
    module.exports = ProductRankings;
  }

  window.ProductRankings = ProductRankings;
})();
