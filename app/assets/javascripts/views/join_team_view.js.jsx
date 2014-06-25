/** @jsx React.DOM */

//= require dispatcher

var JoinTeam = React.createClass({
  componentWillMount: function() {
    this.setState({ count: this.props.count, is_member: this.props.is_member })
  },

  render: function() {
    return (
      <div className="toggler">
        {this.label()}
        <div className="badge toggler-badge">
          <a href={this.props.join_path}>{this.state.count}</a>
        </div>
      </div>
    )
  },

  setUpPopover: function(node) {
    node.popover({
      trigger: 'manual',
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

      if (!self.state.is_member) {
        $(this).popover('show')
        self.setUpChosen()
      } else {
        $(this).popover('hide')
      }
    })

    $(document).scroll(function(e) {
      $(node).popover('hide');
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
    // TODO: Move default bio and interests someplace saner.
    var defaultBio = "Hi! My name is Maeby. I do all of my design in Dreamweaver, and I've never stopped loving .NET."
    var defaultInterests = ['code', 'design'];
    var membership = this.props.membership;
    var bioEditor = $('#join-bio-editor');

    if (membership) {
      if (membership.bio) {
        bio = membership.bio;
        $(bioEditor).val(bio);

        // If the user has entered a bio, assume that s/he
        // has also entered his/her interests
        chosenSelect.val(membership.interests);
      } else {
        chosenSelect.val(defaultInterests);
      }

      chosenSelect.trigger('chosen:updated');
    }

    bioEditor.attr({placeholder: defaultBio})
    this.listenForChanges(bioEditor)
  },

  listenForChanges: function(bioEditor) {
    var joinButton = $('#join-intro-button')
    var startingVal = bioEditor.val()

    if (startingVal.length >= 2) {
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
        <a className={"toggler-btn btn btn-" + this.button()} data-toggle="popover" style={{width: '120px', 'max-width': '120px'}} onClick={this.click()}>
          <i className="icon-user-unfollow" style={{'margin-right': '6px'}}></i>
          Leave Team
        </a>
      )
    }

    return (
      <a className={"toggler-btn btn btn-" + this.button()} data-toggle="popover" style={{width: '120px', 'max-width': '120px'}} onClick={this.click()}
          role="button"
          id="js-join-popover">
        <i className="icon-user-follow" style={{'margin-right': '6px'}}></i>
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
    )

    Dispatcher.dispatch({
      action: 'addPerson',
      data: this.props.membership,
      event: 'people:change'
    })
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
      data: this.props.membership.user.username,
      event: 'people:change'
    });
  }
})
