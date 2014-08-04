/** @jsx React.DOM */

var Dispatcher = require('../dispatcher');

(function() {
  var JoinTeam = React.createClass({
    componentWillMount: function() {
      this.setState({
        count: this.props.count,
        is_member: this.props.is_member
      });
    },

    render: function() {
      return (
        <div className="toggler toggler-sm">
          {this.label()}
          <div className="toggler-badge">
            <a href={this.props.join_path}>{this.state.count}</a>
          </div>
        </div>
      )
    },

    listenForJoin: function(node) {
      var self = this

      $(node).click(function(e) {
        if (!app.currentUser()) {
          return app.redirectTo('/login')
        }
      })

      $(document).scroll(function(e) {
        $(node).popover('hide');
      })
    },

    listenForChanges: function(bioEditor) {
      var joinButton = $('#join-intro-button')
      var startingVal = bioEditor.val()

      if (startingVal && startingVal.length >= 2) {
        joinButton.removeClass('disabled')
      }

      bioEditor.on('keyup', function textEntered(e) {
        var val = bioEditor.val().trim()

        if (val.length >= 2) {
          joinButton.removeClass('disabled')
        } else if (val.length < 2) {
          joinButton.addClass('disabled')
        }
      })
    },

    label: function() {
      if (this.state.is_member) {
        return (
          <a className={"toggler-btn btn btn-" + this.button()} data-toggle="popover" onClick={this.click()}>
            <i className="icon icon-user-unfollow" style={{'margin-right': '5px',}}></i>
            Leave Team
          </a>
        )
      }

      return (
        <a className={"toggler-btn btn btn-" + this.button()} data-toggle="popover"  onClick={this.click()}
            role="button"
            id="js-join-popover">
          <i className="icon icon-user-follow" style={{'margin-right': '5px'}}></i>
          Join Team
        </a>
      )
    },

    button: function() {
      if (this.state.is_member) {
        if (this.props.membership && this.props.membership.core_team) {
          return 'default disabled'
        } else {
          return 'default inactive'
        }
      }

      return 'primary'
    },

    click: function() {
      return this.state.is_member ? this.onLeave : this.onJoin
    },

    handleJoinOrLeave: function(url, newState, method, callback) {
      var self = this
      var currentState = this.state
      this.setState(newState)

      $.ajax({
        url: url,
        method: method,
        success: function(data) {
          callback(null, data)
        },
        error: function(jqxhr, status) {
          self.setState(currentState)
          callback(new Error(status))
        }
      })
    },

    onJoin: function(e) {
      this.handleJoinOrLeave(
        this.props.join_path,
        { count: (this.state.count + 1), is_member: true },
        'POST',
        function joined(err, data) {
          if (err) {
            return console.error(err);
          }

          var product = app.currentAnalyticsProduct()
          analytics.track('product.team.joined', product)
        }
      );

      $('#edit-membership-modal').modal('show');

      Dispatcher.dispatch({
        action: 'addPerson',
        data: { user: this.props.membership },
        event: 'people:change'
      });
    },

    onLeave: function(e) {
      if (this.props.membership && this.props.membership.core_team) {
        return
      }

      this.handleJoinOrLeave(
        this.props.leave_path,
        { count: (this.state.count - 1) , is_member: false },
        'DELETE',
        function left(err, data) {
          if (err) {
            return console.error(err);
          }

          var product = app.currentAnalyticsProduct()
          analytics.track('product.team.left', product)
        }
      )

      Dispatcher.dispatch({
        action: 'removePerson',
        data: { user: this.props.membership.user },
        event: 'people:change'
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = JoinTeam;
  }

  window.JoinTeam = JoinTeam;
})();
