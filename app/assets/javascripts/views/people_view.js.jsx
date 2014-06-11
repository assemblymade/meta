/** @jsx React.DOM */

var People = React.createClass({
  render: function(){
    return (
      <div>
        <PeopleFilter interestFilters={this.props.interestFilters} selected={this.state.selected} onFilter={this.onFilter} />
        <hr/>
        <PeopleList memberships={this.state.filteredMemberships} selected={this.state.selected} onFilter={this.onFilter} />
      </div>
    )
  },

  componentWillMount: function() {
    this.onFilter(this.props.selected)
  },

  onFilter: function(interest) {
    var filteredMemberships = this.props.memberships;

    if (interest) {
      if (this.state && this.state.selected === interest) {
        return this.onFilter()
      }

      filteredMemberships = _.filter(this.props.memberships, function filterMemberships(m) {
        return _.include(m.interests, interest)
      })
    }

    var sortedMemberships = _.sortBy(filteredMemberships, function(m) {
      return (m.core_team ? '0' : '1') + m.user.username.toLowerCase()
    })

    this.setState({ filteredMemberships: sortedMemberships, selected: interest });
  }
})

var PeopleFilter = React.createClass({
  render: function() {
    var self = this;
    var highlightAll = self.props && !self.props.selected ? 'primary': 'default';

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
            <a className={'text-muted btn btn-' + highlightAll} onClick={this.clearInterest} style={{cursor: 'pointer'}}>All</a>
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
        <div className="row" style={{'padding-top': '15px', 'padding-bottom': '15px', 'border-bottom': '1px solid #d9d9d9'}}>
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
      <div className="col-sm-1 col-xs-1">
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

          <span className="text-muted">
            {user.bio ? '—' + user.bio : ''}
          </span>
        </p>

        <p className="text-muted">
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
  }
})
