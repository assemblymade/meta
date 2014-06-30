/**
 * @jsx React.DOM
 *
 *= require models/user
 */

var isMemberOnline = function(member) {
  return moment(member.last_online).isAfter(moment().subtract('hour', 1))
}

var isMemberRecentlyActive = function(member) {
  return moment(member.last_online).isAfter(moment().subtract('month', 1))
}

var MEMBER_VIEW_REFRESH_PERIOD = 60 * 1000; // 1 minute

var MembersView = React.createClass({

   loadMembersFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      mimeType: 'textPlain',
      success: function(data) {
        var members = _.reduce(data, function(memo, member) {
          memo[member.id] = member
          memo[member.id].isWatcher = true
          return memo
        }, {})

        this.addMembers(members);
      }.bind(this)
    })
  },

  loadMembersFromChannel: function() {
    this.props.channel.bind('pusher:subscription_succeeded',
      _.bind(
        function(members) {
          members.each(_.bind(function(member) {
            this.addMember(member.id, member.info)
          }, this))
        },
        this
      )
    )
  },

  getInitialState: function() {
    return {
      members: {}
    }
  },

  componentDidMount: function() {
    this.loadMembersFromChannel()

    this.props.channel.bind(
      'pusher:member_added',
      _.bind(this.addMemberFromPusher, this)
    )

    this.props.channel.bind(
      'pusher:member_removed',
      _.bind(this.removeMemberFromPusher, this)
    )

    every(MEMBER_VIEW_REFRESH_PERIOD, _.bind(this.loadMembersFromServer, this))
  },

  renderMember: function(member) {
    var isOnline = isMemberOnline(member)
    var classes = React.addons.classSet({
      'text-weight-bold text-success': isOnline,
      'text-emphasis': !isOnline
    })

    var marker
    if(isOnline) {
      marker = (<span className="indicator indicator-success">&nbsp;</span>)
    } else {
      marker = (<span className="indicator indicator-default">&nbsp;</span>)
    }

    return (
      <div key={member.id}>
        <a className={classes} href={member.url}>
          <div className="pull-right">
          {marker}
          </div>
          <img className="avatar" src={member.avatar_url} width="16" height="16" alt={member.username} style={{marginRight: 10}} />
          {member.username}
        </a>
      </div>
    )
  },

  render: function() {
    return (
      <div className="panel-group" id="accordion" style={{'margin-top' : '36px'}}>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h6 className="panel-title">Online</h6>
          </div>
          <div className="panel-body small">
            {
              _.map(this.onlineMembers(), this.renderMember)
            }
          </div>
          <div className="panel-heading">
            <a data-toggle="collapse" data-parent="#accordion" href="#collapseRecent" className="text-muted">
              <i className="icon icon-chevron-up pull-right"></i>
              <h6 className="panel-title">Recently Active</h6>
            </a>
          </div>
          <div id="collapseRecent" className="panel-collapse collapse in">
            <div className="panel-body small">
            {
              _.map(this.recentlyActiveMembers(), this.renderMember)
            }
            </div>
          </div>
        </div>
      </div>
    )
  },

  addMembers: function(members) {
    this.setState({
      members: _.extend(this.state.members, members)
    })
  },

  addMemberFromPusher: function(member) {
    member.info.last_online = (new Date()).toISOString()
    this.addMember(member.id, member.info)
  },

  removeMemberFromPusher: function(member) {
    this.memberWentOffline(member.id)
  },

  addMember: function(id, member) {
    var update = {}
    update[id] = {'$set': member}
    this.setState(React.addons.update(this.state, {members: update}))
  },

  memberWentOffline: function(id) {
    var member = this.state.members[id]
    if(member.isWatcher) {
      return
    } else {
      var members = this.state.members;
      delete members[id]
      this.setState({members: members})
    }
  },

  onlineMembers: function() {
    return _.chain(this.state.members).values().filter(function(member) {
      return isMemberOnline(member)
    }).sortBy(function(member) {
      return member.username.toLowerCase()
    }).value()
  },

  recentlyActiveMembers: function() {
    return _.chain(this.state.members).values().filter(function(member) {
      return !isMemberOnline(member) && isMemberRecentlyActive(member)
    }).sortBy(function(member) {
      return member.username.toLowerCase()
    }).value()
  }
})
