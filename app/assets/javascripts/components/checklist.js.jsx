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
          <span  onClick={this.setOpenItem.bind(null, index)} className="ml2">{item.title} 
            <span className="fa fa-remove ml1 gray-2" />
          </span>

          <input className="col-xs-12" name={item.editable_type} type="text" ref="editedData" />
          <br />
          <Button action={this.sendUpdate.bind(null, item.editable_type, this.props.entity.path)}>{item.editable_button_text}</Button>
        </div>
      )
    }
    else {
      return (
        <div style={{display:"inline"}}>
          <span onClick={this.setOpenItem.bind(null, index)} className="ml2">{item.title}
            <span className="fa fa-pencil-square-o ml1 gray-2" />
          </span>
        </div>
      )
    }
  },

  renderProgressButton: function() {
    var currentUser = UserStore.getUser();
    var isOwner = (currentUser.id === this.props.entity.user.id)
    if (this.props.locked) {
      var buttonAction = null
    } else {
      var buttonAction = function () {
          window.location = '/create?pitch=' + this.props.entity.name + '&idea_id=' + this.props.entity.id + '&name=' + this.props.entity.tentative_name;
        }.bind(this)
    }

    if (currentUser && (currentUser.staff || isOwner)) {
      return (
        <div>
          <hr />
          <Button type="primary" block="true" action={buttonAction}>
            <Icon icon="lock" fw="true" />
            {this.props.buttonText}
          </Button>
        </div>
      )
    }
  },

  renderChecklistItemsNew: function() {
    return (
      _.map(this.props.checklistItems, function(item, index) {
        if (item.complete && !this.props.locked) {
          return (
            <li className="py1">
              <div className="left mr2 green">
                <Icon icon="check" fw={true} />
              </div>
              <span className="ml2">
                {item.name}<br />
                <small className="gray-2 ml4">{item.subtext}</small>
              </span>
            </li>
          )
        }
        else {
          return (
            <li className="py1">
              <div className="left mr2 gray-2">
                <Icon icon={this.props.locked ? 'lock' : 'minus'} fw={true} />
              </div>
              <span className="ml2">
                {item.name}<br />
                <small className="gray-2 ml4">{item.subtext}</small>
              </span>
            </li>
          )
        }
      }.bind(this))
    )
  },

  renderChecklistItems: function() {
    var currentUser = UserStore.getUser();
    var isOwner = (currentUser.id === this.props.entity.user.id)
    return (
      _.map(this.state.checklistItems, function(item, index) {
        if (item.state) {
          return (
            <li className="py1">
              <div className="left mr2 green">
                <Icon icon="check" fw={true} />
              </div>
              { item.editable && isOwner ? this.renderInputForm(item, index) :
                <span className="ml2">
                  {item.title}<br />
                  <small className="gray-2 ml4">{item.smalltext}</small>
                </span>
              }
            </li>
          )
        }
        else {
          return (
            <li className="py1">
              <div className="left mr2 gray-2">
                <Icon icon="minus" fw={true} />
              </div>
              { item.editable && isOwner ? this.renderInputForm(item, index) :
                <span className="ml2">
                  {item.title}<br />
                  <small className="gray-2 ml4">{item.smalltext}</small>
                </span>
              }
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
    var currentUser = UserStore.getUser();
    var isOwner = (currentUser.id === this.props.entity.user.id)
    return (
      <div>
        <h5 className="mt0 caps gray-1 center">
          { isOwner ? "Move your idea forward" : "Move this idea forward" }
        </h5>
        <div className="p3 py0">
          <ol className="list-reset">
            {this.renderChecklistItemsNew()}
          </ol>
        </div>
        {this.renderProgressButton()}
      </div>
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
