var Tile = require('./ui/tile.js.jsx')
var ProductFollowers = require('./product_followers.js.jsx')

var ProductChip = React.createClass({
  render: function() {
    var product = this.props.product

    return (
      <Tile>
        <a className="block p3 clearfix" href={product.url}>
          <div className="right">
            <ProductFollowers product_id={product.id} />
          </div>

          <div className="left mr2">
            <AppIcon app={product} size={36} />
          </div>

          <div className="overflow-hidden" style={{ lineHeight: '16px' }}>
            <div className="h6 mt0 mb0 black">{product.name}</div>
            <div className="h6 mt0 mb0 gray-2">{product.pitch}</div>
          </div>
        </a>
      </Tile>
    )
  }
})

window.ProductChip = module.exports = ProductChip
