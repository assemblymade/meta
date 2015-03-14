'use strict';

const Button = require('./ui/button.js.jsx');
const Tile = require('./ui/tile.js.jsx');
const Checklist = require('./checklist.js.jsx');
const ProductStateIndicator = require('./product_state_indicator.js.jsx');

var ProductStateWidget = React.createClass({

  propTypes: {
    entity: React.PropTypes.object.isRequired,
    stages: React.PropTypes.array.isRequired,
    currentStage: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
    return {
      currentStage: this.props.currentStage,
      activeStage: this.props.currentStage,
      stages: [
        { name: 'Idea',
          buttonText: 'Start recruiting', 
          items: [
            {name: 'item 1', complete: true, subtext: 'item subtext'},
            {name: 'item 2', complete: true, subtext: 'item subtext'},
            {name: 'item 3', complete: false, subtext: 'item subtext'}
        ]},
        { name: 'Recruiting',
          buttonText: 'Start building', 
          items: [
            {name: 'item 4', complete: false, subtext: 'item subtext'},
            {name: 'item 5', complete: false, subtext: 'item subtext'},
            {name: 'item 6', complete: false, subtext: 'item subtext'}
        ]},
        { name: 'Building',
          buttonText: 'Proceed to launch',
          items: [
            {name: 'item 7', complete: false, subtext: 'item subtext'},
            {name: 'item 8', complete: false, subtext: 'item subtext'},
            {name: 'item 9', complete: false, subtext: 'item subtext'}
        ]},
        { name: 'Launching',
          buttonText: 'Proceed to growing', 
          items: [
            {name: 'item 10', complete: false, subtext: 'item subtext'},
            {name: 'item 11', complete: false, subtext: 'item subtext'},
            {name: 'item 12', complete: false, subtext: 'item subtext'}
        ]},
        { name: 'Growing',
          buttonText: '', 
          items: [
            {name: 'item 13', complete: false, subtext: 'item subtext'},
            {name: 'item 14', complete: false, subtext: 'item subtext'},
            {name: 'item 15', complete: false, subtext: 'item subtext'}
        ]}
      ]
    }
  },

  getDefaultProps: function() {
    return {
      currentStage: 0
    }
  },

  showStage: function(e, stage_id) {
    this.setState({activeStage: stage_id})
  },

  renderStages: function() {
    var activeStage = this.state.activeStage
    var width = (100 / this.state.stages.length) + '%'
    var stages = this.state.stages.map(function(stage, index) {
      var active = index <= this.state.activeStage ? 'active' : ''
      if (true) {
        stage = ''
      }
      return (
        <li className={active} onClick={this.showStage.bind(null, null, index)} key={index} style={{width: width}}>{stage}</li>
      )
    }.bind(this));
    return (
      <div className="product-state-indicator">
        <div className="p2 pt3">
          <div className="stateName center"><strong>{this.state.stages[this.state.activeStage]['name']}</strong></div>
        </div>
        <div className="col-sm-12">
          <ul className="indicator-container mb3">
            {stages}
          </ul>
        </div>
      </div>
    )
  },

  render: function() {
    var activeChecklist = this.state.stages[this.state.activeStage]
    return (
      <Tile>
        <div className="p3">
          {this.renderStages()}
          <Checklist entity_type={"Idea"} entity={this.props.entity} checklistItems={activeChecklist.items} locked={this.state.activeStage > this.state.currentStage} buttonText={activeChecklist.buttonText} />
        </div>
      </Tile>
    )
  }
})

module.exports = ProductStateWidget

