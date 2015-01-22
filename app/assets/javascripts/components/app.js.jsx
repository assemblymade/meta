var ActivityGraph = require('./activity_graph.js.jsx')
var routes = require('../routes')
var Thumbnail = require('./thumbnail.js.jsx')

var App = React.createClass({
  render: function() {
    return <div className="app relative">
      <div className="mb2">
        <a href={this.appPath()}>
          <Thumbnail size={60} src={this.props.logo_url} />
        </a>
        <div className="right mt2">
          <ActivityGraph width={180} height={48} data={this.props.recent_activity} />
        </div>
      </div>

      <div className="app-info">
        <div className="app-title">
          <a href={this.appPath()} className="text-stealth-link">
            {this.props.name}
          </a>
        </div>
        <div className="app-pitch">
          {this.props.pitch}
        </div>
      </div>

    </div>
  },

  appButton: function() {
    if (this.props.try_url) {
      return <a href={this.props.try_url} className="btn btn-xs btn-success mt1">Try</a>
    } else {
      return <a href={this.appPath()}>In Development</a>
    }
  },

  appPath: function() {
    return routes.product_path({id: this.props.slug})
  }
})

module.exports = App
