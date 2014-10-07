/**
 * @jsx React.DOM
 */

(function() {
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
          this.setState({hasRecentlyActiveMembers: true})
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
        hasRecentlyActiveMembers: false,
        members: {}
      }
    },

    componentDidMount: function() {
      this.loadMembersFromChannel()
      this.loadMembersFromServer()

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
        'text-success': isOnline,
        'text-muted': !isOnline
      })

      var marker
      if(isOnline) {
        marker = (<span className="indicator indicator-success">&nbsp;</span>)
      } else {
        marker = (<span className="indicator indicator-default">&nbsp;</span>)
      }

      return (
        <a key={member.id} className={classes} href={member.url} >
          <div className="clearfix">
            <div className="left mr2">
              {marker}
            </div>
            <div className="overflow-hidden">
              {member.username}
            </div>
          </div>
        </a>
      )
    },

    render: function() {
      var loading = null
      if (!this.state.hasRecentlyActiveMembers) {
          loading = <div className="right spinner"><div className="spinner-icon"></div></div>
      }
      return (
        <div>
          <h6 className="mt0 mb2 clearfix">
            {loading}
            People
          </h6>
          <div>
            { _.map(this.onlineMembers(), this.renderMember) }
          </div>
          <div>
            { _.map(this.recentlyActiveMembers(), this.renderMember) }
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
      if (!this.state.hasRecentlyActiveMembers) {
        return []
      }
      return _.chain(this.state.members).values().filter(function(member) {
        return isMemberOnline(member)
      }).sortBy(function(member) {
        return member.username.toLowerCase()
      }).value()
    },

    recentlyActiveMembers: function() {
      if (!this.state.hasRecentlyActiveMembers) {
        return []
      }
      return _.chain(this.state.members).values().filter(function(member) {
        return !isMemberOnline(member) && isMemberRecentlyActive(member)
      }).sortBy(function(member) {
        return member.username.toLowerCase()
      }).value()
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = MembersView;
  }

  window.MembersView = MembersView;
})();
