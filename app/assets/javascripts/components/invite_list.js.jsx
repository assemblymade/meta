

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

(function() {
  var InviteList = React.createClass({
    render: function() {
      var inviteNodes = _.map(this.props.invites, function(invite) {
        return <InviteEntry key={invite.id} id={invite.id} invitee_email={invite.invitee_email} invitee={invite.invitee} />
      })
      return (
        <div className="panel panel-default">
          <ul className="list-group list-group-breakout small omega">
            <ReactCSSTransitionGroup transitionName="invite">
              {inviteNodes}
            </ReactCSSTransitionGroup>
          </ul>
        </div>
      )
    },
  });

  var InviteEntry = React.createClass({
    render: function() {
      return (
        <li className="list-group-item" key={this.props.id}>
        {this.label()}
        </li>
      )
    },

    label: function() {
      if (this.props.invitee) {
        return <span>Invited <a href={this.props.invitee.url}>@{this.props.invitee.username}</a></span>
      } else {
        return <span>Emailed {this.props.invitee_email}</span>
      }

    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InviteList;
  }

  window.InviteList = InviteList;
})();
