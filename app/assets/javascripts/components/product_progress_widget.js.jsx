'use strict';

const ChecklistStore = require('../stores/checklist_store');
const ChecklistActions = require('../actions/checklist_actions');
const Button = require('./ui/button.js.jsx');
const Tile = require('./ui/tile.js.jsx');
const ProgressBar = require('./ui/progress_bar.js.jsx');
const UserStore = require('../stores/user_store');

const ProductTaskList = React.createClass({
  getDefaultProps: function () {
    return (
      {tasks: []}
    )
  },

  renderTasks: function() {
    return (
      _.map(this.props.tasks, function(task, index) {
          var complete = (task.state == 'closed' || task.state == 'resolved')
          var classes = React.addons.classSet(
            {
              'left': true,
              'mr2': true,
              'green': complete,
              'gray-2': !complete
            }
          )
          return (
            <li className="clearfix py1">
              <div className={classes}>
                <Icon icon={complete ? 'check' : 'minus'} fw={true} />
              </div>
              <div className="overflow-hidden">
                <a href={task.url}>{task.title}</a>
              </div>
            </li>
          )
        })
    )
  },

  render: function() {
    return (
      <ol className="list-reset">
        {this.renderTasks()}
      </ol>
    )
  }
});

const ProductProgressWidget = React.createClass({
  propTypes: {
    product: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    ChecklistStore.addChangeListener(this.getStateFromStore);
    ChecklistActions.fetchChecklists(this.props.product)
  },

  componentWillUnmount: function() {
    ChecklistStore.removeChangeListener(this.getStateFromStore);
  },

  getStateFromStore: function() {
    let data = ChecklistStore.fetchChecklistItems();
    this.setState({
      tasks: data.tasks,
      progress: data.percent_completion
    });
  },

  getInitialState: function() {
    return (
      { tasks: [], progress: 0 }
    )
  },

  renderProgress: function() {
    return (
      <div className="p2">
        <div className="center h5 gray-2 px2">Complete these tasks to make your product public</div>
        <div className="py2">
          <ProgressBar progress={this.state.progress} type="success" />
        </div>
      </div>
    )
  },

  render: function() {
    if (this.state.tasks.length > 0) {
      return (
        <div className="mb3">
          <Tile>
            <div className="p3">
              {this.renderProgress()}
              <ProductTaskList tasks={this.state.tasks} />
            </div>
          </Tile>
        </div>
      )
    } else {
      return null
    }
  }
});

module.exports = ProductProgressWidget
