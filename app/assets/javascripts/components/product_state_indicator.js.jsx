'use strict';

var ProductStateIndicator = React.createClass({

  getDefaultProps: function() {
    return
  },

  render: function() {
    return (
      <div className="product-state-indicator">
        <div className="p2 pt3">
          <div className="stateName col-sm-3"><strong>Idea Stage</strong></div>
          <div className="stateDescription col-sm-9">
            <p>Heart this idea if you love it, or <a href="#">submit your own</a>.</p>
          </div>
        </div>
        <div className="col-sm-12">
          <ul className="indicator-container mb3">
            <li className="active"></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
      </div>
    )
  }
})

module.exports = ProductStateIndicator
