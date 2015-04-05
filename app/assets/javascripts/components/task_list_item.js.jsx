const DiscussionStore = require('../stores/discussion_store')
const ProductStore = require('../stores/product_store')
const TaskListActions = require('../actions/task_list_actions')
const UserStore = require('../stores/user_store')

module.exports = React.createClass({
  displayName: 'TaskListItem',

  getInitialState() {
    return {
      checked: this.props.checked,
      canUpdate: this._canUpdate()
    }
  },

  render() {
    return <div onClick={this.handleClick} className="pointer">
      <input type="checkbox" checked={this.state.checked} disabled={!this.state.canUpdate} />
      <span className="checkbox-label" dangerouslySetInnerHTML={{__html: ' ' + this.props.body}}>
      </span>
    </div>
  },

  componentDidMount() {
    DiscussionStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    DiscussionStore.removeChangeListener(this._onChange)
  },

  componentDidUpdate(props, state) {
    if (state.checked != this.state.checked) {
      TaskListActions.updateTask(this.props.index, this.props.body, this.state.checked)
    }
  },

  handleClick(e) {
    if (!this.state.canUpdate) { return }

    // don't change check state if the target clicked was an anchor link
    if (e.target.tagName === 'A') { return }

    this.setState({
      checked: !this.state.checked
    })
  },

  _canUpdate() {
    return ProductStore.isCoreTeam(UserStore.getUser()) || DiscussionStore.canUpdate()
  },

  _onChange() {
    this.setState({
      canUpdate: this._canUpdate()
    })
  }
})
