var AppIcon = require('./app_icon.js.jsx')
var Icon = require('./ui/icon.js.jsx')
var Tile = require('./ui/tile.js.jsx')

var BountyCard = React.createClass({
  propTypes: {
    bounty: React.PropTypes.object.isRequired,
    showLocker: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      showLocker: false
    }
  },

  renderProduct: function() {
    var product = this.props.bounty.product

    return (
      <a href={product.url} className="block">
        <AppIcon app={product} size={24} style={{ display: 'inline' }} />
        <span className="h6 mt0 mb0 black bold ml1">{product.name}</span>
      </a>
    )
  },

  renderDetails: function() {
    var bounty = this.props.bounty
    var showLocker = this.props.showLocker

    if (showLocker) {
      return
    }

    return (
      <div className="mt2">
        <div className="right h6 mt0 mb0" style={{ marginTop: 3 }}>
          <div className="ml2 inline gray-3 bold">
            <Icon icon={"comment"} />
            <span className="ml1">{bounty.comments_count}</span>
          </div>
          <div className="ml2 inline gray-3 bold">
            <Icon icon={"heart"} />
            <span className="ml1">{bounty.hearts_count}</span>
          </div>
        </div>

        <div className="h6 mt0 mb0">
          <Avatar user={bounty.user} size={18} style={{ display: 'inline-block' }} />
          <a href={bounty.user.url} className="bold black ml1">
            {bounty.user.username}
          </a>
        </div>
      </div>
    )
  },

  renderLocker: function() {
    var bounty = this.props.bounty
    var locker = bounty.locker
    var showLocker = this.props.showLocker

    if (!showLocker || !locker) {
      return
    }

    return (
      <div className="p2 border-top h6 mt0 mb0">
        <Avatar user={locker} size={18} style={{ display: 'inline-block' }} />
        <a href={locker.url} className="bold black ml1">
          {locker.username}
        </a>
        {' '}
        <span className="gray-2">
          has {moment(bounty.locked_at).add(60, 'hours').fromNow(true)} to work on this
        </span>
      </div>
    )
  },


  render: function() {
    var bounty = this.props.bounty
    var product = this.renderProduct()
    var details = this.renderDetails()
    var locker = this.renderLocker()

    return (
      <Tile>
        <div className="p2 border-bottom">
          {product}
        </div>

        <div className="p2">
          <a className="blue block h5 mt0 mb0" href={bounty.url}>
            {bounty.title}
          </a>

          {details}
        </div>

        {locker}
      </Tile>
    )
  }
})

window.BountyCard = module.exports = BountyCard
