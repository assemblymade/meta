var ProductSearchActionCreators = require('../actions/product_search_action_creators')
var ProductSearchResult = require('./product_search_result.js.jsx')
var ProductsSearchStore = require('../stores/products_search_store')
var Spinner = require('./spinner.js.jsx')

var ProductSearch = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  render: function() {
    return <div className="text-left relative">
      <div className="form-group">

        <input type="text" className="form-control" placeholder="Search Apps"
               name="search" valueLink={this.linkState('query')} />
      </div>
    </div>

  },

  renderSearchWindow: function() {
    if (!this.state.resultsShown) {
      return
    }

    return <div className="bg-white border rounded absolute z4" style={{'width': '500px'}}>
      <span className="p2 block border-bottom dark-gray">Search Results</span>
      <div className="py2">
        { this.state.results ? _(this.state.results).map(this.renderProductResult) : <Spinner /> }
      </div>
    </div>
  },

  renderProductResult: function(product) {
    return <ProductSearchResult {...product} />
  },

  getInitialState: function() {
    return {
      query: '',
      results: null,
      resultsShown: false
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.query != this.state.query) {
      if (this.state.query.length > 0) {
        this.debouncedSearch(this.state.query)
      }
      this.setState({ resultsShown: this.state.query.length > 0 })
    }
  },

  debouncedSearch: _.debounce(ProductSearchActionCreators.searchProducts, 100),

  // stores
  componentDidMount: function() {
    ProductsSearchStore.addChangeListener(this._onChange)
  },
  componentWillUnmount: function() {
    ProductsSearchStore.removeChangeListener(this._onChange)
  },

  _onChange: function() {
    this.setState({
      results: ProductsSearchStore.getResults()
    })
  }
})

module.exports = ProductSearch
