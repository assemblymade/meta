const Tile = require('./ui/tile.js.jsx');
const Button = require('./ui/button.js.jsx');
const ChecklistStore = require('../stores/checklist_store');
const ChecklistActions = require('../actions/checklist_actions');

var Checklist = React.createClass({

  propTypes: {
    entity_type: React.PropTypes.string,
    entity: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    ChecklistStore.addChangeListener(this.getStateFromStore);
    this.fetchInitialChecklistItems(this.props.entity.id);
  },

  componentWillUnmount: function() {
    ChecklistStore.removeChangeListener(this.getStateFromStore);
  },

  getInitialState: function() {
    return {
      checklistItems: ChecklistStore.fetchChecklistItems(),
      openListItem: -1
    };
  },

  setOpenItem: function(index) {
    if (this.state.openListItem === index) {
      this.setState({openListItem: -1})
    }
    else {
      this.setState({openListItem: index});
    }
  },

  renderInputForm: function(item, index) {
    if (this.state.openListItem === index) {
      return (
        <div>
          <span  onClick={this.setOpenItem.bind(null, index)} className="ml2">{item.title}</span>
          <form><input action={this.props.entity.path + "/update"} method="PATCH" name="name" type="text"></input></form>
        </div>
      )
    }
    else {
      return (
        <span onClick={this.setOpenItem.bind(null, index)} className="ml2">{item.title}</span>
      )
    }
  },

  renderChecklistItems: function() {
    console.log(this.state.checklistItems)
    return (
      _.map(this.state.checklistItems, function(item, index) {
        if (item.state) {
          return (
            <li>
              <span className="fa green fa-check-square-o" />
              { item.editable ? this.renderInputForm(item, index) :
                <span className="ml2">{item.title}</span>
              }

              <small className="gray-4 ml2">{item.smalltext}</small>
            </li>
          )
        }
        else {
          return (
            <li>
              <span className="fa gray fa-square-o" type="checkbox" />
              <span className="ml2">{item.title}</span>
              <small className="gray-4 ml2">{item.smalltext}</small>
            </li>
          )
        }
      }.bind(this))
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
