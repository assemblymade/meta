var routes = require('../routes')
var Thumbnail = require('./thumbnail.js.jsx')

var App = React.createClass({
  render: function() {
    return <div className="app">
      <div className="left">
        <a href={this.appPath()}>
          <Thumbnail size={60} src={this.props.logo_url} />
        </a>
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
        <div className="app-tags">
          {_(this.props.popular_open_tags).map(tag => <a href="#" className="mr1">#{tag}</a>)}
        </div>
        {this.appButton()}
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
