var AppIcon = require('./app_icon.js.jsx')
var Tile = require('./ui/tile.js.jsx')

var ProductTile = React.createClass({

  propTypes: {
    product: React.PropTypes.object.isRequired,
  },

  render() {
    var product = this.props.product

    return (
      <Tile>
        <div className="clearfix py2 border-bottom" style={{paddingLeft: '1.5rem', paddingRight: '1.5rem'}}>
          <div className="left mr2">
            <AppIcon app={product} size={18} />
          </div>
          <div className="overflow-hidden">
            <h6 className="black mt0 mb0">{product.name}</h6>
          </div>
        </div>
        {this.props.children}
      </Tile>
    )
  }

})

module.exports = ProductTile
