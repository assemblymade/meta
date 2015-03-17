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
        'Idea',
        'Recruitment',
        'Setup',
        'MVP',
        'Launch',
        'Grow'
      ],
      labeled: true,
      activeStage: 0,
      currentStage: 0
    }
  },

  renderStages: function() {
    var activeStage = this.props.activeStage
    var width = (100 / this.props.stages.length) + '%'
    var stages = this.props.stages.map(function(stage, index) {
      var active = index <= this.props.activeStage ? 'active-grey' : ''
      var lookAhead = index <= this.props.currentState ? 'active' : ''
      if (!this.props.labeled) {
        stage = ''
      }
      return (
        <li className={active + ' ' + lookAhead} key={index} style={{width: width}}>{stage}</li>
      )
    }.bind(this));
    return stages
  },

  render: function() {
    return (
      <div className="product-state-indicator">
        <div className="p2 pt3">
          <div className="stateName center"><strong>{this.props.stages[this.props.activeStage]}</strong>
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
