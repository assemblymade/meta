var routes = require('../routes')
var Thumbnail = require('./thumbnail.js.jsx')

var ProductSearchResult = React.createClass({
  render: function() {
    return <a className="button block button-nav-light" style={{minHeight: '73px'}} href={routes.product_path({id: this.props.slug})}>
      <div className="left px2 py1">
        <Thumbnail src={this.props.logo_url} width={60} height={60} />
      </div>

      <div className="app-info py1">
        <div className="app-title">
          {this.props.name}
        </div>
        <div className="app-pitch">
          {this.props.pitch}
        </div>
      </div>
    </a>
  },

  appPath: function() {
    return routes.product_path({id: this.props.slug})
  }
})

module.exports = ProductSearchResult
