/** @jsx React.DOM */

var People = React.createClass({
  render: function(){
    return (
      <div>
        <PeopleFilter
            interestFilters={this.props.interestFilters}
            selected={this.state.selected}
            onFilter={this.onFilter} />
        <hr/>
        <p>Tip: You can use @mentions to get the attention of {this.filterLabel()} in chat or Bounties.</p>
        <hr/>
        <PeopleList
            memberships={this.state.filteredMemberships}
            selected={this.state.selected}
            onFilter={this.onFilter}
            interestFilters={this.props.interestFilters}
            currentUser={this.props.currentUser}
            updatePath={this.props.updatePath} />
      </div>
    )
  },

  componentWillMount: function() {
    this.onFilter(this.props.selected)
  },

  onFilter: function(interest) {
    var filteredMemberships = this.props.memberships;
    var self = this;

    if (interest) {
      if (this.state && this.state.selected === interest) {
        return this.onFilter()
      }

      filteredMemberships = _.filter(this.props.memberships, function filterMemberships(m) {
        if (interest === 'core') {
          return m.core_team;
        }

        return _.include(m.interests, interest)
      })
    }

    var sortedMemberships = _.sortBy(filteredMemberships, function(m) {
      return (self.props.currentUser && self.props.currentUser.id === m.user.id ?
        '-1' :
        m.core_team ? '0' : '1') +
        m.user.username.toLowerCase()
    })

    this.setState({ filteredMemberships: sortedMemberships, selected: interest });
  },

  filterLabel: function() {
    if (this.state.selected) {
      return (<span> the <a href="javascript:;">@{this.state.selected}</a> team</span>)
    } else {
      return 'these teams'
    }
  }
})

var PeopleFilter = React.createClass({
  render: function() {
    var self = this;
    var highlightAll = self.props && !self.props.selected ? 'primary': 'default';
    var highlightCore = self.props && self.props.selected === 'core' ? 'primary': 'default';

    var tags = _.map(this.props.interestFilters, function(interest){
      var label = '@' + interest;
      var highlight = self.props && self.props.selected === interest ? 'primary' : 'default';

      return (
        <a className={'btn btn-' + highlight}
            href={'#' + label}
            onClick={self.filterChanged(interest)}
            key={interest}>
          {label}
        </a>
      )
    })

    return (
      <div className="row">
        <div className="col-xs-2">
          Browse by:
        </div>
        <div className="col-xs-10 btn-group btn-group-sm">
            <a className={'text-muted btn btn-' + highlightAll}
                onClick={this.clearInterest}
                style={{cursor: 'pointer'}}>
              All
            </a>
            <a className={'text-muted btn btn-' + highlightCore}
                onClick={this.highlightCore}
                style={{cursor: 'pointer'}}>
              @core
            </a>
            {tags}
        </div>
      </div>
    )
  },

  filterChanged: function(interest) {
    var self = this;
    return function(e) {
      self.props.onFilter(interest)
    };
  },

  clearInterest: function(e) {
    this.props.onFilter();
  },

  highlightCore: function(e) {
    this.props.onFilter('core')
  }
})

var PeopleList = React.createClass({
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

    for (var i = 0, l = memberships.length; i < l; i += 2) {
      var leftMember = memberships[i];
      var leftUser = leftMember.user;
      var rightMember = memberships[i + 1];
      var rightUser = rightMember && rightMember.user;

      var row = (
        <div className="row"
          key={'row-' + leftUser.id + (rightUser && rightUser.id)}
          style={{
            'padding-top': '15px',
            'padding-bottom': '15px',
            'border-bottom': '1px solid #d9d9d9'
          }}>
          {this.avatar(leftUser)}
          {this.member(leftMember)}
          {this.avatar(rightUser)}
          {this.member(rightMember)}
        </div>
      )

      rows.push(row);
    }

    return rows;
  },

  avatar: function(user) {
    if (!user) {
      return;
    }

    return (
      <div className="col-sm-1 col-xs-1 ">
        <a href={user.url} title={'@' + user.username}>
          <img src={user.avatar_url}
              className="avatar"
              alt={'@' + user.username}
              width="30"
              height="30" />
        </a>
      </div>
    );
  },

  member: function(member) {
    if (!member) {
      return;
    }

    var user = member.user;

    return (
      <div className="col-sm-5 col-xs-5">
        <p>
          <strong>
            <a href={user.url} title={'@' + user.username}>
              {user.username}
            </a>
          </strong>

          <span className="text-muted text-small">
            {user.bio ? '—' + user.bio : ''}
          </span>
        </p>

        <div>
          <BioEditor
              member={member}
              currentUser={this.props.currentUser}
              updatePath={this.props.updatePath}
              originalBio={member.bio}
              interestFilters={this.props.interestFilters}
              updateSkills={this.updateSkills}
              selected={this.props.selected} />
        </div>
      </div>
    )
  },

  updateSkills: function() {}
})

var BioEditor = React.createClass({
  componentWillMount: function() {
    this.setState({
      currentUser: this.props.currentUser,
      member: this.props.member,
      editing: false
    })
  },

  componentDidUpdate: function() {
    this.setUpChosen()
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
            {this.state.editing ? this.saveButton() : this.editButton()}
          </div>
          <p style={{position: 'absolute', bottom: '0px'}}>
            <ul className="list-inline">
              {this.skills(member)}
            </ul>
          </p>
        </div>
      )
    }

    return (
      <div>
        <p key={'b-' + member.user.id}>
          {member.bio}
        </p>
        <p style={{position: 'absolute', bottom: '0px'}}>
          <ul className="list-inline">
            {this.skills(member)}
          </ul>
        </p>
      </div>
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
      var highlight = self.props && self.props.selected === interest ? 'primary' : 'default';

      return (
        <li>
          <span className={'label label-' + highlight}
              key={membership.user.id + '-' + interest}>
            {label}
          </span>
        </li>
      );
    });
  },

  editButton: function() {
    return (
      <div className="btn-group btn-group-sm">
        <a className="btn btn-link" style={{'box-shadow': 'none'}} onClick={this.makeEditable}>Edit profile</a>
      </div>
    )
  },

  saveButton: function() {
    return (
      <div className="btn-group btn-group-sm">
        <a className="btn btn-link" style={{'box-shadow': 'none'}} onClick={this.saveBio}>Save</a>
        <a className="btn btn-link" style={{'box-shadow': 'none'}} onClick={this.makeUneditable}>Cancel</a>
      </div>
    )
  },

  makeEditable: function(e) {
    var member = this.state.member;
    var bio = this.props.originalBio;

    var editableBio = (
      <div>
        <textarea className="form-control bio-editor" rows="2" defaultValue={bio}></textarea>
        <select
            name="membership[interest_ids][]"
            data-placeholder=" "
            className="form-control chosen-select"
            id="join-interests"
            multiple="true">
          {this.skillsOptions()}
        </select>
      </div>
    )

    member.bio = editableBio;

    this.setState({ member: member, editing: true })
  },

  skillsOptions: function() {
    var options = _.map(this.props.interestFilters, function(interest) {
      return <option value={interest}>{'@' + interest}</option>
    })

    return options
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

    var member = this.state.member;

    if (member.interests && member.interests.length) {
      chosenSelect.val(member.interests)
      chosenSelect.trigger('chosen:updated')
    }
  },

  makeUneditable: function(e) {
    var member = this.state.member;

    member.bio = this.props.originalBio;

    this.setState({ member: member, editing: false });
  },

  saveBio: function(e) {
    var self = this;
    var bio = $('.bio-editor').val();
    var interests = $('#join-interests').val()
    var member = this.state.member;

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
        self.setState({ member: member, editing: false })
      },
      error: function(data, status) {
        console.error(status);
      }
    })
  }
})
