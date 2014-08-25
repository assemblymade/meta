/** @jsx React.DOM */
//= require xhr
//= require components/admin/pagination_links
//= require components/timestamp
//= require underscore

(function() {
  var ProductRankings = React.createClass({
    getInitialState: function() {
      return {
        page: 1,
        sortCol: 'created_at',
        sortAsc: false,
        pageSize: 100,
        showRanked: false,
        products: {}
      }
    },

    componentDidMount: function() {
      this.fetchProducts(this.state.page)
    },

    render: function() {
      return <div>
        <div className="checkbox">
          <label>
            <input type="checkbox" defaultChecked={false} onChange={this.handleFilterChanged} /> Show ranked products
          </label>
        </div>

        <table className="table table-striped">
          <thead>
            <tr>
              <th style={{"width": 150}}>
                <a href="#" onClick={this.handleSortToggled('created_at')}>Created</a>
              </th>
              <th>
                <a href="#" onClick={this.handleSortToggled('name')}>Name</a>
              </th>
              <th>Pitch</th>
              <th style={{"width": 150}}>
                <a href="#" onClick={this.handleSortToggled('updated')}>Updated</a>
              </th>
              <th style={{"width": 150}} className="text-right">
                <a href="#" onClick={this.handleSortToggled('watchings_count')}>Followers</a>
              </th>
              <th style={{"width": 125}} className="text-right">
                <a href="#" onClick={this.handleSortToggled('quality')}>Quality Score</a>
              </th>
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

    fetchProducts: function(page) {
      page = page || this.state.page
      var sortDir = this.state.sortAsc ? 'asc' : 'desc'
      var url = '/admin/products?page=' + page +
        '&sort=' + this.state.sortCol +
        '&direction=' + sortDir +
        '&showranked=' + this.state.showRanked

      window.xhr.get(url, function(err, responseText) {
        var products = {}
        JSON.parse(responseText).map(function(p){
          products[p.id] = p
        })
        this.setState({products: products, page: page})
      }.bind(this))
    }
  })

  var ProductRow = React.createClass({
    getInitialState: function() {
      return {
        pendingQualityScore: null,
        dirty: false
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
        <td><Timestamp time={this.props.created} /></td>
        <td>
          <strong>
            <a href={this.props.url} target="_blank" tabIndex="-1">{this.props.name}</a>
          </strong>
        </td>
        <td>{this.props.pitch}</td>
        <td><Timestamp time={this.props.last_activity_at} /></td>
        <td className="text-right">{this.props.watchings_count}</td>
        <td className="text-right">
          <input type="text" className="form-control" value={this.state.dirty ? this.state.pendingQualityScore : this.props.quality} style={{'background-color': bgColor}}
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

  if (typeof module !== 'undefined') {
    module.exports = Avatar;
  }

  window.ProductRankings = ProductRankings;
})();
