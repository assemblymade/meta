var AppsStore = require('../stores/apps_store')
var App = require('./app.js.jsx')
var ButtonDropdown = require('./ui/button_dropdown.js.jsx')
var DropdownMenu = require('./ui/dropdown_menu.js.jsx')
var DropdownMixin = require('../mixins/dropdown_mixin.js.jsx')
var Icon = require('./ui/icon.js.jsx')
var Nav  = require('./ui/nav.js.jsx')
var ProductSearch = require('./product_search.js.jsx')
var Spinner = require('./spinner.js.jsx')

var filters = [
  ['mine', 'My Apps'],
  ['live', 'Live'],
  ['trending', 'Trending'],
  ['new', 'New'],
]

_.mixin({
  // _.eachSlice(obj, slice_size, [iterator], [context])
  eachSlice: function(obj, slice_size, iterator, context) {
    var collection = obj.map(function(item) { return item; }), o = [], t = null, it = iterator || function(){};

    if (typeof collection.slice !== 'undefined') {
      for (var i = 0, s = Math.ceil(collection.length/slice_size); i < s; i++) {
        it.call(context, (t = _(collection).slice(i*slice_size, (i*slice_size)+slice_size), o.push(t), t), obj);
      }
    }
    return o;
  }
});

var Apps = React.createClass({
  mixins: [DropdownMixin],

  propTypes: {
    search: React.PropTypes.string.isRequired
  },

  render: function() {

    filtersDropdownMenu = (
      <DropdownMenu position="right">
        {_(this.props.topics).map(f =>
          <DropdownMenu.Item label={f.name} action={"/apps?topic=" + f.slug} />
        )}
      </DropdownMenu>
    )

    return <section className="tile-grid tile-grid-ideas">
      <div className="clearfix">
      </div>
      <div className="container main">
        <div className="header py4">
          <nav className="tile-grid-nav">
            <div className="item">
              <Nav orientation="horizontal">
                {_(filters).map(f =>
                  <Nav.Item href={"/apps?filter=" + f[0]} label={f[1]} />
                )}
                <Nav.Divider />
                <Nav.Item label="Filters" dropdownMenu={filtersDropdownMenu} />
              </Nav>
            </div>

            <div className="item">
              <form action="/apps">
                <input type="text" className="form-control" placeholder="Search Apps" name="search" defaultValue={this.props.search} />
              </form>
            </div>
          </nav>
        </div>

        {this.renderApps()}
      </div>
    </section>
  },

  renderApps: function() {
    if (this.state.apps == null) {
      return <Spinner />
    }
    return <div>
      {this.renderAppsList(_(this.state.apps).first(3))}
      {this.renderShowcases()}
      {this.renderAppsList(_(this.state.apps).rest(3))}
    </div>
  },

  renderAppsList: function(apps) {
    return <div className="clearfix mxn2">
      {_(apps).map(app =>
        <div className="sm-col sm-col-4 p2">
          <App app={app} />
        </div>
      )}
    </div>
  },

  renderShowcases: function() {
    if (!this.props.showcases) {
      return null
    }
    return <div>
      <div className="col col-6 pr2 pb2">
        <a href={"/apps?showcase=" + this.props.showcases[0].slug} className="big-block-button">
          <div className="h7">Top Trending</div>
          {this.props.showcases[0].hero_title}
        </a>
      </div>

      <div className="col col-6 pl2 pb2">
        <a href={"/apps?showcase=" + this.props.showcases[1].slug} className="big-block-button">
          <div className="h7">Top Trending</div>
          {this.props.showcases[1].hero_title}
        </a>
      </div>
    </div>
  },

  getInitialState: function() {
    return this.getStateFromStore()
  },

  getStateFromStore: function() {
    return {
      apps: AppsStore.getApps()
    }
  },

  componentDidMount: function() {
    AppsStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function() {
    AppsStore.removeChangeListener(this._onChange)
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  }

})

module.exports = window.Apps = Apps
