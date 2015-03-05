

(function() {
  var PeopleStore = require('../stores/people_store');
  var PeoplePageMixin = require('../mixins/people_page.js.jsx');

  var People = React.createClass({
    render: function() {
      if (!this.state) return <div />;

      if (this.props.coreOnly) {
        return (
          <PeopleList
            memberships={this.state.filteredMemberships}
            selected={this.state.selected}
            onFilter={this.onFilter}
            interestFilters={this.props.interestFilters}
            currentUser={this.props.currentUser}
            updatePath={this.props.updatePath}
            coreMemberships={this.props.coreMemberships} />
        );
      }

      return (
        <div>
          <PeopleList
              memberships={this.state.filteredMemberships}
              selected={this.state.selected}
              onFilter={this.onFilter}
              interestFilters={this.props.interestFilters}
              currentUser={this.props.currentUser}
              updatePath={this.props.updatePath}
              coreMemberships={this.props.coreMemberships} />
        </div>
      )
    },

    componentDidMount: function() {
      PeopleStore.setPeople(this.props.memberships);
      this.onFilter(this.props.selected);
    },

    onFilter: function(interest) {
      var filteredMemberships = PeopleStore.getPeople();
      var self = this;

      if (interest) {
        if (this.state && this.state.selected === interest) {
          return this.onFilter()
        }

        filteredMemberships = _.filter(filteredMemberships, function filterMemberships(m) {
          if (interest === 'core') {
            return m.core_team;
          }

          return _.include(m.interests, interest)
        })
      }

      var sortedMemberships = _.sortBy(filteredMemberships, function(m) {
        if (!m) return;

        return (self.props.currentUser && self.props.currentUser.id === m.user.id ?
          '-1' :
          m.core_team ? '0' : '1') +
          m.user.username.toLowerCase()
      });

      this.setState({ filteredMemberships: sortedMemberships, selected: interest });
    },

    filterLabel: function() {
      if (this.state.selected) {
        return (<span> the <a style={{cursor: 'pointer'}}>@{this.state.selected}</a> team</span>)
      } else {
        return 'these teams'
      }
    }
  })

  var PeopleList = React.createClass({
    mixins: [PeoplePageMixin],

    render: function() {
      return (
        <div className="list-group list-group-breakout list-group-padded">
          {this.rows(this.props.memberships)}
        </div>
      )
    },

    rows: function(memberships) {
      var self = this;
      var rows = [];

      for (var i = 0, l = memberships.length; i < l; i++) {
        var member = memberships[i];

        if (!member) {
          return;
        }

        var user = member.user;

        var row = (
          <div className="clearfix py2 border-bottom"
            key={'row-' + user.id + i}>
            <div className="left mr2">
              <Avatar user={user} size={24} />
            </div>
            <div className="overflow-hidden">
              {this.member(member)}
            </div>
          </div>
        )

        rows.push(row);
      }

      return rows;
    },

    member: function(member) {
      if (!member) {
        return;
      }

      var user = member.user;

      return (
        <div>
          <p className="omega">
            <ul className="list-inline omega pull-right">
              {this.skills(member)}
            </ul>
            <strong>
              <a href={user.url} title={'@' + user.username}>
                {user.username}
              </a>
            </strong>
          </p>
          {user.bio ? this.hasBio(user) : ''}
          <div>
            <BioEditor
                member={member}
                onFilter={this.props.onFilter}
                currentUser={this.props.currentUser}
                updatePath={this.props.updatePath}
                originalBio={member.bio}
                interestFilters={this.props.interestFilters}
                updateSkills={this.updateSkills}
                selected={this.props.selected}
            />
          </div>
          {this.coreTeamInfo(member)}
        </div>
      )
    },

    coreTeamInfo: function(member) {
      var core = this.props.coreMemberships;

      if (core) {
        for (var i = 0, l = core.length; i < l; i++) {
          var c = core[i];

          if (c.user_id === member.user.id) {
            return (
              <span className="gray-2">{'Core team since ' + _parseDate(c.created_at)}</span>
            )
          }
        }
      }
    },

    hasBio: function(user) {
      return (
        <p className="gray-2 text-small">
          {user.bio ? user.bio : ''}
        </p>
      )
    },

    skills: function(membership) {
      var self = this;

      if (membership.core_team && membership.interests.indexOf('core') < 0) {
        membership.interests.push('core')
      }

      membership.interests.sort();

      return _.map(membership.interests, function mapInterests(interest) {
        var label = '@' + interest;
        var highlight = self.props && self.props.selected === interest ? 'primary' : 'outlined';

        return (
          <li key={membership.user.id + '-' + interest}>
            <span className={'label label-' + highlight}
                style={{cursor: 'pointer'}}
                onClick={self.props.onFilter.bind(null, interest)}>
              {label}
            </span>
          </li>
        );
      });
    }
  });

  var BioEditor = React.createClass({
    componentWillMount: function() {
      this.setState({
        currentUser: this.props.currentUser,
        member: this.props.member,
        originalBio: this.props.originalBio,
        editing: false
      });
    },

    componentDidMount: function() {
      var params = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

      if (!this.introduced && params.indexOf('introduction=true') >= 0) {
        this.introduced = true;
        this.makeEditable();
      }
    },

    render: function() {
      var currentUser = this.state.currentUser;
      var member = this.state.member;

      if (!member || !currentUser) {
        return <div />;
      }

      if (currentUser.id === member.user.id) {
        return (
          <div>
            <div className="js-edit-bio" key={'b-' + currentUser.id}>
              {member.bio}
              &nbsp;{this.state.editing ? this.saveButton() : this.editButton()}
            </div>
          </div>
        )
      }

      return (
        <div key={'b-' + member.user.id}>
          {member.bio}
        </div>
      )
    },

    editButton: function() {
      return (
        <a className="text-small" style={{ cursor: 'pointer' }} onClick={this.makeEditable}>&mdash;&nbsp;Update Intro</a>
      )
    },

    saveButton: function() {
      return (
        <div className="right-align" style={{'margin-top':'16px'}}>
          <a className="btn btn-default btn-sm" onClick={this.makeUneditable} style={{'margin-right' : '8px'}}>Cancel</a>
          <a className="btn btn-primary btn-sm" onClick={this.updateBio}>Save</a>
        </div>
      )
    },

    makeEditable: function(e) {
      $('#edit-membership-modal').modal('show');

      $('#modal-bio-editor').val(this.state.originalBio);
    },

    skillsOptions: function() {
      var options = _.map(this.props.interestFilters, function(interest) {
        if (interest === 'core') {
          return;
        }
        return (<option value={interest}>{'@' + interest}</option>);
      });

      return options;
    },

    makeUneditable: function(e) {
      var member = this.state.member;
      var bio = this.state.originalBio || this.props.originalBio;

      this.save(member, bio, member.interests);
    },

    updateBio: function(e) {
      var self = this;
      var bio = $('.bio-editor').val();
      var interests = $('#join-interests').val();
      var member = this.state.member;

      this.save(member, bio, interests);
    },

    save: function(member, bio, interests) {
      var self = this;

      $.ajax({
        url: this.props.updatePath,
        method: 'PATCH',
        data: {
          membership: {
            bio: bio,
            interests: interests
          }
        },
        success: function(data) {
          member.bio = data.bio
          member.interests = data.interests
          self.setState({ member: member, editing: false, originalBio: data.bio })
        },
        error: function(data, status) {
          console.error(status);
        }
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = People;
  }

  window.People = People;

  function _parseDate(date) {
    var parsedDate = new Date(date);

    return (parsedDate.getMonth() + 1).toString() + '-' + parsedDate.getDate().toString() + '-' + parsedDate.getFullYear().toString();
  }
})();
