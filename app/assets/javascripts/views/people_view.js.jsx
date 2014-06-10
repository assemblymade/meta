/** @jsx React.DOM */

var People = React.createClass({
  getInitialState: function() {
    return { filteredMemberships: this.props.memberships }
  },

  render: function(){

    return (
      <div>
        <PeopleFilter interestFilters={this.props.interestFilters} onFilter={this.onFilter} />
        <PeopleList memberships={this.state.filteredMemberships} onFilter={this.onFilter} />
      </div>
    )
  },

  onFilter: function(interest) {
    var filteredMemberships = this.props.memberships;

    if (interest != 'all') {
      filteredMemberships = _.filter(this.props.memberships, function filterMemberships(m) {
        return _.include(m.interests, interest)
      })
    }

    this.setState({ filteredMemberships: filteredMemberships });
  }
})

var PeopleFilter = React.createClass({
  render: function() {
    var self = this
    var options = _.map(this.props.interestFilters, function(interest){
      return (
        <option value={interest}>@{interest}</option>
      )
    })

    return (
      <div className="page-header-meta">
        Filter By:
        <select onChange={self.filterChanged.bind(self)}>
          <option value="all">@all</option>
          {options}
        </select>
      </div>
    )
  },

  filterChanged: function(e) {
    this.props.onFilter(e.target.value)
  }
})

var PeopleList = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="list-group list-group-breakout list-group-padded">
          {this.rows(this.props.memberships)}
        </div>
      </div>
    )
  },

  rows: function(memberships) {
    var self = this;
    return _.map(memberships, function(membership){
      // <%= 'list-group-item-highlight' if membership.core_team? %>
      var user = membership.user;
      var avatarStyle = {
        width: 60,
        height: 60,
        alt: '@' + user.username
      }

      return (
        <div className="list-group-item">
          <div className="row">
            <div className="col-sm-2 col-xs-2">
              <a href={user.url} title={'@' + user.username}>
                <img src={user.avatar_url} className="avatar img-circle" style={avatarStyle} />
              </a>
            </div>
            <div className="col-sm-10 col-xs-10">
              <a href={user.url} title={'@' + user.username}>
                {user.username}
              </a>
              <p>
                {membership.bio}
              </p>
              <p>
                {self.skills(membership)}
              </p>
            </div>
          </div>
        </div>
      )
    })
  },

  skills: function(membership) {
    var self = this;

    return _.map(membership.interests, function mapInterests(interest) {
      var label = '@' + interest;
      return (<a href={'#' + label} onClick={self.handleFilter(interest)}>{label}</a>);
    });
  },

  handleFilter: function(interest) {
    var self = this;
    return function(e) {
      console.log(interest, self.props.onFilter)
      self.props.onFilter(interest);
    }
  }
})
