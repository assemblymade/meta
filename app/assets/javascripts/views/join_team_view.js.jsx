/** @jsx React.DOM */

var JoinTeam = React.createClass({
  componentWillMount: function() {
    this.setState({ count: this.props.count, is_member: this.props.is_member })
  },

  render: function() {
    return (
      <div className="toggler">
        <a className="toggler-btn btn btn-primary" href="#" onClick={this.click()}>
          <span className="glyphicon glyphicon-user"></span>
          {this.label()}
        </a>
        <div className="badge toggler-badge">
          {this.state.count}
        </div>
      </div>
    )
  },

  label: function() {
    return this.state.is_member ? 'Leave Team' : 'Join Team';
  },

  click: function() {
    return this.state.is_member ? this.onLeave : this.onJoin;
  },

  handleJoinOrLeave: function(url, newState, method) {
    var self = this;
    var currentState = this.state;
    this.setState(newState);

    $.ajax({
      url: url,
      method: method,
      success: function(data) {},
      error: function(jqxhr, status) {
        self.setState(currentState);
        console.error(status)
      }
    })
  },

  onJoin: function() {
    this.handleJoinOrLeave(
      this.props.join_path,
      { count: (this.state.count + 1), is_member: true },
      'POST'
    );
  },

  onLeave: function() {
    this.handleJoinOrLeave(
      this.props.leave_path,
      { count: (this.state.count - 1) , is_member: false },
      'DELETE'
    );
  }
})
