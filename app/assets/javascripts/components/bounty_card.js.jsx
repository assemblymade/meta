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
      <a href={product.url} className="block clearfix">
        <div className="left mr2">
          <AppIcon app={product} size={18} />
        </div>
        <div className="overflow-hidden">
          <h6 className="mt0 mb0 black">{product.name}</h6>
        </div>
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

        <div className="h6 mt0 mb0 clearfix">
          <div className="left mr1">
            <Avatar user={bounty.user} size={18} />
          </div>
          <a href={bounty.user.url} className="block overflow-hidden bold black ml1">
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
      <div className="p2 border-top h6 mt0 mb0 clearfix">
        <div className="left">
          <Avatar user={locker} size={18} />
        </div>
        <div className="overflow-hidden">
          <a href={locker.url} className="bold black ml1">
            {locker.username}
          </a>
          {' '}
          <span className="gray-2">
            has {moment(bounty.locked_at).add(60, 'hours').fromNow(true)} to work on this
          </span>
        </div>
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
        <div className="py2 border-bottom" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {product}
        </div>

        <div className="py2" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
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
