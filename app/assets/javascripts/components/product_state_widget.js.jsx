'use strict';
const ChecklistStore = require('../stores/checklist_store');
const ChecklistActions = require('../actions/checklist_actions');
const Button = require('./ui/button.js.jsx');
const Tile = require('./ui/tile.js.jsx');
const Checklist = require('./checklist.js.jsx');
const ProductStateIndicator = require('./product_state_indicator.js.jsx');

var ProductStateWidget = React.createClass({

  propTypes: {
    entity: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    ChecklistStore.addChangeListener(this.getStateFromStore);
    ChecklistActions.fetchChecklists(this.props.entity)
  },

  componentWillUnmount: function() {
    ChecklistStore.removeChangeListener(this.getStateFromStore);
  },

  getStateFromStore: function() {
    var data = ChecklistStore.fetchChecklistItems();
    this.setState({
      checklist_data: data,
      currentStage: data.current_stage,
      activeStage: data.current_stage,
      stages: data.stages
    });
  },

  getInitialState: function() {
    return {
      currentStage: 0,
      activeStage: 0,
      stages: [{name: ''}]
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
