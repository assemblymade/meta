const Tile = require('./ui/tile.js.jsx');
const Button = require('./ui/button.js.jsx');
const ChecklistStore = require('../stores/checklist_store');
const ChecklistActions = require('../actions/checklist_actions');
const UserStore = require('../stores/user_store');

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

sendUpdate: function(editable_type, path) {
    var data = {
      idea: {
      }
    };
    data['idea'][editable_type] = this.refs.editedData.getDOMNode().value
    $.ajax({
      url: path,
      method: 'PATCH',
      data:  data,
      success: function() {
        window.location.reload(true)
      },
      error: function(jqxhr, status) {
        console.error(status);
      }
    })
  },

  renderInputForm: function(item, index) {
    if (this.state.openListItem === index) {
      return (
        <div style={{display:"inline"}}>
          <span  onClick={this.setOpenItem.bind(null, index)} className="ml2">{item.title}</span>

          <input name={item.editable_type} type="text" ref="editedData" />
          <Button action={this.sendUpdate.bind(null, item.editable_type, this.props.entity.path)}>{item.editable_button_text}</Button>
        </div>
      )
    }
    else {
      return (
        <div style={{display:"inline"}}>
          <span onClick={this.setOpenItem.bind(null, index)} className="ml2">{item.title}</span>
        </div>
      )
    }
  },

  renderProgressButton: function() {
    var currentUser = UserStore.getUser();
    var isOwner = (currentUser.id === this.props.entity.user.id)
    if (currentUser && currentUser.staff && isOwner) {
      return (
        <div className="center mb2">
          <Button action={ function () {
              window.location = '/create?pitch=' + this.props.entity.name + '&idea_id=' + this.props.entity.id + '&name=' + this.props.entity.tentative_name;
            }.bind(this)
          }>Make it a Product</Button>
        </div>

      )
    }

  },

  renderChecklistItems: function() {
    console.log(this.state.checklistItems)
    var currentUser = UserStore.getUser();
    var isOwner = (currentUser.id === this.props.entity.user.id)
    return (
      _.map(this.state.checklistItems, function(item, index) {
        if (item.state) {
          return (
            <li>
              <span className="fa green fa-check-square-o" />
              { item.editable && isOwner ? this.renderInputForm(item, index) :
                <span className="ml2">{item.title}</span>
              }
              <br/>
              <small className="gray-4 ml2">{item.smalltext}</small>
            </li>
          )
        }
        else {
          return (
            <li>
              <span className="fa gray fa-square-o" type="checkbox" />
              { item.editable ? this.renderInputForm(item, index) :
                <span className="ml2">{item.title}
                </span>
              }
              <br/>
              <small className="gray-4 ml2">{item.smalltext}</small>

            </li>
          )
        }
      }.bind(this))
    )
  },

  nextStage: function() {
    var data = {};
    var path = this.props.entity.path;
    $.ajax({
      url: path,
      method: 'PATCH',
      data: data,
      success: function() {
        window.location.reload(true)
      },
      error: function(jqxhr, status) {
        console.error(status);
      }
    });
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
        {this.renderProgressButton()}
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
