var App = require('./app.js.jsx')
var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher')
var ShowcaseBannerStore = require('../stores/showcase_banner_store')

var ShowcaseBanner = React.createClass({
  onClick: function() {
    Dispatcher.dispatch({
      type: ActionTypes.SHOWCASE_BANNER_DISMISSED,
      data: this.props.user.dismiss_showcase_banner_url
    })

    var user = this.props.user
    user.showcase_banner_dismissed_at = new Date()

    Dispatcher.dispatch({
      type: ActionTypes.USER_RECEIVE,
      user: user
    })
  },

  render: function() {
    if (this.props.user.showcase_banner_dismissed_at) {
      return <div />
    }

    var currentProduct
    var recentProducts = []

    if (this.props.current) {
      currentProduct = <App app={this.props.current} />
    }

    if (this.props.recent.length) {
      recentProducts = this.props.recent.map(function(product) {
        return <App app={product} />
      })
    }

    return (
      <div className="bg-white py4 border-bottom overflow-hidden hidden-xs" data-dismissible="showcase">
        <div className="container relative">
          <div className="clearfix">
            <div className="sm-col sm-col-12">
              <button type="button" className="h2 close js-dismiss mr2 mt0 mb0" onClick={this.onClick}>
                <span>&times;</span>
              </button>

              <h2 className="mt0 mb2 inline">7-Day MVP</h2>

              <p className="h3 ml2 mt0 mb2 inline light">
                Help the Assembly community ship a new product every week.
              </p>

              <div className="clearfix mxn2 mt3">
                <div className="col col-4 p2 border-right">
                  <h6 className="gray-2 caps mt0 mb1">Shipping this week</h6>
                  {currentProduct}
                </div>

                <div className="col col-4 p2">
                  <h6 className="gray-2 caps mt0 mb1">Recently shipped</h6>
                  {recentProducts[0]}
                </div>

                <div className="col col-4 p2 mt2" style={{ marginTop: '1.5em' }}>
                  {recentProducts[1]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

module.exports = ShowcaseBanner
