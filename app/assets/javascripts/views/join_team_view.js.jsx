/** @jsx React.DOM */

var JoinTeam = React.createClass({
  componentWillMount: function() {
    this.setState({ count: this.props.count, is_member: this.props.is_member })
  },

  render: function() {
    return (
      <div className="toggler">
        {this.label()}
        <div className="badge toggler-badge">
          {this.state.count}
        </div>
      </div>
    )
  },

  setUpPopover: function(node) {
    node.popover({
      trigger: 'click',
      placement: 'bottom',
      html: true,
      container: 'body',
      content: function() {
        return $('#join-team-template').html()
      }
    })

    this.listenForJoin(node)
  },

  listenForJoin: function(node) {
    var self = this

    $(node).click(function(e) {
      if (!app.currentUser()) {
        return app.redirectTo('/login')
      }

      self.setUpChosen()
    })
  },

  setUpChosen: function() {
    var chosenSelect = $('.chosen-select')

    chosenSelect.chosen({
      create_option: function(term) {
        var chosen = this

        term = term.replace(/[^\w-]+/g, '').toLowerCase()

        if (term === 'core') {
          return;
        }

        chosen.append_option({
          value: term,
          text: '@' + term
        })
      },

      persistent_create_option: true,
      skip_no_results: true,
      search_contains: true,
      create_option_text: 'Add interest'
    })

    this.setUpEditor(chosenSelect)
  },

  setUpEditor: function(chosenSelect) {
    // TODO: Move default bio someplace saner.
    var bio = "Hi! My name is Maeby. I do all of my design in Dreamweaver. What's version control?"
    var membership = this.props.membership

    if (membership) {
      if (membership.bio) {
        bio = membership.bio
      }

      chosenSelect.val(membership.interests)
      chosenSelect.trigger('chosen:updated')
    }

    $('#join-bio-editor').attr({placeholder: bio})
  },

  componentDidMount: function() {
    var node = $('#js-join-popover')

    if (node.length) {
      this.setUpPopover(node)
    }
  },

  componentDidUpdate: function() {
    this.componentDidMount()
  },

  label: function() {
    if (this.state.is_member) {
      return (
        <a className={"toggler-btn btn btn-" + this.button()} style={{width: '120px', 'max-width': '120px'}} onClick={this.click()}>
          <span className="glyphicon glyphicon-user" style={{'margin-right': '2px'}}></span>
          Leave Team
        </a>
      )
    }

    return (
      <a className={"toggler-btn btn btn-" + this.button()} style={{width: '120px', 'max-width': '120px'}} onClick={this.click()}
          role="button"
          id="js-join-popover">
        <span className="glyphicon glyphicon-user" style={{'margin-right': '2px'}}></span>
        Join Team
      </a>
    )
  },

  button: function() {
    if (this.state.is_member) {
      if (this.props.membership.core_team) {
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
    )
  },

  onLeave: function(e) {
    if (this.props.membership.core_team) {
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
  }
})
