var ChatActionCreators = require('../actions/chat_action_creators');
var OnlineUsersStore = require('../stores/online_users_store');

(function() {
  var isMemberOnline = function(member) {
    return moment(member.last_online).isAfter(moment().subtract('hour', 1))
  }

  var isMemberRecentlyActive = function(member) {
    return moment(member.last_online).isAfter(moment().subtract('month', 1))
  }

  var MEMBER_VIEW_REFRESH_PERIOD = 60 * 1000; // 1 minute

  var MembersView = React.createClass({
    render: function() {
      return <div>
        { _.map(this.members(), this.renderMember) }
      </div>
    },

    getInitialState: function() {
      return {
        hasRecentlyActiveMembers: false,
        members: {},
        presenceChannel: null
      }
    },

    componentDidMount: function() {
      OnlineUsersStore.on('change', this._onChange)
    },

    componentWillUnmount: function() {
      OnlineUsersStore.removeListener('change', this._onChange)
    },

    componentDidUpdate: function(prevProps, prevState) {
      if (this.state.presenceChannel != prevState.presenceChannel) {
        this.loadMembersFromChannel()
        this.loadMembersFromServer()

        this.state.presenceChannel.bind(
          'pusher:member_added',
          _.bind(this.addMemberFromPusher, this)
        )

        this.state.presenceChannel.bind(
          'pusher:member_removed',
          _.bind(this.removeMemberFromPusher, this)
        )

        every(MEMBER_VIEW_REFRESH_PERIOD, _.bind(this.loadMembersFromServer, this))
      }
    },

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
      this.state.presenceChannel.bind('pusher:subscription_succeeded',
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

    renderMember: function(member) {
      var indicator = null

      if (isMemberOnline(member)) {
        indicator = (
          <div className="indicator bg-green icon-right"></div>
        )
      }

      return (
        <a key={member.id} className="block overflow-hidden inactive" href={member.url}>
          @{member.username}
          {indicator}
        </a>
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

    members: function() {
      if (!this.state.hasRecentlyActiveMembers) {
        return []
      }
      return _.chain(this.state.members).values().filter(function(member) {
        return isMemberRecentlyActive(member)
      }).sortBy(function(member) {
        return (isMemberOnline(member) ? '0' : '1') + member.username.toLowerCase()
      }).value()
    },

    _onChange: function() {
      this.setState({
        presenceChannel: OnlineUsersStore.getPresenceChannel()
      })
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = MembersView;
  }

  window.MembersView = MembersView;
})();
