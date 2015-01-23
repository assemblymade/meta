var Button = require('./ui/button.js.jsx')
var routes = require('../routes')
var Thumbnail = require('./thumbnail.js.jsx')
var Label = require('./ui/label.js.jsx')

var App = React.createClass({
  getDefaultProps: function() {
    return {
      maxPitchLength: 50
    }
  },

  render: function() {
    return <div className="clearfix" style={{minHeight: 120}}>
      <div className="left mr2">
        <a href={this.appPath()}>
          <Thumbnail size={60} src={this.props.logo_url} />
        </a>
      </div>

      <div className="overflow-hidden">
        <h6 className="mt0 mb0">{this.props.name}</h6>

        <p className="mt0 mb0">{this.pitch()}</p>

        <div className="mb1">
          {_(this.searchTags()).first(3).map(tag =>
            <span className="mr1 inline-block" key={tag}>
              <Label name={tag} />
            </span>
          )}
        </div>

        <div className="bg-white bold border border-gray-4 gray-2 inline-block h6 mt0 mb0 px2" style={{borderRadius: '99px', fontSize: 11}}>
          In Progress
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
