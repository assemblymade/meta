const Tile = require('./ui/tile.js.jsx');
const Button = require('./ui/button.js.jsx');
const ChecklistStore = require('../stores/checklist_store');
const ChecklistActions = require('../actions/checklist_actions');

var Checklist = React.createClass({

  propTypes: {
    entity_type: React.PropTypes.string,
    entity_id: React.PropTypes.string.isRequired
  },

  componentDidMount: function() {
    ChecklistStore.addChangeListener(this.getStateFromStore);
    this.fetchInitialChecklistItems(this.props.entity_id);
  },

  componentWillUnmount: function() {
    ChecklistStore.removeChangeListener(this.getStateFromStore);
  },

  getInitialState: function() {
    return {
      checklistItems: ChecklistStore.fetchChecklistItems()
    };
  },

  renderChecklistItems: function() {
    return (
      _.map(this.state.checklistItems, function(item) {
        if (item.state === "passed") {
          return (
            <li>
              <span className="fa green fa-check-square-o" />
              <span className="ml2">{item.type}</span>
            </li>
          )
        }
        else {
          return (
            <li>
              <span><input type="checkbox"/></span>
              <span className="ml2">{item.type}</span>
              <small className="gray-4 ml2">{item.description}</small>
            </li>
          )
        }
      })
    )
  },

  render: function() {
    return (
      <Tile>
        <h4 className="center">Move Your Idea Forward</h4>
        <div className="p3">
           <ul style={{listStyle: 'none'}}>
            {this.renderChecklistItems()}
           </ul>
        </div>

        <div className="center mb2">
          <Button>Progress to Recruitment</Button>
        </div>

      </Tile>
    )
  },

  fetchInitialChecklistItems: function(entity_id) {
    ChecklistActions.fetchIdeaChecklists(entity_id)
  },

  getStateFromStore: function() {
    this.setState({
      checklistItems: ChecklistStore.fetchChecklistItems()
    });
  },

})

module.exports = Checklist
