'use strict';

var ProductStateIndicator = React.createClass({

  propTypes: {
    stages: React.PropTypes.array.isRequired,
    labeled: React.PropTypes.bool,
    activeStage: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      stages: [
        'stage 1',
        'stage 2',
        'stage 3',
        'stage 4',
        'stage 5',
        'stage 6'
      ],
      labeled: false,
      activeStage: 0
    }
  },

  renderStages: function() {
    var activeStage = this.props.activeStage
    var stages = this.props.stages.map(function(stage, index) {
      var active = index < activeStage ? 'active' : ''
      return (
        <li className={active}>{stage}</li>
      )
    });
    return stages
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
            {this.renderStages()}
          </ul>
        </div>
      </div>
    )
  }
})

module.exports = ProductStateIndicator
