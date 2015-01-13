var AppsStore = require('../stores/apps_store')
var App = require('./app.js.jsx')

var filters = [
  ['mine', 'My Apps'],
  ['live', 'Live'],
  ['trending', 'Trending'],
  ['new', 'New'],
]

var Apps = React.createClass({
  render: function() {
    // var apps = _(this.state.apps).partition(a => a.try_url)
    //
    // tryable = apps[0]
    // inDev = apps[1]

    var firstSectionApps = _(this.state.apps).first(3)
    var secondSectionApps = _(this.state.apps).rest(3)

    return <section className="tile-grid tile-grid-ideas">
      <div className="container main">
        <div className="header">
          <nav className="tile-grid-nav">
            <div className="item">
              <ul className="nav nav-pills">
                {_(filters).map(f => <li>
                    <a href={"/apps?filter=" + f[0]}>{f[1]}</a>
                  </li>
                )}
                {this.renderTopics()}
              </ul>
            </div>

            <div className="item">
              <form className="navbar-form" role="search">
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Search Apps" />
                </div>
              </form>
            </div>
          </nav>
        </div>

        {this.renderAppsList(firstSectionApps)}

        <div className="col col-6 pr2 pb2">
          <a href={"/apps?filter=" + this.props.topics[0].slug} className="big-block-button">
            <div className="h7">Top Trending</div>
            {this.props.topics[0].hero_title}
          </a>
        </div>
        <div className="col col-6 pl2 pb2">
          <a href={"/apps?filter=" + this.props.topics[1].slug} className="big-block-button">
            <div className="h7">Top Trending</div>
            {this.props.topics[1].hero_title}
          </a>
        </div>

        {this.renderAppsList(secondSectionApps)}
      </div>
    </section>
  },

  renderAppsList: function(apps) {
    return <div className="clearfix mt2">
      {_(apps).map(a =>
        <div className="col col-4 app">
          <App {...a} />
        </div>
      )}
    </div>
  },

  renderTopics: function() {
    return <li className="dropdown">
      <a className="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
        Topics <span className="caret"></span>
      </a>
      <ul className="dropdown-menu" role="menu">
        {_(this.props.topics).map(f => <li>
          <a href={"/apps?filter=" + f.slug}>{f.name}</a>
          </li>
        )}
      </ul>
    </li>
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
