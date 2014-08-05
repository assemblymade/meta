(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/pletcher/Projects/meta/app/assets/javascripts/components/activity_feed.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {

  var ActivityFeed = React.createClass({displayName: 'ActivityFeed',
    getInitialState: function() {
      return { activities: this.props.activities };
    },

    render: function() {
      return React.DOM.div(null, _.map(this.state.activities, Entry));
    }
  });

  var Entry = React.createClass({displayName: 'Entry',
    render: function() {
      return React.DOM.div({className: "row"}, "@", this.props.actor.username, " ", this.props.verb, " ", this.body())
    },

    body: function() {
      if (this.props.subject.body_html) {
        return React.DOM.div({className: "markdown-normalized", ref: "body"})
      } else if (this.props.subject.attachment) {
        var href = this.props.subject.attachment.href
        var src = this.props.subject.attachment.firesize_url + '/300x225/frame_0/g_center/' + href
        return (
          React.DOM.a({href: href}, 
            React.DOM.img({className: "gallery-thumb", src: src})
          )
        )
      }
    },

    componentDidMount: function() {
      if (this.refs.body) {
        this.refs.body.getDOMNode().innerHTML = this.props.subject.body_html
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ActivityFeed;
  }

  window.ActivityFeed = ActivityFeed;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/avatar.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {
  var Avatar = React.createClass({displayName: 'Avatar',
    getDefaultProps: function() {
      return {
        size: 24
      };
    },

    render: function() {
      var size = this.props.size && this.props.size.toString();

      return React.DOM.img({className: "avatar img-circle", height: size, src: this.avatarUrl(), width: size});
    },

    avatarUrl: function() {
      if (this.props.user && !this.props.alwaysDefault) {
        return this.props.user.avatar_url + '?s=' + (this.props.size * 2);
      } else {
        return '/assets/avatars/default.png';
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Avatar;
  }

  window.Avatar = Avatar;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/chat_notifications.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var ChatNotificationStore = require('../stores/chat_notifications_store');
var DesktopNotifications = require('./desktop_notifications.js.jsx');

(function() {
  var ICON_URL = 'https://d8izdk6bl4gbi.cloudfront.net/80x/http://f.cl.ly/items/1I2a1j0M0w0V2p3C3Q0M/Assembly-Twitter-Avatar.png';
  var N = CONSTANTS.CHAT_NOTIFICATIONS;

  function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a,b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }

  function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
      var i = 0, result = 0, numberOfProperties = props.length;
      /* try getting a different result from 0 (equal)
       * as long as we have extra properties to compare
       */
      while (result === 0 && i < numberOfProperties) {
        result = dynamicSort(props[i])(obj1, obj2);
        i++;
      }
      return result;
    }
  }

  var ChatNotifications = React.createClass({displayName: 'ChatNotifications',
    articles: function() {
      return _.flatten(_.map(this.state.data, function(a){
        return a.entities;
      }));
    },

    componentDidMount: function() {
      $('[data-toggle]', this.getDOMNode()).tooltip();
      var target = this.refs.spinner.getDOMNode();
      var opts = this.spinnerOptions || {
        lines: 11,
        length: 30,
        radius: 55
      };

      var spinner = this.spinner = new Spinner(opts).spin();
      target.appendChild(spinner.el);
    },

    sortByLastReadAt: function(data) {
      if (data === null) {
        return [];
      }

      var values = _.values(data);
      for (var i = 0; i < values.length; i++) {
        var entry = values[i];
        entry.readState = entry.updated > entry.last_read_at ? 'A' : 'Z';
        entry.sortIndex = this.state.sortKeys.indexOf(entry.id);
      }
      values.sort(dynamicSortMultiple("readState", "sortIndex", "label"));

      return values || [];
    },

    componentWillMount: function() {
      var _this = this;

      // TODO: Remove this and use the Dispatcher
      $(window).bind('storage', this.storedAckChanged);

      this.onPush(function(event, msg) {
        if (_.contains(msg.mentions, _this.props.username)) {
          _this.desktopNotify(msg);
        }
        _this.fetchNotifications();
      });

      window.visibility(function(visible) {
        if (visible) { _this.fetchNotifications(); }
      });

      ChatNotificationsStore.addChangeListener(this.handleChatRoomsChanged);
      this.fetchNotifications();
    },

    desktopNotify: function(event) {
      var n = new Notify("New message on " + (event.wip.product_name), {
        body: (event.actor.username + ": " + event.body_sanitized),
        tag: event.id,
        icon: ICON_URL,
        timeout: 15,

        notifyClick: function() {
          $(window).focus();
          if (window.app.wip.id != event.wip.id) {
            window.app.redirectTo(event.wip.url);
          }
        }
      });

      return n.show();
    },

    fetchNotifications: _.debounce(function() {
      Dispatcher.dispatch({
        action: N.ACTIONS.FETCH_CHAT_ROOMS,
        event: N.EVENTS.CHAT_ROOMS_FETCHED,
        data: this.props.url
      });
    }, 1000),

    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    getInitialState: function() {
      return {
        data: null,
        sortKeys: [],
        acknowledgedAt: this.storedAck(),
        desktopNotificationsEnabled: false
      };
    },

    handleChatRoomsChanged: function() {
      var self = this;

      this.setState({
        data: ChatNotificationsStore.getChatRooms(),
        sortKeys: ChatNotificationsStore.getSortKeys()
      }, function() {
        if (!_.isEmpty(self.state.data)) {
          self.spinner.stop();
        }
      });
    },

    handleDesktopNotificationsStateChange: function(isEnabled) {
      this.setState({
        desktopNotificationsEnabled: isEnabled
      });
    },

    onPush: function(fn) {
      if (window.pusher) {
        channel = window.pusher.subscribe('@' + this.props.username);
        channel.bind_all(fn);
      }
    },

    latestArticle: function() {
      return _.max(this.articles(), function(a) {
        return a && a.timestamp;
      });
    },

    latestArticleTimestamp: function() {
      var article = this.latestArticle()

      if (article) {
        return article.timestamp;
      } else {
        return 0;
      }
    },

    render: function() {
      var sorted = this.sortByLastReadAt(this.state.data);
      var productsPath = '/users/' + this.props.username;

      return (
        React.DOM.ul({className: "dropdown-menu", style: {'min-width': '380px'}}, 
          React.DOM.li({ref: "spinner", style: { 'min-height': '50px', 'max-height': '300px'}}, 
            NotificationsList({data: _.first(sorted, 7)})
          ), 

          React.DOM.li(null, 
            React.DOM.a({href: productsPath, className: "text-small"}, "All Products")
          ), 

          React.DOM.li(null, 
            !this.state.desktopNotificationsEnabled ? DesktopNotifications({onChange: this.handleDesktopNotificationsStateChange}) : null
          )
        )
      );
    },

    setBadge: function(total) {
      if (window.fluid) {
        window.fluid.dockBadge = total;
      }
    },

    spinnerOptions: {
      lines: 11,
      top: '20%'
    },

    storedAck: function() {
      var timestamp = localStorage.chatAck;

      if (timestamp == null || timestamp === "null") {
        return 0;
      } else {
        return parseInt(timestamp);
      }
    },

    storedAckChanged: function() {
      this.setState({
        acknowledgedAt: this.storedAck()
      });
    }
  });

  var NotificationsList = React.createClass({displayName: 'NotificationsList',
    render: function() {
      var productNodes = this.props.data.map(function(entry){
        var badge = null;

        if (entry.updated > entry.last_read_at) {
          badge = React.DOM.span({
              className: "indicator indicator-danger pull-right", 
              style: { 'position': 'relative', 'top': '10px'}});
        }

        return (
          React.DOM.a({href: entry.url, key: entry.id, className: "list-group-item"}, 
            badge, " ", entry.label
          )
        );
      });

      return (
        React.DOM.div({className: "list-group"}, 
          productNodes
        )
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ChatNotifications;
  }

  window.ChatNotifications = ChatNotifications;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/chat_notifications_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/chat_notifications_store.js","./desktop_notifications.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/desktop_notifications.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/chat_notifications_toggler.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var ChatNotificationsStore = require('../stores/chat_notifications_store');
var DropdownTogglerMixin = require('../mixins/dropdown_toggler.js.jsx');

(function() {
  var CN = CONSTANTS.CHAT_NOTIFICATIONS;

  var ChatNotificationsToggler = React.createClass({displayName: 'ChatNotificationsToggler',
    mixins: [DropdownTogglerMixin],

    acknowledge: function() {
      var timestamp = moment().unix();

      localStorage.chatAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });

      Dispatcher.dispatch({
        event: CN.EVENTS.ACKNOWLEDGED,
        action: CN.ACTIONS.ACKNOWLEDGE,
        data: timestamp,
        sync: true
      });
    },

    badge: function() {
      return (
        React.DOM.span({
            className: "indicator indicator-danger", 
            style: { position: 'relative', top: '5px'}})
      );
    },

    badgeCount: function() {
      // if (this.shouldRead() || this.lastUpdatedAt() > this.state.acknowledgedAt) {
      //   return 1;
      // }
      //
      // return 0;

      return this.shouldRead() ? ChatNotificationsStore.getUnreadCount(this.state.acknowledgedAt) : 0;
    },

    componentWillMount: function() {
      ChatNotificationsStore.addChangeListener(this.getStories);
    },

    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    getInitialState: function() {
      return {
        chatRooms: null,
        acknowledgedAt: this.storedAck()
      };
    },

    getStories: function() {
      this.setState({
        chatRooms: ChatNotificationsStore.getChatRooms()
      });
    },

    shouldRead: function() {
      var chatRoom = ChatNotificationsStore.mostRecentlyUpdatedChatRoom();

      return chatRoom && chatRoom.updated > chatRoom.last_read_at;
    },

    lastUpdatedAt: function() {
      var chatRoom = ChatNotificationsStore.mostRecentlyUpdatedChatRoom();

      if (chatRoom) {
        return chatRoom.updated;
      }

      return 0;
    },

    total: function() {
      var self = this;

      var count = _.reduce(
        _.map(self.state.chatRooms, function mapStories(chatRoom) {
          return chatRoom.count;
        }), function reduceStories(memo, read) {
          return memo + read;
      }, 0);

      return count;
    },

    storedAck: function() {
      var timestamp = localStorage.chatAck;

      if (timestamp == null || timestamp === 'null') {
        return 0;
      } else {
        return parseInt(timestamp, 10);
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ChatNotificationsToggler;
  }

  window.ChatNotificationsToggler = ChatNotificationsToggler;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../mixins/dropdown_toggler.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/mixins/dropdown_toggler.js.jsx","../stores/chat_notifications_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/chat_notifications_store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/coin_ownership.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var CoinOwnershipStore = require('../stores/coin_ownership_store');
var Avatar = require('./avatar.js.jsx');
var PersonPicker = require('./person_picker.js.jsx');

(function() {
  var CO = CONSTANTS.COIN_OWNERSHIP;

  function preventDefault(fn) {
    return function(e) {
      e.preventDefault()
      fn(e)
    }
  }

  var CoinOwnership = React.createClass({displayName: 'CoinOwnership',
    getDefaultProps: function() {
      return { totalCoins: 6000 };
    },

    componentDidMount: function() {
      CoinOwnershipStore.addChangeListener(this.onChange);
    },

    getInitialState: function() {
      return {
        creator: _.extend(app.currentUser().attributes, { coins: this.props.totalCoins }),
        sharers: CoinOwnershipStore.getUsers(),
        percentageAvailable: 0,
        potentialUser: null
      }
    },

    ownership: function(user) {
      return Math.max(
        0, Math.min(
          100, parseInt(user.coins * 100 / this.totalCoins(), 10)
        )
      )
    },

    totalCoins: function() {
      var sharerCoins = _.reduce(_.map(this.state.sharers, func.dot('coins')), function(memo, num) { return memo + num; }, 0)

      return sharerCoins + this.state.creator.coins
    },

    render: function() {
      var creator = this.state.creator;

      return (
        React.DOM.table({className: "table"}, 
          React.DOM.thead(null, 
            React.DOM.tr(null, 
              React.DOM.th({colSpan: "2"}, "Partner"), 
              React.DOM.th({className: "text-right", style: {width: 130}}, "Ownership"), 
              React.DOM.th({className: "text-right"}, "Coins"), 
              React.DOM.th(null)
            )
          ), 
          React.DOM.tbody(null, 
            React.DOM.tr({className: "active"}, 
              React.DOM.td(null, Avatar({user: creator})), 
              React.DOM.td(null, 
                "@", creator.username
              ), 
              React.DOM.td({className: "text-right"}, 
                React.DOM.strong(null, this.ownership(creator), "%")
              ), 
              React.DOM.td({className: "text-right"}, 
                React.DOM.span({className: "text-coins", style: {"white-space":"nowrap"}}, 
                  React.DOM.span({className: "icon icon-app-coin"}), 
                  creator.coins
                )
              ), 
              React.DOM.td({className: "text-right"}, 
                React.DOM.span({className: "text-muted"}, "(you)")
              )
            ), 

            this.rows(), 

            React.DOM.tr(null, 
              React.DOM.td(null, Avatar({user: this.state.potentialUser, alwaysDefault: "true"})), 
              React.DOM.td(null, 
                PersonPicker({ref: "picker", url: "/_es", 
                              onUserSelected: this.handleUserSelected, 
                              onValidUserChanged: this.handleValidUserChanged})
              ), 
              React.DOM.td(null, 
                React.DOM.div({className: "input-group input-group-sm"}, 

                  React.DOM.input({className: "form-control text-right", type: "number", value: this.state.percentageAvailable, onChange: this.handleInputChange}), 
                  React.DOM.div({className: "input-group-addon"}, "%")
                )
              ), 
              React.DOM.td(null, 
                React.DOM.span({className: "text-coins pull-right", style: {'white-space':"nowrap"}}, 
                  React.DOM.span({className: "icon icon-app-coin"}), 
                  "0"
                )
              ), 
              React.DOM.td({className: "text-right"}, 
                this.addButton()
              )
            )
          )
        )
      )
    },

    addButton: function() {
      return (
        React.DOM.a({className: "text-success", 
            style: {cursor: 'pointer'}, 
            onClick: this.state.potentialUser ? this.addUserClicked : ''}, 
          React.DOM.span({className: "icon icon-plus-circled"}), 
          React.DOM.span({className: "sr-only"}, "Add")
        )
      );
    },

    handleUserSelected: function(user) {
      this.addUser(user)
    },

    handleValidUserChanged: function(user) {
      this.setState({
        potentialUser: user
      });
    },

    addUserClicked: function(e) {
      e.preventDefault()
      this.addUser(this.state.potentialUser);
      this.refs.picker.clearText();
    },

    onChange: function() {
      var users = CoinOwnershipStore.getUsers();

      for (var i = 0, l = users.length; i < l; i++) {
        if (!users[i].hasOwnProperty('coins')) {
          users[i].coins = 0;
        }
      }

      this.setState({
        sharers: users
      });
    },

    addUser: function(user) {
      var user = _.extend(user, {coins: 0});

      this.setState(React.addons.update(this.state, {
        potentialUser: {$set: null},
        sharers: { $push: [user] }
      }));

      Dispatcher.dispatch({
        event: CO.EVENTS.USER_ADDED,
        action: CO.ACTIONS.ADD_USER,
        data: { userAndCoins: user }
      });
    },

    rows: function() {
      return _.map(this.state.sharers, function(user) {
        return OwnershipRow({
          user: user, 
          totalCoins: this.props.totalCoins, 
          ownership: this.ownership(user), 
          onRemove: this.handleUserRemoved(user), key: user.id || user.email, 
          onOwnershipChanged: this.handleOwnershipChanged(user)})
      }.bind(this))
    },

    handleUserRemoved: function(user) {
      return function() {
        var users = _.reject(this.state.sharers, function(u){
          if (u.id) {
            return u.id == user.id
          } else if (u.email) {
            return u.email == user.email
          }
        });

        Dispatcher.dispatch({
          event: CO.EVENTS.USER_REMOVED,
          action: CO.ACTIONS.REMOVE_USER,
          data: { userAndCoins: user }
        });

        var creator = this.state.creator;

        creator.coins = creator.coins + user.coins;

        this.setState({
          sharers: users,
          creator: creator
        });

      }.bind(this);
    },

    handleOwnershipChanged: function(user) {
      // this needs to be completely rewritten to use the dispatcher and store(s)
      return function(ownership) {
        user.coins = Math.floor((ownership / 100) * this.props.totalCoins);

        var creator = this.state.creator;
        var sharers = this.state.sharers;

        var sharerCoins = _.reduce(
          _.map(sharers,
          func.dot('coins')),
          function(memo, coins) {
            return memo + coins;
          },
          0
        );

        creator.coins = this.props.totalCoins - sharerCoins || 0;

        this.setState({
          sharers: this.state.sharers,
          creator: creator
        });

      }.bind(this)
    }
  });

  var OwnershipRow = React.createClass({displayName: 'OwnershipRow',
    getInitialState: function() {
      return {
        ownership: 0
      };
    },

    render: function() {
      var user = this.props.user;

      if (user.email) {
        return (
          React.DOM.tr(null, 
            React.DOM.td(null, React.DOM.span({className: "text-muted glyphicon glyphicon-envelope"})), 
            React.DOM.td(null, 
              user.email
            ), 
            React.DOM.td(null, 
              React.DOM.div({className: "input-group input-group-sm"}, 
                React.DOM.input({ref: "ownership", className: "form-control text-right", type: "number", 
                       name: 'ownership[' + user.email + ']', 
                       value: this.state.ownership, 
                       onChange: this.handleOwnershipChanged}), 
                React.DOM.div({className: "input-group-addon"}, "%")
              )
            ), 
            React.DOM.td({className: "text-right"}, 
              React.DOM.span({className: "text-coins", style: {'white-space':"nowrap"}}, 
                React.DOM.span({className: "icon icon-app-coin"}), 
                user.coins
              )
            ), 
            React.DOM.td({className: "text-right"}, 
              React.DOM.a({href: "#", onClick: preventDefault(this.props.onRemove), className: "text-muted link-hover-danger"}, 
                React.DOM.span({className: "icon icon-close"}), 
                React.DOM.span({className: "sr-only"}, "Remove")
              )
            )
          )
        );
      } else {
        return (
          React.DOM.tr(null, 
            React.DOM.td(null, Avatar({user: user})), 
            React.DOM.td(null, 
              "@", user.username
            ), 
            React.DOM.td(null, 
              React.DOM.div({className: "input-group input-group-sm"}, 
                React.DOM.input({ref: "ownership", className: "form-control text-right", type: "number", 
                       name: 'ownership[' + user.id + ']', 
                       value: this.state.ownership, 
                       onChange: this.handleOwnershipChanged}), 
                React.DOM.div({className: "input-group-addon"}, "%")
              )
            ), 
            React.DOM.td({className: "text-right"}, 
              React.DOM.span({className: "text-coins", style: {'white-space':"nowrap"}}, 
                React.DOM.span({className: "icon icon-app-coin"}), 
                user.coins
              )
            ), 
            React.DOM.td({className: "text-right"}, 
              React.DOM.a({href: "#", onClick: preventDefault(this.props.onRemove), className: "text-muted link-hover-danger"}, 
                React.DOM.span({className: "icon icon-close"}), 
                React.DOM.span({className: "sr-only"}, "Remove")
              )
            )
          )
        );
      }

    },

    handleOwnershipChanged: function(e) {
      var val = parseInt(e.target.value, 10);

      if (val < 0) {
        val = 0;
      }

      var user = this.props.user;
      var users = CoinOwnershipStore.getUsers();

      var sharerCoins = _.reduce(_.map(_.reject(users,
        function(s) {
          return s.username === user.username
        }),
        func.dot('coins')),
        function(memo, coins) {
          return memo + coins;
        },
      0);

      var percentageRemaining = 100 - Math.ceil(sharerCoins / this.props.totalCoins * 100);

      if (val >= percentageRemaining) {
        val = percentageRemaining;
      }

      this.setState({
        ownership: val
      });

      this.props.onOwnershipChanged(val);
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = CoinOwnership;
  }

  window.CoinOwnership = CoinOwnership;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/coin_ownership_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/coin_ownership_store.js","./avatar.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/avatar.js.jsx","./person_picker.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/person_picker.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/core_team.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {

  function atUsername(user) {
    return '@' + user.username
  }

  function avatarUrl(user, size) {
    if (user) {
      return user.avatar_url + '?s=' + 48
    } else {
      return '/assets/avatars/default.png'
    }
  }

  var CoreTeam = React.createClass({displayName: 'CoreTeam',
    getInitialState: function() {
      return { users: [], potentialUser: null }
    },

    render: function() {
      return (
        React.DOM.table({className: "table"}, 
          React.DOM.tbody(null, 
            React.DOM.tr({className: "active"}, 
              React.DOM.td(null, 
                React.DOM.img({alt: atUsername(this.props.currentUser), 
                     className: "avatar img-circle", 
                     height: "24", width: "24", 
                     src: avatarUrl(this.props.currentUser, 48)})
              ), 
              React.DOM.td(null, atUsername(this.props.currentUser)), 
              React.DOM.td({className: "text-right"}, 
                React.DOM.span({className: "text-muted"}, "(you)")
              )
            ), 
            this.rows(), 
            React.DOM.tr(null, 
              React.DOM.td(null, this.state.potentialUser ? this.avatar(this.state.potentialUser) : this.avatar(null)), 
              React.DOM.td(null, 
                PersonPicker({ref: "picker", url: "/_es", 
                              onUserSelected: this.handleUserSelected, 
                              onValidUserChanged: this.handleValidUserChanged})
              ), 
              React.DOM.td({className: "text-right"}, 
                this.addButton()
              )
            )
          )
        )
      )
    },

    addButton: function() {
      if (this.state.potentialUser) {
        return (
          React.DOM.a({className: "text-success", href: "#", onClick: this.addUserClicked}, 
            React.DOM.span({className: "icon icon-plus-circled"}), 
            React.DOM.span({className: "sr-only"}, "Add")
          )
        )
      } else {
        return (
          React.DOM.span({className: "text-success"}, 
            React.DOM.span({className: "icon icon-plus-circled"}), 
            React.DOM.span({className: "sr-only"}, "Add")
          )
        )
      }
    },

    rows: function(){
      return _.map(this.state.users, function(user){
        return MemberRow({user: user, onRemove: this.handleUserRemoved(user), key: user.id || user.email})
      }.bind(this))
    },

    handleUserSelected: function(user) {
      this.addUser(user)
    },

    handleUserRemoved: function(user) {
      return function() {
        var users = _.reject(this.state.users, function(u){
          if (u.id) {
            return u.id == user.id
          } else if (u.email) {
            return u.email == user.email
          }
        });

        this.setState({users: users});

        Dispatcher.dispatch({
          event: CONSTANTS.COIN_OWNERSHIP.EVENTS.USER_REMOVED,
          action: CONSTANTS.COIN_OWNERSHIP.ACTIONS.REMOVE_USER,
          data: { userAndCoins: user }
        });

      }.bind(this)
    },

    handleValidUserChanged: function(user) {
      this.setState({potentialUser: user})
    },

    addUserClicked: function(e) {
      e.preventDefault()
      this.addUser(this.state.potentialUser)
      this.refs.picker.clearText()
    },

    addUser: function(user) {
      this.setState(React.addons.update(this.state, {
        potentialUser: {$set: null},
        users: { $push: [user] }
      }))

      Dispatcher.dispatch({
        event: CONSTANTS.COIN_OWNERSHIP.EVENTS.USER_ADDED,
        action: CONSTANTS.COIN_OWNERSHIP.ACTIONS.ADD_USER,
        data: { userAndCoins: user }
      });
    },

    avatar: function(user) {
      if (user && user.email) {
        return React.DOM.span({className: "text-muted glyphicon glyphicon-envelope"})
      } else {
        return React.DOM.img({className: "avatar img-circle", height: "24", src: avatarUrl(user), width: "24"})
      }
    }
  })

  function preventDefault(fn) {
    return function(e) {
      e.preventDefault()
      fn(e)
    }
  }

  var MemberRow = React.createClass({displayName: 'MemberRow',
    render: function(){
      if (this.props.user.email) {
        return (
          React.DOM.tr(null, 
            React.DOM.td(null, React.DOM.span({className: "text-muted glyphicon glyphicon-envelope"})), 
            React.DOM.td(null, this.props.user.email), 

            React.DOM.td({className: "text-right"}, 
              React.DOM.input({type: "hidden", value: this.props.user.email, name: "core_team[]"}), 
              React.DOM.a({href: "#", onClick: preventDefault(this.props.onRemove), className: "text-muted link-hover-danger"}, 
                React.DOM.span({className: "icon icon-close"}), 
                React.DOM.span({className: "sr-only"}, "Remove")
              )
            )
          )
        )
      } else {
        return (
          React.DOM.tr(null, 
            React.DOM.td(null, React.DOM.img({className: "avatar", src: avatarUrl(this.props.user, 48), width: 24, height: 24})), 
            React.DOM.td(null, "@", this.props.user.username), 

            React.DOM.td({className: "text-right"}, 
              React.DOM.input({type: "hidden", value: this.props.user.id, name: "core_team[]"}), 
              React.DOM.a({href: "#", onClick: preventDefault(this.props.onRemove), className: "text-muted link-hover-danger"}, 
                React.DOM.span({className: "icon icon-close"}), 
                React.DOM.span({className: "sr-only"}, "Remove")
              )
            )
          )
        )
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = CoreTeam;
  }

  window.CoreTeam = CoreTeam;

})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/desktop_notifications.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {
  var DesktopNotifications = React.createClass({displayName: 'DesktopNotifications',
    getInitialState: function() {
      return { enabled: false }
    },

    updateEnabled: function(enabled) {
      this.setState({ enabled: enabled})
      this.props.onChange(this.state.enabled);
    },

    componentDidMount: function() {
      this.updateEnabled(!(Notify.isSupported() && Notify.needsPermission()))
    },

    handleClick: function() {
      var _this = this
      Notify.requestPermission(function(){
        _this.updateEnabled(true)
      })
    },

    render: function(){
      if(this.state.enabled) {
        return React.DOM.span(null);
      } else {
        return (
          React.DOM.a({href: "#enable-notifications", className: "js-enable-notifications text-small", 'data-toggle': "tooltip", 'data-placement': "left", title: "Enable desktop notifications for @mentions", onClick: this.handleClick}, 
            "Enable notifications"
          )
        );
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DesktopNotifications;
  }

  window.DesktopNotifications = DesktopNotifications;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/drag_and_drop_view.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var Dispatcher = require('../dispatcher');

(function() {
  var DragAndDrop = React.createClass({displayName: 'DragAndDrop',
    getInitialState: function() {
      return { display: 'none', opacity: 1 };
    },

    render: function() {
      return (
        React.DOM.span({id: "logo-upload", 
              className: "img-shadow js-dropzone-select", 
              style: {cursor: 'pointer'}, 
              onMouseEnter: this.onMouseEnter, 
              onMouseLeave: this.onMouseLeave}, 

          React.DOM.img({src: this.props.url, 
              alt: this.props.alt, 
              style: {opacity: this.state.opacity}, 
              className: "img-rounded", 
              width: "100%"}), 

          React.DOM.span({style: {
              display: this.state.display,
              position: 'absolute',
              'text-align': 'center',
              width: '100%',
              'z-index': -1,
              top: '40%',
              'font-size': '12px',
              'font-weight': 'bold'
          }}, 
            "Drag and drop or click here", 
            React.DOM.br(null), 
            "to change the logo"
          )

        )
      );
    },

    componentDidMount: function() {
      var self = this;

      // TODO: Fix this godawful hack
      var _timeout,
          node = this.getDOMNode();

      $(node).bind('dragover', function(e) {
        // prevent jitters
        if (_timeout) {
          clearTimeout(_timeout);
        }

        self.setState({
          display: 'block',
          opacity: 0.5
        });
      });

      $(node).bind('dragleave', function(e) {
        _timeout = setTimeout(function() {
          self.setState({
            display: 'none',
            opacity: 1
          });
        });
      });
    },

    onMouseEnter: function(e) {
      this.setState({
        display: 'block',
        opacity: 0.5
      });
    },

    onMouseLeave: function(e) {
      this.setState({
        display: 'none',
        opacity: 1
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DragAndDrop;
  }

  window.DragAndDrop = DragAndDrop;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/dropdown_news_feed.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var NewsFeedMixin = require('../mixins/news_feed.js.jsx');
var NewsFeedStore = require('../stores/news_feed_store');
var Avatar = require('./avatar.js.jsx');

(function() {

  var NF = CONSTANTS.NEWS_FEED;

  var DropdownNewsFeed = React.createClass({displayName: 'DropdownNewsFeed',
    mixins: [NewsFeedMixin],

    componentWillMount: function() {
      NewsFeedStore.addChangeListener(this.getStories);

      this.fetchNewsFeed(this.props.url);

      this.onPush(function() {
        this.fetchNewsFeed();
      }.bind(this));
    },

    fetchNewsFeed: _.debounce(function() {
      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_STORIES,
        event: NF.EVENTS.STORIES_FETCHED,
        data: this.props.url
      });
    }, 1000),

    getInitialState: function() {
      return {
        stories: null
      };
    },

    markAllAsRead: function() {
      Dispatcher.dispatch({
        event: NF.EVENTS.READ_ALL,
        action: NF.ACTIONS.MARK_ALL_AS_READ,
        data: null
      });
    },

    onPush: function(fn) {
      if (window.pusher) {
        channel = window.pusher.subscribe('@' + this.props.username);
        channel.bind_all(fn);
      }
    },

    render: function() {
      return (
        React.DOM.ul({className: "dropdown-menu", style: { 'max-height': '500px', 'min-width': '380px'}}, 
          React.DOM.li({style: { 'overflow-y': 'scroll'}, ref: "spinner"}, 
            this.state.stories ? this.rows(this.state.stories) : null
          ), 

          React.DOM.li({className: "divider", style: { 'margin-top': '0px'}}), 

          React.DOM.li(null, 
            React.DOM.a({href: this.props.editUserPath, className: "text-small"}, "Settings")
          ), 

          React.DOM.li(null, 
            React.DOM.a({href: "#mark-as-read", className: "text-small", onClick: this.markAllAsRead}, "Mark all as read")
          ), 

          React.DOM.li(null, 
            React.DOM.a({href: "/notifications", className: "text-small"}, "All Notifications")
          )
        )
      );
    },

    rows: function(stories) {
      var rows = [];

      for (var i = 0, l = stories.length; i < l; i++) {
        if (i > 9) {
          break;
        }

        rows.push(
          Entry({story: stories[i], actors: this.state.actors, fullPage: this.props.fullPage})
        );
      }

      return (
        React.DOM.div({className: "list-group", style: { 'max-height': '300px', 'min-height': '50px'}}, 
          rows
        )
      );
    },

    spinnerOptions: {
      lines: 11,
      top: '20%'
    }
  });

  var Entry = React.createClass({displayName: 'Entry',
    actors: function() {
      return _.map(
        this.props.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    body: function() {
      var target = this.props.story.activities[0].target;

      return (
        React.DOM.span(null, 
          this.verbMap[this.props.story.verb], 
          React.DOM.strong(null, 
            this.subjectMap[this.props.story.subject_type].call(this, target)
          ), 
          this.product()
        )
      );
    },

    componentDidMount: function() {
      if (this.refs.body) {
        this.refs.body.getDOMNode().innerHTML = this.props.story.subject.body_html;
      }
    },

    ellipsis: function(text) {
      if (text && text.length > 40) {
        text = text.substring(0, 40) + '…';
      }

      return text;
    },

    getInitialState: function() {
      return {
        story: this.props.story
      };
    },

    isRead: function() {
      return this.state.story.last_read_at !== 0;
    },

    markAsRead: function() {
      // FIXME: This method shouldn't work this way; use the Dispatcher
      var story = this.state.story;
      story.last_read_at = moment().unix();

      this.setState({
        story: story
      });
    },

    markAsReadButton: function() {
      if (!this.isRead()) {
        return React.DOM.span({className: "icon icon-disc pull-right", onClick: this.markAsRead, title: 'Mark as read', style: { cursor: 'pointer'}});
      }

      // TODO: Mark as unread
      return React.DOM.span({className: "icon icon-circle pull-right", style: { cursor: 'pointer'}})
    },

    preview: function() {
      var body_preview = this.props.story.body_preview;

      return (
        React.DOM.p({className: "text-muted", style: { 'text-overflow': 'ellipsis'}}, 
          this.ellipsis(body_preview)
        )
      );
    },

    product: function() {
      var product = this.props.story.product;

      return ' in ' + product.name;
    },

    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead(),
      });

      return (
        React.DOM.a({className: 'list-group-item ' + classes, 
            href: this.props.story.url, 
            style: { 'font-size': '14px'}, 
            onClick: this.state.story.last_read_at ? null : this.markAsRead}, 

          React.DOM.div({className: "row"}, 
            React.DOM.div({className: "col-md-1"}, 
              Avatar({user: this.actors()[0], size: 18}), " "
            ), 

            React.DOM.div({className: "col-md-10"}, 
              React.DOM.strong(null, actors), " ", this.body(), 
              this.preview()
            ), 

            React.DOM.div({className: "col-md-1"}, 
              this.markAsReadButton()
            )
          )
        )
      );
    },

    subjectMap: {
      Task: function(task) {
        return "#" + task.number;
      },

      Discussion: function(discussion) {
        return 'discussion'
      },

      Wip: function(bounty) {
        if (this.props.fullPage) {
          return "#" + bounty.number + " " + bounty.title
        }

        return "#" + bounty.number;
      },
    },

    timestamp: function() {
      return moment(this.props.story.created).format("ddd, hA")
    },

    verbMap: {
      'Comment': 'commented on ',
      'Award': 'awarded ',
      'Close': 'closed '
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DropdownNewsFeed;
  }

  window.DropdownNewsFeed = DropdownNewsFeed;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../mixins/news_feed.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/mixins/news_feed.js.jsx","../stores/news_feed_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/news_feed_store.js","./avatar.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/avatar.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/dropdown_news_feed_toggler.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var DropdownTogglerMixin = require('../mixins/dropdown_toggler.js.jsx');
var NewsFeedStore = require('../stores/news_feed_store');

(function() {
  var NF = CONSTANTS.NEWS_FEED;

  var DropdownNewsFeedToggler = React.createClass({displayName: 'DropdownNewsFeedToggler',
    mixins: [DropdownTogglerMixin],

    acknowledge: function() {
      var timestamp = moment().unix();

      localStorage.newsFeedAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });

      Dispatcher.dispatch({
        event: NF.EVENTS.ACKNOWLEDGED,
        action: NF.ACTIONS.ACKNOWLEDGE,
        data: timestamp,
        sync: true
      });
    },

    badge: function(total) {
      return React.DOM.span({className: "badge badge-notification"}, total);
    },

    badgeCount: function() {
      if (this.latestStoryTimestamp() > this.state.acknowledgedAt) {
        return NewsFeedStore.getUnreadCount(this.state.acknowledgedAt);
      }

      return 0;
    },

    componentWillMount: function() {
      NewsFeedStore.addChangeListener(this.getStories);
    },

    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    getInitialState: function() {
      return {
        stories: null,
        acknowledgedAt: this.storedAck()
      };
    },

    getStories: function() {
      this.setState({
        stories: NewsFeedStore.getStories()
      });
    },

    latestStory: function() {
      var stories = this.state.stories;

      if (!stories) {
        return;
      }

      var story;
      for (var i = 0, l = stories.length; i < l; i++) {
        if (story && stories[i].updated > story.updated) {
          story = stories[i];
        }

        if (!story) {
          story = stories[i];
        }
      }

      return story;
    },

    latestStoryTimestamp: function() {
      var story = this.latestStory();

      return story && story.updated ? story.updated : 0;
    },

    storedAck: function() {
      var timestamp = localStorage.newsFeedAck;

      if (timestamp == null || timestamp === 'null') {
        return 0;
      } else {
        return parseInt(timestamp, 10);
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DropdownNewsFeedToggler;
  }

  window.DropdownNewsFeedToggler = DropdownNewsFeedToggler;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../mixins/dropdown_toggler.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/mixins/dropdown_toggler.js.jsx","../stores/news_feed_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/news_feed_store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/financials_view.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

// TODO: Tidy up shared state

/**
 * Right now, both the table and the meter have
 * all of the financials in state; it would be
 * better to move all of this to the FinancialsStore
 */

(function() {
  var FinancialsStore = {
    month: 'June',
    getMonth: function() {
      return this.month;
    },

    setMonth: function(month) {
      this.month = month;
    }
  };

  var FinancialsActions = {
    addChangeListener: function(callback) {
      this.listeners = this.listeners || [];
      this.listeners.push(callback)
    },

    sendChange: function(state) {
      _.each(this.listeners, function(callback) {
        callback(state);
      });
    }
  };

  var Financials = React.createClass({displayName: 'Financials',
    componentWillMount: function() {
      this.setState({
        financials: {
          January: 27732,
          February: 20704,
          March: 34020,
          April: 30074,
          May: 26632,
          June: 27334
        },
        expenses: {
          January: 2998,
          February: 4024,
          March: 3363,
          April: 3433,
          May: 3474,
          June: 3487
        }
      });
    },

    render: function() {
      var name = this.props.product.name;
      var costs = this.state.expenses[FinancialsStore.getMonth()];
      var annuity = "18000";

      return (
        React.DOM.div({className: "financials"}, 
          FinancialsKey({
              product: this.props.product}
          ), 

          FinancialsMeter({
              product: this.props.product, 
              financials: this.state.financials, 
              costs: this.state.expenses, 
              annuity: annuity}
          ), 

          FinancialsTable({
              product: this.props.product, 
              financials: this.state.financials, 
              costs: this.state.expenses, 
              annuity: annuity}
          )
        )
      );
    }
  });

  var FinancialsKey = React.createClass({displayName: 'FinancialsKey',
    componentWillMount: function() {
      this.setState({
        month: FinancialsStore.getMonth()
      })
    },

    componentDidMount: function() {
      FinancialsActions.addChangeListener(this._onChange)
    },

    render: function() {
      // TODO: Break out dl-inline styles into reusable SCSS components
      return (
        React.DOM.div(null, 
          React.DOM.dl({className: "text-small"}, 
            React.DOM.dt({style: {'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#48a3ed'}}), 
            React.DOM.dd({style: {'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}, this.props.product.name, " annuity"), 
            React.DOM.dt({style: {'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#f93232'}}), 
            React.DOM.dd({style: {'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}, "Expenses (hosting, maintenance, etc.)"), 
            React.DOM.dt({style: {'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#fd6b2f'}}), 
            React.DOM.dd({style: {'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}, "Assembly"), 
            React.DOM.dt({style: {'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#e9ad1a'}}), 
            React.DOM.dd({style: {'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}, "App Coin holders")
          ), 
          React.DOM.strong(null, this.state.month)
        )
      );
    },

    _onChange: function() {
      this.setState({ month: FinancialsStore.getMonth() });
    }
  });

  var FinancialsMeter = React.createClass({displayName: 'FinancialsMeter',
    componentWillMount: function() {
      this.setState({
        month: FinancialsStore.getMonth()
      })
    },

    componentDidMount: function() {
      FinancialsActions.addChangeListener(this._onChange)
    },

    _onChange: function(state) {
      this.setState({ month: FinancialsStore.getMonth() })
    },

    render: function() {
      var name = this.props.product.name;
      var total = this.props.financials[this.state.month];
      var costs = this.props.costs[this.state.month];

      var annuity = calculateAnnuity(total, costs, this.props.annuity);
      var expenses = calculateExpenses(total, costs);
      var communityShare = calculateCommunityShare(total, costs, this.props.annuity);
      var assemblyShare = communityShare * 0.1;
      communityShare = communityShare - assemblyShare;

      var annuityWidth = annuity / total * 100;
      var costsWidth = expenses / total * 100;
      var communityWidth = communityShare / total * 100;
      var assemblyWidth = assemblyShare / total * 100 ;

      if (assemblyShare > 0) {
        assemblyWidth += 5;
        annuityWidth -= 5;
      }

      return (
        React.DOM.div({className: "progress"}, 
          React.DOM.div({id: name + '-meter', 
               className: "progress-bar", 
               role: "progress-bar", 
               style: { width: annuityWidth + '%'}}, 
            React.DOM.span(null, '$' + numeral(annuity).format('0,0'))
          ), 
          React.DOM.div({id: "costs-share", 
               className: "progress-bar progress-bar-danger", 
               role: "progress-bar", 
               style: { width: costsWidth + '%'}}, 
            React.DOM.span(null, '$' + numeral(expenses).format('0,0'))
          ), 
          React.DOM.div({id: "assembly-share", 
               className: "progress-bar", 
               role: "progress-bar", 
               style: { width: assemblyWidth + '%', 'background-color': '#fd6b2f'}}, 
            React.DOM.span(null, '$' + numeral(assemblyShare).format('0,0'))
          ), 
          React.DOM.div({id: "community-meter", 
               className: "progress-bar progress-bar-warning", 
               role: "progress-bar", 
               style: { width: communityWidth + '%'}}, 
            React.DOM.span(null, '$' + numeral(communityShare).format('0,0'))
          )
        )
      );
    }
  });

  var FinancialsTable = React.createClass({displayName: 'FinancialsTable',
    componentWillMount: function() {
      this.setState({
        month: FinancialsStore.getMonth()
      })
    },

    componentDidMount: function() {
      FinancialsActions.addChangeListener(this._onChange)
    },

    _onChange: function(state) {
      this.setState({ month: FinancialsStore.getMonth() })
    },

    render: function() {
      var name = this.props.product.name;

      return (
        React.DOM.div({className: "table-responsive"}, 
          React.DOM.table({className: "table table-hover"}, 
            React.DOM.thead(null, 
              React.DOM.tr(null, 
                React.DOM.th(null), 
                React.DOM.th({className: "text-left"}, 
                  "Total revenue"
                ), 
                React.DOM.th({className: "text-right"}, 
                  "Expenses"
                ), 
                React.DOM.th({className: "text-right"}, 
                  name
                ), 
                React.DOM.th({className: "text-right"}, 
                  "Assembly"
                ), 
                React.DOM.th({className: "text-right"}, 
                  "App Coin holders"
                )
              )
            ), 
            React.DOM.tbody(null, 
              this.tBody()
            )
          )
        )
      );
    },

    tBody: function() {
      var self = this;
      var financials = this.props.financials;

      return _.map(Object.keys(financials), function mapFinancials(month) {
        var total = financials[month];
        var costs = self.props.costs[month];

        var profit = calculateProfit(total, costs);
        var annuity = calculateAnnuity(total, costs, self.props.annuity);
        var expenses = calculateExpenses(total, costs);
        var communityShare = calculateCommunityShare(total, costs, self.props.annuity);
        var assemblyShare = communityShare * 0.1;

        return (
          self.tRow(month, total, annuity, expenses, assemblyShare, communityShare)
        );
      });
    },

    tRow: function(month, total, annuity, costs, assembly, community) {
      var muted = '';
      if (['January', 'February', 'March', 'April', 'May'].indexOf(month) >= 0) {
        muted = ' text-muted';
      }

      return (
        React.DOM.tr({style: {cursor: 'pointer'}, onMouseOver: this.monthChanged(month), key: month}, 
          React.DOM.td({id: 'financials-' + month}, month), 
          React.DOM.td(null, '$' + numeral(total).format('0,0')), 
          React.DOM.td({className: "text-right"}, '$' + numeral(costs).format('0,0')), 
          React.DOM.td({className: "text-right"}, '$' + numeral(annuity).format('0,0')), 
          React.DOM.td({className: "text-right" + muted}, '$' + numeral(assembly).format('0,0')), 
          React.DOM.td({className: "text-right" + muted}, '$' + numeral(community - assembly).format('0,0'))
        )
      );
    },

    monthChanged: function(month) {
      return function(e) {
        FinancialsStore.setMonth(month);
        FinancialsActions.sendChange(month);
      };
    }
  });

  function calculateProfit(total, costs) {
    total = parseInt(total, 10);
    costs = parseInt(costs, 10);

    return total - costs;
  }

  function calculateExpenses(total, costs) {
    total = parseInt(total, 10);
    costs = parseInt(costs, 10);

    return costs;
  }

  function calculateAnnuity(total, costs, annuity) {
    total = parseInt(total, 10);
    costs = calculateExpenses(total, parseInt(costs, 10));
    annuity = parseInt(annuity, 10);

    var profit = calculateProfit(total, costs);

    return profit < annuity ? profit : annuity;
  }

  function calculateCommunityShare(total, costs, annuity) {
    total = parseInt(total, 10);
    costs = calculateExpenses(total, parseInt(costs, 10));
    annuity = parseInt(annuity, 10);

    var profit = calculateProfit(total, costs);

    return profit < annuity ? 0 : profit - annuity;
  }

  if (typeof module !== 'undefined') {
    module.exports = Financials;
  }

  window.Financials = Financials;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/form_group.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {
  var FormGroup = React.createClass({displayName: 'FormGroup',
    getDefaultProps: function() {
      return { error: null }
    },

    render: function() {
      var classes = React.addons.classSet({
        'form-group': true,
        'has-error': this.props.error,
        'has-feedback': this.props.error
      })
      return (
        React.DOM.div({className: classes}, 
          this.props.children, 
          this.props.error ? this.errorGlyph() : null, 
          this.props.error ? this.errorMessage() : null
        )
      )
    },

    errorGlyph: function() {
      return React.DOM.span({className: "glyphicon glyphicon-remove form-control-feedback"})
    },

    errorMessage: function() {
      return React.DOM.span({className: "help-block"}, this.props.error)
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = FormGroup;
  }

  window.FormGroup = FormGroup;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/full_page_news_feed.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var NewsFeedMixin = require('../mixins/news_feed.js.jsx');
var NewsFeedStore = require('../stores/news_feed_store');
var Avatar = require('./avatar.js.jsx');

(function() {
  var NF = CONSTANTS.NEWS_FEED;

  var FullPageNewsFeed = React.createClass({displayName: 'FullPageNewsFeed',
    mixins: [NewsFeedMixin],

    componentWillMount: function() {
      NewsFeedStore.addChangeListener(this.getStories);
      this.fetchNewsFeed();

      this.onPush(function() {
        this.fetchNewsFeed();
      }.bind(this));
    },

    fetchNewsFeed: _.debounce(function() {
      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_STORIES,
        event: NF.EVENTS.STORIES_FETCHED,
        data: this.props.url
      });
    }, 1000),

    getInitialState: function() {
      return {
        stories: null
      };
    },

    moreStories: function() {
      var lastStory = this.state.stories[this.state.stories.length - 1];

      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_MORE_STORIES,
        event: NF.EVENTS.STORIES_FETCHED,
        data: this.props.url + '?top_id=' + lastStory.id
      });
    },

    onPush: function(fn) {
      if (window.pusher) {
        channel = window.pusher.subscribe('@' + this.props.user.username);
        channel.bind_all(fn);
      }
    },

    render: function() {
      return (
        React.DOM.div({className: "sheet", style: { 'min-height': '600px'}}, 
          React.DOM.div({className: "page-header sheet-header", style: { 'padding-left': '20px'}}, 
            React.DOM.h2({className: "page-header-title"}, "Your notifications")
          ), 

          React.DOM.div({className: "list-group list-group-breakout", ref: "spinner"}, 
            this.state.stories ? this.rows(this.state.stories) : null
          ), 

          React.DOM.a({href: "#more", className: "btn btn-block", onClick: this.moreStories}, "More")
        )
      );
    },

    rows: function(stories) {
      var rows = [];

      for (var i = 0, l = stories.length; i < l; i++) {
        rows.push(
          React.DOM.div({className: "list-group-item", key: stories[i].key}, 
            Entry({story: stories[i], actors: this.state.actors, fullPage: this.props.fullPage})
          )
        );
      }

      return rows;
    }
  });

  var Entry = React.createClass({displayName: 'Entry',
    actors: function() {
      return _.map(
        this.props.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    body: function() {
      var target = this.props.story.activities[0].target;

      return (
        React.DOM.span(null, 
          this.verbMap[this.props.story.verb], 
          React.DOM.strong(null, 
            this.subjectMap[this.props.story.subject_type].call(this, target)
          )
        )
      );
    },

    isRead: function() {
      return this.props.story.last_read_at != null;
    },

    markAsRead: function() {
      Dispatcher.dispatch({
        event: NF.EVENTS.READ,
        action: NF.ACTIONS.MARK_AS_READ,
        data: this.props.story.id
      });
    },

    markAsReadButton: function() {
      if (!this.isRead()) {
        return React.DOM.span({className: "icon icon-disc", onClick: this.markAsRead, title: 'Mark as read', style: { cursor: 'pointer'}});
      }

      // TODO: Mark as unread
      return React.DOM.span({className: "icon icon-circle", style: { cursor: 'pointer'}});
    },

    preview: function() {
      var bodyPreview = this.props.story.body_preview;

      return (
        React.DOM.p({className: "text-muted", style: { 'text-overflow': 'ellipsis'}}, 
          bodyPreview
        )
      );
    },

    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead(),
      });

      var productName = this.props.story.product.name;

      return (
        React.DOM.div({className: classes}, 
          React.DOM.div({className: "row"}, 
            React.DOM.div({className: "col-md-3"}, 
              React.DOM.a({href: '/' + this.props.story.product.slug}, productName), 
              React.DOM.br(null), 
              React.DOM.span({className: "text-muted text-small"}, 
                this.timestamp()
              )
            ), 

            React.DOM.div({className: "col-md-8"}, 
              React.DOM.a({className: classes, href: this.props.story.url, onClick: this.markAsRead}, 
                React.DOM.span({style: { 'margin-right': '5px'}}, 
                  Avatar({user: this.actors()[0]})
                ), 
                React.DOM.strong(null, actors), " ", this.body()
              ), 
              React.DOM.span({className: "text-small text-muted"}, 
                this.preview()
              )
            ), 

            React.DOM.div({className: 'col-md-1 ' + classes}, 
              this.markAsReadButton()
            )
          )
        )
      );
    },

    timestamp: function() {
      return moment(this.props.story.created).format("ddd, hA")
    },

    subjectMap: {
      Task: function(task) {
        return "#" + task.number + " " + task.title;
      },

      Discussion: function(discussion) {
        return 'a discussion';
      },

      Wip: function(bounty) {
        if (this.props.fullPage) {
          return "#" + bounty.number + " " + bounty.title;
        }

        return "#" + bounty.number;
      },
    },

    verbMap: {
      'Comment': 'commented on ',
      'Award': 'awarded',
      'Close': 'closed '
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = FullPageNewsFeed;
  }

  window.FullPageNewsFeed = FullPageNewsFeed;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../mixins/news_feed.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/mixins/news_feed.js.jsx","../stores/news_feed_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/news_feed_store.js","./avatar.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/avatar.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/input_preview.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var FormGroup = require('./form_group.js.jsx');

(function() {
  var InputPreview = React.createClass({displayName: 'InputPreview',
    getInitialState: function() {
      return {
        inputPreview: '',
        transform: this.props.transform || this.transform
      };
    },

    render: function() {
      return (
        FormGroup(null, 
          React.DOM.div({className: "input-group", style: { width: '35%'}}, 
            React.DOM.input({type: "text", 
                name: this.props.inputName, 
                className: "form-control", 
                value: this.state.inputPreview, 
                placeholder: this.props.placeholder, 
                onChange: this.onChange}), 
            React.DOM.span({className: "input-group-btn"}, 
              React.DOM.button({type: "submit", onSubmit: this.onSubmit, className: "btn btn-primary", disabled: this.buttonState()}, this.props.buttonText)
            )
          ), 
          React.DOM.p({className: "text-muted omega", style: { 'margin-top': '5px', 'margin-left': '1px'}}, 
            "Preview: ", React.DOM.strong(null, this.props.addonText + this.state.inputPreview)
          )
        )
      );
    },

    onChange: function(e) {
      var value = e.target.value;

      this.setState({
        inputPreview: this.state.transform(value)
      });
    },

    buttonState: function() {
      return this.state.inputPreview.length >= 2 ? false : true;
    },

    transform: function(text) {
      return text.replace(/[^\w-\.]+/g, '-').toLowerCase();
    },

    onSubmit: function(e) {
      e.preventDefault();
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InputPreview;
  }

  window.InputPreview = InputPreview;
})();

},{"./form_group.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/form_group.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/interest_picker.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var InterestStore = require('../stores/interest_store');

(function() {
  var IP = CONSTANTS.INTEREST_PICKER;

  var keys = {
    enter: 13,
    esc: 27,
    up: 38,
    down: 40,
    delete: 8
  };

  var InterestPicker = React.createClass({displayName: 'InterestPicker',
    getInitialState: function() {
      return {
        selectedInterests: InterestStore.getInterests(),
        highlightIndex: 0,
        visibleInterests: [],
        userInput: ''
      };
    },

    componentWillMount: function() {
      if (this.props.userInterests && this.props.userInterests.length) {
        InterestStore.setInterests(this.props.userInterests);
      }

      InterestStore.addChangeListener(this.onStoreChange);
    },

    render: function() {
      return (
        React.DOM.div({style: { position: 'relative', cursor: 'text'}}, 
          React.DOM.select({
              name: this.props.name, 
              multiple: "true", 
              style: { display: 'none'}, 
              value: this.state.selectedInterests}, 
            this.formatSelected('option')
          ), 
          React.DOM.ul({
              className: "pill-list", 
              ref: "container", 
              onClick: this.handleContainerClick}, 
            this.formatSelected('pill'), 
            React.DOM.li(null, 
              React.DOM.input({
                  type: "text", 
                  ref: "userInput", 
                  onChange: this.handleChange, 
                  onKeyDown: this.handleKeyDown, 
                  onFocus: this.handleFocus, 
                  onBlur: this.handleBlur, 
                  value: this.state.userInput}
              )
            )
          ), 
           this.state.visibleInterests.length > 0 && this.state.show ? this.interestDropdown() : null
        )
      );
    },

    interestDropdown: function() {
      return (
        InterestDropdown({
            interests: this.state.visibleInterests, 
            highlightIndex: this.state.highlightIndex, 
            onInterestSelected: this.onInterestSelected}
        )
      );
    },

    handleContainerClick: function(e) {
      e.preventDefault();
      this.refs.userInput.getDOMNode().focus();
    },

    handleChange: function(e) {
      var value = e.target.value;
      var visibleInterests = this.getVisibleInterests(value);

      this.setState({
        userInput: this.transform(value),
        visibleInterests: visibleInterests
      });
    },

    handleKeyDown: function(e) {
      if (e.keyCode === keys.up) {
        e.preventDefault();
        this.moveHighlight(-1);
      } else if (e.keyCode === keys.down) {
        e.preventDefault();
        this.moveHighlight(1);
      } else if (e.keyCode === keys.delete) {
        if (this.state.userInput === '') {
          return Dispatcher.dispatch({
            action: IP.ACTIONS.POP,
            event: IP.EVENTS.POPPED
          });
        }
      } else if (e.keyCode === keys.enter) {
        e.preventDefault();
        this.selectCurrentInterest();
      }
    },

    getVisibleInterests: function(value) {
      var interests = _.filter(this.props.interests, function(interest) {
        return interest.indexOf(value) >= 0 && InterestStore.getInterests().indexOf(interest) === -1;
      });

      if (value && interests.indexOf(value) === -1) {
        interests.push(value);
      }

      return interests;
    },

    moveHighlight: function(inc) {
      var index = this.constrainHighlight(this.state.highlightIndex + inc);

      this.setState({
        highlightIndex: index
      });
    },

    constrainHighlight: function(index) {
      return Math.max(
        0, Math.min(this.state.visibleInterests.length - 1, index)
      );
    },

    selectCurrentInterest: function() {
      Dispatcher.dispatch({
        action: IP.ACTIONS.ADD_INTEREST,
        event: IP.EVENTS.INTEREST_ADDED,
        data: this.state.visibleInterests[this.state.highlightIndex]
      });
    },

    onStoreChange: function() {
      this.setState({
        visibleInterests: [],
        selectedInterests: InterestStore.getInterests(),
        userInput: ''
      });
    },

    transform: function(text) {
      return text.replace(/[^\w-]+/g, '-').toLowerCase();
    },

    handleFocus: function(e) {
      this.refs.container.getDOMNode().style.cssText = "border: 1px solid #48a3ed; box-shadow: 0px 0px 3px #66afe9";

      this.setState({
        show: true,
        visibleInterests: _.difference(this.props.interests, InterestStore.getInterests())
      });
    },

    handleBlur: function(e) {
      this.refs.container.getDOMNode().style.cssText = '';

      var self = this;

      // FIXME: There has to be a better way to handle this:
      //        The issue is that hiding the dropdown on blur
      //        causes selecting an item to fail without a
      //        timeout of ~200 to ~300 ms.
      setTimeout(function() {
        self.setState({
          show: false
        });
      }, 300);
    },

    onInterestSelected: function(e) {
      Dispatcher.dispatch({
        action: IP.EVENTS.ADD_INTEREST,
        event: IP.EVENTS.INTEREST_ADDED,
        data: ''
      });
    },

    handleRemove: function(interest) {
      Dispatcher.dispatch({
        action: IP.ACTIONS.REMOVE_INTEREST,
        event: IP.EVENTS.INTEREST_REMOVED,
        data: interest
      });
    },

    formatSelected: function(optionOrPill) {
      var interests = InterestStore.getInterests();
      var selectedInterests = _.map(interests, this.interestTo[optionOrPill].bind(this));

      return selectedInterests;
    },

    interestTo: {
      option: function(interest) {
        return React.DOM.option({value: interest, key: interest}, interest)
      },

      pill: function(interest) {
        return (
          React.DOM.li({className: "interest-choice", key: interest}, 
            React.DOM.a({className: "interest-close", onClick: this.handleRemove.bind(this, interest)}, "@", interest, " ×")
          )
        );
      }
    }
  });

  var InterestDropdown = React.createClass({displayName: 'InterestDropdown',
    render: function() {
      var style = {
        position: 'absolute',
        'z-index': 100,
        top: 45,
        left: 0,
        width: '100%',
        display: 'block'
      };

      return (
        React.DOM.ul({className: "dropdown-menu", style: style}, 
          this.rows()
        )
      );
    },

    rows: function() {
      var i = -1;

      var interests = _.map(this.props.interests, function(interest) {
        i++;

        return (
          InterestDropdownEntry({
              key: interest, 
              interest: interest, 
              selected: i === this.props.highlightIndex}
          )
        );
      }.bind(this));

      return interests;
    }
  });

  var InterestDropdownEntry = React.createClass({displayName: 'InterestDropdownEntry',
    render: function() {
      var interest = this.props.interest;
      var className = 'textcomplete-item';

      if (this.props.selected) {
        className += ' active';
      }

      return (
        React.DOM.li({className: className}, 
          React.DOM.a({href: '#@' + interest, style: { cursor: 'pointer'}, onClick: this.handleInterestSelected.bind(this, interest)}, 
            "@", this.props.interest
          )
        )
      );
    },

    handleInterestSelected: function(interest) {
      Dispatcher.dispatch({
        action: IP.ACTIONS.ADD_INTEREST,
        event: IP.EVENTS.INTEREST_ADDED,
        data: interest
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InterestPicker;
  }

  window.InterestPicker = InterestPicker;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/interest_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/interest_store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_bounty_form.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var FormGroup = require('./form_group.js.jsx');
(function() {
  var InviteBountyForm = React.createClass({displayName: 'InviteBountyForm',
    getDefaultProps: function() {
      return { model: 'invite' }
    },
    getInitialState: function() {
      return { errors: {} }
    },

    render: function() {
      return (
        React.DOM.form({style: {width:300}, onSubmit: this.handleSubmit}, 
          this.props.children, 
          React.DOM.hr(null), 
          FormGroup({error: this.state.errors.username_or_email}, 
            React.DOM.label({className: "control-label"}, "Username or email address"), 
            React.DOM.input({name: "invite[username_or_email]", type: "text", placeholder: "friend@example.com", className: "form-control"})
          ), 
          FormGroup({error: this.state.errors.note}, 
            React.DOM.label(null, "Personal note"), 
            React.DOM.textarea({name: "invite[note]", placeholder: this.props.notePlaceholder, className: "form-control"})
          ), 
          FormGroup({error: this.state.errors.tip_cents}, 
            React.DOM.label(null, "Leave a tip"), 
            React.DOM.p({className: "help-block"}, "Start off on the right foot; generosity always pays off."), 

            React.DOM.div({className: "btn-group text-center", 'data-toggle': "buttons", style: {width:'100%'}}, 
              React.DOM.label({className: "btn btn-default active", style: {width:'34%'}}, 
                React.DOM.input({type: "radio", name: "invite[tip_cents]", value: "1000", defaultChecked: true}), 
                React.DOM.span({className: "icon icon-app-coin text-coins"}), React.DOM.span({className: "text-coins"}, "10")
              ), 
              React.DOM.label({className: "btn btn-default", style: {width:'33%'}}, 
                React.DOM.input({type: "radio", name: "invite[tip_cents]", value: "10000"}), 
                React.DOM.span({className: "icon icon-app-coin text-coins"}), React.DOM.span({className: "text-coins"}, "100")
              ), 
              React.DOM.label({className: "btn btn-default", style: {width:'33%'}}, 
                React.DOM.input({type: "radio", name: "invite[tip_cents]", value: "50000"}), " ", React.DOM.span({className: "icon icon-app-coin text-coins"}), React.DOM.span({className: "text-coins"}, "500")
              )
            )
          ), 
          React.DOM.hr(null), 
          React.DOM.input({type: "hidden", name: "invite[via_type]", value: this.props.via_type}), 
          React.DOM.input({type: "hidden", name: "invite[via_id]", value: this.props.via_id}), 
          React.DOM.button({className: "btn btn-primary btn-block", style: {"margin-bottom":20}}, "Send message")
        )
      )
    },

    handleSubmit: function(e) {
      e.preventDefault()
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: $(e.target).serialize(),
        success: function(data) {
          this.props.onSubmit(data)
        }.bind(this),
        error: function(xhr, status, err) {
          if (xhr.responseJSON && xhr.responseJSON.errors) {
            this.handleErrors(xhr.responseJSON.errors)
          }
        }.bind(this)
      });
    },

    handleErrors: function(errors) {
      this.setState({errors: errors})
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InviteBountyForm;
  }

  window.InviteBountyForm = InviteBountyForm;
})();

},{"./form_group.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/form_group.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_friend_bounty.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Popover = require('./popover.js.jsx');
var InviteBountyForm = require('./invite_bounty_form.js.jsx');

(function() {
  var InviteFriendBounty = React.createClass({displayName: 'InviteFriendBounty',
    getInitialState: function() {
      return { modal: false, invites: this.props.invites };
    },

    render: function() {
      return (
        React.DOM.div(null, 
          React.DOM.a({className: "btn btn-default btn-block btn-sm", href: "#help-me", onClick: this.click}, "Invite a friend to help"), 
          this.state.invites.length > 0 ? InviteList({invites: this.state.invites}) : null, 
          this.state.modal ? this.popover() : null
        )
      )
    },

    popover: function() {
      return (
        Popover({placement: "left", positionLeft: -325, positionTop: -120}, 
          InviteBountyForm({url: this.props.url, 
                            via_type: this.props.via_type, 
                            via_id: this.props.via_id, 
                            onSubmit: this.onSubmit.bind(this), 
                            notePlaceholder: "Hey! This bounty seems right up your alley"}, 

            React.DOM.h2({className: "alpha"}, "Ask a friend"), 
            React.DOM.p({className: "text-muted"}, "Know somebody who could help with this? Anybody can help out, all you need to do is ask.")
          )
        )
      )
    },

    click: function() {
      this.setState({modal: !this.state.modal})
    },

    onSubmit: function(invite) {
      this.setState(
        React.addons.update(this.state, {
          invites: {$push: [invite] },
          modal: {$set: false }
        })
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InviteFriendBounty;
  }

  window.InviteFriendBounty = InviteFriendBounty;
})();

},{"./invite_bounty_form.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_bounty_form.js.jsx","./popover.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/popover.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_friend_product.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Popover = require('./popover.js.jsx');
var InviteBountyForm = require('./invite_bounty_form.js.jsx');

(function() {
  var InviteFriendProduct = React.createClass({displayName: 'InviteFriendProduct',
    getInitialState: function() {
      return { modal: false, invites: this.props.invites };
    },

    render: function() {
      return (
        React.DOM.div(null, 
          React.DOM.button({className: "btn btn-default btn-sm btn-block", style: {"margin-bottom":16}, onClick: this.click}, "Invite a friend"), 
          this.state.invites.length > 0 ? InviteList({invites: this.state.invites}) : null, 
          this.state.modal ? this.popover() : null
        )
      )
    },

    popover: function() {
      return (
        Popover({placement: "left", positionLeft: -325, positionTop: -129}, 
          InviteBountyForm({url: this.props.url, 
                            via_type: this.props.via_type, 
                            via_id: this.props.via_id, 
                            onSubmit: this.onSubmit.bind(this), 
                            notePlaceholder: this.props.notePlaceholder}, 

            React.DOM.h2({class: "alpha"}, "Ask a friend"), 
            React.DOM.p({className: "text-muted"}, "Know somebody who could help with this? Anybody can help out, all you need to do is ask.")

          )
        )
      )
    },

    click: function() {
      this.setState({modal: !this.state.modal})
    },

    onSubmit: function(invite) {
      this.setState(
        React.addons.update(this.state, {
          invites: {$push: [invite] },
          modal: {$set: false }
        })
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InviteFriendProduct;
  }

  window.InviteFriendProduct = InviteFriendProduct;
})();

},{"./invite_bounty_form.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_bounty_form.js.jsx","./popover.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/popover.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_list.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

(function() {
  var InviteList = React.createClass({displayName: 'InviteList',
    render: function() {
      var inviteNodes = _.map(this.props.invites, function(invite) {
        return InviteEntry({key: invite.id, id: invite.id, invitee_email: invite.invitee_email, invitee: invite.invitee})
      })
      return (
        React.DOM.div({className: "panel panel-default"}, 
          React.DOM.ul({className: "list-group list-group-breakout small omega"}, 
            ReactCSSTransitionGroup({transitionName: "invite"}, 
              inviteNodes
            )
          )
        )
      )
    },
  });

  var InviteEntry = React.createClass({displayName: 'InviteEntry',
    render: function() {
      return (
        React.DOM.li({className: "list-group-item", key: this.props.id}, 
        this.label()
        )
      )
    },

    label: function() {
      if (this.props.invitee) {
        return React.DOM.span(null, "Invited ", React.DOM.a({href: this.props.invitee.url}, "@", this.props.invitee.username))
      } else {
        return React.DOM.span(null, "Emailed ", this.props.invitee_email)
      }

    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InviteList;
  }

  window.InviteList = InviteList;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/join_team_view.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var Dispatcher = require('../dispatcher');

(function() {
  var JoinTeam = React.createClass({displayName: 'JoinTeam',
    componentWillMount: function() {
      this.setState({
        count: this.props.count,
        is_member: this.props.is_member
      });
    },

    render: function() {
      return (
        React.DOM.div({className: "toggler toggler-sm"}, 
          this.label(), 
          React.DOM.div({className: "toggler-badge"}, 
            React.DOM.a({href: this.props.join_path}, this.state.count)
          )
        )
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
          React.DOM.a({className: "toggler-btn btn btn-" + this.button(), 'data-toggle': "popover", onClick: this.click()}, 
            React.DOM.i({className: "icon icon-user-unfollow", style: {'margin-right': '5px',}}), 
            "Leave Team"
          )
        )
      }

      return (
        React.DOM.a({className: "toggler-btn btn btn-" + this.button(), 'data-toggle': "popover", onClick: this.click(), 
            role: "button", 
            id: "js-join-popover"}, 
          React.DOM.i({className: "icon icon-user-follow", style: {'margin-right': '5px'}}), 
          "Join Team"
        )
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

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/members_view.js.jsx":[function(require,module,exports){
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

  var MembersView = React.createClass({displayName: 'MembersView',

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
        marker = (React.DOM.span({className: "indicator indicator-success"}, " "))
      } else {
        marker = (React.DOM.span({className: "indicator indicator-default"}, " "))
      }

      return (
        React.DOM.div({key: member.id}, 
          React.DOM.a({className: classes, href: member.url}, 
            React.DOM.div({className: "pull-right"}, 
            marker
            ), 
            React.DOM.img({className: "avatar", src: member.avatar_url, width: "16", height: "16", alt: member.username, style: {marginRight: 10}}), 
            member.username
          )
        )
      )
    },

    render: function() {
      return (
        React.DOM.div({className: "panel-group", id: "accordion"}, 
          React.DOM.div({className: "panel panel-default"}, 
            React.DOM.div({className: "panel-heading"}, 
              React.DOM.h6({className: "panel-title"}, "Online")
            ), 
            React.DOM.div({className: "panel-body small"}, 
              
                _.map(this.onlineMembers(), this.renderMember)
              
            ), 
            React.DOM.div({className: "panel-heading"}, 
              React.DOM.a({'data-toggle': "collapse", 'data-parent': "#accordion", href: "#collapseRecent", className: "text-muted"}, 
                React.DOM.i({className: "icon icon-chevron-up pull-right"}), 
                React.DOM.h6({className: "panel-title"}, "Recently Active")
              )
            ), 
            React.DOM.div({id: "collapseRecent", className: "panel-collapse collapse in"}, 
              React.DOM.div({className: "panel-body small"}, 
              
                _.map(this.recentlyActiveMembers(), this.renderMember)
              
              )
            )
          )
        )
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
  });

  if (typeof module !== 'undefined') {
    module.exports = MembersView;
  }

  window.MembersView = MembersView;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/navbar.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var TitleNotificationsCount = require('./title_notifications_count.js.jsx');
var DropdownNewsFeedToggler = require('./dropdown_news_feed_toggler.js.jsx');
var DropdownNewsFeed = require('./dropdown_news_feed.js.jsx');
var ChatNotificationsToggler = require('./chat_notifications_toggler.js.jsx');
var ChatNotifications = require('./chat_notifications.js.jsx');
var UserNavbarDropdown = require('./user_navbar_dropdown.js.jsx');
var Avatar = require('./avatar.js.jsx');

(function() {
  var Navbar = React.createClass({displayName: 'Navbar',
    getDefaultProps: function() {
      return {
        user: app.currentUser().attributes
      };
    },

    render: function() {
      var user = this.props.currentUser;

      return (
        React.DOM.ul({className: "nav navbar-nav"}, 
          React.DOM.li(null, 
            TitleNotificationsCount(null)
          ), 

          React.DOM.li(null, 
            DropdownNewsFeedToggler({
                iconClass: "icon-bell", 
                href: "#stories", 
                label: "Notifications"}), 

            DropdownNewsFeed({
                url: this.props.newsFeedPath, 
                username: this.props.user.username, 
                editUserPath: this.props.editUserPath})
          ), 

          React.DOM.li(null, 
            ChatNotificationsToggler({
              iconClass: "icon-bubbles", 
              href: "#notifications", 
              label: "Chat"}), 

            ChatNotifications({
                url: this.props.chatPath, 
                username: this.props.user.username}
            )
          ), 

          React.DOM.li({className: "dropdown"}, 
            React.DOM.a({href: "#", className: "dropdown-toggle", 'data-toggle': "dropdown"}, 
              Avatar({user: this.props.user}), 
              React.DOM.span({className: "visible-xs-inline", style: { 'margin-left': '5px'}}, 
                this.props.user.username
              )
            ), 

            this.transferPropsTo(UserNavbarDropdown(null))
          )
        )
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Navbar;
  }

  window.Navbar = Navbar;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","./avatar.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/avatar.js.jsx","./chat_notifications.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/chat_notifications.js.jsx","./chat_notifications_toggler.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/chat_notifications_toggler.js.jsx","./dropdown_news_feed.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/dropdown_news_feed.js.jsx","./dropdown_news_feed_toggler.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/dropdown_news_feed_toggler.js.jsx","./title_notifications_count.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/title_notifications_count.js.jsx","./user_navbar_dropdown.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/user_navbar_dropdown.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/notification_preferences_dropdown.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var NotificationPreferencesDropdownStore = require('../stores/notification_preferences_dropdown_store');
var Avatar = require('./avatar.js.jsx');

(function() {
  var D = CONSTANTS.NOTIFICATION_PREFERENCES_DROPDOWN;

  var NotificationPreferencesDropdown = React.createClass({displayName: 'NotificationPreferencesDropdown',
    chevron: function() {
      if (this.state.chevron) {
        return React.DOM.span({className: "icon icon-chevron-down"});
      }

      return React.DOM.span({style: { 'margin-right': '7px', 'margin-left': '7px'}})
    },

    componentWillMount: function() {
      NotificationPreferencesDropdownStore.addChangeListener(this.handleUpdate);
    },

    getInitialState: function() {
      return {
        productWatchersCount: this.props.productWatchersCount,
        selected: this.props.watchingState,
        chevron: false
      };
    },

    hideChevron: function() {
      this.setState({
        chevron: false
      });
    },

    render: function() {
      return (
        React.DOM.div({className: "toggler toggler-sm btn-group", onMouseOver: this.showChevron, onMouseOut: this.hideChevron}, 
          React.DOM.a({
              className: this.buttonClasses(true), 
              'data-toggle': "dropdown", 
              style: { 'margin-bottom': '13px'}}, 
            this.buttonState(), 
            this.chevron()
          ), 
          React.DOM.div({className: "toggler-badge"}, 
            React.DOM.a({
                type: "button", 
                href: this.props.productWatchersPath, 
                style: { opacity: '0.5', 'border-top-right-radius': '2px', 'border-bottom-right-radius': '2px'}}, 
              this.state.productWatchersCount
            )
          ), 
          React.DOM.ul({
              className: "dropdown-menu dropdown-menu-right", 
              role: "menu", 
              style: { width: 'auto', position: 'absolute', top: '35px', 'padding-top': 0}}, 
            React.DOM.li({
                role: "presentation", 
                className: "dropdown-header", 
                style: { color: '#a6a6a6', 'background-color': '#f3f3f3'}}, 
              React.DOM.strong(null, "Following Preferences")
            ), 

            React.DOM.li({role: "presentation", style: { cursor: 'pointer'}, className: this.selectedClass('not watching')}, 
              React.DOM.a({role: "menuitem", tabIndex: "-1", onClick: this.updatePreference.bind(this, 'not watching', this.props.productUnfollowPath)}, 
                React.DOM.div(null, 
                  React.DOM.strong(null, "Not following")
                ), 
                React.DOM.span({className: "text-muted"}, 
                  "Receive notifications when you are @mentioned"
                )
              )
            ), 

            React.DOM.li({role: "presentation", style: { cursor: 'pointer'}, className: this.selectedClass('watching')}, 
              React.DOM.a({role: "menuitem", tabIndex: "-1", onClick: this.updatePreference.bind(this, 'watching', this.props.productFollowPath)}, 
                React.DOM.div(null, 
                  React.DOM.strong(null, "Follow announcements only")
                ), 
                React.DOM.div({className: "text-muted"}, 
                  "Receive notifications when there are new blog posts"
                )
              )
            ), 

            React.DOM.li({role: "presentation", style: { cursor: 'pointer'}, className: this.selectedClass('subscribed')}, 
              React.DOM.a({role: "menuitem", tabIndex: "-1", onClick: this.updatePreference.bind(this, 'subscribed', this.props.productSubscribePath)}, 
                React.DOM.div(null, 
                  React.DOM.strong(null, "Follow")
                ), 
                React.DOM.div({className: "text-muted"}, 
                  "Receive notifications when there are new blog posts, discussions, and chat messages"
                )
              )
            )
          )
        )
      );
    },

    showChevron: function() {
      this.setState({
        chevron: true
      });
    },

    handleUpdate: function() {
      this.setState({
        selected: NotificationPreferencesDropdownStore.getSelected()
      });
    },

    buttonState: function() {
      switch (this.state.selected) {
        case 'subscribed':
          return 'Following';
        case 'watching':
          return 'Following announcements only';
        case 'not watching':
          return 'Follow';
      }
    },

    buttonClasses: function(dropdownToggle) {
      return React.addons.classSet({
        'btn': true,
        'btn-primary': (this.state.selected === 'not watching'),
        'btn-default': (this.state.selected !== 'not watching'),
        'btn-sm': true,
        'dropdown-toggle': dropdownToggle
      })
    },

    selectedClass: function(option) {
      if (this.state.selected === option) {
        return "active";
      }
    },

    updatePreference: function(item, path) {
      Dispatcher.dispatch({
        event: D.EVENTS.SELECTED_UPDATED,
        action: D.ACTIONS.UPDATE_SELECTED,
        data: { item: item, path: path }
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NotificationPreferencesDropdown;
  }

  window.NotificationPreferencesDropdown = NotificationPreferencesDropdown;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/notification_preferences_dropdown_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/notification_preferences_dropdown_store.js","./avatar.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/avatar.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/number_input_view.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {
  var NumberInput = React.createClass({displayName: 'NumberInput',
    componentWillMount: function() {
      this.setState({
        amount: this.props.startingAmount,
        editable: this.props.alwaysEditable
      });
    },

    componentDidMount: function() {
      this.listenForChanges(this.refs.inputField && this.refs.inputField.getDOMNode());
    },

    componentDidUpdate: function() {
      this.componentDidMount();
    },

    render: function() {
      if (this.state.editable) {
        return this.editable();
      }

      return this.uneditable();
    },

    editable: function() {
      return (
        React.DOM.div({className: "input-group"}, 
          React.DOM.input({name: this.props.name, ref: "inputField", type: "number", className: "form-control", min: "0", step: "0.1", defaultValue: this.state.amount}), 
          React.DOM.span({className: "input-group-addon"}, "%")
        )
      );
    },

    uneditable: function() {
      var self = this;

      $('#edit-contract-' + this.props.user.username).click(function(e) {
        $(self.props.confirmButton).css('visibility', 'hidden');
        $(this).text() === 'Edit' ? $(this).text('Cancel') : $(this).text('Edit');
        self.setState({ editable: !self.state.editable });
      });

      return (React.DOM.span(null, React.DOM.strong(null, this.props.startingAmount + '%'), " tip when coins are minted"));
    },

    listenForChanges: function(node) {
      $(node).on('change keydown', this.handleChange);
    },

    handleChange: function(e) {
      var confirmLink = $(this.props.confirmButton);

      if (!_.isEmpty(confirmLink)) {
        var node = $(this.refs.inputField.getDOMNode());

        if (node && node.val() !== this.props.startingAmount) {
          confirmLink.css('visibility', 'visible');
          confirmLink.off('click');
          confirmLink.on('click', { node: node, self: this }, this.confirm);
        } else {
          confirmLink.css('visibility', 'hidden');
          confirmLink.off('click');
        }
      }
    },

    confirm: function(e) {
      var node = e.data.node;
      var self = e.data.self;
      var obj = {
        contract: {
          amount: node.val(),
          user: this.props.user.id
        }
      };

      _.debounce($.ajax({
        url: self.props.updatePath,
        method: 'PATCH',
        data: obj,
        success: self.handleSuccess,
        error: self.handleError
      }), 300);
    },

    handleSuccess: function(data) {
      window.location.reload(true);
    },

    handleError: function(jqxhr, status) {
      console.error(status);
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NumberInput;
  }

  window.NumberInput = NumberInput;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/people_view.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var PeopleStore = require('../stores/people_store');

(function() {
  var People = React.createClass({displayName: 'People',
    render: function(){
      if (this.props.coreOnly) {
        return (
          PeopleList({
            memberships: this.state.filteredMemberships, 
            selected: this.state.selected, 
            onFilter: this.onFilter, 
            interestFilters: this.props.interestFilters, 
            currentUser: this.props.currentUser, 
            updatePath: this.props.updatePath, 
            coreMemberships: this.props.coreMemberships})
        );
      }



      return (
        React.DOM.div(null, 
          PeopleFilter({
              interestFilters: this.props.interestFilters, 
              selected: this.state.selected, 
              onFilter: this.onFilter}), 
          React.DOM.hr(null), 
          React.DOM.p({className: "text-muted text-center"}, "Tip: You can use @mentions to get the attention of ", this.filterLabel(), " in chat or Bounties."), 
          React.DOM.hr(null), 
          PeopleList({
              memberships: this.state.filteredMemberships, 
              selected: this.state.selected, 
              onFilter: this.onFilter, 
              interestFilters: this.props.interestFilters, 
              currentUser: this.props.currentUser, 
              updatePath: this.props.updatePath, 
              coreMemberships: this.props.coreMemberships})
        )
      )
    },

    componentWillMount: function() {
      PeopleStore.setPeople(this.props.memberships);
      this.onFilter(this.props.selected);
    },

    componentDidMount: function() {
      PeopleStore.addChangeListener(this.onChange);
    },

    onChange: function() {
      this.onFilter(this.state.selected);
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
        return (React.DOM.span(null, " the ", React.DOM.a({style: {cursor: 'pointer'}}, "@", this.state.selected), " team"))
      } else {
        return 'these teams'
      }
    }
  })

  var PeopleFilter = React.createClass({displayName: 'PeopleFilter',
    render: function() {
      var self = this;
      var highlightAll = self.props && !self.props.selected ? 'primary': 'default';
      var highlightCore = self.props && self.props.selected === 'core' ? 'primary': 'default';

      var tags = _.map(this.props.interestFilters, function(interest){
        if (interest === 'core') {
          return;
        }

        var label = '@' + interest;
        var highlight = self.props && self.props.selected === interest ? 'primary' : 'default';

        return (
          React.DOM.a({className: 'btn btn-' + highlight, 
              href: '#' + label, 
              onClick: self.filterChanged(interest), 
              key: interest}, 
            label
          )
        )
      })

      return (
        React.DOM.div({className: "row"}, 
          React.DOM.div({className: "col-xs-2"}, 
            "Browse by:"
          ), 
          React.DOM.div({className: "col-xs-10 btn-group btn-group-sm"}, 
            React.DOM.a({className: 'text-muted btn btn-' + highlightAll, 
                onClick: this.clearInterest, 
                style: {cursor: 'pointer'}}, 
              "All"
            ), 
            React.DOM.a({className: 'text-muted btn btn-' + highlightCore, 
                onClick: this.highlightCore, 
                style: {cursor: 'pointer'}}, 
              "@core"
            ), 
            tags
          )
        )
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
  });

  var PeopleList = React.createClass({displayName: 'PeopleList',
    render: function() {
      return (
        React.DOM.div({className: "list-group list-group-breakout list-group-padded"}, 
          this.rows(this.props.memberships)
        )
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
          React.DOM.div({className: "row", 
            key: 'row-' + user.id, 
            style: {
              'padding-top': '15px',
              'padding-bottom': '15px',
              'border-bottom': '1px solid #ebebeb'
            }}, 
            this.avatar(user), 
            this.member(member)
          )
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
        React.DOM.div({className: "col-sm-1 col-xs-1 "}, 
          React.DOM.a({href: user.url, title: '@' + user.username}, 
            React.DOM.img({src: user.avatar_url, 
                className: "avatar", 
                alt: '@' + user.username, 
                width: "30", 
                height: "30"}
            )
          )
        )
      );
    },

    member: function(member) {
      if (!member) {
        return;
      }

      var user = member.user;

      return (
        React.DOM.div({className: "col-sm-11 col-xs-11"}, 
          React.DOM.p({className: "omega"}, 
            React.DOM.ul({className: "list-inline omega pull-right"}, 
              this.skills(member)
            ), 
            React.DOM.strong(null, 
              React.DOM.a({href: user.url, title: '@' + user.username}, 
                user.username
              )
            )
          ), 
          user.bio ? this.hasBio(user) : '', 
          React.DOM.div(null, 
            BioEditor({
                member: member, 
                onFilter: this.props.onFilter, 
                currentUser: this.props.currentUser, 
                updatePath: this.props.updatePath, 
                originalBio: member.bio, 
                interestFilters: this.props.interestFilters, 
                updateSkills: this.updateSkills, 
                selected: this.props.selected}
            )
          ), 
          this.coreTeamInfo(member)
        )
      )
    },

    coreTeamInfo: function(member) {
      var core = this.props.coreMemberships;

      if (core) {
        for (var i = 0, l = core.length; i < l; i++) {
          var c = core[i];

          if (c.user_id === member.user.id) {
            return (
              React.DOM.span({className: "text-muted"}, 'Core team since ' + _parseDate(c.created_at))
            )
          }
        }
      }
    },

    hasBio: function(user) {
      return (
        React.DOM.p({className: "text-muted text-small"}, 
          user.bio ? user.bio : ''
        )
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
          React.DOM.li(null, 
            React.DOM.span({className: 'label label-' + highlight, 
                key: membership.user.id + '-' + interest, 
                style: {cursor: 'pointer'}, 
                onClick: self.props.onFilter.bind(null, interest)}, 
              label
            )
          )
        );
      });
    }
  });

  var BioEditor = React.createClass({displayName: 'BioEditor',
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
        return React.DOM.div(null);
      }

      if (currentUser.id === member.user.id) {
        return (
          React.DOM.div(null, 
            React.DOM.div({className: "js-edit-bio", key: 'b-' + currentUser.id}, 
              member.bio, 
              " ", this.state.editing ? this.saveButton() : this.editButton()
            )
          )
        )
      }

      return (
        React.DOM.div({key: 'b-' + member.user.id}, 
          member.bio
        )
      )
    },

    editButton: function() {
      return (
        React.DOM.a({className: "text-small", style: { cursor: 'pointer'}, onClick: this.makeEditable}, "— Update Intro")
      )
    },

    saveButton: function() {
      return (
        React.DOM.div({className: "text-right", style: {'margin-top':'16px'}}, 
          React.DOM.a({className: "btn btn-default btn-sm", onClick: this.makeUneditable, style: {'margin-right' : '8px'}}, "Cancel"), 
          React.DOM.a({className: "btn btn-primary btn-sm", onClick: this.updateBio}, "Save")
        )
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
        return (React.DOM.option({value: interest}, '@' + interest));
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

},{"../stores/people_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/people_store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/person_picker.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var PersonPickerStore = require('../stores/person_picker_store');
var Avatar = require('./avatar.js.jsx');

(function() {

  var PP = CONSTANTS.PERSON_PICKER;

  var keys = {
    enter: 13,
    esc: 27,
    up: 38,
    down: 40
  }

  var PersonPicker = React.createClass({displayName: 'PersonPicker',
    getInitialState: function() {
      return { users: [], highlightIndex: 0 }
    },

    clearText: function() {
      this.refs.usernameOrEmail.getDOMNode().value = ''
      this.setState(this.getInitialState())
    },

    render: function(){
      return (
        React.DOM.div({style: {position: 'relative'}}, 
          React.DOM.input({className: "form-control input-sm", type: "text", 
                 ref: "usernameOrEmail", 
                 onChange: this.handleChange, 
                 onKeyDown: this.handleKey, 
                 onBlur: this.selectCurrentUser, 
                 placeholder: "@username or email address"}), 
          this.state.users.length > 0 ? this.userPicker() : null
        )
      )
    },

    userPicker: function(){
      return UserPicker({
        users: this.state.users, 
        highlightIndex: this.state.highlightIndex, 
        onUserSelected: this.handleUserSelected})
    },

    handleChange: function(e) {
      var text = this.refs.usernameOrEmail.getDOMNode().value
      if(this.isEmail(text)) {
        this.handleEmail(text)
      } else {
        this.handleUsername(text)
      }
    },

    handleUsername: function(text) {
      var postData = {
        suggest_username: {
          text: text,
          completion: {
            field: 'suggest_username'
          }
        }
      };

      $.ajax({
        url: this.props.url + '/users/_suggest',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify(postData),
        success: function(data) {
          var users = _.map(data.suggest_username[0].options, function(option) {
            return _.extend(option.payload, { username: option.text })
          })
          var index = this.constrainHighlight(this.state.highlightIndex)
          this.props.onValidUserChanged(users[index])
          this.setState({users: users, highlightIndex: index})
        }.bind(this),
        error: function(xhr, status, err) {
          console.error('error', arguments)
        }.bind(this)
      });
    },

    handleEmail: function(text) {
      this.props.onValidUserChanged({email: text})
      this.setState({users: []})
    },

    handleKey: function(e) {
      if (e.keyCode == keys.up) {
        e.preventDefault()
        this.moveHighlight(-1)
      } else if (e.keyCode == keys.down) {
        e.preventDefault()
        this.moveHighlight(1)
      } else if (e.keyCode == keys.enter) {
        e.preventDefault()
        this.selectCurrentUser()
      }
    },

    moveHighlight: function(inc) {
      var index = this.constrainHighlight(this.state.highlightIndex + inc)
      this.props.onValidUserChanged(this.state. users[index])
      this.setState({ highlightIndex: index })
    },

    selectCurrentUser: function() {
      var text = this.refs.usernameOrEmail.getDOMNode().value
      this.clearText()

      if (this.state.users.length > 0) {
        this.selectHighlight()
      } else if (this.isEmail(text)) {
        this.selectEmail(text)
      }
    },

    selectHighlight: function() {
      this.handleUserSelected(this.state.users[this.state.highlightIndex])
    },

    selectEmail: function(email) {
      this.props.onUserSelected({email: email})
    },

    handleUserSelected: function(user) {
      this.clearText()
      this.setState({ users: [] })
      this.props.onUserSelected(user)
    },

    constrainHighlight: function(index) {
      return Math.max(
        0, Math.min(this.state.users.length - 1, index)
      )
    },

    isEmail: function(text) {
      return /^@?\w+@/.exec(text)
    }
  })

  var UserPicker = React.createClass({displayName: 'UserPicker',
    render: function() {
      var style = {
        position: 'absolute',
        'z-index': 100,
        top: 27,
        left: 0,
        display: 'block'
      }

      return (
        React.DOM.ul({className: "dropdown-menu", style: style}, 
          this.rows()
        )
      )
    },

    rows: function() {
      var i = -1
      return _.map(this.props.users, function(user){
        i += 1
        return UserPickerEntry({key: user.username, user: user, selected: i === this.props.highlightIndex, onUserSelected: this.props.onUserSelected})
      }.bind(this))
    }
  })

  var UserPickerEntry = React.createClass({displayName: 'UserPickerEntry',
    render: function() {
      var className = 'textcomplete-item'
      if (this.props.selected) {
        className += ' active'
      }

      return (
        React.DOM.li({className: className}, 
          React.DOM.a({href: '#@' + this.props.user.username, onClick: this.handleUserSelected(this.props.user)}, 
            Avatar({user: this.props.user, 
                style: {'margin-right': '10px'}}), 
            "@", this.props.user.username, " ", React.DOM.span({className: "text-muted"}, this.props.user.name)
          )
        )
      )
    },

    handleUserSelected: function(user) {
      return function() {
        this.props.onUserSelected(user)
      }.bind(this)
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = PersonPicker;
  }

  window.PersonPicker = PersonPicker;

})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../stores/person_picker_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/person_picker_store.js","./avatar.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/avatar.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/popover.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {
  var Popover = React.createClass({displayName: 'Popover',
    propTypes: {
      placement: React.PropTypes.oneOf(['top','right', 'bottom', 'left']),
      positionLeft: React.PropTypes.number,
      positionTop: React.PropTypes.number,
      arrowOffsetLeft: React.PropTypes.number,
      arrowOffsetTop: React.PropTypes.number,
      title: React.PropTypes.renderable
    },

    getDefaultProps: function () {
      return {
        placement: 'right'
      };
    },

    render: function () {
      var classes = {
        popover: true,
        in: this.props.positionLeft != null || this.props.positionTop != null
      };

      classes[this.props.placement] = true;

      var style = {
        left: this.props.positionLeft,
        top: this.props.positionTop,
        display: 'block'
      };

      var arrowStyle = {
        left: this.props.arrowOffsetLeft,
        top: this.props.arrowOffsetTop
      };

      return (
        React.DOM.div({className: React.addons.classSet(classes), style: style}, 
          React.DOM.div({className: "arrow", style: arrowStyle}), 
          this.props.title ? this.renderTitle() : null, 
          React.DOM.div({className: "popover-content"}, 
            this.props.children
          )
        )
      );
    },

    renderTitle: function() {
      return (
        React.DOM.h3({className: "popover-title"}, this.props.title)
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Popover;
  }

  window.Popover = Popover;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/share.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var Popover = require('./popover.js.jsx');

(function() {
  var Share = React.createClass({displayName: 'Share',
    getInitialState: function() {
      return { modal: false };
    },

    render: function() {
      return (
        React.DOM.div(null, 
          React.DOM.a({href: "#", className: "btn btn-primary btn-sm", style: {'vertical-align': 'bottom'}, onClick: this.toggleModal}, 
            React.DOM.i({className: "icon icon-share-alt", style: {"margin-right": 2}}), 
            "Share"
          ), 
          this.state.modal ? this.popover() : null
        )
      )
    },

    toggleModal: function() {
      this.setState({modal: !this.state.modal})
    },

    popover: function() {
      return (
        Popover({placement: "bottom", positionLeft: 440, positionTop: 30, title: this.props.title}, 
          React.DOM.ul({className: "list list-unstyled"}, 
            React.DOM.li({style: {"margin-bottom": 10}}, 
              React.DOM.div({className: "row"}, 
                React.DOM.div({className: "col-md-6"}, 
                  React.DOM.a({className: "btn btn-twitter btn-block", onClick: this.handleTwitterClick}, 
                    React.DOM.i({className: "icon icon-twitter", style: {'margin-right': 2}}), 
                    "Twitter"
                  )
                ), 
                React.DOM.div({className: "col-md-6"}, 
                  React.DOM.a({className: "btn btn-facebook btn-block", href: "#", onClick: this.handleFacebookClick}, 
                    React.DOM.i({className: "icon icon-facebook", style: {'margin-right': 2}}), 
                    "Facebook"
                  )
                )
              )
            ), 
            React.DOM.li(null, 
              CopyLink({url: this.props.url})
            )
          )
        )
      )
    },

    handleTwitterClick: function() {
      window.open('http://twitter.com/share?url=' + this.props.url + '&text=' + this.props.shareText + '&', 'twitterwindow', 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
    },

    handleFacebookClick: function() {
      FB.ui({
        method: 'share',
        href: this.props.url,
      }, function(response){});
    }
  });

  var CopyLink = React.createClass({displayName: 'CopyLink',
    getInitialState: function() {
      return { label: 'Copy' }
    },

    render: function() {
      return (
        React.DOM.div({className: "input-group"}, 
          React.DOM.input({ref: "text", type: "text", className: "form-control", id: "share-url", value: this.props.url}), 
          React.DOM.span({className: "input-group-btn"}, 
            React.DOM.button({ref: "copy", className: "btn btn-default", type: "button"}, this.state.label)
          )
        )
      )
    },

    componentDidMount: function() {
      var self = this
      var client = new ZeroClipboard(this.refs.copy.getDOMNode())
      client.on('ready', function(event) {
        client.on('copy', function(event) {
          event.clipboardData.setData('text/plain', self.props.url)
        });

        client.on('aftercopy', function(event) {
          self.setState({label: 'Copied!'})
          setTimeout(function() {
            self.setState({label: 'Copy'})
          }, 1000)
        });
      })
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Share;
  }

  window.Share = Share;
})();

},{"./popover.js.jsx":"/Users/pletcher/Projects/meta/app/assets/javascripts/components/popover.js.jsx"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/tag_list_view.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var TagListStore = require('../stores/tag_list_store');

(function() {
  var TC = CONSTANTS.TEXT_COMPLETE;
  var TAG_LIST = CONSTANTS.TAG_LIST;

  var TagList = React.createClass({displayName: 'TagList',
    getInitialState: function() {
      return {
        tags: this.props.tags
      }
    },

    componentWillMount: function() {
      if (this.props.destination) {
        TagListStore.setTags(this.props.tags);
      }
    },

    render: function() {
      return (
        React.DOM.ul({className: "list-inline omega"}, 
          this.tags(this.state.tags)
        )
      );
    },

    tags: function(tags) {
      var self = this;
      var addedTags = TagListStore.getTags();

      var mappedTags = _.map(tags, function(tag) {
        var style = {
          'font-size': '14px',
          cursor: 'pointer'
        };

        if (!self.props.destination && addedTags.indexOf(tag) >= 0) {
          style.cursor = 'default';
          style.color = '#d3d3d3';
        }

        if (!tag) {
          return;
        }

        if (self.props.allowRemoval) {
          return (
            React.DOM.li({style: {'margin': '0px'}}, 
              React.DOM.a({style: style}, tag), React.DOM.span(null, React.DOM.a({style: {'margin-left': '2px', 'font-size': '10px', cursor: 'pointer'}, onClick: self.handleClick(tag)}, "×"))
            )
          );
        }

        return (
          React.DOM.li({style: {'margin': '0px'}}, 
            React.DOM.a({style: style, href: self.props.filterUrl ? self.props.filterUrl + '?tag=' + tag : 'javascript:void(0);', onClick: self.handleClick(tag)}, tag)
          )
        );
      });

      // FIXME: When there are no tags, the client just receives [""], which requires weird checks like this.
      if (this.props.destination &&
          (_.isEmpty(mappedTags) ||
            (mappedTags[0] == undefined &&
             mappedTags[1] == undefined))) {
        return (
          React.DOM.li({style: {color: '#d3d3d3', 'font-size': '13px'}}, "No tags yet — why not add some?")
        );
      }

      return mappedTags;
    },

    componentDidMount: function() {
      TagListStore.addChangeListener(this.onChange);
    },

    onChange: function() {
      var tags = TagListStore.getTags();

      if (this.props.destination) {
        this.setState({
          tags: tags
        });

        var tagListHack = $('#tag-list-hack');

        if (tagListHack.length) {
          if (_.isEmpty(tags)) {
            tagListHack.empty();
          }

          var selected = tagListHack.val();

          $(tagListHack).append(_.map(tags, function(tag) {
            if ((selected && selected.indexOf(tag) === -1) || !selected) {
              return '<option value=' + tag + ' selected="true">' + tag + '</option>';
            }
          }));
        }
      } else {
        this.setState({
          tags: this.props.tags
        });
      }
    },

    handleClick: function(tag) {
      var self = this;

      if (this.props.destination) {
        if (!this.props.allowRemoval) {
          return;
        }

        return function(e) {
          Dispatcher.dispatch({
            action: TAG_LIST.ACTIONS.REMOVE_TAG,
            data: { tag: tag, url: self.props.url },
            event: TAG_LIST.EVENTS.TAG_REMOVED
          });
        };
      }

      return function(e) {
        Dispatcher.dispatch({
          action: TAG_LIST.ACTIONS.ADD_TAG,
          data: { tag: tag, url: self.props.url },
          event: TAG_LIST.EVENTS.TAG_ADDED + '-true'
        });

        self.setState({
          tags: self.state.tags
        });
      };
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = TagList;
  }

  window.TagList = TagList;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../stores/tag_list_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/tag_list_store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/timestamp.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {
  var Timestamp = React.createClass({displayName: 'Timestamp',
    componentDidMount: function() {
      $(this.getDOMNode()).timeago();
    },

    componentWillUnmount: function() {
      $(this.getDOMNode()).timeago('dispose');
    },

    render: function() {
      return (
        React.DOM.time({className: "timestamp", dateTime: this.props.time})
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Timestamp;
  }

  window.Timestamp = Timestamp;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/tips_ui.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {

  COIN_INCREMENT = 100
  DEBOUNCE_TIMEOUT = 2000

  var TipsUi = React.createClass({displayName: 'TipsUi',
    getDefaultProps: function() {
      var currentUser = app.currentUser()
      if (currentUser) {
        currentUser = currentUser.attributes
      }

      return {
        currentUser: currentUser,
        url: app.product.get('url') + '/tips'
      }
    },

    getInitialState: function() {
      return {
        tips: _.reduce(this.props.tips, function(h, tip) { h[tip.from.id] = tip; return h }, {}),
        userCents: app.currentProductBalance(),
        pendingCents: 0
      }
    },

    componentDidMount: function() {
      $(this.refs.button.getDOMNode()).tooltip()
    },

    render: function() {
      var totalCents = this.totalCents()

      var tooltip = null
      if (this.props.currentUser == null) {
        tooltip = 'You need to sign up before you can tip'
      } else if (this.state.userCents <= 0) {
        tooltip = 'You have no coins to tip'
      } else if (this.currentUserIsRecipient()) {
        tooltip = "You can't tip yourself"
      }

      var tippers = null
      if (totalCents > 0) {
        tippers = Tippers({tips: this.tips()})
      }

      return (
        React.DOM.div({className: "js-tips"}, 
          React.DOM.div({className: totalCents > 0 ? 'text-coins' : null}, 
            React.DOM.a({ref: "button", href: "javascript:;", 'data-placement': "top", 'data-toggle': "tooltip", title: tooltip, onClick: this.currentUserCanTip() ? this.handleClick : null}, 
              React.DOM.span({className: "icon icon-app-coin"}), 
              React.DOM.span(null, " ", numeral(this.totalCents() / 100).format('0,0'))
            ), 
            tippers
          )
        )
      )
    },

    optimisticTip: function() {
      var update = { pendingCents: { $set: this.state.pendingCents + COIN_INCREMENT }, tips: {}}

      var tip = this.state.tips[this.props.currentUser.id]
      if (tip) {
        update.tips[this.props.currentUser.id] = { $merge: { cents: tip.cents + COIN_INCREMENT } }
      } else {
        update.tips[this.props.currentUser.id] = { $set: { from: this.props.currentUser, cents: COIN_INCREMENT } }
      }

      this.setState(React.addons.update(this.state, update))
    },

    save: _.debounce(function() {
      $.ajax({
        type: "POST",
        url: this.props.url,
        dataType: 'json',
        data: {
          tip: {
            add: this.state.pendingCents,
            via_type: this.props.viaType,
            via_id: this.props.viaId
          }
        },
        complete: function() {
          this.setState({pendingCents: 0})
      }.bind(this)})
    }, DEBOUNCE_TIMEOUT),

    handleClick: function() {
      this.optimisticTip()
      this.save()
    },

    currentUserCanTip: function() {
      return this.state.userCents > 0 && !this.currentUserIsRecipient()
    },

    currentUserIsRecipient: function() {
      return this.props.currentUser.id == this.props.recipient.id
    },

    totalCents: function() {
      return _.reduce(_.map(this.tips(), func.dot('cents')), func.add, 0)
    },

    tips: function() {
      return _.values(this.state.tips)
    }
  })

  var Tippers = React.createClass({displayName: 'Tippers',
    render: function() {
      return (
        React.DOM.span({className: "text-muted"}, "— tipped by  ", 
          React.DOM.ul({className: "list-inline-media"}, 
            _.map(this.props.tips, this.row)
          )
        )
      )
    },

    row: function(tip) {
      return (
        React.DOM.li({key: tip.from.id}, 
          React.DOM.img({
            className: "img-circle", 
            src: tip.from.avatar_url, 
            alt: '@' + tip.from.username, 
            'data-toggle': "tooltip", 
            'data-placement': "top", 
            title: '@' + tip.from.username, 
            width: "16", height: "16"})
        )
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = TipsUi;
  }
  
  window.TipsUi = TipsUi;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/title_notifications_count.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var ChatNotificationsStore = require('../stores/chat_notifications_store');
var NewsFeedStore = require('../stores/news_feed_store');

(function() {
  var TitleNotificationsCount = React.createClass({displayName: 'TitleNotificationsCount',
    componentWillMount: function() {
      ChatNotificationsStore.addChangeListener(this.setTitle);
      NewsFeedStore.addChangeListener(this.setTitle);
    },

    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    getInitialState: function() {
      return {
        count: 0
      };
    },

    render: function() {
      return React.DOM.span(null);
    },

    setTitle: function() {
      var chatCount = ChatNotificationsStore.getUnreadCount(parseInt(localStorage.chatAck, 10)) || 0;
      var newsCount = NewsFeedStore.getUnreadCount(parseInt(localStorage.newsFeedAck, 10)) || 0;

      var total = chatCount + newsCount;

      document.title = total > 0 ?
        '(' + total + ') ' + this.props.title :
        this.props.title;
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = TitleNotificationsCount;
  }

  window.TitleNotificationsCount = TitleNotificationsCount;
})();

},{"../constants":"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js","../stores/chat_notifications_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/chat_notifications_store.js","../stores/news_feed_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/news_feed_store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/urgency.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {
  var Urgency = React.createClass({displayName: 'Urgency',
    getInitialState: function() {
      return { label: this.props.initialLabel }
    },

    render: function() {
      return (
        React.DOM.div({className: "dropdown", style: {"display":"inline-block"}}, 
          React.DOM.a({'data-toggle': "dropdown", href: "#"}, 
            React.DOM.span({className: this.labelClass(this.state.label)}, this.state.label)
          ), 
          React.DOM.ul({className: "dropdown-menu"}, 
            this.listItems()
          )
        )
      )
    },

    listItems: function() {
      return this.props.urgencies.map(function(u){
        return (
          React.DOM.li({key: u}, 
            React.DOM.a({onClick: this.updateUrgency(u)}, 
              React.DOM.span({className: this.labelClass(u)}, u)
            )
          )
        )
      }.bind(this))
    },

    updateUrgency: function(label) {
      return function() {
        this.setState({label: label})
        $.ajax({
          url: this.props.url,
          dataType: 'json',
          type: 'PATCH',
          data: { urgency: label.toLowerCase() }
        });
      }.bind(this)
    },

    labelClass: function(urgency) {
      return "label label-" + urgency.toLowerCase()
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Urgency;
  }

  window.Urgency = Urgency;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/components/user_navbar_dropdown.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {
  var UserNavbarDropdown = React.createClass({displayName: 'UserNavbarDropdown',
    render: function() {
      return (
        React.DOM.ul({className: "dropdown-menu"}, 
          React.DOM.li(null, 
            React.DOM.a({href: this.props.userPath}, 
              React.DOM.span({className: "icon icon-user dropdown-glyph"}), 
              "Profile"
            )
          ), 

          React.DOM.li(null, 
            React.DOM.a({href: this.props.editUserPath}, 
              React.DOM.span({className: "icon icon-settings dropdown-glyph"}), 
              "Setttings"
            )
          ), 

          React.DOM.li({className: "divider"}), 

          React.DOM.li(null, 
            React.DOM.a({href: this.props.destroyUserSessionPath, 'data-method': "delete"}, 
              React.DOM.span({className: "icon icon-logout dropdown-glyph"}), 
              "Log out"
            )
          )
        )
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = UserNavbarDropdown;
  }
  
  window.UserNavbarDropdown = UserNavbarDropdown;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/constants.js":[function(require,module,exports){
(function() {
  var CONSTANTS = {
    CHAT_NOTIFICATIONS: {
      ACTIONS: {
        ACKNOWLEDGE: 'chat:acknowledge',
        FETCH_CHAT_ROOMS: 'chat:fetchChatRooms',
        MARK_ROOM_AS_READ: 'chat:markRoomAsRead'
      },
      EVENTS: {
        ACKNOWLEDGED: 'chat:acknowledged',
        CHAT_ROOMS_FETCHED: 'chat:chatRoomsFetched',
        CHAT_ROOM_READ: 'chat:chatRoomRead'
      }
    },

    COIN_OWNERSHIP: {
      ACTIONS: {
        ADD_USER: 'addUser',
        REMOVE_USER: 'removeUser',
        UPDATE_USER: 'updateUser'
      },
      EVENTS: {
        USER_ADDED: 'coinOwnership:userAdded',
        USER_REMOVED: 'coinOwnership:userRemoved',
        USER_UPDATED: 'coinOwnership:userUpdated'
      }
    },

    INTEREST_PICKER: {
      ACTIONS: {
        ADD_INTEREST: 'addInterest',
        REMOVE_INTEREST: 'removeInterest',
        POP: 'pop'
      },
      EVENTS: {
        INTEREST_ADDED: 'interestPicker:interestAdded',
        INTEREST_REMOVED: 'interestPicker:interestRemoved',
        POPPED: 'interestPicker:popped'
      }
    },

    NEWS_FEED: {
      ACTIONS: {
        ACKNOWLEDGE: 'newsFeed:acknowledge',
        FETCH_STORIES: 'newsFeed:fetchStories',
        FETCH_MORE_STORIES: 'newsFeed:fetchMoreStories',
        MARK_AS_READ: 'newsFeed:markAsRead',
        MARK_ALL_AS_READ: 'newsFeed:markAllAsRead',
        MARK_STORY_AS_READ: 'newsFeed:markStoryAsRead'
      },
      EVENTS: {
        ACKNOWLEDGED: 'newsFeed:acknowledged',
        READ: 'newsFeed:read',
        READ_ALL: 'newsFeed:readAll',
        STORIES_FETCHED: 'newsFeed:storiesFetched',
        STORY_READ: 'newsFeed:storyRead'
      }
    },

    NOTIFICATION_PREFERENCES_DROPDOWN: {
      ACTIONS: {
        UPDATE_SELECTED: 'updateSelected'
      },
      EVENTS: {
        SELECTED_UPDATED: 'notificationPreferencesDropdown:selectedUpdated'
      }
    },

    PERSON_PICKER: {
      ACTIONS: {
        ADD_USER: 'addPickedUser',
        REMOVE_USER: 'removePickedUser',
        UPDATE_USER: 'updatePickedUser'
      },
      EVENTS: {
        USER_ADDED: 'personPicker:userAdded',
        USER_REMOVED: 'personPicker:userRemoved',
        USER_UPDATED: 'personPicker:userUpdated'
      }
    },

    TAG_LIST: {
      ACTIONS: {
        ADD_TAG: 'addTag',
        REMOVE_TAG: 'removeTag'
      },
      EVENTS: {
        TAG_ADDED: 'textComplete:tagAdded',
        TAG_REMOVED: 'tagList:tagRemoved'
      }
    },

    TEXT_COMPLETE: {
      ACTIONS: {
        ADD_TAG: 'addTag'
      },
      EVENTS: {
        DID_MOUNT: 'textComplete:didMount',
        TAG_ADDED: 'textComplete:tagAdded'
      }
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = CONSTANTS;
  }

  window.CONSTANTS = CONSTANTS;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js":[function(require,module,exports){
(function() {
  var _callbacks = [];

  var Dispatcher = _.extend(Function.prototype, {
    register: function(callback) {
      _callbacks.push(callback);

      // Returning the callback's index allows
      // explicit references to the callback
      // outside of the dispatcher
      return _callbacks.length - 1;
    },

    dispatch: function(payload) {
      if (_.isEmpty(_callbacks)) {
        return;
      }

      for (var i = 0, l = _callbacks.length; i < l; i++) {
        _callbacks[i](payload);
      }
    },

    remove: function(index) {
      if (_callbacks[index]) {
        _callbacks.splice(index, 1);
        return true;
      }

      return false;
    },

    removeAll: function() {
      _callbacks = [];
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Dispatcher;
  }

  window.Dispatcher = Dispatcher;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/mixins/dropdown_toggler.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

(function() {
  var DropdownTogglerMixin = {
    render: function() {
      var classes = ['icon', 'navbar-icon', this.props.iconClass];
      var total = this.badgeCount();
      var badge = null;

      if (total > 0) {
        badge = this.badge(total);
        classes.push('glyphicon-highlight');
      }

      return (
        React.DOM.a({href: this.props.href, 'data-toggle': "dropdown", onClick: this.acknowledge}, 
          React.DOM.span({className: classes.join(' ')}), 
          badge, 
          React.DOM.span({className: "visible-xs-inline", style: { 'margin-left': '5px'}}, 
            this.props.label
          )
        )
      );
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = DropdownTogglerMixin;
  }

  window.DropdownTogglerMixin = DropdownTogglerMixin;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/mixins/news_feed.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var NewsFeedStore = require('../stores/news_feed_store');
var NewsFeedUsersStore = require('../stores/news_feed_users_store');

(function() {
  var NewsFeedMixin = {
    componentDidMount: function() {
      var target = this.refs.spinner.getDOMNode();
      var opts = this.spinnerOptions || {
        lines: 13,
        length: 30,
        radius: 55
      };

      var spinner = this.spinner = new Spinner(opts).spin();

      target.appendChild(spinner.el);
    },

    getStories: function() {
      var self = this;

      this.setState({
        stories: NewsFeedStore.getStories(),
        actors: NewsFeedUsersStore.getUsers()
      }, function() {
        if (self.state.stories.length) {
          self.spinner.stop();
        }
      });
    }
  }

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedMixin;
  }

  window.NewsFeedMixin = NewsFeedMixin;
})();

},{"../stores/news_feed_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/news_feed_store.js","../stores/news_feed_users_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/news_feed_users_store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/chat_notifications_store.js":[function(require,module,exports){
var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var rrMetaTag = document.getElementsByName('read-raptor-url');
  var READ_RAPTOR_URL = rrMetaTag && rrMetaTag[0] && rrMetaTag[0].content;

  var _chatRooms = {};
  var _sortKeys = [];
  var _optimisticallyUpdatedChatRooms = {};
  var _deferred = [];

  var _store = Object.create(Store);
  var noop = function() {};

  var _notificationsStore = _.extend(_store, {
    'chat:acknowledge': noop,

    'chat:markRoomAsRead': function(payload) {
      window.xhr.noCsrfGet(payload.readraptor_url);

      _optimisticallyUpdatedChatRooms[payload.id] = {
        last_read_at: moment().unix()
      };

      this.emit(_deferred.pop());
    },

    'chat:fetchChatRooms': function(url) {
      window.xhr.get(url, this.handleFetchedChatRooms.bind(this));
    },

    getUnreadCount: function(acknowledgedAt) {
      var count = _.countBy(
        _chatRooms,
        function(entry) {
          var updated = entry.updated - entry.last_read_at > 5;

          if (acknowledgedAt) {
            return updated && entry.updated > acknowledgedAt;
          }

          return updated;
        }
      );

      return count.true || 0;
    },

    handleFetchedChatRooms: function(err, data) {
      if (err) {
        return console.error(err);
      }

      try {
        data = JSON.parse(data);
      } catch (e) {
        return console.error(e);
      }

      var chatRooms = data.chat_rooms;
      _sortKeys = data.sort_keys;

      var url = READ_RAPTOR_URL +
        '/readers/' +
        app.currentUser().get('id') +
        '/articles?' +
        _.map(
          chatRooms,
          function(r) {
            return 'key=' + r.id
          }
        ).join('&');

      window.xhr.noCsrfGet(url, this.handleReadRaptor(chatRooms));
    },

    handleReadRaptor: function(chatRooms) {
      return function readRaptorCallback(err, data) {
        if (err) { return console.error(err); }

        try {
          data = JSON.parse(data);
        } catch (e) {
          return console.error(e);
        }

        chatRooms = _.reduce(
          chatRooms,
          function(h, chatRoom) {
            h[chatRoom.id] = chatRoom;
            h[chatRoom.id].last_read_at = 0;

            return h;
          },
          {}
        );

        this.applyReadTimes(data, chatRooms);
        this.setChatRooms(chatRooms);
        this.emit(_deferred.pop());
      }.bind(this);
    },

    applyReadTimes: function(data, chatRooms) {
      for (var i = 0, l = data.length; i < l; i++) {
        var datum = data[i];

        if (datum.last_read_at && chatRooms[datum.key]) {
          chatRooms[datum.key].last_read_at = datum.last_read_at;
        }
      }
    },

    getChatRoom: function(id) {
      return _chatRooms[id];
    },

    getChatRooms: function() {
      return _chatRooms;
    },

    getSortKeys: function() {
      return _sortKeys;
    },

    setChatRooms: function(chatRooms) {
      _chatRooms = chatRooms;

      var keys = _.keys(_optimisticallyUpdatedChatRooms)
      for (var i = 0; i < keys.length; i++) {
        if (_chatRooms[keys[i]]) {
          // console.log('updating last read?');
          // console.log(_chatRooms[keys[i]])
          _chatRooms[keys[i]].last_read_at = _optimisticallyUpdatedChatRooms[keys[i]].last_read_at;
          // console.log('updated last read?');
          // console.log(_chatRooms[keys[i]])
        }
      }

      _optimisticallyUpdatedChatRooms = {}
    },

    removeChatRoom: function(id) {
      delete _chatRooms[id]
    },

    removeAllChatRooms: function() {
      _chatRooms = {};
    },

    mostRecentlyUpdatedChatRoom: function() {
      if (_.keys(_chatRooms).length === 0) {
        return null;
      }

      return _.max(
        _.filter(
          _.values(_chatRooms),
          function filterRooms(room) {
            return room.id !== (app.chatRoom || {}).id;
          }
        ),
        func.dot('updated')
      );
    },
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;
    var sync = payload.sync;

    if (!_store[action]) {
      return;
    }

    _store[action](data);

    if (sync) {
      return _store.emit(event);
    }

    _deferred.push(event);
  });

  if (typeof module !== 'undefined') {
    module.exports = _notificationsStore;
  }

  window.ChatNotificationsStore = _notificationsStore;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js","../xhr":"/Users/pletcher/Projects/meta/app/assets/javascripts/xhr.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/coin_ownership_store.js":[function(require,module,exports){
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  // { user: User, coins: Number }
  var _usersAndCoins = [];

  var _store = Object.create(Store);
  var _coinOwnershipStore = _.extend(_store, {
    addUser: function(data) {
      var userAndCoins = data.userAndCoins;

      if (_searchUsers(userAndCoins.username) !== -1) {
        return;
      }

      _usersAndCoins.push(userAndCoins);
    },

    getUser: function(data) {
      var index = _searchUsers(data.username);

      return _usersAndCoins[index];
    },

    getUsers: function() {
      return _usersAndCoins;
    },

    updateUser: function(data) {
      var userAndCoins = data.userAndCoins;
      var index = _searchUsers(userAndCoins.username);

      if (index === -1) {
        return;
      }

      _usersAndCoins[index] = userAndCoins;

      return _usersAndCoins[index];
    },

    removeUser: function(data) {
      var userAndCoins = data.userAndCoins;
      var index = _searchUsers(userAndCoins.username);

      if (index >= 0) {
        _usersAndCoins.splice(index, 1);
      }
    },

    setUsers: function(users) {
      _usersAndCoins = users;
    },

    removeAllUsers: function() {
      _usersAndCoins = [];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  function _searchUsers(username) {
    for (var i = 0, l = _usersAndCoins.length; i < l; i++) {
      var userAndCoins = _usersAndCoins[i];

      if (userAndCoins.username === username) {
        return i;
      }
    }

    return -1;
  }

  if (typeof module !== 'undefined') {
    module.exports = _coinOwnershipStore;
  }

  window.CoinOwnershipStore = _coinOwnershipStore;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/interest_store.js":[function(require,module,exports){
var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var _interests = ['code', 'design'];

  var _store = Object.create(Store);

  var _interestStore = _.extend(_store, {
    addInterest: function(interest) {
      if (!interest) {
        return;
      }

      if (_interests.indexOf(interest) !== -1) {
        return;
      }

      _interests.push(interest);
    },

    getInterests: function() {
      return _interests;
    },

    removeInterest: function(interest) {
      var index = _interests.indexOf(interest);

      if (index >= 0) {
        _interests.splice(index, 1);
      }
    },

    pop: function() {
      _interests.pop();
    },

    setInterests: function(interests) {
      _interests = interests;
    },

    removeAllInterests: function() {
      _interests = ['code', 'design'];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  if (typeof module !== 'undefined') {
    module.exports = _interestStore;
  }
  
  window.InterestStore = _interestStore;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js","../xhr":"/Users/pletcher/Projects/meta/app/assets/javascripts/xhr.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/news_feed_store.js":[function(require,module,exports){
var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');
var NewsFeedUsersStore = require('../stores/news_feed_users_store');

(function() {
  var rrMetaTag = document.getElementsByName('read-raptor-url');
  var READ_RAPTOR_URL = rrMetaTag && rrMetaTag[0] && rrMetaTag[0].content;

  var _stories = {};
  var _optimisticStories = {};
  var _deferred = [];

  var _store = Object.create(Store);

  var _newsFeedStore = _.extend(_store, {
    addStory: function(data) {
      if (!data) {
        return;
      }

      var story = data.story;

      _stories[story.key] = story;
    },

    addStories: function(stories) {
      if (!stories) {
        return;
      }

      for (var i = 0, l = stories.length; i < l; i++) {
        var story = stories[i];

        _stories[story.key] = story;
      }
    },

    applyReadTimes: function(data, stories) {
      for (var i = 0, l = data.length; i < l; i++) {
        var datum = data[i];

        if (datum.last_read_at && stories[datum.key]) {
          stories[datum.key].last_read_at = datum.last_read_at;
        }
      }
    },

    handleFetchedStories: function(method) {
      var self = this;

      return function(err, data) {
        if (err) {
          return console.error(err);
        }

        try {
          data = JSON.parse(data);
        } catch (e) {
          return console.error(e);
        }

        var users = data.users;
        var stories = data.stories;

        NewsFeedUsersStore.setUsers(users);

        var url = READ_RAPTOR_URL +
          '/readers/' +
          app.currentUser().get('id') +
          '/articles?' +
          _.map(
            stories,
            function(s) {
              return 'key=Story_' + s.id
            }
          ).join('&')

        window.xhr.noCsrfGet(url, self.handleReadRaptor(stories, method));
      }

    },

    handleReadRaptor: function(stories, method) {
      var self = this;

      return function readRaptorCallback(err, data) {
        if (err) {
          return console.error(err);
        }

        try {
          data = JSON.parse(data);
        } catch (e) {
          return console.error(e);
        }

        stories = _.reduce(
          stories,
          function(hash, story) {
            hash[story.key] = story;
            hash[story.key].last_read_at = 0;

            return hash;
          },
          {}
        );

        self.applyReadTimes(data, stories);
        self[method](stories);
        self.emit(_deferred.pop());
      };
    },

    'newsFeed:acknowledge': function(timestamp) {},

    'newsFeed:fetchStories': function(url) {
      window.xhr.get(url, this.handleFetchedStories('setStories'));
    },

    'newsFeed:fetchMoreStories': function(url) {
      window.xhr.get(url, this.handleFetchedStories('addStories'));
    },

    'newsFeed:markAsRead': function(storyId) {
      var url = '/user/tracking/' + storyId;

      window.xhr.get(url, this.markedAsRead(storyId));
    },

    'newsFeed:markAllAsRead': function() {
      var unread = _.filter(_stories, function(story) {
        return story.last_read_at == null;
      });

      var self = this;

      for (var i = 0, l = unread.length; i < l; i++) {
        (function(j) {
          var story = unread[j];

          if (!story.last_read_at) {
            // we do actually want the id here, not the key
            var storyId = story.id;
            var url = '/user/tracking/' + storyId;

            window.xhr.get(url, self.markedAsRead(storyId, true, (j + 1 === l)));
          }
        })(i);
      }
    },

    'newsFeed:markStoryAsRead': function(data) {
      var storyId = data.key;
      var url = data.readraptor_url;

      window.xhr.noCsrfGet(url);

      _optimisticStories[storyId] = {
        last_read_at: moment().unix()
      };

      this.emit(_deferred.pop());
    },

    markedAsRead: function(storyId, wait, ready) {
      var self = this;

      return function markedAsRead(err, data) {
        if (err) {
          return console.error(err);
        }

        var story = self.getStory(storyId);

        // FIXME: Use the value from Readraptor
        story.last_read_at = moment().unix();

        if (!wait) {
          return self.emit(_deferred.pop());
        }

        // FIXME: We really need a proper event emitter
        if (ready) {
          self.emit(_deferred.pop());
        } else {
          self.emit(_deferred[_deferred.length - 1]);
        }
      }
    },

    getStory: function(id) {
      var index = _searchStories(id);

      if (index > -1) {
        return _stories[index];
      }

      return null;
    },

    getStories: function() {
      var stories = [];

      for (var i in _stories) {
        stories.push(_stories[i]);
      }

      return stories;
    },

    getUnreadCount: function(timestamp) {
      var count = _.countBy(
        _stories,
        function(entry) {
          if (timestamp) {
            return entry.updated > timestamp
          }
        }
      );

      return count.true || 0;
    },

    setStories: function(stories) {
      for (var story in _optimisticStories) {
        if (stories.hasOwnProperty(story)) {
          stories[story].last_read_at = _optimisticStories[story].last_read_at;
        }
      }

      _optimisticStories = {};

      _stories = stories;
    },

    removeStory: function(id) {
      var index = _searchStories(id);

      if (index > -1) {
        _stories.splice(index, 1);
      }
    },

    removeAllStories: function() {
      _stories = [];
    }
  });

  _searchStories = function(id) {
    for (var i = 0, l = _stories.length; i < l; i++) {
      if (_stories[i].id === id) {
        return i;
      }
    }

    return -1;
  }

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;
    var sync = payload.sync;

    if (!_store[action]) {
      return;
    }

    _store[action](data);

    if (sync) {
      return _store.emit(event);
    }

    _deferred.push(event);
  });

  if (typeof module !== 'undefined') {
    module.exports = _newsFeedStore;
  }
  
  window.NewsFeedStore = _newsFeedStore;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/news_feed_users_store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/news_feed_users_store.js","../stores/store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js","../xhr":"/Users/pletcher/Projects/meta/app/assets/javascripts/xhr.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/news_feed_users_store.js":[function(require,module,exports){
var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var _users = {};

  var _store = Object.create(Store);

  var _newsFeedUsersStore = _.extend(_store, {
    setUsers: function(users) {
      _users = users;
    },

    addUsers: function(users) {
      for (var user in users) {
        if (!_users.hasOwnProperty(user)) {
          _users[user] = users[user];
        }
      }
    },

    getUsers: function(){
      return _users;
    },

    removeAllUsers: function() {
      _users = [];
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = _newsFeedUsersStore;
  }

  window.NewsFeedUsersStore = _newsFeedUsersStore;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js","../xhr":"/Users/pletcher/Projects/meta/app/assets/javascripts/xhr.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/notification_preferences_dropdown_store.js":[function(require,module,exports){
var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var _selected;

  var _store = Object.create(Store);

  var _dropdownStore = _.extend(_store, {
    updateSelected: function(data) {
      if (!data) {
        return;
      }

      var item = data.item;
      var path = data.path;

      window.xhr.post(path);

      _selected = item;
    },

    getSelected: function() {
      return _selected;
    },

    setSelected: function(item) {
      _selected = item;
    },

    removeSelected: function() {
      _selected = undefined;
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    if (!_store[action]) {
      return;
    }

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  if (typeof module !== 'undefined') {
    module.exports = _dropdownStore;
  }
  
  window.NotificationPreferencesDropdownStore = _dropdownStore;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js","../xhr":"/Users/pletcher/Projects/meta/app/assets/javascripts/xhr.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/people_store.js":[function(require,module,exports){
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var _people = [];

  var _store = Object.create(Store);
  var _peopleStore = _.extend(_store, {
    destroy: function() {
      Dispatcher.remove(dispatchIndex);
    },

    setPeople: function(people) {
      _people = people;
    },

    getPeople: function() {
      return _people;
    },

    getPerson: function(username) {
      var index = _searchPeople(username);

      return _people[index];
    },

    addPerson: function(data) {
      _people.push(data.user);

      return this.getPeople();
    },

    removePerson: function(username) {
      var index = _searchPeople(username);

      _people.splice(index, 1);

      return this.getPeople();
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  function _searchPeople(username) {
    for (var i = 0, l = _people.length; i < l; i++) {
      if (_people[i].user.username === username) {
        return i;
      }
    }

    return -1;
  }

  if (typeof module !== 'undefined') {
    module.exports = _peopleStore;
  }
  
  window.PeopleStore = _peopleStore;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/person_picker_store.js":[function(require,module,exports){
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var _people = [];

  var _store = Object.create(Store);
  var _personPickerStore = _.extend(_store, {
    addPerson: function(data) {
      var user = data.user;
      if (!user) {
        return;
      }

      if (_searchPeople(user.username) !== -1) {
        return;
      }

      _people.push(user);
    },

    getPerson: function(data) {
      var index = _searchPeople(data.user.username);

      return _people[index];
    },

    getPeople: function() {
      return _people;
    },

    updatePerson: function(data) {
      var user = data.user;
      var index = _searchPeople(user.username);

      _people[index] = user;

      return _people[index];
    },

    removePerson: function(data) {
      var user = data.user;
      var index = _searchPeople(user.username);

      if (index >= 0) {
        _people.splice(index, 1);
      }
    },

    setPeople: function(users) {
      _people = users;
    },

    removeAllPeople: function() {
      _people = [];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  function _searchPeople(username) {
    for (var i = 0, l = _people.length; i < l; i++) {
      var user = _people[i];

      if (user.username === username) {
        return i;
      }
    }

    return -1;
  }

  if (typeof module !== 'undefined') {
    module.exports = _personPickerStore;
  }

  window.PersonPickerStore = _personPickerStore;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js":[function(require,module,exports){
(function() {
  var Store = _.extend({}, {
    emit: function(event) {
      var callbacks = this.listeners;

      if (!_.isEmpty(callbacks)) {
        for (var i = 0, l = callbacks.length; i < l; i++) {
          callbacks[i]();
        }
      }
    },

    addChangeListener: function(callback) {
      this.listeners = this.listeners || [];
      this.listeners.push(callback);

      return this.listeners.length - 1;
    },

    removeChangeListener: function(eventIndex) {
      if (this.listeners && this.listeners[eventIndex]) {
        this.listeners.splice(eventIndex, 1);
        return this.listeners.length;
      } else {
        return -1;
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Store;
  }

  window.Store = Store;
})();

},{}],"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/tag_list_store.js":[function(require,module,exports){
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var _tags = [];

  var _store = Object.create(Store);
  var _tagListStore = _.extend(_store, {
    addTag: function(data) {
      var tag = data.tag;
      var url = data.url;

      // We don't want duplicate tags
      if (_searchTags(tag) !== -1) {
        return;
      }

      _tags.push(tag);

      this.persist(url);
    },

    setTags: function(tags) {
      _tags = tags;
    },

    getTags: function() {
      return _tags
    },

    removeTag: function(data) {
      var tag = data.tag;
      var url = data.url;
      var index = _searchTags(tag);

      if (index >= 0) {
        _tags.splice(index, 1);
      }

      if (url) {
        this.persist(url);
      }
    },

    persist: function(url) {
      if (!url) return;

      var tags = this.getTags();

      if (_.isEmpty(tags)) {
        tags = [''];
      }

      $.ajax({
        url: url,
        method: 'PATCH',
        dataType: 'json',
        data: {
          task: {
            tag_list: tags
          }
        },

        success: function(data) {
        },

        error: function(jqxhr, status) {
          console.dir(status);
        }
      });
    },

    removeAllTags: function() {
      _tags = [];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  function _searchTags(tag) {
    for (var i = 0, l = _tags.length; i < l; i++) {
      if (_tags[i] === tag) {
        return i;
      }
    }

    return -1
  }

  if (typeof module !== 'undefined') {
    module.exports = _tagListStore;
  }

  window.TagListStore = _tagListStore;
})();

},{"../dispatcher":"/Users/pletcher/Projects/meta/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/pletcher/Projects/meta/app/assets/javascripts/stores/store.js"}],"/Users/pletcher/Projects/meta/app/assets/javascripts/xhr.js":[function(require,module,exports){
(function() {
  var xhr = {
    get: function(path, callback) {
      this.request('GET', path, null, callback);
    },

    noCsrfGet: function(path, callback) {
      this.noCsrfRequest('GET', path, null, callback);
    },

    post: function(path, data, callback) {
      this.request('POST', path, data, callback);
    },

    request: function(method, path, data, callback) {
      if (!callback) {
        callback = function() {};
      }

      var request = new XMLHttpRequest();

      request.open(method, path, true);
      request.setRequestHeader('X-CSRF-Token', document.getElementsByName('csrf-token')[0].content);
      request.setRequestHeader('Accept', 'application/json');
      request.send(data);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          return callback(null, request.responseText);
        }

        callback(new Error(request.responseText));
      }
    },

    noCsrfRequest: function(method, path, data, callback) {
      if (!callback) {
        callback = function() {};
      }

      var request = new XMLHttpRequest();

      request.open(method, path, true);
      request.setRequestHeader('Accept', 'application/json');
      request.send(data);

      request.onload = function() {
        // console.log(request.responseText);
        if (request.status >= 200 && request.status < 400) {
          return callback(null, request.responseText);
        }

        callback(new Error(request.responseText));
      }
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = xhr;
  }

  window.xhr = xhr;
})();

},{}],"spin.js":[function(require,module,exports){
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
    if(s[prop] !== undefined) return prop
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: '50%',           // center vertically
    left: '50%',          // center horizontally
    position: 'absolute'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width

      css(el, {
        left: o.left,
        top: o.top
      })
        
      if (target) {
        target.insertBefore(el, target.firstChild||null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

},{}],"underscore":[function(require,module,exports){
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

},{}]},{},["/Users/pletcher/Projects/meta/app/assets/javascripts/components/activity_feed.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/avatar.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/chat_notifications.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/chat_notifications_toggler.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/coin_ownership.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/core_team.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/drag_and_drop_view.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/dropdown_news_feed.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/dropdown_news_feed_toggler.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/financials_view.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/form_group.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/full_page_news_feed.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/input_preview.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/interest_picker.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_bounty_form.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_friend_bounty.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_friend_product.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/invite_list.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/join_team_view.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/members_view.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/navbar.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/notification_preferences_dropdown.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/number_input_view.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/people_view.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/person_picker.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/popover.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/share.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/tag_list_view.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/timestamp.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/tips_ui.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/title_notifications_count.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/urgency.js.jsx","/Users/pletcher/Projects/meta/app/assets/javascripts/components/user_navbar_dropdown.js.jsx"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvYWN0aXZpdHlfZmVlZC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvYXZhdGFyLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9jaGF0X25vdGlmaWNhdGlvbnMuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2NoYXRfbm90aWZpY2F0aW9uc190b2dnbGVyLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9jb2luX293bmVyc2hpcC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvY29yZV90ZWFtLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9kZXNrdG9wX25vdGlmaWNhdGlvbnMuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2RyYWdfYW5kX2Ryb3Bfdmlldy5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvZHJvcGRvd25fbmV3c19mZWVkLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9kcm9wZG93bl9uZXdzX2ZlZWRfdG9nZ2xlci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvZmluYW5jaWFsc192aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9mb3JtX2dyb3VwLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9mdWxsX3BhZ2VfbmV3c19mZWVkLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9pbnB1dF9wcmV2aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9pbnRlcmVzdF9waWNrZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2ludml0ZV9ib3VudHlfZm9ybS5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaW52aXRlX2ZyaWVuZF9ib3VudHkuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2ludml0ZV9mcmllbmRfcHJvZHVjdC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaW52aXRlX2xpc3QuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2pvaW5fdGVhbV92aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9tZW1iZXJzX3ZpZXcuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL25hdmJhci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvbm90aWZpY2F0aW9uX3ByZWZlcmVuY2VzX2Ryb3Bkb3duLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9udW1iZXJfaW5wdXRfdmlldy5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvcGVvcGxlX3ZpZXcuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3BlcnNvbl9waWNrZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3BvcG92ZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3NoYXJlLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy90YWdfbGlzdF92aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy90aW1lc3RhbXAuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3RpcHNfdWkuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3RpdGxlX25vdGlmaWNhdGlvbnNfY291bnQuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3VyZ2VuY3kuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3VzZXJfbmF2YmFyX2Ryb3Bkb3duLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29uc3RhbnRzLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9kaXNwYXRjaGVyLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9taXhpbnMvZHJvcGRvd25fdG9nZ2xlci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL21peGlucy9uZXdzX2ZlZWQuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9zdG9yZXMvY2hhdF9ub3RpZmljYXRpb25zX3N0b3JlLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9zdG9yZXMvY29pbl9vd25lcnNoaXBfc3RvcmUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL3N0b3Jlcy9pbnRlcmVzdF9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25ld3NfZmVlZF9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25ld3NfZmVlZF91c2Vyc19zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25vdGlmaWNhdGlvbl9wcmVmZXJlbmNlc19kcm9wZG93bl9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3Blb3BsZV9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3BlcnNvbl9waWNrZXJfc3RvcmUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL3N0b3Jlcy9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3RhZ19saXN0X3N0b3JlLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy94aHIuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9ub2RlX21vZHVsZXMvc3Bpbi5qcy9zcGluLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9WQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcblxuICB2YXIgQWN0aXZpdHlGZWVkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQWN0aXZpdHlGZWVkJyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgYWN0aXZpdGllczogdGhpcy5wcm9wcy5hY3Rpdml0aWVzIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdihudWxsLCBfLm1hcCh0aGlzLnN0YXRlLmFjdGl2aXRpZXMsIEVudHJ5KSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgRW50cnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdFbnRyeScsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcIkBcIiwgdGhpcy5wcm9wcy5hY3Rvci51c2VybmFtZSwgXCIgXCIsIHRoaXMucHJvcHMudmVyYiwgXCIgXCIsIHRoaXMuYm9keSgpKVxuICAgIH0sXG5cbiAgICBib2R5OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLnN1YmplY3QuYm9keV9odG1sKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibWFya2Rvd24tbm9ybWFsaXplZFwiLCByZWY6IFwiYm9keVwifSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zdWJqZWN0LmF0dGFjaG1lbnQpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB0aGlzLnByb3BzLnN1YmplY3QuYXR0YWNobWVudC5ocmVmXG4gICAgICAgIHZhciBzcmMgPSB0aGlzLnByb3BzLnN1YmplY3QuYXR0YWNobWVudC5maXJlc2l6ZV91cmwgKyAnLzMwMHgyMjUvZnJhbWVfMC9nX2NlbnRlci8nICsgaHJlZlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBocmVmfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtjbGFzc05hbWU6IFwiZ2FsbGVyeS10aHVtYlwiLCBzcmM6IHNyY30pXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnJlZnMuYm9keSkge1xuICAgICAgICB0aGlzLnJlZnMuYm9keS5nZXRET01Ob2RlKCkuaW5uZXJIVE1MID0gdGhpcy5wcm9wcy5zdWJqZWN0LmJvZHlfaHRtbFxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBBY3Rpdml0eUZlZWQ7XG4gIH1cblxuICB3aW5kb3cuQWN0aXZpdHlGZWVkID0gQWN0aXZpdHlGZWVkO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBBdmF0YXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdBdmF0YXInLFxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzaXplOiAyNFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzaXplID0gdGhpcy5wcm9wcy5zaXplICYmIHRoaXMucHJvcHMuc2l6ZS50b1N0cmluZygpO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImF2YXRhciBpbWctY2lyY2xlXCIsIGhlaWdodDogc2l6ZSwgc3JjOiB0aGlzLmF2YXRhclVybCgpLCB3aWR0aDogc2l6ZX0pO1xuICAgIH0sXG5cbiAgICBhdmF0YXJVcmw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMudXNlciAmJiAhdGhpcy5wcm9wcy5hbHdheXNEZWZhdWx0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnVzZXIuYXZhdGFyX3VybCArICc/cz0nICsgKHRoaXMucHJvcHMuc2l6ZSAqIDIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICcvYXNzZXRzL2F2YXRhcnMvZGVmYXVsdC5wbmcnO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBBdmF0YXI7XG4gIH1cblxuICB3aW5kb3cuQXZhdGFyID0gQXZhdGFyO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBDaGF0Tm90aWZpY2F0aW9uU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvY2hhdF9ub3RpZmljYXRpb25zX3N0b3JlJyk7XG52YXIgRGVza3RvcE5vdGlmaWNhdGlvbnMgPSByZXF1aXJlKCcuL2Rlc2t0b3Bfbm90aWZpY2F0aW9ucy5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgSUNPTl9VUkwgPSAnaHR0cHM6Ly9kOGl6ZGs2Ymw0Z2JpLmNsb3VkZnJvbnQubmV0LzgweC9odHRwOi8vZi5jbC5seS9pdGVtcy8xSTJhMWowTTB3MFYycDNDM1EwTS9Bc3NlbWJseS1Ud2l0dGVyLUF2YXRhci5wbmcnO1xuICB2YXIgTiA9IENPTlNUQU5UUy5DSEFUX05PVElGSUNBVElPTlM7XG5cbiAgZnVuY3Rpb24gZHluYW1pY1NvcnQocHJvcGVydHkpIHtcbiAgICB2YXIgc29ydE9yZGVyID0gMTtcbiAgICBpZihwcm9wZXJ0eVswXSA9PT0gXCItXCIpIHtcbiAgICAgIHNvcnRPcmRlciA9IC0xO1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5zdWJzdHIoMSk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoYSxiKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gKGFbcHJvcGVydHldIDwgYltwcm9wZXJ0eV0pID8gLTEgOiAoYVtwcm9wZXJ0eV0gPiBiW3Byb3BlcnR5XSkgPyAxIDogMDtcbiAgICAgIHJldHVybiByZXN1bHQgKiBzb3J0T3JkZXI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZHluYW1pY1NvcnRNdWx0aXBsZSgpIHtcbiAgICAvKlxuICAgICAqIHNhdmUgdGhlIGFyZ3VtZW50cyBvYmplY3QgYXMgaXQgd2lsbCBiZSBvdmVyd3JpdHRlblxuICAgICAqIG5vdGUgdGhhdCBhcmd1bWVudHMgb2JqZWN0IGlzIGFuIGFycmF5LWxpa2Ugb2JqZWN0XG4gICAgICogY29uc2lzdGluZyBvZiB0aGUgbmFtZXMgb2YgdGhlIHByb3BlcnRpZXMgdG8gc29ydCBieVxuICAgICAqL1xuICAgIHZhciBwcm9wcyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iajEsIG9iajIpIHtcbiAgICAgIHZhciBpID0gMCwgcmVzdWx0ID0gMCwgbnVtYmVyT2ZQcm9wZXJ0aWVzID0gcHJvcHMubGVuZ3RoO1xuICAgICAgLyogdHJ5IGdldHRpbmcgYSBkaWZmZXJlbnQgcmVzdWx0IGZyb20gMCAoZXF1YWwpXG4gICAgICAgKiBhcyBsb25nIGFzIHdlIGhhdmUgZXh0cmEgcHJvcGVydGllcyB0byBjb21wYXJlXG4gICAgICAgKi9cbiAgICAgIHdoaWxlIChyZXN1bHQgPT09IDAgJiYgaSA8IG51bWJlck9mUHJvcGVydGllcykge1xuICAgICAgICByZXN1bHQgPSBkeW5hbWljU29ydChwcm9wc1tpXSkob2JqMSwgb2JqMik7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgdmFyIENoYXROb3RpZmljYXRpb25zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2hhdE5vdGlmaWNhdGlvbnMnLFxuICAgIGFydGljbGVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLmZsYXR0ZW4oXy5tYXAodGhpcy5zdGF0ZS5kYXRhLCBmdW5jdGlvbihhKXtcbiAgICAgICAgcmV0dXJuIGEuZW50aXRpZXM7XG4gICAgICB9KSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICQoJ1tkYXRhLXRvZ2dsZV0nLCB0aGlzLmdldERPTU5vZGUoKSkudG9vbHRpcCgpO1xuICAgICAgdmFyIHRhcmdldCA9IHRoaXMucmVmcy5zcGlubmVyLmdldERPTU5vZGUoKTtcbiAgICAgIHZhciBvcHRzID0gdGhpcy5zcGlubmVyT3B0aW9ucyB8fCB7XG4gICAgICAgIGxpbmVzOiAxMSxcbiAgICAgICAgbGVuZ3RoOiAzMCxcbiAgICAgICAgcmFkaXVzOiA1NVxuICAgICAgfTtcblxuICAgICAgdmFyIHNwaW5uZXIgPSB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKCk7XG4gICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3Bpbm5lci5lbCk7XG4gICAgfSxcblxuICAgIHNvcnRCeUxhc3RSZWFkQXQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHZhbHVlcyA9IF8udmFsdWVzKGRhdGEpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdmFsdWVzW2ldO1xuICAgICAgICBlbnRyeS5yZWFkU3RhdGUgPSBlbnRyeS51cGRhdGVkID4gZW50cnkubGFzdF9yZWFkX2F0ID8gJ0EnIDogJ1onO1xuICAgICAgICBlbnRyeS5zb3J0SW5kZXggPSB0aGlzLnN0YXRlLnNvcnRLZXlzLmluZGV4T2YoZW50cnkuaWQpO1xuICAgICAgfVxuICAgICAgdmFsdWVzLnNvcnQoZHluYW1pY1NvcnRNdWx0aXBsZShcInJlYWRTdGF0ZVwiLCBcInNvcnRJbmRleFwiLCBcImxhYmVsXCIpKTtcblxuICAgICAgcmV0dXJuIHZhbHVlcyB8fCBbXTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIC8vIFRPRE86IFJlbW92ZSB0aGlzIGFuZCB1c2UgdGhlIERpc3BhdGNoZXJcbiAgICAgICQod2luZG93KS5iaW5kKCdzdG9yYWdlJywgdGhpcy5zdG9yZWRBY2tDaGFuZ2VkKTtcblxuICAgICAgdGhpcy5vblB1c2goZnVuY3Rpb24oZXZlbnQsIG1zZykge1xuICAgICAgICBpZiAoXy5jb250YWlucyhtc2cubWVudGlvbnMsIF90aGlzLnByb3BzLnVzZXJuYW1lKSkge1xuICAgICAgICAgIF90aGlzLmRlc2t0b3BOb3RpZnkobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBfdGhpcy5mZXRjaE5vdGlmaWNhdGlvbnMoKTtcbiAgICAgIH0pO1xuXG4gICAgICB3aW5kb3cudmlzaWJpbGl0eShmdW5jdGlvbih2aXNpYmxlKSB7XG4gICAgICAgIGlmICh2aXNpYmxlKSB7IF90aGlzLmZldGNoTm90aWZpY2F0aW9ucygpOyB9XG4gICAgICB9KTtcblxuICAgICAgQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmhhbmRsZUNoYXRSb29tc0NoYW5nZWQpO1xuICAgICAgdGhpcy5mZXRjaE5vdGlmaWNhdGlvbnMoKTtcbiAgICB9LFxuXG4gICAgZGVza3RvcE5vdGlmeTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBuID0gbmV3IE5vdGlmeShcIk5ldyBtZXNzYWdlIG9uIFwiICsgKGV2ZW50LndpcC5wcm9kdWN0X25hbWUpLCB7XG4gICAgICAgIGJvZHk6IChldmVudC5hY3Rvci51c2VybmFtZSArIFwiOiBcIiArIGV2ZW50LmJvZHlfc2FuaXRpemVkKSxcbiAgICAgICAgdGFnOiBldmVudC5pZCxcbiAgICAgICAgaWNvbjogSUNPTl9VUkwsXG4gICAgICAgIHRpbWVvdXQ6IDE1LFxuXG4gICAgICAgIG5vdGlmeUNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKHdpbmRvdykuZm9jdXMoKTtcbiAgICAgICAgICBpZiAod2luZG93LmFwcC53aXAuaWQgIT0gZXZlbnQud2lwLmlkKSB7XG4gICAgICAgICAgICB3aW5kb3cuYXBwLnJlZGlyZWN0VG8oZXZlbnQud2lwLnVybCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIG4uc2hvdygpO1xuICAgIH0sXG5cbiAgICBmZXRjaE5vdGlmaWNhdGlvbnM6IF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiBOLkFDVElPTlMuRkVUQ0hfQ0hBVF9ST09NUyxcbiAgICAgICAgZXZlbnQ6IE4uRVZFTlRTLkNIQVRfUk9PTVNfRkVUQ0hFRCxcbiAgICAgICAgZGF0YTogdGhpcy5wcm9wcy51cmxcbiAgICAgIH0pO1xuICAgIH0sIDEwMDApLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBkb2N1bWVudC50aXRsZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgIHNvcnRLZXlzOiBbXSxcbiAgICAgICAgYWNrbm93bGVkZ2VkQXQ6IHRoaXMuc3RvcmVkQWNrKCksXG4gICAgICAgIGRlc2t0b3BOb3RpZmljYXRpb25zRW5hYmxlZDogZmFsc2VcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGhhbmRsZUNoYXRSb29tc0NoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZGF0YTogQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5nZXRDaGF0Um9vbXMoKSxcbiAgICAgICAgc29ydEtleXM6IENoYXROb3RpZmljYXRpb25zU3RvcmUuZ2V0U29ydEtleXMoKVxuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghXy5pc0VtcHR5KHNlbGYuc3RhdGUuZGF0YSkpIHtcbiAgICAgICAgICBzZWxmLnNwaW5uZXIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlRGVza3RvcE5vdGlmaWNhdGlvbnNTdGF0ZUNoYW5nZTogZnVuY3Rpb24oaXNFbmFibGVkKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZGVza3RvcE5vdGlmaWNhdGlvbnNFbmFibGVkOiBpc0VuYWJsZWRcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblB1c2g6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICBpZiAod2luZG93LnB1c2hlcikge1xuICAgICAgICBjaGFubmVsID0gd2luZG93LnB1c2hlci5zdWJzY3JpYmUoJ0AnICsgdGhpcy5wcm9wcy51c2VybmFtZSk7XG4gICAgICAgIGNoYW5uZWwuYmluZF9hbGwoZm4pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBsYXRlc3RBcnRpY2xlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1heCh0aGlzLmFydGljbGVzKCksIGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuIGEgJiYgYS50aW1lc3RhbXA7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgbGF0ZXN0QXJ0aWNsZVRpbWVzdGFtcDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJ0aWNsZSA9IHRoaXMubGF0ZXN0QXJ0aWNsZSgpXG5cbiAgICAgIGlmIChhcnRpY2xlKSB7XG4gICAgICAgIHJldHVybiBhcnRpY2xlLnRpbWVzdGFtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNvcnRlZCA9IHRoaXMuc29ydEJ5TGFzdFJlYWRBdCh0aGlzLnN0YXRlLmRhdGEpO1xuICAgICAgdmFyIHByb2R1Y3RzUGF0aCA9ICcvdXNlcnMvJyArIHRoaXMucHJvcHMudXNlcm5hbWU7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duLW1lbnVcIiwgc3R5bGU6IHsnbWluLXdpZHRoJzogJzM4MHB4J319LCBcbiAgICAgICAgICBSZWFjdC5ET00ubGkoe3JlZjogXCJzcGlubmVyXCIsIHN0eWxlOiB7ICdtaW4taGVpZ2h0JzogJzUwcHgnLCAnbWF4LWhlaWdodCc6ICczMDBweCd9fSwgXG4gICAgICAgICAgICBOb3RpZmljYXRpb25zTGlzdCh7ZGF0YTogXy5maXJzdChzb3J0ZWQsIDcpfSlcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBwcm9kdWN0c1BhdGgsIGNsYXNzTmFtZTogXCJ0ZXh0LXNtYWxsXCJ9LCBcIkFsbCBQcm9kdWN0c1wiKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgIXRoaXMuc3RhdGUuZGVza3RvcE5vdGlmaWNhdGlvbnNFbmFibGVkID8gRGVza3RvcE5vdGlmaWNhdGlvbnMoe29uQ2hhbmdlOiB0aGlzLmhhbmRsZURlc2t0b3BOb3RpZmljYXRpb25zU3RhdGVDaGFuZ2V9KSA6IG51bGxcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHNldEJhZGdlOiBmdW5jdGlvbih0b3RhbCkge1xuICAgICAgaWYgKHdpbmRvdy5mbHVpZCkge1xuICAgICAgICB3aW5kb3cuZmx1aWQuZG9ja0JhZGdlID0gdG90YWw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNwaW5uZXJPcHRpb25zOiB7XG4gICAgICBsaW5lczogMTEsXG4gICAgICB0b3A6ICcyMCUnXG4gICAgfSxcblxuICAgIHN0b3JlZEFjazogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZXN0YW1wID0gbG9jYWxTdG9yYWdlLmNoYXRBY2s7XG5cbiAgICAgIGlmICh0aW1lc3RhbXAgPT0gbnVsbCB8fCB0aW1lc3RhbXAgPT09IFwibnVsbFwiKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRpbWVzdGFtcCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3JlZEFja0NoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aGlzLnN0b3JlZEFjaygpXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBOb3RpZmljYXRpb25zTGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ05vdGlmaWNhdGlvbnNMaXN0JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb2R1Y3ROb2RlcyA9IHRoaXMucHJvcHMuZGF0YS5tYXAoZnVuY3Rpb24oZW50cnkpe1xuICAgICAgICB2YXIgYmFkZ2UgPSBudWxsO1xuXG4gICAgICAgIGlmIChlbnRyeS51cGRhdGVkID4gZW50cnkubGFzdF9yZWFkX2F0KSB7XG4gICAgICAgICAgYmFkZ2UgPSBSZWFjdC5ET00uc3Bhbih7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJpbmRpY2F0b3IgaW5kaWNhdG9yLWRhbmdlciBwdWxsLXJpZ2h0XCIsIFxuICAgICAgICAgICAgICBzdHlsZTogeyAncG9zaXRpb24nOiAncmVsYXRpdmUnLCAndG9wJzogJzEwcHgnfX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogZW50cnkudXJsLCBrZXk6IGVudHJ5LmlkLCBjbGFzc05hbWU6IFwibGlzdC1ncm91cC1pdGVtXCJ9LCBcbiAgICAgICAgICAgIGJhZGdlLCBcIiBcIiwgZW50cnkubGFiZWxcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXBcIn0sIFxuICAgICAgICAgIHByb2R1Y3ROb2Rlc1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDaGF0Tm90aWZpY2F0aW9ucztcbiAgfVxuXG4gIHdpbmRvdy5DaGF0Tm90aWZpY2F0aW9ucyA9IENoYXROb3RpZmljYXRpb25zO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9jaGF0X25vdGlmaWNhdGlvbnNfc3RvcmUnKTtcbnZhciBEcm9wZG93blRvZ2dsZXJNaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9kcm9wZG93bl90b2dnbGVyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBDTiA9IENPTlNUQU5UUy5DSEFUX05PVElGSUNBVElPTlM7XG5cbiAgdmFyIENoYXROb3RpZmljYXRpb25zVG9nZ2xlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NoYXROb3RpZmljYXRpb25zVG9nZ2xlcicsXG4gICAgbWl4aW5zOiBbRHJvcGRvd25Ub2dnbGVyTWl4aW5dLFxuXG4gICAgYWNrbm93bGVkZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbWVzdGFtcCA9IG1vbWVudCgpLnVuaXgoKTtcblxuICAgICAgbG9jYWxTdG9yYWdlLmNoYXRBY2sgPSB0aW1lc3RhbXA7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBhY2tub3dsZWRnZWRBdDogdGltZXN0YW1wXG4gICAgICB9KTtcblxuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGV2ZW50OiBDTi5FVkVOVFMuQUNLTk9XTEVER0VELFxuICAgICAgICBhY3Rpb246IENOLkFDVElPTlMuQUNLTk9XTEVER0UsXG4gICAgICAgIGRhdGE6IHRpbWVzdGFtcCxcbiAgICAgICAgc3luYzogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGJhZGdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5zcGFuKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJpbmRpY2F0b3IgaW5kaWNhdG9yLWRhbmdlclwiLCBcbiAgICAgICAgICAgIHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCB0b3A6ICc1cHgnfX0pXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBiYWRnZUNvdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGlmICh0aGlzLnNob3VsZFJlYWQoKSB8fCB0aGlzLmxhc3RVcGRhdGVkQXQoKSA+IHRoaXMuc3RhdGUuYWNrbm93bGVkZ2VkQXQpIHtcbiAgICAgIC8vICAgcmV0dXJuIDE7XG4gICAgICAvLyB9XG4gICAgICAvL1xuICAgICAgLy8gcmV0dXJuIDA7XG5cbiAgICAgIHJldHVybiB0aGlzLnNob3VsZFJlYWQoKSA/IENoYXROb3RpZmljYXRpb25zU3RvcmUuZ2V0VW5yZWFkQ291bnQodGhpcy5zdGF0ZS5hY2tub3dsZWRnZWRBdCkgOiAwO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmdldFN0b3JpZXMpO1xuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IGRvY3VtZW50LnRpdGxlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2hhdFJvb21zOiBudWxsLFxuICAgICAgICBhY2tub3dsZWRnZWRBdDogdGhpcy5zdG9yZWRBY2soKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0U3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgY2hhdFJvb21zOiBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmdldENoYXRSb29tcygpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2hvdWxkUmVhZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2hhdFJvb20gPSBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLm1vc3RSZWNlbnRseVVwZGF0ZWRDaGF0Um9vbSgpO1xuXG4gICAgICByZXR1cm4gY2hhdFJvb20gJiYgY2hhdFJvb20udXBkYXRlZCA+IGNoYXRSb29tLmxhc3RfcmVhZF9hdDtcbiAgICB9LFxuXG4gICAgbGFzdFVwZGF0ZWRBdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2hhdFJvb20gPSBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLm1vc3RSZWNlbnRseVVwZGF0ZWRDaGF0Um9vbSgpO1xuXG4gICAgICBpZiAoY2hhdFJvb20pIHtcbiAgICAgICAgcmV0dXJuIGNoYXRSb29tLnVwZGF0ZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAwO1xuICAgIH0sXG5cbiAgICB0b3RhbDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBjb3VudCA9IF8ucmVkdWNlKFxuICAgICAgICBfLm1hcChzZWxmLnN0YXRlLmNoYXRSb29tcywgZnVuY3Rpb24gbWFwU3RvcmllcyhjaGF0Um9vbSkge1xuICAgICAgICAgIHJldHVybiBjaGF0Um9vbS5jb3VudDtcbiAgICAgICAgfSksIGZ1bmN0aW9uIHJlZHVjZVN0b3JpZXMobWVtbywgcmVhZCkge1xuICAgICAgICAgIHJldHVybiBtZW1vICsgcmVhZDtcbiAgICAgIH0sIDApO1xuXG4gICAgICByZXR1cm4gY291bnQ7XG4gICAgfSxcblxuICAgIHN0b3JlZEFjazogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZXN0YW1wID0gbG9jYWxTdG9yYWdlLmNoYXRBY2s7XG5cbiAgICAgIGlmICh0aW1lc3RhbXAgPT0gbnVsbCB8fCB0aW1lc3RhbXAgPT09ICdudWxsJykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aW1lc3RhbXAsIDEwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyO1xuICB9XG5cbiAgd2luZG93LkNoYXROb3RpZmljYXRpb25zVG9nZ2xlciA9IENoYXROb3RpZmljYXRpb25zVG9nZ2xlcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgQ29pbk93bmVyc2hpcFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL2NvaW5fb3duZXJzaGlwX3N0b3JlJyk7XG52YXIgQXZhdGFyID0gcmVxdWlyZSgnLi9hdmF0YXIuanMuanN4Jyk7XG52YXIgUGVyc29uUGlja2VyID0gcmVxdWlyZSgnLi9wZXJzb25fcGlja2VyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBDTyA9IENPTlNUQU5UUy5DT0lOX09XTkVSU0hJUDtcblxuICBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGZuKGUpXG4gICAgfVxuICB9XG5cbiAgdmFyIENvaW5Pd25lcnNoaXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDb2luT3duZXJzaGlwJyxcbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgdG90YWxDb2luczogNjAwMCB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBDb2luT3duZXJzaGlwU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5vbkNoYW5nZSk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdG9yOiBfLmV4dGVuZChhcHAuY3VycmVudFVzZXIoKS5hdHRyaWJ1dGVzLCB7IGNvaW5zOiB0aGlzLnByb3BzLnRvdGFsQ29pbnMgfSksXG4gICAgICAgIHNoYXJlcnM6IENvaW5Pd25lcnNoaXBTdG9yZS5nZXRVc2VycygpLFxuICAgICAgICBwZXJjZW50YWdlQXZhaWxhYmxlOiAwLFxuICAgICAgICBwb3RlbnRpYWxVc2VyOiBudWxsXG4gICAgICB9XG4gICAgfSxcblxuICAgIG93bmVyc2hpcDogZnVuY3Rpb24odXNlcikge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICAwLCBNYXRoLm1pbihcbiAgICAgICAgICAxMDAsIHBhcnNlSW50KHVzZXIuY29pbnMgKiAxMDAgLyB0aGlzLnRvdGFsQ29pbnMoKSwgMTApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgdG90YWxDb2luczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2hhcmVyQ29pbnMgPSBfLnJlZHVjZShfLm1hcCh0aGlzLnN0YXRlLnNoYXJlcnMsIGZ1bmMuZG90KCdjb2lucycpKSwgZnVuY3Rpb24obWVtbywgbnVtKSB7IHJldHVybiBtZW1vICsgbnVtOyB9LCAwKVxuXG4gICAgICByZXR1cm4gc2hhcmVyQ29pbnMgKyB0aGlzLnN0YXRlLmNyZWF0b3IuY29pbnNcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjcmVhdG9yID0gdGhpcy5zdGF0ZS5jcmVhdG9yO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udGFibGUoe2NsYXNzTmFtZTogXCJ0YWJsZVwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRoZWFkKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NvbFNwYW46IFwiMlwifSwgXCJQYXJ0bmVyXCIpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwiLCBzdHlsZToge3dpZHRoOiAxMzB9fSwgXCJPd25lcnNoaXBcIiksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcIkNvaW5zXCIpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRib2R5KG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKHtjbGFzc05hbWU6IFwiYWN0aXZlXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIEF2YXRhcih7dXNlcjogY3JlYXRvcn0pKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBcIkBcIiwgY3JlYXRvci51c2VybmFtZVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCB0aGlzLm93bmVyc2hpcChjcmVhdG9yKSwgXCIlXCIpXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtY29pbnNcIiwgc3R5bGU6IHtcIndoaXRlLXNwYWNlXCI6XCJub3dyYXBcIn19LCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgICAgICBjcmVhdG9yLmNvaW5zXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcIih5b3UpXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICB0aGlzLnJvd3MoKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIEF2YXRhcih7dXNlcjogdGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyLCBhbHdheXNEZWZhdWx0OiBcInRydWVcIn0pKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBQZXJzb25QaWNrZXIoe3JlZjogXCJwaWNrZXJcIiwgdXJsOiBcIi9fZXNcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJTZWxlY3RlZDogdGhpcy5oYW5kbGVVc2VyU2VsZWN0ZWQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZFVzZXJDaGFuZ2VkOiB0aGlzLmhhbmRsZVZhbGlkVXNlckNoYW5nZWR9KVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cCBpbnB1dC1ncm91cC1zbVwifSwgXG5cbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7Y2xhc3NOYW1lOiBcImZvcm0tY29udHJvbCB0ZXh0LXJpZ2h0XCIsIHR5cGU6IFwibnVtYmVyXCIsIHZhbHVlOiB0aGlzLnN0YXRlLnBlcmNlbnRhZ2VBdmFpbGFibGUsIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUlucHV0Q2hhbmdlfSksIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWFkZG9uXCJ9LCBcIiVcIilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zIHB1bGwtcmlnaHRcIiwgc3R5bGU6IHsnd2hpdGUtc3BhY2UnOlwibm93cmFwXCJ9fSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1hcHAtY29pblwifSksIFxuICAgICAgICAgICAgICAgICAgXCIwXCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1dHRvbigpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgYWRkQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwidGV4dC1zdWNjZXNzXCIsIFxuICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ30sIFxuICAgICAgICAgICAgb25DbGljazogdGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyID8gdGhpcy5hZGRVc2VyQ2xpY2tlZCA6ICcnfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tcGx1cy1jaXJjbGVkXCJ9KSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJzci1vbmx5XCJ9LCBcIkFkZFwiKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBoYW5kbGVVc2VyU2VsZWN0ZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHRoaXMuYWRkVXNlcih1c2VyKVxuICAgIH0sXG5cbiAgICBoYW5kbGVWYWxpZFVzZXJDaGFuZ2VkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcG90ZW50aWFsVXNlcjogdXNlclxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFkZFVzZXJDbGlja2VkOiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuYWRkVXNlcih0aGlzLnN0YXRlLnBvdGVudGlhbFVzZXIpO1xuICAgICAgdGhpcy5yZWZzLnBpY2tlci5jbGVhclRleHQoKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVzZXJzID0gQ29pbk93bmVyc2hpcFN0b3JlLmdldFVzZXJzKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdXNlcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmICghdXNlcnNbaV0uaGFzT3duUHJvcGVydHkoJ2NvaW5zJykpIHtcbiAgICAgICAgICB1c2Vyc1tpXS5jb2lucyA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNoYXJlcnM6IHVzZXJzXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYWRkVXNlcjogZnVuY3Rpb24odXNlcikge1xuICAgICAgdmFyIHVzZXIgPSBfLmV4dGVuZCh1c2VyLCB7Y29pbnM6IDB9KTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZShSZWFjdC5hZGRvbnMudXBkYXRlKHRoaXMuc3RhdGUsIHtcbiAgICAgICAgcG90ZW50aWFsVXNlcjogeyRzZXQ6IG51bGx9LFxuICAgICAgICBzaGFyZXJzOiB7ICRwdXNoOiBbdXNlcl0gfVxuICAgICAgfSkpO1xuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IENPLkVWRU5UUy5VU0VSX0FEREVELFxuICAgICAgICBhY3Rpb246IENPLkFDVElPTlMuQUREX1VTRVIsXG4gICAgICAgIGRhdGE6IHsgdXNlckFuZENvaW5zOiB1c2VyIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1hcCh0aGlzLnN0YXRlLnNoYXJlcnMsIGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIE93bmVyc2hpcFJvdyh7XG4gICAgICAgICAgdXNlcjogdXNlciwgXG4gICAgICAgICAgdG90YWxDb2luczogdGhpcy5wcm9wcy50b3RhbENvaW5zLCBcbiAgICAgICAgICBvd25lcnNoaXA6IHRoaXMub3duZXJzaGlwKHVzZXIpLCBcbiAgICAgICAgICBvblJlbW92ZTogdGhpcy5oYW5kbGVVc2VyUmVtb3ZlZCh1c2VyKSwga2V5OiB1c2VyLmlkIHx8IHVzZXIuZW1haWwsIFxuICAgICAgICAgIG9uT3duZXJzaGlwQ2hhbmdlZDogdGhpcy5oYW5kbGVPd25lcnNoaXBDaGFuZ2VkKHVzZXIpfSlcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlclJlbW92ZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHVzZXJzID0gXy5yZWplY3QodGhpcy5zdGF0ZS5zaGFyZXJzLCBmdW5jdGlvbih1KXtcbiAgICAgICAgICBpZiAodS5pZCkge1xuICAgICAgICAgICAgcmV0dXJuIHUuaWQgPT0gdXNlci5pZFxuICAgICAgICAgIH0gZWxzZSBpZiAodS5lbWFpbCkge1xuICAgICAgICAgICAgcmV0dXJuIHUuZW1haWwgPT0gdXNlci5lbWFpbFxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgZXZlbnQ6IENPLkVWRU5UUy5VU0VSX1JFTU9WRUQsXG4gICAgICAgICAgYWN0aW9uOiBDTy5BQ1RJT05TLlJFTU9WRV9VU0VSLFxuICAgICAgICAgIGRhdGE6IHsgdXNlckFuZENvaW5zOiB1c2VyIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGNyZWF0b3IgPSB0aGlzLnN0YXRlLmNyZWF0b3I7XG5cbiAgICAgICAgY3JlYXRvci5jb2lucyA9IGNyZWF0b3IuY29pbnMgKyB1c2VyLmNvaW5zO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHNoYXJlcnM6IHVzZXJzLFxuICAgICAgICAgIGNyZWF0b3I6IGNyZWF0b3JcbiAgICAgICAgfSk7XG5cbiAgICAgIH0uYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlT3duZXJzaGlwQ2hhbmdlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgLy8gdGhpcyBuZWVkcyB0byBiZSBjb21wbGV0ZWx5IHJld3JpdHRlbiB0byB1c2UgdGhlIGRpc3BhdGNoZXIgYW5kIHN0b3JlKHMpXG4gICAgICByZXR1cm4gZnVuY3Rpb24ob3duZXJzaGlwKSB7XG4gICAgICAgIHVzZXIuY29pbnMgPSBNYXRoLmZsb29yKChvd25lcnNoaXAgLyAxMDApICogdGhpcy5wcm9wcy50b3RhbENvaW5zKTtcblxuICAgICAgICB2YXIgY3JlYXRvciA9IHRoaXMuc3RhdGUuY3JlYXRvcjtcbiAgICAgICAgdmFyIHNoYXJlcnMgPSB0aGlzLnN0YXRlLnNoYXJlcnM7XG5cbiAgICAgICAgdmFyIHNoYXJlckNvaW5zID0gXy5yZWR1Y2UoXG4gICAgICAgICAgXy5tYXAoc2hhcmVycyxcbiAgICAgICAgICBmdW5jLmRvdCgnY29pbnMnKSksXG4gICAgICAgICAgZnVuY3Rpb24obWVtbywgY29pbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1vICsgY29pbnM7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAwXG4gICAgICAgICk7XG5cbiAgICAgICAgY3JlYXRvci5jb2lucyA9IHRoaXMucHJvcHMudG90YWxDb2lucyAtIHNoYXJlckNvaW5zIHx8IDA7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgc2hhcmVyczogdGhpcy5zdGF0ZS5zaGFyZXJzLFxuICAgICAgICAgIGNyZWF0b3I6IGNyZWF0b3JcbiAgICAgICAgfSk7XG5cbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH1cbiAgfSk7XG5cbiAgdmFyIE93bmVyc2hpcFJvdyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ093bmVyc2hpcFJvdycsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG93bmVyc2hpcDogMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB1c2VyID0gdGhpcy5wcm9wcy51c2VyO1xuXG4gICAgICBpZiAodXNlci5lbWFpbCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWQgZ2x5cGhpY29uIGdseXBoaWNvbi1lbnZlbG9wZVwifSkpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgdXNlci5lbWFpbFxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cCBpbnB1dC1ncm91cC1zbVwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtyZWY6IFwib3duZXJzaGlwXCIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2wgdGV4dC1yaWdodFwiLCB0eXBlOiBcIm51bWJlclwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ293bmVyc2hpcFsnICsgdXNlci5lbWFpbCArICddJywgXG4gICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLm93bmVyc2hpcCwgXG4gICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZU93bmVyc2hpcENoYW5nZWR9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWFkZG9uXCJ9LCBcIiVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zXCIsIHN0eWxlOiB7J3doaXRlLXNwYWNlJzpcIm5vd3JhcFwifX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgICAgdXNlci5jb2luc1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCIsIG9uQ2xpY2s6IHByZXZlbnREZWZhdWx0KHRoaXMucHJvcHMub25SZW1vdmUpLCBjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBsaW5rLWhvdmVyLWRhbmdlclwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2xvc2VcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiUmVtb3ZlXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBBdmF0YXIoe3VzZXI6IHVzZXJ9KSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICBcIkBcIiwgdXNlci51c2VybmFtZVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cCBpbnB1dC1ncm91cC1zbVwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtyZWY6IFwib3duZXJzaGlwXCIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2wgdGV4dC1yaWdodFwiLCB0eXBlOiBcIm51bWJlclwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ293bmVyc2hpcFsnICsgdXNlci5pZCArICddJywgXG4gICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLm93bmVyc2hpcCwgXG4gICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZU93bmVyc2hpcENoYW5nZWR9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWFkZG9uXCJ9LCBcIiVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zXCIsIHN0eWxlOiB7J3doaXRlLXNwYWNlJzpcIm5vd3JhcFwifX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgICAgdXNlci5jb2luc1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCIsIG9uQ2xpY2s6IHByZXZlbnREZWZhdWx0KHRoaXMucHJvcHMub25SZW1vdmUpLCBjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBsaW5rLWhvdmVyLWRhbmdlclwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2xvc2VcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiUmVtb3ZlXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgaGFuZGxlT3duZXJzaGlwQ2hhbmdlZDogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHZhbCA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlLCAxMCk7XG5cbiAgICAgIGlmICh2YWwgPCAwKSB7XG4gICAgICAgIHZhbCA9IDA7XG4gICAgICB9XG5cbiAgICAgIHZhciB1c2VyID0gdGhpcy5wcm9wcy51c2VyO1xuICAgICAgdmFyIHVzZXJzID0gQ29pbk93bmVyc2hpcFN0b3JlLmdldFVzZXJzKCk7XG5cbiAgICAgIHZhciBzaGFyZXJDb2lucyA9IF8ucmVkdWNlKF8ubWFwKF8ucmVqZWN0KHVzZXJzLFxuICAgICAgICBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgcmV0dXJuIHMudXNlcm5hbWUgPT09IHVzZXIudXNlcm5hbWVcbiAgICAgICAgfSksXG4gICAgICAgIGZ1bmMuZG90KCdjb2lucycpKSxcbiAgICAgICAgZnVuY3Rpb24obWVtbywgY29pbnMpIHtcbiAgICAgICAgICByZXR1cm4gbWVtbyArIGNvaW5zO1xuICAgICAgICB9LFxuICAgICAgMCk7XG5cbiAgICAgIHZhciBwZXJjZW50YWdlUmVtYWluaW5nID0gMTAwIC0gTWF0aC5jZWlsKHNoYXJlckNvaW5zIC8gdGhpcy5wcm9wcy50b3RhbENvaW5zICogMTAwKTtcblxuICAgICAgaWYgKHZhbCA+PSBwZXJjZW50YWdlUmVtYWluaW5nKSB7XG4gICAgICAgIHZhbCA9IHBlcmNlbnRhZ2VSZW1haW5pbmc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBvd25lcnNoaXA6IHZhbFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMucHJvcHMub25Pd25lcnNoaXBDaGFuZ2VkKHZhbCk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENvaW5Pd25lcnNoaXA7XG4gIH1cblxuICB3aW5kb3cuQ29pbk93bmVyc2hpcCA9IENvaW5Pd25lcnNoaXA7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcblxuICBmdW5jdGlvbiBhdFVzZXJuYW1lKHVzZXIpIHtcbiAgICByZXR1cm4gJ0AnICsgdXNlci51c2VybmFtZVxuICB9XG5cbiAgZnVuY3Rpb24gYXZhdGFyVXJsKHVzZXIsIHNpemUpIHtcbiAgICBpZiAodXNlcikge1xuICAgICAgcmV0dXJuIHVzZXIuYXZhdGFyX3VybCArICc/cz0nICsgNDhcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcvYXNzZXRzL2F2YXRhcnMvZGVmYXVsdC5wbmcnXG4gICAgfVxuICB9XG5cbiAgdmFyIENvcmVUZWFtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ29yZVRlYW0nLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyB1c2VyczogW10sIHBvdGVudGlhbFVzZXI6IG51bGwgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnRhYmxlKHtjbGFzc05hbWU6IFwidGFibGVcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS50Ym9keShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50cih7Y2xhc3NOYW1lOiBcImFjdGl2ZVwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHthbHQ6IGF0VXNlcm5hbWUodGhpcy5wcm9wcy5jdXJyZW50VXNlciksIFxuICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImF2YXRhciBpbWctY2lyY2xlXCIsIFxuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjI0XCIsIHdpZHRoOiBcIjI0XCIsIFxuICAgICAgICAgICAgICAgICAgICAgc3JjOiBhdmF0YXJVcmwodGhpcy5wcm9wcy5jdXJyZW50VXNlciwgNDgpfSlcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBhdFVzZXJuYW1lKHRoaXMucHJvcHMuY3VycmVudFVzZXIpKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXCIoeW91KVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIHRoaXMucm93cygpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMuc3RhdGUucG90ZW50aWFsVXNlciA/IHRoaXMuYXZhdGFyKHRoaXMuc3RhdGUucG90ZW50aWFsVXNlcikgOiB0aGlzLmF2YXRhcihudWxsKSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgICAgUGVyc29uUGlja2VyKHtyZWY6IFwicGlja2VyXCIsIHVybDogXCIvX2VzXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyU2VsZWN0ZWQ6IHRoaXMuaGFuZGxlVXNlclNlbGVjdGVkLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsaWRVc2VyQ2hhbmdlZDogdGhpcy5oYW5kbGVWYWxpZFVzZXJDaGFuZ2VkfSlcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQnV0dG9uKClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBhZGRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUucG90ZW50aWFsVXNlcikge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwidGV4dC1zdWNjZXNzXCIsIGhyZWY6IFwiI1wiLCBvbkNsaWNrOiB0aGlzLmFkZFVzZXJDbGlja2VkfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1wbHVzLWNpcmNsZWRcIn0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJBZGRcIilcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LXN1Y2Nlc3NcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tcGx1cy1jaXJjbGVkXCJ9KSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiQWRkXCIpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSxcblxuICAgIHJvd3M6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gXy5tYXAodGhpcy5zdGF0ZS51c2VycywgZnVuY3Rpb24odXNlcil7XG4gICAgICAgIHJldHVybiBNZW1iZXJSb3coe3VzZXI6IHVzZXIsIG9uUmVtb3ZlOiB0aGlzLmhhbmRsZVVzZXJSZW1vdmVkKHVzZXIpLCBrZXk6IHVzZXIuaWQgfHwgdXNlci5lbWFpbH0pXG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIGhhbmRsZVVzZXJTZWxlY3RlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5hZGRVc2VyKHVzZXIpXG4gICAgfSxcblxuICAgIGhhbmRsZVVzZXJSZW1vdmVkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB1c2VycyA9IF8ucmVqZWN0KHRoaXMuc3RhdGUudXNlcnMsIGZ1bmN0aW9uKHUpe1xuICAgICAgICAgIGlmICh1LmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdS5pZCA9PSB1c2VyLmlkXG4gICAgICAgICAgfSBlbHNlIGlmICh1LmVtYWlsKSB7XG4gICAgICAgICAgICByZXR1cm4gdS5lbWFpbCA9PSB1c2VyLmVtYWlsXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHt1c2VyczogdXNlcnN9KTtcblxuICAgICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICBldmVudDogQ09OU1RBTlRTLkNPSU5fT1dORVJTSElQLkVWRU5UUy5VU0VSX1JFTU9WRUQsXG4gICAgICAgICAgYWN0aW9uOiBDT05TVEFOVFMuQ09JTl9PV05FUlNISVAuQUNUSU9OUy5SRU1PVkVfVVNFUixcbiAgICAgICAgICBkYXRhOiB7IHVzZXJBbmRDb2luczogdXNlciB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9LmJpbmQodGhpcylcbiAgICB9LFxuXG4gICAgaGFuZGxlVmFsaWRVc2VyQ2hhbmdlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7cG90ZW50aWFsVXNlcjogdXNlcn0pXG4gICAgfSxcblxuICAgIGFkZFVzZXJDbGlja2VkOiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuYWRkVXNlcih0aGlzLnN0YXRlLnBvdGVudGlhbFVzZXIpXG4gICAgICB0aGlzLnJlZnMucGlja2VyLmNsZWFyVGV4dCgpXG4gICAgfSxcblxuICAgIGFkZFVzZXI6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB7XG4gICAgICAgIHBvdGVudGlhbFVzZXI6IHskc2V0OiBudWxsfSxcbiAgICAgICAgdXNlcnM6IHsgJHB1c2g6IFt1c2VyXSB9XG4gICAgICB9KSlcblxuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGV2ZW50OiBDT05TVEFOVFMuQ09JTl9PV05FUlNISVAuRVZFTlRTLlVTRVJfQURERUQsXG4gICAgICAgIGFjdGlvbjogQ09OU1RBTlRTLkNPSU5fT1dORVJTSElQLkFDVElPTlMuQUREX1VTRVIsXG4gICAgICAgIGRhdGE6IHsgdXNlckFuZENvaW5zOiB1c2VyIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhdmF0YXI6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIGlmICh1c2VyICYmIHVzZXIuZW1haWwpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBnbHlwaGljb24gZ2x5cGhpY29uLWVudmVsb3BlXCJ9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJhdmF0YXIgaW1nLWNpcmNsZVwiLCBoZWlnaHQ6IFwiMjRcIiwgc3JjOiBhdmF0YXJVcmwodXNlciksIHdpZHRoOiBcIjI0XCJ9KVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGZuKGUpXG4gICAgfVxuICB9XG5cbiAgdmFyIE1lbWJlclJvdyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ01lbWJlclJvdycsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgaWYgKHRoaXMucHJvcHMudXNlci5lbWFpbCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWQgZ2x5cGhpY29uIGdseXBoaWNvbi1lbnZlbG9wZVwifSkpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCB0aGlzLnByb3BzLnVzZXIuZW1haWwpLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJoaWRkZW5cIiwgdmFsdWU6IHRoaXMucHJvcHMudXNlci5lbWFpbCwgbmFtZTogXCJjb3JlX3RlYW1bXVwifSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCIsIG9uQ2xpY2s6IHByZXZlbnREZWZhdWx0KHRoaXMucHJvcHMub25SZW1vdmUpLCBjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBsaW5rLWhvdmVyLWRhbmdlclwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2xvc2VcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiUmVtb3ZlXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJhdmF0YXJcIiwgc3JjOiBhdmF0YXJVcmwodGhpcy5wcm9wcy51c2VyLCA0OCksIHdpZHRoOiAyNCwgaGVpZ2h0OiAyNH0pKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXCJAXCIsIHRoaXMucHJvcHMudXNlci51c2VybmFtZSksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCB2YWx1ZTogdGhpcy5wcm9wcy51c2VyLmlkLCBuYW1lOiBcImNvcmVfdGVhbVtdXCJ9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgb25DbGljazogcHJldmVudERlZmF1bHQodGhpcy5wcm9wcy5vblJlbW92ZSksIGNsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGxpbmstaG92ZXItZGFuZ2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jbG9zZVwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJSZW1vdmVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb3JlVGVhbTtcbiAgfVxuXG4gIHdpbmRvdy5Db3JlVGVhbSA9IENvcmVUZWFtO1xuXG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIERlc2t0b3BOb3RpZmljYXRpb25zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRGVza3RvcE5vdGlmaWNhdGlvbnMnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBlbmFibGVkOiBmYWxzZSB9XG4gICAgfSxcblxuICAgIHVwZGF0ZUVuYWJsZWQ6IGZ1bmN0aW9uKGVuYWJsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlbmFibGVkOiBlbmFibGVkfSlcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5zdGF0ZS5lbmFibGVkKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy51cGRhdGVFbmFibGVkKCEoTm90aWZ5LmlzU3VwcG9ydGVkKCkgJiYgTm90aWZ5Lm5lZWRzUGVybWlzc2lvbigpKSlcbiAgICB9LFxuXG4gICAgaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpc1xuICAgICAgTm90aWZ5LnJlcXVlc3RQZXJtaXNzaW9uKGZ1bmN0aW9uKCl7XG4gICAgICAgIF90aGlzLnVwZGF0ZUVuYWJsZWQodHJ1ZSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIGlmKHRoaXMuc3RhdGUuZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4obnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNlbmFibGUtbm90aWZpY2F0aW9uc1wiLCBjbGFzc05hbWU6IFwianMtZW5hYmxlLW5vdGlmaWNhdGlvbnMgdGV4dC1zbWFsbFwiLCAnZGF0YS10b2dnbGUnOiBcInRvb2x0aXBcIiwgJ2RhdGEtcGxhY2VtZW50JzogXCJsZWZ0XCIsIHRpdGxlOiBcIkVuYWJsZcKgZGVza3RvcCBub3RpZmljYXRpb25zIGZvciBAbWVudGlvbnNcIiwgb25DbGljazogdGhpcy5oYW5kbGVDbGlja30sIFxuICAgICAgICAgICAgXCJFbmFibGUgbm90aWZpY2F0aW9uc1wiXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wTm90aWZpY2F0aW9ucztcbiAgfVxuXG4gIHdpbmRvdy5EZXNrdG9wTm90aWZpY2F0aW9ucyA9IERlc2t0b3BOb3RpZmljYXRpb25zO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgRHJhZ0FuZERyb3AgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEcmFnQW5kRHJvcCcsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IGRpc3BsYXk6ICdub25lJywgb3BhY2l0eTogMSB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2lkOiBcImxvZ28tdXBsb2FkXCIsIFxuICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiaW1nLXNoYWRvdyBqcy1kcm9wem9uZS1zZWxlY3RcIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9LCBcbiAgICAgICAgICAgICAgb25Nb3VzZUVudGVyOiB0aGlzLm9uTW91c2VFbnRlciwgXG4gICAgICAgICAgICAgIG9uTW91c2VMZWF2ZTogdGhpcy5vbk1vdXNlTGVhdmV9LCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogdGhpcy5wcm9wcy51cmwsIFxuICAgICAgICAgICAgICBhbHQ6IHRoaXMucHJvcHMuYWx0LCBcbiAgICAgICAgICAgICAgc3R5bGU6IHtvcGFjaXR5OiB0aGlzLnN0YXRlLm9wYWNpdHl9LCBcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImltZy1yb3VuZGVkXCIsIFxuICAgICAgICAgICAgICB3aWR0aDogXCIxMDAlXCJ9KSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7c3R5bGU6IHtcbiAgICAgICAgICAgICAgZGlzcGxheTogdGhpcy5zdGF0ZS5kaXNwbGF5LFxuICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgJ3otaW5kZXgnOiAtMSxcbiAgICAgICAgICAgICAgdG9wOiAnNDAlJyxcbiAgICAgICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICcxMnB4JyxcbiAgICAgICAgICAgICAgJ2ZvbnQtd2VpZ2h0JzogJ2JvbGQnXG4gICAgICAgICAgfX0sIFxuICAgICAgICAgICAgXCJEcmFnIGFuZCBkcm9wIG9yIGNsaWNrIGhlcmVcIiwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYnIobnVsbCksIFxuICAgICAgICAgICAgXCJ0byBjaGFuZ2UgdGhlIGxvZ29cIlxuICAgICAgICAgIClcblxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIFRPRE86IEZpeCB0aGlzIGdvZGF3ZnVsIGhhY2tcbiAgICAgIHZhciBfdGltZW91dCxcbiAgICAgICAgICBub2RlID0gdGhpcy5nZXRET01Ob2RlKCk7XG5cbiAgICAgICQobm9kZSkuYmluZCgnZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vIHByZXZlbnQgaml0dGVyc1xuICAgICAgICBpZiAoX3RpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoX3RpbWVvdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5zZXRTdGF0ZSh7XG4gICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgICBvcGFjaXR5OiAwLjVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgJChub2RlKS5iaW5kKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3BsYXk6ICdub25lJyxcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25Nb3VzZUVudGVyOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgb3BhY2l0eTogMC41XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25Nb3VzZUxlYXZlOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZGlzcGxheTogJ25vbmUnLFxuICAgICAgICBvcGFjaXR5OiAxXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gRHJhZ0FuZERyb3A7XG4gIH1cblxuICB3aW5kb3cuRHJhZ0FuZERyb3AgPSBEcmFnQW5kRHJvcDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgTmV3c0ZlZWRNaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9uZXdzX2ZlZWQuanMuanN4Jyk7XG52YXIgTmV3c0ZlZWRTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9uZXdzX2ZlZWRfc3RvcmUnKTtcbnZhciBBdmF0YXIgPSByZXF1aXJlKCcuL2F2YXRhci5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBORiA9IENPTlNUQU5UUy5ORVdTX0ZFRUQ7XG5cbiAgdmFyIERyb3Bkb3duTmV3c0ZlZWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEcm9wZG93bk5ld3NGZWVkJyxcbiAgICBtaXhpbnM6IFtOZXdzRmVlZE1peGluXSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBOZXdzRmVlZFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3Rvcmllcyk7XG5cbiAgICAgIHRoaXMuZmV0Y2hOZXdzRmVlZCh0aGlzLnByb3BzLnVybCk7XG5cbiAgICAgIHRoaXMub25QdXNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmZldGNoTmV3c0ZlZWQoKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGZldGNoTmV3c0ZlZWQ6IF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiBORi5BQ1RJT05TLkZFVENIX1NUT1JJRVMsXG4gICAgICAgIGV2ZW50OiBORi5FVkVOVFMuU1RPUklFU19GRVRDSEVELFxuICAgICAgICBkYXRhOiB0aGlzLnByb3BzLnVybFxuICAgICAgfSk7XG4gICAgfSwgMTAwMCksXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RvcmllczogbnVsbFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgbWFya0FsbEFzUmVhZDogZnVuY3Rpb24oKSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5SRUFEX0FMTCxcbiAgICAgICAgYWN0aW9uOiBORi5BQ1RJT05TLk1BUktfQUxMX0FTX1JFQUQsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblB1c2g6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICBpZiAod2luZG93LnB1c2hlcikge1xuICAgICAgICBjaGFubmVsID0gd2luZG93LnB1c2hlci5zdWJzY3JpYmUoJ0AnICsgdGhpcy5wcm9wcy51c2VybmFtZSk7XG4gICAgICAgIGNoYW5uZWwuYmluZF9hbGwoZm4pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiZHJvcGRvd24tbWVudVwiLCBzdHlsZTogeyAnbWF4LWhlaWdodCc6ICc1MDBweCcsICdtaW4td2lkdGgnOiAnMzgwcHgnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7c3R5bGU6IHsgJ292ZXJmbG93LXknOiAnc2Nyb2xsJ30sIHJlZjogXCJzcGlubmVyXCJ9LCBcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc3RvcmllcyA/IHRoaXMucm93cyh0aGlzLnN0YXRlLnN0b3JpZXMpIDogbnVsbFxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiZGl2aWRlclwiLCBzdHlsZTogeyAnbWFyZ2luLXRvcCc6ICcwcHgnfX0pLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB0aGlzLnByb3BzLmVkaXRVc2VyUGF0aCwgY2xhc3NOYW1lOiBcInRleHQtc21hbGxcIn0sIFwiU2V0dGluZ3NcIilcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNtYXJrLWFzLXJlYWRcIiwgY2xhc3NOYW1lOiBcInRleHQtc21hbGxcIiwgb25DbGljazogdGhpcy5tYXJrQWxsQXNSZWFkfSwgXCJNYXJrIGFsbCBhcyByZWFkXCIpXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIvbm90aWZpY2F0aW9uc1wiLCBjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwifSwgXCJBbGwgTm90aWZpY2F0aW9uc1wiKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oc3Rvcmllcykge1xuICAgICAgdmFyIHJvd3MgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoaSA+IDkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJvd3MucHVzaChcbiAgICAgICAgICBFbnRyeSh7c3Rvcnk6IHN0b3JpZXNbaV0sIGFjdG9yczogdGhpcy5zdGF0ZS5hY3RvcnMsIGZ1bGxQYWdlOiB0aGlzLnByb3BzLmZ1bGxQYWdlfSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXBcIiwgc3R5bGU6IHsgJ21heC1oZWlnaHQnOiAnMzAwcHgnLCAnbWluLWhlaWdodCc6ICc1MHB4J319LCBcbiAgICAgICAgICByb3dzXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHNwaW5uZXJPcHRpb25zOiB7XG4gICAgICBsaW5lczogMTEsXG4gICAgICB0b3A6ICcyMCUnXG4gICAgfVxuICB9KTtcblxuICB2YXIgRW50cnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdFbnRyeScsXG4gICAgYWN0b3JzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1hcChcbiAgICAgICAgdGhpcy5wcm9wcy5zdG9yeS5hY3Rvcl9pZHMsXG4gICAgICAgIGZ1bmN0aW9uKGFjdG9ySWQpIHtcbiAgICAgICAgICByZXR1cm4gXy5maW5kV2hlcmUodGhpcy5wcm9wcy5hY3RvcnMsIHsgaWQ6IGFjdG9ySWQgfSlcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBib2R5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0YXJnZXQgPSB0aGlzLnByb3BzLnN0b3J5LmFjdGl2aXRpZXNbMF0udGFyZ2V0O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCBcbiAgICAgICAgICB0aGlzLnZlcmJNYXBbdGhpcy5wcm9wcy5zdG9yeS52ZXJiXSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcbiAgICAgICAgICAgIHRoaXMuc3ViamVjdE1hcFt0aGlzLnByb3BzLnN0b3J5LnN1YmplY3RfdHlwZV0uY2FsbCh0aGlzLCB0YXJnZXQpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgdGhpcy5wcm9kdWN0KClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucmVmcy5ib2R5KSB7XG4gICAgICAgIHRoaXMucmVmcy5ib2R5LmdldERPTU5vZGUoKS5pbm5lckhUTUwgPSB0aGlzLnByb3BzLnN0b3J5LnN1YmplY3QuYm9keV9odG1sO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBlbGxpcHNpczogZnVuY3Rpb24odGV4dCkge1xuICAgICAgaWYgKHRleHQgJiYgdGV4dC5sZW5ndGggPiA0MCkge1xuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgNDApICsgJ+KApic7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3Rvcnk6IHRoaXMucHJvcHMuc3RvcnlcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGlzUmVhZDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5zdG9yeS5sYXN0X3JlYWRfYXQgIT09IDA7XG4gICAgfSxcblxuICAgIG1hcmtBc1JlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gRklYTUU6IFRoaXMgbWV0aG9kIHNob3VsZG4ndCB3b3JrIHRoaXMgd2F5OyB1c2UgdGhlIERpc3BhdGNoZXJcbiAgICAgIHZhciBzdG9yeSA9IHRoaXMuc3RhdGUuc3Rvcnk7XG4gICAgICBzdG9yeS5sYXN0X3JlYWRfYXQgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzdG9yeTogc3RvcnlcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtYXJrQXNSZWFkQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5pc1JlYWQoKSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tZGlzYyBwdWxsLXJpZ2h0XCIsIG9uQ2xpY2s6IHRoaXMubWFya0FzUmVhZCwgdGl0bGU6ICdNYXJrIGFzIHJlYWQnLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ319KTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogTWFyayBhcyB1bnJlYWRcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jaXJjbGUgcHVsbC1yaWdodFwiLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ319KVxuICAgIH0sXG5cbiAgICBwcmV2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib2R5X3ByZXZpZXcgPSB0aGlzLnByb3BzLnN0b3J5LmJvZHlfcHJldmlldztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCIsIHN0eWxlOiB7ICd0ZXh0LW92ZXJmbG93JzogJ2VsbGlwc2lzJ319LCBcbiAgICAgICAgICB0aGlzLmVsbGlwc2lzKGJvZHlfcHJldmlldylcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcHJvZHVjdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvZHVjdCA9IHRoaXMucHJvcHMuc3RvcnkucHJvZHVjdDtcblxuICAgICAgcmV0dXJuICcgaW4gJyArIHByb2R1Y3QubmFtZTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhY3RvcnMgPSBfLm1hcCh0aGlzLmFjdG9ycygpLCBmdW5jLmRvdCgndXNlcm5hbWUnKSkuam9pbignLCBAJylcblxuICAgICAgdmFyIGNsYXNzZXMgPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQoe1xuICAgICAgICAnZW50cnktcmVhZCc6IHRoaXMuaXNSZWFkKCksXG4gICAgICAgICdlbnRyeS11bnJlYWQnOiAhdGhpcy5pc1JlYWQoKSxcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiAnbGlzdC1ncm91cC1pdGVtICcgKyBjbGFzc2VzLCBcbiAgICAgICAgICAgIGhyZWY6IHRoaXMucHJvcHMuc3RvcnkudXJsLCBcbiAgICAgICAgICAgIHN0eWxlOiB7ICdmb250LXNpemUnOiAnMTRweCd9LCBcbiAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuc3RhdGUuc3RvcnkubGFzdF9yZWFkX2F0ID8gbnVsbCA6IHRoaXMubWFya0FzUmVhZH0sIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLW1kLTFcIn0sIFxuICAgICAgICAgICAgICBBdmF0YXIoe3VzZXI6IHRoaXMuYWN0b3JzKClbMF0sIHNpemU6IDE4fSksIFwiwqBcIlxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtMTBcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIGFjdG9ycyksIFwiIFwiLCB0aGlzLmJvZHkoKSwgXG4gICAgICAgICAgICAgIHRoaXMucHJldmlldygpXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC0xXCJ9LCBcbiAgICAgICAgICAgICAgdGhpcy5tYXJrQXNSZWFkQnV0dG9uKClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHN1YmplY3RNYXA6IHtcbiAgICAgIFRhc2s6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgcmV0dXJuIFwiI1wiICsgdGFzay5udW1iZXI7XG4gICAgICB9LFxuXG4gICAgICBEaXNjdXNzaW9uOiBmdW5jdGlvbihkaXNjdXNzaW9uKSB7XG4gICAgICAgIHJldHVybiAnZGlzY3Vzc2lvbidcbiAgICAgIH0sXG5cbiAgICAgIFdpcDogZnVuY3Rpb24oYm91bnR5KSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZ1bGxQYWdlKSB7XG4gICAgICAgICAgcmV0dXJuIFwiI1wiICsgYm91bnR5Lm51bWJlciArIFwiIFwiICsgYm91bnR5LnRpdGxlXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gXCIjXCIgKyBib3VudHkubnVtYmVyO1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtb21lbnQodGhpcy5wcm9wcy5zdG9yeS5jcmVhdGVkKS5mb3JtYXQoXCJkZGQsIGhBXCIpXG4gICAgfSxcblxuICAgIHZlcmJNYXA6IHtcbiAgICAgICdDb21tZW50JzogJ2NvbW1lbnRlZCBvbiAnLFxuICAgICAgJ0F3YXJkJzogJ2F3YXJkZWQgJyxcbiAgICAgICdDbG9zZSc6ICdjbG9zZWQgJ1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEcm9wZG93bk5ld3NGZWVkO1xuICB9XG5cbiAgd2luZG93LkRyb3Bkb3duTmV3c0ZlZWQgPSBEcm9wZG93bk5ld3NGZWVkO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRHJvcGRvd25Ub2dnbGVyTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvZHJvcGRvd25fdG9nZ2xlci5qcy5qc3gnKTtcbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBORiA9IENPTlNUQU5UUy5ORVdTX0ZFRUQ7XG5cbiAgdmFyIERyb3Bkb3duTmV3c0ZlZWRUb2dnbGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXInLFxuICAgIG1peGluczogW0Ryb3Bkb3duVG9nZ2xlck1peGluXSxcblxuICAgIGFja25vd2xlZGdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICAgIGxvY2FsU3RvcmFnZS5uZXdzRmVlZEFjayA9IHRpbWVzdGFtcDtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aW1lc3RhbXBcbiAgICAgIH0pO1xuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5BQ0tOT1dMRURHRUQsXG4gICAgICAgIGFjdGlvbjogTkYuQUNUSU9OUy5BQ0tOT1dMRURHRSxcbiAgICAgICAgZGF0YTogdGltZXN0YW1wLFxuICAgICAgICBzeW5jOiB0cnVlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYmFkZ2U6IGZ1bmN0aW9uKHRvdGFsKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJiYWRnZSBiYWRnZS1ub3RpZmljYXRpb25cIn0sIHRvdGFsKTtcbiAgICB9LFxuXG4gICAgYmFkZ2VDb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5sYXRlc3RTdG9yeVRpbWVzdGFtcCgpID4gdGhpcy5zdGF0ZS5hY2tub3dsZWRnZWRBdCkge1xuICAgICAgICByZXR1cm4gTmV3c0ZlZWRTdG9yZS5nZXRVbnJlYWRDb3VudCh0aGlzLnN0YXRlLmFja25vd2xlZGdlZEF0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIDA7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBOZXdzRmVlZFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3Rvcmllcyk7XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdG9yaWVzOiBudWxsLFxuICAgICAgICBhY2tub3dsZWRnZWRBdDogdGhpcy5zdG9yZWRBY2soKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0U3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc3RvcmllczogTmV3c0ZlZWRTdG9yZS5nZXRTdG9yaWVzKClcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBsYXRlc3RTdG9yeTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3RvcmllcyA9IHRoaXMuc3RhdGUuc3RvcmllcztcblxuICAgICAgaWYgKCFzdG9yaWVzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0b3J5O1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoc3RvcnkgJiYgc3Rvcmllc1tpXS51cGRhdGVkID4gc3RvcnkudXBkYXRlZCkge1xuICAgICAgICAgIHN0b3J5ID0gc3Rvcmllc1tpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3RvcnkpIHtcbiAgICAgICAgICBzdG9yeSA9IHN0b3JpZXNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0b3J5O1xuICAgIH0sXG5cbiAgICBsYXRlc3RTdG9yeVRpbWVzdGFtcDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3RvcnkgPSB0aGlzLmxhdGVzdFN0b3J5KCk7XG5cbiAgICAgIHJldHVybiBzdG9yeSAmJiBzdG9yeS51cGRhdGVkID8gc3RvcnkudXBkYXRlZCA6IDA7XG4gICAgfSxcblxuICAgIHN0b3JlZEFjazogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZXN0YW1wID0gbG9jYWxTdG9yYWdlLm5ld3NGZWVkQWNrO1xuXG4gICAgICBpZiAodGltZXN0YW1wID09IG51bGwgfHwgdGltZXN0YW1wID09PSAnbnVsbCcpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQodGltZXN0YW1wLCAxMCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERyb3Bkb3duTmV3c0ZlZWRUb2dnbGVyO1xuICB9XG5cbiAgd2luZG93LkRyb3Bkb3duTmV3c0ZlZWRUb2dnbGVyID0gRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbi8vIFRPRE86IFRpZHkgdXAgc2hhcmVkIHN0YXRlXG5cbi8qKlxuICogUmlnaHQgbm93LCBib3RoIHRoZSB0YWJsZSBhbmQgdGhlIG1ldGVyIGhhdmVcbiAqIGFsbCBvZiB0aGUgZmluYW5jaWFscyBpbiBzdGF0ZTsgaXQgd291bGQgYmVcbiAqIGJldHRlciB0byBtb3ZlIGFsbCBvZiB0aGlzIHRvIHRoZSBGaW5hbmNpYWxzU3RvcmVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBGaW5hbmNpYWxzU3RvcmUgPSB7XG4gICAgbW9udGg6ICdKdW5lJyxcbiAgICBnZXRNb250aDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5tb250aDtcbiAgICB9LFxuXG4gICAgc2V0TW9udGg6IGZ1bmN0aW9uKG1vbnRoKSB7XG4gICAgICB0aGlzLm1vbnRoID0gbW9udGg7XG4gICAgfVxuICB9O1xuXG4gIHZhciBGaW5hbmNpYWxzQWN0aW9ucyA9IHtcbiAgICBhZGRDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMgfHwgW107XG4gICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKVxuICAgIH0sXG5cbiAgICBzZW5kQ2hhbmdlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgXy5lYWNoKHRoaXMubGlzdGVuZXJzLCBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIEZpbmFuY2lhbHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGaW5hbmNpYWxzJyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGZpbmFuY2lhbHM6IHtcbiAgICAgICAgICBKYW51YXJ5OiAyNzczMixcbiAgICAgICAgICBGZWJydWFyeTogMjA3MDQsXG4gICAgICAgICAgTWFyY2g6IDM0MDIwLFxuICAgICAgICAgIEFwcmlsOiAzMDA3NCxcbiAgICAgICAgICBNYXk6IDI2NjMyLFxuICAgICAgICAgIEp1bmU6IDI3MzM0XG4gICAgICAgIH0sXG4gICAgICAgIGV4cGVuc2VzOiB7XG4gICAgICAgICAgSmFudWFyeTogMjk5OCxcbiAgICAgICAgICBGZWJydWFyeTogNDAyNCxcbiAgICAgICAgICBNYXJjaDogMzM2MyxcbiAgICAgICAgICBBcHJpbDogMzQzMyxcbiAgICAgICAgICBNYXk6IDM0NzQsXG4gICAgICAgICAgSnVuZTogMzQ4N1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuYW1lID0gdGhpcy5wcm9wcy5wcm9kdWN0Lm5hbWU7XG4gICAgICB2YXIgY29zdHMgPSB0aGlzLnN0YXRlLmV4cGVuc2VzW0ZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpXTtcbiAgICAgIHZhciBhbm51aXR5ID0gXCIxODAwMFwiO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiZmluYW5jaWFsc1wifSwgXG4gICAgICAgICAgRmluYW5jaWFsc0tleSh7XG4gICAgICAgICAgICAgIHByb2R1Y3Q6IHRoaXMucHJvcHMucHJvZHVjdH1cbiAgICAgICAgICApLCBcblxuICAgICAgICAgIEZpbmFuY2lhbHNNZXRlcih7XG4gICAgICAgICAgICAgIHByb2R1Y3Q6IHRoaXMucHJvcHMucHJvZHVjdCwgXG4gICAgICAgICAgICAgIGZpbmFuY2lhbHM6IHRoaXMuc3RhdGUuZmluYW5jaWFscywgXG4gICAgICAgICAgICAgIGNvc3RzOiB0aGlzLnN0YXRlLmV4cGVuc2VzLCBcbiAgICAgICAgICAgICAgYW5udWl0eTogYW5udWl0eX1cbiAgICAgICAgICApLCBcblxuICAgICAgICAgIEZpbmFuY2lhbHNUYWJsZSh7XG4gICAgICAgICAgICAgIHByb2R1Y3Q6IHRoaXMucHJvcHMucHJvZHVjdCwgXG4gICAgICAgICAgICAgIGZpbmFuY2lhbHM6IHRoaXMuc3RhdGUuZmluYW5jaWFscywgXG4gICAgICAgICAgICAgIGNvc3RzOiB0aGlzLnN0YXRlLmV4cGVuc2VzLCBcbiAgICAgICAgICAgICAgYW5udWl0eTogYW5udWl0eX1cbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgRmluYW5jaWFsc0tleSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ZpbmFuY2lhbHNLZXknLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBGaW5hbmNpYWxzQWN0aW9ucy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRPRE86IEJyZWFrIG91dCBkbC1pbmxpbmUgc3R5bGVzIGludG8gcmV1c2FibGUgU0NTUyBjb21wb25lbnRzXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgIFJlYWN0LkRPTS5kbCh7Y2xhc3NOYW1lOiBcInRleHQtc21hbGxcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmR0KHtzdHlsZTogeyd3aWR0aCc6ICcxMHB4JywgJ2hlaWdodCc6ICcxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyM0OGEzZWQnfX0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kZCh7c3R5bGU6IHsnbWFyZ2luLWxlZnQnOiAnNXB4JywgJ21hcmdpbi1yaWdodCc6ICcxNXB4JywgZGlzcGxheTogJ2lubGluZScsIGNsZWFyOiAnbGVmdCd9fSwgdGhpcy5wcm9wcy5wcm9kdWN0Lm5hbWUsIFwiIGFubnVpdHlcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmR0KHtzdHlsZTogeyd3aWR0aCc6ICcxMHB4JywgJ2hlaWdodCc6ICcxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmOTMyMzInfX0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kZCh7c3R5bGU6IHsnbWFyZ2luLWxlZnQnOiAnNXB4JywgJ21hcmdpbi1yaWdodCc6ICcxNXB4JywgZGlzcGxheTogJ2lubGluZScsIGNsZWFyOiAnbGVmdCd9fSwgXCJFeHBlbnNlcyAoaG9zdGluZywgbWFpbnRlbmFuY2UsIGV0Yy4pXCIpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kdCh7c3R5bGU6IHsnd2lkdGgnOiAnMTBweCcsICdoZWlnaHQnOiAnMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCAnYmFja2dyb3VuZC1jb2xvcic6ICcjZmQ2YjJmJ319KSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGQoe3N0eWxlOiB7J21hcmdpbi1sZWZ0JzogJzVweCcsICdtYXJnaW4tcmlnaHQnOiAnMTVweCcsIGRpc3BsYXk6ICdpbmxpbmUnLCBjbGVhcjogJ2xlZnQnfX0sIFwiQXNzZW1ibHlcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmR0KHtzdHlsZTogeyd3aWR0aCc6ICcxMHB4JywgJ2hlaWdodCc6ICcxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNlOWFkMWEnfX0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kZCh7c3R5bGU6IHsnbWFyZ2luLWxlZnQnOiAnNXB4JywgJ21hcmdpbi1yaWdodCc6ICcxNXB4JywgZGlzcGxheTogJ2lubGluZScsIGNsZWFyOiAnbGVmdCd9fSwgXCJBcHAgQ29pbiBob2xkZXJzXCIpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCB0aGlzLnN0YXRlLm1vbnRoKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vbnRoOiBGaW5hbmNpYWxzU3RvcmUuZ2V0TW9udGgoKSB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBGaW5hbmNpYWxzTWV0ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGaW5hbmNpYWxzTWV0ZXInLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBGaW5hbmNpYWxzQWN0aW9ucy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSlcbiAgICB9LFxuXG4gICAgX29uQ2hhbmdlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vbnRoOiBGaW5hbmNpYWxzU3RvcmUuZ2V0TW9udGgoKSB9KVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5hbWUgPSB0aGlzLnByb3BzLnByb2R1Y3QubmFtZTtcbiAgICAgIHZhciB0b3RhbCA9IHRoaXMucHJvcHMuZmluYW5jaWFsc1t0aGlzLnN0YXRlLm1vbnRoXTtcbiAgICAgIHZhciBjb3N0cyA9IHRoaXMucHJvcHMuY29zdHNbdGhpcy5zdGF0ZS5tb250aF07XG5cbiAgICAgIHZhciBhbm51aXR5ID0gY2FsY3VsYXRlQW5udWl0eSh0b3RhbCwgY29zdHMsIHRoaXMucHJvcHMuYW5udWl0eSk7XG4gICAgICB2YXIgZXhwZW5zZXMgPSBjYWxjdWxhdGVFeHBlbnNlcyh0b3RhbCwgY29zdHMpO1xuICAgICAgdmFyIGNvbW11bml0eVNoYXJlID0gY2FsY3VsYXRlQ29tbXVuaXR5U2hhcmUodG90YWwsIGNvc3RzLCB0aGlzLnByb3BzLmFubnVpdHkpO1xuICAgICAgdmFyIGFzc2VtYmx5U2hhcmUgPSBjb21tdW5pdHlTaGFyZSAqIDAuMTtcbiAgICAgIGNvbW11bml0eVNoYXJlID0gY29tbXVuaXR5U2hhcmUgLSBhc3NlbWJseVNoYXJlO1xuXG4gICAgICB2YXIgYW5udWl0eVdpZHRoID0gYW5udWl0eSAvIHRvdGFsICogMTAwO1xuICAgICAgdmFyIGNvc3RzV2lkdGggPSBleHBlbnNlcyAvIHRvdGFsICogMTAwO1xuICAgICAgdmFyIGNvbW11bml0eVdpZHRoID0gY29tbXVuaXR5U2hhcmUgLyB0b3RhbCAqIDEwMDtcbiAgICAgIHZhciBhc3NlbWJseVdpZHRoID0gYXNzZW1ibHlTaGFyZSAvIHRvdGFsICogMTAwIDtcblxuICAgICAgaWYgKGFzc2VtYmx5U2hhcmUgPiAwKSB7XG4gICAgICAgIGFzc2VtYmx5V2lkdGggKz0gNTtcbiAgICAgICAgYW5udWl0eVdpZHRoIC09IDU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwcm9ncmVzc1wifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IG5hbWUgKyAnLW1ldGVyJywgXG4gICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyXCIsIFxuICAgICAgICAgICAgICAgcm9sZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogYW5udWl0eVdpZHRoICsgJyUnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgJyQnICsgbnVtZXJhbChhbm51aXR5KS5mb3JtYXQoJzAsMCcpKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2lkOiBcImNvc3RzLXNoYXJlXCIsIFxuICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItZGFuZ2VyXCIsIFxuICAgICAgICAgICAgICAgcm9sZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogY29zdHNXaWR0aCArICclJ319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsICckJyArIG51bWVyYWwoZXhwZW5zZXMpLmZvcm1hdCgnMCwwJykpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IFwiYXNzZW1ibHktc2hhcmVcIiwgXG4gICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyXCIsIFxuICAgICAgICAgICAgICAgcm9sZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogYXNzZW1ibHlXaWR0aCArICclJywgJ2JhY2tncm91bmQtY29sb3InOiAnI2ZkNmIyZid9fSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCAnJCcgKyBudW1lcmFsKGFzc2VtYmx5U2hhcmUpLmZvcm1hdCgnMCwwJykpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IFwiY29tbXVuaXR5LW1ldGVyXCIsIFxuICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItd2FybmluZ1wiLCBcbiAgICAgICAgICAgICAgIHJvbGU6IFwicHJvZ3Jlc3MtYmFyXCIsIFxuICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6IGNvbW11bml0eVdpZHRoICsgJyUnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgJyQnICsgbnVtZXJhbChjb21tdW5pdHlTaGFyZSkuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgRmluYW5jaWFsc1RhYmxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRmluYW5jaWFsc1RhYmxlJyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG1vbnRoOiBGaW5hbmNpYWxzU3RvcmUuZ2V0TW9udGgoKVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgRmluYW5jaWFsc0FjdGlvbnMuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5fb25DaGFuZ2UpXG4gICAgfSxcblxuICAgIF9vbkNoYW5nZTogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb250aDogRmluYW5jaWFsc1N0b3JlLmdldE1vbnRoKCkgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuYW1lID0gdGhpcy5wcm9wcy5wcm9kdWN0Lm5hbWU7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0YWJsZS1yZXNwb25zaXZlXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00udGFibGUoe2NsYXNzTmFtZTogXCJ0YWJsZSB0YWJsZS1ob3ZlclwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGhlYWQobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y2xhc3NOYW1lOiBcInRleHQtbGVmdFwifSwgXG4gICAgICAgICAgICAgICAgICBcIlRvdGFsIHJldmVudWVcIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgICAgXCJFeHBlbnNlc1wiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgICBcIkFzc2VtYmx5XCJcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiQXBwIENvaW4gaG9sZGVyc1wiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50Ym9keShudWxsLCBcbiAgICAgICAgICAgICAgdGhpcy50Qm9keSgpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0Qm9keTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgZmluYW5jaWFscyA9IHRoaXMucHJvcHMuZmluYW5jaWFscztcblxuICAgICAgcmV0dXJuIF8ubWFwKE9iamVjdC5rZXlzKGZpbmFuY2lhbHMpLCBmdW5jdGlvbiBtYXBGaW5hbmNpYWxzKG1vbnRoKSB7XG4gICAgICAgIHZhciB0b3RhbCA9IGZpbmFuY2lhbHNbbW9udGhdO1xuICAgICAgICB2YXIgY29zdHMgPSBzZWxmLnByb3BzLmNvc3RzW21vbnRoXTtcblxuICAgICAgICB2YXIgcHJvZml0ID0gY2FsY3VsYXRlUHJvZml0KHRvdGFsLCBjb3N0cyk7XG4gICAgICAgIHZhciBhbm51aXR5ID0gY2FsY3VsYXRlQW5udWl0eSh0b3RhbCwgY29zdHMsIHNlbGYucHJvcHMuYW5udWl0eSk7XG4gICAgICAgIHZhciBleHBlbnNlcyA9IGNhbGN1bGF0ZUV4cGVuc2VzKHRvdGFsLCBjb3N0cyk7XG4gICAgICAgIHZhciBjb21tdW5pdHlTaGFyZSA9IGNhbGN1bGF0ZUNvbW11bml0eVNoYXJlKHRvdGFsLCBjb3N0cywgc2VsZi5wcm9wcy5hbm51aXR5KTtcbiAgICAgICAgdmFyIGFzc2VtYmx5U2hhcmUgPSBjb21tdW5pdHlTaGFyZSAqIDAuMTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIHNlbGYudFJvdyhtb250aCwgdG90YWwsIGFubnVpdHksIGV4cGVuc2VzLCBhc3NlbWJseVNoYXJlLCBjb21tdW5pdHlTaGFyZSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0Um93OiBmdW5jdGlvbihtb250aCwgdG90YWwsIGFubnVpdHksIGNvc3RzLCBhc3NlbWJseSwgY29tbXVuaXR5KSB7XG4gICAgICB2YXIgbXV0ZWQgPSAnJztcbiAgICAgIGlmIChbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5J10uaW5kZXhPZihtb250aCkgPj0gMCkge1xuICAgICAgICBtdXRlZCA9ICcgdGV4dC1tdXRlZCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS50cih7c3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ30sIG9uTW91c2VPdmVyOiB0aGlzLm1vbnRoQ2hhbmdlZChtb250aCksIGtleTogbW9udGh9LCBcbiAgICAgICAgICBSZWFjdC5ET00udGQoe2lkOiAnZmluYW5jaWFscy0nICsgbW9udGh9LCBtb250aCksIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCAnJCcgKyBudW1lcmFsKHRvdGFsKS5mb3JtYXQoJzAsMCcpKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgJyQnICsgbnVtZXJhbChjb3N0cykuZm9ybWF0KCcwLDAnKSksIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sICckJyArIG51bWVyYWwoYW5udWl0eSkuZm9ybWF0KCcwLDAnKSksIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIiArIG11dGVkfSwgJyQnICsgbnVtZXJhbChhc3NlbWJseSkuZm9ybWF0KCcwLDAnKSksIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIiArIG11dGVkfSwgJyQnICsgbnVtZXJhbChjb21tdW5pdHkgLSBhc3NlbWJseSkuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgbW9udGhDaGFuZ2VkOiBmdW5jdGlvbihtb250aCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgRmluYW5jaWFsc1N0b3JlLnNldE1vbnRoKG1vbnRoKTtcbiAgICAgICAgRmluYW5jaWFsc0FjdGlvbnMuc2VuZENoYW5nZShtb250aCk7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlUHJvZml0KHRvdGFsLCBjb3N0cykge1xuICAgIHRvdGFsID0gcGFyc2VJbnQodG90YWwsIDEwKTtcbiAgICBjb3N0cyA9IHBhcnNlSW50KGNvc3RzLCAxMCk7XG5cbiAgICByZXR1cm4gdG90YWwgLSBjb3N0cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZUV4cGVuc2VzKHRvdGFsLCBjb3N0cykge1xuICAgIHRvdGFsID0gcGFyc2VJbnQodG90YWwsIDEwKTtcbiAgICBjb3N0cyA9IHBhcnNlSW50KGNvc3RzLCAxMCk7XG5cbiAgICByZXR1cm4gY29zdHM7XG4gIH1cblxuICBmdW5jdGlvbiBjYWxjdWxhdGVBbm51aXR5KHRvdGFsLCBjb3N0cywgYW5udWl0eSkge1xuICAgIHRvdGFsID0gcGFyc2VJbnQodG90YWwsIDEwKTtcbiAgICBjb3N0cyA9IGNhbGN1bGF0ZUV4cGVuc2VzKHRvdGFsLCBwYXJzZUludChjb3N0cywgMTApKTtcbiAgICBhbm51aXR5ID0gcGFyc2VJbnQoYW5udWl0eSwgMTApO1xuXG4gICAgdmFyIHByb2ZpdCA9IGNhbGN1bGF0ZVByb2ZpdCh0b3RhbCwgY29zdHMpO1xuXG4gICAgcmV0dXJuIHByb2ZpdCA8IGFubnVpdHkgPyBwcm9maXQgOiBhbm51aXR5O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlQ29tbXVuaXR5U2hhcmUodG90YWwsIGNvc3RzLCBhbm51aXR5KSB7XG4gICAgdG90YWwgPSBwYXJzZUludCh0b3RhbCwgMTApO1xuICAgIGNvc3RzID0gY2FsY3VsYXRlRXhwZW5zZXModG90YWwsIHBhcnNlSW50KGNvc3RzLCAxMCkpO1xuICAgIGFubnVpdHkgPSBwYXJzZUludChhbm51aXR5LCAxMCk7XG5cbiAgICB2YXIgcHJvZml0ID0gY2FsY3VsYXRlUHJvZml0KHRvdGFsLCBjb3N0cyk7XG5cbiAgICByZXR1cm4gcHJvZml0IDwgYW5udWl0eSA/IDAgOiBwcm9maXQgLSBhbm51aXR5O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBGaW5hbmNpYWxzO1xuICB9XG5cbiAgd2luZG93LkZpbmFuY2lhbHMgPSBGaW5hbmNpYWxzO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBGb3JtR3JvdXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGb3JtR3JvdXAnLFxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBlcnJvcjogbnVsbCB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldCh7XG4gICAgICAgICdmb3JtLWdyb3VwJzogdHJ1ZSxcbiAgICAgICAgJ2hhcy1lcnJvcic6IHRoaXMucHJvcHMuZXJyb3IsXG4gICAgICAgICdoYXMtZmVlZGJhY2snOiB0aGlzLnByb3BzLmVycm9yXG4gICAgICB9KVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjbGFzc2VzfSwgXG4gICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlbiwgXG4gICAgICAgICAgdGhpcy5wcm9wcy5lcnJvciA/IHRoaXMuZXJyb3JHbHlwaCgpIDogbnVsbCwgXG4gICAgICAgICAgdGhpcy5wcm9wcy5lcnJvciA/IHRoaXMuZXJyb3JNZXNzYWdlKCkgOiBudWxsXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgZXJyb3JHbHlwaDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZSBmb3JtLWNvbnRyb2wtZmVlZGJhY2tcIn0pXG4gICAgfSxcblxuICAgIGVycm9yTWVzc2FnZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJoZWxwLWJsb2NrXCJ9LCB0aGlzLnByb3BzLmVycm9yKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBGb3JtR3JvdXA7XG4gIH1cblxuICB3aW5kb3cuRm9ybUdyb3VwID0gRm9ybUdyb3VwO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBOZXdzRmVlZE1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL25ld3NfZmVlZC5qcy5qc3gnKTtcbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xudmFyIEF2YXRhciA9IHJlcXVpcmUoJy4vYXZhdGFyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBORiA9IENPTlNUQU5UUy5ORVdTX0ZFRUQ7XG5cbiAgdmFyIEZ1bGxQYWdlTmV3c0ZlZWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGdWxsUGFnZU5ld3NGZWVkJyxcbiAgICBtaXhpbnM6IFtOZXdzRmVlZE1peGluXSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBOZXdzRmVlZFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3Rvcmllcyk7XG4gICAgICB0aGlzLmZldGNoTmV3c0ZlZWQoKTtcblxuICAgICAgdGhpcy5vblB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hOZXdzRmVlZCgpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hOZXdzRmVlZDogXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IE5GLkFDVElPTlMuRkVUQ0hfU1RPUklFUyxcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5TVE9SSUVTX0ZFVENIRUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMudXJsXG4gICAgICB9KTtcbiAgICB9LCAxMDAwKSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdG9yaWVzOiBudWxsXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBtb3JlU3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdFN0b3J5ID0gdGhpcy5zdGF0ZS5zdG9yaWVzW3RoaXMuc3RhdGUuc3Rvcmllcy5sZW5ndGggLSAxXTtcblxuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogTkYuQUNUSU9OUy5GRVRDSF9NT1JFX1NUT1JJRVMsXG4gICAgICAgIGV2ZW50OiBORi5FVkVOVFMuU1RPUklFU19GRVRDSEVELFxuICAgICAgICBkYXRhOiB0aGlzLnByb3BzLnVybCArICc/dG9wX2lkPScgKyBsYXN0U3RvcnkuaWRcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblB1c2g6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICBpZiAod2luZG93LnB1c2hlcikge1xuICAgICAgICBjaGFubmVsID0gd2luZG93LnB1c2hlci5zdWJzY3JpYmUoJ0AnICsgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lKTtcbiAgICAgICAgY2hhbm5lbC5iaW5kX2FsbChmbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic2hlZXRcIiwgc3R5bGU6IHsgJ21pbi1oZWlnaHQnOiAnNjAwcHgnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYWdlLWhlYWRlciBzaGVldC1oZWFkZXJcIiwgc3R5bGU6IHsgJ3BhZGRpbmctbGVmdCc6ICcyMHB4J319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMih7Y2xhc3NOYW1lOiBcInBhZ2UtaGVhZGVyLXRpdGxlXCJ9LCBcIllvdXIgbm90aWZpY2F0aW9uc1wiKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAgbGlzdC1ncm91cC1icmVha291dFwiLCByZWY6IFwic3Bpbm5lclwifSwgXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnN0b3JpZXMgPyB0aGlzLnJvd3ModGhpcy5zdGF0ZS5zdG9yaWVzKSA6IG51bGxcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNtb3JlXCIsIGNsYXNzTmFtZTogXCJidG4gYnRuLWJsb2NrXCIsIG9uQ2xpY2s6IHRoaXMubW9yZVN0b3JpZXN9LCBcIk1vcmVcIilcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oc3Rvcmllcykge1xuICAgICAgdmFyIHJvd3MgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICByb3dzLnB1c2goXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAtaXRlbVwiLCBrZXk6IHN0b3JpZXNbaV0ua2V5fSwgXG4gICAgICAgICAgICBFbnRyeSh7c3Rvcnk6IHN0b3JpZXNbaV0sIGFjdG9yczogdGhpcy5zdGF0ZS5hY3RvcnMsIGZ1bGxQYWdlOiB0aGlzLnByb3BzLmZ1bGxQYWdlfSlcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByb3dzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEVudHJ5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRW50cnknLFxuICAgIGFjdG9yczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5tYXAoXG4gICAgICAgIHRoaXMucHJvcHMuc3RvcnkuYWN0b3JfaWRzLFxuICAgICAgICBmdW5jdGlvbihhY3RvcklkKSB7XG4gICAgICAgICAgcmV0dXJuIF8uZmluZFdoZXJlKHRoaXMucHJvcHMuYWN0b3JzLCB7IGlkOiBhY3RvcklkIH0pXG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgYm9keTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5wcm9wcy5zdG9yeS5hY3Rpdml0aWVzWzBdLnRhcmdldDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgXG4gICAgICAgICAgdGhpcy52ZXJiTWFwW3RoaXMucHJvcHMuc3RvcnkudmVyYl0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXG4gICAgICAgICAgICB0aGlzLnN1YmplY3RNYXBbdGhpcy5wcm9wcy5zdG9yeS5zdWJqZWN0X3R5cGVdLmNhbGwodGhpcywgdGFyZ2V0KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnN0b3J5Lmxhc3RfcmVhZF9hdCAhPSBudWxsO1xuICAgIH0sXG5cbiAgICBtYXJrQXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogTkYuRVZFTlRTLlJFQUQsXG4gICAgICAgIGFjdGlvbjogTkYuQUNUSU9OUy5NQVJLX0FTX1JFQUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMuc3RvcnkuaWRcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtYXJrQXNSZWFkQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5pc1JlYWQoKSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tZGlzY1wiLCBvbkNsaWNrOiB0aGlzLm1hcmtBc1JlYWQsIHRpdGxlOiAnTWFyayBhcyByZWFkJywgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9fSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IE1hcmsgYXMgdW5yZWFkXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2lyY2xlXCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfX0pO1xuICAgIH0sXG5cbiAgICBwcmV2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib2R5UHJldmlldyA9IHRoaXMucHJvcHMuc3RvcnkuYm9keV9wcmV2aWV3O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIiwgc3R5bGU6IHsgJ3RleHQtb3ZlcmZsb3cnOiAnZWxsaXBzaXMnfX0sIFxuICAgICAgICAgIGJvZHlQcmV2aWV3XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWN0b3JzID0gXy5tYXAodGhpcy5hY3RvcnMoKSwgZnVuYy5kb3QoJ3VzZXJuYW1lJykpLmpvaW4oJywgQCcpXG5cbiAgICAgIHZhciBjbGFzc2VzID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0KHtcbiAgICAgICAgJ2VudHJ5LXJlYWQnOiB0aGlzLmlzUmVhZCgpLFxuICAgICAgICAnZW50cnktdW5yZWFkJzogIXRoaXMuaXNSZWFkKCksXG4gICAgICB9KTtcblxuICAgICAgdmFyIHByb2R1Y3ROYW1lID0gdGhpcy5wcm9wcy5zdG9yeS5wcm9kdWN0Lm5hbWU7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogY2xhc3Nlc30sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC0zXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6ICcvJyArIHRoaXMucHJvcHMuc3RvcnkucHJvZHVjdC5zbHVnfSwgcHJvZHVjdE5hbWUpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmJyKG51bGwpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIHRleHQtc21hbGxcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMudGltZXN0YW1wKClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtOFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IGNsYXNzZXMsIGhyZWY6IHRoaXMucHJvcHMuc3RvcnkudXJsLCBvbkNsaWNrOiB0aGlzLm1hcmtBc1JlYWR9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7c3R5bGU6IHsgJ21hcmdpbi1yaWdodCc6ICc1cHgnfX0sIFxuICAgICAgICAgICAgICAgICAgQXZhdGFyKHt1c2VyOiB0aGlzLmFjdG9ycygpWzBdfSlcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIGFjdG9ycyksIFwiIFwiLCB0aGlzLmJvZHkoKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LXNtYWxsIHRleHQtbXV0ZWRcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlldygpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6ICdjb2wtbWQtMSAnICsgY2xhc3Nlc30sIFxuICAgICAgICAgICAgICB0aGlzLm1hcmtBc1JlYWRCdXR0b24oKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtb21lbnQodGhpcy5wcm9wcy5zdG9yeS5jcmVhdGVkKS5mb3JtYXQoXCJkZGQsIGhBXCIpXG4gICAgfSxcblxuICAgIHN1YmplY3RNYXA6IHtcbiAgICAgIFRhc2s6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgcmV0dXJuIFwiI1wiICsgdGFzay5udW1iZXIgKyBcIiBcIiArIHRhc2sudGl0bGU7XG4gICAgICB9LFxuXG4gICAgICBEaXNjdXNzaW9uOiBmdW5jdGlvbihkaXNjdXNzaW9uKSB7XG4gICAgICAgIHJldHVybiAnYSBkaXNjdXNzaW9uJztcbiAgICAgIH0sXG5cbiAgICAgIFdpcDogZnVuY3Rpb24oYm91bnR5KSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZ1bGxQYWdlKSB7XG4gICAgICAgICAgcmV0dXJuIFwiI1wiICsgYm91bnR5Lm51bWJlciArIFwiIFwiICsgYm91bnR5LnRpdGxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFwiI1wiICsgYm91bnR5Lm51bWJlcjtcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHZlcmJNYXA6IHtcbiAgICAgICdDb21tZW50JzogJ2NvbW1lbnRlZCBvbiAnLFxuICAgICAgJ0F3YXJkJzogJ2F3YXJkZWQnLFxuICAgICAgJ0Nsb3NlJzogJ2Nsb3NlZCAnXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEZ1bGxQYWdlTmV3c0ZlZWQ7XG4gIH1cblxuICB3aW5kb3cuRnVsbFBhZ2VOZXdzRmVlZCA9IEZ1bGxQYWdlTmV3c0ZlZWQ7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBGb3JtR3JvdXAgPSByZXF1aXJlKCcuL2Zvcm1fZ3JvdXAuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIElucHV0UHJldmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0lucHV0UHJldmlldycsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlucHV0UHJldmlldzogJycsXG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5wcm9wcy50cmFuc2Zvcm0gfHwgdGhpcy50cmFuc2Zvcm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBGb3JtR3JvdXAobnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwXCIsIHN0eWxlOiB7IHdpZHRoOiAnMzUlJ319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMucHJvcHMuaW5wdXROYW1lLCBcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sXCIsIFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLmlucHV0UHJldmlldywgXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHRoaXMucHJvcHMucGxhY2Vob2xkZXIsIFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlfSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cC1idG5cIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHt0eXBlOiBcInN1Ym1pdFwiLCBvblN1Ym1pdDogdGhpcy5vblN1Ym1pdCwgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeVwiLCBkaXNhYmxlZDogdGhpcy5idXR0b25TdGF0ZSgpfSwgdGhpcy5wcm9wcy5idXR0b25UZXh0KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBvbWVnYVwiLCBzdHlsZTogeyAnbWFyZ2luLXRvcCc6ICc1cHgnLCAnbWFyZ2luLWxlZnQnOiAnMXB4J319LCBcbiAgICAgICAgICAgIFwiUHJldmlldzogXCIsIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgdGhpcy5wcm9wcy5hZGRvblRleHQgKyB0aGlzLnN0YXRlLmlucHV0UHJldmlldylcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdmFsdWUgPSBlLnRhcmdldC52YWx1ZTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlucHV0UHJldmlldzogdGhpcy5zdGF0ZS50cmFuc2Zvcm0odmFsdWUpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYnV0dG9uU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuaW5wdXRQcmV2aWV3Lmxlbmd0aCA+PSAyID8gZmFsc2UgOiB0cnVlO1xuICAgIH0sXG5cbiAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1teXFx3LVxcLl0rL2csICctJykudG9Mb3dlckNhc2UoKTtcbiAgICB9LFxuXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW5wdXRQcmV2aWV3O1xuICB9XG5cbiAgd2luZG93LklucHV0UHJldmlldyA9IElucHV0UHJldmlldztcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgSW50ZXJlc3RTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9pbnRlcmVzdF9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJUCA9IENPTlNUQU5UUy5JTlRFUkVTVF9QSUNLRVI7XG5cbiAgdmFyIGtleXMgPSB7XG4gICAgZW50ZXI6IDEzLFxuICAgIGVzYzogMjcsXG4gICAgdXA6IDM4LFxuICAgIGRvd246IDQwLFxuICAgIGRlbGV0ZTogOFxuICB9O1xuXG4gIHZhciBJbnRlcmVzdFBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludGVyZXN0UGlja2VyJyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2VsZWN0ZWRJbnRlcmVzdHM6IEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCksXG4gICAgICAgIGhpZ2hsaWdodEluZGV4OiAwLFxuICAgICAgICB2aXNpYmxlSW50ZXJlc3RzOiBbXSxcbiAgICAgICAgdXNlcklucHV0OiAnJ1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLnVzZXJJbnRlcmVzdHMgJiYgdGhpcy5wcm9wcy51c2VySW50ZXJlc3RzLmxlbmd0aCkge1xuICAgICAgICBJbnRlcmVzdFN0b3JlLnNldEludGVyZXN0cyh0aGlzLnByb3BzLnVzZXJJbnRlcmVzdHMpO1xuICAgICAgfVxuXG4gICAgICBJbnRlcmVzdFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMub25TdG9yZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgY3Vyc29yOiAndGV4dCd9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNlbGVjdCh7XG4gICAgICAgICAgICAgIG5hbWU6IHRoaXMucHJvcHMubmFtZSwgXG4gICAgICAgICAgICAgIG11bHRpcGxlOiBcInRydWVcIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJ30sIFxuICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5zZWxlY3RlZEludGVyZXN0c30sIFxuICAgICAgICAgICAgdGhpcy5mb3JtYXRTZWxlY3RlZCgnb3B0aW9uJylcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe1xuICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicGlsbC1saXN0XCIsIFxuICAgICAgICAgICAgICByZWY6IFwiY29udGFpbmVyXCIsIFxuICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmhhbmRsZUNvbnRhaW5lckNsaWNrfSwgXG4gICAgICAgICAgICB0aGlzLmZvcm1hdFNlbGVjdGVkKCdwaWxsJyksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICAgICAgcmVmOiBcInVzZXJJbnB1dFwiLCBcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUNoYW5nZSwgXG4gICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuaGFuZGxlS2V5RG93biwgXG4gICAgICAgICAgICAgICAgICBvbkZvY3VzOiB0aGlzLmhhbmRsZUZvY3VzLCBcbiAgICAgICAgICAgICAgICAgIG9uQmx1cjogdGhpcy5oYW5kbGVCbHVyLCBcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnVzZXJJbnB1dH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgICB0aGlzLnN0YXRlLnZpc2libGVJbnRlcmVzdHMubGVuZ3RoID4gMCAmJiB0aGlzLnN0YXRlLnNob3cgPyB0aGlzLmludGVyZXN0RHJvcGRvd24oKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW50ZXJlc3REcm9wZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBJbnRlcmVzdERyb3Bkb3duKHtcbiAgICAgICAgICAgIGludGVyZXN0czogdGhpcy5zdGF0ZS52aXNpYmxlSW50ZXJlc3RzLCBcbiAgICAgICAgICAgIGhpZ2hsaWdodEluZGV4OiB0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4LCBcbiAgICAgICAgICAgIG9uSW50ZXJlc3RTZWxlY3RlZDogdGhpcy5vbkludGVyZXN0U2VsZWN0ZWR9XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGhhbmRsZUNvbnRhaW5lckNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLnJlZnMudXNlcklucHV0LmdldERPTU5vZGUoKS5mb2N1cygpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgdmFyIHZpc2libGVJbnRlcmVzdHMgPSB0aGlzLmdldFZpc2libGVJbnRlcmVzdHModmFsdWUpO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgdXNlcklucHV0OiB0aGlzLnRyYW5zZm9ybSh2YWx1ZSksXG4gICAgICAgIHZpc2libGVJbnRlcmVzdHM6IHZpc2libGVJbnRlcmVzdHNcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVLZXlEb3duOiBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlzLnVwKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5tb3ZlSGlnaGxpZ2h0KC0xKTtcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBrZXlzLmRvd24pIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLm1vdmVIaWdobGlnaHQoMSk7XG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0ga2V5cy5kZWxldGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudXNlcklucHV0ID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogSVAuQUNUSU9OUy5QT1AsXG4gICAgICAgICAgICBldmVudDogSVAuRVZFTlRTLlBPUFBFRFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0ga2V5cy5lbnRlcikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2VsZWN0Q3VycmVudEludGVyZXN0KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFZpc2libGVJbnRlcmVzdHM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgaW50ZXJlc3RzID0gXy5maWx0ZXIodGhpcy5wcm9wcy5pbnRlcmVzdHMsIGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIHJldHVybiBpbnRlcmVzdC5pbmRleE9mKHZhbHVlKSA+PSAwICYmIEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCkuaW5kZXhPZihpbnRlcmVzdCkgPT09IC0xO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh2YWx1ZSAmJiBpbnRlcmVzdHMuaW5kZXhPZih2YWx1ZSkgPT09IC0xKSB7XG4gICAgICAgIGludGVyZXN0cy5wdXNoKHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGludGVyZXN0cztcbiAgICB9LFxuXG4gICAgbW92ZUhpZ2hsaWdodDogZnVuY3Rpb24oaW5jKSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmNvbnN0cmFpbkhpZ2hsaWdodCh0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4ICsgaW5jKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGhpZ2hsaWdodEluZGV4OiBpbmRleFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbnN0cmFpbkhpZ2hsaWdodDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgMCwgTWF0aC5taW4odGhpcy5zdGF0ZS52aXNpYmxlSW50ZXJlc3RzLmxlbmd0aCAtIDEsIGluZGV4KVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc2VsZWN0Q3VycmVudEludGVyZXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IElQLkFDVElPTlMuQUREX0lOVEVSRVNULFxuICAgICAgICBldmVudDogSVAuRVZFTlRTLklOVEVSRVNUX0FEREVELFxuICAgICAgICBkYXRhOiB0aGlzLnN0YXRlLnZpc2libGVJbnRlcmVzdHNbdGhpcy5zdGF0ZS5oaWdobGlnaHRJbmRleF1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblN0b3JlQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2aXNpYmxlSW50ZXJlc3RzOiBbXSxcbiAgICAgICAgc2VsZWN0ZWRJbnRlcmVzdHM6IEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCksXG4gICAgICAgIHVzZXJJbnB1dDogJydcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1teXFx3LV0rL2csICctJykudG9Mb3dlckNhc2UoKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlRm9jdXM6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucmVmcy5jb250YWluZXIuZ2V0RE9NTm9kZSgpLnN0eWxlLmNzc1RleHQgPSBcImJvcmRlcjogMXB4IHNvbGlkICM0OGEzZWQ7IGJveC1zaGFkb3c6IDBweCAwcHggM3B4ICM2NmFmZTlcIjtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgIHZpc2libGVJbnRlcmVzdHM6IF8uZGlmZmVyZW5jZSh0aGlzLnByb3BzLmludGVyZXN0cywgSW50ZXJlc3RTdG9yZS5nZXRJbnRlcmVzdHMoKSlcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVCbHVyOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnJlZnMuY29udGFpbmVyLmdldERPTU5vZGUoKS5zdHlsZS5jc3NUZXh0ID0gJyc7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gRklYTUU6IFRoZXJlIGhhcyB0byBiZSBhIGJldHRlciB3YXkgdG8gaGFuZGxlIHRoaXM6XG4gICAgICAvLyAgICAgICAgVGhlIGlzc3VlIGlzIHRoYXQgaGlkaW5nIHRoZSBkcm9wZG93biBvbiBibHVyXG4gICAgICAvLyAgICAgICAgY2F1c2VzIHNlbGVjdGluZyBhbiBpdGVtIHRvIGZhaWwgd2l0aG91dCBhXG4gICAgICAvLyAgICAgICAgdGltZW91dCBvZiB+MjAwIHRvIH4zMDAgbXMuXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICBzaG93OiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH0sIDMwMCk7XG4gICAgfSxcblxuICAgIG9uSW50ZXJlc3RTZWxlY3RlZDogZnVuY3Rpb24oZSkge1xuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogSVAuRVZFTlRTLkFERF9JTlRFUkVTVCxcbiAgICAgICAgZXZlbnQ6IElQLkVWRU5UUy5JTlRFUkVTVF9BRERFRCxcbiAgICAgICAgZGF0YTogJydcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVSZW1vdmU6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiBJUC5BQ1RJT05TLlJFTU9WRV9JTlRFUkVTVCxcbiAgICAgICAgZXZlbnQ6IElQLkVWRU5UUy5JTlRFUkVTVF9SRU1PVkVELFxuICAgICAgICBkYXRhOiBpbnRlcmVzdFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZvcm1hdFNlbGVjdGVkOiBmdW5jdGlvbihvcHRpb25PclBpbGwpIHtcbiAgICAgIHZhciBpbnRlcmVzdHMgPSBJbnRlcmVzdFN0b3JlLmdldEludGVyZXN0cygpO1xuICAgICAgdmFyIHNlbGVjdGVkSW50ZXJlc3RzID0gXy5tYXAoaW50ZXJlc3RzLCB0aGlzLmludGVyZXN0VG9bb3B0aW9uT3JQaWxsXS5iaW5kKHRoaXMpKTtcblxuICAgICAgcmV0dXJuIHNlbGVjdGVkSW50ZXJlc3RzO1xuICAgIH0sXG5cbiAgICBpbnRlcmVzdFRvOiB7XG4gICAgICBvcHRpb246IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00ub3B0aW9uKHt2YWx1ZTogaW50ZXJlc3QsIGtleTogaW50ZXJlc3R9LCBpbnRlcmVzdClcbiAgICAgIH0sXG5cbiAgICAgIHBpbGw6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiaW50ZXJlc3QtY2hvaWNlXCIsIGtleTogaW50ZXJlc3R9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiaW50ZXJlc3QtY2xvc2VcIiwgb25DbGljazogdGhpcy5oYW5kbGVSZW1vdmUuYmluZCh0aGlzLCBpbnRlcmVzdCl9LCBcIkBcIiwgaW50ZXJlc3QsIFwiIMOXXCIpXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEludGVyZXN0RHJvcGRvd24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnRlcmVzdERyb3Bkb3duJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgJ3otaW5kZXgnOiAxMDAsXG4gICAgICAgIHRvcDogNDUsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgIGRpc3BsYXk6ICdibG9jaydcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duLW1lbnVcIiwgc3R5bGU6IHN0eWxlfSwgXG4gICAgICAgICAgdGhpcy5yb3dzKClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IC0xO1xuXG4gICAgICB2YXIgaW50ZXJlc3RzID0gXy5tYXAodGhpcy5wcm9wcy5pbnRlcmVzdHMsIGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIGkrKztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIEludGVyZXN0RHJvcGRvd25FbnRyeSh7XG4gICAgICAgICAgICAgIGtleTogaW50ZXJlc3QsIFxuICAgICAgICAgICAgICBpbnRlcmVzdDogaW50ZXJlc3QsIFxuICAgICAgICAgICAgICBzZWxlY3RlZDogaSA9PT0gdGhpcy5wcm9wcy5oaWdobGlnaHRJbmRleH1cbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICByZXR1cm4gaW50ZXJlc3RzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEludGVyZXN0RHJvcGRvd25FbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludGVyZXN0RHJvcGRvd25FbnRyeScsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbnRlcmVzdCA9IHRoaXMucHJvcHMuaW50ZXJlc3Q7XG4gICAgICB2YXIgY2xhc3NOYW1lID0gJ3RleHRjb21wbGV0ZS1pdGVtJztcblxuICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcbiAgICAgICAgY2xhc3NOYW1lICs9ICcgYWN0aXZlJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IGNsYXNzTmFtZX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiAnI0AnICsgaW50ZXJlc3QsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfSwgb25DbGljazogdGhpcy5oYW5kbGVJbnRlcmVzdFNlbGVjdGVkLmJpbmQodGhpcywgaW50ZXJlc3QpfSwgXG4gICAgICAgICAgICBcIkBcIiwgdGhpcy5wcm9wcy5pbnRlcmVzdFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlSW50ZXJlc3RTZWxlY3RlZDogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IElQLkFDVElPTlMuQUREX0lOVEVSRVNULFxuICAgICAgICBldmVudDogSVAuRVZFTlRTLklOVEVSRVNUX0FEREVELFxuICAgICAgICBkYXRhOiBpbnRlcmVzdFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludGVyZXN0UGlja2VyO1xuICB9XG5cbiAgd2luZG93LkludGVyZXN0UGlja2VyID0gSW50ZXJlc3RQaWNrZXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBGb3JtR3JvdXAgPSByZXF1aXJlKCcuL2Zvcm1fZ3JvdXAuanMuanN4Jyk7XG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJbnZpdGVCb3VudHlGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW52aXRlQm91bnR5Rm9ybScsXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IG1vZGVsOiAnaW52aXRlJyB9XG4gICAgfSxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgZXJyb3JzOiB7fSB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZm9ybSh7c3R5bGU6IHt3aWR0aDozMDB9LCBvblN1Ym1pdDogdGhpcy5oYW5kbGVTdWJtaXR9LCBcbiAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuLCBcbiAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgIEZvcm1Hcm91cCh7ZXJyb3I6IHRoaXMuc3RhdGUuZXJyb3JzLnVzZXJuYW1lX29yX2VtYWlsfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGFiZWwoe2NsYXNzTmFtZTogXCJjb250cm9sLWxhYmVsXCJ9LCBcIlVzZXJuYW1lIG9yIGVtYWlsIGFkZHJlc3NcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtuYW1lOiBcImludml0ZVt1c2VybmFtZV9vcl9lbWFpbF1cIiwgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcImZyaWVuZEBleGFtcGxlLmNvbVwiLCBjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sXCJ9KVxuICAgICAgICAgICksIFxuICAgICAgICAgIEZvcm1Hcm91cCh7ZXJyb3I6IHRoaXMuc3RhdGUuZXJyb3JzLm5vdGV9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5sYWJlbChudWxsLCBcIlBlcnNvbmFsIG5vdGVcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRleHRhcmVhKHtuYW1lOiBcImludml0ZVtub3RlXVwiLCBwbGFjZWhvbGRlcjogdGhpcy5wcm9wcy5ub3RlUGxhY2Vob2xkZXIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2xcIn0pXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgRm9ybUdyb3VwKHtlcnJvcjogdGhpcy5zdGF0ZS5lcnJvcnMudGlwX2NlbnRzfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGFiZWwobnVsbCwgXCJMZWF2ZSBhIHRpcFwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImhlbHAtYmxvY2tcIn0sIFwiU3RhcnQgb2ZmIG9uIHRoZSByaWdodCBmb290OyBnZW5lcm9zaXR5IGFsd2F5cyBwYXlzIG9mZi5cIiksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYnRuLWdyb3VwIHRleHQtY2VudGVyXCIsICdkYXRhLXRvZ2dsZSc6IFwiYnV0dG9uc1wiLCBzdHlsZToge3dpZHRoOicxMDAlJ319LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0IGFjdGl2ZVwiLCBzdHlsZToge3dpZHRoOiczNCUnfX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImludml0ZVt0aXBfY2VudHNdXCIsIHZhbHVlOiBcIjEwMDBcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWV9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW4gdGV4dC1jb2luc1wifSksIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1jb2luc1wifSwgXCIxMFwiKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIHN0eWxlOiB7d2lkdGg6JzMzJSd9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiaW52aXRlW3RpcF9jZW50c11cIiwgdmFsdWU6IFwiMTAwMDBcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1hcHAtY29pbiB0ZXh0LWNvaW5zXCJ9KSwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zXCJ9LCBcIjEwMFwiKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIHN0eWxlOiB7d2lkdGg6JzMzJSd9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiaW52aXRlW3RpcF9jZW50c11cIiwgdmFsdWU6IFwiNTAwMDBcIn0pLCBcIiBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW4gdGV4dC1jb2luc1wifSksIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1jb2luc1wifSwgXCI1MDBcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCBuYW1lOiBcImludml0ZVt2aWFfdHlwZV1cIiwgdmFsdWU6IHRoaXMucHJvcHMudmlhX3R5cGV9KSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCBuYW1lOiBcImludml0ZVt2aWFfaWRdXCIsIHZhbHVlOiB0aGlzLnByb3BzLnZpYV9pZH0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9ja1wiLCBzdHlsZToge1wibWFyZ2luLWJvdHRvbVwiOjIwfX0sIFwiU2VuZCBtZXNzYWdlXCIpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgaGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdGhpcy5wcm9wcy51cmwsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgZGF0YTogJChlLnRhcmdldCkuc2VyaWFsaXplKCksXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB0aGlzLnByb3BzLm9uU3VibWl0KGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcbiAgICAgICAgICBpZiAoeGhyLnJlc3BvbnNlSlNPTiAmJiB4aHIucmVzcG9uc2VKU09OLmVycm9ycykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcnMoeGhyLnJlc3BvbnNlSlNPTi5lcnJvcnMpXG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVFcnJvcnM6IGZ1bmN0aW9uKGVycm9ycykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXJyb3JzOiBlcnJvcnN9KVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnZpdGVCb3VudHlGb3JtO1xuICB9XG5cbiAgd2luZG93Lkludml0ZUJvdW50eUZvcm0gPSBJbnZpdGVCb3VudHlGb3JtO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwO1xudmFyIFBvcG92ZXIgPSByZXF1aXJlKCcuL3BvcG92ZXIuanMuanN4Jyk7XG52YXIgSW52aXRlQm91bnR5Rm9ybSA9IHJlcXVpcmUoJy4vaW52aXRlX2JvdW50eV9mb3JtLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJbnZpdGVGcmllbmRCb3VudHkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnZpdGVGcmllbmRCb3VudHknLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBtb2RhbDogZmFsc2UsIGludml0ZXM6IHRoaXMucHJvcHMuaW52aXRlcyB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdCBidG4tYmxvY2sgYnRuLXNtXCIsIGhyZWY6IFwiI2hlbHAtbWVcIiwgb25DbGljazogdGhpcy5jbGlja30sIFwiSW52aXRlIGEgZnJpZW5kIHRvIGhlbHBcIiksIFxuICAgICAgICAgIHRoaXMuc3RhdGUuaW52aXRlcy5sZW5ndGggPiAwID8gSW52aXRlTGlzdCh7aW52aXRlczogdGhpcy5zdGF0ZS5pbnZpdGVzfSkgOiBudWxsLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLm1vZGFsID8gdGhpcy5wb3BvdmVyKCkgOiBudWxsXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgcG9wb3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBQb3BvdmVyKHtwbGFjZW1lbnQ6IFwibGVmdFwiLCBwb3NpdGlvbkxlZnQ6IC0zMjUsIHBvc2l0aW9uVG9wOiAtMTIwfSwgXG4gICAgICAgICAgSW52aXRlQm91bnR5Rm9ybSh7dXJsOiB0aGlzLnByb3BzLnVybCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlhX3R5cGU6IHRoaXMucHJvcHMudmlhX3R5cGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpYV9pZDogdGhpcy5wcm9wcy52aWFfaWQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VibWl0OiB0aGlzLm9uU3VibWl0LmJpbmQodGhpcyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVQbGFjZWhvbGRlcjogXCJIZXkhIFRoaXMgYm91bnR5IHNlZW1zIHJpZ2h0IHVwIHlvdXIgYWxsZXlcIn0sIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uaDIoe2NsYXNzTmFtZTogXCJhbHBoYVwifSwgXCJBc2sgYSBmcmllbmRcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcIktub3cgc29tZWJvZHkgd2hvIGNvdWxkIGhlbHAgd2l0aCB0aGlzPyBBbnlib2R5IGNhbiBoZWxwIG91dCwgYWxsIHlvdSBuZWVkIHRvIGRvIGlzIGFzay5cIilcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgY2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kYWw6ICF0aGlzLnN0YXRlLm1vZGFsfSlcbiAgICB9LFxuXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKGludml0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgICAgUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB7XG4gICAgICAgICAgaW52aXRlczogeyRwdXNoOiBbaW52aXRlXSB9LFxuICAgICAgICAgIG1vZGFsOiB7JHNldDogZmFsc2UgfVxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnZpdGVGcmllbmRCb3VudHk7XG4gIH1cblxuICB3aW5kb3cuSW52aXRlRnJpZW5kQm91bnR5ID0gSW52aXRlRnJpZW5kQm91bnR5O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwO1xudmFyIFBvcG92ZXIgPSByZXF1aXJlKCcuL3BvcG92ZXIuanMuanN4Jyk7XG52YXIgSW52aXRlQm91bnR5Rm9ybSA9IHJlcXVpcmUoJy4vaW52aXRlX2JvdW50eV9mb3JtLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJbnZpdGVGcmllbmRQcm9kdWN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW52aXRlRnJpZW5kUHJvZHVjdCcsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IG1vZGFsOiBmYWxzZSwgaW52aXRlczogdGhpcy5wcm9wcy5pbnZpdGVzIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIGJ0bi1ibG9ja1wiLCBzdHlsZToge1wibWFyZ2luLWJvdHRvbVwiOjE2fSwgb25DbGljazogdGhpcy5jbGlja30sIFwiSW52aXRlIGEgZnJpZW5kXCIpLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLmludml0ZXMubGVuZ3RoID4gMCA/IEludml0ZUxpc3Qoe2ludml0ZXM6IHRoaXMuc3RhdGUuaW52aXRlc30pIDogbnVsbCwgXG4gICAgICAgICAgdGhpcy5zdGF0ZS5tb2RhbCA/IHRoaXMucG9wb3ZlcigpIDogbnVsbFxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHBvcG92ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUG9wb3Zlcih7cGxhY2VtZW50OiBcImxlZnRcIiwgcG9zaXRpb25MZWZ0OiAtMzI1LCBwb3NpdGlvblRvcDogLTEyOX0sIFxuICAgICAgICAgIEludml0ZUJvdW50eUZvcm0oe3VybDogdGhpcy5wcm9wcy51cmwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpYV90eXBlOiB0aGlzLnByb3BzLnZpYV90eXBlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWFfaWQ6IHRoaXMucHJvcHMudmlhX2lkLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN1Ym1pdDogdGhpcy5vblN1Ym1pdC5iaW5kKHRoaXMpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlUGxhY2Vob2xkZXI6IHRoaXMucHJvcHMubm90ZVBsYWNlaG9sZGVyfSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMih7Y2xhc3M6IFwiYWxwaGFcIn0sIFwiQXNrIGEgZnJpZW5kXCIpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXCJLbm93IHNvbWVib2R5IHdobyBjb3VsZCBoZWxwIHdpdGggdGhpcz8gQW55Ym9keSBjYW4gaGVscCBvdXQsIGFsbCB5b3UgbmVlZCB0byBkbyBpcyBhc2suXCIpXG5cbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgY2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kYWw6ICF0aGlzLnN0YXRlLm1vZGFsfSlcbiAgICB9LFxuXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKGludml0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgICAgUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB7XG4gICAgICAgICAgaW52aXRlczogeyRwdXNoOiBbaW52aXRlXSB9LFxuICAgICAgICAgIG1vZGFsOiB7JHNldDogZmFsc2UgfVxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnZpdGVGcmllbmRQcm9kdWN0O1xuICB9XG5cbiAgd2luZG93Lkludml0ZUZyaWVuZFByb2R1Y3QgPSBJbnZpdGVGcmllbmRQcm9kdWN0O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJbnZpdGVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW52aXRlTGlzdCcsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbnZpdGVOb2RlcyA9IF8ubWFwKHRoaXMucHJvcHMuaW52aXRlcywgZnVuY3Rpb24oaW52aXRlKSB7XG4gICAgICAgIHJldHVybiBJbnZpdGVFbnRyeSh7a2V5OiBpbnZpdGUuaWQsIGlkOiBpbnZpdGUuaWQsIGludml0ZWVfZW1haWw6IGludml0ZS5pbnZpdGVlX2VtYWlsLCBpbnZpdGVlOiBpbnZpdGUuaW52aXRlZX0pXG4gICAgICB9KVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsIHBhbmVsLWRlZmF1bHRcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAgbGlzdC1ncm91cC1icmVha291dCBzbWFsbCBvbWVnYVwifSwgXG4gICAgICAgICAgICBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6IFwiaW52aXRlXCJ9LCBcbiAgICAgICAgICAgICAgaW52aXRlTm9kZXNcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuICB9KTtcblxuICB2YXIgSW52aXRlRW50cnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnZpdGVFbnRyeScsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAtaXRlbVwiLCBrZXk6IHRoaXMucHJvcHMuaWR9LCBcbiAgICAgICAgdGhpcy5sYWJlbCgpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgbGFiZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuaW52aXRlZSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4obnVsbCwgXCJJbnZpdGVkIFwiLCBSZWFjdC5ET00uYSh7aHJlZjogdGhpcy5wcm9wcy5pbnZpdGVlLnVybH0sIFwiQFwiLCB0aGlzLnByb3BzLmludml0ZWUudXNlcm5hbWUpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKG51bGwsIFwiRW1haWxlZCBcIiwgdGhpcy5wcm9wcy5pbnZpdGVlX2VtYWlsKVxuICAgICAgfVxuXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludml0ZUxpc3Q7XG4gIH1cblxuICB3aW5kb3cuSW52aXRlTGlzdCA9IEludml0ZUxpc3Q7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBKb2luVGVhbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0pvaW5UZWFtJyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNvdW50OiB0aGlzLnByb3BzLmNvdW50LFxuICAgICAgICBpc19tZW1iZXI6IHRoaXMucHJvcHMuaXNfbWVtYmVyXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0b2dnbGVyIHRvZ2dsZXItc21cIn0sIFxuICAgICAgICAgIHRoaXMubGFiZWwoKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRvZ2dsZXItYmFkZ2VcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMuam9pbl9wYXRofSwgdGhpcy5zdGF0ZS5jb3VudClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgbGlzdGVuRm9ySm9pbjogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICAgICQobm9kZSkuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoIWFwcC5jdXJyZW50VXNlcigpKSB7XG4gICAgICAgICAgcmV0dXJuIGFwcC5yZWRpcmVjdFRvKCcvbG9naW4nKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAkKGRvY3VtZW50KS5zY3JvbGwoZnVuY3Rpb24oZSkge1xuICAgICAgICAkKG5vZGUpLnBvcG92ZXIoJ2hpZGUnKTtcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGxpc3RlbkZvckNoYW5nZXM6IGZ1bmN0aW9uKGJpb0VkaXRvcikge1xuICAgICAgdmFyIGpvaW5CdXR0b24gPSAkKCcjam9pbi1pbnRyby1idXR0b24nKVxuICAgICAgdmFyIHN0YXJ0aW5nVmFsID0gYmlvRWRpdG9yLnZhbCgpXG5cbiAgICAgIGlmIChzdGFydGluZ1ZhbCAmJiBzdGFydGluZ1ZhbC5sZW5ndGggPj0gMikge1xuICAgICAgICBqb2luQnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpXG4gICAgICB9XG5cbiAgICAgIGJpb0VkaXRvci5vbigna2V5dXAnLCBmdW5jdGlvbiB0ZXh0RW50ZXJlZChlKSB7XG4gICAgICAgIHZhciB2YWwgPSBiaW9FZGl0b3IudmFsKCkudHJpbSgpXG5cbiAgICAgICAgaWYgKHZhbC5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGpvaW5CdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJylcbiAgICAgICAgfSBlbHNlIGlmICh2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICAgIGpvaW5CdXR0b24uYWRkQ2xhc3MoJ2Rpc2FibGVkJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgbGFiZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaXNfbWVtYmVyKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0b2dnbGVyLWJ0biBidG4gYnRuLVwiICsgdGhpcy5idXR0b24oKSwgJ2RhdGEtdG9nZ2xlJzogXCJwb3BvdmVyXCIsIG9uQ2xpY2s6IHRoaXMuY2xpY2soKX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tdXNlci11bmZvbGxvd1wiLCBzdHlsZTogeydtYXJnaW4tcmlnaHQnOiAnNXB4Jyx9fSksIFxuICAgICAgICAgICAgXCJMZWF2ZSBUZWFtXCJcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0b2dnbGVyLWJ0biBidG4gYnRuLVwiICsgdGhpcy5idXR0b24oKSwgJ2RhdGEtdG9nZ2xlJzogXCJwb3BvdmVyXCIsIG9uQ2xpY2s6IHRoaXMuY2xpY2soKSwgXG4gICAgICAgICAgICByb2xlOiBcImJ1dHRvblwiLCBcbiAgICAgICAgICAgIGlkOiBcImpzLWpvaW4tcG9wb3ZlclwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tdXNlci1mb2xsb3dcIiwgc3R5bGU6IHsnbWFyZ2luLXJpZ2h0JzogJzVweCd9fSksIFxuICAgICAgICAgIFwiSm9pbiBUZWFtXCJcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBidXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaXNfbWVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1lbWJlcnNoaXAgJiYgdGhpcy5wcm9wcy5tZW1iZXJzaGlwLmNvcmVfdGVhbSkge1xuICAgICAgICAgIHJldHVybiAnZGVmYXVsdCBkaXNhYmxlZCdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJ2RlZmF1bHQgaW5hY3RpdmUnXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuICdwcmltYXJ5J1xuICAgIH0sXG5cbiAgICBjbGljazogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5pc19tZW1iZXIgPyB0aGlzLm9uTGVhdmUgOiB0aGlzLm9uSm9pblxuICAgIH0sXG5cbiAgICBoYW5kbGVKb2luT3JMZWF2ZTogZnVuY3Rpb24odXJsLCBuZXdTdGF0ZSwgbWV0aG9kLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICB2YXIgY3VycmVudFN0YXRlID0gdGhpcy5zdGF0ZVxuICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSlcblxuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSlcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGpxeGhyLCBzdGF0dXMpIHtcbiAgICAgICAgICBzZWxmLnNldFN0YXRlKGN1cnJlbnRTdGF0ZSlcbiAgICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3Ioc3RhdHVzKSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgb25Kb2luOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLmhhbmRsZUpvaW5PckxlYXZlKFxuICAgICAgICB0aGlzLnByb3BzLmpvaW5fcGF0aCxcbiAgICAgICAgeyBjb3VudDogKHRoaXMuc3RhdGUuY291bnQgKyAxKSwgaXNfbWVtYmVyOiB0cnVlIH0sXG4gICAgICAgICdQT1NUJyxcbiAgICAgICAgZnVuY3Rpb24gam9pbmVkKGVyciwgZGF0YSkge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHByb2R1Y3QgPSBhcHAuY3VycmVudEFuYWx5dGljc1Byb2R1Y3QoKVxuICAgICAgICAgIGFuYWx5dGljcy50cmFjaygncHJvZHVjdC50ZWFtLmpvaW5lZCcsIHByb2R1Y3QpXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgICQoJyNlZGl0LW1lbWJlcnNoaXAtbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiAnYWRkUGVyc29uJyxcbiAgICAgICAgZGF0YTogeyB1c2VyOiB0aGlzLnByb3BzLm1lbWJlcnNoaXAgfSxcbiAgICAgICAgZXZlbnQ6ICdwZW9wbGU6Y2hhbmdlJ1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uTGVhdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm1lbWJlcnNoaXAgJiYgdGhpcy5wcm9wcy5tZW1iZXJzaGlwLmNvcmVfdGVhbSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdGhpcy5oYW5kbGVKb2luT3JMZWF2ZShcbiAgICAgICAgdGhpcy5wcm9wcy5sZWF2ZV9wYXRoLFxuICAgICAgICB7IGNvdW50OiAodGhpcy5zdGF0ZS5jb3VudCAtIDEpICwgaXNfbWVtYmVyOiBmYWxzZSB9LFxuICAgICAgICAnREVMRVRFJyxcbiAgICAgICAgZnVuY3Rpb24gbGVmdChlcnIsIGRhdGEpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBwcm9kdWN0ID0gYXBwLmN1cnJlbnRBbmFseXRpY3NQcm9kdWN0KClcbiAgICAgICAgICBhbmFseXRpY3MudHJhY2soJ3Byb2R1Y3QudGVhbS5sZWZ0JywgcHJvZHVjdClcbiAgICAgICAgfVxuICAgICAgKVxuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiAncmVtb3ZlUGVyc29uJyxcbiAgICAgICAgZGF0YTogeyB1c2VyOiB0aGlzLnByb3BzLm1lbWJlcnNoaXAudXNlciB9LFxuICAgICAgICBldmVudDogJ3Blb3BsZTpjaGFuZ2UnXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSm9pblRlYW07XG4gIH1cblxuICB3aW5kb3cuSm9pblRlYW0gPSBKb2luVGVhbTtcbn0pKCk7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgaXNNZW1iZXJPbmxpbmUgPSBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICByZXR1cm4gbW9tZW50KG1lbWJlci5sYXN0X29ubGluZSkuaXNBZnRlcihtb21lbnQoKS5zdWJ0cmFjdCgnaG91cicsIDEpKVxuICB9XG5cbiAgdmFyIGlzTWVtYmVyUmVjZW50bHlBY3RpdmUgPSBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICByZXR1cm4gbW9tZW50KG1lbWJlci5sYXN0X29ubGluZSkuaXNBZnRlcihtb21lbnQoKS5zdWJ0cmFjdCgnbW9udGgnLCAxKSlcbiAgfVxuXG4gIHZhciBNRU1CRVJfVklFV19SRUZSRVNIX1BFUklPRCA9IDYwICogMTAwMDsgLy8gMSBtaW51dGVcblxuICB2YXIgTWVtYmVyc1ZpZXcgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdNZW1iZXJzVmlldycsXG5cbiAgICAgbG9hZE1lbWJlcnNGcm9tU2VydmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdGhpcy5wcm9wcy51cmwsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIG1pbWVUeXBlOiAndGV4dFBsYWluJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBtZW1iZXJzID0gXy5yZWR1Y2UoZGF0YSwgZnVuY3Rpb24obWVtbywgbWVtYmVyKSB7XG4gICAgICAgICAgICBtZW1vW21lbWJlci5pZF0gPSBtZW1iZXJcbiAgICAgICAgICAgIG1lbW9bbWVtYmVyLmlkXS5pc1dhdGNoZXIgPSB0cnVlXG4gICAgICAgICAgICByZXR1cm4gbWVtb1xuICAgICAgICAgIH0sIHt9KVxuXG4gICAgICAgICAgdGhpcy5hZGRNZW1iZXJzKG1lbWJlcnMpO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGxvYWRNZW1iZXJzRnJvbUNoYW5uZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5wcm9wcy5jaGFubmVsLmJpbmQoJ3B1c2hlcjpzdWJzY3JpcHRpb25fc3VjY2VlZGVkJyxcbiAgICAgICAgXy5iaW5kKFxuICAgICAgICAgIGZ1bmN0aW9uKG1lbWJlcnMpIHtcbiAgICAgICAgICAgIG1lbWJlcnMuZWFjaChfLmJpbmQoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgICAgICAgIHRoaXMuYWRkTWVtYmVyKG1lbWJlci5pZCwgbWVtYmVyLmluZm8pXG4gICAgICAgICAgICB9LCB0aGlzKSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWVtYmVyczoge31cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5sb2FkTWVtYmVyc0Zyb21DaGFubmVsKClcblxuICAgICAgdGhpcy5wcm9wcy5jaGFubmVsLmJpbmQoXG4gICAgICAgICdwdXNoZXI6bWVtYmVyX2FkZGVkJyxcbiAgICAgICAgXy5iaW5kKHRoaXMuYWRkTWVtYmVyRnJvbVB1c2hlciwgdGhpcylcbiAgICAgIClcblxuICAgICAgdGhpcy5wcm9wcy5jaGFubmVsLmJpbmQoXG4gICAgICAgICdwdXNoZXI6bWVtYmVyX3JlbW92ZWQnLFxuICAgICAgICBfLmJpbmQodGhpcy5yZW1vdmVNZW1iZXJGcm9tUHVzaGVyLCB0aGlzKVxuICAgICAgKVxuXG4gICAgICBldmVyeShNRU1CRVJfVklFV19SRUZSRVNIX1BFUklPRCwgXy5iaW5kKHRoaXMubG9hZE1lbWJlcnNGcm9tU2VydmVyLCB0aGlzKSlcbiAgICB9LFxuXG4gICAgcmVuZGVyTWVtYmVyOiBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgIHZhciBpc09ubGluZSA9IGlzTWVtYmVyT25saW5lKG1lbWJlcilcbiAgICAgIHZhciBjbGFzc2VzID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0KHtcbiAgICAgICAgJ3RleHQtd2VpZ2h0LWJvbGQgdGV4dC1zdWNjZXNzJzogaXNPbmxpbmUsXG4gICAgICAgICd0ZXh0LWVtcGhhc2lzJzogIWlzT25saW5lXG4gICAgICB9KVxuXG4gICAgICB2YXIgbWFya2VyXG4gICAgICBpZihpc09ubGluZSkge1xuICAgICAgICBtYXJrZXIgPSAoUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpbmRpY2F0b3IgaW5kaWNhdG9yLXN1Y2Nlc3NcIn0sIFwiwqBcIikpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXJrZXIgPSAoUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpbmRpY2F0b3IgaW5kaWNhdG9yLWRlZmF1bHRcIn0sIFwiwqBcIikpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2tleTogbWVtYmVyLmlkfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogY2xhc3NlcywgaHJlZjogbWVtYmVyLnVybH0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInB1bGwtcmlnaHRcIn0sIFxuICAgICAgICAgICAgbWFya2VyXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJhdmF0YXJcIiwgc3JjOiBtZW1iZXIuYXZhdGFyX3VybCwgd2lkdGg6IFwiMTZcIiwgaGVpZ2h0OiBcIjE2XCIsIGFsdDogbWVtYmVyLnVzZXJuYW1lLCBzdHlsZToge21hcmdpblJpZ2h0OiAxMH19KSwgXG4gICAgICAgICAgICBtZW1iZXIudXNlcm5hbWVcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbC1ncm91cFwiLCBpZDogXCJhY2NvcmRpb25cIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbCBwYW5lbC1kZWZhdWx0XCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbC1oZWFkaW5nXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmg2KHtjbGFzc05hbWU6IFwicGFuZWwtdGl0bGVcIn0sIFwiT25saW5lXCIpXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbC1ib2R5IHNtYWxsXCJ9LCBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXy5tYXAodGhpcy5vbmxpbmVNZW1iZXJzKCksIHRoaXMucmVuZGVyTWVtYmVyKVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsLWhlYWRpbmdcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7J2RhdGEtdG9nZ2xlJzogXCJjb2xsYXBzZVwiLCAnZGF0YS1wYXJlbnQnOiBcIiNhY2NvcmRpb25cIiwgaHJlZjogXCIjY29sbGFwc2VSZWNlbnRcIiwgY2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWNoZXZyb24tdXAgcHVsbC1yaWdodFwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oNih7Y2xhc3NOYW1lOiBcInBhbmVsLXRpdGxlXCJ9LCBcIlJlY2VudGx5IEFjdGl2ZVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2lkOiBcImNvbGxhcHNlUmVjZW50XCIsIGNsYXNzTmFtZTogXCJwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZSBpblwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbC1ib2R5IHNtYWxsXCJ9LCBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXy5tYXAodGhpcy5yZWNlbnRseUFjdGl2ZU1lbWJlcnMoKSwgdGhpcy5yZW5kZXJNZW1iZXIpXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGFkZE1lbWJlcnM6IGZ1bmN0aW9uKG1lbWJlcnMpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtZW1iZXJzOiBfLmV4dGVuZCh0aGlzLnN0YXRlLm1lbWJlcnMsIG1lbWJlcnMpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBhZGRNZW1iZXJGcm9tUHVzaGVyOiBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgIG1lbWJlci5pbmZvLmxhc3Rfb25saW5lID0gKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcbiAgICAgIHRoaXMuYWRkTWVtYmVyKG1lbWJlci5pZCwgbWVtYmVyLmluZm8pXG4gICAgfSxcblxuICAgIHJlbW92ZU1lbWJlckZyb21QdXNoZXI6IGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgdGhpcy5tZW1iZXJXZW50T2ZmbGluZShtZW1iZXIuaWQpXG4gICAgfSxcblxuICAgIGFkZE1lbWJlcjogZnVuY3Rpb24oaWQsIG1lbWJlcikge1xuICAgICAgdmFyIHVwZGF0ZSA9IHt9XG4gICAgICB1cGRhdGVbaWRdID0geyckc2V0JzogbWVtYmVyfVxuICAgICAgdGhpcy5zZXRTdGF0ZShSZWFjdC5hZGRvbnMudXBkYXRlKHRoaXMuc3RhdGUsIHttZW1iZXJzOiB1cGRhdGV9KSlcbiAgICB9LFxuXG4gICAgbWVtYmVyV2VudE9mZmxpbmU6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgbWVtYmVyID0gdGhpcy5zdGF0ZS5tZW1iZXJzW2lkXVxuICAgICAgaWYobWVtYmVyLmlzV2F0Y2hlcikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtZW1iZXJzID0gdGhpcy5zdGF0ZS5tZW1iZXJzO1xuICAgICAgICBkZWxldGUgbWVtYmVyc1tpZF1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVtYmVyczogbWVtYmVyc30pXG4gICAgICB9XG4gICAgfSxcblxuICAgIG9ubGluZU1lbWJlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8uY2hhaW4odGhpcy5zdGF0ZS5tZW1iZXJzKS52YWx1ZXMoKS5maWx0ZXIoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgIHJldHVybiBpc01lbWJlck9ubGluZShtZW1iZXIpXG4gICAgICB9KS5zb3J0QnkoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgIHJldHVybiBtZW1iZXIudXNlcm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgfSkudmFsdWUoKVxuICAgIH0sXG5cbiAgICByZWNlbnRseUFjdGl2ZU1lbWJlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8uY2hhaW4odGhpcy5zdGF0ZS5tZW1iZXJzKS52YWx1ZXMoKS5maWx0ZXIoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgIHJldHVybiAhaXNNZW1iZXJPbmxpbmUobWVtYmVyKSAmJiBpc01lbWJlclJlY2VudGx5QWN0aXZlKG1lbWJlcilcbiAgICAgIH0pLnNvcnRCeShmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIG1lbWJlci51c2VybmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICB9KS52YWx1ZSgpXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1lbWJlcnNWaWV3O1xuICB9XG5cbiAgd2luZG93Lk1lbWJlcnNWaWV3ID0gTWVtYmVyc1ZpZXc7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFRpdGxlTm90aWZpY2F0aW9uc0NvdW50ID0gcmVxdWlyZSgnLi90aXRsZV9ub3RpZmljYXRpb25zX2NvdW50LmpzLmpzeCcpO1xudmFyIERyb3Bkb3duTmV3c0ZlZWRUb2dnbGVyID0gcmVxdWlyZSgnLi9kcm9wZG93bl9uZXdzX2ZlZWRfdG9nZ2xlci5qcy5qc3gnKTtcbnZhciBEcm9wZG93bk5ld3NGZWVkID0gcmVxdWlyZSgnLi9kcm9wZG93bl9uZXdzX2ZlZWQuanMuanN4Jyk7XG52YXIgQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyID0gcmVxdWlyZSgnLi9jaGF0X25vdGlmaWNhdGlvbnNfdG9nZ2xlci5qcy5qc3gnKTtcbnZhciBDaGF0Tm90aWZpY2F0aW9ucyA9IHJlcXVpcmUoJy4vY2hhdF9ub3RpZmljYXRpb25zLmpzLmpzeCcpO1xudmFyIFVzZXJOYXZiYXJEcm9wZG93biA9IHJlcXVpcmUoJy4vdXNlcl9uYXZiYXJfZHJvcGRvd24uanMuanN4Jyk7XG52YXIgQXZhdGFyID0gcmVxdWlyZSgnLi9hdmF0YXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIE5hdmJhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ05hdmJhcicsXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVzZXI6IGFwcC5jdXJyZW50VXNlcigpLmF0dHJpYnV0ZXNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdXNlciA9IHRoaXMucHJvcHMuY3VycmVudFVzZXI7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcIm5hdiBuYXZiYXItbmF2XCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBUaXRsZU5vdGlmaWNhdGlvbnNDb3VudChudWxsKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXIoe1xuICAgICAgICAgICAgICAgIGljb25DbGFzczogXCJpY29uLWJlbGxcIiwgXG4gICAgICAgICAgICAgICAgaHJlZjogXCIjc3Rvcmllc1wiLCBcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJOb3RpZmljYXRpb25zXCJ9KSwgXG5cbiAgICAgICAgICAgIERyb3Bkb3duTmV3c0ZlZWQoe1xuICAgICAgICAgICAgICAgIHVybDogdGhpcy5wcm9wcy5uZXdzRmVlZFBhdGgsIFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLnByb3BzLnVzZXIudXNlcm5hbWUsIFxuICAgICAgICAgICAgICAgIGVkaXRVc2VyUGF0aDogdGhpcy5wcm9wcy5lZGl0VXNlclBhdGh9KVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyKHtcbiAgICAgICAgICAgICAgaWNvbkNsYXNzOiBcImljb24tYnViYmxlc1wiLCBcbiAgICAgICAgICAgICAgaHJlZjogXCIjbm90aWZpY2F0aW9uc1wiLCBcbiAgICAgICAgICAgICAgbGFiZWw6IFwiQ2hhdFwifSksIFxuXG4gICAgICAgICAgICBDaGF0Tm90aWZpY2F0aW9ucyh7XG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLnByb3BzLmNoYXRQYXRoLCBcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lfVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiZHJvcGRvd25cIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wiLCBjbGFzc05hbWU6IFwiZHJvcGRvd24tdG9nZ2xlXCIsICdkYXRhLXRvZ2dsZSc6IFwiZHJvcGRvd25cIn0sIFxuICAgICAgICAgICAgICBBdmF0YXIoe3VzZXI6IHRoaXMucHJvcHMudXNlcn0pLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ2aXNpYmxlLXhzLWlubGluZVwiLCBzdHlsZTogeyAnbWFyZ2luLWxlZnQnOiAnNXB4J319LCBcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnVzZXIudXNlcm5hbWVcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIHRoaXMudHJhbnNmZXJQcm9wc1RvKFVzZXJOYXZiYXJEcm9wZG93bihudWxsKSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE5hdmJhcjtcbiAgfVxuXG4gIHdpbmRvdy5OYXZiYXIgPSBOYXZiYXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIE5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd25TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9ub3RpZmljYXRpb25fcHJlZmVyZW5jZXNfZHJvcGRvd25fc3RvcmUnKTtcbnZhciBBdmF0YXIgPSByZXF1aXJlKCcuL2F2YXRhci5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgRCA9IENPTlNUQU5UUy5OT1RJRklDQVRJT05fUFJFRkVSRU5DRVNfRFJPUERPV047XG5cbiAgdmFyIE5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duJyxcbiAgICBjaGV2cm9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmNoZXZyb24pIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWNoZXZyb24tZG93blwifSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7c3R5bGU6IHsgJ21hcmdpbi1yaWdodCc6ICc3cHgnLCAnbWFyZ2luLWxlZnQnOiAnN3B4J319KVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93blN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuaGFuZGxlVXBkYXRlKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb2R1Y3RXYXRjaGVyc0NvdW50OiB0aGlzLnByb3BzLnByb2R1Y3RXYXRjaGVyc0NvdW50LFxuICAgICAgICBzZWxlY3RlZDogdGhpcy5wcm9wcy53YXRjaGluZ1N0YXRlLFxuICAgICAgICBjaGV2cm9uOiBmYWxzZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaGlkZUNoZXZyb246IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNoZXZyb246IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0b2dnbGVyIHRvZ2dsZXItc20gYnRuLWdyb3VwXCIsIG9uTW91c2VPdmVyOiB0aGlzLnNob3dDaGV2cm9uLCBvbk1vdXNlT3V0OiB0aGlzLmhpZGVDaGV2cm9ufSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgICBjbGFzc05hbWU6IHRoaXMuYnV0dG9uQ2xhc3Nlcyh0cnVlKSwgXG4gICAgICAgICAgICAgICdkYXRhLXRvZ2dsZSc6IFwiZHJvcGRvd25cIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7ICdtYXJnaW4tYm90dG9tJzogJzEzcHgnfX0sIFxuICAgICAgICAgICAgdGhpcy5idXR0b25TdGF0ZSgpLCBcbiAgICAgICAgICAgIHRoaXMuY2hldnJvbigpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRvZ2dsZXItYmFkZ2VcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsIFxuICAgICAgICAgICAgICAgIGhyZWY6IHRoaXMucHJvcHMucHJvZHVjdFdhdGNoZXJzUGF0aCwgXG4gICAgICAgICAgICAgICAgc3R5bGU6IHsgb3BhY2l0eTogJzAuNScsICdib3JkZXItdG9wLXJpZ2h0LXJhZGl1cyc6ICcycHgnLCAnYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXMnOiAnMnB4J319LCBcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5wcm9kdWN0V2F0Y2hlcnNDb3VudFxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS51bCh7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51IGRyb3Bkb3duLW1lbnUtcmlnaHRcIiwgXG4gICAgICAgICAgICAgIHJvbGU6IFwibWVudVwiLCBcbiAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICdhdXRvJywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzM1cHgnLCAncGFkZGluZy10b3AnOiAwfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtcbiAgICAgICAgICAgICAgICByb2xlOiBcInByZXNlbnRhdGlvblwiLCBcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiZHJvcGRvd24taGVhZGVyXCIsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7IGNvbG9yOiAnI2E2YTZhNicsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmM2YzZjMnfX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFwiRm9sbG93aW5nIFByZWZlcmVuY2VzXCIpXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtyb2xlOiBcInByZXNlbnRhdGlvblwiLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ30sIGNsYXNzTmFtZTogdGhpcy5zZWxlY3RlZENsYXNzKCdub3Qgd2F0Y2hpbmcnKX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7cm9sZTogXCJtZW51aXRlbVwiLCB0YWJJbmRleDogXCItMVwiLCBvbkNsaWNrOiB0aGlzLnVwZGF0ZVByZWZlcmVuY2UuYmluZCh0aGlzLCAnbm90IHdhdGNoaW5nJywgdGhpcy5wcm9wcy5wcm9kdWN0VW5mb2xsb3dQYXRoKX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFwiTm90IGZvbGxvd2luZ1wiKVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXG4gICAgICAgICAgICAgICAgICBcIlJlY2VpdmUgbm90aWZpY2F0aW9ucyB3aGVuIHlvdSBhcmUgQG1lbnRpb25lZFwiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtyb2xlOiBcInByZXNlbnRhdGlvblwiLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ30sIGNsYXNzTmFtZTogdGhpcy5zZWxlY3RlZENsYXNzKCd3YXRjaGluZycpfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtyb2xlOiBcIm1lbnVpdGVtXCIsIHRhYkluZGV4OiBcIi0xXCIsIG9uQ2xpY2s6IHRoaXMudXBkYXRlUHJlZmVyZW5jZS5iaW5kKHRoaXMsICd3YXRjaGluZycsIHRoaXMucHJvcHMucHJvZHVjdEZvbGxvd1BhdGgpfSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXCJGb2xsb3cgYW5ub3VuY2VtZW50cyBvbmx5XCIpXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFxuICAgICAgICAgICAgICAgICAgXCJSZWNlaXZlIG5vdGlmaWNhdGlvbnMgd2hlbiB0aGVyZSBhcmUgbmV3IGJsb2cgcG9zdHNcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7cm9sZTogXCJwcmVzZW50YXRpb25cIiwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9LCBjbGFzc05hbWU6IHRoaXMuc2VsZWN0ZWRDbGFzcygnc3Vic2NyaWJlZCcpfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtyb2xlOiBcIm1lbnVpdGVtXCIsIHRhYkluZGV4OiBcIi0xXCIsIG9uQ2xpY2s6IHRoaXMudXBkYXRlUHJlZmVyZW5jZS5iaW5kKHRoaXMsICdzdWJzY3JpYmVkJywgdGhpcy5wcm9wcy5wcm9kdWN0U3Vic2NyaWJlUGF0aCl9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcIkZvbGxvd1wiKVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiUmVjZWl2ZSBub3RpZmljYXRpb25zIHdoZW4gdGhlcmUgYXJlIG5ldyBibG9nIHBvc3RzLCBkaXNjdXNzaW9ucywgYW5kIGNoYXQgbWVzc2FnZXNcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc2hvd0NoZXZyb246IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNoZXZyb246IHRydWVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNlbGVjdGVkOiBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duU3RvcmUuZ2V0U2VsZWN0ZWQoKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGJ1dHRvblN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICBjYXNlICdzdWJzY3JpYmVkJzpcbiAgICAgICAgICByZXR1cm4gJ0ZvbGxvd2luZyc7XG4gICAgICAgIGNhc2UgJ3dhdGNoaW5nJzpcbiAgICAgICAgICByZXR1cm4gJ0ZvbGxvd2luZyBhbm5vdW5jZW1lbnRzIG9ubHknO1xuICAgICAgICBjYXNlICdub3Qgd2F0Y2hpbmcnOlxuICAgICAgICAgIHJldHVybiAnRm9sbG93JztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYnV0dG9uQ2xhc3NlczogZnVuY3Rpb24oZHJvcGRvd25Ub2dnbGUpIHtcbiAgICAgIHJldHVybiBSZWFjdC5hZGRvbnMuY2xhc3NTZXQoe1xuICAgICAgICAnYnRuJzogdHJ1ZSxcbiAgICAgICAgJ2J0bi1wcmltYXJ5JzogKHRoaXMuc3RhdGUuc2VsZWN0ZWQgPT09ICdub3Qgd2F0Y2hpbmcnKSxcbiAgICAgICAgJ2J0bi1kZWZhdWx0JzogKHRoaXMuc3RhdGUuc2VsZWN0ZWQgIT09ICdub3Qgd2F0Y2hpbmcnKSxcbiAgICAgICAgJ2J0bi1zbSc6IHRydWUsXG4gICAgICAgICdkcm9wZG93bi10b2dnbGUnOiBkcm9wZG93blRvZ2dsZVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgc2VsZWN0ZWRDbGFzczogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gb3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBcImFjdGl2ZVwiO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVQcmVmZXJlbmNlOiBmdW5jdGlvbihpdGVtLCBwYXRoKSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IEQuRVZFTlRTLlNFTEVDVEVEX1VQREFURUQsXG4gICAgICAgIGFjdGlvbjogRC5BQ1RJT05TLlVQREFURV9TRUxFQ1RFRCxcbiAgICAgICAgZGF0YTogeyBpdGVtOiBpdGVtLCBwYXRoOiBwYXRoIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duO1xuICB9XG5cbiAgd2luZG93Lk5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd24gPSBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBOdW1iZXJJbnB1dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ051bWJlcklucHV0JyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGFtb3VudDogdGhpcy5wcm9wcy5zdGFydGluZ0Ftb3VudCxcbiAgICAgICAgZWRpdGFibGU6IHRoaXMucHJvcHMuYWx3YXlzRWRpdGFibGVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmxpc3RlbkZvckNoYW5nZXModGhpcy5yZWZzLmlucHV0RmllbGQgJiYgdGhpcy5yZWZzLmlucHV0RmllbGQuZ2V0RE9NTm9kZSgpKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50RGlkTW91bnQoKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRhYmxlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVkaXRhYmxlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnVuZWRpdGFibGUoKTtcbiAgICB9LFxuXG4gICAgZWRpdGFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe25hbWU6IHRoaXMucHJvcHMubmFtZSwgcmVmOiBcImlucHV0RmllbGRcIiwgdHlwZTogXCJudW1iZXJcIiwgY2xhc3NOYW1lOiBcImZvcm0tY29udHJvbFwiLCBtaW46IFwiMFwiLCBzdGVwOiBcIjAuMVwiLCBkZWZhdWx0VmFsdWU6IHRoaXMuc3RhdGUuYW1vdW50fSksIFxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYWRkb25cIn0sIFwiJVwiKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB1bmVkaXRhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJCgnI2VkaXQtY29udHJhY3QtJyArIHRoaXMucHJvcHMudXNlci51c2VybmFtZSkuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICAkKHNlbGYucHJvcHMuY29uZmlybUJ1dHRvbikuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICAkKHRoaXMpLnRleHQoKSA9PT0gJ0VkaXQnID8gJCh0aGlzKS50ZXh0KCdDYW5jZWwnKSA6ICQodGhpcykudGV4dCgnRWRpdCcpO1xuICAgICAgICBzZWxmLnNldFN0YXRlKHsgZWRpdGFibGU6ICFzZWxmLnN0YXRlLmVkaXRhYmxlIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoUmVhY3QuRE9NLnNwYW4obnVsbCwgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCB0aGlzLnByb3BzLnN0YXJ0aW5nQW1vdW50ICsgJyUnKSwgXCIgdGlwIHdoZW4gY29pbnMgYXJlIG1pbnRlZFwiKSk7XG4gICAgfSxcblxuICAgIGxpc3RlbkZvckNoYW5nZXM6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICQobm9kZSkub24oJ2NoYW5nZSBrZXlkb3duJywgdGhpcy5oYW5kbGVDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBjb25maXJtTGluayA9ICQodGhpcy5wcm9wcy5jb25maXJtQnV0dG9uKTtcblxuICAgICAgaWYgKCFfLmlzRW1wdHkoY29uZmlybUxpbmspKSB7XG4gICAgICAgIHZhciBub2RlID0gJCh0aGlzLnJlZnMuaW5wdXRGaWVsZC5nZXRET01Ob2RlKCkpO1xuXG4gICAgICAgIGlmIChub2RlICYmIG5vZGUudmFsKCkgIT09IHRoaXMucHJvcHMuc3RhcnRpbmdBbW91bnQpIHtcbiAgICAgICAgICBjb25maXJtTGluay5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICAgIGNvbmZpcm1MaW5rLm9mZignY2xpY2snKTtcbiAgICAgICAgICBjb25maXJtTGluay5vbignY2xpY2snLCB7IG5vZGU6IG5vZGUsIHNlbGY6IHRoaXMgfSwgdGhpcy5jb25maXJtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25maXJtTGluay5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgICAgY29uZmlybUxpbmsub2ZmKCdjbGljaycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbmZpcm06IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBub2RlID0gZS5kYXRhLm5vZGU7XG4gICAgICB2YXIgc2VsZiA9IGUuZGF0YS5zZWxmO1xuICAgICAgdmFyIG9iaiA9IHtcbiAgICAgICAgY29udHJhY3Q6IHtcbiAgICAgICAgICBhbW91bnQ6IG5vZGUudmFsKCksXG4gICAgICAgICAgdXNlcjogdGhpcy5wcm9wcy51c2VyLmlkXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIF8uZGVib3VuY2UoJC5hamF4KHtcbiAgICAgICAgdXJsOiBzZWxmLnByb3BzLnVwZGF0ZVBhdGgsXG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgZGF0YTogb2JqLFxuICAgICAgICBzdWNjZXNzOiBzZWxmLmhhbmRsZVN1Y2Nlc3MsXG4gICAgICAgIGVycm9yOiBzZWxmLmhhbmRsZUVycm9yXG4gICAgICB9KSwgMzAwKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlU3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlRXJyb3I6IGZ1bmN0aW9uKGpxeGhyLCBzdGF0dXMpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3Ioc3RhdHVzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gTnVtYmVySW5wdXQ7XG4gIH1cblxuICB3aW5kb3cuTnVtYmVySW5wdXQgPSBOdW1iZXJJbnB1dDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBlb3BsZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3Blb3BsZV9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBQZW9wbGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdQZW9wbGUnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLnByb3BzLmNvcmVPbmx5KSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUGVvcGxlTGlzdCh7XG4gICAgICAgICAgICBtZW1iZXJzaGlwczogdGhpcy5zdGF0ZS5maWx0ZXJlZE1lbWJlcnNoaXBzLCBcbiAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkLCBcbiAgICAgICAgICAgIG9uRmlsdGVyOiB0aGlzLm9uRmlsdGVyLCBcbiAgICAgICAgICAgIGludGVyZXN0RmlsdGVyczogdGhpcy5wcm9wcy5pbnRlcmVzdEZpbHRlcnMsIFxuICAgICAgICAgICAgY3VycmVudFVzZXI6IHRoaXMucHJvcHMuY3VycmVudFVzZXIsIFxuICAgICAgICAgICAgdXBkYXRlUGF0aDogdGhpcy5wcm9wcy51cGRhdGVQYXRoLCBcbiAgICAgICAgICAgIGNvcmVNZW1iZXJzaGlwczogdGhpcy5wcm9wcy5jb3JlTWVtYmVyc2hpcHN9KVxuICAgICAgICApO1xuICAgICAgfVxuXG5cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICBQZW9wbGVGaWx0ZXIoe1xuICAgICAgICAgICAgICBpbnRlcmVzdEZpbHRlcnM6IHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWQsIFxuICAgICAgICAgICAgICBvbkZpbHRlcjogdGhpcy5vbkZpbHRlcn0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCB0ZXh0LWNlbnRlclwifSwgXCJUaXA6IFlvdSBjYW4gdXNlIEBtZW50aW9ucyB0byBnZXQgdGhlIGF0dGVudGlvbiBvZiBcIiwgdGhpcy5maWx0ZXJMYWJlbCgpLCBcIiBpbiBjaGF0IG9yIEJvdW50aWVzLlwiKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpLCBcbiAgICAgICAgICBQZW9wbGVMaXN0KHtcbiAgICAgICAgICAgICAgbWVtYmVyc2hpcHM6IHRoaXMuc3RhdGUuZmlsdGVyZWRNZW1iZXJzaGlwcywgXG4gICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkLCBcbiAgICAgICAgICAgICAgb25GaWx0ZXI6IHRoaXMub25GaWx0ZXIsIFxuICAgICAgICAgICAgICBpbnRlcmVzdEZpbHRlcnM6IHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBcbiAgICAgICAgICAgICAgY3VycmVudFVzZXI6IHRoaXMucHJvcHMuY3VycmVudFVzZXIsIFxuICAgICAgICAgICAgICB1cGRhdGVQYXRoOiB0aGlzLnByb3BzLnVwZGF0ZVBhdGgsIFxuICAgICAgICAgICAgICBjb3JlTWVtYmVyc2hpcHM6IHRoaXMucHJvcHMuY29yZU1lbWJlcnNoaXBzfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgUGVvcGxlU3RvcmUuc2V0UGVvcGxlKHRoaXMucHJvcHMubWVtYmVyc2hpcHMpO1xuICAgICAgdGhpcy5vbkZpbHRlcih0aGlzLnByb3BzLnNlbGVjdGVkKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgUGVvcGxlU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5vbkNoYW5nZSk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaWx0ZXIodGhpcy5zdGF0ZS5zZWxlY3RlZCk7XG4gICAgfSxcblxuICAgIG9uRmlsdGVyOiBmdW5jdGlvbihpbnRlcmVzdCkge1xuICAgICAgdmFyIGZpbHRlcmVkTWVtYmVyc2hpcHMgPSBQZW9wbGVTdG9yZS5nZXRQZW9wbGUoKTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKGludGVyZXN0KSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuc2VsZWN0ZWQgPT09IGludGVyZXN0KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub25GaWx0ZXIoKVxuICAgICAgICB9XG5cbiAgICAgICAgZmlsdGVyZWRNZW1iZXJzaGlwcyA9IF8uZmlsdGVyKGZpbHRlcmVkTWVtYmVyc2hpcHMsIGZ1bmN0aW9uIGZpbHRlck1lbWJlcnNoaXBzKG0pIHtcbiAgICAgICAgICBpZiAoaW50ZXJlc3QgPT09ICdjb3JlJykge1xuICAgICAgICAgICAgcmV0dXJuIG0uY29yZV90ZWFtO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBfLmluY2x1ZGUobS5pbnRlcmVzdHMsIGludGVyZXN0KVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICB2YXIgc29ydGVkTWVtYmVyc2hpcHMgPSBfLnNvcnRCeShmaWx0ZXJlZE1lbWJlcnNoaXBzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgIGlmICghbSkgcmV0dXJuO1xuXG4gICAgICAgIHJldHVybiAoc2VsZi5wcm9wcy5jdXJyZW50VXNlciAmJiBzZWxmLnByb3BzLmN1cnJlbnRVc2VyLmlkID09PSBtLnVzZXIuaWQgP1xuICAgICAgICAgICctMScgOlxuICAgICAgICAgIG0uY29yZV90ZWFtID8gJzAnIDogJzEnKSArXG4gICAgICAgICAgbS51c2VyLnVzZXJuYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZmlsdGVyZWRNZW1iZXJzaGlwczogc29ydGVkTWVtYmVyc2hpcHMsIHNlbGVjdGVkOiBpbnRlcmVzdCB9KTtcbiAgICB9LFxuXG4gICAgZmlsdGVyTGFiZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIChSZWFjdC5ET00uc3BhbihudWxsLCBcIiB0aGUgXCIsIFJlYWN0LkRPTS5hKHtzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfX0sIFwiQFwiLCB0aGlzLnN0YXRlLnNlbGVjdGVkKSwgXCIgdGVhbVwiKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAndGhlc2UgdGVhbXMnXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHZhciBQZW9wbGVGaWx0ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdQZW9wbGVGaWx0ZXInLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgaGlnaGxpZ2h0QWxsID0gc2VsZi5wcm9wcyAmJiAhc2VsZi5wcm9wcy5zZWxlY3RlZCA/ICdwcmltYXJ5JzogJ2RlZmF1bHQnO1xuICAgICAgdmFyIGhpZ2hsaWdodENvcmUgPSBzZWxmLnByb3BzICYmIHNlbGYucHJvcHMuc2VsZWN0ZWQgPT09ICdjb3JlJyA/ICdwcmltYXJ5JzogJ2RlZmF1bHQnO1xuXG4gICAgICB2YXIgdGFncyA9IF8ubWFwKHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBmdW5jdGlvbihpbnRlcmVzdCl7XG4gICAgICAgIGlmIChpbnRlcmVzdCA9PT0gJ2NvcmUnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxhYmVsID0gJ0AnICsgaW50ZXJlc3Q7XG4gICAgICAgIHZhciBoaWdobGlnaHQgPSBzZWxmLnByb3BzICYmIHNlbGYucHJvcHMuc2VsZWN0ZWQgPT09IGludGVyZXN0ID8gJ3ByaW1hcnknIDogJ2RlZmF1bHQnO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogJ2J0biBidG4tJyArIGhpZ2hsaWdodCwgXG4gICAgICAgICAgICAgIGhyZWY6ICcjJyArIGxhYmVsLCBcbiAgICAgICAgICAgICAgb25DbGljazogc2VsZi5maWx0ZXJDaGFuZ2VkKGludGVyZXN0KSwgXG4gICAgICAgICAgICAgIGtleTogaW50ZXJlc3R9LCBcbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLXhzLTJcIn0sIFxuICAgICAgICAgICAgXCJCcm93c2UgYnk6XCJcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLXhzLTEwIGJ0bi1ncm91cCBidG4tZ3JvdXAtc21cIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogJ3RleHQtbXV0ZWQgYnRuIGJ0bi0nICsgaGlnaGxpZ2h0QWxsLCBcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmNsZWFySW50ZXJlc3QsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9fSwgXG4gICAgICAgICAgICAgIFwiQWxsXCJcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogJ3RleHQtbXV0ZWQgYnRuIGJ0bi0nICsgaGlnaGxpZ2h0Q29yZSwgXG4gICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5oaWdobGlnaHRDb3JlLCBcbiAgICAgICAgICAgICAgICBzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfX0sIFxuICAgICAgICAgICAgICBcIkBjb3JlXCJcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgdGFnc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBmaWx0ZXJDaGFuZ2VkOiBmdW5jdGlvbihpbnRlcmVzdCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5wcm9wcy5vbkZpbHRlcihpbnRlcmVzdClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNsZWFySW50ZXJlc3Q6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucHJvcHMub25GaWx0ZXIoKTtcbiAgICB9LFxuXG4gICAgaGlnaGxpZ2h0Q29yZTogZnVuY3Rpb24oZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkZpbHRlcignY29yZScpXG4gICAgfVxuICB9KTtcblxuICB2YXIgUGVvcGxlTGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1Blb3BsZUxpc3QnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGlzdC1ncm91cCBsaXN0LWdyb3VwLWJyZWFrb3V0IGxpc3QtZ3JvdXAtcGFkZGVkXCJ9LCBcbiAgICAgICAgICB0aGlzLnJvd3ModGhpcy5wcm9wcy5tZW1iZXJzaGlwcylcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbihtZW1iZXJzaGlwcykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgcm93cyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1lbWJlcnNoaXBzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgbWVtYmVyID0gbWVtYmVyc2hpcHNbaV07XG5cbiAgICAgICAgaWYgKCFtZW1iZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdXNlciA9IG1lbWJlci51c2VyO1xuXG4gICAgICAgIHZhciByb3cgPSAoXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wiLCBcbiAgICAgICAgICAgIGtleTogJ3Jvdy0nICsgdXNlci5pZCwgXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAncGFkZGluZy10b3AnOiAnMTVweCcsXG4gICAgICAgICAgICAgICdwYWRkaW5nLWJvdHRvbSc6ICcxNXB4JyxcbiAgICAgICAgICAgICAgJ2JvcmRlci1ib3R0b20nOiAnMXB4IHNvbGlkICNlYmViZWInXG4gICAgICAgICAgICB9fSwgXG4gICAgICAgICAgICB0aGlzLmF2YXRhcih1c2VyKSwgXG4gICAgICAgICAgICB0aGlzLm1lbWJlcihtZW1iZXIpXG4gICAgICAgICAgKVxuICAgICAgICApXG5cbiAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByb3dzO1xuICAgIH0sXG5cbiAgICBhdmF0YXI6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtc20tMSBjb2wteHMtMSBcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB1c2VyLnVybCwgdGl0bGU6ICdAJyArIHVzZXIudXNlcm5hbWV9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogdXNlci5hdmF0YXJfdXJsLCBcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYXZhdGFyXCIsIFxuICAgICAgICAgICAgICAgIGFsdDogJ0AnICsgdXNlci51c2VybmFtZSwgXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiMzBcIiwgXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjMwXCJ9XG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBtZW1iZXI6IGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgaWYgKCFtZW1iZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgdXNlciA9IG1lbWJlci51c2VyO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLXNtLTExIGNvbC14cy0xMVwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJvbWVnYVwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJsaXN0LWlubGluZSBvbWVnYSBwdWxsLXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgdGhpcy5za2lsbHMobWVtYmVyKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdXNlci51cmwsIHRpdGxlOiAnQCcgKyB1c2VyLnVzZXJuYW1lfSwgXG4gICAgICAgICAgICAgICAgdXNlci51c2VybmFtZVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgdXNlci5iaW8gPyB0aGlzLmhhc0Jpbyh1c2VyKSA6ICcnLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgQmlvRWRpdG9yKHtcbiAgICAgICAgICAgICAgICBtZW1iZXI6IG1lbWJlciwgXG4gICAgICAgICAgICAgICAgb25GaWx0ZXI6IHRoaXMucHJvcHMub25GaWx0ZXIsIFxuICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyOiB0aGlzLnByb3BzLmN1cnJlbnRVc2VyLCBcbiAgICAgICAgICAgICAgICB1cGRhdGVQYXRoOiB0aGlzLnByb3BzLnVwZGF0ZVBhdGgsIFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQmlvOiBtZW1iZXIuYmlvLCBcbiAgICAgICAgICAgICAgICBpbnRlcmVzdEZpbHRlcnM6IHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBcbiAgICAgICAgICAgICAgICB1cGRhdGVTa2lsbHM6IHRoaXMudXBkYXRlU2tpbGxzLCBcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5wcm9wcy5zZWxlY3RlZH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICB0aGlzLmNvcmVUZWFtSW5mbyhtZW1iZXIpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgY29yZVRlYW1JbmZvOiBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgIHZhciBjb3JlID0gdGhpcy5wcm9wcy5jb3JlTWVtYmVyc2hpcHM7XG5cbiAgICAgIGlmIChjb3JlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gY29yZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB2YXIgYyA9IGNvcmVbaV07XG5cbiAgICAgICAgICBpZiAoYy51c2VyX2lkID09PSBtZW1iZXIudXNlci5pZCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCAnQ29yZSB0ZWFtIHNpbmNlICcgKyBfcGFyc2VEYXRlKGMuY3JlYXRlZF9hdCkpXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhhc0JpbzogZnVuY3Rpb24odXNlcikge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIHRleHQtc21hbGxcIn0sIFxuICAgICAgICAgIHVzZXIuYmlvID8gdXNlci5iaW8gOiAnJ1xuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHNraWxsczogZnVuY3Rpb24obWVtYmVyc2hpcCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAobWVtYmVyc2hpcC5jb3JlX3RlYW0gJiYgbWVtYmVyc2hpcC5pbnRlcmVzdHMuaW5kZXhPZignY29yZScpIDwgMCkge1xuICAgICAgICBtZW1iZXJzaGlwLmludGVyZXN0cy5wdXNoKCdjb3JlJylcbiAgICAgIH1cblxuICAgICAgbWVtYmVyc2hpcC5pbnRlcmVzdHMuc29ydCgpO1xuXG4gICAgICByZXR1cm4gXy5tYXAobWVtYmVyc2hpcC5pbnRlcmVzdHMsIGZ1bmN0aW9uIG1hcEludGVyZXN0cyhpbnRlcmVzdCkge1xuICAgICAgICB2YXIgbGFiZWwgPSAnQCcgKyBpbnRlcmVzdDtcbiAgICAgICAgdmFyIGhpZ2hsaWdodCA9IHNlbGYucHJvcHMgJiYgc2VsZi5wcm9wcy5zZWxlY3RlZCA9PT0gaW50ZXJlc3QgPyAncHJpbWFyeScgOiAnb3V0bGluZWQnO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogJ2xhYmVsIGxhYmVsLScgKyBoaWdobGlnaHQsIFxuICAgICAgICAgICAgICAgIGtleTogbWVtYmVyc2hpcC51c2VyLmlkICsgJy0nICsgaW50ZXJlc3QsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9LCBcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBzZWxmLnByb3BzLm9uRmlsdGVyLmJpbmQobnVsbCwgaW50ZXJlc3QpfSwgXG4gICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgQmlvRWRpdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQmlvRWRpdG9yJyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGN1cnJlbnRVc2VyOiB0aGlzLnByb3BzLmN1cnJlbnRVc2VyLFxuICAgICAgICBtZW1iZXI6IHRoaXMucHJvcHMubWVtYmVyLFxuICAgICAgICBvcmlnaW5hbEJpbzogdGhpcy5wcm9wcy5vcmlnaW5hbEJpbyxcbiAgICAgICAgZWRpdGluZzogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGFyYW1zID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc2xpY2Uod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignPycpICsgMSkuc3BsaXQoJyYnKTtcblxuICAgICAgaWYgKCF0aGlzLmludHJvZHVjZWQgJiYgcGFyYW1zLmluZGV4T2YoJ2ludHJvZHVjdGlvbj10cnVlJykgPj0gMCkge1xuICAgICAgICB0aGlzLmludHJvZHVjZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm1ha2VFZGl0YWJsZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN1cnJlbnRVc2VyID0gdGhpcy5zdGF0ZS5jdXJyZW50VXNlcjtcbiAgICAgIHZhciBtZW1iZXIgPSB0aGlzLnN0YXRlLm1lbWJlcjtcblxuICAgICAgaWYgKCFtZW1iZXIgfHwgIWN1cnJlbnRVc2VyKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KG51bGwpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3VycmVudFVzZXIuaWQgPT09IG1lbWJlci51c2VyLmlkKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJqcy1lZGl0LWJpb1wiLCBrZXk6ICdiLScgKyBjdXJyZW50VXNlci5pZH0sIFxuICAgICAgICAgICAgICBtZW1iZXIuYmlvLCBcbiAgICAgICAgICAgICAgXCLCoFwiLCB0aGlzLnN0YXRlLmVkaXRpbmcgPyB0aGlzLnNhdmVCdXR0b24oKSA6IHRoaXMuZWRpdEJ1dHRvbigpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2tleTogJ2ItJyArIG1lbWJlci51c2VyLmlkfSwgXG4gICAgICAgICAgbWVtYmVyLmJpb1xuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGVkaXRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0ZXh0LXNtYWxsXCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfSwgb25DbGljazogdGhpcy5tYWtlRWRpdGFibGV9LCBcIuKAlMKgVXBkYXRlIEludHJvXCIpXG4gICAgICApXG4gICAgfSxcblxuICAgIHNhdmVCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIiwgc3R5bGU6IHsnbWFyZ2luLXRvcCc6JzE2cHgnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbVwiLCBvbkNsaWNrOiB0aGlzLm1ha2VVbmVkaXRhYmxlLCBzdHlsZTogeydtYXJnaW4tcmlnaHQnIDogJzhweCd9fSwgXCJDYW5jZWxcIiksIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbVwiLCBvbkNsaWNrOiB0aGlzLnVwZGF0ZUJpb30sIFwiU2F2ZVwiKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIG1ha2VFZGl0YWJsZTogZnVuY3Rpb24oZSkge1xuICAgICAgJCgnI2VkaXQtbWVtYmVyc2hpcC1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG5cbiAgICAgICQoJyNtb2RhbC1iaW8tZWRpdG9yJykudmFsKHRoaXMuc3RhdGUub3JpZ2luYWxCaW8pO1xuICAgIH0sXG5cbiAgICBza2lsbHNPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvcHRpb25zID0gXy5tYXAodGhpcy5wcm9wcy5pbnRlcmVzdEZpbHRlcnMsIGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIGlmIChpbnRlcmVzdCA9PT0gJ2NvcmUnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoUmVhY3QuRE9NLm9wdGlvbih7dmFsdWU6IGludGVyZXN0fSwgJ0AnICsgaW50ZXJlc3QpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9LFxuXG4gICAgbWFrZVVuZWRpdGFibGU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBtZW1iZXIgPSB0aGlzLnN0YXRlLm1lbWJlcjtcbiAgICAgIHZhciBiaW8gPSB0aGlzLnN0YXRlLm9yaWdpbmFsQmlvIHx8IHRoaXMucHJvcHMub3JpZ2luYWxCaW87XG5cbiAgICAgIHRoaXMuc2F2ZShtZW1iZXIsIGJpbywgbWVtYmVyLmludGVyZXN0cyk7XG4gICAgfSxcblxuICAgIHVwZGF0ZUJpbzogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGJpbyA9ICQoJy5iaW8tZWRpdG9yJykudmFsKCk7XG4gICAgICB2YXIgaW50ZXJlc3RzID0gJCgnI2pvaW4taW50ZXJlc3RzJykudmFsKCk7XG4gICAgICB2YXIgbWVtYmVyID0gdGhpcy5zdGF0ZS5tZW1iZXI7XG5cbiAgICAgIHRoaXMuc2F2ZShtZW1iZXIsIGJpbywgaW50ZXJlc3RzKTtcbiAgICB9LFxuXG4gICAgc2F2ZTogZnVuY3Rpb24obWVtYmVyLCBiaW8sIGludGVyZXN0cykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHRoaXMucHJvcHMudXBkYXRlUGF0aCxcbiAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbWVtYmVyc2hpcDoge1xuICAgICAgICAgICAgYmlvOiBiaW8sXG4gICAgICAgICAgICBpbnRlcmVzdHM6IGludGVyZXN0c1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIG1lbWJlci5iaW8gPSBkYXRhLmJpb1xuICAgICAgICAgIG1lbWJlci5pbnRlcmVzdHMgPSBkYXRhLmludGVyZXN0c1xuICAgICAgICAgIHNlbGYuc2V0U3RhdGUoeyBtZW1iZXI6IG1lbWJlciwgZWRpdGluZzogZmFsc2UsIG9yaWdpbmFsQmlvOiBkYXRhLmJpbyB9KVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oZGF0YSwgc3RhdHVzKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihzdGF0dXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGVvcGxlO1xuICB9XG5cbiAgd2luZG93LlBlb3BsZSA9IFBlb3BsZTtcblxuICBmdW5jdGlvbiBfcGFyc2VEYXRlKGRhdGUpIHtcbiAgICB2YXIgcGFyc2VkRGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xuXG4gICAgcmV0dXJuIChwYXJzZWREYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpICsgJy0nICsgcGFyc2VkRGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoKSArICctJyArIHBhcnNlZERhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xuICB9XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBQZXJzb25QaWNrZXJTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9wZXJzb25fcGlja2VyX3N0b3JlJyk7XG52YXIgQXZhdGFyID0gcmVxdWlyZSgnLi9hdmF0YXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcblxuICB2YXIgUFAgPSBDT05TVEFOVFMuUEVSU09OX1BJQ0tFUjtcblxuICB2YXIga2V5cyA9IHtcbiAgICBlbnRlcjogMTMsXG4gICAgZXNjOiAyNyxcbiAgICB1cDogMzgsXG4gICAgZG93bjogNDBcbiAgfVxuXG4gIHZhciBQZXJzb25QaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdQZXJzb25QaWNrZXInLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyB1c2VyczogW10sIGhpZ2hsaWdodEluZGV4OiAwIH1cbiAgICB9LFxuXG4gICAgY2xlYXJUZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVmcy51c2VybmFtZU9yRW1haWwuZ2V0RE9NTm9kZSgpLnZhbHVlID0gJydcbiAgICAgIHRoaXMuc2V0U3RhdGUodGhpcy5nZXRJbml0aWFsU3RhdGUoKSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7c3R5bGU6IHtwb3NpdGlvbjogJ3JlbGF0aXZlJ319LCBcbiAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe2NsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2wgaW5wdXQtc21cIiwgdHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICAgICByZWY6IFwidXNlcm5hbWVPckVtYWlsXCIsIFxuICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5oYW5kbGVDaGFuZ2UsIFxuICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuaGFuZGxlS2V5LCBcbiAgICAgICAgICAgICAgICAgb25CbHVyOiB0aGlzLnNlbGVjdEN1cnJlbnRVc2VyLCBcbiAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IFwiQHVzZXJuYW1lIG9yIGVtYWlsIGFkZHJlc3NcIn0pLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLnVzZXJzLmxlbmd0aCA+IDAgPyB0aGlzLnVzZXJQaWNrZXIoKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICB1c2VyUGlja2VyOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIFVzZXJQaWNrZXIoe1xuICAgICAgICB1c2VyczogdGhpcy5zdGF0ZS51c2VycywgXG4gICAgICAgIGhpZ2hsaWdodEluZGV4OiB0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4LCBcbiAgICAgICAgb25Vc2VyU2VsZWN0ZWQ6IHRoaXMuaGFuZGxlVXNlclNlbGVjdGVkfSlcbiAgICB9LFxuXG4gICAgaGFuZGxlQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdGV4dCA9IHRoaXMucmVmcy51c2VybmFtZU9yRW1haWwuZ2V0RE9NTm9kZSgpLnZhbHVlXG4gICAgICBpZih0aGlzLmlzRW1haWwodGV4dCkpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVFbWFpbCh0ZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5oYW5kbGVVc2VybmFtZSh0ZXh0KVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoYW5kbGVVc2VybmFtZTogZnVuY3Rpb24odGV4dCkge1xuICAgICAgdmFyIHBvc3REYXRhID0ge1xuICAgICAgICBzdWdnZXN0X3VzZXJuYW1lOiB7XG4gICAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgICBjb21wbGV0aW9uOiB7XG4gICAgICAgICAgICBmaWVsZDogJ3N1Z2dlc3RfdXNlcm5hbWUnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHRoaXMucHJvcHMudXJsICsgJy91c2Vycy9fc3VnZ2VzdCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocG9zdERhdGEpLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHVzZXJzID0gXy5tYXAoZGF0YS5zdWdnZXN0X3VzZXJuYW1lWzBdLm9wdGlvbnMsIGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKG9wdGlvbi5wYXlsb2FkLCB7IHVzZXJuYW1lOiBvcHRpb24udGV4dCB9KVxuICAgICAgICAgIH0pXG4gICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jb25zdHJhaW5IaWdobGlnaHQodGhpcy5zdGF0ZS5oaWdobGlnaHRJbmRleClcbiAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsaWRVc2VyQ2hhbmdlZCh1c2Vyc1tpbmRleF0pXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dXNlcnM6IHVzZXJzLCBoaWdobGlnaHRJbmRleDogaW5kZXh9KVxuICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignZXJyb3InLCBhcmd1bWVudHMpXG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZUVtYWlsOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICB0aGlzLnByb3BzLm9uVmFsaWRVc2VyQ2hhbmdlZCh7ZW1haWw6IHRleHR9KVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7dXNlcnM6IFtdfSlcbiAgICB9LFxuXG4gICAgaGFuZGxlS2V5OiBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09IGtleXMudXApIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMubW92ZUhpZ2hsaWdodCgtMSlcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09IGtleXMuZG93bikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgdGhpcy5tb3ZlSGlnaGxpZ2h0KDEpXG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PSBrZXlzLmVudGVyKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0aGlzLnNlbGVjdEN1cnJlbnRVc2VyKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbW92ZUhpZ2hsaWdodDogZnVuY3Rpb24oaW5jKSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmNvbnN0cmFpbkhpZ2hsaWdodCh0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4ICsgaW5jKVxuICAgICAgdGhpcy5wcm9wcy5vblZhbGlkVXNlckNoYW5nZWQodGhpcy5zdGF0ZS4gdXNlcnNbaW5kZXhdKVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhpZ2hsaWdodEluZGV4OiBpbmRleCB9KVxuICAgIH0sXG5cbiAgICBzZWxlY3RDdXJyZW50VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGV4dCA9IHRoaXMucmVmcy51c2VybmFtZU9yRW1haWwuZ2V0RE9NTm9kZSgpLnZhbHVlXG4gICAgICB0aGlzLmNsZWFyVGV4dCgpXG5cbiAgICAgIGlmICh0aGlzLnN0YXRlLnVzZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5zZWxlY3RIaWdobGlnaHQoKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRW1haWwodGV4dCkpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RFbWFpbCh0ZXh0KVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZWxlY3RIaWdobGlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oYW5kbGVVc2VyU2VsZWN0ZWQodGhpcy5zdGF0ZS51c2Vyc1t0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4XSlcbiAgICB9LFxuXG4gICAgc2VsZWN0RW1haWw6IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVXNlclNlbGVjdGVkKHtlbWFpbDogZW1haWx9KVxuICAgIH0sXG5cbiAgICBoYW5kbGVVc2VyU2VsZWN0ZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHRoaXMuY2xlYXJUZXh0KClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB1c2VyczogW10gfSlcbiAgICAgIHRoaXMucHJvcHMub25Vc2VyU2VsZWN0ZWQodXNlcilcbiAgICB9LFxuXG4gICAgY29uc3RyYWluSGlnaGxpZ2h0OiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICAwLCBNYXRoLm1pbih0aGlzLnN0YXRlLnVzZXJzLmxlbmd0aCAtIDEsIGluZGV4KVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBpc0VtYWlsOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICByZXR1cm4gL15AP1xcdytALy5leGVjKHRleHQpXG4gICAgfVxuICB9KVxuXG4gIHZhciBVc2VyUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVXNlclBpY2tlcicsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzdHlsZSA9IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICd6LWluZGV4JzogMTAwLFxuICAgICAgICB0b3A6IDI3LFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICBkaXNwbGF5OiAnYmxvY2snXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duLW1lbnVcIiwgc3R5bGU6IHN0eWxlfSwgXG4gICAgICAgICAgdGhpcy5yb3dzKClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gLTFcbiAgICAgIHJldHVybiBfLm1hcCh0aGlzLnByb3BzLnVzZXJzLCBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgaSArPSAxXG4gICAgICAgIHJldHVybiBVc2VyUGlja2VyRW50cnkoe2tleTogdXNlci51c2VybmFtZSwgdXNlcjogdXNlciwgc2VsZWN0ZWQ6IGkgPT09IHRoaXMucHJvcHMuaGlnaGxpZ2h0SW5kZXgsIG9uVXNlclNlbGVjdGVkOiB0aGlzLnByb3BzLm9uVXNlclNlbGVjdGVkfSlcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9XG4gIH0pXG5cbiAgdmFyIFVzZXJQaWNrZXJFbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1VzZXJQaWNrZXJFbnRyeScsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjbGFzc05hbWUgPSAndGV4dGNvbXBsZXRlLWl0ZW0nXG4gICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgICBjbGFzc05hbWUgKz0gJyBhY3RpdmUnXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBjbGFzc05hbWV9LCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogJyNAJyArIHRoaXMucHJvcHMudXNlci51c2VybmFtZSwgb25DbGljazogdGhpcy5oYW5kbGVVc2VyU2VsZWN0ZWQodGhpcy5wcm9wcy51c2VyKX0sIFxuICAgICAgICAgICAgQXZhdGFyKHt1c2VyOiB0aGlzLnByb3BzLnVzZXIsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7J21hcmdpbi1yaWdodCc6ICcxMHB4J319KSwgXG4gICAgICAgICAgICBcIkBcIiwgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lLCBcIiBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCB0aGlzLnByb3BzLnVzZXIubmFtZSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlclNlbGVjdGVkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25Vc2VyU2VsZWN0ZWQodXNlcilcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQZXJzb25QaWNrZXI7XG4gIH1cblxuICB3aW5kb3cuUGVyc29uUGlja2VyID0gUGVyc29uUGlja2VyO1xuXG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFBvcG92ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdQb3BvdmVyJyxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgIHBsYWNlbWVudDogUmVhY3QuUHJvcFR5cGVzLm9uZU9mKFsndG9wJywncmlnaHQnLCAnYm90dG9tJywgJ2xlZnQnXSksXG4gICAgICBwb3NpdGlvbkxlZnQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgICBwb3NpdGlvblRvcDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIGFycm93T2Zmc2V0TGVmdDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIGFycm93T2Zmc2V0VG9wOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgdGl0bGU6IFJlYWN0LlByb3BUeXBlcy5yZW5kZXJhYmxlXG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcGxhY2VtZW50OiAncmlnaHQnXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjbGFzc2VzID0ge1xuICAgICAgICBwb3BvdmVyOiB0cnVlLFxuICAgICAgICBpbjogdGhpcy5wcm9wcy5wb3NpdGlvbkxlZnQgIT0gbnVsbCB8fCB0aGlzLnByb3BzLnBvc2l0aW9uVG9wICE9IG51bGxcbiAgICAgIH07XG5cbiAgICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5wbGFjZW1lbnRdID0gdHJ1ZTtcblxuICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICBsZWZ0OiB0aGlzLnByb3BzLnBvc2l0aW9uTGVmdCxcbiAgICAgICAgdG9wOiB0aGlzLnByb3BzLnBvc2l0aW9uVG9wLFxuICAgICAgICBkaXNwbGF5OiAnYmxvY2snXG4gICAgICB9O1xuXG4gICAgICB2YXIgYXJyb3dTdHlsZSA9IHtcbiAgICAgICAgbGVmdDogdGhpcy5wcm9wcy5hcnJvd09mZnNldExlZnQsXG4gICAgICAgIHRvcDogdGhpcy5wcm9wcy5hcnJvd09mZnNldFRvcFxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBSZWFjdC5hZGRvbnMuY2xhc3NTZXQoY2xhc3NlcyksIHN0eWxlOiBzdHlsZX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvd1wiLCBzdHlsZTogYXJyb3dTdHlsZX0pLCBcbiAgICAgICAgICB0aGlzLnByb3BzLnRpdGxlID8gdGhpcy5yZW5kZXJUaXRsZSgpIDogbnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBvcG92ZXItY29udGVudFwifSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICByZW5kZXJUaXRsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uaDMoe2NsYXNzTmFtZTogXCJwb3BvdmVyLXRpdGxlXCJ9LCB0aGlzLnByb3BzLnRpdGxlKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUG9wb3ZlcjtcbiAgfVxuXG4gIHdpbmRvdy5Qb3BvdmVyID0gUG9wb3Zlcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBvcG92ZXIgPSByZXF1aXJlKCcuL3BvcG92ZXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFNoYXJlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU2hhcmUnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBtb2RhbDogZmFsc2UgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wiLCBjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbVwiLCBzdHlsZTogeyd2ZXJ0aWNhbC1hbGlnbic6ICdib3R0b20nfSwgb25DbGljazogdGhpcy50b2dnbGVNb2RhbH0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tc2hhcmUtYWx0XCIsIHN0eWxlOiB7XCJtYXJnaW4tcmlnaHRcIjogMn19KSwgXG4gICAgICAgICAgICBcIlNoYXJlXCJcbiAgICAgICAgICApLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLm1vZGFsID8gdGhpcy5wb3BvdmVyKCkgOiBudWxsXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgdG9nZ2xlTW9kYWw6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kYWw6ICF0aGlzLnN0YXRlLm1vZGFsfSlcbiAgICB9LFxuXG4gICAgcG9wb3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBQb3BvdmVyKHtwbGFjZW1lbnQ6IFwiYm90dG9tXCIsIHBvc2l0aW9uTGVmdDogNDQwLCBwb3NpdGlvblRvcDogMzAsIHRpdGxlOiB0aGlzLnByb3BzLnRpdGxlfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibGlzdCBsaXN0LXVuc3R5bGVkXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7c3R5bGU6IHtcIm1hcmdpbi1ib3R0b21cIjogMTB9fSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtNlwifSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcImJ0biBidG4tdHdpdHRlciBidG4tYmxvY2tcIiwgb25DbGljazogdGhpcy5oYW5kbGVUd2l0dGVyQ2xpY2t9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tdHdpdHRlclwiLCBzdHlsZTogeydtYXJnaW4tcmlnaHQnOiAyfX0pLCBcbiAgICAgICAgICAgICAgICAgICAgXCJUd2l0dGVyXCJcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLW1kLTZcIn0sIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJidG4gYnRuLWZhY2Vib29rIGJ0bi1ibG9ja1wiLCBocmVmOiBcIiNcIiwgb25DbGljazogdGhpcy5oYW5kbGVGYWNlYm9va0NsaWNrfSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWZhY2Vib29rXCIsIHN0eWxlOiB7J21hcmdpbi1yaWdodCc6IDJ9fSksIFxuICAgICAgICAgICAgICAgICAgICBcIkZhY2Vib29rXCJcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgICBDb3B5TGluayh7dXJsOiB0aGlzLnByb3BzLnVybH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGhhbmRsZVR3aXR0ZXJDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cub3BlbignaHR0cDovL3R3aXR0ZXIuY29tL3NoYXJlP3VybD0nICsgdGhpcy5wcm9wcy51cmwgKyAnJnRleHQ9JyArIHRoaXMucHJvcHMuc2hhcmVUZXh0ICsgJyYnLCAndHdpdHRlcndpbmRvdycsICdoZWlnaHQ9NDUwLCB3aWR0aD01NTAsIHRvcD0nKygkKHdpbmRvdykuaGVpZ2h0KCkvMiAtIDIyNSkgKycsIGxlZnQ9JyskKHdpbmRvdykud2lkdGgoKS8yICsnLCB0b29sYmFyPTAsIGxvY2F0aW9uPTAsIG1lbnViYXI9MCwgZGlyZWN0b3JpZXM9MCwgc2Nyb2xsYmFycz0wJyk7XG4gICAgfSxcblxuICAgIGhhbmRsZUZhY2Vib29rQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgRkIudWkoe1xuICAgICAgICBtZXRob2Q6ICdzaGFyZScsXG4gICAgICAgIGhyZWY6IHRoaXMucHJvcHMudXJsLFxuICAgICAgfSwgZnVuY3Rpb24ocmVzcG9uc2Upe30pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIENvcHlMaW5rID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ29weUxpbmsnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBsYWJlbDogJ0NvcHknIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cFwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtyZWY6IFwidGV4dFwiLCB0eXBlOiBcInRleHRcIiwgY2xhc3NOYW1lOiBcImZvcm0tY29udHJvbFwiLCBpZDogXCJzaGFyZS11cmxcIiwgdmFsdWU6IHRoaXMucHJvcHMudXJsfSksIFxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYnRuXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe3JlZjogXCJjb3B5XCIsIGNsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgdHlwZTogXCJidXR0b25cIn0sIHRoaXMuc3RhdGUubGFiZWwpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgdmFyIGNsaWVudCA9IG5ldyBaZXJvQ2xpcGJvYXJkKHRoaXMucmVmcy5jb3B5LmdldERPTU5vZGUoKSlcbiAgICAgIGNsaWVudC5vbigncmVhZHknLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjbGllbnQub24oJ2NvcHknLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuc2V0RGF0YSgndGV4dC9wbGFpbicsIHNlbGYucHJvcHMudXJsKVxuICAgICAgICB9KTtcblxuICAgICAgICBjbGllbnQub24oJ2FmdGVyY29weScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7bGFiZWw6ICdDb3BpZWQhJ30pXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuc2V0U3RhdGUoe2xhYmVsOiAnQ29weSd9KVxuICAgICAgICAgIH0sIDEwMDApXG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gU2hhcmU7XG4gIH1cblxuICB3aW5kb3cuU2hhcmUgPSBTaGFyZTtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIFRhZ0xpc3RTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy90YWdfbGlzdF9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBUQyA9IENPTlNUQU5UUy5URVhUX0NPTVBMRVRFO1xuICB2YXIgVEFHX0xJU1QgPSBDT05TVEFOVFMuVEFHX0xJU1Q7XG5cbiAgdmFyIFRhZ0xpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdUYWdMaXN0JyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFnczogdGhpcy5wcm9wcy50YWdzXG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5kZXN0aW5hdGlvbikge1xuICAgICAgICBUYWdMaXN0U3RvcmUuc2V0VGFncyh0aGlzLnByb3BzLnRhZ3MpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibGlzdC1pbmxpbmUgb21lZ2FcIn0sIFxuICAgICAgICAgIHRoaXMudGFncyh0aGlzLnN0YXRlLnRhZ3MpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRhZ3M6IGZ1bmN0aW9uKHRhZ3MpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBhZGRlZFRhZ3MgPSBUYWdMaXN0U3RvcmUuZ2V0VGFncygpO1xuXG4gICAgICB2YXIgbWFwcGVkVGFncyA9IF8ubWFwKHRhZ3MsIGZ1bmN0aW9uKHRhZykge1xuICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICcxNHB4JyxcbiAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJ1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghc2VsZi5wcm9wcy5kZXN0aW5hdGlvbiAmJiBhZGRlZFRhZ3MuaW5kZXhPZih0YWcpID49IDApIHtcbiAgICAgICAgICBzdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgICAgc3R5bGUuY29sb3IgPSAnI2QzZDNkMyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRhZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLnByb3BzLmFsbG93UmVtb3ZhbCkge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkoe3N0eWxlOiB7J21hcmdpbic6ICcwcHgnfX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7c3R5bGU6IHN0eWxlfSwgdGFnKSwgUmVhY3QuRE9NLnNwYW4obnVsbCwgUmVhY3QuRE9NLmEoe3N0eWxlOiB7J21hcmdpbi1sZWZ0JzogJzJweCcsICdmb250LXNpemUnOiAnMTBweCcsIGN1cnNvcjogJ3BvaW50ZXInfSwgb25DbGljazogc2VsZi5oYW5kbGVDbGljayh0YWcpfSwgXCLDl1wiKSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00ubGkoe3N0eWxlOiB7J21hcmdpbic6ICcwcHgnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe3N0eWxlOiBzdHlsZSwgaHJlZjogc2VsZi5wcm9wcy5maWx0ZXJVcmwgPyBzZWxmLnByb3BzLmZpbHRlclVybCArICc/dGFnPScgKyB0YWcgOiAnamF2YXNjcmlwdDp2b2lkKDApOycsIG9uQ2xpY2s6IHNlbGYuaGFuZGxlQ2xpY2sodGFnKX0sIHRhZylcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgLy8gRklYTUU6IFdoZW4gdGhlcmUgYXJlIG5vIHRhZ3MsIHRoZSBjbGllbnQganVzdCByZWNlaXZlcyBbXCJcIl0sIHdoaWNoIHJlcXVpcmVzIHdlaXJkIGNoZWNrcyBsaWtlIHRoaXMuXG4gICAgICBpZiAodGhpcy5wcm9wcy5kZXN0aW5hdGlvbiAmJlxuICAgICAgICAgIChfLmlzRW1wdHkobWFwcGVkVGFncykgfHxcbiAgICAgICAgICAgIChtYXBwZWRUYWdzWzBdID09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgIG1hcHBlZFRhZ3NbMV0gPT0gdW5kZWZpbmVkKSkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00ubGkoe3N0eWxlOiB7Y29sb3I6ICcjZDNkM2QzJywgJ2ZvbnQtc2l6ZSc6ICcxM3B4J319LCBcIk5vIHRhZ3MgeWV0IOKAlCB3aHkgbm90IGFkZCBzb21lP1wiKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWFwcGVkVGFncztcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgVGFnTGlzdFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMub25DaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGFncyA9IFRhZ0xpc3RTdG9yZS5nZXRUYWdzKCk7XG5cbiAgICAgIGlmICh0aGlzLnByb3BzLmRlc3RpbmF0aW9uKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHRhZ3M6IHRhZ3NcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHRhZ0xpc3RIYWNrID0gJCgnI3RhZy1saXN0LWhhY2snKTtcblxuICAgICAgICBpZiAodGFnTGlzdEhhY2subGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKF8uaXNFbXB0eSh0YWdzKSkge1xuICAgICAgICAgICAgdGFnTGlzdEhhY2suZW1wdHkoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0YWdMaXN0SGFjay52YWwoKTtcblxuICAgICAgICAgICQodGFnTGlzdEhhY2spLmFwcGVuZChfLm1hcCh0YWdzLCBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgICAgIGlmICgoc2VsZWN0ZWQgJiYgc2VsZWN0ZWQuaW5kZXhPZih0YWcpID09PSAtMSkgfHwgIXNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnPG9wdGlvbiB2YWx1ZT0nICsgdGFnICsgJyBzZWxlY3RlZD1cInRydWVcIj4nICsgdGFnICsgJzwvb3B0aW9uPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB0YWdzOiB0aGlzLnByb3BzLnRhZ3NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhhbmRsZUNsaWNrOiBmdW5jdGlvbih0YWcpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMucHJvcHMuZGVzdGluYXRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmFsbG93UmVtb3ZhbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IFRBR19MSVNULkFDVElPTlMuUkVNT1ZFX1RBRyxcbiAgICAgICAgICAgIGRhdGE6IHsgdGFnOiB0YWcsIHVybDogc2VsZi5wcm9wcy51cmwgfSxcbiAgICAgICAgICAgIGV2ZW50OiBUQUdfTElTVC5FVkVOVFMuVEFHX1JFTU9WRURcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgYWN0aW9uOiBUQUdfTElTVC5BQ1RJT05TLkFERF9UQUcsXG4gICAgICAgICAgZGF0YTogeyB0YWc6IHRhZywgdXJsOiBzZWxmLnByb3BzLnVybCB9LFxuICAgICAgICAgIGV2ZW50OiBUQUdfTElTVC5FVkVOVFMuVEFHX0FEREVEICsgJy10cnVlJ1xuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICB0YWdzOiBzZWxmLnN0YXRlLnRhZ3NcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUYWdMaXN0O1xuICB9XG5cbiAgd2luZG93LlRhZ0xpc3QgPSBUYWdMaXN0O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBUaW1lc3RhbXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdUaW1lc3RhbXAnLFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLnRpbWVhZ28oKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkudGltZWFnbygnZGlzcG9zZScpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnRpbWUoe2NsYXNzTmFtZTogXCJ0aW1lc3RhbXBcIiwgZGF0ZVRpbWU6IHRoaXMucHJvcHMudGltZX0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUaW1lc3RhbXA7XG4gIH1cblxuICB3aW5kb3cuVGltZXN0YW1wID0gVGltZXN0YW1wO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgQ09JTl9JTkNSRU1FTlQgPSAxMDBcbiAgREVCT1VOQ0VfVElNRU9VVCA9IDIwMDBcblxuICB2YXIgVGlwc1VpID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVGlwc1VpJyxcbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN1cnJlbnRVc2VyID0gYXBwLmN1cnJlbnRVc2VyKClcbiAgICAgIGlmIChjdXJyZW50VXNlcikge1xuICAgICAgICBjdXJyZW50VXNlciA9IGN1cnJlbnRVc2VyLmF0dHJpYnV0ZXNcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVudFVzZXI6IGN1cnJlbnRVc2VyLFxuICAgICAgICB1cmw6IGFwcC5wcm9kdWN0LmdldCgndXJsJykgKyAnL3RpcHMnXG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXBzOiBfLnJlZHVjZSh0aGlzLnByb3BzLnRpcHMsIGZ1bmN0aW9uKGgsIHRpcCkgeyBoW3RpcC5mcm9tLmlkXSA9IHRpcDsgcmV0dXJuIGggfSwge30pLFxuICAgICAgICB1c2VyQ2VudHM6IGFwcC5jdXJyZW50UHJvZHVjdEJhbGFuY2UoKSxcbiAgICAgICAgcGVuZGluZ0NlbnRzOiAwXG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcy5yZWZzLmJ1dHRvbi5nZXRET01Ob2RlKCkpLnRvb2x0aXAoKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRvdGFsQ2VudHMgPSB0aGlzLnRvdGFsQ2VudHMoKVxuXG4gICAgICB2YXIgdG9vbHRpcCA9IG51bGxcbiAgICAgIGlmICh0aGlzLnByb3BzLmN1cnJlbnRVc2VyID09IG51bGwpIHtcbiAgICAgICAgdG9vbHRpcCA9ICdZb3UgbmVlZCB0byBzaWduIHVwIGJlZm9yZSB5b3UgY2FuIHRpcCdcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS51c2VyQ2VudHMgPD0gMCkge1xuICAgICAgICB0b29sdGlwID0gJ1lvdSBoYXZlIG5vIGNvaW5zIHRvIHRpcCdcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50VXNlcklzUmVjaXBpZW50KCkpIHtcbiAgICAgICAgdG9vbHRpcCA9IFwiWW91IGNhbid0IHRpcCB5b3Vyc2VsZlwiXG4gICAgICB9XG5cbiAgICAgIHZhciB0aXBwZXJzID0gbnVsbFxuICAgICAgaWYgKHRvdGFsQ2VudHMgPiAwKSB7XG4gICAgICAgIHRpcHBlcnMgPSBUaXBwZXJzKHt0aXBzOiB0aGlzLnRpcHMoKX0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJqcy10aXBzXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IHRvdGFsQ2VudHMgPiAwID8gJ3RleHQtY29pbnMnIDogbnVsbH0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe3JlZjogXCJidXR0b25cIiwgaHJlZjogXCJqYXZhc2NyaXB0OjtcIiwgJ2RhdGEtcGxhY2VtZW50JzogXCJ0b3BcIiwgJ2RhdGEtdG9nZ2xlJzogXCJ0b29sdGlwXCIsIHRpdGxlOiB0b29sdGlwLCBvbkNsaWNrOiB0aGlzLmN1cnJlbnRVc2VyQ2FuVGlwKCkgPyB0aGlzLmhhbmRsZUNsaWNrIDogbnVsbH0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1hcHAtY29pblwifSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCBcIiBcIiwgbnVtZXJhbCh0aGlzLnRvdGFsQ2VudHMoKSAvIDEwMCkuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgdGlwcGVyc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBvcHRpbWlzdGljVGlwOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB1cGRhdGUgPSB7IHBlbmRpbmdDZW50czogeyAkc2V0OiB0aGlzLnN0YXRlLnBlbmRpbmdDZW50cyArIENPSU5fSU5DUkVNRU5UIH0sIHRpcHM6IHt9fVxuXG4gICAgICB2YXIgdGlwID0gdGhpcy5zdGF0ZS50aXBzW3RoaXMucHJvcHMuY3VycmVudFVzZXIuaWRdXG4gICAgICBpZiAodGlwKSB7XG4gICAgICAgIHVwZGF0ZS50aXBzW3RoaXMucHJvcHMuY3VycmVudFVzZXIuaWRdID0geyAkbWVyZ2U6IHsgY2VudHM6IHRpcC5jZW50cyArIENPSU5fSU5DUkVNRU5UIH0gfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXBkYXRlLnRpcHNbdGhpcy5wcm9wcy5jdXJyZW50VXNlci5pZF0gPSB7ICRzZXQ6IHsgZnJvbTogdGhpcy5wcm9wcy5jdXJyZW50VXNlciwgY2VudHM6IENPSU5fSU5DUkVNRU5UIH0gfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKFJlYWN0LmFkZG9ucy51cGRhdGUodGhpcy5zdGF0ZSwgdXBkYXRlKSlcbiAgICB9LFxuXG4gICAgc2F2ZTogXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICB1cmw6IHRoaXMucHJvcHMudXJsLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgdGlwOiB7XG4gICAgICAgICAgICBhZGQ6IHRoaXMuc3RhdGUucGVuZGluZ0NlbnRzLFxuICAgICAgICAgICAgdmlhX3R5cGU6IHRoaXMucHJvcHMudmlhVHlwZSxcbiAgICAgICAgICAgIHZpYV9pZDogdGhpcy5wcm9wcy52aWFJZFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3BlbmRpbmdDZW50czogMH0pXG4gICAgICB9LmJpbmQodGhpcyl9KVxuICAgIH0sIERFQk9VTkNFX1RJTUVPVVQpLFxuXG4gICAgaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vcHRpbWlzdGljVGlwKClcbiAgICAgIHRoaXMuc2F2ZSgpXG4gICAgfSxcblxuICAgIGN1cnJlbnRVc2VyQ2FuVGlwOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLnVzZXJDZW50cyA+IDAgJiYgIXRoaXMuY3VycmVudFVzZXJJc1JlY2lwaWVudCgpXG4gICAgfSxcblxuICAgIGN1cnJlbnRVc2VySXNSZWNpcGllbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY3VycmVudFVzZXIuaWQgPT0gdGhpcy5wcm9wcy5yZWNpcGllbnQuaWRcbiAgICB9LFxuXG4gICAgdG90YWxDZW50czogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5yZWR1Y2UoXy5tYXAodGhpcy50aXBzKCksIGZ1bmMuZG90KCdjZW50cycpKSwgZnVuYy5hZGQsIDApXG4gICAgfSxcblxuICAgIHRpcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8udmFsdWVzKHRoaXMuc3RhdGUudGlwcylcbiAgICB9XG4gIH0pXG5cbiAgdmFyIFRpcHBlcnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdUaXBwZXJzJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcIuKAlCB0aXBwZWQgYnkgwqBcIiwgXG4gICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibGlzdC1pbmxpbmUtbWVkaWFcIn0sIFxuICAgICAgICAgICAgXy5tYXAodGhpcy5wcm9wcy50aXBzLCB0aGlzLnJvdylcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgcm93OiBmdW5jdGlvbih0aXApIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5saSh7a2V5OiB0aXAuZnJvbS5pZH0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiBcImltZy1jaXJjbGVcIiwgXG4gICAgICAgICAgICBzcmM6IHRpcC5mcm9tLmF2YXRhcl91cmwsIFxuICAgICAgICAgICAgYWx0OiAnQCcgKyB0aXAuZnJvbS51c2VybmFtZSwgXG4gICAgICAgICAgICAnZGF0YS10b2dnbGUnOiBcInRvb2x0aXBcIiwgXG4gICAgICAgICAgICAnZGF0YS1wbGFjZW1lbnQnOiBcInRvcFwiLCBcbiAgICAgICAgICAgIHRpdGxlOiAnQCcgKyB0aXAuZnJvbS51c2VybmFtZSwgXG4gICAgICAgICAgICB3aWR0aDogXCIxNlwiLCBoZWlnaHQ6IFwiMTZcIn0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGlwc1VpO1xuICB9XG4gIFxuICB3aW5kb3cuVGlwc1VpID0gVGlwc1VpO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9jaGF0X25vdGlmaWNhdGlvbnNfc3RvcmUnKTtcbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBUaXRsZU5vdGlmaWNhdGlvbnNDb3VudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1RpdGxlTm90aWZpY2F0aW9uc0NvdW50JyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLnNldFRpdGxlKTtcbiAgICAgIE5ld3NGZWVkU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5zZXRUaXRsZSk7XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb3VudDogMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3BhbihudWxsKTtcbiAgICB9LFxuXG4gICAgc2V0VGl0bGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNoYXRDb3VudCA9IENoYXROb3RpZmljYXRpb25zU3RvcmUuZ2V0VW5yZWFkQ291bnQocGFyc2VJbnQobG9jYWxTdG9yYWdlLmNoYXRBY2ssIDEwKSkgfHwgMDtcbiAgICAgIHZhciBuZXdzQ291bnQgPSBOZXdzRmVlZFN0b3JlLmdldFVucmVhZENvdW50KHBhcnNlSW50KGxvY2FsU3RvcmFnZS5uZXdzRmVlZEFjaywgMTApKSB8fCAwO1xuXG4gICAgICB2YXIgdG90YWwgPSBjaGF0Q291bnQgKyBuZXdzQ291bnQ7XG5cbiAgICAgIGRvY3VtZW50LnRpdGxlID0gdG90YWwgPiAwID9cbiAgICAgICAgJygnICsgdG90YWwgKyAnKSAnICsgdGhpcy5wcm9wcy50aXRsZSA6XG4gICAgICAgIHRoaXMucHJvcHMudGl0bGU7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRpdGxlTm90aWZpY2F0aW9uc0NvdW50O1xuICB9XG5cbiAgd2luZG93LlRpdGxlTm90aWZpY2F0aW9uc0NvdW50ID0gVGl0bGVOb3RpZmljYXRpb25zQ291bnQ7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFVyZ2VuY3kgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdVcmdlbmN5JyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgbGFiZWw6IHRoaXMucHJvcHMuaW5pdGlhbExhYmVsIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJkcm9wZG93blwiLCBzdHlsZToge1wiZGlzcGxheVwiOlwiaW5saW5lLWJsb2NrXCJ9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoeydkYXRhLXRvZ2dsZSc6IFwiZHJvcGRvd25cIiwgaHJlZjogXCIjXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IHRoaXMubGFiZWxDbGFzcyh0aGlzLnN0YXRlLmxhYmVsKX0sIHRoaXMuc3RhdGUubGFiZWwpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiZHJvcGRvd24tbWVudVwifSwgXG4gICAgICAgICAgICB0aGlzLmxpc3RJdGVtcygpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGxpc3RJdGVtczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy51cmdlbmNpZXMubWFwKGZ1bmN0aW9uKHUpe1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7a2V5OiB1fSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7b25DbGljazogdGhpcy51cGRhdGVVcmdlbmN5KHUpfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IHRoaXMubGFiZWxDbGFzcyh1KX0sIHUpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIHVwZGF0ZVVyZ2VuY3k6IGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2xhYmVsOiBsYWJlbH0pXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgdXJsOiB0aGlzLnByb3BzLnVybCxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHR5cGU6ICdQQVRDSCcsXG4gICAgICAgICAgZGF0YTogeyB1cmdlbmN5OiBsYWJlbC50b0xvd2VyQ2FzZSgpIH1cbiAgICAgICAgfSk7XG4gICAgICB9LmJpbmQodGhpcylcbiAgICB9LFxuXG4gICAgbGFiZWxDbGFzczogZnVuY3Rpb24odXJnZW5jeSkge1xuICAgICAgcmV0dXJuIFwibGFiZWwgbGFiZWwtXCIgKyB1cmdlbmN5LnRvTG93ZXJDYXNlKClcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVXJnZW5jeTtcbiAgfVxuXG4gIHdpbmRvdy5VcmdlbmN5ID0gVXJnZW5jeTtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgVXNlck5hdmJhckRyb3Bkb3duID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVXNlck5hdmJhckRyb3Bkb3duJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiZHJvcGRvd24tbWVudVwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMudXNlclBhdGh9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tdXNlciBkcm9wZG93bi1nbHlwaFwifSksIFxuICAgICAgICAgICAgICBcIlByb2ZpbGVcIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMuZWRpdFVzZXJQYXRofSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLXNldHRpbmdzIGRyb3Bkb3duLWdseXBoXCJ9KSwgXG4gICAgICAgICAgICAgIFwiU2V0dHRpbmdzXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcImRpdmlkZXJcIn0pLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB0aGlzLnByb3BzLmRlc3Ryb3lVc2VyU2Vzc2lvblBhdGgsICdkYXRhLW1ldGhvZCc6IFwiZGVsZXRlXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tbG9nb3V0IGRyb3Bkb3duLWdseXBoXCJ9KSwgXG4gICAgICAgICAgICAgIFwiTG9nIG91dFwiXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBVc2VyTmF2YmFyRHJvcGRvd247XG4gIH1cbiAgXG4gIHdpbmRvdy5Vc2VyTmF2YmFyRHJvcGRvd24gPSBVc2VyTmF2YmFyRHJvcGRvd247XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQ09OU1RBTlRTID0ge1xuICAgIENIQVRfTk9USUZJQ0FUSU9OUzoge1xuICAgICAgQUNUSU9OUzoge1xuICAgICAgICBBQ0tOT1dMRURHRTogJ2NoYXQ6YWNrbm93bGVkZ2UnLFxuICAgICAgICBGRVRDSF9DSEFUX1JPT01TOiAnY2hhdDpmZXRjaENoYXRSb29tcycsXG4gICAgICAgIE1BUktfUk9PTV9BU19SRUFEOiAnY2hhdDptYXJrUm9vbUFzUmVhZCdcbiAgICAgIH0sXG4gICAgICBFVkVOVFM6IHtcbiAgICAgICAgQUNLTk9XTEVER0VEOiAnY2hhdDphY2tub3dsZWRnZWQnLFxuICAgICAgICBDSEFUX1JPT01TX0ZFVENIRUQ6ICdjaGF0OmNoYXRSb29tc0ZldGNoZWQnLFxuICAgICAgICBDSEFUX1JPT01fUkVBRDogJ2NoYXQ6Y2hhdFJvb21SZWFkJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBDT0lOX09XTkVSU0hJUDoge1xuICAgICAgQUNUSU9OUzoge1xuICAgICAgICBBRERfVVNFUjogJ2FkZFVzZXInLFxuICAgICAgICBSRU1PVkVfVVNFUjogJ3JlbW92ZVVzZXInLFxuICAgICAgICBVUERBVEVfVVNFUjogJ3VwZGF0ZVVzZXInXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIFVTRVJfQURERUQ6ICdjb2luT3duZXJzaGlwOnVzZXJBZGRlZCcsXG4gICAgICAgIFVTRVJfUkVNT1ZFRDogJ2NvaW5Pd25lcnNoaXA6dXNlclJlbW92ZWQnLFxuICAgICAgICBVU0VSX1VQREFURUQ6ICdjb2luT3duZXJzaGlwOnVzZXJVcGRhdGVkJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBJTlRFUkVTVF9QSUNLRVI6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUREX0lOVEVSRVNUOiAnYWRkSW50ZXJlc3QnLFxuICAgICAgICBSRU1PVkVfSU5URVJFU1Q6ICdyZW1vdmVJbnRlcmVzdCcsXG4gICAgICAgIFBPUDogJ3BvcCdcbiAgICAgIH0sXG4gICAgICBFVkVOVFM6IHtcbiAgICAgICAgSU5URVJFU1RfQURERUQ6ICdpbnRlcmVzdFBpY2tlcjppbnRlcmVzdEFkZGVkJyxcbiAgICAgICAgSU5URVJFU1RfUkVNT1ZFRDogJ2ludGVyZXN0UGlja2VyOmludGVyZXN0UmVtb3ZlZCcsXG4gICAgICAgIFBPUFBFRDogJ2ludGVyZXN0UGlja2VyOnBvcHBlZCdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgTkVXU19GRUVEOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFDS05PV0xFREdFOiAnbmV3c0ZlZWQ6YWNrbm93bGVkZ2UnLFxuICAgICAgICBGRVRDSF9TVE9SSUVTOiAnbmV3c0ZlZWQ6ZmV0Y2hTdG9yaWVzJyxcbiAgICAgICAgRkVUQ0hfTU9SRV9TVE9SSUVTOiAnbmV3c0ZlZWQ6ZmV0Y2hNb3JlU3RvcmllcycsXG4gICAgICAgIE1BUktfQVNfUkVBRDogJ25ld3NGZWVkOm1hcmtBc1JlYWQnLFxuICAgICAgICBNQVJLX0FMTF9BU19SRUFEOiAnbmV3c0ZlZWQ6bWFya0FsbEFzUmVhZCcsXG4gICAgICAgIE1BUktfU1RPUllfQVNfUkVBRDogJ25ld3NGZWVkOm1hcmtTdG9yeUFzUmVhZCdcbiAgICAgIH0sXG4gICAgICBFVkVOVFM6IHtcbiAgICAgICAgQUNLTk9XTEVER0VEOiAnbmV3c0ZlZWQ6YWNrbm93bGVkZ2VkJyxcbiAgICAgICAgUkVBRDogJ25ld3NGZWVkOnJlYWQnLFxuICAgICAgICBSRUFEX0FMTDogJ25ld3NGZWVkOnJlYWRBbGwnLFxuICAgICAgICBTVE9SSUVTX0ZFVENIRUQ6ICduZXdzRmVlZDpzdG9yaWVzRmV0Y2hlZCcsXG4gICAgICAgIFNUT1JZX1JFQUQ6ICduZXdzRmVlZDpzdG9yeVJlYWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIE5PVElGSUNBVElPTl9QUkVGRVJFTkNFU19EUk9QRE9XTjoge1xuICAgICAgQUNUSU9OUzoge1xuICAgICAgICBVUERBVEVfU0VMRUNURUQ6ICd1cGRhdGVTZWxlY3RlZCdcbiAgICAgIH0sXG4gICAgICBFVkVOVFM6IHtcbiAgICAgICAgU0VMRUNURURfVVBEQVRFRDogJ25vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd246c2VsZWN0ZWRVcGRhdGVkJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBQRVJTT05fUElDS0VSOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFERF9VU0VSOiAnYWRkUGlja2VkVXNlcicsXG4gICAgICAgIFJFTU9WRV9VU0VSOiAncmVtb3ZlUGlja2VkVXNlcicsXG4gICAgICAgIFVQREFURV9VU0VSOiAndXBkYXRlUGlja2VkVXNlcidcbiAgICAgIH0sXG4gICAgICBFVkVOVFM6IHtcbiAgICAgICAgVVNFUl9BRERFRDogJ3BlcnNvblBpY2tlcjp1c2VyQWRkZWQnLFxuICAgICAgICBVU0VSX1JFTU9WRUQ6ICdwZXJzb25QaWNrZXI6dXNlclJlbW92ZWQnLFxuICAgICAgICBVU0VSX1VQREFURUQ6ICdwZXJzb25QaWNrZXI6dXNlclVwZGF0ZWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIFRBR19MSVNUOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFERF9UQUc6ICdhZGRUYWcnLFxuICAgICAgICBSRU1PVkVfVEFHOiAncmVtb3ZlVGFnJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBUQUdfQURERUQ6ICd0ZXh0Q29tcGxldGU6dGFnQWRkZWQnLFxuICAgICAgICBUQUdfUkVNT1ZFRDogJ3RhZ0xpc3Q6dGFnUmVtb3ZlZCdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgVEVYVF9DT01QTEVURToge1xuICAgICAgQUNUSU9OUzoge1xuICAgICAgICBBRERfVEFHOiAnYWRkVGFnJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBESURfTU9VTlQ6ICd0ZXh0Q29tcGxldGU6ZGlkTW91bnQnLFxuICAgICAgICBUQUdfQURERUQ6ICd0ZXh0Q29tcGxldGU6dGFnQWRkZWQnXG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ09OU1RBTlRTO1xuICB9XG5cbiAgd2luZG93LkNPTlNUQU5UUyA9IENPTlNUQU5UUztcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfY2FsbGJhY2tzID0gW107XG5cbiAgdmFyIERpc3BhdGNoZXIgPSBfLmV4dGVuZChGdW5jdGlvbi5wcm90b3R5cGUsIHtcbiAgICByZWdpc3RlcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIF9jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cbiAgICAgIC8vIFJldHVybmluZyB0aGUgY2FsbGJhY2sncyBpbmRleCBhbGxvd3NcbiAgICAgIC8vIGV4cGxpY2l0IHJlZmVyZW5jZXMgdG8gdGhlIGNhbGxiYWNrXG4gICAgICAvLyBvdXRzaWRlIG9mIHRoZSBkaXNwYXRjaGVyXG4gICAgICByZXR1cm4gX2NhbGxiYWNrcy5sZW5ndGggLSAxO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaDogZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgICAgaWYgKF8uaXNFbXB0eShfY2FsbGJhY2tzKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gX2NhbGxiYWNrcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgX2NhbGxiYWNrc1tpXShwYXlsb2FkKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgaWYgKF9jYWxsYmFja3NbaW5kZXhdKSB7XG4gICAgICAgIF9jYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIF9jYWxsYmFja3MgPSBbXTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gRGlzcGF0Y2hlcjtcbiAgfVxuXG4gIHdpbmRvdy5EaXNwYXRjaGVyID0gRGlzcGF0Y2hlcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgRHJvcGRvd25Ub2dnbGVyTWl4aW4gPSB7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjbGFzc2VzID0gWydpY29uJywgJ25hdmJhci1pY29uJywgdGhpcy5wcm9wcy5pY29uQ2xhc3NdO1xuICAgICAgdmFyIHRvdGFsID0gdGhpcy5iYWRnZUNvdW50KCk7XG4gICAgICB2YXIgYmFkZ2UgPSBudWxsO1xuXG4gICAgICBpZiAodG90YWwgPiAwKSB7XG4gICAgICAgIGJhZGdlID0gdGhpcy5iYWRnZSh0b3RhbCk7XG4gICAgICAgIGNsYXNzZXMucHVzaCgnZ2x5cGhpY29uLWhpZ2hsaWdodCcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdGhpcy5wcm9wcy5ocmVmLCAnZGF0YS10b2dnbGUnOiBcImRyb3Bkb3duXCIsIG9uQ2xpY2s6IHRoaXMuYWNrbm93bGVkZ2V9LCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBjbGFzc2VzLmpvaW4oJyAnKX0pLCBcbiAgICAgICAgICBiYWRnZSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ2aXNpYmxlLXhzLWlubGluZVwiLCBzdHlsZTogeyAnbWFyZ2luLWxlZnQnOiAnNXB4J319LCBcbiAgICAgICAgICAgIHRoaXMucHJvcHMubGFiZWxcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gRHJvcGRvd25Ub2dnbGVyTWl4aW47XG4gIH1cblxuICB3aW5kb3cuRHJvcGRvd25Ub2dnbGVyTWl4aW4gPSBEcm9wZG93blRvZ2dsZXJNaXhpbjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIE5ld3NGZWVkU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3N0b3JlJyk7XG52YXIgTmV3c0ZlZWRVc2Vyc1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF91c2Vyc19zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBOZXdzRmVlZE1peGluID0ge1xuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0YXJnZXQgPSB0aGlzLnJlZnMuc3Bpbm5lci5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgb3B0cyA9IHRoaXMuc3Bpbm5lck9wdGlvbnMgfHwge1xuICAgICAgICBsaW5lczogMTMsXG4gICAgICAgIGxlbmd0aDogMzAsXG4gICAgICAgIHJhZGl1czogNTVcbiAgICAgIH07XG5cbiAgICAgIHZhciBzcGlubmVyID0gdGhpcy5zcGlubmVyID0gbmV3IFNwaW5uZXIob3B0cykuc3BpbigpO1xuXG4gICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3Bpbm5lci5lbCk7XG4gICAgfSxcblxuICAgIGdldFN0b3JpZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc3RvcmllczogTmV3c0ZlZWRTdG9yZS5nZXRTdG9yaWVzKCksXG4gICAgICAgIGFjdG9yczogTmV3c0ZlZWRVc2Vyc1N0b3JlLmdldFVzZXJzKClcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2VsZi5zdGF0ZS5zdG9yaWVzLmxlbmd0aCkge1xuICAgICAgICAgIHNlbGYuc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gTmV3c0ZlZWRNaXhpbjtcbiAgfVxuXG4gIHdpbmRvdy5OZXdzRmVlZE1peGluID0gTmV3c0ZlZWRNaXhpbjtcbn0pKCk7XG4iLCJ2YXIgeGhyID0gcmVxdWlyZSgnLi4veGhyJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciByck1ldGFUYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZSgncmVhZC1yYXB0b3ItdXJsJyk7XG4gIHZhciBSRUFEX1JBUFRPUl9VUkwgPSByck1ldGFUYWcgJiYgcnJNZXRhVGFnWzBdICYmIHJyTWV0YVRhZ1swXS5jb250ZW50O1xuXG4gIHZhciBfY2hhdFJvb21zID0ge307XG4gIHZhciBfc29ydEtleXMgPSBbXTtcbiAgdmFyIF9vcHRpbWlzdGljYWxseVVwZGF0ZWRDaGF0Um9vbXMgPSB7fTtcbiAgdmFyIF9kZWZlcnJlZCA9IFtdO1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcbiAgdmFyIG5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG4gIHZhciBfbm90aWZpY2F0aW9uc1N0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgJ2NoYXQ6YWNrbm93bGVkZ2UnOiBub29wLFxuXG4gICAgJ2NoYXQ6bWFya1Jvb21Bc1JlYWQnOiBmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgICB3aW5kb3cueGhyLm5vQ3NyZkdldChwYXlsb2FkLnJlYWRyYXB0b3JfdXJsKTtcblxuICAgICAgX29wdGltaXN0aWNhbGx5VXBkYXRlZENoYXRSb29tc1twYXlsb2FkLmlkXSA9IHtcbiAgICAgICAgbGFzdF9yZWFkX2F0OiBtb21lbnQoKS51bml4KClcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuZW1pdChfZGVmZXJyZWQucG9wKCkpO1xuICAgIH0sXG5cbiAgICAnY2hhdDpmZXRjaENoYXRSb29tcyc6IGZ1bmN0aW9uKHVybCkge1xuICAgICAgd2luZG93Lnhoci5nZXQodXJsLCB0aGlzLmhhbmRsZUZldGNoZWRDaGF0Um9vbXMuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGdldFVucmVhZENvdW50OiBmdW5jdGlvbihhY2tub3dsZWRnZWRBdCkge1xuICAgICAgdmFyIGNvdW50ID0gXy5jb3VudEJ5KFxuICAgICAgICBfY2hhdFJvb21zLFxuICAgICAgICBmdW5jdGlvbihlbnRyeSkge1xuICAgICAgICAgIHZhciB1cGRhdGVkID0gZW50cnkudXBkYXRlZCAtIGVudHJ5Lmxhc3RfcmVhZF9hdCA+IDU7XG5cbiAgICAgICAgICBpZiAoYWNrbm93bGVkZ2VkQXQpIHtcbiAgICAgICAgICAgIHJldHVybiB1cGRhdGVkICYmIGVudHJ5LnVwZGF0ZWQgPiBhY2tub3dsZWRnZWRBdDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gdXBkYXRlZDtcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGNvdW50LnRydWUgfHwgMDtcbiAgICB9LFxuXG4gICAgaGFuZGxlRmV0Y2hlZENoYXRSb29tczogZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNoYXRSb29tcyA9IGRhdGEuY2hhdF9yb29tcztcbiAgICAgIF9zb3J0S2V5cyA9IGRhdGEuc29ydF9rZXlzO1xuXG4gICAgICB2YXIgdXJsID0gUkVBRF9SQVBUT1JfVVJMICtcbiAgICAgICAgJy9yZWFkZXJzLycgK1xuICAgICAgICBhcHAuY3VycmVudFVzZXIoKS5nZXQoJ2lkJykgK1xuICAgICAgICAnL2FydGljbGVzPycgK1xuICAgICAgICBfLm1hcChcbiAgICAgICAgICBjaGF0Um9vbXMsXG4gICAgICAgICAgZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgcmV0dXJuICdrZXk9JyArIHIuaWRcbiAgICAgICAgICB9XG4gICAgICAgICkuam9pbignJicpO1xuXG4gICAgICB3aW5kb3cueGhyLm5vQ3NyZkdldCh1cmwsIHRoaXMuaGFuZGxlUmVhZFJhcHRvcihjaGF0Um9vbXMpKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlUmVhZFJhcHRvcjogZnVuY3Rpb24oY2hhdFJvb21zKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gcmVhZFJhcHRvckNhbGxiYWNrKGVyciwgZGF0YSkge1xuICAgICAgICBpZiAoZXJyKSB7IHJldHVybiBjb25zb2xlLmVycm9yKGVycik7IH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGF0Um9vbXMgPSBfLnJlZHVjZShcbiAgICAgICAgICBjaGF0Um9vbXMsXG4gICAgICAgICAgZnVuY3Rpb24oaCwgY2hhdFJvb20pIHtcbiAgICAgICAgICAgIGhbY2hhdFJvb20uaWRdID0gY2hhdFJvb207XG4gICAgICAgICAgICBoW2NoYXRSb29tLmlkXS5sYXN0X3JlYWRfYXQgPSAwO1xuXG4gICAgICAgICAgICByZXR1cm4gaDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHt9XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5hcHBseVJlYWRUaW1lcyhkYXRhLCBjaGF0Um9vbXMpO1xuICAgICAgICB0aGlzLnNldENoYXRSb29tcyhjaGF0Um9vbXMpO1xuICAgICAgICB0aGlzLmVtaXQoX2RlZmVycmVkLnBvcCgpKTtcbiAgICAgIH0uYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgYXBwbHlSZWFkVGltZXM6IGZ1bmN0aW9uKGRhdGEsIGNoYXRSb29tcykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgZGF0dW0gPSBkYXRhW2ldO1xuXG4gICAgICAgIGlmIChkYXR1bS5sYXN0X3JlYWRfYXQgJiYgY2hhdFJvb21zW2RhdHVtLmtleV0pIHtcbiAgICAgICAgICBjaGF0Um9vbXNbZGF0dW0ua2V5XS5sYXN0X3JlYWRfYXQgPSBkYXR1bS5sYXN0X3JlYWRfYXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0Q2hhdFJvb206IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gX2NoYXRSb29tc1tpZF07XG4gICAgfSxcblxuICAgIGdldENoYXRSb29tczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX2NoYXRSb29tcztcbiAgICB9LFxuXG4gICAgZ2V0U29ydEtleXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9zb3J0S2V5cztcbiAgICB9LFxuXG4gICAgc2V0Q2hhdFJvb21zOiBmdW5jdGlvbihjaGF0Um9vbXMpIHtcbiAgICAgIF9jaGF0Um9vbXMgPSBjaGF0Um9vbXM7XG5cbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKF9vcHRpbWlzdGljYWxseVVwZGF0ZWRDaGF0Um9vbXMpXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKF9jaGF0Um9vbXNba2V5c1tpXV0pIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXBkYXRpbmcgbGFzdCByZWFkPycpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKF9jaGF0Um9vbXNba2V5c1tpXV0pXG4gICAgICAgICAgX2NoYXRSb29tc1trZXlzW2ldXS5sYXN0X3JlYWRfYXQgPSBfb3B0aW1pc3RpY2FsbHlVcGRhdGVkQ2hhdFJvb21zW2tleXNbaV1dLmxhc3RfcmVhZF9hdDtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXBkYXRlZCBsYXN0IHJlYWQ/Jyk7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coX2NoYXRSb29tc1trZXlzW2ldXSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBfb3B0aW1pc3RpY2FsbHlVcGRhdGVkQ2hhdFJvb21zID0ge31cbiAgICB9LFxuXG4gICAgcmVtb3ZlQ2hhdFJvb206IGZ1bmN0aW9uKGlkKSB7XG4gICAgICBkZWxldGUgX2NoYXRSb29tc1tpZF1cbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsQ2hhdFJvb21zOiBmdW5jdGlvbigpIHtcbiAgICAgIF9jaGF0Um9vbXMgPSB7fTtcbiAgICB9LFxuXG4gICAgbW9zdFJlY2VudGx5VXBkYXRlZENoYXRSb29tOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChfLmtleXMoX2NoYXRSb29tcykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gXy5tYXgoXG4gICAgICAgIF8uZmlsdGVyKFxuICAgICAgICAgIF8udmFsdWVzKF9jaGF0Um9vbXMpLFxuICAgICAgICAgIGZ1bmN0aW9uIGZpbHRlclJvb21zKHJvb20pIHtcbiAgICAgICAgICAgIHJldHVybiByb29tLmlkICE9PSAoYXBwLmNoYXRSb29tIHx8IHt9KS5pZDtcbiAgICAgICAgICB9XG4gICAgICAgICksXG4gICAgICAgIGZ1bmMuZG90KCd1cGRhdGVkJylcbiAgICAgICk7XG4gICAgfSxcbiAgfSk7XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcbiAgICB2YXIgc3luYyA9IHBheWxvYWQuc3luYztcblxuICAgIGlmICghX3N0b3JlW2FjdGlvbl0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBfc3RvcmVbYWN0aW9uXShkYXRhKTtcblxuICAgIGlmIChzeW5jKSB7XG4gICAgICByZXR1cm4gX3N0b3JlLmVtaXQoZXZlbnQpO1xuICAgIH1cblxuICAgIF9kZWZlcnJlZC5wdXNoKGV2ZW50KTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfbm90aWZpY2F0aW9uc1N0b3JlO1xuICB9XG5cbiAgd2luZG93LkNoYXROb3RpZmljYXRpb25zU3RvcmUgPSBfbm90aWZpY2F0aW9uc1N0b3JlO1xufSkoKTtcbiIsInZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgLy8geyB1c2VyOiBVc2VyLCBjb2luczogTnVtYmVyIH1cbiAgdmFyIF91c2Vyc0FuZENvaW5zID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuICB2YXIgX2NvaW5Pd25lcnNoaXBTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIGFkZFVzZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB1c2VyQW5kQ29pbnMgPSBkYXRhLnVzZXJBbmRDb2lucztcblxuICAgICAgaWYgKF9zZWFyY2hVc2Vycyh1c2VyQW5kQ29pbnMudXNlcm5hbWUpICE9PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF91c2Vyc0FuZENvaW5zLnB1c2godXNlckFuZENvaW5zKTtcbiAgICB9LFxuXG4gICAgZ2V0VXNlcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFVzZXJzKGRhdGEudXNlcm5hbWUpO1xuXG4gICAgICByZXR1cm4gX3VzZXJzQW5kQ29pbnNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICBnZXRVc2VyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX3VzZXJzQW5kQ29pbnM7XG4gICAgfSxcblxuICAgIHVwZGF0ZVVzZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB1c2VyQW5kQ29pbnMgPSBkYXRhLnVzZXJBbmRDb2lucztcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hVc2Vycyh1c2VyQW5kQ29pbnMudXNlcm5hbWUpO1xuXG4gICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgX3VzZXJzQW5kQ29pbnNbaW5kZXhdID0gdXNlckFuZENvaW5zO1xuXG4gICAgICByZXR1cm4gX3VzZXJzQW5kQ29pbnNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICByZW1vdmVVc2VyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdXNlckFuZENvaW5zID0gZGF0YS51c2VyQW5kQ29pbnM7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoVXNlcnModXNlckFuZENvaW5zLnVzZXJuYW1lKTtcblxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgX3VzZXJzQW5kQ29pbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0VXNlcnM6IGZ1bmN0aW9uKHVzZXJzKSB7XG4gICAgICBfdXNlcnNBbmRDb2lucyA9IHVzZXJzO1xuICAgIH0sXG5cbiAgICByZW1vdmVBbGxVc2VyczogZnVuY3Rpb24oKSB7XG4gICAgICBfdXNlcnNBbmRDb2lucyA9IFtdO1xuICAgIH1cbiAgfSk7XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcblxuICAgIF9zdG9yZVthY3Rpb25dICYmIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuICAgIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gX3NlYXJjaFVzZXJzKHVzZXJuYW1lKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBfdXNlcnNBbmRDb2lucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciB1c2VyQW5kQ29pbnMgPSBfdXNlcnNBbmRDb2luc1tpXTtcblxuICAgICAgaWYgKHVzZXJBbmRDb2lucy51c2VybmFtZSA9PT0gdXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfY29pbk93bmVyc2hpcFN0b3JlO1xuICB9XG5cbiAgd2luZG93LkNvaW5Pd25lcnNoaXBTdG9yZSA9IF9jb2luT3duZXJzaGlwU3RvcmU7XG59KSgpO1xuIiwidmFyIHhociA9IHJlcXVpcmUoJy4uL3hocicpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX2ludGVyZXN0cyA9IFsnY29kZScsICdkZXNpZ24nXTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG5cbiAgdmFyIF9pbnRlcmVzdFN0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgYWRkSW50ZXJlc3Q6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICBpZiAoIWludGVyZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKF9pbnRlcmVzdHMuaW5kZXhPZihpbnRlcmVzdCkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgX2ludGVyZXN0cy5wdXNoKGludGVyZXN0KTtcbiAgICB9LFxuXG4gICAgZ2V0SW50ZXJlc3RzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfaW50ZXJlc3RzO1xuICAgIH0sXG5cbiAgICByZW1vdmVJbnRlcmVzdDogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIHZhciBpbmRleCA9IF9pbnRlcmVzdHMuaW5kZXhPZihpbnRlcmVzdCk7XG5cbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIF9pbnRlcmVzdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIF9pbnRlcmVzdHMucG9wKCk7XG4gICAgfSxcblxuICAgIHNldEludGVyZXN0czogZnVuY3Rpb24oaW50ZXJlc3RzKSB7XG4gICAgICBfaW50ZXJlc3RzID0gaW50ZXJlc3RzO1xuICAgIH0sXG5cbiAgICByZW1vdmVBbGxJbnRlcmVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgX2ludGVyZXN0cyA9IFsnY29kZScsICdkZXNpZ24nXTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG5cbiAgICBfc3RvcmVbYWN0aW9uXSAmJiBfc3RvcmVbYWN0aW9uXShkYXRhKTtcbiAgICBfc3RvcmUuZW1pdChldmVudCk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2ludGVyZXN0U3RvcmU7XG4gIH1cbiAgXG4gIHdpbmRvdy5JbnRlcmVzdFN0b3JlID0gX2ludGVyZXN0U3RvcmU7XG59KSgpO1xuIiwidmFyIHhociA9IHJlcXVpcmUoJy4uL3hocicpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcbnZhciBOZXdzRmVlZFVzZXJzU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3VzZXJzX3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIHJyTWV0YVRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdyZWFkLXJhcHRvci11cmwnKTtcbiAgdmFyIFJFQURfUkFQVE9SX1VSTCA9IHJyTWV0YVRhZyAmJiByck1ldGFUYWdbMF0gJiYgcnJNZXRhVGFnWzBdLmNvbnRlbnQ7XG5cbiAgdmFyIF9zdG9yaWVzID0ge307XG4gIHZhciBfb3B0aW1pc3RpY1N0b3JpZXMgPSB7fTtcbiAgdmFyIF9kZWZlcnJlZCA9IFtdO1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcblxuICB2YXIgX25ld3NGZWVkU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICBhZGRTdG9yeTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0b3J5ID0gZGF0YS5zdG9yeTtcblxuICAgICAgX3N0b3JpZXNbc3Rvcnkua2V5XSA9IHN0b3J5O1xuICAgIH0sXG5cbiAgICBhZGRTdG9yaWVzOiBmdW5jdGlvbihzdG9yaWVzKSB7XG4gICAgICBpZiAoIXN0b3JpZXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0b3JpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBzdG9yeSA9IHN0b3JpZXNbaV07XG5cbiAgICAgICAgX3N0b3JpZXNbc3Rvcnkua2V5XSA9IHN0b3J5O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBhcHBseVJlYWRUaW1lczogZnVuY3Rpb24oZGF0YSwgc3Rvcmllcykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgZGF0dW0gPSBkYXRhW2ldO1xuXG4gICAgICAgIGlmIChkYXR1bS5sYXN0X3JlYWRfYXQgJiYgc3Rvcmllc1tkYXR1bS5rZXldKSB7XG4gICAgICAgICAgc3Rvcmllc1tkYXR1bS5rZXldLmxhc3RfcmVhZF9hdCA9IGRhdHVtLmxhc3RfcmVhZF9hdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoYW5kbGVGZXRjaGVkU3RvcmllczogZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdXNlcnMgPSBkYXRhLnVzZXJzO1xuICAgICAgICB2YXIgc3RvcmllcyA9IGRhdGEuc3RvcmllcztcblxuICAgICAgICBOZXdzRmVlZFVzZXJzU3RvcmUuc2V0VXNlcnModXNlcnMpO1xuXG4gICAgICAgIHZhciB1cmwgPSBSRUFEX1JBUFRPUl9VUkwgK1xuICAgICAgICAgICcvcmVhZGVycy8nICtcbiAgICAgICAgICBhcHAuY3VycmVudFVzZXIoKS5nZXQoJ2lkJykgK1xuICAgICAgICAgICcvYXJ0aWNsZXM/JyArXG4gICAgICAgICAgXy5tYXAoXG4gICAgICAgICAgICBzdG9yaWVzLFxuICAgICAgICAgICAgZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgICByZXR1cm4gJ2tleT1TdG9yeV8nICsgcy5pZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICkuam9pbignJicpXG5cbiAgICAgICAgd2luZG93Lnhoci5ub0NzcmZHZXQodXJsLCBzZWxmLmhhbmRsZVJlYWRSYXB0b3Ioc3RvcmllcywgbWV0aG9kKSk7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgaGFuZGxlUmVhZFJhcHRvcjogZnVuY3Rpb24oc3RvcmllcywgbWV0aG9kKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiByZWFkUmFwdG9yQ2FsbGJhY2soZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RvcmllcyA9IF8ucmVkdWNlKFxuICAgICAgICAgIHN0b3JpZXMsXG4gICAgICAgICAgZnVuY3Rpb24oaGFzaCwgc3RvcnkpIHtcbiAgICAgICAgICAgIGhhc2hbc3Rvcnkua2V5XSA9IHN0b3J5O1xuICAgICAgICAgICAgaGFzaFtzdG9yeS5rZXldLmxhc3RfcmVhZF9hdCA9IDA7XG5cbiAgICAgICAgICAgIHJldHVybiBoYXNoO1xuICAgICAgICAgIH0sXG4gICAgICAgICAge31cbiAgICAgICAgKTtcblxuICAgICAgICBzZWxmLmFwcGx5UmVhZFRpbWVzKGRhdGEsIHN0b3JpZXMpO1xuICAgICAgICBzZWxmW21ldGhvZF0oc3Rvcmllcyk7XG4gICAgICAgIHNlbGYuZW1pdChfZGVmZXJyZWQucG9wKCkpO1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOmFja25vd2xlZGdlJzogZnVuY3Rpb24odGltZXN0YW1wKSB7fSxcblxuICAgICduZXdzRmVlZDpmZXRjaFN0b3JpZXMnOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgIHdpbmRvdy54aHIuZ2V0KHVybCwgdGhpcy5oYW5kbGVGZXRjaGVkU3Rvcmllcygnc2V0U3RvcmllcycpKTtcbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOmZldGNoTW9yZVN0b3JpZXMnOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgIHdpbmRvdy54aHIuZ2V0KHVybCwgdGhpcy5oYW5kbGVGZXRjaGVkU3RvcmllcygnYWRkU3RvcmllcycpKTtcbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOm1hcmtBc1JlYWQnOiBmdW5jdGlvbihzdG9yeUlkKSB7XG4gICAgICB2YXIgdXJsID0gJy91c2VyL3RyYWNraW5nLycgKyBzdG9yeUlkO1xuXG4gICAgICB3aW5kb3cueGhyLmdldCh1cmwsIHRoaXMubWFya2VkQXNSZWFkKHN0b3J5SWQpKTtcbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOm1hcmtBbGxBc1JlYWQnOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB1bnJlYWQgPSBfLmZpbHRlcihfc3RvcmllcywgZnVuY3Rpb24oc3RvcnkpIHtcbiAgICAgICAgcmV0dXJuIHN0b3J5Lmxhc3RfcmVhZF9hdCA9PSBudWxsO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB1bnJlYWQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIChmdW5jdGlvbihqKSB7XG4gICAgICAgICAgdmFyIHN0b3J5ID0gdW5yZWFkW2pdO1xuXG4gICAgICAgICAgaWYgKCFzdG9yeS5sYXN0X3JlYWRfYXQpIHtcbiAgICAgICAgICAgIC8vIHdlIGRvIGFjdHVhbGx5IHdhbnQgdGhlIGlkIGhlcmUsIG5vdCB0aGUga2V5XG4gICAgICAgICAgICB2YXIgc3RvcnlJZCA9IHN0b3J5LmlkO1xuICAgICAgICAgICAgdmFyIHVybCA9ICcvdXNlci90cmFja2luZy8nICsgc3RvcnlJZDtcblxuICAgICAgICAgICAgd2luZG93Lnhoci5nZXQodXJsLCBzZWxmLm1hcmtlZEFzUmVhZChzdG9yeUlkLCB0cnVlLCAoaiArIDEgPT09IGwpKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KShpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOm1hcmtTdG9yeUFzUmVhZCc6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBzdG9yeUlkID0gZGF0YS5rZXk7XG4gICAgICB2YXIgdXJsID0gZGF0YS5yZWFkcmFwdG9yX3VybDtcblxuICAgICAgd2luZG93Lnhoci5ub0NzcmZHZXQodXJsKTtcblxuICAgICAgX29wdGltaXN0aWNTdG9yaWVzW3N0b3J5SWRdID0ge1xuICAgICAgICBsYXN0X3JlYWRfYXQ6IG1vbWVudCgpLnVuaXgoKVxuICAgICAgfTtcblxuICAgICAgdGhpcy5lbWl0KF9kZWZlcnJlZC5wb3AoKSk7XG4gICAgfSxcblxuICAgIG1hcmtlZEFzUmVhZDogZnVuY3Rpb24oc3RvcnlJZCwgd2FpdCwgcmVhZHkpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIG1hcmtlZEFzUmVhZChlcnIsIGRhdGEpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3RvcnkgPSBzZWxmLmdldFN0b3J5KHN0b3J5SWQpO1xuXG4gICAgICAgIC8vIEZJWE1FOiBVc2UgdGhlIHZhbHVlIGZyb20gUmVhZHJhcHRvclxuICAgICAgICBzdG9yeS5sYXN0X3JlYWRfYXQgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICAgICAgaWYgKCF3YWl0KSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuZW1pdChfZGVmZXJyZWQucG9wKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRklYTUU6IFdlIHJlYWxseSBuZWVkIGEgcHJvcGVyIGV2ZW50IGVtaXR0ZXJcbiAgICAgICAgaWYgKHJlYWR5KSB7XG4gICAgICAgICAgc2VsZi5lbWl0KF9kZWZlcnJlZC5wb3AoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5lbWl0KF9kZWZlcnJlZFtfZGVmZXJyZWQubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFN0b3J5OiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFN0b3JpZXMoaWQpO1xuXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICByZXR1cm4gX3N0b3JpZXNbaW5kZXhdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgZ2V0U3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3RvcmllcyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpIGluIF9zdG9yaWVzKSB7XG4gICAgICAgIHN0b3JpZXMucHVzaChfc3Rvcmllc1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdG9yaWVzO1xuICAgIH0sXG5cbiAgICBnZXRVbnJlYWRDb3VudDogZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgICB2YXIgY291bnQgPSBfLmNvdW50QnkoXG4gICAgICAgIF9zdG9yaWVzLFxuICAgICAgICBmdW5jdGlvbihlbnRyeSkge1xuICAgICAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRyeS51cGRhdGVkID4gdGltZXN0YW1wXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICByZXR1cm4gY291bnQudHJ1ZSB8fCAwO1xuICAgIH0sXG5cbiAgICBzZXRTdG9yaWVzOiBmdW5jdGlvbihzdG9yaWVzKSB7XG4gICAgICBmb3IgKHZhciBzdG9yeSBpbiBfb3B0aW1pc3RpY1N0b3JpZXMpIHtcbiAgICAgICAgaWYgKHN0b3JpZXMuaGFzT3duUHJvcGVydHkoc3RvcnkpKSB7XG4gICAgICAgICAgc3Rvcmllc1tzdG9yeV0ubGFzdF9yZWFkX2F0ID0gX29wdGltaXN0aWNTdG9yaWVzW3N0b3J5XS5sYXN0X3JlYWRfYXQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgX29wdGltaXN0aWNTdG9yaWVzID0ge307XG5cbiAgICAgIF9zdG9yaWVzID0gc3RvcmllcztcbiAgICB9LFxuXG4gICAgcmVtb3ZlU3Rvcnk6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoU3RvcmllcyhpZCk7XG5cbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIF9zdG9yaWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbFN0b3JpZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgX3N0b3JpZXMgPSBbXTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zZWFyY2hTdG9yaWVzID0gZnVuY3Rpb24oaWQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IF9zdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKF9zdG9yaWVzW2ldLmlkID09PSBpZCkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuICAgIHZhciBzeW5jID0gcGF5bG9hZC5zeW5jO1xuXG4gICAgaWYgKCFfc3RvcmVbYWN0aW9uXSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuXG4gICAgaWYgKHN5bmMpIHtcbiAgICAgIHJldHVybiBfc3RvcmUuZW1pdChldmVudCk7XG4gICAgfVxuXG4gICAgX2RlZmVycmVkLnB1c2goZXZlbnQpO1xuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9uZXdzRmVlZFN0b3JlO1xuICB9XG4gIFxuICB3aW5kb3cuTmV3c0ZlZWRTdG9yZSA9IF9uZXdzRmVlZFN0b3JlO1xufSkoKTtcbiIsInZhciB4aHIgPSByZXF1aXJlKCcuLi94aHInKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF91c2VycyA9IHt9O1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcblxuICB2YXIgX25ld3NGZWVkVXNlcnNTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIHNldFVzZXJzOiBmdW5jdGlvbih1c2Vycykge1xuICAgICAgX3VzZXJzID0gdXNlcnM7XG4gICAgfSxcblxuICAgIGFkZFVzZXJzOiBmdW5jdGlvbih1c2Vycykge1xuICAgICAgZm9yICh2YXIgdXNlciBpbiB1c2Vycykge1xuICAgICAgICBpZiAoIV91c2Vycy5oYXNPd25Qcm9wZXJ0eSh1c2VyKSkge1xuICAgICAgICAgIF91c2Vyc1t1c2VyXSA9IHVzZXJzW3VzZXJdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFVzZXJzOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIF91c2VycztcbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsVXNlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgX3VzZXJzID0gW107XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9uZXdzRmVlZFVzZXJzU3RvcmU7XG4gIH1cblxuICB3aW5kb3cuTmV3c0ZlZWRVc2Vyc1N0b3JlID0gX25ld3NGZWVkVXNlcnNTdG9yZTtcbn0pKCk7XG4iLCJ2YXIgeGhyID0gcmVxdWlyZSgnLi4veGhyJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfc2VsZWN0ZWQ7XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuXG4gIHZhciBfZHJvcGRvd25TdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIHVwZGF0ZVNlbGVjdGVkOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXRlbSA9IGRhdGEuaXRlbTtcbiAgICAgIHZhciBwYXRoID0gZGF0YS5wYXRoO1xuXG4gICAgICB3aW5kb3cueGhyLnBvc3QocGF0aCk7XG5cbiAgICAgIF9zZWxlY3RlZCA9IGl0ZW07XG4gICAgfSxcblxuICAgIGdldFNlbGVjdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfc2VsZWN0ZWQ7XG4gICAgfSxcblxuICAgIHNldFNlbGVjdGVkOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICBfc2VsZWN0ZWQgPSBpdGVtO1xuICAgIH0sXG5cbiAgICByZW1vdmVTZWxlY3RlZDogZnVuY3Rpb24oKSB7XG4gICAgICBfc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9KTtcblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuXG4gICAgaWYgKCFfc3RvcmVbYWN0aW9uXSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIF9zdG9yZVthY3Rpb25dICYmIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuICAgIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfZHJvcGRvd25TdG9yZTtcbiAgfVxuICBcbiAgd2luZG93Lk5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd25TdG9yZSA9IF9kcm9wZG93blN0b3JlO1xufSkoKTtcbiIsInZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9wZW9wbGUgPSBbXTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG4gIHZhciBfcGVvcGxlU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIucmVtb3ZlKGRpc3BhdGNoSW5kZXgpO1xuICAgIH0sXG5cbiAgICBzZXRQZW9wbGU6IGZ1bmN0aW9uKHBlb3BsZSkge1xuICAgICAgX3Blb3BsZSA9IHBlb3BsZTtcbiAgICB9LFxuXG4gICAgZ2V0UGVvcGxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfcGVvcGxlO1xuICAgIH0sXG5cbiAgICBnZXRQZXJzb246IGZ1bmN0aW9uKHVzZXJuYW1lKSB7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoUGVvcGxlKHVzZXJuYW1lKTtcblxuICAgICAgcmV0dXJuIF9wZW9wbGVbaW5kZXhdO1xuICAgIH0sXG5cbiAgICBhZGRQZXJzb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIF9wZW9wbGUucHVzaChkYXRhLnVzZXIpO1xuXG4gICAgICByZXR1cm4gdGhpcy5nZXRQZW9wbGUoKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlUGVyc29uOiBmdW5jdGlvbih1c2VybmFtZSkge1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFBlb3BsZSh1c2VybmFtZSk7XG5cbiAgICAgIF9wZW9wbGUuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0UGVvcGxlKCk7XG4gICAgfVxuICB9KTtcblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuXG4gICAgX3N0b3JlW2FjdGlvbl0gJiYgX3N0b3JlW2FjdGlvbl0oZGF0YSk7XG4gICAgX3N0b3JlLmVtaXQoZXZlbnQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBfc2VhcmNoUGVvcGxlKHVzZXJuYW1lKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBfcGVvcGxlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKF9wZW9wbGVbaV0udXNlci51c2VybmFtZSA9PT0gdXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfcGVvcGxlU3RvcmU7XG4gIH1cbiAgXG4gIHdpbmRvdy5QZW9wbGVTdG9yZSA9IF9wZW9wbGVTdG9yZTtcbn0pKCk7XG4iLCJ2YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfcGVvcGxlID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuICB2YXIgX3BlcnNvblBpY2tlclN0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgYWRkUGVyc29uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdXNlciA9IGRhdGEudXNlcjtcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChfc2VhcmNoUGVvcGxlKHVzZXIudXNlcm5hbWUpICE9PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF9wZW9wbGUucHVzaCh1c2VyKTtcbiAgICB9LFxuXG4gICAgZ2V0UGVyc29uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoUGVvcGxlKGRhdGEudXNlci51c2VybmFtZSk7XG5cbiAgICAgIHJldHVybiBfcGVvcGxlW2luZGV4XTtcbiAgICB9LFxuXG4gICAgZ2V0UGVvcGxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfcGVvcGxlO1xuICAgIH0sXG5cbiAgICB1cGRhdGVQZXJzb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB1c2VyID0gZGF0YS51c2VyO1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFBlb3BsZSh1c2VyLnVzZXJuYW1lKTtcblxuICAgICAgX3Blb3BsZVtpbmRleF0gPSB1c2VyO1xuXG4gICAgICByZXR1cm4gX3Blb3BsZVtpbmRleF07XG4gICAgfSxcblxuICAgIHJlbW92ZVBlcnNvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHVzZXIgPSBkYXRhLnVzZXI7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoUGVvcGxlKHVzZXIudXNlcm5hbWUpO1xuXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBfcGVvcGxlLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldFBlb3BsZTogZnVuY3Rpb24odXNlcnMpIHtcbiAgICAgIF9wZW9wbGUgPSB1c2VycztcbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsUGVvcGxlOiBmdW5jdGlvbigpIHtcbiAgICAgIF9wZW9wbGUgPSBbXTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG5cbiAgICBfc3RvcmVbYWN0aW9uXSAmJiBfc3RvcmVbYWN0aW9uXShkYXRhKTtcbiAgICBfc3RvcmUuZW1pdChldmVudCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIF9zZWFyY2hQZW9wbGUodXNlcm5hbWUpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IF9wZW9wbGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgdXNlciA9IF9wZW9wbGVbaV07XG5cbiAgICAgIGlmICh1c2VyLnVzZXJuYW1lID09PSB1c2VybmFtZSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9wZXJzb25QaWNrZXJTdG9yZTtcbiAgfVxuXG4gIHdpbmRvdy5QZXJzb25QaWNrZXJTdG9yZSA9IF9wZXJzb25QaWNrZXJTdG9yZTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBTdG9yZSA9IF8uZXh0ZW5kKHt9LCB7XG4gICAgZW1pdDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBjYWxsYmFja3MgPSB0aGlzLmxpc3RlbmVycztcblxuICAgICAgaWYgKCFfLmlzRW1wdHkoY2FsbGJhY2tzKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBjYWxsYmFja3NbaV0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhZGRDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMgfHwgW107XG4gICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcblxuICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzLmxlbmd0aCAtIDE7XG4gICAgfSxcblxuICAgIHJlbW92ZUNoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihldmVudEluZGV4KSB7XG4gICAgICBpZiAodGhpcy5saXN0ZW5lcnMgJiYgdGhpcy5saXN0ZW5lcnNbZXZlbnRJbmRleF0pIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuc3BsaWNlKGV2ZW50SW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTdG9yZTtcbiAgfVxuXG4gIHdpbmRvdy5TdG9yZSA9IFN0b3JlO1xufSkoKTtcbiIsInZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF90YWdzID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuICB2YXIgX3RhZ0xpc3RTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIGFkZFRhZzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHRhZyA9IGRhdGEudGFnO1xuICAgICAgdmFyIHVybCA9IGRhdGEudXJsO1xuXG4gICAgICAvLyBXZSBkb24ndCB3YW50IGR1cGxpY2F0ZSB0YWdzXG4gICAgICBpZiAoX3NlYXJjaFRhZ3ModGFnKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfdGFncy5wdXNoKHRhZyk7XG5cbiAgICAgIHRoaXMucGVyc2lzdCh1cmwpO1xuICAgIH0sXG5cbiAgICBzZXRUYWdzOiBmdW5jdGlvbih0YWdzKSB7XG4gICAgICBfdGFncyA9IHRhZ3M7XG4gICAgfSxcblxuICAgIGdldFRhZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF90YWdzXG4gICAgfSxcblxuICAgIHJlbW92ZVRhZzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHRhZyA9IGRhdGEudGFnO1xuICAgICAgdmFyIHVybCA9IGRhdGEudXJsO1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFRhZ3ModGFnKTtcblxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgX3RhZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHVybCkge1xuICAgICAgICB0aGlzLnBlcnNpc3QodXJsKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcGVyc2lzdDogZnVuY3Rpb24odXJsKSB7XG4gICAgICBpZiAoIXVybCkgcmV0dXJuO1xuXG4gICAgICB2YXIgdGFncyA9IHRoaXMuZ2V0VGFncygpO1xuXG4gICAgICBpZiAoXy5pc0VtcHR5KHRhZ3MpKSB7XG4gICAgICAgIHRhZ3MgPSBbJyddO1xuICAgICAgfVxuXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgdGFzazoge1xuICAgICAgICAgICAgdGFnX2xpc3Q6IHRhZ3NcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB9LFxuXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbihqcXhociwgc3RhdHVzKSB7XG4gICAgICAgICAgY29uc29sZS5kaXIoc3RhdHVzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbFRhZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgX3RhZ3MgPSBbXTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG5cbiAgICBfc3RvcmVbYWN0aW9uXSAmJiBfc3RvcmVbYWN0aW9uXShkYXRhKTtcbiAgICBfc3RvcmUuZW1pdChldmVudCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIF9zZWFyY2hUYWdzKHRhZykge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gX3RhZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoX3RhZ3NbaV0gPT09IHRhZykge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3RhZ0xpc3RTdG9yZTtcbiAgfVxuXG4gIHdpbmRvdy5UYWdMaXN0U3RvcmUgPSBfdGFnTGlzdFN0b3JlO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIHhociA9IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKHBhdGgsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLnJlcXVlc3QoJ0dFVCcsIHBhdGgsIG51bGwsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgbm9Dc3JmR2V0OiBmdW5jdGlvbihwYXRoLCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5ub0NzcmZSZXF1ZXN0KCdHRVQnLCBwYXRoLCBudWxsLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIHBvc3Q6IGZ1bmN0aW9uKHBhdGgsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLnJlcXVlc3QoJ1BPU1QnLCBwYXRoLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKG1ldGhvZCwgcGF0aCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBwYXRoLCB0cnVlKTtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignWC1DU1JGLVRva2VuJywgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoJ2NzcmYtdG9rZW4nKVswXS5jb250ZW50KTtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHJlcXVlc3Quc2VuZChkYXRhKTtcblxuICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbm9Dc3JmUmVxdWVzdDogZnVuY3Rpb24obWV0aG9kLCBwYXRoLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkge307XG4gICAgICB9XG5cbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHJlcXVlc3Qub3BlbihtZXRob2QsIHBhdGgsIHRydWUpO1xuICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmVxdWVzdC5zZW5kKGRhdGEpO1xuXG4gICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0geGhyO1xuICB9XG5cbiAgd2luZG93LnhociA9IHhocjtcbn0pKCk7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0IEZlbGl4IEduYXNzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblxuICAvKiBDb21tb25KUyAqL1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcpICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKVxuXG4gIC8qIEFNRCBtb2R1bGUgKi9cbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShmYWN0b3J5KVxuXG4gIC8qIEJyb3dzZXIgZ2xvYmFsICovXG4gIGVsc2Ugcm9vdC5TcGlubmVyID0gZmFjdG9yeSgpXG59XG4odGhpcywgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBwcmVmaXhlcyA9IFsnd2Via2l0JywgJ01veicsICdtcycsICdPJ10gLyogVmVuZG9yIHByZWZpeGVzICovXG4gICAgLCBhbmltYXRpb25zID0ge30gLyogQW5pbWF0aW9uIHJ1bGVzIGtleWVkIGJ5IHRoZWlyIG5hbWUgKi9cbiAgICAsIHVzZUNzc0FuaW1hdGlvbnMgLyogV2hldGhlciB0byB1c2UgQ1NTIGFuaW1hdGlvbnMgb3Igc2V0VGltZW91dCAqL1xuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBlbGVtZW50cy4gSWYgbm8gdGFnIG5hbWUgaXMgZ2l2ZW4sXG4gICAqIGEgRElWIGlzIGNyZWF0ZWQuIE9wdGlvbmFsbHkgcHJvcGVydGllcyBjYW4gYmUgcGFzc2VkLlxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlRWwodGFnLCBwcm9wKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcgfHwgJ2RpdicpXG4gICAgICAsIG5cblxuICAgIGZvcihuIGluIHByb3ApIGVsW25dID0gcHJvcFtuXVxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgY2hpbGRyZW4gYW5kIHJldHVybnMgdGhlIHBhcmVudC5cbiAgICovXG4gIGZ1bmN0aW9uIGlucyhwYXJlbnQgLyogY2hpbGQxLCBjaGlsZDIsIC4uLiovKSB7XG4gICAgZm9yICh2YXIgaT0xLCBuPWFyZ3VtZW50cy5sZW5ndGg7IGk8bjsgaSsrKVxuICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGFyZ3VtZW50c1tpXSlcblxuICAgIHJldHVybiBwYXJlbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBuZXcgc3R5bGVzaGVldCB0byBob2xkIHRoZSBAa2V5ZnJhbWUgb3IgVk1MIHJ1bGVzLlxuICAgKi9cbiAgdmFyIHNoZWV0ID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbCA9IGNyZWF0ZUVsKCdzdHlsZScsIHt0eXBlIDogJ3RleHQvY3NzJ30pXG4gICAgaW5zKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sIGVsKVxuICAgIHJldHVybiBlbC5zaGVldCB8fCBlbC5zdHlsZVNoZWV0XG4gIH0oKSlcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvcGFjaXR5IGtleWZyYW1lIGFuaW1hdGlvbiBydWxlIGFuZCByZXR1cm5zIGl0cyBuYW1lLlxuICAgKiBTaW5jZSBtb3N0IG1vYmlsZSBXZWJraXRzIGhhdmUgdGltaW5nIGlzc3VlcyB3aXRoIGFuaW1hdGlvbi1kZWxheSxcbiAgICogd2UgY3JlYXRlIHNlcGFyYXRlIHJ1bGVzIGZvciBlYWNoIGxpbmUvc2VnbWVudC5cbiAgICovXG4gIGZ1bmN0aW9uIGFkZEFuaW1hdGlvbihhbHBoYSwgdHJhaWwsIGksIGxpbmVzKSB7XG4gICAgdmFyIG5hbWUgPSBbJ29wYWNpdHknLCB0cmFpbCwgfn4oYWxwaGEqMTAwKSwgaSwgbGluZXNdLmpvaW4oJy0nKVxuICAgICAgLCBzdGFydCA9IDAuMDEgKyBpL2xpbmVzICogMTAwXG4gICAgICAsIHogPSBNYXRoLm1heCgxIC0gKDEtYWxwaGEpIC8gdHJhaWwgKiAoMTAwLXN0YXJ0KSwgYWxwaGEpXG4gICAgICAsIHByZWZpeCA9IHVzZUNzc0FuaW1hdGlvbnMuc3Vic3RyaW5nKDAsIHVzZUNzc0FuaW1hdGlvbnMuaW5kZXhPZignQW5pbWF0aW9uJykpLnRvTG93ZXJDYXNlKClcbiAgICAgICwgcHJlID0gcHJlZml4ICYmICctJyArIHByZWZpeCArICctJyB8fCAnJ1xuXG4gICAgaWYgKCFhbmltYXRpb25zW25hbWVdKSB7XG4gICAgICBzaGVldC5pbnNlcnRSdWxlKFxuICAgICAgICAnQCcgKyBwcmUgKyAna2V5ZnJhbWVzICcgKyBuYW1lICsgJ3snICtcbiAgICAgICAgJzAle29wYWNpdHk6JyArIHogKyAnfScgK1xuICAgICAgICBzdGFydCArICcle29wYWNpdHk6JyArIGFscGhhICsgJ30nICtcbiAgICAgICAgKHN0YXJ0KzAuMDEpICsgJyV7b3BhY2l0eToxfScgK1xuICAgICAgICAoc3RhcnQrdHJhaWwpICUgMTAwICsgJyV7b3BhY2l0eTonICsgYWxwaGEgKyAnfScgK1xuICAgICAgICAnMTAwJXtvcGFjaXR5OicgKyB6ICsgJ30nICtcbiAgICAgICAgJ30nLCBzaGVldC5jc3NSdWxlcy5sZW5ndGgpXG5cbiAgICAgIGFuaW1hdGlvbnNbbmFtZV0gPSAxXG4gICAgfVxuXG4gICAgcmV0dXJuIG5hbWVcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB2YXJpb3VzIHZlbmRvciBwcmVmaXhlcyBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgc3VwcG9ydGVkIHByb3BlcnR5LlxuICAgKi9cbiAgZnVuY3Rpb24gdmVuZG9yKGVsLCBwcm9wKSB7XG4gICAgdmFyIHMgPSBlbC5zdHlsZVxuICAgICAgLCBwcFxuICAgICAgLCBpXG5cbiAgICBwcm9wID0gcHJvcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSlcbiAgICBmb3IoaT0wOyBpPHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwcCA9IHByZWZpeGVzW2ldK3Byb3BcbiAgICAgIGlmKHNbcHBdICE9PSB1bmRlZmluZWQpIHJldHVybiBwcFxuICAgIH1cbiAgICBpZihzW3Byb3BdICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wXG4gIH1cblxuICAvKipcbiAgICogU2V0cyBtdWx0aXBsZSBzdHlsZSBwcm9wZXJ0aWVzIGF0IG9uY2UuXG4gICAqL1xuICBmdW5jdGlvbiBjc3MoZWwsIHByb3ApIHtcbiAgICBmb3IgKHZhciBuIGluIHByb3ApXG4gICAgICBlbC5zdHlsZVt2ZW5kb3IoZWwsIG4pfHxuXSA9IHByb3Bbbl1cblxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgLyoqXG4gICAqIEZpbGxzIGluIGRlZmF1bHQgdmFsdWVzLlxuICAgKi9cbiAgZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gICAgZm9yICh2YXIgaT0xOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVmID0gYXJndW1lbnRzW2ldXG4gICAgICBmb3IgKHZhciBuIGluIGRlZilcbiAgICAgICAgaWYgKG9ialtuXSA9PT0gdW5kZWZpbmVkKSBvYmpbbl0gPSBkZWZbbl1cbiAgICB9XG4gICAgcmV0dXJuIG9ialxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFic29sdXRlIHBhZ2Utb2Zmc2V0IG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gcG9zKGVsKSB7XG4gICAgdmFyIG8gPSB7IHg6ZWwub2Zmc2V0TGVmdCwgeTplbC5vZmZzZXRUb3AgfVxuICAgIHdoaWxlKChlbCA9IGVsLm9mZnNldFBhcmVudCkpXG4gICAgICBvLngrPWVsLm9mZnNldExlZnQsIG8ueSs9ZWwub2Zmc2V0VG9wXG5cbiAgICByZXR1cm4gb1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxpbmUgY29sb3IgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nIG9yIGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Q29sb3IoY29sb3IsIGlkeCkge1xuICAgIHJldHVybiB0eXBlb2YgY29sb3IgPT0gJ3N0cmluZycgPyBjb2xvciA6IGNvbG9yW2lkeCAlIGNvbG9yLmxlbmd0aF1cbiAgfVxuXG4gIC8vIEJ1aWx0LWluIGRlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGxpbmVzOiAxMiwgICAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICBsZW5ndGg6IDcsICAgICAgICAgICAgLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcbiAgICB3aWR0aDogNSwgICAgICAgICAgICAgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgcmFkaXVzOiAxMCwgICAgICAgICAgIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgIHJvdGF0ZTogMCwgICAgICAgICAgICAvLyBSb3RhdGlvbiBvZmZzZXRcbiAgICBjb3JuZXJzOiAxLCAgICAgICAgICAgLy8gUm91bmRuZXNzICgwLi4xKVxuICAgIGNvbG9yOiAnIzAwMCcsICAgICAgICAvLyAjcmdiIG9yICNycmdnYmJcbiAgICBkaXJlY3Rpb246IDEsICAgICAgICAgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgIHNwZWVkOiAxLCAgICAgICAgICAgICAvLyBSb3VuZHMgcGVyIHNlY29uZFxuICAgIHRyYWlsOiAxMDAsICAgICAgICAgICAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxuICAgIG9wYWNpdHk6IDEvNCwgICAgICAgICAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xuICAgIGZwczogMjAsICAgICAgICAgICAgICAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKVxuICAgIHpJbmRleDogMmU5LCAgICAgICAgICAvLyBVc2UgYSBoaWdoIHotaW5kZXggYnkgZGVmYXVsdFxuICAgIGNsYXNzTmFtZTogJ3NwaW5uZXInLCAvLyBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBlbGVtZW50XG4gICAgdG9wOiAnNTAlJywgICAgICAgICAgIC8vIGNlbnRlciB2ZXJ0aWNhbGx5XG4gICAgbGVmdDogJzUwJScsICAgICAgICAgIC8vIGNlbnRlciBob3Jpem9udGFsbHlcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyAgLy8gZWxlbWVudCBwb3NpdGlvblxuICB9XG5cbiAgLyoqIFRoZSBjb25zdHJ1Y3RvciAqL1xuICBmdW5jdGlvbiBTcGlubmVyKG8pIHtcbiAgICB0aGlzLm9wdHMgPSBtZXJnZShvIHx8IHt9LCBTcGlubmVyLmRlZmF1bHRzLCBkZWZhdWx0cylcbiAgfVxuXG4gIC8vIEdsb2JhbCBkZWZhdWx0cyB0aGF0IG92ZXJyaWRlIHRoZSBidWlsdC1pbnM6XG4gIFNwaW5uZXIuZGVmYXVsdHMgPSB7fVxuXG4gIG1lcmdlKFNwaW5uZXIucHJvdG90eXBlLCB7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBzcGlubmVyIHRvIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudC4gSWYgdGhpcyBpbnN0YW5jZSBpcyBhbHJlYWR5XG4gICAgICogc3Bpbm5pbmcsIGl0IGlzIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBmcm9tIGl0cyBwcmV2aW91cyB0YXJnZXQgYiBjYWxsaW5nXG4gICAgICogc3RvcCgpIGludGVybmFsbHkuXG4gICAgICovXG4gICAgc3BpbjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICB0aGlzLnN0b3AoKVxuXG4gICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgLCBvID0gc2VsZi5vcHRzXG4gICAgICAgICwgZWwgPSBzZWxmLmVsID0gY3NzKGNyZWF0ZUVsKDAsIHtjbGFzc05hbWU6IG8uY2xhc3NOYW1lfSksIHtwb3NpdGlvbjogby5wb3NpdGlvbiwgd2lkdGg6IDAsIHpJbmRleDogby56SW5kZXh9KVxuICAgICAgICAsIG1pZCA9IG8ucmFkaXVzK28ubGVuZ3RoK28ud2lkdGhcblxuICAgICAgY3NzKGVsLCB7XG4gICAgICAgIGxlZnQ6IG8ubGVmdCxcbiAgICAgICAgdG9wOiBvLnRvcFxuICAgICAgfSlcbiAgICAgICAgXG4gICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5maXJzdENoaWxkfHxudWxsKVxuICAgICAgfVxuXG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAncHJvZ3Jlc3NiYXInKVxuICAgICAgc2VsZi5saW5lcyhlbCwgc2VsZi5vcHRzKVxuXG4gICAgICBpZiAoIXVzZUNzc0FuaW1hdGlvbnMpIHtcbiAgICAgICAgLy8gTm8gQ1NTIGFuaW1hdGlvbiBzdXBwb3J0LCB1c2Ugc2V0VGltZW91dCgpIGluc3RlYWRcbiAgICAgICAgdmFyIGkgPSAwXG4gICAgICAgICAgLCBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDJcbiAgICAgICAgICAsIGFscGhhXG4gICAgICAgICAgLCBmcHMgPSBvLmZwc1xuICAgICAgICAgICwgZiA9IGZwcy9vLnNwZWVkXG4gICAgICAgICAgLCBvc3RlcCA9ICgxLW8ub3BhY2l0eSkgLyAoZipvLnRyYWlsIC8gMTAwKVxuICAgICAgICAgICwgYXN0ZXAgPSBmL28ubGluZXNcblxuICAgICAgICA7KGZ1bmN0aW9uIGFuaW0oKSB7XG4gICAgICAgICAgaSsrO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgby5saW5lczsgaisrKSB7XG4gICAgICAgICAgICBhbHBoYSA9IE1hdGgubWF4KDEgLSAoaSArIChvLmxpbmVzIC0gaikgKiBhc3RlcCkgJSBmICogb3N0ZXAsIG8ub3BhY2l0eSlcblxuICAgICAgICAgICAgc2VsZi5vcGFjaXR5KGVsLCBqICogby5kaXJlY3Rpb24gKyBzdGFydCwgYWxwaGEsIG8pXG4gICAgICAgICAgfVxuICAgICAgICAgIHNlbGYudGltZW91dCA9IHNlbGYuZWwgJiYgc2V0VGltZW91dChhbmltLCB+figxMDAwL2ZwcykpXG4gICAgICAgIH0pKClcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxmXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGFuZCByZW1vdmVzIHRoZSBTcGlubmVyLlxuICAgICAqL1xuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVsID0gdGhpcy5lbFxuICAgICAgaWYgKGVsKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICAgIGlmIChlbC5wYXJlbnROb2RlKSBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxuICAgICAgICB0aGlzLmVsID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBtZXRob2QgdGhhdCBkcmF3cyB0aGUgaW5kaXZpZHVhbCBsaW5lcy4gV2lsbCBiZSBvdmVyd3JpdHRlblxuICAgICAqIGluIFZNTCBmYWxsYmFjayBtb2RlIGJlbG93LlxuICAgICAqL1xuICAgIGxpbmVzOiBmdW5jdGlvbihlbCwgbykge1xuICAgICAgdmFyIGkgPSAwXG4gICAgICAgICwgc3RhcnQgPSAoby5saW5lcyAtIDEpICogKDEgLSBvLmRpcmVjdGlvbikgLyAyXG4gICAgICAgICwgc2VnXG5cbiAgICAgIGZ1bmN0aW9uIGZpbGwoY29sb3IsIHNoYWRvdykge1xuICAgICAgICByZXR1cm4gY3NzKGNyZWF0ZUVsKCksIHtcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICB3aWR0aDogKG8ubGVuZ3RoK28ud2lkdGgpICsgJ3B4JyxcbiAgICAgICAgICBoZWlnaHQ6IG8ud2lkdGggKyAncHgnLFxuICAgICAgICAgIGJhY2tncm91bmQ6IGNvbG9yLFxuICAgICAgICAgIGJveFNoYWRvdzogc2hhZG93LFxuICAgICAgICAgIHRyYW5zZm9ybU9yaWdpbjogJ2xlZnQnLFxuICAgICAgICAgIHRyYW5zZm9ybTogJ3JvdGF0ZSgnICsgfn4oMzYwL28ubGluZXMqaStvLnJvdGF0ZSkgKyAnZGVnKSB0cmFuc2xhdGUoJyArIG8ucmFkaXVzKydweCcgKycsMCknLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogKG8uY29ybmVycyAqIG8ud2lkdGg+PjEpICsgJ3B4J1xuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBmb3IgKDsgaSA8IG8ubGluZXM7IGkrKykge1xuICAgICAgICBzZWcgPSBjc3MoY3JlYXRlRWwoKSwge1xuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIHRvcDogMSt+KG8ud2lkdGgvMikgKyAncHgnLFxuICAgICAgICAgIHRyYW5zZm9ybTogby5od2FjY2VsID8gJ3RyYW5zbGF0ZTNkKDAsMCwwKScgOiAnJyxcbiAgICAgICAgICBvcGFjaXR5OiBvLm9wYWNpdHksXG4gICAgICAgICAgYW5pbWF0aW9uOiB1c2VDc3NBbmltYXRpb25zICYmIGFkZEFuaW1hdGlvbihvLm9wYWNpdHksIG8udHJhaWwsIHN0YXJ0ICsgaSAqIG8uZGlyZWN0aW9uLCBvLmxpbmVzKSArICcgJyArIDEvby5zcGVlZCArICdzIGxpbmVhciBpbmZpbml0ZSdcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoby5zaGFkb3cpIGlucyhzZWcsIGNzcyhmaWxsKCcjMDAwJywgJzAgMCA0cHggJyArICcjMDAwJyksIHt0b3A6IDIrJ3B4J30pKVxuICAgICAgICBpbnMoZWwsIGlucyhzZWcsIGZpbGwoZ2V0Q29sb3Ioby5jb2xvciwgaSksICcwIDAgMXB4IHJnYmEoMCwwLDAsLjEpJykpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IGFkanVzdHMgdGhlIG9wYWNpdHkgb2YgYSBzaW5nbGUgbGluZS5cbiAgICAgKiBXaWxsIGJlIG92ZXJ3cml0dGVuIGluIFZNTCBmYWxsYmFjayBtb2RlIGJlbG93LlxuICAgICAqL1xuICAgIG9wYWNpdHk6IGZ1bmN0aW9uKGVsLCBpLCB2YWwpIHtcbiAgICAgIGlmIChpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGgpIGVsLmNoaWxkTm9kZXNbaV0uc3R5bGUub3BhY2l0eSA9IHZhbFxuICAgIH1cblxuICB9KVxuXG5cbiAgZnVuY3Rpb24gaW5pdFZNTCgpIHtcblxuICAgIC8qIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgVk1MIHRhZyAqL1xuICAgIGZ1bmN0aW9uIHZtbCh0YWcsIGF0dHIpIHtcbiAgICAgIHJldHVybiBjcmVhdGVFbCgnPCcgKyB0YWcgKyAnIHhtbG5zPVwidXJuOnNjaGVtYXMtbWljcm9zb2Z0LmNvbTp2bWxcIiBjbGFzcz1cInNwaW4tdm1sXCI+JywgYXR0cilcbiAgICB9XG5cbiAgICAvLyBObyBDU1MgdHJhbnNmb3JtcyBidXQgVk1MIHN1cHBvcnQsIGFkZCBhIENTUyBydWxlIGZvciBWTUwgZWxlbWVudHM6XG4gICAgc2hlZXQuYWRkUnVsZSgnLnNwaW4tdm1sJywgJ2JlaGF2aW9yOnVybCgjZGVmYXVsdCNWTUwpJylcblxuICAgIFNwaW5uZXIucHJvdG90eXBlLmxpbmVzID0gZnVuY3Rpb24oZWwsIG8pIHtcbiAgICAgIHZhciByID0gby5sZW5ndGgrby53aWR0aFxuICAgICAgICAsIHMgPSAyKnJcblxuICAgICAgZnVuY3Rpb24gZ3JwKCkge1xuICAgICAgICByZXR1cm4gY3NzKFxuICAgICAgICAgIHZtbCgnZ3JvdXAnLCB7XG4gICAgICAgICAgICBjb29yZHNpemU6IHMgKyAnICcgKyBzLFxuICAgICAgICAgICAgY29vcmRvcmlnaW46IC1yICsgJyAnICsgLXJcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB7IHdpZHRoOiBzLCBoZWlnaHQ6IHMgfVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHZhciBtYXJnaW4gPSAtKG8ud2lkdGgrby5sZW5ndGgpKjIgKyAncHgnXG4gICAgICAgICwgZyA9IGNzcyhncnAoKSwge3Bvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6IG1hcmdpbiwgbGVmdDogbWFyZ2lufSlcbiAgICAgICAgLCBpXG5cbiAgICAgIGZ1bmN0aW9uIHNlZyhpLCBkeCwgZmlsdGVyKSB7XG4gICAgICAgIGlucyhnLFxuICAgICAgICAgIGlucyhjc3MoZ3JwKCksIHtyb3RhdGlvbjogMzYwIC8gby5saW5lcyAqIGkgKyAnZGVnJywgbGVmdDogfn5keH0pLFxuICAgICAgICAgICAgaW5zKGNzcyh2bWwoJ3JvdW5kcmVjdCcsIHthcmNzaXplOiBvLmNvcm5lcnN9KSwge1xuICAgICAgICAgICAgICAgIHdpZHRoOiByLFxuICAgICAgICAgICAgICAgIGhlaWdodDogby53aWR0aCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBvLnJhZGl1cyxcbiAgICAgICAgICAgICAgICB0b3A6IC1vLndpZHRoPj4xLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZmlsdGVyXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICB2bWwoJ2ZpbGwnLCB7Y29sb3I6IGdldENvbG9yKG8uY29sb3IsIGkpLCBvcGFjaXR5OiBvLm9wYWNpdHl9KSxcbiAgICAgICAgICAgICAgdm1sKCdzdHJva2UnLCB7b3BhY2l0eTogMH0pIC8vIHRyYW5zcGFyZW50IHN0cm9rZSB0byBmaXggY29sb3IgYmxlZWRpbmcgdXBvbiBvcGFjaXR5IGNoYW5nZVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICBpZiAoby5zaGFkb3cpXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gby5saW5lczsgaSsrKVxuICAgICAgICAgIHNlZyhpLCAtMiwgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5CbHVyKHBpeGVscmFkaXVzPTIsbWFrZXNoYWRvdz0xLHNoYWRvd29wYWNpdHk9LjMpJylcblxuICAgICAgZm9yIChpID0gMTsgaSA8PSBvLmxpbmVzOyBpKyspIHNlZyhpKVxuICAgICAgcmV0dXJuIGlucyhlbCwgZylcbiAgICB9XG5cbiAgICBTcGlubmVyLnByb3RvdHlwZS5vcGFjaXR5ID0gZnVuY3Rpb24oZWwsIGksIHZhbCwgbykge1xuICAgICAgdmFyIGMgPSBlbC5maXJzdENoaWxkXG4gICAgICBvID0gby5zaGFkb3cgJiYgby5saW5lcyB8fCAwXG4gICAgICBpZiAoYyAmJiBpK28gPCBjLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIGMgPSBjLmNoaWxkTm9kZXNbaStvXTsgYyA9IGMgJiYgYy5maXJzdENoaWxkOyBjID0gYyAmJiBjLmZpcnN0Q2hpbGRcbiAgICAgICAgaWYgKGMpIGMub3BhY2l0eSA9IHZhbFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBwcm9iZSA9IGNzcyhjcmVhdGVFbCgnZ3JvdXAnKSwge2JlaGF2aW9yOiAndXJsKCNkZWZhdWx0I1ZNTCknfSlcblxuICBpZiAoIXZlbmRvcihwcm9iZSwgJ3RyYW5zZm9ybScpICYmIHByb2JlLmFkaikgaW5pdFZNTCgpXG4gIGVsc2UgdXNlQ3NzQW5pbWF0aW9ucyA9IHZlbmRvcihwcm9iZSwgJ2FuaW1hdGlvbicpXG5cbiAgcmV0dXJuIFNwaW5uZXJcblxufSkpO1xuIiwiLy8gICAgIFVuZGVyc2NvcmUuanMgMS42LjBcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGV4cG9ydHNgIG9uIHRoZSBzZXJ2ZXIuXG4gIHZhciByb290ID0gdGhpcztcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIEVzdGFibGlzaCB0aGUgb2JqZWN0IHRoYXQgZ2V0cyByZXR1cm5lZCB0byBicmVhayBvdXQgb2YgYSBsb29wIGl0ZXJhdGlvbi5cbiAgdmFyIGJyZWFrZXIgPSB7fTtcblxuICAvLyBTYXZlIGJ5dGVzIGluIHRoZSBtaW5pZmllZCAoYnV0IG5vdCBnemlwcGVkKSB2ZXJzaW9uOlxuICB2YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSwgT2JqUHJvdG8gPSBPYmplY3QucHJvdG90eXBlLCBGdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhclxuICAgIHB1c2ggICAgICAgICAgICAgPSBBcnJheVByb3RvLnB1c2gsXG4gICAgc2xpY2UgICAgICAgICAgICA9IEFycmF5UHJvdG8uc2xpY2UsXG4gICAgY29uY2F0ICAgICAgICAgICA9IEFycmF5UHJvdG8uY29uY2F0LFxuICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVGb3JFYWNoICAgICAgPSBBcnJheVByb3RvLmZvckVhY2gsXG4gICAgbmF0aXZlTWFwICAgICAgICAgID0gQXJyYXlQcm90by5tYXAsXG4gICAgbmF0aXZlUmVkdWNlICAgICAgID0gQXJyYXlQcm90by5yZWR1Y2UsXG4gICAgbmF0aXZlUmVkdWNlUmlnaHQgID0gQXJyYXlQcm90by5yZWR1Y2VSaWdodCxcbiAgICBuYXRpdmVGaWx0ZXIgICAgICAgPSBBcnJheVByb3RvLmZpbHRlcixcbiAgICBuYXRpdmVFdmVyeSAgICAgICAgPSBBcnJheVByb3RvLmV2ZXJ5LFxuICAgIG5hdGl2ZVNvbWUgICAgICAgICA9IEFycmF5UHJvdG8uc29tZSxcbiAgICBuYXRpdmVJbmRleE9mICAgICAgPSBBcnJheVByb3RvLmluZGV4T2YsXG4gICAgbmF0aXZlTGFzdEluZGV4T2YgID0gQXJyYXlQcm90by5sYXN0SW5kZXhPZixcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kO1xuXG4gIC8vIENyZWF0ZSBhIHNhZmUgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgdXNlIGJlbG93LlxuICB2YXIgXyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBfKSByZXR1cm4gb2JqO1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBfKSkgcmV0dXJuIG5ldyBfKG9iaik7XG4gICAgdGhpcy5fd3JhcHBlZCA9IG9iajtcbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciAqKk5vZGUuanMqKiwgd2l0aFxuICAvLyBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3IgdGhlIG9sZCBgcmVxdWlyZSgpYCBBUEkuIElmIHdlJ3JlIGluXG4gIC8vIHRoZSBicm93c2VyLCBhZGQgYF9gIGFzIGEgZ2xvYmFsIG9iamVjdCB2aWEgYSBzdHJpbmcgaWRlbnRpZmllcixcbiAgLy8gZm9yIENsb3N1cmUgQ29tcGlsZXIgXCJhZHZhbmNlZFwiIG1vZGUuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuNi4wJztcblxuICAvLyBDb2xsZWN0aW9uIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFRoZSBjb3JuZXJzdG9uZSwgYW4gYGVhY2hgIGltcGxlbWVudGF0aW9uLCBha2EgYGZvckVhY2hgLlxuICAvLyBIYW5kbGVzIG9iamVjdHMgd2l0aCB0aGUgYnVpbHQtaW4gYGZvckVhY2hgLCBhcnJheXMsIGFuZCByYXcgb2JqZWN0cy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGZvckVhY2hgIGlmIGF2YWlsYWJsZS5cbiAgdmFyIGVhY2ggPSBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gb2JqO1xuICAgIGlmIChuYXRpdmVGb3JFYWNoICYmIG9iai5mb3JFYWNoID09PSBuYXRpdmVGb3JFYWNoKSB7XG4gICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXlzW2ldXSwga2V5c1tpXSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0b3IgdG8gZWFjaCBlbGVtZW50LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgbWFwYCBpZiBhdmFpbGFibGUuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlTWFwICYmIG9iai5tYXAgPT09IG5hdGl2ZU1hcCkgcmV0dXJuIG9iai5tYXAoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJlc3VsdHMucHVzaChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIHZhciByZWR1Y2VFcnJvciA9ICdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJztcblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGByZWR1Y2VgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2UgPSBfLmZvbGRsID0gXy5pbmplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2UgJiYgb2JqLnJlZHVjZSA9PT0gbmF0aXZlUmVkdWNlKSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlKGl0ZXJhdG9yLCBtZW1vKSA6IG9iai5yZWR1Y2UoaXRlcmF0b3IpO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgICAgbWVtbyA9IHZhbHVlO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbml0aWFsKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZVJpZ2h0YCBpZiBhdmFpbGFibGUuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgbWVtbywgY29udGV4dCkge1xuICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpZiAobmF0aXZlUmVkdWNlUmlnaHQgJiYgb2JqLnJlZHVjZVJpZ2h0ID09PSBuYXRpdmVSZWR1Y2VSaWdodCkge1xuICAgICAgaWYgKGNvbnRleHQpIGl0ZXJhdG9yID0gXy5iaW5kKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiBpbml0aWFsID8gb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yLCBtZW1vKSA6IG9iai5yZWR1Y2VSaWdodChpdGVyYXRvcik7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgIGlmIChsZW5ndGggIT09ICtsZW5ndGgpIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB9XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaW5kZXggPSBrZXlzID8ga2V5c1stLWxlbmd0aF0gOiAtLWxlbmd0aDtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gb2JqW2luZGV4XTtcbiAgICAgICAgaW5pdGlhbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZW1vID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBtZW1vLCBvYmpbaW5kZXhdLCBpbmRleCwgbGlzdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbml0aWFsKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHZhbHVlIHdoaWNoIHBhc3NlcyBhIHRydXRoIHRlc3QuIEFsaWFzZWQgYXMgYGRldGVjdGAuXG4gIF8uZmluZCA9IF8uZGV0ZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGFueShvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBwYXNzIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGZpbHRlcmAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgaWYgKG5hdGl2ZUZpbHRlciAmJiBvYmouZmlsdGVyID09PSBuYXRpdmVGaWx0ZXIpIHJldHVybiBvYmouZmlsdGVyKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgIH0sIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZXZlcnlgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgfHwgKHByZWRpY2F0ZSA9IF8uaWRlbnRpdHkpO1xuICAgIHZhciByZXN1bHQgPSB0cnVlO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAobmF0aXZlRXZlcnkgJiYgb2JqLmV2ZXJ5ID09PSBuYXRpdmVFdmVyeSkgcmV0dXJuIG9iai5ldmVyeShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghKHJlc3VsdCA9IHJlc3VsdCAmJiBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgc29tZWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbnlgLlxuICB2YXIgYW55ID0gXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSB8fCAocHJlZGljYXRlID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAobmF0aXZlU29tZSAmJiBvYmouc29tZSA9PT0gbmF0aXZlU29tZSkgcmV0dXJuIG9iai5zb21lKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHJlc3VsdCB8fCAocmVzdWx0ID0gcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkpIHJldHVybiBicmVha2VyO1xuICAgIH0pO1xuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIHZhbHVlICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCB0YXJnZXQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBpZiAobmF0aXZlSW5kZXhPZiAmJiBvYmouaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIG9iai5pbmRleE9mKHRhcmdldCkgIT0gLTE7XG4gICAgcmV0dXJuIGFueShvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHRhcmdldDtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSBmdW5jdGlvbihvYmosIG1ldGhvZCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIChpc0Z1bmMgPyBtZXRob2QgOiB2YWx1ZVttZXRob2RdKS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgb3IgKGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICAvLyBDYW4ndCBvcHRpbWl6ZSBhcnJheXMgb2YgaW50ZWdlcnMgbG9uZ2VyIHRoYW4gNjUsNTM1IGVsZW1lbnRzLlxuICAvLyBTZWUgW1dlYktpdCBCdWcgODA3OTddKGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD04MDc5NylcbiAgXy5tYXggPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzQXJyYXkob2JqKSAmJiBvYmpbMF0gPT09ICtvYmpbMF0gJiYgb2JqLmxlbmd0aCA8IDY1NTM1KSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgb2JqKTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IC1JbmZpbml0eSwgbGFzdENvbXB1dGVkID0gLUluZmluaXR5O1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHZhciBjb21wdXRlZCA9IGl0ZXJhdG9yID8gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpIDogdmFsdWU7XG4gICAgICBpZiAoY29tcHV0ZWQgPiBsYXN0Q29tcHV0ZWQpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtaW5pbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1pbiA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNBcnJheShvYmopICYmIG9ialswXSA9PT0gK29ialswXSAmJiBvYmoubGVuZ3RoIDwgNjU1MzUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCBvYmopO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IEluZmluaXR5O1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHZhciBjb21wdXRlZCA9IGl0ZXJhdG9yID8gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpIDogdmFsdWU7XG4gICAgICBpZiAoY29tcHV0ZWQgPCBsYXN0Q29tcHV0ZWQpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gU2h1ZmZsZSBhbiBhcnJheSwgdXNpbmcgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIHRoZVxuICAvLyBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4gIF8uc2h1ZmZsZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByYW5kO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNodWZmbGVkID0gW107XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByYW5kID0gXy5yYW5kb20oaW5kZXgrKyk7XG4gICAgICBzaHVmZmxlZFtpbmRleCAtIDFdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGEgY29sbGVjdGlvbi5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xuICAgICAgaWYgKG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgICAgcmV0dXJuIG9ialtfLnJhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICAgIH1cbiAgICByZXR1cm4gXy5zaHVmZmxlKG9iaikuc2xpY2UoMCwgTWF0aC5tYXgoMCwgbikpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGxvb2t1cCBpdGVyYXRvcnMuXG4gIHZhciBsb29rdXBJdGVyYXRvciA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBfLmlkZW50aXR5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRvci5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcihpdGVyYXRvcik7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpXG4gICAgICB9O1xuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYTtcbiAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxlZnQuaW5kZXggLSByaWdodC5pbmRleDtcbiAgICB9KSwgJ3ZhbHVlJyk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdXNlZCBmb3IgYWdncmVnYXRlIFwiZ3JvdXAgYnlcIiBvcGVyYXRpb25zLlxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihiZWhhdmlvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBvYmopO1xuICAgICAgICBiZWhhdmlvcihyZXN1bHQsIGtleSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxuICAvLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbiAgXy5ncm91cEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgXy5oYXMocmVzdWx0LCBrZXkpID8gcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSkgOiByZXN1bHRba2V5XSA9IFt2YWx1ZV07XG4gIH0pO1xuXG4gIC8vIEluZGV4ZXMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiwgc2ltaWxhciB0byBgZ3JvdXBCeWAsIGJ1dCBmb3JcbiAgLy8gd2hlbiB5b3Uga25vdyB0aGF0IHlvdXIgaW5kZXggdmFsdWVzIHdpbGwgYmUgdW5pcXVlLlxuICBfLmluZGV4QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICB9KTtcblxuICAvLyBDb3VudHMgaW5zdGFuY2VzIG9mIGFuIG9iamVjdCB0aGF0IGdyb3VwIGJ5IGEgY2VydGFpbiBjcml0ZXJpb24uIFBhc3NcbiAgLy8gZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZSB0byBjb3VudCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlXG4gIC8vIGNyaXRlcmlvbi5cbiAgXy5jb3VudEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCBrZXkpIHtcbiAgICBfLmhhcyhyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XSsrIDogcmVzdWx0W2tleV0gPSAxO1xuICB9KTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcihpdGVyYXRvcik7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gYXJyYXkubGVuZ3RoO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+PiAxO1xuICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBhcnJheVttaWRdKSA8IHZhbHVlID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG4gIH07XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQpIHJldHVybiBhcnJheVswXTtcbiAgICBpZiAobiA8IDApIHJldHVybiBbXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aFxuICAvLyBgXy5tYXBgLlxuICBfLmluaXRpYWwgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgYXJyYXkubGVuZ3RoIC0gKChuID09IG51bGwpIHx8IGd1YXJkID8gMSA6IG4pKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgbGFzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQpIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgTWF0aC5tYXgoYXJyYXkubGVuZ3RoIC0gbiwgMCkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqXG4gIC8vIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIChuID09IG51bGwpIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgb3V0cHV0KSB7XG4gICAgaWYgKHNoYWxsb3cgJiYgXy5ldmVyeShpbnB1dCwgXy5pc0FycmF5KSkge1xuICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShvdXRwdXQsIGlucHV0KTtcbiAgICB9XG4gICAgZWFjaChpbnB1dCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSB7XG4gICAgICAgIHNoYWxsb3cgPyBwdXNoLmFwcGx5KG91dHB1dCwgdmFsdWUpIDogZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgb3V0cHV0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgW10pO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH07XG5cbiAgLy8gU3BsaXQgYW4gYXJyYXkgaW50byB0d28gYXJyYXlzOiBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIHNhdGlzZnkgdGhlIGdpdmVuXG4gIC8vIHByZWRpY2F0ZSwgYW5kIG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgZG8gbm90IHNhdGlzZnkgdGhlIHByZWRpY2F0ZS5cbiAgXy5wYXJ0aXRpb24gPSBmdW5jdGlvbihhcnJheSwgcHJlZGljYXRlKSB7XG4gICAgdmFyIHBhc3MgPSBbXSwgZmFpbCA9IFtdO1xuICAgIGVhY2goYXJyYXksIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIChwcmVkaWNhdGUoZWxlbSkgPyBwYXNzIDogZmFpbCkucHVzaChlbGVtKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW3Bhc3MsIGZhaWxdO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4gIC8vIGJlZW4gc29ydGVkLCB5b3UgaGF2ZSB0aGUgb3B0aW9uIG9mIHVzaW5nIGEgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpc1NvcnRlZCkpIHtcbiAgICAgIGNvbnRleHQgPSBpdGVyYXRvcjtcbiAgICAgIGl0ZXJhdG9yID0gaXNTb3J0ZWQ7XG4gICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgaW5pdGlhbCA9IGl0ZXJhdG9yID8gXy5tYXAoYXJyYXksIGl0ZXJhdG9yLCBjb250ZXh0KSA6IGFycmF5O1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBlYWNoKGluaXRpYWwsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgaWYgKGlzU29ydGVkID8gKCFpbmRleCB8fCBzZWVuW3NlZW4ubGVuZ3RoIC0gMV0gIT09IHZhbHVlKSA6ICFfLmNvbnRhaW5zKHNlZW4sIHZhbHVlKSkge1xuICAgICAgICBzZWVuLnB1c2godmFsdWUpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXJyYXlbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKF8uZmxhdHRlbihhcmd1bWVudHMsIHRydWUpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4gIC8vIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoXy51bmlxKGFycmF5KSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIF8uZXZlcnkocmVzdCwgZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIF8uY29udGFpbnMob3RoZXIsIGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBmdW5jdGlvbih2YWx1ZSl7IHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7IH0pO1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9IF8ubWF4KF8ucGx1Y2soYXJndW1lbnRzLCAnbGVuZ3RoJykuY29uY2F0KDApKTtcbiAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdHNbaV0gPSBfLnBsdWNrKGFyZ3VtZW50cywgJycgKyBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydHMgbGlzdHMgaW50byBvYmplY3RzLiBQYXNzIGVpdGhlciBhIHNpbmdsZSBhcnJheSBvZiBgW2tleSwgdmFsdWVdYFxuICAvLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2ZcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIGlmIChsaXN0ID09IG51bGwpIHJldHVybiB7fTtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBJZiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBseSB1cyB3aXRoIGluZGV4T2YgKEknbSBsb29raW5nIGF0IHlvdSwgKipNU0lFKiopLFxuICAvLyB3ZSBuZWVkIHRoaXMgZnVuY3Rpb24uIFJldHVybiB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW5cbiAgLy8gaXRlbSBpbiBhbiBhcnJheSwgb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGluZGV4T2ZgIGlmIGF2YWlsYWJsZS5cbiAgLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4gIC8vIGZvciAqKmlzU29ydGVkKiogdG8gdXNlIGJpbmFyeSBzZWFyY2guXG4gIF8uaW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpc1NvcnRlZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgaWYgKGlzU29ydGVkKSB7XG4gICAgICBpZiAodHlwZW9mIGlzU29ydGVkID09ICdudW1iZXInKSB7XG4gICAgICAgIGkgPSAoaXNTb3J0ZWQgPCAwID8gTWF0aC5tYXgoMCwgbGVuZ3RoICsgaXNTb3J0ZWQpIDogaXNTb3J0ZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSA9IF8uc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgICByZXR1cm4gYXJyYXlbaV0gPT09IGl0ZW0gPyBpIDogLTE7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIGFycmF5LmluZGV4T2YgPT09IG5hdGl2ZUluZGV4T2YpIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0sIGlzU29ydGVkKTtcbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgbGFzdEluZGV4T2ZgIGlmIGF2YWlsYWJsZS5cbiAgXy5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBmcm9tKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaGFzSW5kZXggPSBmcm9tICE9IG51bGw7XG4gICAgaWYgKG5hdGl2ZUxhc3RJbmRleE9mICYmIGFycmF5Lmxhc3RJbmRleE9mID09PSBuYXRpdmVMYXN0SW5kZXhPZikge1xuICAgICAgcmV0dXJuIGhhc0luZGV4ID8gYXJyYXkubGFzdEluZGV4T2YoaXRlbSwgZnJvbSkgOiBhcnJheS5sYXN0SW5kZXhPZihpdGVtKTtcbiAgICB9XG4gICAgdmFyIGkgPSAoaGFzSW5kZXggPyBmcm9tIDogYXJyYXkubGVuZ3RoKTtcbiAgICB3aGlsZSAoaS0tKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gYXJndW1lbnRzWzJdIHx8IDE7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciBpZHggPSAwO1xuICAgIHZhciByYW5nZSA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgd2hpbGUoaWR4IDwgbGVuZ3RoKSB7XG4gICAgICByYW5nZVtpZHgrK10gPSBzdGFydDtcbiAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV1c2FibGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHByb3RvdHlwZSBzZXR0aW5nLlxuICB2YXIgY3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncywgYm91bmQ7XG4gICAgaWYgKG5hdGl2ZUJpbmQgJiYgZnVuYy5iaW5kID09PSBuYXRpdmVCaW5kKSByZXR1cm4gbmF0aXZlQmluZC5hcHBseShmdW5jLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgYm91bmQpKSByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgc2VsZiA9IG5ldyBjdG9yO1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkoc2VsZiwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICBpZiAoT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gMDtcbiAgICAgIHZhciBhcmdzID0gYm91bmRBcmdzLnNsaWNlKCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJncy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJnc1tpXSA9PT0gXykgYXJnc1tpXSA9IGFyZ3VtZW50c1twb3NpdGlvbisrXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGZ1bmNzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGlmIChmdW5jcy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGVhY2goZnVuY3MsIGZ1bmN0aW9uKGYpIHsgb2JqW2ZdID0gXy5iaW5kKG9ialtmXSwgb2JqKTsgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtbyA9IHt9O1xuICAgIGhhc2hlciB8fCAoaGFzaGVyID0gXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGtleSA9IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIF8uaGFzKG1lbW8sIGtleSkgPyBtZW1vW2tleV0gOiAobWVtb1trZXldID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpOyB9LCB3YWl0KTtcbiAgfTtcblxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcbiAgLy8gY2xlYXJlZC5cbiAgXy5kZWZlciA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICByZXR1cm4gXy5kZWxheS5hcHBseShfLCBbZnVuYywgMV0uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciB0aW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogXy5ub3coKTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gXy5ub3coKSAtIHRpbWVzdGFtcDtcbiAgICAgIGlmIChsYXN0IDwgd2FpdCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdGltZXN0YW1wID0gXy5ub3coKTtcbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIHJhbiA9IGZhbHNlLCBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChyYW4pIHJldHVybiBtZW1vO1xuICAgICAgcmFuID0gdHJ1ZTtcbiAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZ1bmNzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgZm9yICh2YXIgaSA9IGZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGFyZ3MgPSBbZnVuY3NbaV0uYXBwbHkodGhpcywgYXJncyldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFyZ3NbMF07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgYWZ0ZXIgYmVpbmcgY2FsbGVkIE4gdGltZXMuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIHRoZSB2YWx1ZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgXy52YWx1ZXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgdmFsdWVzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzW2ldID0gb2JqW2tleXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHBhaXJzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcGFpcnNbaV0gPSBba2V5c1tpXSwgb2JqW2tleXNbaV1dXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xuICB9O1xuXG4gIC8vIEludmVydCB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gVGhlIHZhbHVlcyBtdXN0IGJlIHNlcmlhbGl6YWJsZS5cbiAgXy5pbnZlcnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W29ialtrZXlzW2ldXV0gPSBrZXlzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHNvcnRlZCBsaXN0IG9mIHRoZSBmdW5jdGlvbiBuYW1lcyBhdmFpbGFibGUgb24gdGhlIG9iamVjdC5cbiAgLy8gQWxpYXNlZCBhcyBgbWV0aG9kc2BcbiAgXy5mdW5jdGlvbnMgPSBfLm1ldGhvZHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgbmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG9ialtrZXldKSkgbmFtZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXMuc29ydCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBhIGdpdmVuIG9iamVjdCB3aXRoIGFsbCB0aGUgcHJvcGVydGllcyBpbiBwYXNzZWQtaW4gb2JqZWN0KHMpLlxuICBfLmV4dGVuZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjb3B5ID0ge307XG4gICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBlYWNoKGtleXMsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGtleSBpbiBvYmopIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9O1xuXG4gICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmICghXy5jb250YWlucyhrZXlzLCBrZXkpKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICBpZiAob2JqW3Byb3BdID09PSB2b2lkIDApIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG4gIHZhciBlcSA9IGZ1bmN0aW9uKGEsIGIsIGFTdGFjaywgYlN0YWNrKSB7XG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAgIC8vIFNlZSB0aGUgW0hhcm1vbnkgYGVnYWxgIHByb3Bvc2FsXShodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwpLlxuICAgIGlmIChhID09PSBiKSByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PSAxIC8gYjtcbiAgICAvLyBBIHN0cmljdCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGBudWxsID09IHVuZGVmaW5lZGAuXG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHJldHVybiBhID09PSBiO1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuIGEgPT0gU3RyaW5nKGIpO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS4gQW4gYGVnYWxgIGNvbXBhcmlzb24gaXMgcGVyZm9ybWVkIGZvclxuICAgICAgICAvLyBvdGhlciBudW1lcmljIHZhbHVlcy5cbiAgICAgICAgcmV0dXJuIGEgIT0gK2EgPyBiICE9ICtiIDogKGEgPT0gMCA/IDEgLyBhID09IDEgLyBiIDogYSA9PSArYik7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT0gK2I7XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb21wYXJlZCBieSB0aGVpciBzb3VyY2UgcGF0dGVybnMgYW5kIGZsYWdzLlxuICAgICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgICAgcmV0dXJuIGEuc291cmNlID09IGIuc291cmNlICYmXG4gICAgICAgICAgICAgICBhLmdsb2JhbCA9PSBiLmdsb2JhbCAmJlxuICAgICAgICAgICAgICAgYS5tdWx0aWxpbmUgPT0gYi5tdWx0aWxpbmUgJiZcbiAgICAgICAgICAgICAgIGEuaWdub3JlQ2FzZSA9PSBiLmlnbm9yZUNhc2U7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcbiAgICAvLyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLCBhYnN0cmFjdCBvcGVyYXRpb24gYEpPYC5cbiAgICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxuICAgICAgaWYgKGFTdGFja1tsZW5ndGhdID09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PSBiO1xuICAgIH1cbiAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHNcbiAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiAoYUN0b3IgaW5zdGFuY2VvZiBhQ3RvcikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiAoYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcikpXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBmaXJzdCBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wdXNoKGEpO1xuICAgIGJTdGFjay5wdXNoKGIpO1xuICAgIHZhciBzaXplID0gMCwgcmVzdWx0ID0gdHJ1ZTtcbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoY2xhc3NOYW1lID09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgc2l6ZSA9IGEubGVuZ3RoO1xuICAgICAgcmVzdWx0ID0gc2l6ZSA9PSBiLmxlbmd0aDtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgICAgIGlmICghKHJlc3VsdCA9IGVxKGFbc2l6ZV0sIGJbc2l6ZV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgZm9yICh2YXIga2V5IGluIGEpIHtcbiAgICAgICAgaWYgKF8uaGFzKGEsIGtleSkpIHtcbiAgICAgICAgICAvLyBDb3VudCB0aGUgZXhwZWN0ZWQgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICAgICAgc2l6ZSsrO1xuICAgICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlci5cbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBfLmhhcyhiLCBrZXkpICYmIGVxKGFba2V5XSwgYltrZXldLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGZvciAoa2V5IGluIGIpIHtcbiAgICAgICAgICBpZiAoXy5oYXMoYiwga2V5KSAmJiAhKHNpemUtLSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9ICFzaXplO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKCk7XG4gICAgYlN0YWNrLnBvcCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUGVyZm9ybSBhIGRlZXAgY29tcGFyaXNvbiB0byBjaGVjayBpZiB0d28gb2JqZWN0cyBhcmUgZXF1YWwuXG4gIF8uaXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXEoYSwgYiwgW10sIFtdKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopKSByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xuICB9O1xuXG4gIC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0RhdGUsIGlzUmVnRXhwLlxuICBlYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIF9bJ2lzJyArIG5hbWVdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAhIShvYmogJiYgXy5oYXMob2JqLCAnY2FsbGVlJykpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuXG4gIGlmICh0eXBlb2YgKC8uLykgIT09ICdmdW5jdGlvbicpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nO1xuICAgIH07XG4gIH1cblxuICAvLyBJcyBhIGdpdmVuIG9iamVjdCBhIGZpbml0ZSBudW1iZXI/XG4gIF8uaXNGaW5pdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gaXNGaW5pdGUob2JqKSAmJiAhaXNOYU4ocGFyc2VGbG9hdChvYmopKTtcbiAgfTtcblxuICAvLyBJcyB0aGUgZ2l2ZW4gdmFsdWUgYE5hTmA/IChOYU4gaXMgdGhlIG9ubHkgbnVtYmVyIHdoaWNoIGRvZXMgbm90IGVxdWFsIGl0c2VsZikuXG4gIF8uaXNOYU4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIG9iaiAhPSArb2JqO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdG9ycy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIF8uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfTtcblxuICBfLnByb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIGlmIChvYmogPT09IGF0dHJzKSByZXR1cm4gdHJ1ZTsgLy9hdm9pZCBjb21wYXJpbmcgYW4gb2JqZWN0IHRvIGl0c2VsZi5cbiAgICAgIGZvciAodmFyIGtleSBpbiBhdHRycykge1xuICAgICAgICBpZiAoYXR0cnNba2V5XSAhPT0gb2JqW2tleV0pXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJ1biBhIGZ1bmN0aW9uICoqbioqIHRpbWVzLlxuICBfLnRpbWVzID0gZnVuY3Rpb24obiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgYWNjdW0gPSBBcnJheShNYXRoLm1heCgwLCBuKSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIGFjY3VtW2ldID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBpKTtcbiAgICByZXR1cm4gYWNjdW07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gIH07XG5cbiAgLy8gQSAocG9zc2libHkgZmFzdGVyKSB3YXkgdG8gZ2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcCBhcyBhbiBpbnRlZ2VyLlxuICBfLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cbiAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVudGl0eU1hcCA9IHtcbiAgICBlc2NhcGU6IHtcbiAgICAgICcmJzogJyZhbXA7JyxcbiAgICAgICc8JzogJyZsdDsnLFxuICAgICAgJz4nOiAnJmd0OycsXG4gICAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICAgIFwiJ1wiOiAnJiN4Mjc7J1xuICAgIH1cbiAgfTtcbiAgZW50aXR5TWFwLnVuZXNjYXBlID0gXy5pbnZlcnQoZW50aXR5TWFwLmVzY2FwZSk7XG5cbiAgLy8gUmVnZXhlcyBjb250YWluaW5nIHRoZSBrZXlzIGFuZCB2YWx1ZXMgbGlzdGVkIGltbWVkaWF0ZWx5IGFib3ZlLlxuICB2YXIgZW50aXR5UmVnZXhlcyA9IHtcbiAgICBlc2NhcGU6ICAgbmV3IFJlZ0V4cCgnWycgKyBfLmtleXMoZW50aXR5TWFwLmVzY2FwZSkuam9pbignJykgKyAnXScsICdnJyksXG4gICAgdW5lc2NhcGU6IG5ldyBSZWdFeHAoJygnICsgXy5rZXlzKGVudGl0eU1hcC51bmVzY2FwZSkuam9pbignfCcpICsgJyknLCAnZycpXG4gIH07XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICBfLmVhY2goWydlc2NhcGUnLCAndW5lc2NhcGUnXSwgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgX1ttZXRob2RdID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBpZiAoc3RyaW5nID09IG51bGwpIHJldHVybiAnJztcbiAgICAgIHJldHVybiAoJycgKyBzdHJpbmcpLnJlcGxhY2UoZW50aXR5UmVnZXhlc1ttZXRob2RdLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICByZXR1cm4gZW50aXR5TWFwW21ldGhvZF1bbWF0Y2hdO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gSWYgdGhlIHZhbHVlIG9mIHRoZSBuYW1lZCBgcHJvcGVydHlgIGlzIGEgZnVuY3Rpb24gdGhlbiBpbnZva2UgaXQgd2l0aCB0aGVcbiAgLy8gYG9iamVjdGAgYXMgY29udGV4dDsgb3RoZXJ3aXNlLCByZXR1cm4gaXQuXG4gIF8ucmVzdWx0ID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuICAgIHJldHVybiBfLmlzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUuY2FsbChvYmplY3QpIDogdmFsdWU7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx0JzogICAgICd0JyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx0fFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBkYXRhLCBzZXR0aW5ncykge1xuICAgIHZhciByZW5kZXI7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldClcbiAgICAgICAgLnJlcGxhY2UoZXNjYXBlciwgZnVuY3Rpb24obWF0Y2gpIHsgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdOyB9KTtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfVxuICAgICAgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfVxuICAgICAgaWYgKGV2YWx1YXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZSArIFwiXFxuX19wKz0nXCI7XG4gICAgICB9XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcbiAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gICAgLy8gSWYgYSB2YXJpYWJsZSBpcyBub3Qgc3BlY2lmaWVkLCBwbGFjZSBkYXRhIHZhbHVlcyBpbiBsb2NhbCBzY29wZS5cbiAgICBpZiAoIXNldHRpbmdzLnZhcmlhYmxlKSBzb3VyY2UgPSAnd2l0aChvYmp8fHt9KXtcXG4nICsgc291cmNlICsgJ31cXG4nO1xuXG4gICAgc291cmNlID0gXCJ2YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4sXCIgK1xuICAgICAgXCJwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xcblwiICtcbiAgICAgIHNvdXJjZSArIFwicmV0dXJuIF9fcDtcXG5cIjtcblxuICAgIHRyeSB7XG4gICAgICByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEpIHJldHVybiByZW5kZXIoZGF0YSwgXyk7XG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbiBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyAoc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicpICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24sIHdoaWNoIHdpbGwgZGVsZWdhdGUgdG8gdGhlIHdyYXBwZXIuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXyhvYmopLmNoYWluKCk7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0aGlzLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBlYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XG4gICAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChuYW1lID09ICdzaGlmdCcgfHwgbmFtZSA9PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBvYmopO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEFkZCBhbGwgYWNjZXNzb3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBlYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIF8uZXh0ZW5kKF8ucHJvdG90eXBlLCB7XG5cbiAgICAvLyBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gICAgY2hhaW46IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fY2hhaW4gPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICAgIH1cblxuICB9KTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCd1bmRlcnNjb3JlJywgW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cbn0pLmNhbGwodGhpcyk7XG4iXX0=
