var ActivityGraph = require('./activity_graph.js.jsx')
var Button = require('./ui/button.js.jsx')
var Color = require('color')
var routes = require('../routes')
var Thumbnail = require('./thumbnail.js.jsx')

// window.ColorThief = require('color-thief')

var App = React.createClass({
  getDefaultProps: function() {
    return {
      maxPitchLength: 50
    }
  },

  render: function() {
    return <div className="">
      <div className="app-top rounded-top shadow-top px3 pt3" style={this.cardColorStyle()}>
        <div className="right">
          <div className="bold pill-gray">
            In Progress
          </div>
        </div>
      </div>
      <div className="app-main bg-white p3 relative rounded-bottom shadow-bottom">
        <div className="app-logo">
          <a href={this.appPath()}>
            <Thumbnail size={60} src={this.props.logo_url} />
          </a>
        </div>

        <div className="app-info">
          <div className="app-title gray-2">
            <a href={this.appPath()} className="text-stealth-link">
              {this.props.name}
            </a>
          </div>
          <div className="app-pitch">
            {this.pitch()}
          </div>
          <div>
            {_(this.searchTags()).first(3).map(tag => <span className="mr1 gray-2 uppercase small">#{tag}</span>)}
          </div>
        </div>

      </div>
    </div>
  },

  cardColorStyle: function() {
    var colors = ['rgba(207, 214, 219, 0.1)', 'rgba(207, 214, 219, 0.05)']
    if (this.props.dominant_colors && this.props.dominant_colors.length > 0) {
      var funColor = _(this.props.dominant_colors).find(c => Color(c).whiteness() < 70) || this.props.dominant_colors[0]
      colors = [
        Color(funColor).alpha(0.10).rgbString(),
        Color(funColor).alpha(0.05).rgbString()
      ]
    }

    return {
      'background': 'linear-gradient(45deg, ' +
                      colors[0] + ', ' +
                      colors[1] + ') #fefefe'
    }
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
