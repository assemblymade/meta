var Button = require('./ui/button.js.jsx')
var routes = require('../routes')
var SingleLineList = require('./ui/single_line_list.js.jsx')
var AppIcon = require('./app_icon.js.jsx')
var Tile = require('./ui/tile.js.jsx')
var Label = require('./ui/label.js.jsx')

var App = React.createClass({

  propTypes: {
    app: React.PropTypes.object.isRequired
  },

  getDefaultProps: function() {
    return {
      maxPitchLength: 50
    }
  },

  render: function() {
    var tags
    var logoUrl = this.props.app.logo_url
    var name = this.props.app.name

    tags = _(this.searchTags()).first(3).map(tag => {
      return <Label name={tag} />
    })

    return <a className="block" href={this.appPath()}>
      <Tile>
        <div className="border-bottom p3 right-align">
          {this.appButton()}

          <div className="left bg-white rounded border-inset-dark">
            <AppIcon app={this.props.app} size={66} />
          </div>
        </div>

        <div className="p3 mt2">
          <h4 className="regular mt0 mb0 gray-2">{name}</h4>

          <div style={{minHeight: '6rem'}}>
            <p className="h4 mt0 mb0 bold black">{this.pitch()}</p>
          </div>

          <div className="mt2">
            <SingleLineList items={tags} />
          </div>
        </div>
      </Tile>
    </a>
  },

  pitch: function() {
    var pitch = this.props.app.pitch

    if (pitch.length > this.props.maxPitchLength) {
      return pitch.substring(0, this.props.maxPitchLength-3) + '...'
    }

    return pitch
  },

  searchTags: function() {
    var searchTags = this.props.app.search_tags

    if (!searchTags || searchTags.length == 0) {
      return []
    }

    return searchTags
  },

  appButton: function() {
    var tryUrl = this.props.app.try_url

    if (tryUrl) {
      return <div className="inline-block h5 mt0 mb0 bold px2 bg-green white" style={{borderRadius: '99px', fontSize: 11}}>
        Live
      </div>
    } else {
      return <div className="inline-block h5 mt0 mb0 bold px2 bg-gray-5 black" style={{borderRadius: '99px', fontSize: 11}}>
        In development
      </div>
    }
  },

  appPath: function() {
    return routes.product_path({id: this.props.app.slug})
  }
})

module.exports = App
