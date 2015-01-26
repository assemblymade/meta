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
          <DropdownMenu.Item label={f.name} action={"/discover?topic=" + f.slug} />
        )}
      </DropdownMenu>
    )

    return (
      <div className="container">
        <div className="clearfix py2 md-py3 lg-py4">
          <div className="sm-col sm-col-8 mb2 sm-mb0">
            <Nav orientation="horizontal">
              {_(filters).map(f =>
                <Nav.Item href={"/discover?filter=" + f[0]} label={f[1]} />
              )}
              <Nav.Divider />
              <Nav.Item label="Filters" dropdownMenu={filtersDropdownMenu} />
            </Nav>
          </div>

          <div className="sm-col sm-col-4">
            <form action="/apps">
              <input type="search" className="form-control form-control-search" placeholder="Search all products" name="search" defaultValue={this.props.search} />
            </form>
          </div>
        </div>

        {this.renderApps()}
      </div>
    )
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
        <div className="sm-col sm-col-4 px0 sm-px2 mb3">
          <App app={app} />
        </div>
      )}
    </div>
  },

  renderShowcases: function() {
    if (!this.props.showcases) {
      return null
    }

    return <div className="clearfix mxn2">
      <div className="sm-col sm-col-6 px2 mb3">
        <a href={"/discover?topic=" + this.props.topics[0].slug} className="block center rounded white white-hover py4" style={{
            background: 'linear-gradient(#364d70, #5e0f4c)'
          }}>
          <h4 className="mt1 mb1" style={{color: 'rgba(255,255,255,0.6)'}}>Top Trending</h4>
          <h4 className="mt1 mb1">{this.props.topics[0].hero_title}</h4>
        </a>
      </div>

      <div className="sm-col sm-col-6 px2 mb3">
        <a href={"/discover?topic=" + this.props.topics[1].slug} className="block center rounded white white-hover py4" style={{
            background: 'linear-gradient(#5fb384, #084557)'
          }}>
          <h4 className="mt1 mb1" style={{color: 'rgba(255,255,255,0.6)'}}>Top Trending</h4>
          <h4 className="mt1 mb1">{this.props.topics[1].hero_title}</h4>
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
