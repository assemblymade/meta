'use strict';

const ChecklistStore = require('../stores/checklist_store');
const ChecklistActions = require('../actions/checklist_actions');
const Button = require('./ui/button.js.jsx');
const Tile = require('./ui/tile.js.jsx');
const Checklist = require('./checklist.js.jsx');
const ProgressBar = require('./ui/progress_bar.js.jsx');

const IdeaProgressWidget = React.createClass({
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
    let data = ChecklistStore.fetchChecklistItems();
    this.setState({
      checklist_data: data,
      currentStage: data.current_stage,
      activeStage: data.current_stage,
      stages: data.stages,
      buttonTexts: data.button_texts
    });
  },

  getInitialState: function() {
    return {
      currentStage: 0,
      activeStage: 0,
      stages: [{name: ''}],
      buttonTexts: ['']
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
    let activeStage = this.state.activeStage
    let width = (100 / this.state.stages.length) + '%'
    let stages = this.state.stages.map((stage, index) => {
      let active = index <= this.state.activeStage ? 'active' : ''
      if (true) {
        stage = ''
      }
      return (
        <li className={active} key={index} style={{width: width}}>{stage}</li>
      )
    });

    return (
      <div className="product-state-indicator">
        <div className="p2 pt0">
          <div className="center"><strong>{this.state.stages[this.state.activeStage]['cta'] || this.state.stages[this.state.activeStage]['name']}</strong>
          </div>
        </div>
        <div className="col-sm-12">
          <ul className="indicator-container mb0">
            {stages}
          </ul>
          <div className="center gray-2 h6 py2">{this.state.stages[this.state.activeStage]['name']} stage</div>
        </div>
      </div>
    )
  },

  renderProgress: function() {
    let items = this.state.stages[this.state.activeStage].items
    var progress = 0
    if (items) {
      progress = _.reduce(items, function(m, x){ return x.complete ? m + 1 : m}, 0) / items.length * 100
    }

    return (
      <div className="p2">
        <div className="center h5 bold px2">{this.state.stages[this.state.activeStage]['cta'] || this.state.stages[this.state.activeStage]['name']}</div>
        <div className="py2">
          <ProgressBar progress={progress} type="success" />
        </div>
      </div>
    )
  },

  render: function() {

    let activeChecklist = this.state.stages[this.state.activeStage];
    let complete = activeChecklist.can_progress;
    let b = this.state.buttonTexts[this.state.activeStage];
    return (
      <Tile>
        <div className="p3">
          {this.renderProgress()}
          <Checklist
            entity_type={"Idea"}
            entity={this.props.entity}
            checklistItems={activeChecklist.items}
            locked={this.state.activeStage > this.state.currentStage} 
            complete={complete}
            buttonText={b} />
        </div>
      </Tile>
    );
  }
});

module.exports = IdeaProgressWidget
