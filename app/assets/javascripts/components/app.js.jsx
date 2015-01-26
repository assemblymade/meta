var Button = require('./ui/button.js.jsx')
var routes = require('../routes')
var Thumbnail = require('./thumbnail.js.jsx')

var App = React.createClass({
  getDefaultProps: function() {
    return {
      maxPitchLength: 50
    }
  },

  render: function() {
    return <div className="">
      <div className="app-main bg-white p3 relative rounded-bottom shadow-bottom">
        <div>
          <a className="left pr2 pb2" href={this.appPath()}>
            <Thumbnail size={60} src={this.props.logo_url} />
          </a>

          <a href={this.appPath()} className="text-stealth-link app-title gray-2">
            {this.props.name}
          </a>
        </div>

        <div className="app-pitch">
          {this.pitch()}
        </div>

        <div className="app-info">
          <div class="app-tags">
            {_(this.searchTags()).first(3).map(tag => <span className="mr1 gray-2 uppercase small">#{tag}</span>)}
          </div>

          <div>
            <span className="bold pill-gray">
              In Progress
            </span>
          </div>
        </div>
      </div>
    </div>
  },

  pitch: function() {
    if (this.props.pitch.length > this.props.maxPitchLength) {
      return this.props.pitch.substring(0, this.props.maxPitchLength-3) + '...'
    }
    return this.props.pitch
  },

  searchTags: function() {
    if (this.props.search_tags.length == 0) {
      return ['DefaultTag']
    }
    return this.props.search_tags
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
