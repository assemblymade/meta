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
          /** FIXME: Readraptor only updates last_read_at on page load */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvYWN0aXZpdHlfZmVlZC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvYXZhdGFyLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9jaGF0X25vdGlmaWNhdGlvbnMuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2NoYXRfbm90aWZpY2F0aW9uc190b2dnbGVyLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9jb2luX293bmVyc2hpcC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvY29yZV90ZWFtLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9kZXNrdG9wX25vdGlmaWNhdGlvbnMuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2RyYWdfYW5kX2Ryb3Bfdmlldy5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvZHJvcGRvd25fbmV3c19mZWVkLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9kcm9wZG93bl9uZXdzX2ZlZWRfdG9nZ2xlci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvZmluYW5jaWFsc192aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9mb3JtX2dyb3VwLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9mdWxsX3BhZ2VfbmV3c19mZWVkLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9pbnB1dF9wcmV2aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9pbnRlcmVzdF9waWNrZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2ludml0ZV9ib3VudHlfZm9ybS5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaW52aXRlX2ZyaWVuZF9ib3VudHkuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2ludml0ZV9mcmllbmRfcHJvZHVjdC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaW52aXRlX2xpc3QuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2pvaW5fdGVhbV92aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9tZW1iZXJzX3ZpZXcuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL25hdmJhci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvbm90aWZpY2F0aW9uX3ByZWZlcmVuY2VzX2Ryb3Bkb3duLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9udW1iZXJfaW5wdXRfdmlldy5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvcGVvcGxlX3ZpZXcuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3BlcnNvbl9waWNrZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3BvcG92ZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3NoYXJlLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy90YWdfbGlzdF92aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy90aW1lc3RhbXAuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3RpcHNfdWkuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3RpdGxlX25vdGlmaWNhdGlvbnNfY291bnQuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3VyZ2VuY3kuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3VzZXJfbmF2YmFyX2Ryb3Bkb3duLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29uc3RhbnRzLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9kaXNwYXRjaGVyLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9taXhpbnMvZHJvcGRvd25fdG9nZ2xlci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL21peGlucy9uZXdzX2ZlZWQuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9zdG9yZXMvY2hhdF9ub3RpZmljYXRpb25zX3N0b3JlLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9zdG9yZXMvY29pbl9vd25lcnNoaXBfc3RvcmUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL3N0b3Jlcy9pbnRlcmVzdF9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25ld3NfZmVlZF9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25ld3NfZmVlZF91c2Vyc19zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25vdGlmaWNhdGlvbl9wcmVmZXJlbmNlc19kcm9wZG93bl9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3Blb3BsZV9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3BlcnNvbl9waWNrZXJfc3RvcmUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL3N0b3Jlcy9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3RhZ19saXN0X3N0b3JlLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy94aHIuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9ub2RlX21vZHVsZXMvc3Bpbi5qcy9zcGluLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9WQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBBY3Rpdml0eUZlZWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdBY3Rpdml0eUZlZWQnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBhY3Rpdml0aWVzOiB0aGlzLnByb3BzLmFjdGl2aXRpZXMgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KG51bGwsIF8ubWFwKHRoaXMuc3RhdGUuYWN0aXZpdGllcywgRW50cnkpKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBFbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0VudHJ5JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFwiQFwiLCB0aGlzLnByb3BzLmFjdG9yLnVzZXJuYW1lLCBcIiBcIiwgdGhpcy5wcm9wcy52ZXJiLCBcIiBcIiwgdGhpcy5ib2R5KCkpXG4gICAgfSxcblxuICAgIGJvZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuc3ViamVjdC5ib2R5X2h0bWwpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJtYXJrZG93bi1ub3JtYWxpemVkXCIsIHJlZjogXCJib2R5XCJ9KVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnN1YmplY3QuYXR0YWNobWVudCkge1xuICAgICAgICB2YXIgaHJlZiA9IHRoaXMucHJvcHMuc3ViamVjdC5hdHRhY2htZW50LmhyZWZcbiAgICAgICAgdmFyIHNyYyA9IHRoaXMucHJvcHMuc3ViamVjdC5hdHRhY2htZW50LmZpcmVzaXplX3VybCArICcvMzAweDIyNS9mcmFtZV8wL2dfY2VudGVyLycgKyBocmVmXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IGhyZWZ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJnYWxsZXJ5LXRodW1iXCIsIHNyYzogc3JjfSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucmVmcy5ib2R5KSB7XG4gICAgICAgIHRoaXMucmVmcy5ib2R5LmdldERPTU5vZGUoKS5pbm5lckhUTUwgPSB0aGlzLnByb3BzLnN1YmplY3QuYm9keV9odG1sXG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFjdGl2aXR5RmVlZDtcbiAgfVxuXG4gIHdpbmRvdy5BY3Rpdml0eUZlZWQgPSBBY3Rpdml0eUZlZWQ7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEF2YXRhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0F2YXRhcicsXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNpemU6IDI0XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNpemUgPSB0aGlzLnByb3BzLnNpemUgJiYgdGhpcy5wcm9wcy5zaXplLnRvU3RyaW5nKCk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00uaW1nKHtjbGFzc05hbWU6IFwiYXZhdGFyIGltZy1jaXJjbGVcIiwgaGVpZ2h0OiBzaXplLCBzcmM6IHRoaXMuYXZhdGFyVXJsKCksIHdpZHRoOiBzaXplfSk7XG4gICAgfSxcblxuICAgIGF2YXRhclVybDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy51c2VyICYmICF0aGlzLnByb3BzLmFsd2F5c0RlZmF1bHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMudXNlci5hdmF0YXJfdXJsICsgJz9zPScgKyAodGhpcy5wcm9wcy5zaXplICogMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJy9hc3NldHMvYXZhdGFycy9kZWZhdWx0LnBuZyc7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEF2YXRhcjtcbiAgfVxuXG4gIHdpbmRvdy5BdmF0YXIgPSBBdmF0YXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIENoYXROb3RpZmljYXRpb25TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9jaGF0X25vdGlmaWNhdGlvbnNfc3RvcmUnKTtcbnZhciBEZXNrdG9wTm90aWZpY2F0aW9ucyA9IHJlcXVpcmUoJy4vZGVza3RvcF9ub3RpZmljYXRpb25zLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJQ09OX1VSTCA9ICdodHRwczovL2Q4aXpkazZibDRnYmkuY2xvdWRmcm9udC5uZXQvODB4L2h0dHA6Ly9mLmNsLmx5L2l0ZW1zLzFJMmExajBNMHcwVjJwM0MzUTBNL0Fzc2VtYmx5LVR3aXR0ZXItQXZhdGFyLnBuZyc7XG4gIHZhciBOID0gQ09OU1RBTlRTLkNIQVRfTk9USUZJQ0FUSU9OUztcblxuICBmdW5jdGlvbiBkeW5hbWljU29ydChwcm9wZXJ0eSkge1xuICAgIHZhciBzb3J0T3JkZXIgPSAxO1xuICAgIGlmKHByb3BlcnR5WzBdID09PSBcIi1cIikge1xuICAgICAgc29ydE9yZGVyID0gLTE7XG4gICAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnN1YnN0cigxKTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhLGIpIHtcbiAgICAgIHZhciByZXN1bHQgPSAoYVtwcm9wZXJ0eV0gPCBiW3Byb3BlcnR5XSkgPyAtMSA6IChhW3Byb3BlcnR5XSA+IGJbcHJvcGVydHldKSA/IDEgOiAwO1xuICAgICAgcmV0dXJuIHJlc3VsdCAqIHNvcnRPcmRlcjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkeW5hbWljU29ydE11bHRpcGxlKCkge1xuICAgIC8qXG4gICAgICogc2F2ZSB0aGUgYXJndW1lbnRzIG9iamVjdCBhcyBpdCB3aWxsIGJlIG92ZXJ3cml0dGVuXG4gICAgICogbm90ZSB0aGF0IGFyZ3VtZW50cyBvYmplY3QgaXMgYW4gYXJyYXktbGlrZSBvYmplY3RcbiAgICAgKiBjb25zaXN0aW5nIG9mIHRoZSBuYW1lcyBvZiB0aGUgcHJvcGVydGllcyB0byBzb3J0IGJ5XG4gICAgICovXG4gICAgdmFyIHByb3BzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBmdW5jdGlvbiAob2JqMSwgb2JqMikge1xuICAgICAgdmFyIGkgPSAwLCByZXN1bHQgPSAwLCBudW1iZXJPZlByb3BlcnRpZXMgPSBwcm9wcy5sZW5ndGg7XG4gICAgICAvKiB0cnkgZ2V0dGluZyBhIGRpZmZlcmVudCByZXN1bHQgZnJvbSAwIChlcXVhbClcbiAgICAgICAqIGFzIGxvbmcgYXMgd2UgaGF2ZSBleHRyYSBwcm9wZXJ0aWVzIHRvIGNvbXBhcmVcbiAgICAgICAqL1xuICAgICAgd2hpbGUgKHJlc3VsdCA9PT0gMCAmJiBpIDwgbnVtYmVyT2ZQcm9wZXJ0aWVzKSB7XG4gICAgICAgIHJlc3VsdCA9IGR5bmFtaWNTb3J0KHByb3BzW2ldKShvYmoxLCBvYmoyKTtcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICB2YXIgQ2hhdE5vdGlmaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDaGF0Tm90aWZpY2F0aW9ucycsXG4gICAgYXJ0aWNsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8uZmxhdHRlbihfLm1hcCh0aGlzLnN0YXRlLmRhdGEsIGZ1bmN0aW9uKGEpe1xuICAgICAgICByZXR1cm4gYS5lbnRpdGllcztcbiAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJCgnW2RhdGEtdG9nZ2xlXScsIHRoaXMuZ2V0RE9NTm9kZSgpKS50b29sdGlwKCk7XG4gICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5yZWZzLnNwaW5uZXIuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIG9wdHMgPSB0aGlzLnNwaW5uZXJPcHRpb25zIHx8IHtcbiAgICAgICAgbGluZXM6IDExLFxuICAgICAgICBsZW5ndGg6IDMwLFxuICAgICAgICByYWRpdXM6IDU1XG4gICAgICB9O1xuXG4gICAgICB2YXIgc3Bpbm5lciA9IHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4oKTtcbiAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChzcGlubmVyLmVsKTtcbiAgICB9LFxuXG4gICAgc29ydEJ5TGFzdFJlYWRBdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWVzID0gXy52YWx1ZXMoZGF0YSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZW50cnkgPSB2YWx1ZXNbaV07XG4gICAgICAgIGVudHJ5LnJlYWRTdGF0ZSA9IGVudHJ5LnVwZGF0ZWQgPiBlbnRyeS5sYXN0X3JlYWRfYXQgPyAnQScgOiAnWic7XG4gICAgICAgIGVudHJ5LnNvcnRJbmRleCA9IHRoaXMuc3RhdGUuc29ydEtleXMuaW5kZXhPZihlbnRyeS5pZCk7XG4gICAgICB9XG4gICAgICB2YWx1ZXMuc29ydChkeW5hbWljU29ydE11bHRpcGxlKFwicmVhZFN0YXRlXCIsIFwic29ydEluZGV4XCIsIFwibGFiZWxcIikpO1xuXG4gICAgICByZXR1cm4gdmFsdWVzIHx8IFtdO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgLy8gVE9ETzogUmVtb3ZlIHRoaXMgYW5kIHVzZSB0aGUgRGlzcGF0Y2hlclxuICAgICAgJCh3aW5kb3cpLmJpbmQoJ3N0b3JhZ2UnLCB0aGlzLnN0b3JlZEFja0NoYW5nZWQpO1xuXG4gICAgICB0aGlzLm9uUHVzaChmdW5jdGlvbihldmVudCwgbXNnKSB7XG4gICAgICAgIGlmIChfLmNvbnRhaW5zKG1zZy5tZW50aW9ucywgX3RoaXMucHJvcHMudXNlcm5hbWUpKSB7XG4gICAgICAgICAgX3RoaXMuZGVza3RvcE5vdGlmeShtc2cpO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLmZldGNoTm90aWZpY2F0aW9ucygpO1xuICAgICAgfSk7XG5cbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5KGZ1bmN0aW9uKHZpc2libGUpIHtcbiAgICAgICAgaWYgKHZpc2libGUpIHsgX3RoaXMuZmV0Y2hOb3RpZmljYXRpb25zKCk7IH1cbiAgICAgIH0pO1xuXG4gICAgICBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuaGFuZGxlQ2hhdFJvb21zQ2hhbmdlZCk7XG4gICAgICB0aGlzLmZldGNoTm90aWZpY2F0aW9ucygpO1xuICAgIH0sXG5cbiAgICBkZXNrdG9wTm90aWZ5OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIG4gPSBuZXcgTm90aWZ5KFwiTmV3IG1lc3NhZ2Ugb24gXCIgKyAoZXZlbnQud2lwLnByb2R1Y3RfbmFtZSksIHtcbiAgICAgICAgYm9keTogKGV2ZW50LmFjdG9yLnVzZXJuYW1lICsgXCI6IFwiICsgZXZlbnQuYm9keV9zYW5pdGl6ZWQpLFxuICAgICAgICB0YWc6IGV2ZW50LmlkLFxuICAgICAgICBpY29uOiBJQ09OX1VSTCxcbiAgICAgICAgdGltZW91dDogMTUsXG5cbiAgICAgICAgbm90aWZ5Q2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQod2luZG93KS5mb2N1cygpO1xuICAgICAgICAgIGlmICh3aW5kb3cuYXBwLndpcC5pZCAhPSBldmVudC53aXAuaWQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hcHAucmVkaXJlY3RUbyhldmVudC53aXAudXJsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gbi5zaG93KCk7XG4gICAgfSxcblxuICAgIGZldGNoTm90aWZpY2F0aW9uczogXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IE4uQUNUSU9OUy5GRVRDSF9DSEFUX1JPT01TLFxuICAgICAgICBldmVudDogTi5FVkVOVFMuQ0hBVF9ST09NU19GRVRDSEVELFxuICAgICAgICBkYXRhOiB0aGlzLnByb3BzLnVybFxuICAgICAgfSk7XG4gICAgfSwgMTAwMCksXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IGRvY3VtZW50LnRpdGxlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgc29ydEtleXM6IFtdLFxuICAgICAgICBhY2tub3dsZWRnZWRBdDogdGhpcy5zdG9yZWRBY2soKSxcbiAgICAgICAgZGVza3RvcE5vdGlmaWNhdGlvbnNFbmFibGVkOiBmYWxzZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaGFuZGxlQ2hhdFJvb21zQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBkYXRhOiBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmdldENoYXRSb29tcygpLFxuICAgICAgICBzb3J0S2V5czogQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5nZXRTb3J0S2V5cygpXG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFfLmlzRW1wdHkoc2VsZi5zdGF0ZS5kYXRhKSkge1xuICAgICAgICAgIHNlbGYuc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVEZXNrdG9wTm90aWZpY2F0aW9uc1N0YXRlQ2hhbmdlOiBmdW5jdGlvbihpc0VuYWJsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBkZXNrdG9wTm90aWZpY2F0aW9uc0VuYWJsZWQ6IGlzRW5hYmxlZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUHVzaDogZnVuY3Rpb24oZm4pIHtcbiAgICAgIGlmICh3aW5kb3cucHVzaGVyKSB7XG4gICAgICAgIGNoYW5uZWwgPSB3aW5kb3cucHVzaGVyLnN1YnNjcmliZSgnQCcgKyB0aGlzLnByb3BzLnVzZXJuYW1lKTtcbiAgICAgICAgY2hhbm5lbC5iaW5kX2FsbChmbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGxhdGVzdEFydGljbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWF4KHRoaXMuYXJ0aWNsZXMoKSwgZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gYSAmJiBhLnRpbWVzdGFtcDtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBsYXRlc3RBcnRpY2xlVGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcnRpY2xlID0gdGhpcy5sYXRlc3RBcnRpY2xlKClcblxuICAgICAgaWYgKGFydGljbGUpIHtcbiAgICAgICAgcmV0dXJuIGFydGljbGUudGltZXN0YW1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc29ydGVkID0gdGhpcy5zb3J0QnlMYXN0UmVhZEF0KHRoaXMuc3RhdGUuZGF0YSk7XG4gICAgICB2YXIgcHJvZHVjdHNQYXRoID0gJy91c2Vycy8nICsgdGhpcy5wcm9wcy51c2VybmFtZTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiZHJvcGRvd24tbWVudVwiLCBzdHlsZTogeydtaW4td2lkdGgnOiAnMzgwcHgnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7cmVmOiBcInNwaW5uZXJcIiwgc3R5bGU6IHsgJ21pbi1oZWlnaHQnOiAnNTBweCcsICdtYXgtaGVpZ2h0JzogJzMwMHB4J319LCBcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvbnNMaXN0KHtkYXRhOiBfLmZpcnN0KHNvcnRlZCwgNyl9KVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHByb2R1Y3RzUGF0aCwgY2xhc3NOYW1lOiBcInRleHQtc21hbGxcIn0sIFwiQWxsIFByb2R1Y3RzXCIpXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICAhdGhpcy5zdGF0ZS5kZXNrdG9wTm90aWZpY2F0aW9uc0VuYWJsZWQgPyBEZXNrdG9wTm90aWZpY2F0aW9ucyh7b25DaGFuZ2U6IHRoaXMuaGFuZGxlRGVza3RvcE5vdGlmaWNhdGlvbnNTdGF0ZUNoYW5nZX0pIDogbnVsbFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc2V0QmFkZ2U6IGZ1bmN0aW9uKHRvdGFsKSB7XG4gICAgICBpZiAod2luZG93LmZsdWlkKSB7XG4gICAgICAgIHdpbmRvdy5mbHVpZC5kb2NrQmFkZ2UgPSB0b3RhbDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3Bpbm5lck9wdGlvbnM6IHtcbiAgICAgIGxpbmVzOiAxMSxcbiAgICAgIHRvcDogJzIwJSdcbiAgICB9LFxuXG4gICAgc3RvcmVkQWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBsb2NhbFN0b3JhZ2UuY2hhdEFjaztcblxuICAgICAgaWYgKHRpbWVzdGFtcCA9PSBudWxsIHx8IHRpbWVzdGFtcCA9PT0gXCJudWxsXCIpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQodGltZXN0YW1wKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcmVkQWNrQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgYWNrbm93bGVkZ2VkQXQ6IHRoaXMuc3RvcmVkQWNrKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIE5vdGlmaWNhdGlvbnNMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTm90aWZpY2F0aW9uc0xpc3QnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvZHVjdE5vZGVzID0gdGhpcy5wcm9wcy5kYXRhLm1hcChmdW5jdGlvbihlbnRyeSl7XG4gICAgICAgIHZhciBiYWRnZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKGVudHJ5LnVwZGF0ZWQgPiBlbnRyeS5sYXN0X3JlYWRfYXQpIHtcbiAgICAgICAgICBiYWRnZSA9IFJlYWN0LkRPTS5zcGFuKHtcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImluZGljYXRvciBpbmRpY2F0b3ItZGFuZ2VyIHB1bGwtcmlnaHRcIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7ICdwb3NpdGlvbic6ICdyZWxhdGl2ZScsICd0b3AnOiAnMTBweCd9fSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBlbnRyeS51cmwsIGtleTogZW50cnkuaWQsIGNsYXNzTmFtZTogXCJsaXN0LWdyb3VwLWl0ZW1cIn0sIFxuICAgICAgICAgICAgYmFkZ2UsIFwiIFwiLCBlbnRyeS5sYWJlbFxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGlzdC1ncm91cFwifSwgXG4gICAgICAgICAgcHJvZHVjdE5vZGVzXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENoYXROb3RpZmljYXRpb25zO1xuICB9XG5cbiAgd2luZG93LkNoYXROb3RpZmljYXRpb25zID0gQ2hhdE5vdGlmaWNhdGlvbnM7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL2NoYXRfbm90aWZpY2F0aW9uc19zdG9yZScpO1xudmFyIERyb3Bkb3duVG9nZ2xlck1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL2Ryb3Bkb3duX3RvZ2dsZXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIENOID0gQ09OU1RBTlRTLkNIQVRfTk9USUZJQ0FUSU9OUztcblxuICB2YXIgQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyJyxcbiAgICBtaXhpbnM6IFtEcm9wZG93blRvZ2dsZXJNaXhpbl0sXG5cbiAgICBhY2tub3dsZWRnZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZXN0YW1wID0gbW9tZW50KCkudW5peCgpO1xuXG4gICAgICBsb2NhbFN0b3JhZ2UuY2hhdEFjayA9IHRpbWVzdGFtcDtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aW1lc3RhbXBcbiAgICAgIH0pO1xuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IENOLkVWRU5UUy5BQ0tOT1dMRURHRUQsXG4gICAgICAgIGFjdGlvbjogQ04uQUNUSU9OUy5BQ0tOT1dMRURHRSxcbiAgICAgICAgZGF0YTogdGltZXN0YW1wLFxuICAgICAgICBzeW5jOiB0cnVlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYmFkZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnNwYW4oe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiBcImluZGljYXRvciBpbmRpY2F0b3ItZGFuZ2VyXCIsIFxuICAgICAgICAgICAgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIHRvcDogJzVweCd9fSlcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGJhZGdlQ291bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2hvdWxkUmVhZCgpID8gQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5nZXRVbnJlYWRDb3VudCh0aGlzLnN0YXRlLmFja25vd2xlZGdlZEF0KSA6IDA7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3Rvcmllcyk7XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjaGF0Um9vbXM6IG51bGwsXG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aGlzLnN0b3JlZEFjaygpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRTdG9yaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBjaGF0Um9vbXM6IENoYXROb3RpZmljYXRpb25zU3RvcmUuZ2V0Q2hhdFJvb21zKClcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzaG91bGRSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjaGF0Um9vbSA9IENoYXROb3RpZmljYXRpb25zU3RvcmUubW9zdFJlY2VudGx5VXBkYXRlZENoYXRSb29tKCk7XG5cbiAgICAgIHJldHVybiBjaGF0Um9vbSAmJiBjaGF0Um9vbS51cGRhdGVkID4gY2hhdFJvb20ubGFzdF9yZWFkX2F0O1xuICAgIH0sXG5cbiAgICBsYXN0VXBkYXRlZEF0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjaGF0Um9vbSA9IENoYXROb3RpZmljYXRpb25zU3RvcmUubW9zdFJlY2VudGx5VXBkYXRlZENoYXRSb29tKCk7XG5cbiAgICAgIGlmIChjaGF0Um9vbSkge1xuICAgICAgICByZXR1cm4gY2hhdFJvb20udXBkYXRlZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIDA7XG4gICAgfSxcblxuICAgIHRvdGFsOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIGNvdW50ID0gXy5yZWR1Y2UoXG4gICAgICAgIF8ubWFwKHNlbGYuc3RhdGUuY2hhdFJvb21zLCBmdW5jdGlvbiBtYXBTdG9yaWVzKGNoYXRSb29tKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYXRSb29tLmNvdW50O1xuICAgICAgICB9KSwgZnVuY3Rpb24gcmVkdWNlU3RvcmllcyhtZW1vLCByZWFkKSB7XG4gICAgICAgICAgcmV0dXJuIG1lbW8gKyByZWFkO1xuICAgICAgfSwgMCk7XG5cbiAgICAgIHJldHVybiBjb3VudDtcbiAgICB9LFxuXG4gICAgc3RvcmVkQWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBsb2NhbFN0b3JhZ2UuY2hhdEFjaztcblxuICAgICAgaWYgKHRpbWVzdGFtcCA9PSBudWxsIHx8IHRpbWVzdGFtcCA9PT0gJ251bGwnKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRpbWVzdGFtcCwgMTApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDaGF0Tm90aWZpY2F0aW9uc1RvZ2dsZXI7XG4gIH1cblxuICB3aW5kb3cuQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyID0gQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBDb2luT3duZXJzaGlwU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvY29pbl9vd25lcnNoaXBfc3RvcmUnKTtcbnZhciBBdmF0YXIgPSByZXF1aXJlKCcuL2F2YXRhci5qcy5qc3gnKTtcbnZhciBQZXJzb25QaWNrZXIgPSByZXF1aXJlKCcuL3BlcnNvbl9waWNrZXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIENPID0gQ09OU1RBTlRTLkNPSU5fT1dORVJTSElQO1xuXG4gIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZm4oZSlcbiAgICB9XG4gIH1cblxuICB2YXIgQ29pbk93bmVyc2hpcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NvaW5Pd25lcnNoaXAnLFxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyB0b3RhbENvaW5zOiA2MDAwIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIENvaW5Pd25lcnNoaXBTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLm9uQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNyZWF0b3I6IF8uZXh0ZW5kKGFwcC5jdXJyZW50VXNlcigpLmF0dHJpYnV0ZXMsIHsgY29pbnM6IHRoaXMucHJvcHMudG90YWxDb2lucyB9KSxcbiAgICAgICAgc2hhcmVyczogQ29pbk93bmVyc2hpcFN0b3JlLmdldFVzZXJzKCksXG4gICAgICAgIHBlcmNlbnRhZ2VBdmFpbGFibGU6IDAsXG4gICAgICAgIHBvdGVudGlhbFVzZXI6IG51bGxcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb3duZXJzaGlwOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgIDAsIE1hdGgubWluKFxuICAgICAgICAgIDEwMCwgcGFyc2VJbnQodXNlci5jb2lucyAqIDEwMCAvIHRoaXMudG90YWxDb2lucygpLCAxMClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICB0b3RhbENvaW5zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzaGFyZXJDb2lucyA9IF8ucmVkdWNlKF8ubWFwKHRoaXMuc3RhdGUuc2hhcmVycywgZnVuYy5kb3QoJ2NvaW5zJykpLCBmdW5jdGlvbihtZW1vLCBudW0pIHsgcmV0dXJuIG1lbW8gKyBudW07IH0sIDApXG5cbiAgICAgIHJldHVybiBzaGFyZXJDb2lucyArIHRoaXMuc3RhdGUuY3JlYXRvci5jb2luc1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNyZWF0b3IgPSB0aGlzLnN0YXRlLmNyZWF0b3I7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS50YWJsZSh7Y2xhc3NOYW1lOiBcInRhYmxlXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00udGhlYWQobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y29sU3BhbjogXCIyXCJ9LCBcIlBhcnRuZXJcIiksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCIsIHN0eWxlOiB7d2lkdGg6IDEzMH19LCBcIk93bmVyc2hpcFwiKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFwiQ29pbnNcIiksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00udGJvZHkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00udHIoe2NsYXNzTmFtZTogXCJhY3RpdmVcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgQXZhdGFyKHt1c2VyOiBjcmVhdG9yfSkpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgIFwiQFwiLCBjcmVhdG9yLnVzZXJuYW1lXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIHRoaXMub3duZXJzaGlwKGNyZWF0b3IpLCBcIiVcIilcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1jb2luc1wiLCBzdHlsZToge1wid2hpdGUtc3BhY2VcIjpcIm5vd3JhcFwifX0sIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW5cIn0pLCBcbiAgICAgICAgICAgICAgICAgIGNyZWF0b3IuY29pbnNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFwiKHlvdSlcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIHRoaXMucm93cygpLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgQXZhdGFyKHt1c2VyOiB0aGlzLnN0YXRlLnBvdGVudGlhbFVzZXIsIGFsd2F5c0RlZmF1bHQ6IFwidHJ1ZVwifSkpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgIFBlcnNvblBpY2tlcih7cmVmOiBcInBpY2tlclwiLCB1cmw6IFwiL19lc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXNlclNlbGVjdGVkOiB0aGlzLmhhbmRsZVVzZXJTZWxlY3RlZCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblZhbGlkVXNlckNoYW5nZWQ6IHRoaXMuaGFuZGxlVmFsaWRVc2VyQ2hhbmdlZH0pXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwIGlucHV0LWdyb3VwLXNtXCJ9LCBcblxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sIHRleHQtcmlnaHRcIiwgdHlwZTogXCJudW1iZXJcIiwgdmFsdWU6IHRoaXMuc3RhdGUucGVyY2VudGFnZUF2YWlsYWJsZSwgb25DaGFuZ2U6IHRoaXMuaGFuZGxlSW5wdXRDaGFuZ2V9KSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYWRkb25cIn0sIFwiJVwiKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtY29pbnMgcHVsbC1yaWdodFwiLCBzdHlsZTogeyd3aGl0ZS1zcGFjZSc6XCJub3dyYXBcIn19LCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgICAgICBcIjBcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQnV0dG9uKClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBhZGRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0ZXh0LXN1Y2Nlc3NcIiwgXG4gICAgICAgICAgICBzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfSwgXG4gICAgICAgICAgICBvbkNsaWNrOiB0aGlzLnN0YXRlLnBvdGVudGlhbFVzZXIgPyB0aGlzLmFkZFVzZXJDbGlja2VkIDogJyd9LCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1wbHVzLWNpcmNsZWRcIn0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiQWRkXCIpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGhhbmRsZVVzZXJTZWxlY3RlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5hZGRVc2VyKHVzZXIpXG4gICAgfSxcblxuICAgIGhhbmRsZVZhbGlkVXNlckNoYW5nZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBwb3RlbnRpYWxVc2VyOiB1c2VyXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYWRkVXNlckNsaWNrZWQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5hZGRVc2VyKHRoaXMuc3RhdGUucG90ZW50aWFsVXNlcik7XG4gICAgICB0aGlzLnJlZnMucGlja2VyLmNsZWFyVGV4dCgpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdXNlcnMgPSBDb2luT3duZXJzaGlwU3RvcmUuZ2V0VXNlcnMoKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB1c2Vycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKCF1c2Vyc1tpXS5oYXNPd25Qcm9wZXJ0eSgnY29pbnMnKSkge1xuICAgICAgICAgIHVzZXJzW2ldLmNvaW5zID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2hhcmVyczogdXNlcnNcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhZGRVc2VyOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB2YXIgdXNlciA9IF8uZXh0ZW5kKHVzZXIsIHtjb2luczogMH0pO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKFJlYWN0LmFkZG9ucy51cGRhdGUodGhpcy5zdGF0ZSwge1xuICAgICAgICBwb3RlbnRpYWxVc2VyOiB7JHNldDogbnVsbH0sXG4gICAgICAgIHNoYXJlcnM6IHsgJHB1c2g6IFt1c2VyXSB9XG4gICAgICB9KSk7XG5cbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogQ08uRVZFTlRTLlVTRVJfQURERUQsXG4gICAgICAgIGFjdGlvbjogQ08uQUNUSU9OUy5BRERfVVNFUixcbiAgICAgICAgZGF0YTogeyB1c2VyQW5kQ29pbnM6IHVzZXIgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJvd3M6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWFwKHRoaXMuc3RhdGUuc2hhcmVycywgZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gT3duZXJzaGlwUm93KHtcbiAgICAgICAgICB1c2VyOiB1c2VyLCBcbiAgICAgICAgICB0b3RhbENvaW5zOiB0aGlzLnByb3BzLnRvdGFsQ29pbnMsIFxuICAgICAgICAgIG93bmVyc2hpcDogdGhpcy5vd25lcnNoaXAodXNlciksIFxuICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLmhhbmRsZVVzZXJSZW1vdmVkKHVzZXIpLCBrZXk6IHVzZXIuaWQgfHwgdXNlci5lbWFpbCwgXG4gICAgICAgICAgb25Pd25lcnNoaXBDaGFuZ2VkOiB0aGlzLmhhbmRsZU93bmVyc2hpcENoYW5nZWQodXNlcil9KVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICBoYW5kbGVVc2VyUmVtb3ZlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdXNlcnMgPSBfLnJlamVjdCh0aGlzLnN0YXRlLnNoYXJlcnMsIGZ1bmN0aW9uKHUpe1xuICAgICAgICAgIGlmICh1LmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdS5pZCA9PSB1c2VyLmlkXG4gICAgICAgICAgfSBlbHNlIGlmICh1LmVtYWlsKSB7XG4gICAgICAgICAgICByZXR1cm4gdS5lbWFpbCA9PSB1c2VyLmVtYWlsXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICBldmVudDogQ08uRVZFTlRTLlVTRVJfUkVNT1ZFRCxcbiAgICAgICAgICBhY3Rpb246IENPLkFDVElPTlMuUkVNT1ZFX1VTRVIsXG4gICAgICAgICAgZGF0YTogeyB1c2VyQW5kQ29pbnM6IHVzZXIgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY3JlYXRvciA9IHRoaXMuc3RhdGUuY3JlYXRvcjtcblxuICAgICAgICBjcmVhdG9yLmNvaW5zID0gY3JlYXRvci5jb2lucyArIHVzZXIuY29pbnM7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgc2hhcmVyczogdXNlcnMsXG4gICAgICAgICAgY3JlYXRvcjogY3JlYXRvclxuICAgICAgICB9KTtcblxuICAgICAgfS5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVPd25lcnNoaXBDaGFuZ2VkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAvLyB0aGlzIG5lZWRzIHRvIGJlIGNvbXBsZXRlbHkgcmV3cml0dGVuIHRvIHVzZSB0aGUgZGlzcGF0Y2hlciBhbmQgc3RvcmUocylcbiAgICAgIHJldHVybiBmdW5jdGlvbihvd25lcnNoaXApIHtcbiAgICAgICAgdXNlci5jb2lucyA9IE1hdGguZmxvb3IoKG93bmVyc2hpcCAvIDEwMCkgKiB0aGlzLnByb3BzLnRvdGFsQ29pbnMpO1xuXG4gICAgICAgIHZhciBjcmVhdG9yID0gdGhpcy5zdGF0ZS5jcmVhdG9yO1xuICAgICAgICB2YXIgc2hhcmVycyA9IHRoaXMuc3RhdGUuc2hhcmVycztcblxuICAgICAgICB2YXIgc2hhcmVyQ29pbnMgPSBfLnJlZHVjZShcbiAgICAgICAgICBfLm1hcChzaGFyZXJzLFxuICAgICAgICAgIGZ1bmMuZG90KCdjb2lucycpKSxcbiAgICAgICAgICBmdW5jdGlvbihtZW1vLCBjb2lucykge1xuICAgICAgICAgICAgcmV0dXJuIG1lbW8gKyBjb2lucztcbiAgICAgICAgICB9LFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcblxuICAgICAgICBjcmVhdG9yLmNvaW5zID0gdGhpcy5wcm9wcy50b3RhbENvaW5zIC0gc2hhcmVyQ29pbnMgfHwgMDtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBzaGFyZXJzOiB0aGlzLnN0YXRlLnNoYXJlcnMsXG4gICAgICAgICAgY3JlYXRvcjogY3JlYXRvclxuICAgICAgICB9KTtcblxuICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfVxuICB9KTtcblxuICB2YXIgT3duZXJzaGlwUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnT3duZXJzaGlwUm93JyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3duZXJzaGlwOiAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVzZXIgPSB0aGlzLnByb3BzLnVzZXI7XG5cbiAgICAgIGlmICh1c2VyLmVtYWlsKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBnbHlwaGljb24gZ2x5cGhpY29uLWVudmVsb3BlXCJ9KSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICB1c2VyLmVtYWlsXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwIGlucHV0LWdyb3VwLXNtXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3JlZjogXCJvd25lcnNoaXBcIiwgY2xhc3NOYW1lOiBcImZvcm0tY29udHJvbCB0ZXh0LXJpZ2h0XCIsIHR5cGU6IFwibnVtYmVyXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnb3duZXJzaGlwWycgKyB1c2VyLmVtYWlsICsgJ10nLCBcbiAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUub3duZXJzaGlwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlT3duZXJzaGlwQ2hhbmdlZH0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYWRkb25cIn0sIFwiJVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtY29pbnNcIiwgc3R5bGU6IHsnd2hpdGUtc3BhY2UnOlwibm93cmFwXCJ9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW5cIn0pLCBcbiAgICAgICAgICAgICAgICB1c2VyLmNvaW5zXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgb25DbGljazogcHJldmVudERlZmF1bHQodGhpcy5wcm9wcy5vblJlbW92ZSksIGNsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGxpbmstaG92ZXItZGFuZ2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jbG9zZVwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJSZW1vdmVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIEF2YXRhcih7dXNlcjogdXNlcn0pKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgIFwiQFwiLCB1c2VyLnVzZXJuYW1lXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwIGlucHV0LWdyb3VwLXNtXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3JlZjogXCJvd25lcnNoaXBcIiwgY2xhc3NOYW1lOiBcImZvcm0tY29udHJvbCB0ZXh0LXJpZ2h0XCIsIHR5cGU6IFwibnVtYmVyXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnb3duZXJzaGlwWycgKyB1c2VyLmlkICsgJ10nLCBcbiAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUub3duZXJzaGlwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlT3duZXJzaGlwQ2hhbmdlZH0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYWRkb25cIn0sIFwiJVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtY29pbnNcIiwgc3R5bGU6IHsnd2hpdGUtc3BhY2UnOlwibm93cmFwXCJ9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW5cIn0pLCBcbiAgICAgICAgICAgICAgICB1c2VyLmNvaW5zXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgb25DbGljazogcHJldmVudERlZmF1bHQodGhpcy5wcm9wcy5vblJlbW92ZSksIGNsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGxpbmstaG92ZXItZGFuZ2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jbG9zZVwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJSZW1vdmVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBoYW5kbGVPd25lcnNoaXBDaGFuZ2VkOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdmFsID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUsIDEwKTtcblxuICAgICAgaWYgKHZhbCA8IDApIHtcbiAgICAgICAgdmFsID0gMDtcbiAgICAgIH1cblxuICAgICAgdmFyIHVzZXIgPSB0aGlzLnByb3BzLnVzZXI7XG4gICAgICB2YXIgdXNlcnMgPSBDb2luT3duZXJzaGlwU3RvcmUuZ2V0VXNlcnMoKTtcblxuICAgICAgdmFyIHNoYXJlckNvaW5zID0gXy5yZWR1Y2UoXy5tYXAoXy5yZWplY3QodXNlcnMsXG4gICAgICAgIGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICByZXR1cm4gcy51c2VybmFtZSA9PT0gdXNlci51c2VybmFtZVxuICAgICAgICB9KSxcbiAgICAgICAgZnVuYy5kb3QoJ2NvaW5zJykpLFxuICAgICAgICBmdW5jdGlvbihtZW1vLCBjb2lucykge1xuICAgICAgICAgIHJldHVybiBtZW1vICsgY29pbnM7XG4gICAgICAgIH0sXG4gICAgICAwKTtcblxuICAgICAgdmFyIHBlcmNlbnRhZ2VSZW1haW5pbmcgPSAxMDAgLSBNYXRoLmNlaWwoc2hhcmVyQ29pbnMgLyB0aGlzLnByb3BzLnRvdGFsQ29pbnMgKiAxMDApO1xuXG4gICAgICBpZiAodmFsID49IHBlcmNlbnRhZ2VSZW1haW5pbmcpIHtcbiAgICAgICAgdmFsID0gcGVyY2VudGFnZVJlbWFpbmluZztcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG93bmVyc2hpcDogdmFsXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5wcm9wcy5vbk93bmVyc2hpcENoYW5nZWQodmFsKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ29pbk93bmVyc2hpcDtcbiAgfVxuXG4gIHdpbmRvdy5Db2luT3duZXJzaGlwID0gQ29pbk93bmVyc2hpcDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIGF0VXNlcm5hbWUodXNlcikge1xuICAgIHJldHVybiAnQCcgKyB1c2VyLnVzZXJuYW1lXG4gIH1cblxuICBmdW5jdGlvbiBhdmF0YXJVcmwodXNlciwgc2l6ZSkge1xuICAgIGlmICh1c2VyKSB7XG4gICAgICByZXR1cm4gdXNlci5hdmF0YXJfdXJsICsgJz9zPScgKyA0OFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJy9hc3NldHMvYXZhdGFycy9kZWZhdWx0LnBuZydcbiAgICB9XG4gIH1cblxuICB2YXIgQ29yZVRlYW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDb3JlVGVhbScsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IHVzZXJzOiBbXSwgcG90ZW50aWFsVXNlcjogbnVsbCB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udGFibGUoe2NsYXNzTmFtZTogXCJ0YWJsZVwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRib2R5KG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKHtjbGFzc05hbWU6IFwiYWN0aXZlXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe2FsdDogYXRVc2VybmFtZSh0aGlzLnByb3BzLmN1cnJlbnRVc2VyKSwgXG4gICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYXZhdGFyIGltZy1jaXJjbGVcIiwgXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMjRcIiwgd2lkdGg6IFwiMjRcIiwgXG4gICAgICAgICAgICAgICAgICAgICBzcmM6IGF2YXRhclVybCh0aGlzLnByb3BzLmN1cnJlbnRVc2VyLCA0OCl9KVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIGF0VXNlcm5hbWUodGhpcy5wcm9wcy5jdXJyZW50VXNlcikpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcIih5b3UpXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgdGhpcy5yb3dzKCksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgdGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyID8gdGhpcy5hdmF0YXIodGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyKSA6IHRoaXMuYXZhdGFyKG51bGwpKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBQZXJzb25QaWNrZXIoe3JlZjogXCJwaWNrZXJcIiwgdXJsOiBcIi9fZXNcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJTZWxlY3RlZDogdGhpcy5oYW5kbGVVc2VyU2VsZWN0ZWQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZFVzZXJDaGFuZ2VkOiB0aGlzLmhhbmRsZVZhbGlkVXNlckNoYW5nZWR9KVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRCdXR0b24oKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGFkZEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0ZXh0LXN1Y2Nlc3NcIiwgaHJlZjogXCIjXCIsIG9uQ2xpY2s6IHRoaXMuYWRkVXNlckNsaWNrZWR9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLXBsdXMtY2lyY2xlZFwifSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJzci1vbmx5XCJ9LCBcIkFkZFwiKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtc3VjY2Vzc1wifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1wbHVzLWNpcmNsZWRcIn0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJBZGRcIilcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBfLm1hcCh0aGlzLnN0YXRlLnVzZXJzLCBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgcmV0dXJuIE1lbWJlclJvdyh7dXNlcjogdXNlciwgb25SZW1vdmU6IHRoaXMuaGFuZGxlVXNlclJlbW92ZWQodXNlciksIGtleTogdXNlci5pZCB8fCB1c2VyLmVtYWlsfSlcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlclNlbGVjdGVkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB0aGlzLmFkZFVzZXIodXNlcilcbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlclJlbW92ZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHVzZXJzID0gXy5yZWplY3QodGhpcy5zdGF0ZS51c2VycywgZnVuY3Rpb24odSl7XG4gICAgICAgICAgaWYgKHUuaWQpIHtcbiAgICAgICAgICAgIHJldHVybiB1LmlkID09IHVzZXIuaWRcbiAgICAgICAgICB9IGVsc2UgaWYgKHUuZW1haWwpIHtcbiAgICAgICAgICAgIHJldHVybiB1LmVtYWlsID09IHVzZXIuZW1haWxcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3VzZXJzOiB1c2Vyc30pO1xuXG4gICAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgIGV2ZW50OiBDT05TVEFOVFMuQ09JTl9PV05FUlNISVAuRVZFTlRTLlVTRVJfUkVNT1ZFRCxcbiAgICAgICAgICBhY3Rpb246IENPTlNUQU5UUy5DT0lOX09XTkVSU0hJUC5BQ1RJT05TLlJFTU9WRV9VU0VSLFxuICAgICAgICAgIGRhdGE6IHsgdXNlckFuZENvaW5zOiB1c2VyIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0sXG5cbiAgICBoYW5kbGVWYWxpZFVzZXJDaGFuZ2VkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtwb3RlbnRpYWxVc2VyOiB1c2VyfSlcbiAgICB9LFxuXG4gICAgYWRkVXNlckNsaWNrZWQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5hZGRVc2VyKHRoaXMuc3RhdGUucG90ZW50aWFsVXNlcilcbiAgICAgIHRoaXMucmVmcy5waWNrZXIuY2xlYXJUZXh0KClcbiAgICB9LFxuXG4gICAgYWRkVXNlcjogZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZShSZWFjdC5hZGRvbnMudXBkYXRlKHRoaXMuc3RhdGUsIHtcbiAgICAgICAgcG90ZW50aWFsVXNlcjogeyRzZXQ6IG51bGx9LFxuICAgICAgICB1c2VyczogeyAkcHVzaDogW3VzZXJdIH1cbiAgICAgIH0pKVxuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IENPTlNUQU5UUy5DT0lOX09XTkVSU0hJUC5FVkVOVFMuVVNFUl9BRERFRCxcbiAgICAgICAgYWN0aW9uOiBDT05TVEFOVFMuQ09JTl9PV05FUlNISVAuQUNUSU9OUy5BRERfVVNFUixcbiAgICAgICAgZGF0YTogeyB1c2VyQW5kQ29pbnM6IHVzZXIgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGF2YXRhcjogZnVuY3Rpb24odXNlcikge1xuICAgICAgaWYgKHVzZXIgJiYgdXNlci5lbWFpbCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGdseXBoaWNvbiBnbHlwaGljb24tZW52ZWxvcGVcIn0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImF2YXRhciBpbWctY2lyY2xlXCIsIGhlaWdodDogXCIyNFwiLCBzcmM6IGF2YXRhclVybCh1c2VyKSwgd2lkdGg6IFwiMjRcIn0pXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZm4oZSlcbiAgICB9XG4gIH1cblxuICB2YXIgTWVtYmVyUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTWVtYmVyUm93JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAodGhpcy5wcm9wcy51c2VyLmVtYWlsKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBnbHlwaGljb24gZ2x5cGhpY29uLWVudmVsb3BlXCJ9KSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMudXNlci5lbWFpbCksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCB2YWx1ZTogdGhpcy5wcm9wcy51c2VyLmVtYWlsLCBuYW1lOiBcImNvcmVfdGVhbVtdXCJ9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgb25DbGljazogcHJldmVudERlZmF1bHQodGhpcy5wcm9wcy5vblJlbW92ZSksIGNsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGxpbmstaG92ZXItZGFuZ2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jbG9zZVwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJSZW1vdmVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImF2YXRhclwiLCBzcmM6IGF2YXRhclVybCh0aGlzLnByb3BzLnVzZXIsIDQ4KSwgd2lkdGg6IDI0LCBoZWlnaHQ6IDI0fSkpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcIkBcIiwgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3R5cGU6IFwiaGlkZGVuXCIsIHZhbHVlOiB0aGlzLnByb3BzLnVzZXIuaWQsIG5hbWU6IFwiY29yZV90ZWFtW11cIn0pLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wiLCBvbkNsaWNrOiBwcmV2ZW50RGVmYXVsdCh0aGlzLnByb3BzLm9uUmVtb3ZlKSwgY2xhc3NOYW1lOiBcInRleHQtbXV0ZWQgbGluay1ob3Zlci1kYW5nZXJcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWNsb3NlXCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJzci1vbmx5XCJ9LCBcIlJlbW92ZVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENvcmVUZWFtO1xuICB9XG5cbiAgd2luZG93LkNvcmVUZWFtID0gQ29yZVRlYW07XG5cbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgRGVza3RvcE5vdGlmaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEZXNrdG9wTm90aWZpY2F0aW9ucycsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IGVuYWJsZWQ6IGZhbHNlIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlRW5hYmxlZDogZnVuY3Rpb24oZW5hYmxlZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVuYWJsZWQ6IGVuYWJsZWR9KVxuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnN0YXRlLmVuYWJsZWQpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnVwZGF0ZUVuYWJsZWQoIShOb3RpZnkuaXNTdXBwb3J0ZWQoKSAmJiBOb3RpZnkubmVlZHNQZXJtaXNzaW9uKCkpKVxuICAgIH0sXG5cbiAgICBoYW5kbGVDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzXG4gICAgICBOb3RpZnkucmVxdWVzdFBlcm1pc3Npb24oZnVuY3Rpb24oKXtcbiAgICAgICAgX3RoaXMudXBkYXRlRW5hYmxlZCh0cnVlKVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgaWYodGhpcy5zdGF0ZS5lbmFibGVkKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3BhbihudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI2VuYWJsZS1ub3RpZmljYXRpb25zXCIsIGNsYXNzTmFtZTogXCJqcy1lbmFibGUtbm90aWZpY2F0aW9ucyB0ZXh0LXNtYWxsXCIsICdkYXRhLXRvZ2dsZSc6IFwidG9vbHRpcFwiLCAnZGF0YS1wbGFjZW1lbnQnOiBcImxlZnRcIiwgdGl0bGU6IFwiRW5hYmxlwqBkZXNrdG9wIG5vdGlmaWNhdGlvbnMgZm9yIEBtZW50aW9uc1wiLCBvbkNsaWNrOiB0aGlzLmhhbmRsZUNsaWNrfSwgXG4gICAgICAgICAgICBcIkVuYWJsZSBub3RpZmljYXRpb25zXCJcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERlc2t0b3BOb3RpZmljYXRpb25zO1xuICB9XG5cbiAgd2luZG93LkRlc2t0b3BOb3RpZmljYXRpb25zID0gRGVza3RvcE5vdGlmaWNhdGlvbnM7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBEcmFnQW5kRHJvcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0RyYWdBbmREcm9wJyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgZGlzcGxheTogJ25vbmUnLCBvcGFjaXR5OiAxIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uc3Bhbih7aWQ6IFwibG9nby11cGxvYWRcIiwgXG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJpbWctc2hhZG93IGpzLWRyb3B6b25lLXNlbGVjdFwiLCBcbiAgICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ30sIFxuICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI6IHRoaXMub25Nb3VzZUVudGVyLCBcbiAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlOiB0aGlzLm9uTW91c2VMZWF2ZX0sIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiB0aGlzLnByb3BzLnVybCwgXG4gICAgICAgICAgICAgIGFsdDogdGhpcy5wcm9wcy5hbHQsIFxuICAgICAgICAgICAgICBzdHlsZToge29wYWNpdHk6IHRoaXMuc3RhdGUub3BhY2l0eX0sIFxuICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiaW1nLXJvdW5kZWRcIiwgXG4gICAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIn0pLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtzdHlsZToge1xuICAgICAgICAgICAgICBkaXNwbGF5OiB0aGlzLnN0YXRlLmRpc3BsYXksXG4gICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAndGV4dC1hbGlnbic6ICdjZW50ZXInLFxuICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAnei1pbmRleCc6IC0xLFxuICAgICAgICAgICAgICB0b3A6ICc0MCUnLFxuICAgICAgICAgICAgICAnZm9udC1zaXplJzogJzEycHgnLFxuICAgICAgICAgICAgICAnZm9udC13ZWlnaHQnOiAnYm9sZCdcbiAgICAgICAgICB9fSwgXG4gICAgICAgICAgICBcIkRyYWcgYW5kIGRyb3Agb3IgY2xpY2sgaGVyZVwiLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5icihudWxsKSwgXG4gICAgICAgICAgICBcInRvIGNoYW5nZSB0aGUgbG9nb1wiXG4gICAgICAgICAgKVxuXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gVE9ETzogRml4IHRoaXMgZ29kYXdmdWwgaGFja1xuICAgICAgdmFyIF90aW1lb3V0LFxuICAgICAgICAgIG5vZGUgPSB0aGlzLmdldERPTU5vZGUoKTtcblxuICAgICAgJChub2RlKS5iaW5kKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgLy8gcHJldmVudCBqaXR0ZXJzXG4gICAgICAgIGlmIChfdGltZW91dCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChfdGltZW91dCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgICAgICAgIG9wYWNpdHk6IDAuNVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAkKG5vZGUpLmJpbmQoJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGlzcGxheTogJ25vbmUnLFxuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbk1vdXNlRW50ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgICAgICBvcGFjaXR5OiAwLjVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbk1vdXNlTGVhdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBkaXNwbGF5OiAnbm9uZScsXG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEcmFnQW5kRHJvcDtcbiAgfVxuXG4gIHdpbmRvdy5EcmFnQW5kRHJvcCA9IERyYWdBbmREcm9wO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBOZXdzRmVlZE1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL25ld3NfZmVlZC5qcy5qc3gnKTtcbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xudmFyIEF2YXRhciA9IHJlcXVpcmUoJy4vYXZhdGFyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIE5GID0gQ09OU1RBTlRTLk5FV1NfRkVFRDtcblxuICB2YXIgRHJvcGRvd25OZXdzRmVlZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0Ryb3Bkb3duTmV3c0ZlZWQnLFxuICAgIG1peGluczogW05ld3NGZWVkTWl4aW5dLFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIE5ld3NGZWVkU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5nZXRTdG9yaWVzKTtcblxuICAgICAgdGhpcy5mZXRjaE5ld3NGZWVkKHRoaXMucHJvcHMudXJsKTtcblxuICAgICAgdGhpcy5vblB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hOZXdzRmVlZCgpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hOZXdzRmVlZDogXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IE5GLkFDVElPTlMuRkVUQ0hfU1RPUklFUyxcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5TVE9SSUVTX0ZFVENIRUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMudXJsXG4gICAgICB9KTtcbiAgICB9LCAxMDAwKSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdG9yaWVzOiBudWxsXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBtYXJrQWxsQXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogTkYuRVZFTlRTLlJFQURfQUxMLFxuICAgICAgICBhY3Rpb246IE5GLkFDVElPTlMuTUFSS19BTExfQVNfUkVBRCxcbiAgICAgICAgZGF0YTogbnVsbFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUHVzaDogZnVuY3Rpb24oZm4pIHtcbiAgICAgIGlmICh3aW5kb3cucHVzaGVyKSB7XG4gICAgICAgIGNoYW5uZWwgPSB3aW5kb3cucHVzaGVyLnN1YnNjcmliZSgnQCcgKyB0aGlzLnByb3BzLnVzZXJuYW1lKTtcbiAgICAgICAgY2hhbm5lbC5iaW5kX2FsbChmbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51XCIsIHN0eWxlOiB7ICdtYXgtaGVpZ2h0JzogJzUwMHB4JywgJ21pbi13aWR0aCc6ICczODBweCd9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtzdHlsZTogeyAnb3ZlcmZsb3cteSc6ICdzY3JvbGwnfSwgcmVmOiBcInNwaW5uZXJcIn0sIFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zdG9yaWVzID8gdGhpcy5yb3dzKHRoaXMuc3RhdGUuc3RvcmllcykgOiBudWxsXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJkaXZpZGVyXCIsIHN0eWxlOiB7ICdtYXJnaW4tdG9wJzogJzBweCd9fSksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMuZWRpdFVzZXJQYXRoLCBjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwifSwgXCJTZXR0aW5nc1wiKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI21hcmstYXMtcmVhZFwiLCBjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwiLCBvbkNsaWNrOiB0aGlzLm1hcmtBbGxBc1JlYWR9LCBcIk1hcmsgYWxsIGFzIHJlYWRcIilcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIi9ub3RpZmljYXRpb25zXCIsIGNsYXNzTmFtZTogXCJ0ZXh0LXNtYWxsXCJ9LCBcIkFsbCBOb3RpZmljYXRpb25zXCIpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbihzdG9yaWVzKSB7XG4gICAgICB2YXIgcm93cyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0b3JpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChpID4gOSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcm93cy5wdXNoKFxuICAgICAgICAgIEVudHJ5KHtzdG9yeTogc3Rvcmllc1tpXSwgYWN0b3JzOiB0aGlzLnN0YXRlLmFjdG9ycywgZnVsbFBhZ2U6IHRoaXMucHJvcHMuZnVsbFBhZ2V9KVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGlzdC1ncm91cFwiLCBzdHlsZTogeyAnbWF4LWhlaWdodCc6ICczMDBweCcsICdtaW4taGVpZ2h0JzogJzUwcHgnfX0sIFxuICAgICAgICAgIHJvd3NcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc3Bpbm5lck9wdGlvbnM6IHtcbiAgICAgIGxpbmVzOiAxMSxcbiAgICAgIHRvcDogJzIwJSdcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBFbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0VudHJ5JyxcbiAgICBhY3RvcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWFwKFxuICAgICAgICB0aGlzLnByb3BzLnN0b3J5LmFjdG9yX2lkcyxcbiAgICAgICAgZnVuY3Rpb24oYWN0b3JJZCkge1xuICAgICAgICAgIHJldHVybiBfLmZpbmRXaGVyZSh0aGlzLnByb3BzLmFjdG9ycywgeyBpZDogYWN0b3JJZCB9KVxuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGJvZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRhcmdldCA9IHRoaXMucHJvcHMuc3RvcnkuYWN0aXZpdGllc1swXS50YXJnZXQ7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIFxuICAgICAgICAgIHRoaXMudmVyYk1hcFt0aGlzLnByb3BzLnN0b3J5LnZlcmJdLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFxuICAgICAgICAgICAgdGhpcy5zdWJqZWN0TWFwW3RoaXMucHJvcHMuc3Rvcnkuc3ViamVjdF90eXBlXS5jYWxsKHRoaXMsIHRhcmdldClcbiAgICAgICAgICApLCBcbiAgICAgICAgICB0aGlzLnByb2R1Y3QoKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5yZWZzLmJvZHkpIHtcbiAgICAgICAgdGhpcy5yZWZzLmJvZHkuZ2V0RE9NTm9kZSgpLmlubmVySFRNTCA9IHRoaXMucHJvcHMuc3Rvcnkuc3ViamVjdC5ib2R5X2h0bWw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGVsbGlwc2lzOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA+IDQwKSB7XG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCA0MCkgKyAn4oCmJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdG9yeTogdGhpcy5wcm9wcy5zdG9yeVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLnN0b3J5Lmxhc3RfcmVhZF9hdCAhPT0gMDtcbiAgICB9LFxuXG4gICAgbWFya0FzUmVhZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBGSVhNRTogVGhpcyBtZXRob2Qgc2hvdWxkbid0IHdvcmsgdGhpcyB3YXk7IHVzZSB0aGUgRGlzcGF0Y2hlclxuICAgICAgdmFyIHN0b3J5ID0gdGhpcy5zdGF0ZS5zdG9yeTtcbiAgICAgIHN0b3J5Lmxhc3RfcmVhZF9hdCA9IG1vbWVudCgpLnVuaXgoKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHN0b3J5OiBzdG9yeVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG1hcmtBc1JlYWRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmlzUmVhZCgpKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1kaXNjIHB1bGwtcmlnaHRcIiwgb25DbGljazogdGhpcy5tYXJrQXNSZWFkLCB0aXRsZTogJ01hcmsgYXMgcmVhZCcsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfX0pO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBNYXJrIGFzIHVucmVhZFxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWNpcmNsZSBwdWxsLXJpZ2h0XCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfX0pXG4gICAgfSxcblxuICAgIHByZXZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJvZHlfcHJldmlldyA9IHRoaXMucHJvcHMuc3RvcnkuYm9keV9wcmV2aWV3O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIiwgc3R5bGU6IHsgJ3RleHQtb3ZlcmZsb3cnOiAnZWxsaXBzaXMnfX0sIFxuICAgICAgICAgIHRoaXMuZWxsaXBzaXMoYm9keV9wcmV2aWV3KVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBwcm9kdWN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9kdWN0ID0gdGhpcy5wcm9wcy5zdG9yeS5wcm9kdWN0O1xuXG4gICAgICByZXR1cm4gJyBpbiAnICsgcHJvZHVjdC5uYW1lO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFjdG9ycyA9IF8ubWFwKHRoaXMuYWN0b3JzKCksIGZ1bmMuZG90KCd1c2VybmFtZScpKS5qb2luKCcsIEAnKVxuXG4gICAgICB2YXIgY2xhc3NlcyA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldCh7XG4gICAgICAgICdlbnRyeS1yZWFkJzogdGhpcy5pc1JlYWQoKSxcbiAgICAgICAgJ2VudHJ5LXVucmVhZCc6ICF0aGlzLmlzUmVhZCgpLFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6ICdsaXN0LWdyb3VwLWl0ZW0gJyArIGNsYXNzZXMsIFxuICAgICAgICAgICAgaHJlZjogdGhpcy5wcm9wcy5zdG9yeS51cmwsIFxuICAgICAgICAgICAgc3R5bGU6IHsgJ2ZvbnQtc2l6ZSc6ICcxNHB4J30sIFxuICAgICAgICAgICAgb25DbGljazogdGhpcy5zdGF0ZS5zdG9yeS5sYXN0X3JlYWRfYXQgPyBudWxsIDogdGhpcy5tYXJrQXNSZWFkfSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtMVwifSwgXG4gICAgICAgICAgICAgIEF2YXRhcih7dXNlcjogdGhpcy5hY3RvcnMoKVswXSwgc2l6ZTogMTh9KSwgXCLCoFwiXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC0xMFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgYWN0b3JzKSwgXCIgXCIsIHRoaXMuYm9keSgpLCBcbiAgICAgICAgICAgICAgdGhpcy5wcmV2aWV3KClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLW1kLTFcIn0sIFxuICAgICAgICAgICAgICB0aGlzLm1hcmtBc1JlYWRCdXR0b24oKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc3ViamVjdE1hcDoge1xuICAgICAgVGFzazogZnVuY3Rpb24odGFzaykge1xuICAgICAgICByZXR1cm4gXCIjXCIgKyB0YXNrLm51bWJlcjtcbiAgICAgIH0sXG5cbiAgICAgIERpc2N1c3Npb246IGZ1bmN0aW9uKGRpc2N1c3Npb24pIHtcbiAgICAgICAgcmV0dXJuICdkaXNjdXNzaW9uJ1xuICAgICAgfSxcblxuICAgICAgV2lwOiBmdW5jdGlvbihib3VudHkpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZnVsbFBhZ2UpIHtcbiAgICAgICAgICByZXR1cm4gXCIjXCIgKyBib3VudHkubnVtYmVyICsgXCIgXCIgKyBib3VudHkudGl0bGVcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBcIiNcIiArIGJvdW50eS5udW1iZXI7XG4gICAgICB9LFxuICAgIH0sXG5cbiAgICB0aW1lc3RhbXA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG1vbWVudCh0aGlzLnByb3BzLnN0b3J5LmNyZWF0ZWQpLmZvcm1hdChcImRkZCwgaEFcIilcbiAgICB9LFxuXG4gICAgdmVyYk1hcDoge1xuICAgICAgJ0NvbW1lbnQnOiAnY29tbWVudGVkIG9uICcsXG4gICAgICAnQXdhcmQnOiAnYXdhcmRlZCAnLFxuICAgICAgJ0Nsb3NlJzogJ2Nsb3NlZCAnXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERyb3Bkb3duTmV3c0ZlZWQ7XG4gIH1cblxuICB3aW5kb3cuRHJvcGRvd25OZXdzRmVlZCA9IERyb3Bkb3duTmV3c0ZlZWQ7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBEcm9wZG93blRvZ2dsZXJNaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9kcm9wZG93bl90b2dnbGVyLmpzLmpzeCcpO1xudmFyIE5ld3NGZWVkU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIE5GID0gQ09OU1RBTlRTLk5FV1NfRkVFRDtcblxuICB2YXIgRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEcm9wZG93bk5ld3NGZWVkVG9nZ2xlcicsXG4gICAgbWl4aW5zOiBbRHJvcGRvd25Ub2dnbGVyTWl4aW5dLFxuXG4gICAgYWNrbm93bGVkZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbWVzdGFtcCA9IG1vbWVudCgpLnVuaXgoKTtcblxuICAgICAgbG9jYWxTdG9yYWdlLm5ld3NGZWVkQWNrID0gdGltZXN0YW1wO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgYWNrbm93bGVkZ2VkQXQ6IHRpbWVzdGFtcFxuICAgICAgfSk7XG5cbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogTkYuRVZFTlRTLkFDS05PV0xFREdFRCxcbiAgICAgICAgYWN0aW9uOiBORi5BQ1RJT05TLkFDS05PV0xFREdFLFxuICAgICAgICBkYXRhOiB0aW1lc3RhbXAsXG4gICAgICAgIHN5bmM6IHRydWVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBiYWRnZTogZnVuY3Rpb24odG90YWwpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImJhZGdlIGJhZGdlLW5vdGlmaWNhdGlvblwifSwgdG90YWwpO1xuICAgIH0sXG5cbiAgICBiYWRnZUNvdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmxhdGVzdFN0b3J5VGltZXN0YW1wKCkgPiB0aGlzLnN0YXRlLmFja25vd2xlZGdlZEF0KSB7XG4gICAgICAgIHJldHVybiBOZXdzRmVlZFN0b3JlLmdldFVucmVhZENvdW50KHRoaXMuc3RhdGUuYWNrbm93bGVkZ2VkQXQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gMDtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIE5ld3NGZWVkU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5nZXRTdG9yaWVzKTtcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBkb2N1bWVudC50aXRsZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0b3JpZXM6IG51bGwsXG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aGlzLnN0b3JlZEFjaygpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRTdG9yaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzdG9yaWVzOiBOZXdzRmVlZFN0b3JlLmdldFN0b3JpZXMoKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGxhdGVzdFN0b3J5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzdG9yaWVzID0gdGhpcy5zdGF0ZS5zdG9yaWVzO1xuXG4gICAgICBpZiAoIXN0b3JpZXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3Rvcnk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0b3JpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChzdG9yeSAmJiBzdG9yaWVzW2ldLnVwZGF0ZWQgPiBzdG9yeS51cGRhdGVkKSB7XG4gICAgICAgICAgc3RvcnkgPSBzdG9yaWVzW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdG9yeSkge1xuICAgICAgICAgIHN0b3J5ID0gc3Rvcmllc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3Rvcnk7XG4gICAgfSxcblxuICAgIGxhdGVzdFN0b3J5VGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzdG9yeSA9IHRoaXMubGF0ZXN0U3RvcnkoKTtcblxuICAgICAgcmV0dXJuIHN0b3J5ICYmIHN0b3J5LnVwZGF0ZWQgPyBzdG9yeS51cGRhdGVkIDogMDtcbiAgICB9LFxuXG4gICAgc3RvcmVkQWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBsb2NhbFN0b3JhZ2UubmV3c0ZlZWRBY2s7XG5cbiAgICAgIGlmICh0aW1lc3RhbXAgPT0gbnVsbCB8fCB0aW1lc3RhbXAgPT09ICdudWxsJykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aW1lc3RhbXAsIDEwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXI7XG4gIH1cblxuICB3aW5kb3cuRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXIgPSBEcm9wZG93bk5ld3NGZWVkVG9nZ2xlcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gVE9ETzogVGlkeSB1cCBzaGFyZWQgc3RhdGVcblxuLyoqXG4gKiBSaWdodCBub3csIGJvdGggdGhlIHRhYmxlIGFuZCB0aGUgbWV0ZXIgaGF2ZVxuICogYWxsIG9mIHRoZSBmaW5hbmNpYWxzIGluIHN0YXRlOyBpdCB3b3VsZCBiZVxuICogYmV0dGVyIHRvIG1vdmUgYWxsIG9mIHRoaXMgdG8gdGhlIEZpbmFuY2lhbHNTdG9yZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEZpbmFuY2lhbHNTdG9yZSA9IHtcbiAgICBtb250aDogJ0p1bmUnLFxuICAgIGdldE1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLm1vbnRoO1xuICAgIH0sXG5cbiAgICBzZXRNb250aDogZnVuY3Rpb24obW9udGgpIHtcbiAgICAgIHRoaXMubW9udGggPSBtb250aDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIEZpbmFuY2lhbHNBY3Rpb25zID0ge1xuICAgIGFkZENoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgdGhpcy5saXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycyB8fCBbXTtcbiAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2goY2FsbGJhY2spXG4gICAgfSxcblxuICAgIHNlbmRDaGFuZ2U6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICBfLmVhY2godGhpcy5saXN0ZW5lcnMsIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKHN0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICB2YXIgRmluYW5jaWFscyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ZpbmFuY2lhbHMnLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmluYW5jaWFsczoge1xuICAgICAgICAgIEphbnVhcnk6IDI3NzMyLFxuICAgICAgICAgIEZlYnJ1YXJ5OiAyMDcwNCxcbiAgICAgICAgICBNYXJjaDogMzQwMjAsXG4gICAgICAgICAgQXByaWw6IDMwMDc0LFxuICAgICAgICAgIE1heTogMjY2MzIsXG4gICAgICAgICAgSnVuZTogMjczMzRcbiAgICAgICAgfSxcbiAgICAgICAgZXhwZW5zZXM6IHtcbiAgICAgICAgICBKYW51YXJ5OiAyOTk4LFxuICAgICAgICAgIEZlYnJ1YXJ5OiA0MDI0LFxuICAgICAgICAgIE1hcmNoOiAzMzYzLFxuICAgICAgICAgIEFwcmlsOiAzNDMzLFxuICAgICAgICAgIE1heTogMzQ3NCxcbiAgICAgICAgICBKdW5lOiAzNDg3XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5hbWUgPSB0aGlzLnByb3BzLnByb2R1Y3QubmFtZTtcbiAgICAgIHZhciBjb3N0cyA9IHRoaXMuc3RhdGUuZXhwZW5zZXNbRmluYW5jaWFsc1N0b3JlLmdldE1vbnRoKCldO1xuICAgICAgdmFyIGFubnVpdHkgPSBcIjE4MDAwXCI7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJmaW5hbmNpYWxzXCJ9LCBcbiAgICAgICAgICBGaW5hbmNpYWxzS2V5KHtcbiAgICAgICAgICAgICAgcHJvZHVjdDogdGhpcy5wcm9wcy5wcm9kdWN0fVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgRmluYW5jaWFsc01ldGVyKHtcbiAgICAgICAgICAgICAgcHJvZHVjdDogdGhpcy5wcm9wcy5wcm9kdWN0LCBcbiAgICAgICAgICAgICAgZmluYW5jaWFsczogdGhpcy5zdGF0ZS5maW5hbmNpYWxzLCBcbiAgICAgICAgICAgICAgY29zdHM6IHRoaXMuc3RhdGUuZXhwZW5zZXMsIFxuICAgICAgICAgICAgICBhbm51aXR5OiBhbm51aXR5fVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgRmluYW5jaWFsc1RhYmxlKHtcbiAgICAgICAgICAgICAgcHJvZHVjdDogdGhpcy5wcm9wcy5wcm9kdWN0LCBcbiAgICAgICAgICAgICAgZmluYW5jaWFsczogdGhpcy5zdGF0ZS5maW5hbmNpYWxzLCBcbiAgICAgICAgICAgICAgY29zdHM6IHRoaXMuc3RhdGUuZXhwZW5zZXMsIFxuICAgICAgICAgICAgICBhbm51aXR5OiBhbm51aXR5fVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBGaW5hbmNpYWxzS2V5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRmluYW5jaWFsc0tleScsXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtb250aDogRmluYW5jaWFsc1N0b3JlLmdldE1vbnRoKClcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIEZpbmFuY2lhbHNBY3Rpb25zLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVE9ETzogQnJlYWsgb3V0IGRsLWlubGluZSBzdHlsZXMgaW50byByZXVzYWJsZSBTQ1NTIGNvbXBvbmVudHNcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRsKHtjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZHQoe3N0eWxlOiB7J3dpZHRoJzogJzEwcHgnLCAnaGVpZ2h0JzogJzEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgJ2JhY2tncm91bmQtY29sb3InOiAnIzQ4YTNlZCd9fSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRkKHtzdHlsZTogeydtYXJnaW4tbGVmdCc6ICc1cHgnLCAnbWFyZ2luLXJpZ2h0JzogJzE1cHgnLCBkaXNwbGF5OiAnaW5saW5lJywgY2xlYXI6ICdsZWZ0J319LCB0aGlzLnByb3BzLnByb2R1Y3QubmFtZSwgXCIgYW5udWl0eVwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZHQoe3N0eWxlOiB7J3dpZHRoJzogJzEwcHgnLCAnaGVpZ2h0JzogJzEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgJ2JhY2tncm91bmQtY29sb3InOiAnI2Y5MzIzMid9fSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRkKHtzdHlsZTogeydtYXJnaW4tbGVmdCc6ICc1cHgnLCAnbWFyZ2luLXJpZ2h0JzogJzE1cHgnLCBkaXNwbGF5OiAnaW5saW5lJywgY2xlYXI6ICdsZWZ0J319LCBcIkV4cGVuc2VzIChob3N0aW5nLCBtYWludGVuYW5jZSwgZXRjLilcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmR0KHtzdHlsZTogeyd3aWR0aCc6ICcxMHB4JywgJ2hlaWdodCc6ICcxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmZDZiMmYnfX0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kZCh7c3R5bGU6IHsnbWFyZ2luLWxlZnQnOiAnNXB4JywgJ21hcmdpbi1yaWdodCc6ICcxNXB4JywgZGlzcGxheTogJ2lubGluZScsIGNsZWFyOiAnbGVmdCd9fSwgXCJBc3NlbWJseVwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZHQoe3N0eWxlOiB7J3dpZHRoJzogJzEwcHgnLCAnaGVpZ2h0JzogJzEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgJ2JhY2tncm91bmQtY29sb3InOiAnI2U5YWQxYSd9fSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRkKHtzdHlsZTogeydtYXJnaW4tbGVmdCc6ICc1cHgnLCAnbWFyZ2luLXJpZ2h0JzogJzE1cHgnLCBkaXNwbGF5OiAnaW5saW5lJywgY2xlYXI6ICdsZWZ0J319LCBcIkFwcCBDb2luIGhvbGRlcnNcIilcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIHRoaXMuc3RhdGUubW9udGgpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9vbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEZpbmFuY2lhbHNNZXRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ZpbmFuY2lhbHNNZXRlcicsXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtb250aDogRmluYW5jaWFsc1N0b3JlLmdldE1vbnRoKClcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIEZpbmFuY2lhbHNBY3Rpb25zLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKVxuICAgIH0sXG5cbiAgICBfb25DaGFuZ2U6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpIH0pXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbmFtZSA9IHRoaXMucHJvcHMucHJvZHVjdC5uYW1lO1xuICAgICAgdmFyIHRvdGFsID0gdGhpcy5wcm9wcy5maW5hbmNpYWxzW3RoaXMuc3RhdGUubW9udGhdO1xuICAgICAgdmFyIGNvc3RzID0gdGhpcy5wcm9wcy5jb3N0c1t0aGlzLnN0YXRlLm1vbnRoXTtcblxuICAgICAgdmFyIGFubnVpdHkgPSBjYWxjdWxhdGVBbm51aXR5KHRvdGFsLCBjb3N0cywgdGhpcy5wcm9wcy5hbm51aXR5KTtcbiAgICAgIHZhciBleHBlbnNlcyA9IGNhbGN1bGF0ZUV4cGVuc2VzKHRvdGFsLCBjb3N0cyk7XG4gICAgICB2YXIgY29tbXVuaXR5U2hhcmUgPSBjYWxjdWxhdGVDb21tdW5pdHlTaGFyZSh0b3RhbCwgY29zdHMsIHRoaXMucHJvcHMuYW5udWl0eSk7XG4gICAgICB2YXIgYXNzZW1ibHlTaGFyZSA9IGNvbW11bml0eVNoYXJlICogMC4xO1xuICAgICAgY29tbXVuaXR5U2hhcmUgPSBjb21tdW5pdHlTaGFyZSAtIGFzc2VtYmx5U2hhcmU7XG5cbiAgICAgIHZhciBhbm51aXR5V2lkdGggPSBhbm51aXR5IC8gdG90YWwgKiAxMDA7XG4gICAgICB2YXIgY29zdHNXaWR0aCA9IGV4cGVuc2VzIC8gdG90YWwgKiAxMDA7XG4gICAgICB2YXIgY29tbXVuaXR5V2lkdGggPSBjb21tdW5pdHlTaGFyZSAvIHRvdGFsICogMTAwO1xuICAgICAgdmFyIGFzc2VtYmx5V2lkdGggPSBhc3NlbWJseVNoYXJlIC8gdG90YWwgKiAxMDAgO1xuXG4gICAgICBpZiAoYXNzZW1ibHlTaGFyZSA+IDApIHtcbiAgICAgICAgYXNzZW1ibHlXaWR0aCArPSA1O1xuICAgICAgICBhbm51aXR5V2lkdGggLT0gNTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInByb2dyZXNzXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtpZDogbmFtZSArICctbWV0ZXInLCBcbiAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICByb2xlOiBcInByb2dyZXNzLWJhclwiLCBcbiAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiBhbm51aXR5V2lkdGggKyAnJSd9fSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCAnJCcgKyBudW1lcmFsKGFubnVpdHkpLmZvcm1hdCgnMCwwJykpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IFwiY29zdHMtc2hhcmVcIiwgXG4gICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1kYW5nZXJcIiwgXG4gICAgICAgICAgICAgICByb2xlOiBcInByb2dyZXNzLWJhclwiLCBcbiAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiBjb3N0c1dpZHRoICsgJyUnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgJyQnICsgbnVtZXJhbChleHBlbnNlcykuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtpZDogXCJhc3NlbWJseS1zaGFyZVwiLCBcbiAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICByb2xlOiBcInByb2dyZXNzLWJhclwiLCBcbiAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiBhc3NlbWJseVdpZHRoICsgJyUnLCAnYmFja2dyb3VuZC1jb2xvcic6ICcjZmQ2YjJmJ319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsICckJyArIG51bWVyYWwoYXNzZW1ibHlTaGFyZSkuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtpZDogXCJjb21tdW5pdHktbWV0ZXJcIiwgXG4gICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci13YXJuaW5nXCIsIFxuICAgICAgICAgICAgICAgcm9sZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogY29tbXVuaXR5V2lkdGggKyAnJSd9fSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCAnJCcgKyBudW1lcmFsKGNvbW11bml0eVNoYXJlKS5mb3JtYXQoJzAsMCcpKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBGaW5hbmNpYWxzVGFibGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGaW5hbmNpYWxzVGFibGUnLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBGaW5hbmNpYWxzQWN0aW9ucy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSlcbiAgICB9LFxuXG4gICAgX29uQ2hhbmdlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vbnRoOiBGaW5hbmNpYWxzU3RvcmUuZ2V0TW9udGgoKSB9KVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5hbWUgPSB0aGlzLnByb3BzLnByb2R1Y3QubmFtZTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRhYmxlLXJlc3BvbnNpdmVcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS50YWJsZSh7Y2xhc3NOYW1lOiBcInRhYmxlIHRhYmxlLWhvdmVyXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50aGVhZChudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1sZWZ0XCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiVG90YWwgcmV2ZW51ZVwiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgICBcIkV4cGVuc2VzXCJcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiQXNzZW1ibHlcIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgICAgXCJBcHAgQ29pbiBob2xkZXJzXCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRib2R5KG51bGwsIFxuICAgICAgICAgICAgICB0aGlzLnRCb2R5KClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRCb2R5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBmaW5hbmNpYWxzID0gdGhpcy5wcm9wcy5maW5hbmNpYWxzO1xuXG4gICAgICByZXR1cm4gXy5tYXAoT2JqZWN0LmtleXMoZmluYW5jaWFscyksIGZ1bmN0aW9uIG1hcEZpbmFuY2lhbHMobW9udGgpIHtcbiAgICAgICAgdmFyIHRvdGFsID0gZmluYW5jaWFsc1ttb250aF07XG4gICAgICAgIHZhciBjb3N0cyA9IHNlbGYucHJvcHMuY29zdHNbbW9udGhdO1xuXG4gICAgICAgIHZhciBwcm9maXQgPSBjYWxjdWxhdGVQcm9maXQodG90YWwsIGNvc3RzKTtcbiAgICAgICAgdmFyIGFubnVpdHkgPSBjYWxjdWxhdGVBbm51aXR5KHRvdGFsLCBjb3N0cywgc2VsZi5wcm9wcy5hbm51aXR5KTtcbiAgICAgICAgdmFyIGV4cGVuc2VzID0gY2FsY3VsYXRlRXhwZW5zZXModG90YWwsIGNvc3RzKTtcbiAgICAgICAgdmFyIGNvbW11bml0eVNoYXJlID0gY2FsY3VsYXRlQ29tbXVuaXR5U2hhcmUodG90YWwsIGNvc3RzLCBzZWxmLnByb3BzLmFubnVpdHkpO1xuICAgICAgICB2YXIgYXNzZW1ibHlTaGFyZSA9IGNvbW11bml0eVNoYXJlICogMC4xO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgc2VsZi50Um93KG1vbnRoLCB0b3RhbCwgYW5udWl0eSwgZXhwZW5zZXMsIGFzc2VtYmx5U2hhcmUsIGNvbW11bml0eVNoYXJlKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHRSb3c6IGZ1bmN0aW9uKG1vbnRoLCB0b3RhbCwgYW5udWl0eSwgY29zdHMsIGFzc2VtYmx5LCBjb21tdW5pdHkpIHtcbiAgICAgIHZhciBtdXRlZCA9ICcnO1xuICAgICAgaWYgKFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknXS5pbmRleE9mKG1vbnRoKSA+PSAwKSB7XG4gICAgICAgIG11dGVkID0gJyB0ZXh0LW11dGVkJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnRyKHtzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfSwgb25Nb3VzZU92ZXI6IHRoaXMubW9udGhDaGFuZ2VkKG1vbnRoKSwga2V5OiBtb250aH0sIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7aWQ6ICdmaW5hbmNpYWxzLScgKyBtb250aH0sIG1vbnRoKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsICckJyArIG51bWVyYWwodG90YWwpLmZvcm1hdCgnMCwwJykpLCBcbiAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCAnJCcgKyBudW1lcmFsKGNvc3RzKS5mb3JtYXQoJzAsMCcpKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgJyQnICsgbnVtZXJhbChhbm51aXR5KS5mb3JtYXQoJzAsMCcpKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwiICsgbXV0ZWR9LCAnJCcgKyBudW1lcmFsKGFzc2VtYmx5KS5mb3JtYXQoJzAsMCcpKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwiICsgbXV0ZWR9LCAnJCcgKyBudW1lcmFsKGNvbW11bml0eSAtIGFzc2VtYmx5KS5mb3JtYXQoJzAsMCcpKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBtb250aENoYW5nZWQ6IGZ1bmN0aW9uKG1vbnRoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBGaW5hbmNpYWxzU3RvcmUuc2V0TW9udGgobW9udGgpO1xuICAgICAgICBGaW5hbmNpYWxzQWN0aW9ucy5zZW5kQ2hhbmdlKG1vbnRoKTtcbiAgICAgIH07XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBjYWxjdWxhdGVQcm9maXQodG90YWwsIGNvc3RzKSB7XG4gICAgdG90YWwgPSBwYXJzZUludCh0b3RhbCwgMTApO1xuICAgIGNvc3RzID0gcGFyc2VJbnQoY29zdHMsIDEwKTtcblxuICAgIHJldHVybiB0b3RhbCAtIGNvc3RzO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlRXhwZW5zZXModG90YWwsIGNvc3RzKSB7XG4gICAgdG90YWwgPSBwYXJzZUludCh0b3RhbCwgMTApO1xuICAgIGNvc3RzID0gcGFyc2VJbnQoY29zdHMsIDEwKTtcblxuICAgIHJldHVybiBjb3N0cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZUFubnVpdHkodG90YWwsIGNvc3RzLCBhbm51aXR5KSB7XG4gICAgdG90YWwgPSBwYXJzZUludCh0b3RhbCwgMTApO1xuICAgIGNvc3RzID0gY2FsY3VsYXRlRXhwZW5zZXModG90YWwsIHBhcnNlSW50KGNvc3RzLCAxMCkpO1xuICAgIGFubnVpdHkgPSBwYXJzZUludChhbm51aXR5LCAxMCk7XG5cbiAgICB2YXIgcHJvZml0ID0gY2FsY3VsYXRlUHJvZml0KHRvdGFsLCBjb3N0cyk7XG5cbiAgICByZXR1cm4gcHJvZml0IDwgYW5udWl0eSA/IHByb2ZpdCA6IGFubnVpdHk7XG4gIH1cblxuICBmdW5jdGlvbiBjYWxjdWxhdGVDb21tdW5pdHlTaGFyZSh0b3RhbCwgY29zdHMsIGFubnVpdHkpIHtcbiAgICB0b3RhbCA9IHBhcnNlSW50KHRvdGFsLCAxMCk7XG4gICAgY29zdHMgPSBjYWxjdWxhdGVFeHBlbnNlcyh0b3RhbCwgcGFyc2VJbnQoY29zdHMsIDEwKSk7XG4gICAgYW5udWl0eSA9IHBhcnNlSW50KGFubnVpdHksIDEwKTtcblxuICAgIHZhciBwcm9maXQgPSBjYWxjdWxhdGVQcm9maXQodG90YWwsIGNvc3RzKTtcblxuICAgIHJldHVybiBwcm9maXQgPCBhbm51aXR5ID8gMCA6IHByb2ZpdCAtIGFubnVpdHk7XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEZpbmFuY2lhbHM7XG4gIH1cblxuICB3aW5kb3cuRmluYW5jaWFscyA9IEZpbmFuY2lhbHM7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEZvcm1Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0Zvcm1Hcm91cCcsXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IGVycm9yOiBudWxsIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjbGFzc2VzID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0KHtcbiAgICAgICAgJ2Zvcm0tZ3JvdXAnOiB0cnVlLFxuICAgICAgICAnaGFzLWVycm9yJzogdGhpcy5wcm9wcy5lcnJvcixcbiAgICAgICAgJ2hhcy1mZWVkYmFjayc6IHRoaXMucHJvcHMuZXJyb3JcbiAgICAgIH0pXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGNsYXNzZXN9LCBcbiAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuLCBcbiAgICAgICAgICB0aGlzLnByb3BzLmVycm9yID8gdGhpcy5lcnJvckdseXBoKCkgOiBudWxsLCBcbiAgICAgICAgICB0aGlzLnByb3BzLmVycm9yID8gdGhpcy5lcnJvck1lc3NhZ2UoKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBlcnJvckdseXBoOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlIGZvcm0tY29udHJvbC1mZWVkYmFja1wifSlcbiAgICB9LFxuXG4gICAgZXJyb3JNZXNzYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImhlbHAtYmxvY2tcIn0sIHRoaXMucHJvcHMuZXJyb3IpXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEZvcm1Hcm91cDtcbiAgfVxuXG4gIHdpbmRvdy5Gb3JtR3JvdXAgPSBGb3JtR3JvdXA7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIE5ld3NGZWVkTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvbmV3c19mZWVkLmpzLmpzeCcpO1xudmFyIE5ld3NGZWVkU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3N0b3JlJyk7XG52YXIgQXZhdGFyID0gcmVxdWlyZSgnLi9hdmF0YXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIE5GID0gQ09OU1RBTlRTLk5FV1NfRkVFRDtcblxuICB2YXIgRnVsbFBhZ2VOZXdzRmVlZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0Z1bGxQYWdlTmV3c0ZlZWQnLFxuICAgIG1peGluczogW05ld3NGZWVkTWl4aW5dLFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIE5ld3NGZWVkU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5nZXRTdG9yaWVzKTtcbiAgICAgIHRoaXMuZmV0Y2hOZXdzRmVlZCgpO1xuXG4gICAgICB0aGlzLm9uUHVzaChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5mZXRjaE5ld3NGZWVkKCk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBmZXRjaE5ld3NGZWVkOiBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogTkYuQUNUSU9OUy5GRVRDSF9TVE9SSUVTLFxuICAgICAgICBldmVudDogTkYuRVZFTlRTLlNUT1JJRVNfRkVUQ0hFRCxcbiAgICAgICAgZGF0YTogdGhpcy5wcm9wcy51cmxcbiAgICAgIH0pO1xuICAgIH0sIDEwMDApLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0b3JpZXM6IG51bGxcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG1vcmVTdG9yaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0U3RvcnkgPSB0aGlzLnN0YXRlLnN0b3JpZXNbdGhpcy5zdGF0ZS5zdG9yaWVzLmxlbmd0aCAtIDFdO1xuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiBORi5BQ1RJT05TLkZFVENIX01PUkVfU1RPUklFUyxcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5TVE9SSUVTX0ZFVENIRUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMudXJsICsgJz90b3BfaWQ9JyArIGxhc3RTdG9yeS5pZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUHVzaDogZnVuY3Rpb24oZm4pIHtcbiAgICAgIGlmICh3aW5kb3cucHVzaGVyKSB7XG4gICAgICAgIGNoYW5uZWwgPSB3aW5kb3cucHVzaGVyLnN1YnNjcmliZSgnQCcgKyB0aGlzLnByb3BzLnVzZXIudXNlcm5hbWUpO1xuICAgICAgICBjaGFubmVsLmJpbmRfYWxsKGZuKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzaGVldFwiLCBzdHlsZTogeyAnbWluLWhlaWdodCc6ICc2MDBweCd9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhZ2UtaGVhZGVyIHNoZWV0LWhlYWRlclwiLCBzdHlsZTogeyAncGFkZGluZy1sZWZ0JzogJzIwcHgnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmgyKHtjbGFzc05hbWU6IFwicGFnZS1oZWFkZXItdGl0bGVcIn0sIFwiWW91ciBub3RpZmljYXRpb25zXCIpXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGlzdC1ncm91cCBsaXN0LWdyb3VwLWJyZWFrb3V0XCIsIHJlZjogXCJzcGlubmVyXCJ9LCBcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc3RvcmllcyA/IHRoaXMucm93cyh0aGlzLnN0YXRlLnN0b3JpZXMpIDogbnVsbFxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI21vcmVcIiwgY2xhc3NOYW1lOiBcImJ0biBidG4tYmxvY2tcIiwgb25DbGljazogdGhpcy5tb3JlU3Rvcmllc30sIFwiTW9yZVwiKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbihzdG9yaWVzKSB7XG4gICAgICB2YXIgcm93cyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0b3JpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHJvd3MucHVzaChcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGlzdC1ncm91cC1pdGVtXCIsIGtleTogc3Rvcmllc1tpXS5rZXl9LCBcbiAgICAgICAgICAgIEVudHJ5KHtzdG9yeTogc3Rvcmllc1tpXSwgYWN0b3JzOiB0aGlzLnN0YXRlLmFjdG9ycywgZnVsbFBhZ2U6IHRoaXMucHJvcHMuZnVsbFBhZ2V9KVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJvd3M7XG4gICAgfVxuICB9KTtcblxuICB2YXIgRW50cnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdFbnRyeScsXG4gICAgYWN0b3JzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1hcChcbiAgICAgICAgdGhpcy5wcm9wcy5zdG9yeS5hY3Rvcl9pZHMsXG4gICAgICAgIGZ1bmN0aW9uKGFjdG9ySWQpIHtcbiAgICAgICAgICByZXR1cm4gXy5maW5kV2hlcmUodGhpcy5wcm9wcy5hY3RvcnMsIHsgaWQ6IGFjdG9ySWQgfSlcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBib2R5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0YXJnZXQgPSB0aGlzLnByb3BzLnN0b3J5LmFjdGl2aXRpZXNbMF0udGFyZ2V0O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCBcbiAgICAgICAgICB0aGlzLnZlcmJNYXBbdGhpcy5wcm9wcy5zdG9yeS52ZXJiXSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcbiAgICAgICAgICAgIHRoaXMuc3ViamVjdE1hcFt0aGlzLnByb3BzLnN0b3J5LnN1YmplY3RfdHlwZV0uY2FsbCh0aGlzLCB0YXJnZXQpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBpc1JlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuc3RvcnkubGFzdF9yZWFkX2F0ICE9IG51bGw7XG4gICAgfSxcblxuICAgIG1hcmtBc1JlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGV2ZW50OiBORi5FVkVOVFMuUkVBRCxcbiAgICAgICAgYWN0aW9uOiBORi5BQ1RJT05TLk1BUktfQVNfUkVBRCxcbiAgICAgICAgZGF0YTogdGhpcy5wcm9wcy5zdG9yeS5pZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG1hcmtBc1JlYWRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmlzUmVhZCgpKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1kaXNjXCIsIG9uQ2xpY2s6IHRoaXMubWFya0FzUmVhZCwgdGl0bGU6ICdNYXJrIGFzIHJlYWQnLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ319KTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogTWFyayBhcyB1bnJlYWRcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jaXJjbGVcIiwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9fSk7XG4gICAgfSxcblxuICAgIHByZXZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJvZHlQcmV2aWV3ID0gdGhpcy5wcm9wcy5zdG9yeS5ib2R5X3ByZXZpZXc7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwiLCBzdHlsZTogeyAndGV4dC1vdmVyZmxvdyc6ICdlbGxpcHNpcyd9fSwgXG4gICAgICAgICAgYm9keVByZXZpZXdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhY3RvcnMgPSBfLm1hcCh0aGlzLmFjdG9ycygpLCBmdW5jLmRvdCgndXNlcm5hbWUnKSkuam9pbignLCBAJylcblxuICAgICAgdmFyIGNsYXNzZXMgPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQoe1xuICAgICAgICAnZW50cnktcmVhZCc6IHRoaXMuaXNSZWFkKCksXG4gICAgICAgICdlbnRyeS11bnJlYWQnOiAhdGhpcy5pc1JlYWQoKSxcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgcHJvZHVjdE5hbWUgPSB0aGlzLnByb3BzLnN0b3J5LnByb2R1Y3QubmFtZTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjbGFzc2VzfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLW1kLTNcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogJy8nICsgdGhpcy5wcm9wcy5zdG9yeS5wcm9kdWN0LnNsdWd9LCBwcm9kdWN0TmFtZSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYnIobnVsbCksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWQgdGV4dC1zbWFsbFwifSwgXG4gICAgICAgICAgICAgICAgdGhpcy50aW1lc3RhbXAoKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC04XCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogY2xhc3NlcywgaHJlZjogdGhpcy5wcm9wcy5zdG9yeS51cmwsIG9uQ2xpY2s6IHRoaXMubWFya0FzUmVhZH0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtzdHlsZTogeyAnbWFyZ2luLXJpZ2h0JzogJzVweCd9fSwgXG4gICAgICAgICAgICAgICAgICBBdmF0YXIoe3VzZXI6IHRoaXMuYWN0b3JzKClbMF19KVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgYWN0b3JzKSwgXCIgXCIsIHRoaXMuYm9keSgpXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtc21hbGwgdGV4dC1tdXRlZFwifSwgXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aWV3KClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogJ2NvbC1tZC0xICcgKyBjbGFzc2VzfSwgXG4gICAgICAgICAgICAgIHRoaXMubWFya0FzUmVhZEJ1dHRvbigpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0aW1lc3RhbXA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG1vbWVudCh0aGlzLnByb3BzLnN0b3J5LmNyZWF0ZWQpLmZvcm1hdChcImRkZCwgaEFcIilcbiAgICB9LFxuXG4gICAgc3ViamVjdE1hcDoge1xuICAgICAgVGFzazogZnVuY3Rpb24odGFzaykge1xuICAgICAgICByZXR1cm4gXCIjXCIgKyB0YXNrLm51bWJlciArIFwiIFwiICsgdGFzay50aXRsZTtcbiAgICAgIH0sXG5cbiAgICAgIERpc2N1c3Npb246IGZ1bmN0aW9uKGRpc2N1c3Npb24pIHtcbiAgICAgICAgcmV0dXJuICdhIGRpc2N1c3Npb24nO1xuICAgICAgfSxcblxuICAgICAgV2lwOiBmdW5jdGlvbihib3VudHkpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZnVsbFBhZ2UpIHtcbiAgICAgICAgICByZXR1cm4gXCIjXCIgKyBib3VudHkubnVtYmVyICsgXCIgXCIgKyBib3VudHkudGl0bGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gXCIjXCIgKyBib3VudHkubnVtYmVyO1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdmVyYk1hcDoge1xuICAgICAgJ0NvbW1lbnQnOiAnY29tbWVudGVkIG9uICcsXG4gICAgICAnQXdhcmQnOiAnYXdhcmRlZCcsXG4gICAgICAnQ2xvc2UnOiAnY2xvc2VkICdcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gRnVsbFBhZ2VOZXdzRmVlZDtcbiAgfVxuXG4gIHdpbmRvdy5GdWxsUGFnZU5ld3NGZWVkID0gRnVsbFBhZ2VOZXdzRmVlZDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIEZvcm1Hcm91cCA9IHJlcXVpcmUoJy4vZm9ybV9ncm91cC5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgSW5wdXRQcmV2aWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW5wdXRQcmV2aWV3JyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaW5wdXRQcmV2aWV3OiAnJyxcbiAgICAgICAgdHJhbnNmb3JtOiB0aGlzLnByb3BzLnRyYW5zZm9ybSB8fCB0aGlzLnRyYW5zZm9ybVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIEZvcm1Hcm91cChudWxsLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXBcIiwgc3R5bGU6IHsgd2lkdGg6ICczNSUnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInRleHRcIiwgXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5wcm9wcy5pbnB1dE5hbWUsIFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2xcIiwgXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUuaW5wdXRQcmV2aWV3LCBcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogdGhpcy5wcm9wcy5wbGFjZWhvbGRlciwgXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2V9KSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWJ0blwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe3R5cGU6IFwic3VibWl0XCIsIG9uU3VibWl0OiB0aGlzLm9uU3VibWl0LCBjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5XCIsIGRpc2FibGVkOiB0aGlzLmJ1dHRvblN0YXRlKCl9LCB0aGlzLnByb3BzLmJ1dHRvblRleHQpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIG9tZWdhXCIsIHN0eWxlOiB7ICdtYXJnaW4tdG9wJzogJzVweCcsICdtYXJnaW4tbGVmdCc6ICcxcHgnfX0sIFxuICAgICAgICAgICAgXCJQcmV2aWV3OiBcIiwgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCB0aGlzLnByb3BzLmFkZG9uVGV4dCArIHRoaXMuc3RhdGUuaW5wdXRQcmV2aWV3KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGUudGFyZ2V0LnZhbHVlO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaW5wdXRQcmV2aWV3OiB0aGlzLnN0YXRlLnRyYW5zZm9ybSh2YWx1ZSlcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBidXR0b25TdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5pbnB1dFByZXZpZXcubGVuZ3RoID49IDIgPyBmYWxzZSA6IHRydWU7XG4gICAgfSxcblxuICAgIHRyYW5zZm9ybTogZnVuY3Rpb24odGV4dCkge1xuICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvW15cXHctXFwuXSsvZywgJy0nKS50b0xvd2VyQ2FzZSgpO1xuICAgIH0sXG5cbiAgICBvblN1Ym1pdDogZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnB1dFByZXZpZXc7XG4gIH1cblxuICB3aW5kb3cuSW5wdXRQcmV2aWV3ID0gSW5wdXRQcmV2aWV3O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBJbnRlcmVzdFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL2ludGVyZXN0X3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIElQID0gQ09OU1RBTlRTLklOVEVSRVNUX1BJQ0tFUjtcblxuICB2YXIga2V5cyA9IHtcbiAgICBlbnRlcjogMTMsXG4gICAgZXNjOiAyNyxcbiAgICB1cDogMzgsXG4gICAgZG93bjogNDAsXG4gICAgZGVsZXRlOiA4XG4gIH07XG5cbiAgdmFyIEludGVyZXN0UGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW50ZXJlc3RQaWNrZXInLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzZWxlY3RlZEludGVyZXN0czogSW50ZXJlc3RTdG9yZS5nZXRJbnRlcmVzdHMoKSxcbiAgICAgICAgaGlnaGxpZ2h0SW5kZXg6IDAsXG4gICAgICAgIHZpc2libGVJbnRlcmVzdHM6IFtdLFxuICAgICAgICB1c2VySW5wdXQ6ICcnXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMudXNlckludGVyZXN0cyAmJiB0aGlzLnByb3BzLnVzZXJJbnRlcmVzdHMubGVuZ3RoKSB7XG4gICAgICAgIEludGVyZXN0U3RvcmUuc2V0SW50ZXJlc3RzKHRoaXMucHJvcHMudXNlckludGVyZXN0cyk7XG4gICAgICB9XG5cbiAgICAgIEludGVyZXN0U3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5vblN0b3JlQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe3N0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCBjdXJzb3I6ICd0ZXh0J319LCBcbiAgICAgICAgICBSZWFjdC5ET00uc2VsZWN0KHtcbiAgICAgICAgICAgICAgbmFtZTogdGhpcy5wcm9wcy5uYW1lLCBcbiAgICAgICAgICAgICAgbXVsdGlwbGU6IFwidHJ1ZVwiLCBcbiAgICAgICAgICAgICAgc3R5bGU6IHsgZGlzcGxheTogJ25vbmUnfSwgXG4gICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnNlbGVjdGVkSW50ZXJlc3RzfSwgXG4gICAgICAgICAgICB0aGlzLmZvcm1hdFNlbGVjdGVkKCdvcHRpb24nKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS51bCh7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJwaWxsLWxpc3RcIiwgXG4gICAgICAgICAgICAgIHJlZjogXCJjb250YWluZXJcIiwgXG4gICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuaGFuZGxlQ29udGFpbmVyQ2xpY2t9LCBcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0U2VsZWN0ZWQoJ3BpbGwnKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7XG4gICAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIiwgXG4gICAgICAgICAgICAgICAgICByZWY6IFwidXNlcklucHV0XCIsIFxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlQ2hhbmdlLCBcbiAgICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5oYW5kbGVLZXlEb3duLCBcbiAgICAgICAgICAgICAgICAgIG9uRm9jdXM6IHRoaXMuaGFuZGxlRm9jdXMsIFxuICAgICAgICAgICAgICAgICAgb25CbHVyOiB0aGlzLmhhbmRsZUJsdXIsIFxuICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudXNlcklucHV0fVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgIHRoaXMuc3RhdGUudmlzaWJsZUludGVyZXN0cy5sZW5ndGggPiAwICYmIHRoaXMuc3RhdGUuc2hvdyA/IHRoaXMuaW50ZXJlc3REcm9wZG93bigpIDogbnVsbFxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBpbnRlcmVzdERyb3Bkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIEludGVyZXN0RHJvcGRvd24oe1xuICAgICAgICAgICAgaW50ZXJlc3RzOiB0aGlzLnN0YXRlLnZpc2libGVJbnRlcmVzdHMsIFxuICAgICAgICAgICAgaGlnaGxpZ2h0SW5kZXg6IHRoaXMuc3RhdGUuaGlnaGxpZ2h0SW5kZXgsIFxuICAgICAgICAgICAgb25JbnRlcmVzdFNlbGVjdGVkOiB0aGlzLm9uSW50ZXJlc3RTZWxlY3RlZH1cbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlQ29udGFpbmVyQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMucmVmcy51c2VySW5wdXQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgfSxcblxuICAgIGhhbmRsZUNoYW5nZTogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHZhbHVlID0gZS50YXJnZXQudmFsdWU7XG4gICAgICB2YXIgdmlzaWJsZUludGVyZXN0cyA9IHRoaXMuZ2V0VmlzaWJsZUludGVyZXN0cyh2YWx1ZSk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB1c2VySW5wdXQ6IHRoaXMudHJhbnNmb3JtKHZhbHVlKSxcbiAgICAgICAgdmlzaWJsZUludGVyZXN0czogdmlzaWJsZUludGVyZXN0c1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZUtleURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IGtleXMudXApIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLm1vdmVIaWdobGlnaHQoLTEpO1xuICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IGtleXMuZG93bikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubW92ZUhpZ2hsaWdodCgxKTtcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBrZXlzLmRlbGV0ZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS51c2VySW5wdXQgPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBJUC5BQ1RJT05TLlBPUCxcbiAgICAgICAgICAgIGV2ZW50OiBJUC5FVkVOVFMuUE9QUEVEXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBrZXlzLmVudGVyKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RDdXJyZW50SW50ZXJlc3QoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0VmlzaWJsZUludGVyZXN0czogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBpbnRlcmVzdHMgPSBfLmZpbHRlcih0aGlzLnByb3BzLmludGVyZXN0cywgZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgICAgcmV0dXJuIGludGVyZXN0LmluZGV4T2YodmFsdWUpID49IDAgJiYgSW50ZXJlc3RTdG9yZS5nZXRJbnRlcmVzdHMoKS5pbmRleE9mKGludGVyZXN0KSA9PT0gLTE7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHZhbHVlICYmIGludGVyZXN0cy5pbmRleE9mKHZhbHVlKSA9PT0gLTEpIHtcbiAgICAgICAgaW50ZXJlc3RzLnB1c2godmFsdWUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaW50ZXJlc3RzO1xuICAgIH0sXG5cbiAgICBtb3ZlSGlnaGxpZ2h0OiBmdW5jdGlvbihpbmMpIHtcbiAgICAgIHZhciBpbmRleCA9IHRoaXMuY29uc3RyYWluSGlnaGxpZ2h0KHRoaXMuc3RhdGUuaGlnaGxpZ2h0SW5kZXggKyBpbmMpO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaGlnaGxpZ2h0SW5kZXg6IGluZGV4XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29uc3RyYWluSGlnaGxpZ2h0OiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICAwLCBNYXRoLm1pbih0aGlzLnN0YXRlLnZpc2libGVJbnRlcmVzdHMubGVuZ3RoIC0gMSwgaW5kZXgpXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBzZWxlY3RDdXJyZW50SW50ZXJlc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogSVAuQUNUSU9OUy5BRERfSU5URVJFU1QsXG4gICAgICAgIGV2ZW50OiBJUC5FVkVOVFMuSU5URVJFU1RfQURERUQsXG4gICAgICAgIGRhdGE6IHRoaXMuc3RhdGUudmlzaWJsZUludGVyZXN0c1t0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4XVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uU3RvcmVDaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHZpc2libGVJbnRlcmVzdHM6IFtdLFxuICAgICAgICBzZWxlY3RlZEludGVyZXN0czogSW50ZXJlc3RTdG9yZS5nZXRJbnRlcmVzdHMoKSxcbiAgICAgICAgdXNlcklucHV0OiAnJ1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHRyYW5zZm9ybTogZnVuY3Rpb24odGV4dCkge1xuICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvW15cXHctXSsvZywgJy0nKS50b0xvd2VyQ2FzZSgpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVGb2N1czogZnVuY3Rpb24oZSkge1xuICAgICAgdGhpcy5yZWZzLmNvbnRhaW5lci5nZXRET01Ob2RlKCkuc3R5bGUuY3NzVGV4dCA9IFwiYm9yZGVyOiAxcHggc29saWQgIzQ4YTNlZDsgYm94LXNoYWRvdzogMHB4IDBweCAzcHggIzY2YWZlOVwiO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgdmlzaWJsZUludGVyZXN0czogXy5kaWZmZXJlbmNlKHRoaXMucHJvcHMuaW50ZXJlc3RzLCBJbnRlcmVzdFN0b3JlLmdldEludGVyZXN0cygpKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZUJsdXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucmVmcy5jb250YWluZXIuZ2V0RE9NTm9kZSgpLnN0eWxlLmNzc1RleHQgPSAnJztcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBGSVhNRTogVGhlcmUgaGFzIHRvIGJlIGEgYmV0dGVyIHdheSB0byBoYW5kbGUgdGhpczpcbiAgICAgIC8vICAgICAgICBUaGUgaXNzdWUgaXMgdGhhdCBoaWRpbmcgdGhlIGRyb3Bkb3duIG9uIGJsdXJcbiAgICAgIC8vICAgICAgICBjYXVzZXMgc2VsZWN0aW5nIGFuIGl0ZW0gdG8gZmFpbCB3aXRob3V0IGFcbiAgICAgIC8vICAgICAgICB0aW1lb3V0IG9mIH4yMDAgdG8gfjMwMCBtcy5cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICAgIHNob3c6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfSwgMzAwKTtcbiAgICB9LFxuXG4gICAgb25JbnRlcmVzdFNlbGVjdGVkOiBmdW5jdGlvbihlKSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiBJUC5FVkVOVFMuQUREX0lOVEVSRVNULFxuICAgICAgICBldmVudDogSVAuRVZFTlRTLklOVEVSRVNUX0FEREVELFxuICAgICAgICBkYXRhOiAnJ1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZVJlbW92ZTogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IElQLkFDVElPTlMuUkVNT1ZFX0lOVEVSRVNULFxuICAgICAgICBldmVudDogSVAuRVZFTlRTLklOVEVSRVNUX1JFTU9WRUQsXG4gICAgICAgIGRhdGE6IGludGVyZXN0XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZm9ybWF0U2VsZWN0ZWQ6IGZ1bmN0aW9uKG9wdGlvbk9yUGlsbCkge1xuICAgICAgdmFyIGludGVyZXN0cyA9IEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCk7XG4gICAgICB2YXIgc2VsZWN0ZWRJbnRlcmVzdHMgPSBfLm1hcChpbnRlcmVzdHMsIHRoaXMuaW50ZXJlc3RUb1tvcHRpb25PclBpbGxdLmJpbmQodGhpcykpO1xuXG4gICAgICByZXR1cm4gc2VsZWN0ZWRJbnRlcmVzdHM7XG4gICAgfSxcblxuICAgIGludGVyZXN0VG86IHtcbiAgICAgIG9wdGlvbjogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5vcHRpb24oe3ZhbHVlOiBpbnRlcmVzdCwga2V5OiBpbnRlcmVzdH0sIGludGVyZXN0KVxuICAgICAgfSxcblxuICAgICAgcGlsbDogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJpbnRlcmVzdC1jaG9pY2VcIiwga2V5OiBpbnRlcmVzdH0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJpbnRlcmVzdC1jbG9zZVwiLCBvbkNsaWNrOiB0aGlzLmhhbmRsZVJlbW92ZS5iaW5kKHRoaXMsIGludGVyZXN0KX0sIFwiQFwiLCBpbnRlcmVzdCwgXCIgw5dcIilcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICB2YXIgSW50ZXJlc3REcm9wZG93biA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludGVyZXN0RHJvcGRvd24nLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAnei1pbmRleCc6IDEwMCxcbiAgICAgICAgdG9wOiA0NSxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgZGlzcGxheTogJ2Jsb2NrJ1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiZHJvcGRvd24tbWVudVwiLCBzdHlsZTogc3R5bGV9LCBcbiAgICAgICAgICB0aGlzLnJvd3MoKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gLTE7XG5cbiAgICAgIHZhciBpbnRlcmVzdHMgPSBfLm1hcCh0aGlzLnByb3BzLmludGVyZXN0cywgZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgICAgaSsrO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgSW50ZXJlc3REcm9wZG93bkVudHJ5KHtcbiAgICAgICAgICAgICAga2V5OiBpbnRlcmVzdCwgXG4gICAgICAgICAgICAgIGludGVyZXN0OiBpbnRlcmVzdCwgXG4gICAgICAgICAgICAgIHNlbGVjdGVkOiBpID09PSB0aGlzLnByb3BzLmhpZ2hsaWdodEluZGV4fVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHJldHVybiBpbnRlcmVzdHM7XG4gICAgfVxuICB9KTtcblxuICB2YXIgSW50ZXJlc3REcm9wZG93bkVudHJ5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW50ZXJlc3REcm9wZG93bkVudHJ5JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGludGVyZXN0ID0gdGhpcy5wcm9wcy5pbnRlcmVzdDtcbiAgICAgIHZhciBjbGFzc05hbWUgPSAndGV4dGNvbXBsZXRlLWl0ZW0nO1xuXG4gICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgICBjbGFzc05hbWUgKz0gJyBhY3RpdmUnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogY2xhc3NOYW1lfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6ICcjQCcgKyBpbnRlcmVzdCwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9LCBvbkNsaWNrOiB0aGlzLmhhbmRsZUludGVyZXN0U2VsZWN0ZWQuYmluZCh0aGlzLCBpbnRlcmVzdCl9LCBcbiAgICAgICAgICAgIFwiQFwiLCB0aGlzLnByb3BzLmludGVyZXN0XG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBoYW5kbGVJbnRlcmVzdFNlbGVjdGVkOiBmdW5jdGlvbihpbnRlcmVzdCkge1xuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogSVAuQUNUSU9OUy5BRERfSU5URVJFU1QsXG4gICAgICAgIGV2ZW50OiBJUC5FVkVOVFMuSU5URVJFU1RfQURERUQsXG4gICAgICAgIGRhdGE6IGludGVyZXN0XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW50ZXJlc3RQaWNrZXI7XG4gIH1cblxuICB3aW5kb3cuSW50ZXJlc3RQaWNrZXIgPSBJbnRlcmVzdFBpY2tlcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIEZvcm1Hcm91cCA9IHJlcXVpcmUoJy4vZm9ybV9ncm91cC5qcy5qc3gnKTtcbihmdW5jdGlvbigpIHtcbiAgdmFyIEludml0ZUJvdW50eUZvcm0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnZpdGVCb3VudHlGb3JtJyxcbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgbW9kZWw6ICdpbnZpdGUnIH1cbiAgICB9LFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBlcnJvcnM6IHt9IH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5mb3JtKHtzdHlsZToge3dpZHRoOjMwMH0sIG9uU3VibWl0OiB0aGlzLmhhbmRsZVN1Ym1pdH0sIFxuICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW4sIFxuICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgRm9ybUdyb3VwKHtlcnJvcjogdGhpcy5zdGF0ZS5lcnJvcnMudXNlcm5hbWVfb3JfZW1haWx9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5sYWJlbCh7Y2xhc3NOYW1lOiBcImNvbnRyb2wtbGFiZWxcIn0sIFwiVXNlcm5hbWUgb3IgZW1haWwgYWRkcmVzc1wiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe25hbWU6IFwiaW52aXRlW3VzZXJuYW1lX29yX2VtYWlsXVwiLCB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiZnJpZW5kQGV4YW1wbGUuY29tXCIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2xcIn0pXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgRm9ybUdyb3VwKHtlcnJvcjogdGhpcy5zdGF0ZS5lcnJvcnMubm90ZX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKG51bGwsIFwiUGVyc29uYWwgbm90ZVwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGV4dGFyZWEoe25hbWU6IFwiaW52aXRlW25vdGVdXCIsIHBsYWNlaG9sZGVyOiB0aGlzLnByb3BzLm5vdGVQbGFjZWhvbGRlciwgY2xhc3NOYW1lOiBcImZvcm0tY29udHJvbFwifSlcbiAgICAgICAgICApLCBcbiAgICAgICAgICBGb3JtR3JvdXAoe2Vycm9yOiB0aGlzLnN0YXRlLmVycm9ycy50aXBfY2VudHN9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5sYWJlbChudWxsLCBcIkxlYXZlIGEgdGlwXCIpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiaGVscC1ibG9ja1wifSwgXCJTdGFydCBvZmYgb24gdGhlIHJpZ2h0IGZvb3Q7IGdlbmVyb3NpdHkgYWx3YXlzIHBheXMgb2ZmLlwiKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJidG4tZ3JvdXAgdGV4dC1jZW50ZXJcIiwgJ2RhdGEtdG9nZ2xlJzogXCJidXR0b25zXCIsIHN0eWxlOiB7d2lkdGg6JzEwMCUnfX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00ubGFiZWwoe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHQgYWN0aXZlXCIsIHN0eWxlOiB7d2lkdGg6JzM0JSd9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiaW52aXRlW3RpcF9jZW50c11cIiwgdmFsdWU6IFwiMTAwMFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZX0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1hcHAtY29pbiB0ZXh0LWNvaW5zXCJ9KSwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zXCJ9LCBcIjEwXCIpXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00ubGFiZWwoe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgc3R5bGU6IHt3aWR0aDonMzMlJ319LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3R5cGU6IFwicmFkaW9cIiwgbmFtZTogXCJpbnZpdGVbdGlwX2NlbnRzXVwiLCB2YWx1ZTogXCIxMDAwMFwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luIHRleHQtY29pbnNcIn0pLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtY29pbnNcIn0sIFwiMTAwXCIpXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00ubGFiZWwoe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgc3R5bGU6IHt3aWR0aDonMzMlJ319LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3R5cGU6IFwicmFkaW9cIiwgbmFtZTogXCJpbnZpdGVbdGlwX2NlbnRzXVwiLCB2YWx1ZTogXCI1MDAwMFwifSksIFwiIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1hcHAtY29pbiB0ZXh0LWNvaW5zXCJ9KSwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zXCJ9LCBcIjUwMFwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpLCBcbiAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3R5cGU6IFwiaGlkZGVuXCIsIG5hbWU6IFwiaW52aXRlW3ZpYV90eXBlXVwiLCB2YWx1ZTogdGhpcy5wcm9wcy52aWFfdHlwZX0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3R5cGU6IFwiaGlkZGVuXCIsIG5hbWU6IFwiaW52aXRlW3ZpYV9pZF1cIiwgdmFsdWU6IHRoaXMucHJvcHMudmlhX2lkfSksIFxuICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLXByaW1hcnkgYnRuLWJsb2NrXCIsIHN0eWxlOiB7XCJtYXJnaW4tYm90dG9tXCI6MjB9fSwgXCJTZW5kIG1lc3NhZ2VcIilcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiB0aGlzLnByb3BzLnVybCxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICBkYXRhOiAkKGUudGFyZ2V0KS5zZXJpYWxpemUoKSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHRoaXMucHJvcHMub25TdWJtaXQoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuICAgICAgICAgIGlmICh4aHIucmVzcG9uc2VKU09OICYmIHhoci5yZXNwb25zZUpTT04uZXJyb3JzKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUVycm9ycyh4aHIucmVzcG9uc2VKU09OLmVycm9ycylcbiAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZUVycm9yczogZnVuY3Rpb24oZXJyb3JzKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtlcnJvcnM6IGVycm9yc30pXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludml0ZUJvdW50eUZvcm07XG4gIH1cblxuICB3aW5kb3cuSW52aXRlQm91bnR5Rm9ybSA9IEludml0ZUJvdW50eUZvcm07XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG52YXIgUG9wb3ZlciA9IHJlcXVpcmUoJy4vcG9wb3Zlci5qcy5qc3gnKTtcbnZhciBJbnZpdGVCb3VudHlGb3JtID0gcmVxdWlyZSgnLi9pbnZpdGVfYm91bnR5X2Zvcm0uanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEludml0ZUZyaWVuZEJvdW50eSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludml0ZUZyaWVuZEJvdW50eScsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IG1vZGFsOiBmYWxzZSwgaW52aXRlczogdGhpcy5wcm9wcy5pbnZpdGVzIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1ibG9jayBidG4tc21cIiwgaHJlZjogXCIjaGVscC1tZVwiLCBvbkNsaWNrOiB0aGlzLmNsaWNrfSwgXCJJbnZpdGUgYSBmcmllbmQgdG8gaGVscFwiKSwgXG4gICAgICAgICAgdGhpcy5zdGF0ZS5pbnZpdGVzLmxlbmd0aCA+IDAgPyBJbnZpdGVMaXN0KHtpbnZpdGVzOiB0aGlzLnN0YXRlLmludml0ZXN9KSA6IG51bGwsIFxuICAgICAgICAgIHRoaXMuc3RhdGUubW9kYWwgPyB0aGlzLnBvcG92ZXIoKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBwb3BvdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFBvcG92ZXIoe3BsYWNlbWVudDogXCJsZWZ0XCIsIHBvc2l0aW9uTGVmdDogLTMyNSwgcG9zaXRpb25Ub3A6IC0xMjB9LCBcbiAgICAgICAgICBJbnZpdGVCb3VudHlGb3JtKHt1cmw6IHRoaXMucHJvcHMudXJsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWFfdHlwZTogdGhpcy5wcm9wcy52aWFfdHlwZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlhX2lkOiB0aGlzLnByb3BzLnZpYV9pZCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ6IHRoaXMub25TdWJtaXQuYmluZCh0aGlzKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZVBsYWNlaG9sZGVyOiBcIkhleSEgVGhpcyBib3VudHkgc2VlbXMgcmlnaHQgdXAgeW91ciBhbGxleVwifSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMih7Y2xhc3NOYW1lOiBcImFscGhhXCJ9LCBcIkFzayBhIGZyaWVuZFwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFwiS25vdyBzb21lYm9keSB3aG8gY291bGQgaGVscCB3aXRoIHRoaXM/IEFueWJvZHkgY2FuIGhlbHAgb3V0LCBhbGwgeW91IG5lZWQgdG8gZG8gaXMgYXNrLlwiKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBjbGljazogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RhbDogIXRoaXMuc3RhdGUubW9kYWx9KVxuICAgIH0sXG5cbiAgICBvblN1Ym1pdDogZnVuY3Rpb24oaW52aXRlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKFxuICAgICAgICBSZWFjdC5hZGRvbnMudXBkYXRlKHRoaXMuc3RhdGUsIHtcbiAgICAgICAgICBpbnZpdGVzOiB7JHB1c2g6IFtpbnZpdGVdIH0sXG4gICAgICAgICAgbW9kYWw6IHskc2V0OiBmYWxzZSB9XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludml0ZUZyaWVuZEJvdW50eTtcbiAgfVxuXG4gIHdpbmRvdy5JbnZpdGVGcmllbmRCb3VudHkgPSBJbnZpdGVGcmllbmRCb3VudHk7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG52YXIgUG9wb3ZlciA9IHJlcXVpcmUoJy4vcG9wb3Zlci5qcy5qc3gnKTtcbnZhciBJbnZpdGVCb3VudHlGb3JtID0gcmVxdWlyZSgnLi9pbnZpdGVfYm91bnR5X2Zvcm0uanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEludml0ZUZyaWVuZFByb2R1Y3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnZpdGVGcmllbmRQcm9kdWN0JyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgbW9kYWw6IGZhbHNlLCBpbnZpdGVzOiB0aGlzLnByb3BzLmludml0ZXMgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdCBidG4tc20gYnRuLWJsb2NrXCIsIHN0eWxlOiB7XCJtYXJnaW4tYm90dG9tXCI6MTZ9LCBvbkNsaWNrOiB0aGlzLmNsaWNrfSwgXCJJbnZpdGUgYSBmcmllbmRcIiksIFxuICAgICAgICAgIHRoaXMuc3RhdGUuaW52aXRlcy5sZW5ndGggPiAwID8gSW52aXRlTGlzdCh7aW52aXRlczogdGhpcy5zdGF0ZS5pbnZpdGVzfSkgOiBudWxsLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLm1vZGFsID8gdGhpcy5wb3BvdmVyKCkgOiBudWxsXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgcG9wb3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBQb3BvdmVyKHtwbGFjZW1lbnQ6IFwibGVmdFwiLCBwb3NpdGlvbkxlZnQ6IC0zMjUsIHBvc2l0aW9uVG9wOiAtMTI5fSwgXG4gICAgICAgICAgSW52aXRlQm91bnR5Rm9ybSh7dXJsOiB0aGlzLnByb3BzLnVybCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlhX3R5cGU6IHRoaXMucHJvcHMudmlhX3R5cGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpYV9pZDogdGhpcy5wcm9wcy52aWFfaWQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VibWl0OiB0aGlzLm9uU3VibWl0LmJpbmQodGhpcyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVQbGFjZWhvbGRlcjogdGhpcy5wcm9wcy5ub3RlUGxhY2Vob2xkZXJ9LCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmgyKHtjbGFzczogXCJhbHBoYVwifSwgXCJBc2sgYSBmcmllbmRcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcIktub3cgc29tZWJvZHkgd2hvIGNvdWxkIGhlbHAgd2l0aCB0aGlzPyBBbnlib2R5IGNhbiBoZWxwIG91dCwgYWxsIHlvdSBuZWVkIHRvIGRvIGlzIGFzay5cIilcblxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBjbGljazogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RhbDogIXRoaXMuc3RhdGUubW9kYWx9KVxuICAgIH0sXG5cbiAgICBvblN1Ym1pdDogZnVuY3Rpb24oaW52aXRlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKFxuICAgICAgICBSZWFjdC5hZGRvbnMudXBkYXRlKHRoaXMuc3RhdGUsIHtcbiAgICAgICAgICBpbnZpdGVzOiB7JHB1c2g6IFtpbnZpdGVdIH0sXG4gICAgICAgICAgbW9kYWw6IHskc2V0OiBmYWxzZSB9XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludml0ZUZyaWVuZFByb2R1Y3Q7XG4gIH1cblxuICB3aW5kb3cuSW52aXRlRnJpZW5kUHJvZHVjdCA9IEludml0ZUZyaWVuZFByb2R1Y3Q7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXA7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEludml0ZUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnZpdGVMaXN0JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGludml0ZU5vZGVzID0gXy5tYXAodGhpcy5wcm9wcy5pbnZpdGVzLCBmdW5jdGlvbihpbnZpdGUpIHtcbiAgICAgICAgcmV0dXJuIEludml0ZUVudHJ5KHtrZXk6IGludml0ZS5pZCwgaWQ6IGludml0ZS5pZCwgaW52aXRlZV9lbWFpbDogaW52aXRlLmludml0ZWVfZW1haWwsIGludml0ZWU6IGludml0ZS5pbnZpdGVlfSlcbiAgICAgIH0pXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwgcGFuZWwtZGVmYXVsdFwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibGlzdC1ncm91cCBsaXN0LWdyb3VwLWJyZWFrb3V0IHNtYWxsIG9tZWdhXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0Q1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogXCJpbnZpdGVcIn0sIFxuICAgICAgICAgICAgICBpbnZpdGVOb2Rlc1xuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG4gIH0pO1xuXG4gIHZhciBJbnZpdGVFbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludml0ZUVudHJ5JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwibGlzdC1ncm91cC1pdGVtXCIsIGtleTogdGhpcy5wcm9wcy5pZH0sIFxuICAgICAgICB0aGlzLmxhYmVsKClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBsYWJlbDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5pbnZpdGVlKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3BhbihudWxsLCBcIkludml0ZWQgXCIsIFJlYWN0LkRPTS5hKHtocmVmOiB0aGlzLnByb3BzLmludml0ZWUudXJsfSwgXCJAXCIsIHRoaXMucHJvcHMuaW52aXRlZS51c2VybmFtZSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4obnVsbCwgXCJFbWFpbGVkIFwiLCB0aGlzLnByb3BzLmludml0ZWVfZW1haWwpXG4gICAgICB9XG5cbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW52aXRlTGlzdDtcbiAgfVxuXG4gIHdpbmRvdy5JbnZpdGVMaXN0ID0gSW52aXRlTGlzdDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEpvaW5UZWFtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSm9pblRlYW0nLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgY291bnQ6IHRoaXMucHJvcHMuY291bnQsXG4gICAgICAgIGlzX21lbWJlcjogdGhpcy5wcm9wcy5pc19tZW1iZXJcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRvZ2dsZXIgdG9nZ2xlci1zbVwifSwgXG4gICAgICAgICAgdGhpcy5sYWJlbCgpLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidG9nZ2xlci1iYWRnZVwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdGhpcy5wcm9wcy5qb2luX3BhdGh9LCB0aGlzLnN0YXRlLmNvdW50KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBsaXN0ZW5Gb3JKb2luOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgICAgJChub2RlKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICghYXBwLmN1cnJlbnRVc2VyKCkpIHtcbiAgICAgICAgICByZXR1cm4gYXBwLnJlZGlyZWN0VG8oJy9sb2dpbicpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgICQoZG9jdW1lbnQpLnNjcm9sbChmdW5jdGlvbihlKSB7XG4gICAgICAgICQobm9kZSkucG9wb3ZlcignaGlkZScpO1xuICAgICAgfSlcbiAgICB9LFxuXG4gICAgbGlzdGVuRm9yQ2hhbmdlczogZnVuY3Rpb24oYmlvRWRpdG9yKSB7XG4gICAgICB2YXIgam9pbkJ1dHRvbiA9ICQoJyNqb2luLWludHJvLWJ1dHRvbicpXG4gICAgICB2YXIgc3RhcnRpbmdWYWwgPSBiaW9FZGl0b3IudmFsKClcblxuICAgICAgaWYgKHN0YXJ0aW5nVmFsICYmIHN0YXJ0aW5nVmFsLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIGpvaW5CdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJylcbiAgICAgIH1cblxuICAgICAgYmlvRWRpdG9yLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIHRleHRFbnRlcmVkKGUpIHtcbiAgICAgICAgdmFyIHZhbCA9IGJpb0VkaXRvci52YWwoKS50cmltKClcblxuICAgICAgICBpZiAodmFsLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgam9pbkJ1dHRvbi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKVxuICAgICAgICB9IGVsc2UgaWYgKHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgam9pbkJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBsYWJlbDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5pc19tZW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcInRvZ2dsZXItYnRuIGJ0biBidG4tXCIgKyB0aGlzLmJ1dHRvbigpLCAnZGF0YS10b2dnbGUnOiBcInBvcG92ZXJcIiwgb25DbGljazogdGhpcy5jbGljaygpfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImljb24gaWNvbi11c2VyLXVuZm9sbG93XCIsIHN0eWxlOiB7J21hcmdpbi1yaWdodCc6ICc1cHgnLH19KSwgXG4gICAgICAgICAgICBcIkxlYXZlIFRlYW1cIlxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcInRvZ2dsZXItYnRuIGJ0biBidG4tXCIgKyB0aGlzLmJ1dHRvbigpLCAnZGF0YS10b2dnbGUnOiBcInBvcG92ZXJcIiwgb25DbGljazogdGhpcy5jbGljaygpLCBcbiAgICAgICAgICAgIHJvbGU6IFwiYnV0dG9uXCIsIFxuICAgICAgICAgICAgaWQ6IFwianMtam9pbi1wb3BvdmVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImljb24gaWNvbi11c2VyLWZvbGxvd1wiLCBzdHlsZTogeydtYXJnaW4tcmlnaHQnOiAnNXB4J319KSwgXG4gICAgICAgICAgXCJKb2luIFRlYW1cIlxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5pc19tZW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubWVtYmVyc2hpcCAmJiB0aGlzLnByb3BzLm1lbWJlcnNoaXAuY29yZV90ZWFtKSB7XG4gICAgICAgICAgcmV0dXJuICdkZWZhdWx0IGRpc2FibGVkJ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAnZGVmYXVsdCBpbmFjdGl2ZSdcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gJ3ByaW1hcnknXG4gICAgfSxcblxuICAgIGNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLmlzX21lbWJlciA/IHRoaXMub25MZWF2ZSA6IHRoaXMub25Kb2luXG4gICAgfSxcblxuICAgIGhhbmRsZUpvaW5PckxlYXZlOiBmdW5jdGlvbih1cmwsIG5ld1N0YXRlLCBtZXRob2QsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgIHZhciBjdXJyZW50U3RhdGUgPSB0aGlzLnN0YXRlXG4gICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKVxuXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBkYXRhKVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oanF4aHIsIHN0YXR1cykge1xuICAgICAgICAgIHNlbGYuc2V0U3RhdGUoY3VycmVudFN0YXRlKVxuICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihzdGF0dXMpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBvbkpvaW46IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMuaGFuZGxlSm9pbk9yTGVhdmUoXG4gICAgICAgIHRoaXMucHJvcHMuam9pbl9wYXRoLFxuICAgICAgICB7IGNvdW50OiAodGhpcy5zdGF0ZS5jb3VudCArIDEpLCBpc19tZW1iZXI6IHRydWUgfSxcbiAgICAgICAgJ1BPU1QnLFxuICAgICAgICBmdW5jdGlvbiBqb2luZWQoZXJyLCBkYXRhKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcHJvZHVjdCA9IGFwcC5jdXJyZW50QW5hbHl0aWNzUHJvZHVjdCgpXG4gICAgICAgICAgYW5hbHl0aWNzLnRyYWNrKCdwcm9kdWN0LnRlYW0uam9pbmVkJywgcHJvZHVjdClcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgJCgnI2VkaXQtbWVtYmVyc2hpcC1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG5cbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246ICdhZGRQZXJzb24nLFxuICAgICAgICBkYXRhOiB7IHVzZXI6IHRoaXMucHJvcHMubWVtYmVyc2hpcCB9LFxuICAgICAgICBldmVudDogJ3Blb3BsZTpjaGFuZ2UnXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25MZWF2ZTogZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRoaXMucHJvcHMubWVtYmVyc2hpcCAmJiB0aGlzLnByb3BzLm1lbWJlcnNoaXAuY29yZV90ZWFtKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzLmhhbmRsZUpvaW5PckxlYXZlKFxuICAgICAgICB0aGlzLnByb3BzLmxlYXZlX3BhdGgsXG4gICAgICAgIHsgY291bnQ6ICh0aGlzLnN0YXRlLmNvdW50IC0gMSkgLCBpc19tZW1iZXI6IGZhbHNlIH0sXG4gICAgICAgICdERUxFVEUnLFxuICAgICAgICBmdW5jdGlvbiBsZWZ0KGVyciwgZGF0YSkge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHByb2R1Y3QgPSBhcHAuY3VycmVudEFuYWx5dGljc1Byb2R1Y3QoKVxuICAgICAgICAgIGFuYWx5dGljcy50cmFjaygncHJvZHVjdC50ZWFtLmxlZnQnLCBwcm9kdWN0KVxuICAgICAgICB9XG4gICAgICApXG5cbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246ICdyZW1vdmVQZXJzb24nLFxuICAgICAgICBkYXRhOiB7IHVzZXI6IHRoaXMucHJvcHMubWVtYmVyc2hpcC51c2VyIH0sXG4gICAgICAgIGV2ZW50OiAncGVvcGxlOmNoYW5nZSdcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBKb2luVGVhbTtcbiAgfVxuXG4gIHdpbmRvdy5Kb2luVGVhbSA9IEpvaW5UZWFtO1xufSkoKTtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBpc01lbWJlck9ubGluZSA9IGZ1bmN0aW9uKG1lbWJlcikge1xuICAgIHJldHVybiBtb21lbnQobWVtYmVyLmxhc3Rfb25saW5lKS5pc0FmdGVyKG1vbWVudCgpLnN1YnRyYWN0KCdob3VyJywgMSkpXG4gIH1cblxuICB2YXIgaXNNZW1iZXJSZWNlbnRseUFjdGl2ZSA9IGZ1bmN0aW9uKG1lbWJlcikge1xuICAgIHJldHVybiBtb21lbnQobWVtYmVyLmxhc3Rfb25saW5lKS5pc0FmdGVyKG1vbWVudCgpLnN1YnRyYWN0KCdtb250aCcsIDEpKVxuICB9XG5cbiAgdmFyIE1FTUJFUl9WSUVXX1JFRlJFU0hfUEVSSU9EID0gNjAgKiAxMDAwOyAvLyAxIG1pbnV0ZVxuXG4gIHZhciBNZW1iZXJzVmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ01lbWJlcnNWaWV3JyxcblxuICAgICBsb2FkTWVtYmVyc0Zyb21TZXJ2ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiB0aGlzLnByb3BzLnVybCxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgbWltZVR5cGU6ICd0ZXh0UGxhaW4nLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIG1lbWJlcnMgPSBfLnJlZHVjZShkYXRhLCBmdW5jdGlvbihtZW1vLCBtZW1iZXIpIHtcbiAgICAgICAgICAgIG1lbW9bbWVtYmVyLmlkXSA9IG1lbWJlclxuICAgICAgICAgICAgbWVtb1ttZW1iZXIuaWRdLmlzV2F0Y2hlciA9IHRydWVcbiAgICAgICAgICAgIHJldHVybiBtZW1vXG4gICAgICAgICAgfSwge30pXG5cbiAgICAgICAgICB0aGlzLmFkZE1lbWJlcnMobWVtYmVycyk7XG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgbG9hZE1lbWJlcnNGcm9tQ2hhbm5lbDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnByb3BzLmNoYW5uZWwuYmluZCgncHVzaGVyOnN1YnNjcmlwdGlvbl9zdWNjZWVkZWQnLFxuICAgICAgICBfLmJpbmQoXG4gICAgICAgICAgZnVuY3Rpb24obWVtYmVycykge1xuICAgICAgICAgICAgbWVtYmVycy5lYWNoKF8uYmluZChmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgICAgICAgdGhpcy5hZGRNZW1iZXIobWVtYmVyLmlkLCBtZW1iZXIuaW5mbylcbiAgICAgICAgICAgIH0sIHRoaXMpKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdGhpc1xuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtZW1iZXJzOiB7fVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmxvYWRNZW1iZXJzRnJvbUNoYW5uZWwoKVxuXG4gICAgICB0aGlzLnByb3BzLmNoYW5uZWwuYmluZChcbiAgICAgICAgJ3B1c2hlcjptZW1iZXJfYWRkZWQnLFxuICAgICAgICBfLmJpbmQodGhpcy5hZGRNZW1iZXJGcm9tUHVzaGVyLCB0aGlzKVxuICAgICAgKVxuXG4gICAgICB0aGlzLnByb3BzLmNoYW5uZWwuYmluZChcbiAgICAgICAgJ3B1c2hlcjptZW1iZXJfcmVtb3ZlZCcsXG4gICAgICAgIF8uYmluZCh0aGlzLnJlbW92ZU1lbWJlckZyb21QdXNoZXIsIHRoaXMpXG4gICAgICApXG5cbiAgICAgIGV2ZXJ5KE1FTUJFUl9WSUVXX1JFRlJFU0hfUEVSSU9ELCBfLmJpbmQodGhpcy5sb2FkTWVtYmVyc0Zyb21TZXJ2ZXIsIHRoaXMpKVxuICAgIH0sXG5cbiAgICByZW5kZXJNZW1iZXI6IGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgdmFyIGlzT25saW5lID0gaXNNZW1iZXJPbmxpbmUobWVtYmVyKVxuICAgICAgdmFyIGNsYXNzZXMgPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQoe1xuICAgICAgICAndGV4dC13ZWlnaHQtYm9sZCB0ZXh0LXN1Y2Nlc3MnOiBpc09ubGluZSxcbiAgICAgICAgJ3RleHQtZW1waGFzaXMnOiAhaXNPbmxpbmVcbiAgICAgIH0pXG5cbiAgICAgIHZhciBtYXJrZXJcbiAgICAgIGlmKGlzT25saW5lKSB7XG4gICAgICAgIG1hcmtlciA9IChSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImluZGljYXRvciBpbmRpY2F0b3Itc3VjY2Vzc1wifSwgXCLCoFwiKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcmtlciA9IChSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImluZGljYXRvciBpbmRpY2F0b3ItZGVmYXVsdFwifSwgXCLCoFwiKSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7a2V5OiBtZW1iZXIuaWR9LCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBjbGFzc2VzLCBocmVmOiBtZW1iZXIudXJsfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicHVsbC1yaWdodFwifSwgXG4gICAgICAgICAgICBtYXJrZXJcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImF2YXRhclwiLCBzcmM6IG1lbWJlci5hdmF0YXJfdXJsLCB3aWR0aDogXCIxNlwiLCBoZWlnaHQ6IFwiMTZcIiwgYWx0OiBtZW1iZXIudXNlcm5hbWUsIHN0eWxlOiB7bWFyZ2luUmlnaHQ6IDEwfX0pLCBcbiAgICAgICAgICAgIG1lbWJlci51c2VybmFtZVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsLWdyb3VwXCIsIGlkOiBcImFjY29yZGlvblwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsIHBhbmVsLWRlZmF1bHRcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsLWhlYWRpbmdcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uaDYoe2NsYXNzTmFtZTogXCJwYW5lbC10aXRsZVwifSwgXCJPbmxpbmVcIilcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsLWJvZHkgc21hbGxcIn0sIFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBfLm1hcCh0aGlzLm9ubGluZU1lbWJlcnMoKSwgdGhpcy5yZW5kZXJNZW1iZXIpXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwtaGVhZGluZ1wifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHsnZGF0YS10b2dnbGUnOiBcImNvbGxhcHNlXCIsICdkYXRhLXBhcmVudCc6IFwiI2FjY29yZGlvblwiLCBocmVmOiBcIiNjb2xsYXBzZVJlY2VudFwiLCBjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2hldnJvbi11cCBwdWxsLXJpZ2h0XCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmg2KHtjbGFzc05hbWU6IFwicGFuZWwtdGl0bGVcIn0sIFwiUmVjZW50bHkgQWN0aXZlXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IFwiY29sbGFwc2VSZWNlbnRcIiwgY2xhc3NOYW1lOiBcInBhbmVsLWNvbGxhcHNlIGNvbGxhcHNlIGluXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsLWJvZHkgc21hbGxcIn0sIFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBfLm1hcCh0aGlzLnJlY2VudGx5QWN0aXZlTWVtYmVycygpLCB0aGlzLnJlbmRlck1lbWJlcilcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgYWRkTWVtYmVyczogZnVuY3Rpb24obWVtYmVycykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG1lbWJlcnM6IF8uZXh0ZW5kKHRoaXMuc3RhdGUubWVtYmVycywgbWVtYmVycylcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGFkZE1lbWJlckZyb21QdXNoZXI6IGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgbWVtYmVyLmluZm8ubGFzdF9vbmxpbmUgPSAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxuICAgICAgdGhpcy5hZGRNZW1iZXIobWVtYmVyLmlkLCBtZW1iZXIuaW5mbylcbiAgICB9LFxuXG4gICAgcmVtb3ZlTWVtYmVyRnJvbVB1c2hlcjogZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICB0aGlzLm1lbWJlcldlbnRPZmZsaW5lKG1lbWJlci5pZClcbiAgICB9LFxuXG4gICAgYWRkTWVtYmVyOiBmdW5jdGlvbihpZCwgbWVtYmVyKSB7XG4gICAgICB2YXIgdXBkYXRlID0ge31cbiAgICAgIHVwZGF0ZVtpZF0gPSB7JyRzZXQnOiBtZW1iZXJ9XG4gICAgICB0aGlzLnNldFN0YXRlKFJlYWN0LmFkZG9ucy51cGRhdGUodGhpcy5zdGF0ZSwge21lbWJlcnM6IHVwZGF0ZX0pKVxuICAgIH0sXG5cbiAgICBtZW1iZXJXZW50T2ZmbGluZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBtZW1iZXIgPSB0aGlzLnN0YXRlLm1lbWJlcnNbaWRdXG4gICAgICBpZihtZW1iZXIuaXNXYXRjaGVyKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1lbWJlcnMgPSB0aGlzLnN0YXRlLm1lbWJlcnM7XG4gICAgICAgIGRlbGV0ZSBtZW1iZXJzW2lkXVxuICAgICAgICB0aGlzLnNldFN0YXRlKHttZW1iZXJzOiBtZW1iZXJzfSlcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb25saW5lTWVtYmVyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5jaGFpbih0aGlzLnN0YXRlLm1lbWJlcnMpLnZhbHVlcygpLmZpbHRlcihmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGlzTWVtYmVyT25saW5lKG1lbWJlcilcbiAgICAgIH0pLnNvcnRCeShmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIG1lbWJlci51c2VybmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICB9KS52YWx1ZSgpXG4gICAgfSxcblxuICAgIHJlY2VudGx5QWN0aXZlTWVtYmVyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5jaGFpbih0aGlzLnN0YXRlLm1lbWJlcnMpLnZhbHVlcygpLmZpbHRlcihmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgcmV0dXJuICFpc01lbWJlck9ubGluZShtZW1iZXIpICYmIGlzTWVtYmVyUmVjZW50bHlBY3RpdmUobWVtYmVyKVxuICAgICAgfSkuc29ydEJ5KGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICByZXR1cm4gbWVtYmVyLnVzZXJuYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgIH0pLnZhbHVlKClcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gTWVtYmVyc1ZpZXc7XG4gIH1cblxuICB3aW5kb3cuTWVtYmVyc1ZpZXcgPSBNZW1iZXJzVmlldztcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgVGl0bGVOb3RpZmljYXRpb25zQ291bnQgPSByZXF1aXJlKCcuL3RpdGxlX25vdGlmaWNhdGlvbnNfY291bnQuanMuanN4Jyk7XG52YXIgRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXIgPSByZXF1aXJlKCcuL2Ryb3Bkb3duX25ld3NfZmVlZF90b2dnbGVyLmpzLmpzeCcpO1xudmFyIERyb3Bkb3duTmV3c0ZlZWQgPSByZXF1aXJlKCcuL2Ryb3Bkb3duX25ld3NfZmVlZC5qcy5qc3gnKTtcbnZhciBDaGF0Tm90aWZpY2F0aW9uc1RvZ2dsZXIgPSByZXF1aXJlKCcuL2NoYXRfbm90aWZpY2F0aW9uc190b2dnbGVyLmpzLmpzeCcpO1xudmFyIENoYXROb3RpZmljYXRpb25zID0gcmVxdWlyZSgnLi9jaGF0X25vdGlmaWNhdGlvbnMuanMuanN4Jyk7XG52YXIgVXNlck5hdmJhckRyb3Bkb3duID0gcmVxdWlyZSgnLi91c2VyX25hdmJhcl9kcm9wZG93bi5qcy5qc3gnKTtcbnZhciBBdmF0YXIgPSByZXF1aXJlKCcuL2F2YXRhci5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgTmF2YmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTmF2YmFyJyxcbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdXNlcjogYXBwLmN1cnJlbnRVc2VyKCkuYXR0cmlidXRlc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB1c2VyID0gdGhpcy5wcm9wcy5jdXJyZW50VXNlcjtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibmF2IG5hdmJhci1uYXZcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFRpdGxlTm90aWZpY2F0aW9uc0NvdW50KG51bGwpXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBEcm9wZG93bk5ld3NGZWVkVG9nZ2xlcih7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzOiBcImljb24tYmVsbFwiLCBcbiAgICAgICAgICAgICAgICBocmVmOiBcIiNzdG9yaWVzXCIsIFxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIk5vdGlmaWNhdGlvbnNcIn0pLCBcblxuICAgICAgICAgICAgRHJvcGRvd25OZXdzRmVlZCh7XG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLnByb3BzLm5ld3NGZWVkUGF0aCwgXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMucHJvcHMudXNlci51c2VybmFtZSwgXG4gICAgICAgICAgICAgICAgZWRpdFVzZXJQYXRoOiB0aGlzLnByb3BzLmVkaXRVc2VyUGF0aH0pXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBDaGF0Tm90aWZpY2F0aW9uc1RvZ2dsZXIoe1xuICAgICAgICAgICAgICBpY29uQ2xhc3M6IFwiaWNvbi1idWJibGVzXCIsIFxuICAgICAgICAgICAgICBocmVmOiBcIiNub3RpZmljYXRpb25zXCIsIFxuICAgICAgICAgICAgICBsYWJlbDogXCJDaGF0XCJ9KSwgXG5cbiAgICAgICAgICAgIENoYXROb3RpZmljYXRpb25zKHtcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMucHJvcHMuY2hhdFBhdGgsIFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLnByb3BzLnVzZXIudXNlcm5hbWV9XG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJkcm9wZG93blwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCIsIGNsYXNzTmFtZTogXCJkcm9wZG93bi10b2dnbGVcIiwgJ2RhdGEtdG9nZ2xlJzogXCJkcm9wZG93blwifSwgXG4gICAgICAgICAgICAgIEF2YXRhcih7dXNlcjogdGhpcy5wcm9wcy51c2VyfSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInZpc2libGUteHMtaW5saW5lXCIsIHN0eWxlOiB7ICdtYXJnaW4tbGVmdCc6ICc1cHgnfX0sIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudXNlci51c2VybmFtZVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgdGhpcy50cmFuc2ZlclByb3BzVG8oVXNlck5hdmJhckRyb3Bkb3duKG51bGwpKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gTmF2YmFyO1xuICB9XG5cbiAgd2luZG93Lk5hdmJhciA9IE5hdmJhcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93blN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25vdGlmaWNhdGlvbl9wcmVmZXJlbmNlc19kcm9wZG93bl9zdG9yZScpO1xudmFyIEF2YXRhciA9IHJlcXVpcmUoJy4vYXZhdGFyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBEID0gQ09OU1RBTlRTLk5PVElGSUNBVElPTl9QUkVGRVJFTkNFU19EUk9QRE9XTjtcblxuICB2YXIgTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93biA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ05vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd24nLFxuICAgIGNoZXZyb246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuY2hldnJvbikge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2hldnJvbi1kb3duXCJ9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtzdHlsZTogeyAnbWFyZ2luLXJpZ2h0JzogJzdweCcsICdtYXJnaW4tbGVmdCc6ICc3cHgnfX0pXG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5oYW5kbGVVcGRhdGUpO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvZHVjdFdhdGNoZXJzQ291bnQ6IHRoaXMucHJvcHMucHJvZHVjdFdhdGNoZXJzQ291bnQsXG4gICAgICAgIHNlbGVjdGVkOiB0aGlzLnByb3BzLndhdGNoaW5nU3RhdGUsXG4gICAgICAgIGNoZXZyb246IGZhbHNlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBoaWRlQ2hldnJvbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgY2hldnJvbjogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRvZ2dsZXIgdG9nZ2xlci1zbSBidG4tZ3JvdXBcIiwgb25Nb3VzZU92ZXI6IHRoaXMuc2hvd0NoZXZyb24sIG9uTW91c2VPdXQ6IHRoaXMuaGlkZUNoZXZyb259LCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5idXR0b25DbGFzc2VzKHRydWUpLCBcbiAgICAgICAgICAgICAgJ2RhdGEtdG9nZ2xlJzogXCJkcm9wZG93blwiLCBcbiAgICAgICAgICAgICAgc3R5bGU6IHsgJ21hcmdpbi1ib3R0b20nOiAnMTNweCd9fSwgXG4gICAgICAgICAgICB0aGlzLmJ1dHRvblN0YXRlKCksIFxuICAgICAgICAgICAgdGhpcy5jaGV2cm9uKClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidG9nZ2xlci1iYWRnZVwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIiwgXG4gICAgICAgICAgICAgICAgaHJlZjogdGhpcy5wcm9wcy5wcm9kdWN0V2F0Y2hlcnNQYXRoLCBcbiAgICAgICAgICAgICAgICBzdHlsZTogeyBvcGFjaXR5OiAnMC41JywgJ2JvcmRlci10b3AtcmlnaHQtcmFkaXVzJzogJzJweCcsICdib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1cyc6ICcycHgnfX0sIFxuICAgICAgICAgICAgICB0aGlzLnN0YXRlLnByb2R1Y3RXYXRjaGVyc0NvdW50XG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnVsKHtcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImRyb3Bkb3duLW1lbnUgZHJvcGRvd24tbWVudS1yaWdodFwiLCBcbiAgICAgICAgICAgICAgcm9sZTogXCJtZW51XCIsIFxuICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogJ2F1dG8nLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnMzVweCcsICdwYWRkaW5nLXRvcCc6IDB9fSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkoe1xuICAgICAgICAgICAgICAgIHJvbGU6IFwicHJlc2VudGF0aW9uXCIsIFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJkcm9wZG93bi1oZWFkZXJcIiwgXG4gICAgICAgICAgICAgICAgc3R5bGU6IHsgY29sb3I6ICcjYTZhNmE2JywgJ2JhY2tncm91bmQtY29sb3InOiAnI2YzZjNmMyd9fSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXCJGb2xsb3dpbmcgUHJlZmVyZW5jZXNcIilcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkoe3JvbGU6IFwicHJlc2VudGF0aW9uXCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfSwgY2xhc3NOYW1lOiB0aGlzLnNlbGVjdGVkQ2xhc3MoJ25vdCB3YXRjaGluZycpfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtyb2xlOiBcIm1lbnVpdGVtXCIsIHRhYkluZGV4OiBcIi0xXCIsIG9uQ2xpY2s6IHRoaXMudXBkYXRlUHJlZmVyZW5jZS5iaW5kKHRoaXMsICdub3Qgd2F0Y2hpbmcnLCB0aGlzLnByb3BzLnByb2R1Y3RVbmZvbGxvd1BhdGgpfSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXCJOb3QgZm9sbG93aW5nXCIpXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiUmVjZWl2ZSBub3RpZmljYXRpb25zIHdoZW4geW91IGFyZSBAbWVudGlvbmVkXCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkoe3JvbGU6IFwicHJlc2VudGF0aW9uXCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfSwgY2xhc3NOYW1lOiB0aGlzLnNlbGVjdGVkQ2xhc3MoJ3dhdGNoaW5nJyl9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe3JvbGU6IFwibWVudWl0ZW1cIiwgdGFiSW5kZXg6IFwiLTFcIiwgb25DbGljazogdGhpcy51cGRhdGVQcmVmZXJlbmNlLmJpbmQodGhpcywgJ3dhdGNoaW5nJywgdGhpcy5wcm9wcy5wcm9kdWN0Rm9sbG93UGF0aCl9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcIkZvbGxvdyBhbm5vdW5jZW1lbnRzIG9ubHlcIilcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXG4gICAgICAgICAgICAgICAgICBcIlJlY2VpdmUgbm90aWZpY2F0aW9ucyB3aGVuIHRoZXJlIGFyZSBuZXcgYmxvZyBwb3N0c1wiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtyb2xlOiBcInByZXNlbnRhdGlvblwiLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ30sIGNsYXNzTmFtZTogdGhpcy5zZWxlY3RlZENsYXNzKCdzdWJzY3JpYmVkJyl9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe3JvbGU6IFwibWVudWl0ZW1cIiwgdGFiSW5kZXg6IFwiLTFcIiwgb25DbGljazogdGhpcy51cGRhdGVQcmVmZXJlbmNlLmJpbmQodGhpcywgJ3N1YnNjcmliZWQnLCB0aGlzLnByb3BzLnByb2R1Y3RTdWJzY3JpYmVQYXRoKX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFwiRm9sbG93XCIpXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFxuICAgICAgICAgICAgICAgICAgXCJSZWNlaXZlIG5vdGlmaWNhdGlvbnMgd2hlbiB0aGVyZSBhcmUgbmV3IGJsb2cgcG9zdHMsIGRpc2N1c3Npb25zLCBhbmQgY2hhdCBtZXNzYWdlc1wiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBzaG93Q2hldnJvbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgY2hldnJvbjogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZVVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2VsZWN0ZWQ6IE5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd25TdG9yZS5nZXRTZWxlY3RlZCgpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYnV0dG9uU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLnNlbGVjdGVkKSB7XG4gICAgICAgIGNhc2UgJ3N1YnNjcmliZWQnOlxuICAgICAgICAgIHJldHVybiAnRm9sbG93aW5nJztcbiAgICAgICAgY2FzZSAnd2F0Y2hpbmcnOlxuICAgICAgICAgIHJldHVybiAnRm9sbG93aW5nIGFubm91bmNlbWVudHMgb25seSc7XG4gICAgICAgIGNhc2UgJ25vdCB3YXRjaGluZyc6XG4gICAgICAgICAgcmV0dXJuICdGb2xsb3cnO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBidXR0b25DbGFzc2VzOiBmdW5jdGlvbihkcm9wZG93blRvZ2dsZSkge1xuICAgICAgcmV0dXJuIFJlYWN0LmFkZG9ucy5jbGFzc1NldCh7XG4gICAgICAgICdidG4nOiB0cnVlLFxuICAgICAgICAnYnRuLXByaW1hcnknOiAodGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gJ25vdCB3YXRjaGluZycpLFxuICAgICAgICAnYnRuLWRlZmF1bHQnOiAodGhpcy5zdGF0ZS5zZWxlY3RlZCAhPT0gJ25vdCB3YXRjaGluZycpLFxuICAgICAgICAnYnRuLXNtJzogdHJ1ZSxcbiAgICAgICAgJ2Ryb3Bkb3duLXRvZ2dsZSc6IGRyb3Bkb3duVG9nZ2xlXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBzZWxlY3RlZENsYXNzOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkID09PSBvcHRpb24pIHtcbiAgICAgICAgcmV0dXJuIFwiYWN0aXZlXCI7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVByZWZlcmVuY2U6IGZ1bmN0aW9uKGl0ZW0sIHBhdGgpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogRC5FVkVOVFMuU0VMRUNURURfVVBEQVRFRCxcbiAgICAgICAgYWN0aW9uOiBELkFDVElPTlMuVVBEQVRFX1NFTEVDVEVELFxuICAgICAgICBkYXRhOiB7IGl0ZW06IGl0ZW0sIHBhdGg6IHBhdGggfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd247XG4gIH1cblxuICB3aW5kb3cuTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93biA9IE5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd247XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIE51bWJlcklucHV0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTnVtYmVySW5wdXQnLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgYW1vdW50OiB0aGlzLnByb3BzLnN0YXJ0aW5nQW1vdW50LFxuICAgICAgICBlZGl0YWJsZTogdGhpcy5wcm9wcy5hbHdheXNFZGl0YWJsZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubGlzdGVuRm9yQ2hhbmdlcyh0aGlzLnJlZnMuaW5wdXRGaWVsZCAmJiB0aGlzLnJlZnMuaW5wdXRGaWVsZC5nZXRET01Ob2RlKCkpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5jb21wb25lbnREaWRNb3VudCgpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdGFibGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWRpdGFibGUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMudW5lZGl0YWJsZSgpO1xuICAgIH0sXG5cbiAgICBlZGl0YWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXBcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7bmFtZTogdGhpcy5wcm9wcy5uYW1lLCByZWY6IFwiaW5wdXRGaWVsZFwiLCB0eXBlOiBcIm51bWJlclwiLCBjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sXCIsIG1pbjogXCIwXCIsIHN0ZXA6IFwiMC4xXCIsIGRlZmF1bHRWYWx1ZTogdGhpcy5zdGF0ZS5hbW91bnR9KSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cC1hZGRvblwifSwgXCIlXCIpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHVuZWRpdGFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkKCcjZWRpdC1jb250cmFjdC0nICsgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgICQoc2VsZi5wcm9wcy5jb25maXJtQnV0dG9uKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgICQodGhpcykudGV4dCgpID09PSAnRWRpdCcgPyAkKHRoaXMpLnRleHQoJ0NhbmNlbCcpIDogJCh0aGlzKS50ZXh0KCdFZGl0Jyk7XG4gICAgICAgIHNlbGYuc2V0U3RhdGUoeyBlZGl0YWJsZTogIXNlbGYuc3RhdGUuZWRpdGFibGUgfSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIChSZWFjdC5ET00uc3BhbihudWxsLCBSZWFjdC5ET00uc3Ryb25nKG51bGwsIHRoaXMucHJvcHMuc3RhcnRpbmdBbW91bnQgKyAnJScpLCBcIiB0aXAgd2hlbiBjb2lucyBhcmUgbWludGVkXCIpKTtcbiAgICB9LFxuXG4gICAgbGlzdGVuRm9yQ2hhbmdlczogZnVuY3Rpb24obm9kZSkge1xuICAgICAgJChub2RlKS5vbignY2hhbmdlIGtleWRvd24nLCB0aGlzLmhhbmRsZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIGhhbmRsZUNoYW5nZTogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGNvbmZpcm1MaW5rID0gJCh0aGlzLnByb3BzLmNvbmZpcm1CdXR0b24pO1xuXG4gICAgICBpZiAoIV8uaXNFbXB0eShjb25maXJtTGluaykpIHtcbiAgICAgICAgdmFyIG5vZGUgPSAkKHRoaXMucmVmcy5pbnB1dEZpZWxkLmdldERPTU5vZGUoKSk7XG5cbiAgICAgICAgaWYgKG5vZGUgJiYgbm9kZS52YWwoKSAhPT0gdGhpcy5wcm9wcy5zdGFydGluZ0Ftb3VudCkge1xuICAgICAgICAgIGNvbmZpcm1MaW5rLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICAgICAgY29uZmlybUxpbmsub2ZmKCdjbGljaycpO1xuICAgICAgICAgIGNvbmZpcm1MaW5rLm9uKCdjbGljaycsIHsgbm9kZTogbm9kZSwgc2VsZjogdGhpcyB9LCB0aGlzLmNvbmZpcm0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbmZpcm1MaW5rLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgICBjb25maXJtTGluay5vZmYoJ2NsaWNrJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29uZmlybTogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIG5vZGUgPSBlLmRhdGEubm9kZTtcbiAgICAgIHZhciBzZWxmID0gZS5kYXRhLnNlbGY7XG4gICAgICB2YXIgb2JqID0ge1xuICAgICAgICBjb250cmFjdDoge1xuICAgICAgICAgIGFtb3VudDogbm9kZS52YWwoKSxcbiAgICAgICAgICB1c2VyOiB0aGlzLnByb3BzLnVzZXIuaWRcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgXy5kZWJvdW5jZSgkLmFqYXgoe1xuICAgICAgICB1cmw6IHNlbGYucHJvcHMudXBkYXRlUGF0aCxcbiAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICBkYXRhOiBvYmosXG4gICAgICAgIHN1Y2Nlc3M6IHNlbGYuaGFuZGxlU3VjY2VzcyxcbiAgICAgICAgZXJyb3I6IHNlbGYuaGFuZGxlRXJyb3JcbiAgICAgIH0pLCAzMDApO1xuICAgIH0sXG5cbiAgICBoYW5kbGVTdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKHRydWUpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVFcnJvcjogZnVuY3Rpb24oanF4aHIsIHN0YXR1cykge1xuICAgICAgY29uc29sZS5lcnJvcihzdGF0dXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBOdW1iZXJJbnB1dDtcbiAgfVxuXG4gIHdpbmRvdy5OdW1iZXJJbnB1dCA9IE51bWJlcklucHV0O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUGVvcGxlU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvcGVvcGxlX3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFBlb3BsZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1Blb3BsZScsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgaWYgKHRoaXMucHJvcHMuY29yZU9ubHkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBQZW9wbGVMaXN0KHtcbiAgICAgICAgICAgIG1lbWJlcnNoaXBzOiB0aGlzLnN0YXRlLmZpbHRlcmVkTWVtYmVyc2hpcHMsIFxuICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWQsIFxuICAgICAgICAgICAgb25GaWx0ZXI6IHRoaXMub25GaWx0ZXIsIFxuICAgICAgICAgICAgaW50ZXJlc3RGaWx0ZXJzOiB0aGlzLnByb3BzLmludGVyZXN0RmlsdGVycywgXG4gICAgICAgICAgICBjdXJyZW50VXNlcjogdGhpcy5wcm9wcy5jdXJyZW50VXNlciwgXG4gICAgICAgICAgICB1cGRhdGVQYXRoOiB0aGlzLnByb3BzLnVwZGF0ZVBhdGgsIFxuICAgICAgICAgICAgY29yZU1lbWJlcnNoaXBzOiB0aGlzLnByb3BzLmNvcmVNZW1iZXJzaGlwc30pXG4gICAgICAgICk7XG4gICAgICB9XG5cblxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgIFBlb3BsZUZpbHRlcih7XG4gICAgICAgICAgICAgIGludGVyZXN0RmlsdGVyczogdGhpcy5wcm9wcy5pbnRlcmVzdEZpbHRlcnMsIFxuICAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZCwgXG4gICAgICAgICAgICAgIG9uRmlsdGVyOiB0aGlzLm9uRmlsdGVyfSksIFxuICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIHRleHQtY2VudGVyXCJ9LCBcIlRpcDogWW91IGNhbiB1c2UgQG1lbnRpb25zIHRvIGdldCB0aGUgYXR0ZW50aW9uIG9mIFwiLCB0aGlzLmZpbHRlckxhYmVsKCksIFwiIGluIGNoYXQgb3IgQm91bnRpZXMuXCIpLCBcbiAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgIFBlb3BsZUxpc3Qoe1xuICAgICAgICAgICAgICBtZW1iZXJzaGlwczogdGhpcy5zdGF0ZS5maWx0ZXJlZE1lbWJlcnNoaXBzLCBcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWQsIFxuICAgICAgICAgICAgICBvbkZpbHRlcjogdGhpcy5vbkZpbHRlciwgXG4gICAgICAgICAgICAgIGludGVyZXN0RmlsdGVyczogdGhpcy5wcm9wcy5pbnRlcmVzdEZpbHRlcnMsIFxuICAgICAgICAgICAgICBjdXJyZW50VXNlcjogdGhpcy5wcm9wcy5jdXJyZW50VXNlciwgXG4gICAgICAgICAgICAgIHVwZGF0ZVBhdGg6IHRoaXMucHJvcHMudXBkYXRlUGF0aCwgXG4gICAgICAgICAgICAgIGNvcmVNZW1iZXJzaGlwczogdGhpcy5wcm9wcy5jb3JlTWVtYmVyc2hpcHN9KVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBQZW9wbGVTdG9yZS5zZXRQZW9wbGUodGhpcy5wcm9wcy5tZW1iZXJzaGlwcyk7XG4gICAgICB0aGlzLm9uRmlsdGVyKHRoaXMucHJvcHMuc2VsZWN0ZWQpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBQZW9wbGVTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLm9uQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vbkZpbHRlcih0aGlzLnN0YXRlLnNlbGVjdGVkKTtcbiAgICB9LFxuXG4gICAgb25GaWx0ZXI6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICB2YXIgZmlsdGVyZWRNZW1iZXJzaGlwcyA9IFBlb3BsZVN0b3JlLmdldFBlb3BsZSgpO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoaW50ZXJlc3QpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gaW50ZXJlc3QpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vbkZpbHRlcigpXG4gICAgICAgIH1cblxuICAgICAgICBmaWx0ZXJlZE1lbWJlcnNoaXBzID0gXy5maWx0ZXIoZmlsdGVyZWRNZW1iZXJzaGlwcywgZnVuY3Rpb24gZmlsdGVyTWVtYmVyc2hpcHMobSkge1xuICAgICAgICAgIGlmIChpbnRlcmVzdCA9PT0gJ2NvcmUnKSB7XG4gICAgICAgICAgICByZXR1cm4gbS5jb3JlX3RlYW07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIF8uaW5jbHVkZShtLmludGVyZXN0cywgaW50ZXJlc3QpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHZhciBzb3J0ZWRNZW1iZXJzaGlwcyA9IF8uc29ydEJ5KGZpbHRlcmVkTWVtYmVyc2hpcHMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgaWYgKCFtKSByZXR1cm47XG5cbiAgICAgICAgcmV0dXJuIChzZWxmLnByb3BzLmN1cnJlbnRVc2VyICYmIHNlbGYucHJvcHMuY3VycmVudFVzZXIuaWQgPT09IG0udXNlci5pZCA/XG4gICAgICAgICAgJy0xJyA6XG4gICAgICAgICAgbS5jb3JlX3RlYW0gPyAnMCcgOiAnMScpICtcbiAgICAgICAgICBtLnVzZXIudXNlcm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaWx0ZXJlZE1lbWJlcnNoaXBzOiBzb3J0ZWRNZW1iZXJzaGlwcywgc2VsZWN0ZWQ6IGludGVyZXN0IH0pO1xuICAgIH0sXG5cbiAgICBmaWx0ZXJMYWJlbDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5zcGFuKG51bGwsIFwiIHRoZSBcIiwgUmVhY3QuRE9NLmEoe3N0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9fSwgXCJAXCIsIHRoaXMuc3RhdGUuc2VsZWN0ZWQpLCBcIiB0ZWFtXCIpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICd0aGVzZSB0ZWFtcydcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgdmFyIFBlb3BsZUZpbHRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1Blb3BsZUZpbHRlcicsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBoaWdobGlnaHRBbGwgPSBzZWxmLnByb3BzICYmICFzZWxmLnByb3BzLnNlbGVjdGVkID8gJ3ByaW1hcnknOiAnZGVmYXVsdCc7XG4gICAgICB2YXIgaGlnaGxpZ2h0Q29yZSA9IHNlbGYucHJvcHMgJiYgc2VsZi5wcm9wcy5zZWxlY3RlZCA9PT0gJ2NvcmUnID8gJ3ByaW1hcnknOiAnZGVmYXVsdCc7XG5cbiAgICAgIHZhciB0YWdzID0gXy5tYXAodGhpcy5wcm9wcy5pbnRlcmVzdEZpbHRlcnMsIGZ1bmN0aW9uKGludGVyZXN0KXtcbiAgICAgICAgaWYgKGludGVyZXN0ID09PSAnY29yZScpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGFiZWwgPSAnQCcgKyBpbnRlcmVzdDtcbiAgICAgICAgdmFyIGhpZ2hsaWdodCA9IHNlbGYucHJvcHMgJiYgc2VsZi5wcm9wcy5zZWxlY3RlZCA9PT0gaW50ZXJlc3QgPyAncHJpbWFyeScgOiAnZGVmYXVsdCc7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiAnYnRuIGJ0bi0nICsgaGlnaGxpZ2h0LCBcbiAgICAgICAgICAgICAgaHJlZjogJyMnICsgbGFiZWwsIFxuICAgICAgICAgICAgICBvbkNsaWNrOiBzZWxmLmZpbHRlckNoYW5nZWQoaW50ZXJlc3QpLCBcbiAgICAgICAgICAgICAga2V5OiBpbnRlcmVzdH0sIFxuICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wteHMtMlwifSwgXG4gICAgICAgICAgICBcIkJyb3dzZSBieTpcIlxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wteHMtMTAgYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiAndGV4dC1tdXRlZCBidG4gYnRuLScgKyBoaWdobGlnaHRBbGwsIFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuY2xlYXJJbnRlcmVzdCwgXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ319LCBcbiAgICAgICAgICAgICAgXCJBbGxcIlxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiAndGV4dC1tdXRlZCBidG4gYnRuLScgKyBoaWdobGlnaHRDb3JlLCBcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmhpZ2hsaWdodENvcmUsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9fSwgXG4gICAgICAgICAgICAgIFwiQGNvcmVcIlxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICB0YWdzXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGZpbHRlckNoYW5nZWQ6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBzZWxmLnByb3BzLm9uRmlsdGVyKGludGVyZXN0KVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY2xlYXJJbnRlcmVzdDogZnVuY3Rpb24oZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkZpbHRlcigpO1xuICAgIH0sXG5cbiAgICBoaWdobGlnaHRDb3JlOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uRmlsdGVyKCdjb3JlJylcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBQZW9wbGVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnUGVvcGxlTGlzdCcsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJsaXN0LWdyb3VwIGxpc3QtZ3JvdXAtYnJlYWtvdXQgbGlzdC1ncm91cC1wYWRkZWRcIn0sIFxuICAgICAgICAgIHRoaXMucm93cyh0aGlzLnByb3BzLm1lbWJlcnNoaXBzKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHJvd3M6IGZ1bmN0aW9uKG1lbWJlcnNoaXBzKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciByb3dzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbWVtYmVyc2hpcHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBtZW1iZXIgPSBtZW1iZXJzaGlwc1tpXTtcblxuICAgICAgICBpZiAoIW1lbWJlcikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1c2VyID0gbWVtYmVyLnVzZXI7XG5cbiAgICAgICAgdmFyIHJvdyA9IChcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCIsIFxuICAgICAgICAgICAga2V5OiAncm93LScgKyB1c2VyLmlkLCBcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICdwYWRkaW5nLXRvcCc6ICcxNXB4JyxcbiAgICAgICAgICAgICAgJ3BhZGRpbmctYm90dG9tJzogJzE1cHgnLFxuICAgICAgICAgICAgICAnYm9yZGVyLWJvdHRvbSc6ICcxcHggc29saWQgI2ViZWJlYidcbiAgICAgICAgICAgIH19LCBcbiAgICAgICAgICAgIHRoaXMuYXZhdGFyKHVzZXIpLCBcbiAgICAgICAgICAgIHRoaXMubWVtYmVyKG1lbWJlcilcbiAgICAgICAgICApXG4gICAgICAgIClcblxuICAgICAgICByb3dzLnB1c2gocm93KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJvd3M7XG4gICAgfSxcblxuICAgIGF2YXRhcjogZnVuY3Rpb24odXNlcikge1xuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1zbS0xIGNvbC14cy0xIFwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHVzZXIudXJsLCB0aXRsZTogJ0AnICsgdXNlci51c2VybmFtZX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiB1c2VyLmF2YXRhcl91cmwsIFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJhdmF0YXJcIiwgXG4gICAgICAgICAgICAgICAgYWx0OiAnQCcgKyB1c2VyLnVzZXJuYW1lLCBcbiAgICAgICAgICAgICAgICB3aWR0aDogXCIzMFwiLCBcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMzBcIn1cbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIG1lbWJlcjogZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICBpZiAoIW1lbWJlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB1c2VyID0gbWVtYmVyLnVzZXI7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtc20tMTEgY29sLXhzLTExXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcIm9tZWdhXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImxpc3QtaW5saW5lIG9tZWdhIHB1bGwtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICB0aGlzLnNraWxscyhtZW1iZXIpXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB1c2VyLnVybCwgdGl0bGU6ICdAJyArIHVzZXIudXNlcm5hbWV9LCBcbiAgICAgICAgICAgICAgICB1c2VyLnVzZXJuYW1lXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICB1c2VyLmJpbyA/IHRoaXMuaGFzQmlvKHVzZXIpIDogJycsIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICBCaW9FZGl0b3Ioe1xuICAgICAgICAgICAgICAgIG1lbWJlcjogbWVtYmVyLCBcbiAgICAgICAgICAgICAgICBvbkZpbHRlcjogdGhpcy5wcm9wcy5vbkZpbHRlciwgXG4gICAgICAgICAgICAgICAgY3VycmVudFVzZXI6IHRoaXMucHJvcHMuY3VycmVudFVzZXIsIFxuICAgICAgICAgICAgICAgIHVwZGF0ZVBhdGg6IHRoaXMucHJvcHMudXBkYXRlUGF0aCwgXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxCaW86IG1lbWJlci5iaW8sIFxuICAgICAgICAgICAgICAgIGludGVyZXN0RmlsdGVyczogdGhpcy5wcm9wcy5pbnRlcmVzdEZpbHRlcnMsIFxuICAgICAgICAgICAgICAgIHVwZGF0ZVNraWxsczogdGhpcy51cGRhdGVTa2lsbHMsIFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnByb3BzLnNlbGVjdGVkfVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIHRoaXMuY29yZVRlYW1JbmZvKG1lbWJlcilcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBjb3JlVGVhbUluZm86IGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgdmFyIGNvcmUgPSB0aGlzLnByb3BzLmNvcmVNZW1iZXJzaGlwcztcblxuICAgICAgaWYgKGNvcmUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb3JlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHZhciBjID0gY29yZVtpXTtcblxuICAgICAgICAgIGlmIChjLnVzZXJfaWQgPT09IG1lbWJlci51c2VyLmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sICdDb3JlIHRlYW0gc2luY2UgJyArIF9wYXJzZURhdGUoYy5jcmVhdGVkX2F0KSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaGFzQmlvOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWQgdGV4dC1zbWFsbFwifSwgXG4gICAgICAgICAgdXNlci5iaW8gPyB1c2VyLmJpbyA6ICcnXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgc2tpbGxzOiBmdW5jdGlvbihtZW1iZXJzaGlwKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChtZW1iZXJzaGlwLmNvcmVfdGVhbSAmJiBtZW1iZXJzaGlwLmludGVyZXN0cy5pbmRleE9mKCdjb3JlJykgPCAwKSB7XG4gICAgICAgIG1lbWJlcnNoaXAuaW50ZXJlc3RzLnB1c2goJ2NvcmUnKVxuICAgICAgfVxuXG4gICAgICBtZW1iZXJzaGlwLmludGVyZXN0cy5zb3J0KCk7XG5cbiAgICAgIHJldHVybiBfLm1hcChtZW1iZXJzaGlwLmludGVyZXN0cywgZnVuY3Rpb24gbWFwSW50ZXJlc3RzKGludGVyZXN0KSB7XG4gICAgICAgIHZhciBsYWJlbCA9ICdAJyArIGludGVyZXN0O1xuICAgICAgICB2YXIgaGlnaGxpZ2h0ID0gc2VsZi5wcm9wcyAmJiBzZWxmLnByb3BzLnNlbGVjdGVkID09PSBpbnRlcmVzdCA/ICdwcmltYXJ5JyA6ICdvdXRsaW5lZCc7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiAnbGFiZWwgbGFiZWwtJyArIGhpZ2hsaWdodCwgXG4gICAgICAgICAgICAgICAga2V5OiBtZW1iZXJzaGlwLnVzZXIuaWQgKyAnLScgKyBpbnRlcmVzdCwgXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ30sIFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHNlbGYucHJvcHMub25GaWx0ZXIuYmluZChudWxsLCBpbnRlcmVzdCl9LCBcbiAgICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBCaW9FZGl0b3IgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdCaW9FZGl0b3InLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgY3VycmVudFVzZXI6IHRoaXMucHJvcHMuY3VycmVudFVzZXIsXG4gICAgICAgIG1lbWJlcjogdGhpcy5wcm9wcy5tZW1iZXIsXG4gICAgICAgIG9yaWdpbmFsQmlvOiB0aGlzLnByb3BzLm9yaWdpbmFsQmlvLFxuICAgICAgICBlZGl0aW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zbGljZSh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCc/JykgKyAxKS5zcGxpdCgnJicpO1xuXG4gICAgICBpZiAoIXRoaXMuaW50cm9kdWNlZCAmJiBwYXJhbXMuaW5kZXhPZignaW50cm9kdWN0aW9uPXRydWUnKSA+PSAwKSB7XG4gICAgICAgIHRoaXMuaW50cm9kdWNlZCA9IHRydWU7XG4gICAgICAgIHRoaXMubWFrZUVkaXRhYmxlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3VycmVudFVzZXIgPSB0aGlzLnN0YXRlLmN1cnJlbnRVc2VyO1xuICAgICAgdmFyIG1lbWJlciA9IHRoaXMuc3RhdGUubWVtYmVyO1xuXG4gICAgICBpZiAoIW1lbWJlciB8fCAhY3VycmVudFVzZXIpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYobnVsbCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50VXNlci5pZCA9PT0gbWVtYmVyLnVzZXIuaWQpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImpzLWVkaXQtYmlvXCIsIGtleTogJ2ItJyArIGN1cnJlbnRVc2VyLmlkfSwgXG4gICAgICAgICAgICAgIG1lbWJlci5iaW8sIFxuICAgICAgICAgICAgICBcIsKgXCIsIHRoaXMuc3RhdGUuZWRpdGluZyA/IHRoaXMuc2F2ZUJ1dHRvbigpIDogdGhpcy5lZGl0QnV0dG9uKClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7a2V5OiAnYi0nICsgbWVtYmVyLnVzZXIuaWR9LCBcbiAgICAgICAgICBtZW1iZXIuYmlvXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgZWRpdEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcInRleHQtc21hbGxcIiwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9LCBvbkNsaWNrOiB0aGlzLm1ha2VFZGl0YWJsZX0sIFwi4oCUwqBVcGRhdGUgSW50cm9cIilcbiAgICAgIClcbiAgICB9LFxuXG4gICAgc2F2ZUJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwiLCBzdHlsZTogeydtYXJnaW4tdG9wJzonMTZweCd9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtXCIsIG9uQ2xpY2s6IHRoaXMubWFrZVVuZWRpdGFibGUsIHN0eWxlOiB7J21hcmdpbi1yaWdodCcgOiAnOHB4J319LCBcIkNhbmNlbFwiKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtXCIsIG9uQ2xpY2s6IHRoaXMudXBkYXRlQmlvfSwgXCJTYXZlXCIpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgbWFrZUVkaXRhYmxlOiBmdW5jdGlvbihlKSB7XG4gICAgICAkKCcjZWRpdC1tZW1iZXJzaGlwLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcblxuICAgICAgJCgnI21vZGFsLWJpby1lZGl0b3InKS52YWwodGhpcy5zdGF0ZS5vcmlnaW5hbEJpbyk7XG4gICAgfSxcblxuICAgIHNraWxsc09wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBfLm1hcCh0aGlzLnByb3BzLmludGVyZXN0RmlsdGVycywgZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgICAgaWYgKGludGVyZXN0ID09PSAnY29yZScpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChSZWFjdC5ET00ub3B0aW9uKHt2YWx1ZTogaW50ZXJlc3R9LCAnQCcgKyBpbnRlcmVzdCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH0sXG5cbiAgICBtYWtlVW5lZGl0YWJsZTogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIG1lbWJlciA9IHRoaXMuc3RhdGUubWVtYmVyO1xuICAgICAgdmFyIGJpbyA9IHRoaXMuc3RhdGUub3JpZ2luYWxCaW8gfHwgdGhpcy5wcm9wcy5vcmlnaW5hbEJpbztcblxuICAgICAgdGhpcy5zYXZlKG1lbWJlciwgYmlvLCBtZW1iZXIuaW50ZXJlc3RzKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlQmlvOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgYmlvID0gJCgnLmJpby1lZGl0b3InKS52YWwoKTtcbiAgICAgIHZhciBpbnRlcmVzdHMgPSAkKCcjam9pbi1pbnRlcmVzdHMnKS52YWwoKTtcbiAgICAgIHZhciBtZW1iZXIgPSB0aGlzLnN0YXRlLm1lbWJlcjtcblxuICAgICAgdGhpcy5zYXZlKG1lbWJlciwgYmlvLCBpbnRlcmVzdHMpO1xuICAgIH0sXG5cbiAgICBzYXZlOiBmdW5jdGlvbihtZW1iZXIsIGJpbywgaW50ZXJlc3RzKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdGhpcy5wcm9wcy51cGRhdGVQYXRoLFxuICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBtZW1iZXJzaGlwOiB7XG4gICAgICAgICAgICBiaW86IGJpbyxcbiAgICAgICAgICAgIGludGVyZXN0czogaW50ZXJlc3RzXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgbWVtYmVyLmJpbyA9IGRhdGEuYmlvXG4gICAgICAgICAgbWVtYmVyLmludGVyZXN0cyA9IGRhdGEuaW50ZXJlc3RzXG4gICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7IG1lbWJlcjogbWVtYmVyLCBlZGl0aW5nOiBmYWxzZSwgb3JpZ2luYWxCaW86IGRhdGEuYmlvIH0pXG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbihkYXRhLCBzdGF0dXMpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKHN0YXR1cyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQZW9wbGU7XG4gIH1cblxuICB3aW5kb3cuUGVvcGxlID0gUGVvcGxlO1xuXG4gIGZ1bmN0aW9uIF9wYXJzZURhdGUoZGF0ZSkge1xuICAgIHZhciBwYXJzZWREYXRlID0gbmV3IERhdGUoZGF0ZSk7XG5cbiAgICByZXR1cm4gKHBhcnNlZERhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkgKyAnLScgKyBwYXJzZWREYXRlLmdldERhdGUoKS50b1N0cmluZygpICsgJy0nICsgcGFyc2VkRGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG4gIH1cbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIFBlcnNvblBpY2tlclN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3BlcnNvbl9waWNrZXJfc3RvcmUnKTtcbnZhciBBdmF0YXIgPSByZXF1aXJlKCcuL2F2YXRhci5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBQUCA9IENPTlNUQU5UUy5QRVJTT05fUElDS0VSO1xuXG4gIHZhciBrZXlzID0ge1xuICAgIGVudGVyOiAxMyxcbiAgICBlc2M6IDI3LFxuICAgIHVwOiAzOCxcbiAgICBkb3duOiA0MFxuICB9XG5cbiAgdmFyIFBlcnNvblBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1BlcnNvblBpY2tlcicsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IHVzZXJzOiBbXSwgaGlnaGxpZ2h0SW5kZXg6IDAgfVxuICAgIH0sXG5cbiAgICBjbGVhclRleHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5yZWZzLnVzZXJuYW1lT3JFbWFpbC5nZXRET01Ob2RlKCkudmFsdWUgPSAnJ1xuICAgICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldEluaXRpYWxTdGF0ZSgpKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtzdHlsZToge3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7Y2xhc3NOYW1lOiBcImZvcm0tY29udHJvbCBpbnB1dC1zbVwiLCB0eXBlOiBcInRleHRcIiwgXG4gICAgICAgICAgICAgICAgIHJlZjogXCJ1c2VybmFtZU9yRW1haWxcIiwgXG4gICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUNoYW5nZSwgXG4gICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5oYW5kbGVLZXksIFxuICAgICAgICAgICAgICAgICBvbkJsdXI6IHRoaXMuc2VsZWN0Q3VycmVudFVzZXIsIFxuICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogXCJAdXNlcm5hbWUgb3IgZW1haWwgYWRkcmVzc1wifSksIFxuICAgICAgICAgIHRoaXMuc3RhdGUudXNlcnMubGVuZ3RoID4gMCA/IHRoaXMudXNlclBpY2tlcigpIDogbnVsbFxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHVzZXJQaWNrZXI6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gVXNlclBpY2tlcih7XG4gICAgICAgIHVzZXJzOiB0aGlzLnN0YXRlLnVzZXJzLCBcbiAgICAgICAgaGlnaGxpZ2h0SW5kZXg6IHRoaXMuc3RhdGUuaGlnaGxpZ2h0SW5kZXgsIFxuICAgICAgICBvblVzZXJTZWxlY3RlZDogdGhpcy5oYW5kbGVVc2VyU2VsZWN0ZWR9KVxuICAgIH0sXG5cbiAgICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciB0ZXh0ID0gdGhpcy5yZWZzLnVzZXJuYW1lT3JFbWFpbC5nZXRET01Ob2RlKCkudmFsdWVcbiAgICAgIGlmKHRoaXMuaXNFbWFpbCh0ZXh0KSkge1xuICAgICAgICB0aGlzLmhhbmRsZUVtYWlsKHRleHQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmhhbmRsZVVzZXJuYW1lKHRleHQpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGhhbmRsZVVzZXJuYW1lOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICB2YXIgcG9zdERhdGEgPSB7XG4gICAgICAgIHN1Z2dlc3RfdXNlcm5hbWU6IHtcbiAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgIGNvbXBsZXRpb246IHtcbiAgICAgICAgICAgIGZpZWxkOiAnc3VnZ2VzdF91c2VybmFtZSdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdGhpcy5wcm9wcy51cmwgKyAnL3VzZXJzL19zdWdnZXN0JyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShwb3N0RGF0YSksXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgdXNlcnMgPSBfLm1hcChkYXRhLnN1Z2dlc3RfdXNlcm5hbWVbMF0ub3B0aW9ucywgZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQob3B0aW9uLnBheWxvYWQsIHsgdXNlcm5hbWU6IG9wdGlvbi50ZXh0IH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmNvbnN0cmFpbkhpZ2hsaWdodCh0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4KVxuICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZFVzZXJDaGFuZ2VkKHVzZXJzW2luZGV4XSlcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHt1c2VyczogdXNlcnMsIGhpZ2hsaWdodEluZGV4OiBpbmRleH0pXG4gICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdlcnJvcicsIGFyZ3VtZW50cylcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlRW1haWw6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHRoaXMucHJvcHMub25WYWxpZFVzZXJDaGFuZ2VkKHtlbWFpbDogdGV4dH0pXG4gICAgICB0aGlzLnNldFN0YXRlKHt1c2VyczogW119KVxuICAgIH0sXG5cbiAgICBoYW5kbGVLZXk6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT0ga2V5cy51cCkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgdGhpcy5tb3ZlSGlnaGxpZ2h0KC0xKVxuICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT0ga2V5cy5kb3duKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0aGlzLm1vdmVIaWdobGlnaHQoMSlcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09IGtleXMuZW50ZXIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMuc2VsZWN0Q3VycmVudFVzZXIoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3ZlSGlnaGxpZ2h0OiBmdW5jdGlvbihpbmMpIHtcbiAgICAgIHZhciBpbmRleCA9IHRoaXMuY29uc3RyYWluSGlnaGxpZ2h0KHRoaXMuc3RhdGUuaGlnaGxpZ2h0SW5kZXggKyBpbmMpXG4gICAgICB0aGlzLnByb3BzLm9uVmFsaWRVc2VyQ2hhbmdlZCh0aGlzLnN0YXRlLiB1c2Vyc1tpbmRleF0pXG4gICAgICB0aGlzLnNldFN0YXRlKHsgaGlnaGxpZ2h0SW5kZXg6IGluZGV4IH0pXG4gICAgfSxcblxuICAgIHNlbGVjdEN1cnJlbnRVc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0ZXh0ID0gdGhpcy5yZWZzLnVzZXJuYW1lT3JFbWFpbC5nZXRET01Ob2RlKCkudmFsdWVcbiAgICAgIHRoaXMuY2xlYXJUZXh0KClcblxuICAgICAgaWYgKHRoaXMuc3RhdGUudXNlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLnNlbGVjdEhpZ2hsaWdodCgpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNFbWFpbCh0ZXh0KSkge1xuICAgICAgICB0aGlzLnNlbGVjdEVtYWlsKHRleHQpXG4gICAgICB9XG4gICAgfSxcblxuICAgIHNlbGVjdEhpZ2hsaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmhhbmRsZVVzZXJTZWxlY3RlZCh0aGlzLnN0YXRlLnVzZXJzW3RoaXMuc3RhdGUuaGlnaGxpZ2h0SW5kZXhdKVxuICAgIH0sXG5cbiAgICBzZWxlY3RFbWFpbDogZnVuY3Rpb24oZW1haWwpIHtcbiAgICAgIHRoaXMucHJvcHMub25Vc2VyU2VsZWN0ZWQoe2VtYWlsOiBlbWFpbH0pXG4gICAgfSxcblxuICAgIGhhbmRsZVVzZXJTZWxlY3RlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5jbGVhclRleHQoKVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVzZXJzOiBbXSB9KVxuICAgICAgdGhpcy5wcm9wcy5vblVzZXJTZWxlY3RlZCh1c2VyKVxuICAgIH0sXG5cbiAgICBjb25zdHJhaW5IaWdobGlnaHQ6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgIDAsIE1hdGgubWluKHRoaXMuc3RhdGUudXNlcnMubGVuZ3RoIC0gMSwgaW5kZXgpXG4gICAgICApXG4gICAgfSxcblxuICAgIGlzRW1haWw6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiAvXkA/XFx3K0AvLmV4ZWModGV4dClcbiAgICB9XG4gIH0pXG5cbiAgdmFyIFVzZXJQaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdVc2VyUGlja2VyJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgJ3otaW5kZXgnOiAxMDAsXG4gICAgICAgIHRvcDogMjcsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIGRpc3BsYXk6ICdibG9jaydcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiZHJvcGRvd24tbWVudVwiLCBzdHlsZTogc3R5bGV9LCBcbiAgICAgICAgICB0aGlzLnJvd3MoKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHJvd3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSAtMVxuICAgICAgcmV0dXJuIF8ubWFwKHRoaXMucHJvcHMudXNlcnMsIGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICBpICs9IDFcbiAgICAgICAgcmV0dXJuIFVzZXJQaWNrZXJFbnRyeSh7a2V5OiB1c2VyLnVzZXJuYW1lLCB1c2VyOiB1c2VyLCBzZWxlY3RlZDogaSA9PT0gdGhpcy5wcm9wcy5oaWdobGlnaHRJbmRleCwgb25Vc2VyU2VsZWN0ZWQ6IHRoaXMucHJvcHMub25Vc2VyU2VsZWN0ZWR9KVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIH1cbiAgfSlcblxuICB2YXIgVXNlclBpY2tlckVudHJ5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVXNlclBpY2tlckVudHJ5JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNsYXNzTmFtZSA9ICd0ZXh0Y29tcGxldGUtaXRlbSdcbiAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkKSB7XG4gICAgICAgIGNsYXNzTmFtZSArPSAnIGFjdGl2ZSdcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IGNsYXNzTmFtZX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiAnI0AnICsgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lLCBvbkNsaWNrOiB0aGlzLmhhbmRsZVVzZXJTZWxlY3RlZCh0aGlzLnByb3BzLnVzZXIpfSwgXG4gICAgICAgICAgICBBdmF0YXIoe3VzZXI6IHRoaXMucHJvcHMudXNlciwgXG4gICAgICAgICAgICAgICAgc3R5bGU6IHsnbWFyZ2luLXJpZ2h0JzogJzEwcHgnfX0pLCBcbiAgICAgICAgICAgIFwiQFwiLCB0aGlzLnByb3BzLnVzZXIudXNlcm5hbWUsIFwiIFwiLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIHRoaXMucHJvcHMudXNlci5uYW1lKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVVc2VyU2VsZWN0ZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblVzZXJTZWxlY3RlZCh1c2VyKVxuICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBlcnNvblBpY2tlcjtcbiAgfVxuXG4gIHdpbmRvdy5QZXJzb25QaWNrZXIgPSBQZXJzb25QaWNrZXI7XG5cbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgUG9wb3ZlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1BvcG92ZXInLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgcGxhY2VtZW50OiBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWyd0b3AnLCdyaWdodCcsICdib3R0b20nLCAnbGVmdCddKSxcbiAgICAgIHBvc2l0aW9uTGVmdDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIHBvc2l0aW9uVG9wOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgYXJyb3dPZmZzZXRMZWZ0OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgYXJyb3dPZmZzZXRUb3A6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgICB0aXRsZTogUmVhY3QuUHJvcFR5cGVzLnJlbmRlcmFibGVcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwbGFjZW1lbnQ6ICdyaWdodCdcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICAgIHBvcG92ZXI6IHRydWUsXG4gICAgICAgIGluOiB0aGlzLnByb3BzLnBvc2l0aW9uTGVmdCAhPSBudWxsIHx8IHRoaXMucHJvcHMucG9zaXRpb25Ub3AgIT0gbnVsbFxuICAgICAgfTtcblxuICAgICAgY2xhc3Nlc1t0aGlzLnByb3BzLnBsYWNlbWVudF0gPSB0cnVlO1xuXG4gICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgIGxlZnQ6IHRoaXMucHJvcHMucG9zaXRpb25MZWZ0LFxuICAgICAgICB0b3A6IHRoaXMucHJvcHMucG9zaXRpb25Ub3AsXG4gICAgICAgIGRpc3BsYXk6ICdibG9jaydcbiAgICAgIH07XG5cbiAgICAgIHZhciBhcnJvd1N0eWxlID0ge1xuICAgICAgICBsZWZ0OiB0aGlzLnByb3BzLmFycm93T2Zmc2V0TGVmdCxcbiAgICAgICAgdG9wOiB0aGlzLnByb3BzLmFycm93T2Zmc2V0VG9wXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFJlYWN0LmFkZG9ucy5jbGFzc1NldChjbGFzc2VzKSwgc3R5bGU6IHN0eWxlfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImFycm93XCIsIHN0eWxlOiBhcnJvd1N0eWxlfSksIFxuICAgICAgICAgIHRoaXMucHJvcHMudGl0bGUgPyB0aGlzLnJlbmRlclRpdGxlKCkgOiBudWxsLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicG9wb3Zlci1jb250ZW50XCJ9LCBcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHJlbmRlclRpdGxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5oMyh7Y2xhc3NOYW1lOiBcInBvcG92ZXItdGl0bGVcIn0sIHRoaXMucHJvcHMudGl0bGUpXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQb3BvdmVyO1xuICB9XG5cbiAgd2luZG93LlBvcG92ZXIgPSBQb3BvdmVyO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUG9wb3ZlciA9IHJlcXVpcmUoJy4vcG9wb3Zlci5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgU2hhcmUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTaGFyZScsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IG1vZGFsOiBmYWxzZSB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCIsIGNsYXNzTmFtZTogXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtXCIsIHN0eWxlOiB7J3ZlcnRpY2FsLWFsaWduJzogJ2JvdHRvbSd9LCBvbkNsaWNrOiB0aGlzLnRvZ2dsZU1vZGFsfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1zaGFyZS1hbHRcIiwgc3R5bGU6IHtcIm1hcmdpbi1yaWdodFwiOiAyfX0pLCBcbiAgICAgICAgICAgIFwiU2hhcmVcIlxuICAgICAgICAgICksIFxuICAgICAgICAgIHRoaXMuc3RhdGUubW9kYWwgPyB0aGlzLnBvcG92ZXIoKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICB0b2dnbGVNb2RhbDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RhbDogIXRoaXMuc3RhdGUubW9kYWx9KVxuICAgIH0sXG5cbiAgICBwb3BvdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFBvcG92ZXIoe3BsYWNlbWVudDogXCJib3R0b21cIiwgcG9zaXRpb25MZWZ0OiA0NDAsIHBvc2l0aW9uVG9wOiAzMCwgdGl0bGU6IHRoaXMucHJvcHMudGl0bGV9LCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJsaXN0IGxpc3QtdW5zdHlsZWRcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtzdHlsZToge1wibWFyZ2luLWJvdHRvbVwiOiAxMH19LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC02XCJ9LCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi10d2l0dGVyIGJ0bi1ibG9ja1wiLCBvbkNsaWNrOiB0aGlzLmhhbmRsZVR3aXR0ZXJDbGlja30sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImljb24gaWNvbi10d2l0dGVyXCIsIHN0eWxlOiB7J21hcmdpbi1yaWdodCc6IDJ9fSksIFxuICAgICAgICAgICAgICAgICAgICBcIlR3aXR0ZXJcIlxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtNlwifSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcImJ0biBidG4tZmFjZWJvb2sgYnRuLWJsb2NrXCIsIGhyZWY6IFwiI1wiLCBvbkNsaWNrOiB0aGlzLmhhbmRsZUZhY2Vib29rQ2xpY2t9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tZmFjZWJvb2tcIiwgc3R5bGU6IHsnbWFyZ2luLXJpZ2h0JzogMn19KSwgXG4gICAgICAgICAgICAgICAgICAgIFwiRmFjZWJvb2tcIlxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICAgIENvcHlMaW5rKHt1cmw6IHRoaXMucHJvcHMudXJsfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgaGFuZGxlVHdpdHRlckNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5vcGVuKCdodHRwOi8vdHdpdHRlci5jb20vc2hhcmU/dXJsPScgKyB0aGlzLnByb3BzLnVybCArICcmdGV4dD0nICsgdGhpcy5wcm9wcy5zaGFyZVRleHQgKyAnJicsICd0d2l0dGVyd2luZG93JywgJ2hlaWdodD00NTAsIHdpZHRoPTU1MCwgdG9wPScrKCQod2luZG93KS5oZWlnaHQoKS8yIC0gMjI1KSArJywgbGVmdD0nKyQod2luZG93KS53aWR0aCgpLzIgKycsIHRvb2xiYXI9MCwgbG9jYXRpb249MCwgbWVudWJhcj0wLCBkaXJlY3Rvcmllcz0wLCBzY3JvbGxiYXJzPTAnKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlRmFjZWJvb2tDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICBGQi51aSh7XG4gICAgICAgIG1ldGhvZDogJ3NoYXJlJyxcbiAgICAgICAgaHJlZjogdGhpcy5wcm9wcy51cmwsXG4gICAgICB9LCBmdW5jdGlvbihyZXNwb25zZSl7fSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgQ29weUxpbmsgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDb3B5TGluaycsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IGxhYmVsOiAnQ29weScgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3JlZjogXCJ0ZXh0XCIsIHR5cGU6IFwidGV4dFwiLCBjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sXCIsIGlkOiBcInNoYXJlLXVybFwiLCB2YWx1ZTogdGhpcy5wcm9wcy51cmx9KSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cC1idG5cIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7cmVmOiBcImNvcHlcIiwgY2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdFwiLCB0eXBlOiBcImJ1dHRvblwifSwgdGhpcy5zdGF0ZS5sYWJlbClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICB2YXIgY2xpZW50ID0gbmV3IFplcm9DbGlwYm9hcmQodGhpcy5yZWZzLmNvcHkuZ2V0RE9NTm9kZSgpKVxuICAgICAgY2xpZW50Lm9uKCdyZWFkeScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNsaWVudC5vbignY29weScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5zZXREYXRhKCd0ZXh0L3BsYWluJywgc2VsZi5wcm9wcy51cmwpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNsaWVudC5vbignYWZ0ZXJjb3B5JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBzZWxmLnNldFN0YXRlKHtsYWJlbDogJ0NvcGllZCEnfSlcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7bGFiZWw6ICdDb3B5J30pXG4gICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTaGFyZTtcbiAgfVxuXG4gIHdpbmRvdy5TaGFyZSA9IFNoYXJlO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgVGFnTGlzdFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3RhZ19saXN0X3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFRDID0gQ09OU1RBTlRTLlRFWFRfQ09NUExFVEU7XG4gIHZhciBUQUdfTElTVCA9IENPTlNUQU5UUy5UQUdfTElTVDtcblxuICB2YXIgVGFnTGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1RhZ0xpc3QnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0YWdzOiB0aGlzLnByb3BzLnRhZ3NcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLmRlc3RpbmF0aW9uKSB7XG4gICAgICAgIFRhZ0xpc3RTdG9yZS5zZXRUYWdzKHRoaXMucHJvcHMudGFncyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJsaXN0LWlubGluZSBvbWVnYVwifSwgXG4gICAgICAgICAgdGhpcy50YWdzKHRoaXMuc3RhdGUudGFncylcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdGFnczogZnVuY3Rpb24odGFncykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGFkZGVkVGFncyA9IFRhZ0xpc3RTdG9yZS5nZXRUYWdzKCk7XG5cbiAgICAgIHZhciBtYXBwZWRUYWdzID0gXy5tYXAodGFncywgZnVuY3Rpb24odGFnKSB7XG4gICAgICAgIHZhciBzdHlsZSA9IHtcbiAgICAgICAgICAnZm9udC1zaXplJzogJzE0cHgnLFxuICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCFzZWxmLnByb3BzLmRlc3RpbmF0aW9uICYmIGFkZGVkVGFncy5pbmRleE9mKHRhZykgPj0gMCkge1xuICAgICAgICAgIHN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcbiAgICAgICAgICBzdHlsZS5jb2xvciA9ICcjZDNkM2QzJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGFnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYucHJvcHMuYWxsb3dSZW1vdmFsKSB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7c3R5bGU6IHsnbWFyZ2luJzogJzBweCd9fSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtzdHlsZTogc3R5bGV9LCB0YWcpLCBSZWFjdC5ET00uc3BhbihudWxsLCBSZWFjdC5ET00uYSh7c3R5bGU6IHsnbWFyZ2luLWxlZnQnOiAnMnB4JywgJ2ZvbnQtc2l6ZSc6ICcxMHB4JywgY3Vyc29yOiAncG9pbnRlcid9LCBvbkNsaWNrOiBzZWxmLmhhbmRsZUNsaWNrKHRhZyl9LCBcIsOXXCIpKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7c3R5bGU6IHsnbWFyZ2luJzogJzBweCd9fSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7c3R5bGU6IHN0eWxlLCBocmVmOiBzZWxmLnByb3BzLmZpbHRlclVybCA/IHNlbGYucHJvcHMuZmlsdGVyVXJsICsgJz90YWc9JyArIHRhZyA6ICdqYXZhc2NyaXB0OnZvaWQoMCk7Jywgb25DbGljazogc2VsZi5oYW5kbGVDbGljayh0YWcpfSwgdGFnKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGSVhNRTogV2hlbiB0aGVyZSBhcmUgbm8gdGFncywgdGhlIGNsaWVudCBqdXN0IHJlY2VpdmVzIFtcIlwiXSwgd2hpY2ggcmVxdWlyZXMgd2VpcmQgY2hlY2tzIGxpa2UgdGhpcy5cbiAgICAgIGlmICh0aGlzLnByb3BzLmRlc3RpbmF0aW9uICYmXG4gICAgICAgICAgKF8uaXNFbXB0eShtYXBwZWRUYWdzKSB8fFxuICAgICAgICAgICAgKG1hcHBlZFRhZ3NbMF0gPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgbWFwcGVkVGFnc1sxXSA9PSB1bmRlZmluZWQpKSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7c3R5bGU6IHtjb2xvcjogJyNkM2QzZDMnLCAnZm9udC1zaXplJzogJzEzcHgnfX0sIFwiTm8gdGFncyB5ZXQg4oCUIHdoeSBub3QgYWRkIHNvbWU/XCIpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtYXBwZWRUYWdzO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBUYWdMaXN0U3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5vbkNoYW5nZSk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0YWdzID0gVGFnTGlzdFN0b3JlLmdldFRhZ3MoKTtcblxuICAgICAgaWYgKHRoaXMucHJvcHMuZGVzdGluYXRpb24pIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdGFnczogdGFnc1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdGFnTGlzdEhhY2sgPSAkKCcjdGFnLWxpc3QtaGFjaycpO1xuXG4gICAgICAgIGlmICh0YWdMaXN0SGFjay5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAoXy5pc0VtcHR5KHRhZ3MpKSB7XG4gICAgICAgICAgICB0YWdMaXN0SGFjay5lbXB0eSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRhZ0xpc3RIYWNrLnZhbCgpO1xuXG4gICAgICAgICAgJCh0YWdMaXN0SGFjaykuYXBwZW5kKF8ubWFwKHRhZ3MsIGZ1bmN0aW9uKHRhZykge1xuICAgICAgICAgICAgaWYgKChzZWxlY3RlZCAmJiBzZWxlY3RlZC5pbmRleE9mKHRhZykgPT09IC0xKSB8fCAhc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICc8b3B0aW9uIHZhbHVlPScgKyB0YWcgKyAnIHNlbGVjdGVkPVwidHJ1ZVwiPicgKyB0YWcgKyAnPC9vcHRpb24+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHRhZ3M6IHRoaXMucHJvcHMudGFnc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uKHRhZykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5wcm9wcy5kZXN0aW5hdGlvbikge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuYWxsb3dSZW1vdmFsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogVEFHX0xJU1QuQUNUSU9OUy5SRU1PVkVfVEFHLFxuICAgICAgICAgICAgZGF0YTogeyB0YWc6IHRhZywgdXJsOiBzZWxmLnByb3BzLnVybCB9LFxuICAgICAgICAgICAgZXZlbnQ6IFRBR19MSVNULkVWRU5UUy5UQUdfUkVNT1ZFRFxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICBhY3Rpb246IFRBR19MSVNULkFDVElPTlMuQUREX1RBRyxcbiAgICAgICAgICBkYXRhOiB7IHRhZzogdGFnLCB1cmw6IHNlbGYucHJvcHMudXJsIH0sXG4gICAgICAgICAgZXZlbnQ6IFRBR19MSVNULkVWRU5UUy5UQUdfQURERUQgKyAnLXRydWUnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICAgIHRhZ3M6IHNlbGYuc3RhdGUudGFnc1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRhZ0xpc3Q7XG4gIH1cblxuICB3aW5kb3cuVGFnTGlzdCA9IFRhZ0xpc3Q7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFRpbWVzdGFtcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1RpbWVzdGFtcCcsXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkudGltZWFnbygpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS50aW1lYWdvKCdkaXNwb3NlJyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udGltZSh7Y2xhc3NOYW1lOiBcInRpbWVzdGFtcFwiLCBkYXRlVGltZTogdGhpcy5wcm9wcy50aW1lfSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRpbWVzdGFtcDtcbiAgfVxuXG4gIHdpbmRvdy5UaW1lc3RhbXAgPSBUaW1lc3RhbXA7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcblxuICBDT0lOX0lOQ1JFTUVOVCA9IDEwMFxuICBERUJPVU5DRV9USU1FT1VUID0gMjAwMFxuXG4gIHZhciBUaXBzVWkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdUaXBzVWknLFxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3VycmVudFVzZXIgPSBhcHAuY3VycmVudFVzZXIoKVxuICAgICAgaWYgKGN1cnJlbnRVc2VyKSB7XG4gICAgICAgIGN1cnJlbnRVc2VyID0gY3VycmVudFVzZXIuYXR0cmlidXRlc1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50VXNlcjogY3VycmVudFVzZXIsXG4gICAgICAgIHVybDogYXBwLnByb2R1Y3QuZ2V0KCd1cmwnKSArICcvdGlwcydcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpcHM6IF8ucmVkdWNlKHRoaXMucHJvcHMudGlwcywgZnVuY3Rpb24oaCwgdGlwKSB7IGhbdGlwLmZyb20uaWRdID0gdGlwOyByZXR1cm4gaCB9LCB7fSksXG4gICAgICAgIHVzZXJDZW50czogYXBwLmN1cnJlbnRQcm9kdWN0QmFsYW5jZSgpLFxuICAgICAgICBwZW5kaW5nQ2VudHM6IDBcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzLnJlZnMuYnV0dG9uLmdldERPTU5vZGUoKSkudG9vbHRpcCgpXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdG90YWxDZW50cyA9IHRoaXMudG90YWxDZW50cygpXG5cbiAgICAgIHZhciB0b29sdGlwID0gbnVsbFxuICAgICAgaWYgKHRoaXMucHJvcHMuY3VycmVudFVzZXIgPT0gbnVsbCkge1xuICAgICAgICB0b29sdGlwID0gJ1lvdSBuZWVkIHRvIHNpZ24gdXAgYmVmb3JlIHlvdSBjYW4gdGlwJ1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnVzZXJDZW50cyA8PSAwKSB7XG4gICAgICAgIHRvb2x0aXAgPSAnWW91IGhhdmUgbm8gY29pbnMgdG8gdGlwJ1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRVc2VySXNSZWNpcGllbnQoKSkge1xuICAgICAgICB0b29sdGlwID0gXCJZb3UgY2FuJ3QgdGlwIHlvdXJzZWxmXCJcbiAgICAgIH1cblxuICAgICAgdmFyIHRpcHBlcnMgPSBudWxsXG4gICAgICBpZiAodG90YWxDZW50cyA+IDApIHtcbiAgICAgICAgdGlwcGVycyA9IFRpcHBlcnMoe3RpcHM6IHRoaXMudGlwcygpfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImpzLXRpcHNcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogdG90YWxDZW50cyA+IDAgPyAndGV4dC1jb2lucycgOiBudWxsfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7cmVmOiBcImJ1dHRvblwiLCBocmVmOiBcImphdmFzY3JpcHQ6O1wiLCAnZGF0YS1wbGFjZW1lbnQnOiBcInRvcFwiLCAnZGF0YS10b2dnbGUnOiBcInRvb2x0aXBcIiwgdGl0bGU6IHRvb2x0aXAsIG9uQ2xpY2s6IHRoaXMuY3VycmVudFVzZXJDYW5UaXAoKSA/IHRoaXMuaGFuZGxlQ2xpY2sgOiBudWxsfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIFwiIFwiLCBudW1lcmFsKHRoaXMudG90YWxDZW50cygpIC8gMTAwKS5mb3JtYXQoJzAsMCcpKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICB0aXBwZXJzXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIG9wdGltaXN0aWNUaXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVwZGF0ZSA9IHsgcGVuZGluZ0NlbnRzOiB7ICRzZXQ6IHRoaXMuc3RhdGUucGVuZGluZ0NlbnRzICsgQ09JTl9JTkNSRU1FTlQgfSwgdGlwczoge319XG5cbiAgICAgIHZhciB0aXAgPSB0aGlzLnN0YXRlLnRpcHNbdGhpcy5wcm9wcy5jdXJyZW50VXNlci5pZF1cbiAgICAgIGlmICh0aXApIHtcbiAgICAgICAgdXBkYXRlLnRpcHNbdGhpcy5wcm9wcy5jdXJyZW50VXNlci5pZF0gPSB7ICRtZXJnZTogeyBjZW50czogdGlwLmNlbnRzICsgQ09JTl9JTkNSRU1FTlQgfSB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cGRhdGUudGlwc1t0aGlzLnByb3BzLmN1cnJlbnRVc2VyLmlkXSA9IHsgJHNldDogeyBmcm9tOiB0aGlzLnByb3BzLmN1cnJlbnRVc2VyLCBjZW50czogQ09JTl9JTkNSRU1FTlQgfSB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB1cGRhdGUpKVxuICAgIH0sXG5cbiAgICBzYXZlOiBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgIHVybDogdGhpcy5wcm9wcy51cmwsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0aXA6IHtcbiAgICAgICAgICAgIGFkZDogdGhpcy5zdGF0ZS5wZW5kaW5nQ2VudHMsXG4gICAgICAgICAgICB2aWFfdHlwZTogdGhpcy5wcm9wcy52aWFUeXBlLFxuICAgICAgICAgICAgdmlhX2lkOiB0aGlzLnByb3BzLnZpYUlkXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGVuZGluZ0NlbnRzOiAwfSlcbiAgICAgIH0uYmluZCh0aGlzKX0pXG4gICAgfSwgREVCT1VOQ0VfVElNRU9VVCksXG5cbiAgICBoYW5kbGVDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9wdGltaXN0aWNUaXAoKVxuICAgICAgdGhpcy5zYXZlKClcbiAgICB9LFxuXG4gICAgY3VycmVudFVzZXJDYW5UaXA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudXNlckNlbnRzID4gMCAmJiAhdGhpcy5jdXJyZW50VXNlcklzUmVjaXBpZW50KClcbiAgICB9LFxuXG4gICAgY3VycmVudFVzZXJJc1JlY2lwaWVudDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jdXJyZW50VXNlci5pZCA9PSB0aGlzLnByb3BzLnJlY2lwaWVudC5pZFxuICAgIH0sXG5cbiAgICB0b3RhbENlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLnJlZHVjZShfLm1hcCh0aGlzLnRpcHMoKSwgZnVuYy5kb3QoJ2NlbnRzJykpLCBmdW5jLmFkZCwgMClcbiAgICB9LFxuXG4gICAgdGlwczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy52YWx1ZXModGhpcy5zdGF0ZS50aXBzKVxuICAgIH1cbiAgfSlcblxuICB2YXIgVGlwcGVycyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1RpcHBlcnMnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFwi4oCUIHRpcHBlZCBieSDCoFwiLCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJsaXN0LWlubGluZS1tZWRpYVwifSwgXG4gICAgICAgICAgICBfLm1hcCh0aGlzLnByb3BzLnRpcHMsIHRoaXMucm93KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICByb3c6IGZ1bmN0aW9uKHRpcCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmxpKHtrZXk6IHRpcC5mcm9tLmlkfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmltZyh7XG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiaW1nLWNpcmNsZVwiLCBcbiAgICAgICAgICAgIHNyYzogdGlwLmZyb20uYXZhdGFyX3VybCwgXG4gICAgICAgICAgICBhbHQ6ICdAJyArIHRpcC5mcm9tLnVzZXJuYW1lLCBcbiAgICAgICAgICAgICdkYXRhLXRvZ2dsZSc6IFwidG9vbHRpcFwiLCBcbiAgICAgICAgICAgICdkYXRhLXBsYWNlbWVudCc6IFwidG9wXCIsIFxuICAgICAgICAgICAgdGl0bGU6ICdAJyArIHRpcC5mcm9tLnVzZXJuYW1lLCBcbiAgICAgICAgICAgIHdpZHRoOiBcIjE2XCIsIGhlaWdodDogXCIxNlwifSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUaXBzVWk7XG4gIH1cbiAgXG4gIHdpbmRvdy5UaXBzVWkgPSBUaXBzVWk7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL2NoYXRfbm90aWZpY2F0aW9uc19zdG9yZScpO1xudmFyIE5ld3NGZWVkU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFRpdGxlTm90aWZpY2F0aW9uc0NvdW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVGl0bGVOb3RpZmljYXRpb25zQ291bnQnLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuc2V0VGl0bGUpO1xuICAgICAgTmV3c0ZlZWRTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLnNldFRpdGxlKTtcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBkb2N1bWVudC50aXRsZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvdW50OiAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKG51bGwpO1xuICAgIH0sXG5cbiAgICBzZXRUaXRsZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2hhdENvdW50ID0gQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5nZXRVbnJlYWRDb3VudChwYXJzZUludChsb2NhbFN0b3JhZ2UuY2hhdEFjaywgMTApKSB8fCAwO1xuICAgICAgdmFyIG5ld3NDb3VudCA9IE5ld3NGZWVkU3RvcmUuZ2V0VW5yZWFkQ291bnQocGFyc2VJbnQobG9jYWxTdG9yYWdlLm5ld3NGZWVkQWNrLCAxMCkpIHx8IDA7XG5cbiAgICAgIHZhciB0b3RhbCA9IGNoYXRDb3VudCArIG5ld3NDb3VudDtcblxuICAgICAgZG9jdW1lbnQudGl0bGUgPSB0b3RhbCA+IDAgP1xuICAgICAgICAnKCcgKyB0b3RhbCArICcpICcgKyB0aGlzLnByb3BzLnRpdGxlIDpcbiAgICAgICAgdGhpcy5wcm9wcy50aXRsZTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGl0bGVOb3RpZmljYXRpb25zQ291bnQ7XG4gIH1cblxuICB3aW5kb3cuVGl0bGVOb3RpZmljYXRpb25zQ291bnQgPSBUaXRsZU5vdGlmaWNhdGlvbnNDb3VudDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgVXJnZW5jeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1VyZ2VuY3knLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBsYWJlbDogdGhpcy5wcm9wcy5pbml0aWFsTGFiZWwgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImRyb3Bkb3duXCIsIHN0eWxlOiB7XCJkaXNwbGF5XCI6XCJpbmxpbmUtYmxvY2tcIn19LCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7J2RhdGEtdG9nZ2xlJzogXCJkcm9wZG93blwiLCBocmVmOiBcIiNcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5sYWJlbENsYXNzKHRoaXMuc3RhdGUubGFiZWwpfSwgdGhpcy5zdGF0ZS5sYWJlbClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51XCJ9LCBcbiAgICAgICAgICAgIHRoaXMubGlzdEl0ZW1zKClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgbGlzdEl0ZW1zOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnVyZ2VuY2llcy5tYXAoZnVuY3Rpb24odSl7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtrZXk6IHV9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtvbkNsaWNrOiB0aGlzLnVwZGF0ZVVyZ2VuY3kodSl9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5sYWJlbENsYXNzKHUpfSwgdSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgdXBkYXRlVXJnZW5jeTogZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bGFiZWw6IGxhYmVsfSlcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6IHRoaXMucHJvcHMudXJsLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgdHlwZTogJ1BBVENIJyxcbiAgICAgICAgICBkYXRhOiB7IHVyZ2VuY3k6IGxhYmVsLnRvTG93ZXJDYXNlKCkgfVxuICAgICAgICB9KTtcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0sXG5cbiAgICBsYWJlbENsYXNzOiBmdW5jdGlvbih1cmdlbmN5KSB7XG4gICAgICByZXR1cm4gXCJsYWJlbCBsYWJlbC1cIiArIHVyZ2VuY3kudG9Mb3dlckNhc2UoKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBVcmdlbmN5O1xuICB9XG5cbiAgd2luZG93LlVyZ2VuY3kgPSBVcmdlbmN5O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBVc2VyTmF2YmFyRHJvcGRvd24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdVc2VyTmF2YmFyRHJvcGRvd24nLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51XCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdGhpcy5wcm9wcy51c2VyUGF0aH0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi11c2VyIGRyb3Bkb3duLWdseXBoXCJ9KSwgXG4gICAgICAgICAgICAgIFwiUHJvZmlsZVwiXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdGhpcy5wcm9wcy5lZGl0VXNlclBhdGh9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tc2V0dGluZ3MgZHJvcGRvd24tZ2x5cGhcIn0pLCBcbiAgICAgICAgICAgICAgXCJTZXR0dGluZ3NcIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiZGl2aWRlclwifSksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMuZGVzdHJveVVzZXJTZXNzaW9uUGF0aCwgJ2RhdGEtbWV0aG9kJzogXCJkZWxldGVcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1sb2dvdXQgZHJvcGRvd24tZ2x5cGhcIn0pLCBcbiAgICAgICAgICAgICAgXCJMb2cgb3V0XCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFVzZXJOYXZiYXJEcm9wZG93bjtcbiAgfVxuICBcbiAgd2luZG93LlVzZXJOYXZiYXJEcm9wZG93biA9IFVzZXJOYXZiYXJEcm9wZG93bjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBDT05TVEFOVFMgPSB7XG4gICAgQ0hBVF9OT1RJRklDQVRJT05TOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFDS05PV0xFREdFOiAnY2hhdDphY2tub3dsZWRnZScsXG4gICAgICAgIEZFVENIX0NIQVRfUk9PTVM6ICdjaGF0OmZldGNoQ2hhdFJvb21zJyxcbiAgICAgICAgTUFSS19ST09NX0FTX1JFQUQ6ICdjaGF0Om1hcmtSb29tQXNSZWFkJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBBQ0tOT1dMRURHRUQ6ICdjaGF0OmFja25vd2xlZGdlZCcsXG4gICAgICAgIENIQVRfUk9PTVNfRkVUQ0hFRDogJ2NoYXQ6Y2hhdFJvb21zRmV0Y2hlZCcsXG4gICAgICAgIENIQVRfUk9PTV9SRUFEOiAnY2hhdDpjaGF0Um9vbVJlYWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIENPSU5fT1dORVJTSElQOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFERF9VU0VSOiAnYWRkVXNlcicsXG4gICAgICAgIFJFTU9WRV9VU0VSOiAncmVtb3ZlVXNlcicsXG4gICAgICAgIFVQREFURV9VU0VSOiAndXBkYXRlVXNlcidcbiAgICAgIH0sXG4gICAgICBFVkVOVFM6IHtcbiAgICAgICAgVVNFUl9BRERFRDogJ2NvaW5Pd25lcnNoaXA6dXNlckFkZGVkJyxcbiAgICAgICAgVVNFUl9SRU1PVkVEOiAnY29pbk93bmVyc2hpcDp1c2VyUmVtb3ZlZCcsXG4gICAgICAgIFVTRVJfVVBEQVRFRDogJ2NvaW5Pd25lcnNoaXA6dXNlclVwZGF0ZWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIElOVEVSRVNUX1BJQ0tFUjoge1xuICAgICAgQUNUSU9OUzoge1xuICAgICAgICBBRERfSU5URVJFU1Q6ICdhZGRJbnRlcmVzdCcsXG4gICAgICAgIFJFTU9WRV9JTlRFUkVTVDogJ3JlbW92ZUludGVyZXN0JyxcbiAgICAgICAgUE9QOiAncG9wJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBJTlRFUkVTVF9BRERFRDogJ2ludGVyZXN0UGlja2VyOmludGVyZXN0QWRkZWQnLFxuICAgICAgICBJTlRFUkVTVF9SRU1PVkVEOiAnaW50ZXJlc3RQaWNrZXI6aW50ZXJlc3RSZW1vdmVkJyxcbiAgICAgICAgUE9QUEVEOiAnaW50ZXJlc3RQaWNrZXI6cG9wcGVkJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBORVdTX0ZFRUQ6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUNLTk9XTEVER0U6ICduZXdzRmVlZDphY2tub3dsZWRnZScsXG4gICAgICAgIEZFVENIX1NUT1JJRVM6ICduZXdzRmVlZDpmZXRjaFN0b3JpZXMnLFxuICAgICAgICBGRVRDSF9NT1JFX1NUT1JJRVM6ICduZXdzRmVlZDpmZXRjaE1vcmVTdG9yaWVzJyxcbiAgICAgICAgTUFSS19BU19SRUFEOiAnbmV3c0ZlZWQ6bWFya0FzUmVhZCcsXG4gICAgICAgIE1BUktfQUxMX0FTX1JFQUQ6ICduZXdzRmVlZDptYXJrQWxsQXNSZWFkJyxcbiAgICAgICAgTUFSS19TVE9SWV9BU19SRUFEOiAnbmV3c0ZlZWQ6bWFya1N0b3J5QXNSZWFkJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBBQ0tOT1dMRURHRUQ6ICduZXdzRmVlZDphY2tub3dsZWRnZWQnLFxuICAgICAgICBSRUFEOiAnbmV3c0ZlZWQ6cmVhZCcsXG4gICAgICAgIFJFQURfQUxMOiAnbmV3c0ZlZWQ6cmVhZEFsbCcsXG4gICAgICAgIFNUT1JJRVNfRkVUQ0hFRDogJ25ld3NGZWVkOnN0b3JpZXNGZXRjaGVkJyxcbiAgICAgICAgU1RPUllfUkVBRDogJ25ld3NGZWVkOnN0b3J5UmVhZCdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgTk9USUZJQ0FUSU9OX1BSRUZFUkVOQ0VTX0RST1BET1dOOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIFVQREFURV9TRUxFQ1RFRDogJ3VwZGF0ZVNlbGVjdGVkJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBTRUxFQ1RFRF9VUERBVEVEOiAnbm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93bjpzZWxlY3RlZFVwZGF0ZWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIFBFUlNPTl9QSUNLRVI6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUREX1VTRVI6ICdhZGRQaWNrZWRVc2VyJyxcbiAgICAgICAgUkVNT1ZFX1VTRVI6ICdyZW1vdmVQaWNrZWRVc2VyJyxcbiAgICAgICAgVVBEQVRFX1VTRVI6ICd1cGRhdGVQaWNrZWRVc2VyJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBVU0VSX0FEREVEOiAncGVyc29uUGlja2VyOnVzZXJBZGRlZCcsXG4gICAgICAgIFVTRVJfUkVNT1ZFRDogJ3BlcnNvblBpY2tlcjp1c2VyUmVtb3ZlZCcsXG4gICAgICAgIFVTRVJfVVBEQVRFRDogJ3BlcnNvblBpY2tlcjp1c2VyVXBkYXRlZCdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgVEFHX0xJU1Q6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUREX1RBRzogJ2FkZFRhZycsXG4gICAgICAgIFJFTU9WRV9UQUc6ICdyZW1vdmVUYWcnXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIFRBR19BRERFRDogJ3RleHRDb21wbGV0ZTp0YWdBZGRlZCcsXG4gICAgICAgIFRBR19SRU1PVkVEOiAndGFnTGlzdDp0YWdSZW1vdmVkJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBURVhUX0NPTVBMRVRFOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFERF9UQUc6ICdhZGRUYWcnXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIERJRF9NT1VOVDogJ3RleHRDb21wbGV0ZTpkaWRNb3VudCcsXG4gICAgICAgIFRBR19BRERFRDogJ3RleHRDb21wbGV0ZTp0YWdBZGRlZCdcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDT05TVEFOVFM7XG4gIH1cblxuICB3aW5kb3cuQ09OU1RBTlRTID0gQ09OU1RBTlRTO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9jYWxsYmFja3MgPSBbXTtcblxuICB2YXIgRGlzcGF0Y2hlciA9IF8uZXh0ZW5kKEZ1bmN0aW9uLnByb3RvdHlwZSwge1xuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgX2NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcblxuICAgICAgLy8gUmV0dXJuaW5nIHRoZSBjYWxsYmFjaydzIGluZGV4IGFsbG93c1xuICAgICAgLy8gZXhwbGljaXQgcmVmZXJlbmNlcyB0byB0aGUgY2FsbGJhY2tcbiAgICAgIC8vIG91dHNpZGUgb2YgdGhlIGRpc3BhdGNoZXJcbiAgICAgIHJldHVybiBfY2FsbGJhY2tzLmxlbmd0aCAtIDE7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoOiBmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgICBpZiAoXy5pc0VtcHR5KF9jYWxsYmFja3MpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBfY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBfY2FsbGJhY2tzW2ldKHBheWxvYWQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICBpZiAoX2NhbGxiYWNrc1tpbmRleF0pIHtcbiAgICAgICAgX2NhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICByZW1vdmVBbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgX2NhbGxiYWNrcyA9IFtdO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEaXNwYXRjaGVyO1xuICB9XG5cbiAgd2luZG93LkRpc3BhdGNoZXIgPSBEaXNwYXRjaGVyO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBEcm9wZG93blRvZ2dsZXJNaXhpbiA9IHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNsYXNzZXMgPSBbJ2ljb24nLCAnbmF2YmFyLWljb24nLCB0aGlzLnByb3BzLmljb25DbGFzc107XG4gICAgICB2YXIgdG90YWwgPSB0aGlzLmJhZGdlQ291bnQoKTtcbiAgICAgIHZhciBiYWRnZSA9IG51bGw7XG5cbiAgICAgIGlmICh0b3RhbCA+IDApIHtcbiAgICAgICAgYmFkZ2UgPSB0aGlzLmJhZGdlKHRvdGFsKTtcbiAgICAgICAgY2xhc3Nlcy5wdXNoKCdnbHlwaGljb24taGlnaGxpZ2h0Jyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB0aGlzLnByb3BzLmhyZWYsICdkYXRhLXRvZ2dsZSc6IFwiZHJvcGRvd25cIiwgb25DbGljazogdGhpcy5hY2tub3dsZWRnZX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IGNsYXNzZXMuam9pbignICcpfSksIFxuICAgICAgICAgIGJhZGdlLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInZpc2libGUteHMtaW5saW5lXCIsIHN0eWxlOiB7ICdtYXJnaW4tbGVmdCc6ICc1cHgnfX0sIFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5sYWJlbFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEcm9wZG93blRvZ2dsZXJNaXhpbjtcbiAgfVxuXG4gIHdpbmRvdy5Ecm9wZG93blRvZ2dsZXJNaXhpbiA9IERyb3Bkb3duVG9nZ2xlck1peGluO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgTmV3c0ZlZWRTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9uZXdzX2ZlZWRfc3RvcmUnKTtcbnZhciBOZXdzRmVlZFVzZXJzU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3VzZXJzX3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIE5ld3NGZWVkTWl4aW4gPSB7XG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRhcmdldCA9IHRoaXMucmVmcy5zcGlubmVyLmdldERPTU5vZGUoKTtcbiAgICAgIHZhciBvcHRzID0gdGhpcy5zcGlubmVyT3B0aW9ucyB8fCB7XG4gICAgICAgIGxpbmVzOiAxMyxcbiAgICAgICAgbGVuZ3RoOiAzMCxcbiAgICAgICAgcmFkaXVzOiA1NVxuICAgICAgfTtcblxuICAgICAgdmFyIHNwaW5uZXIgPSB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKCk7XG5cbiAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChzcGlubmVyLmVsKTtcbiAgICB9LFxuXG4gICAgZ2V0U3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzdG9yaWVzOiBOZXdzRmVlZFN0b3JlLmdldFN0b3JpZXMoKSxcbiAgICAgICAgYWN0b3JzOiBOZXdzRmVlZFVzZXJzU3RvcmUuZ2V0VXNlcnMoKVxuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzZWxmLnN0YXRlLnN0b3JpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgc2VsZi5zcGlubmVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBOZXdzRmVlZE1peGluO1xuICB9XG5cbiAgd2luZG93Lk5ld3NGZWVkTWl4aW4gPSBOZXdzRmVlZE1peGluO1xufSkoKTtcbiIsInZhciB4aHIgPSByZXF1aXJlKCcuLi94aHInKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIHJyTWV0YVRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdyZWFkLXJhcHRvci11cmwnKTtcbiAgdmFyIFJFQURfUkFQVE9SX1VSTCA9IHJyTWV0YVRhZyAmJiByck1ldGFUYWdbMF0gJiYgcnJNZXRhVGFnWzBdLmNvbnRlbnQ7XG5cbiAgdmFyIF9jaGF0Um9vbXMgPSB7fTtcbiAgdmFyIF9zb3J0S2V5cyA9IFtdO1xuICB2YXIgX29wdGltaXN0aWNhbGx5VXBkYXRlZENoYXRSb29tcyA9IHt9O1xuICB2YXIgX2RlZmVycmVkID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuICB2YXIgbm9vcCA9IGZ1bmN0aW9uKCkge307XG5cbiAgdmFyIF9ub3RpZmljYXRpb25zU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICAnY2hhdDphY2tub3dsZWRnZSc6IG5vb3AsXG5cbiAgICAnY2hhdDptYXJrUm9vbUFzUmVhZCc6IGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICAgIHdpbmRvdy54aHIubm9Dc3JmR2V0KHBheWxvYWQucmVhZHJhcHRvcl91cmwpO1xuXG4gICAgICBfb3B0aW1pc3RpY2FsbHlVcGRhdGVkQ2hhdFJvb21zW3BheWxvYWQuaWRdID0ge1xuICAgICAgICBsYXN0X3JlYWRfYXQ6IG1vbWVudCgpLnVuaXgoKVxuICAgICAgfTtcblxuICAgICAgdGhpcy5lbWl0KF9kZWZlcnJlZC5wb3AoKSk7XG4gICAgfSxcblxuICAgICdjaGF0OmZldGNoQ2hhdFJvb21zJzogZnVuY3Rpb24odXJsKSB7XG4gICAgICB3aW5kb3cueGhyLmdldCh1cmwsIHRoaXMuaGFuZGxlRmV0Y2hlZENoYXRSb29tcy5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZ2V0VW5yZWFkQ291bnQ6IGZ1bmN0aW9uKGFja25vd2xlZGdlZEF0KSB7XG4gICAgICB2YXIgY291bnQgPSBfLmNvdW50QnkoXG4gICAgICAgIF9jaGF0Um9vbXMsXG4gICAgICAgIGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgICAgdmFyIHVwZGF0ZWQgPSBlbnRyeS51cGRhdGVkIC0gZW50cnkubGFzdF9yZWFkX2F0ID4gNTtcblxuICAgICAgICAgIGlmIChhY2tub3dsZWRnZWRBdCkge1xuICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZWQgJiYgZW50cnkudXBkYXRlZCA+IGFja25vd2xlZGdlZEF0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB1cGRhdGVkO1xuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICByZXR1cm4gY291bnQudHJ1ZSB8fCAwO1xuICAgIH0sXG5cbiAgICBoYW5kbGVGZXRjaGVkQ2hhdFJvb21zOiBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2hhdFJvb21zID0gZGF0YS5jaGF0X3Jvb21zO1xuICAgICAgX3NvcnRLZXlzID0gZGF0YS5zb3J0X2tleXM7XG5cbiAgICAgIHZhciB1cmwgPSBSRUFEX1JBUFRPUl9VUkwgK1xuICAgICAgICAnL3JlYWRlcnMvJyArXG4gICAgICAgIGFwcC5jdXJyZW50VXNlcigpLmdldCgnaWQnKSArXG4gICAgICAgICcvYXJ0aWNsZXM/JyArXG4gICAgICAgIF8ubWFwKFxuICAgICAgICAgIGNoYXRSb29tcyxcbiAgICAgICAgICBmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2tleT0nICsgci5pZFxuICAgICAgICAgIH1cbiAgICAgICAgKS5qb2luKCcmJyk7XG5cbiAgICAgIHdpbmRvdy54aHIubm9Dc3JmR2V0KHVybCwgdGhpcy5oYW5kbGVSZWFkUmFwdG9yKGNoYXRSb29tcykpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVSZWFkUmFwdG9yOiBmdW5jdGlvbihjaGF0Um9vbXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiByZWFkUmFwdG9yQ2FsbGJhY2soZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmIChlcnIpIHsgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTsgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXRSb29tcyA9IF8ucmVkdWNlKFxuICAgICAgICAgIGNoYXRSb29tcyxcbiAgICAgICAgICBmdW5jdGlvbihoLCBjaGF0Um9vbSkge1xuICAgICAgICAgICAgaFtjaGF0Um9vbS5pZF0gPSBjaGF0Um9vbTtcbiAgICAgICAgICAgIGhbY2hhdFJvb20uaWRdLmxhc3RfcmVhZF9hdCA9IDA7XG5cbiAgICAgICAgICAgIHJldHVybiBoO1xuICAgICAgICAgIH0sXG4gICAgICAgICAge31cbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmFwcGx5UmVhZFRpbWVzKGRhdGEsIGNoYXRSb29tcyk7XG4gICAgICAgIHRoaXMuc2V0Q2hhdFJvb21zKGNoYXRSb29tcyk7XG4gICAgICAgIHRoaXMuZW1pdChfZGVmZXJyZWQucG9wKCkpO1xuICAgICAgfS5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBhcHBseVJlYWRUaW1lczogZnVuY3Rpb24oZGF0YSwgY2hhdFJvb21zKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBkYXR1bSA9IGRhdGFbaV07XG5cbiAgICAgICAgaWYgKGRhdHVtLmxhc3RfcmVhZF9hdCAmJiBjaGF0Um9vbXNbZGF0dW0ua2V5XSkge1xuICAgICAgICAgIGNoYXRSb29tc1tkYXR1bS5rZXldLmxhc3RfcmVhZF9hdCA9IGRhdHVtLmxhc3RfcmVhZF9hdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRDaGF0Um9vbTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiBfY2hhdFJvb21zW2lkXTtcbiAgICB9LFxuXG4gICAgZ2V0Q2hhdFJvb21zOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfY2hhdFJvb21zO1xuICAgIH0sXG5cbiAgICBnZXRTb3J0S2V5czogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX3NvcnRLZXlzO1xuICAgIH0sXG5cbiAgICBzZXRDaGF0Um9vbXM6IGZ1bmN0aW9uKGNoYXRSb29tcykge1xuICAgICAgX2NoYXRSb29tcyA9IGNoYXRSb29tcztcblxuICAgICAgdmFyIGtleXMgPSBfLmtleXMoX29wdGltaXN0aWNhbGx5VXBkYXRlZENoYXRSb29tcylcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoX2NoYXRSb29tc1trZXlzW2ldXSkge1xuICAgICAgICAgIC8qKiBGSVhNRTogUmVhZHJhcHRvciBvbmx5IHVwZGF0ZXMgbGFzdF9yZWFkX2F0IG9uIHBhZ2UgbG9hZCAqL1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGluZyBsYXN0IHJlYWQ/Jyk7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coX2NoYXRSb29tc1trZXlzW2ldXSlcbiAgICAgICAgICBfY2hhdFJvb21zW2tleXNbaV1dLmxhc3RfcmVhZF9hdCA9IF9vcHRpbWlzdGljYWxseVVwZGF0ZWRDaGF0Um9vbXNba2V5c1tpXV0ubGFzdF9yZWFkX2F0O1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGVkIGxhc3QgcmVhZD8nKTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhfY2hhdFJvb21zW2tleXNbaV1dKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIF9vcHRpbWlzdGljYWxseVVwZGF0ZWRDaGF0Um9vbXMgPSB7fVxuICAgIH0sXG5cbiAgICByZW1vdmVDaGF0Um9vbTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIGRlbGV0ZSBfY2hhdFJvb21zW2lkXVxuICAgIH0sXG5cbiAgICByZW1vdmVBbGxDaGF0Um9vbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgX2NoYXRSb29tcyA9IHt9O1xuICAgIH0sXG5cbiAgICBtb3N0UmVjZW50bHlVcGRhdGVkQ2hhdFJvb206IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKF8ua2V5cyhfY2hhdFJvb21zKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfLm1heChcbiAgICAgICAgXy5maWx0ZXIoXG4gICAgICAgICAgXy52YWx1ZXMoX2NoYXRSb29tcyksXG4gICAgICAgICAgZnVuY3Rpb24gZmlsdGVyUm9vbXMocm9vbSkge1xuICAgICAgICAgICAgcmV0dXJuIHJvb20uaWQgIT09IChhcHAuY2hhdFJvb20gfHwge30pLmlkO1xuICAgICAgICAgIH1cbiAgICAgICAgKSxcbiAgICAgICAgZnVuYy5kb3QoJ3VwZGF0ZWQnKVxuICAgICAgKTtcbiAgICB9LFxuICB9KTtcblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuICAgIHZhciBzeW5jID0gcGF5bG9hZC5zeW5jO1xuXG4gICAgaWYgKCFfc3RvcmVbYWN0aW9uXSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuXG4gICAgaWYgKHN5bmMpIHtcbiAgICAgIHJldHVybiBfc3RvcmUuZW1pdChldmVudCk7XG4gICAgfVxuXG4gICAgX2RlZmVycmVkLnB1c2goZXZlbnQpO1xuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9ub3RpZmljYXRpb25zU3RvcmU7XG4gIH1cblxuICB3aW5kb3cuQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZSA9IF9ub3RpZmljYXRpb25zU3RvcmU7XG59KSgpO1xuIiwidmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICAvLyB7IHVzZXI6IFVzZXIsIGNvaW5zOiBOdW1iZXIgfVxuICB2YXIgX3VzZXJzQW5kQ29pbnMgPSBbXTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG4gIHZhciBfY29pbk93bmVyc2hpcFN0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgYWRkVXNlcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHVzZXJBbmRDb2lucyA9IGRhdGEudXNlckFuZENvaW5zO1xuXG4gICAgICBpZiAoX3NlYXJjaFVzZXJzKHVzZXJBbmRDb2lucy51c2VybmFtZSkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgX3VzZXJzQW5kQ29pbnMucHVzaCh1c2VyQW5kQ29pbnMpO1xuICAgIH0sXG5cbiAgICBnZXRVc2VyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoVXNlcnMoZGF0YS51c2VybmFtZSk7XG5cbiAgICAgIHJldHVybiBfdXNlcnNBbmRDb2luc1tpbmRleF07XG4gICAgfSxcblxuICAgIGdldFVzZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfdXNlcnNBbmRDb2lucztcbiAgICB9LFxuXG4gICAgdXBkYXRlVXNlcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHVzZXJBbmRDb2lucyA9IGRhdGEudXNlckFuZENvaW5zO1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFVzZXJzKHVzZXJBbmRDb2lucy51c2VybmFtZSk7XG5cbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfdXNlcnNBbmRDb2luc1tpbmRleF0gPSB1c2VyQW5kQ29pbnM7XG5cbiAgICAgIHJldHVybiBfdXNlcnNBbmRDb2luc1tpbmRleF07XG4gICAgfSxcblxuICAgIHJlbW92ZVVzZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB1c2VyQW5kQ29pbnMgPSBkYXRhLnVzZXJBbmRDb2lucztcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hVc2Vycyh1c2VyQW5kQ29pbnMudXNlcm5hbWUpO1xuXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBfdXNlcnNBbmRDb2lucy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXRVc2VyczogZnVuY3Rpb24odXNlcnMpIHtcbiAgICAgIF91c2Vyc0FuZENvaW5zID0gdXNlcnM7XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbFVzZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIF91c2Vyc0FuZENvaW5zID0gW107XG4gICAgfVxuICB9KTtcblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuXG4gICAgX3N0b3JlW2FjdGlvbl0gJiYgX3N0b3JlW2FjdGlvbl0oZGF0YSk7XG4gICAgX3N0b3JlLmVtaXQoZXZlbnQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBfc2VhcmNoVXNlcnModXNlcm5hbWUpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IF91c2Vyc0FuZENvaW5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIHVzZXJBbmRDb2lucyA9IF91c2Vyc0FuZENvaW5zW2ldO1xuXG4gICAgICBpZiAodXNlckFuZENvaW5zLnVzZXJuYW1lID09PSB1c2VybmFtZSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9jb2luT3duZXJzaGlwU3RvcmU7XG4gIH1cblxuICB3aW5kb3cuQ29pbk93bmVyc2hpcFN0b3JlID0gX2NvaW5Pd25lcnNoaXBTdG9yZTtcbn0pKCk7XG4iLCJ2YXIgeGhyID0gcmVxdWlyZSgnLi4veGhyJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfaW50ZXJlc3RzID0gWydjb2RlJywgJ2Rlc2lnbiddO1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcblxuICB2YXIgX2ludGVyZXN0U3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICBhZGRJbnRlcmVzdDogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIGlmICghaW50ZXJlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoX2ludGVyZXN0cy5pbmRleE9mKGludGVyZXN0KSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfaW50ZXJlc3RzLnB1c2goaW50ZXJlc3QpO1xuICAgIH0sXG5cbiAgICBnZXRJbnRlcmVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9pbnRlcmVzdHM7XG4gICAgfSxcblxuICAgIHJlbW92ZUludGVyZXN0OiBmdW5jdGlvbihpbnRlcmVzdCkge1xuICAgICAgdmFyIGluZGV4ID0gX2ludGVyZXN0cy5pbmRleE9mKGludGVyZXN0KTtcblxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgX2ludGVyZXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb3A6IGZ1bmN0aW9uKCkge1xuICAgICAgX2ludGVyZXN0cy5wb3AoKTtcbiAgICB9LFxuXG4gICAgc2V0SW50ZXJlc3RzOiBmdW5jdGlvbihpbnRlcmVzdHMpIHtcbiAgICAgIF9pbnRlcmVzdHMgPSBpbnRlcmVzdHM7XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbEludGVyZXN0czogZnVuY3Rpb24oKSB7XG4gICAgICBfaW50ZXJlc3RzID0gWydjb2RlJywgJ2Rlc2lnbiddO1xuICAgIH1cbiAgfSk7XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcblxuICAgIF9zdG9yZVthY3Rpb25dICYmIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuICAgIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJlc3RTdG9yZTtcbiAgfVxuICBcbiAgd2luZG93LkludGVyZXN0U3RvcmUgPSBfaW50ZXJlc3RTdG9yZTtcbn0pKCk7XG4iLCJ2YXIgeGhyID0gcmVxdWlyZSgnLi4veGhyJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xudmFyIE5ld3NGZWVkVXNlcnNTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9uZXdzX2ZlZWRfdXNlcnNfc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgcnJNZXRhVGFnID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoJ3JlYWQtcmFwdG9yLXVybCcpO1xuICB2YXIgUkVBRF9SQVBUT1JfVVJMID0gcnJNZXRhVGFnICYmIHJyTWV0YVRhZ1swXSAmJiByck1ldGFUYWdbMF0uY29udGVudDtcblxuICB2YXIgX3N0b3JpZXMgPSB7fTtcbiAgdmFyIF9vcHRpbWlzdGljU3RvcmllcyA9IHt9O1xuICB2YXIgX2RlZmVycmVkID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuXG4gIHZhciBfbmV3c0ZlZWRTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIGFkZFN0b3J5OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RvcnkgPSBkYXRhLnN0b3J5O1xuXG4gICAgICBfc3Rvcmllc1tzdG9yeS5rZXldID0gc3Rvcnk7XG4gICAgfSxcblxuICAgIGFkZFN0b3JpZXM6IGZ1bmN0aW9uKHN0b3JpZXMpIHtcbiAgICAgIGlmICghc3Rvcmllcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3Rvcmllcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHN0b3J5ID0gc3Rvcmllc1tpXTtcblxuICAgICAgICBfc3Rvcmllc1tzdG9yeS5rZXldID0gc3Rvcnk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFwcGx5UmVhZFRpbWVzOiBmdW5jdGlvbihkYXRhLCBzdG9yaWVzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBkYXR1bSA9IGRhdGFbaV07XG5cbiAgICAgICAgaWYgKGRhdHVtLmxhc3RfcmVhZF9hdCAmJiBzdG9yaWVzW2RhdHVtLmtleV0pIHtcbiAgICAgICAgICBzdG9yaWVzW2RhdHVtLmtleV0ubGFzdF9yZWFkX2F0ID0gZGF0dW0ubGFzdF9yZWFkX2F0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhhbmRsZUZldGNoZWRTdG9yaWVzOiBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1c2VycyA9IGRhdGEudXNlcnM7XG4gICAgICAgIHZhciBzdG9yaWVzID0gZGF0YS5zdG9yaWVzO1xuXG4gICAgICAgIE5ld3NGZWVkVXNlcnNTdG9yZS5zZXRVc2Vycyh1c2Vycyk7XG5cbiAgICAgICAgdmFyIHVybCA9IFJFQURfUkFQVE9SX1VSTCArXG4gICAgICAgICAgJy9yZWFkZXJzLycgK1xuICAgICAgICAgIGFwcC5jdXJyZW50VXNlcigpLmdldCgnaWQnKSArXG4gICAgICAgICAgJy9hcnRpY2xlcz8nICtcbiAgICAgICAgICBfLm1hcChcbiAgICAgICAgICAgIHN0b3JpZXMsXG4gICAgICAgICAgICBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICAgIHJldHVybiAna2V5PVN0b3J5XycgKyBzLmlkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKS5qb2luKCcmJylcblxuICAgICAgICB3aW5kb3cueGhyLm5vQ3NyZkdldCh1cmwsIHNlbGYuaGFuZGxlUmVhZFJhcHRvcihzdG9yaWVzLCBtZXRob2QpKTtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBoYW5kbGVSZWFkUmFwdG9yOiBmdW5jdGlvbihzdG9yaWVzLCBtZXRob2QpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJlYWRSYXB0b3JDYWxsYmFjayhlcnIsIGRhdGEpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzdG9yaWVzID0gXy5yZWR1Y2UoXG4gICAgICAgICAgc3RvcmllcyxcbiAgICAgICAgICBmdW5jdGlvbihoYXNoLCBzdG9yeSkge1xuICAgICAgICAgICAgaGFzaFtzdG9yeS5rZXldID0gc3Rvcnk7XG4gICAgICAgICAgICBoYXNoW3N0b3J5LmtleV0ubGFzdF9yZWFkX2F0ID0gMDtcblxuICAgICAgICAgICAgcmV0dXJuIGhhc2g7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7fVxuICAgICAgICApO1xuXG4gICAgICAgIHNlbGYuYXBwbHlSZWFkVGltZXMoZGF0YSwgc3Rvcmllcyk7XG4gICAgICAgIHNlbGZbbWV0aG9kXShzdG9yaWVzKTtcbiAgICAgICAgc2VsZi5lbWl0KF9kZWZlcnJlZC5wb3AoKSk7XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICAnbmV3c0ZlZWQ6YWNrbm93bGVkZ2UnOiBmdW5jdGlvbih0aW1lc3RhbXApIHt9LFxuXG4gICAgJ25ld3NGZWVkOmZldGNoU3Rvcmllcyc6IGZ1bmN0aW9uKHVybCkge1xuICAgICAgd2luZG93Lnhoci5nZXQodXJsLCB0aGlzLmhhbmRsZUZldGNoZWRTdG9yaWVzKCdzZXRTdG9yaWVzJykpO1xuICAgIH0sXG5cbiAgICAnbmV3c0ZlZWQ6ZmV0Y2hNb3JlU3Rvcmllcyc6IGZ1bmN0aW9uKHVybCkge1xuICAgICAgd2luZG93Lnhoci5nZXQodXJsLCB0aGlzLmhhbmRsZUZldGNoZWRTdG9yaWVzKCdhZGRTdG9yaWVzJykpO1xuICAgIH0sXG5cbiAgICAnbmV3c0ZlZWQ6bWFya0FzUmVhZCc6IGZ1bmN0aW9uKHN0b3J5SWQpIHtcbiAgICAgIHZhciB1cmwgPSAnL3VzZXIvdHJhY2tpbmcvJyArIHN0b3J5SWQ7XG5cbiAgICAgIHdpbmRvdy54aHIuZ2V0KHVybCwgdGhpcy5tYXJrZWRBc1JlYWQoc3RvcnlJZCkpO1xuICAgIH0sXG5cbiAgICAnbmV3c0ZlZWQ6bWFya0FsbEFzUmVhZCc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVucmVhZCA9IF8uZmlsdGVyKF9zdG9yaWVzLCBmdW5jdGlvbihzdG9yeSkge1xuICAgICAgICByZXR1cm4gc3RvcnkubGFzdF9yZWFkX2F0ID09IG51bGw7XG4gICAgICB9KTtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHVucmVhZC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgKGZ1bmN0aW9uKGopIHtcbiAgICAgICAgICB2YXIgc3RvcnkgPSB1bnJlYWRbal07XG5cbiAgICAgICAgICBpZiAoIXN0b3J5Lmxhc3RfcmVhZF9hdCkge1xuICAgICAgICAgICAgLy8gd2UgZG8gYWN0dWFsbHkgd2FudCB0aGUgaWQgaGVyZSwgbm90IHRoZSBrZXlcbiAgICAgICAgICAgIHZhciBzdG9yeUlkID0gc3RvcnkuaWQ7XG4gICAgICAgICAgICB2YXIgdXJsID0gJy91c2VyL3RyYWNraW5nLycgKyBzdG9yeUlkO1xuXG4gICAgICAgICAgICB3aW5kb3cueGhyLmdldCh1cmwsIHNlbGYubWFya2VkQXNSZWFkKHN0b3J5SWQsIHRydWUsIChqICsgMSA9PT0gbCkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKGkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAnbmV3c0ZlZWQ6bWFya1N0b3J5QXNSZWFkJzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHN0b3J5SWQgPSBkYXRhLmtleTtcbiAgICAgIHZhciB1cmwgPSBkYXRhLnJlYWRyYXB0b3JfdXJsO1xuXG4gICAgICB3aW5kb3cueGhyLm5vQ3NyZkdldCh1cmwpO1xuXG4gICAgICBfb3B0aW1pc3RpY1N0b3JpZXNbc3RvcnlJZF0gPSB7XG4gICAgICAgIGxhc3RfcmVhZF9hdDogbW9tZW50KCkudW5peCgpXG4gICAgICB9O1xuXG4gICAgICB0aGlzLmVtaXQoX2RlZmVycmVkLnBvcCgpKTtcbiAgICB9LFxuXG4gICAgbWFya2VkQXNSZWFkOiBmdW5jdGlvbihzdG9yeUlkLCB3YWl0LCByZWFkeSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gbWFya2VkQXNSZWFkKGVyciwgZGF0YSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdG9yeSA9IHNlbGYuZ2V0U3Rvcnkoc3RvcnlJZCk7XG5cbiAgICAgICAgLy8gRklYTUU6IFVzZSB0aGUgdmFsdWUgZnJvbSBSZWFkcmFwdG9yXG4gICAgICAgIHN0b3J5Lmxhc3RfcmVhZF9hdCA9IG1vbWVudCgpLnVuaXgoKTtcblxuICAgICAgICBpZiAoIXdhaXQpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5lbWl0KF9kZWZlcnJlZC5wb3AoKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGSVhNRTogV2UgcmVhbGx5IG5lZWQgYSBwcm9wZXIgZXZlbnQgZW1pdHRlclxuICAgICAgICBpZiAocmVhZHkpIHtcbiAgICAgICAgICBzZWxmLmVtaXQoX2RlZmVycmVkLnBvcCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLmVtaXQoX2RlZmVycmVkW19kZWZlcnJlZC5sZW5ndGggLSAxXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0U3Rvcnk6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoU3RvcmllcyhpZCk7XG5cbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHJldHVybiBfc3Rvcmllc1tpbmRleF07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICBnZXRTdG9yaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzdG9yaWVzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgaW4gX3N0b3JpZXMpIHtcbiAgICAgICAgc3Rvcmllcy5wdXNoKF9zdG9yaWVzW2ldKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0b3JpZXM7XG4gICAgfSxcblxuICAgIGdldFVucmVhZENvdW50OiBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgICAgIHZhciBjb3VudCA9IF8uY291bnRCeShcbiAgICAgICAgX3N0b3JpZXMsXG4gICAgICAgIGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgICAgaWYgKHRpbWVzdGFtcCkge1xuICAgICAgICAgICAgcmV0dXJuIGVudHJ5LnVwZGF0ZWQgPiB0aW1lc3RhbXBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBjb3VudC50cnVlIHx8IDA7XG4gICAgfSxcblxuICAgIHNldFN0b3JpZXM6IGZ1bmN0aW9uKHN0b3JpZXMpIHtcbiAgICAgIGZvciAodmFyIHN0b3J5IGluIF9vcHRpbWlzdGljU3Rvcmllcykge1xuICAgICAgICBpZiAoc3Rvcmllcy5oYXNPd25Qcm9wZXJ0eShzdG9yeSkpIHtcbiAgICAgICAgICBzdG9yaWVzW3N0b3J5XS5sYXN0X3JlYWRfYXQgPSBfb3B0aW1pc3RpY1N0b3JpZXNbc3RvcnldLmxhc3RfcmVhZF9hdDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBfb3B0aW1pc3RpY1N0b3JpZXMgPSB7fTtcblxuICAgICAgX3N0b3JpZXMgPSBzdG9yaWVzO1xuICAgIH0sXG5cbiAgICByZW1vdmVTdG9yeTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hTdG9yaWVzKGlkKTtcblxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgX3N0b3JpZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsU3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICBfc3RvcmllcyA9IFtdO1xuICAgIH1cbiAgfSk7XG5cbiAgX3NlYXJjaFN0b3JpZXMgPSBmdW5jdGlvbihpZCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gX3N0b3JpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoX3N0b3JpZXNbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG4gICAgdmFyIHN5bmMgPSBwYXlsb2FkLnN5bmM7XG5cbiAgICBpZiAoIV9zdG9yZVthY3Rpb25dKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgX3N0b3JlW2FjdGlvbl0oZGF0YSk7XG5cbiAgICBpZiAoc3luYykge1xuICAgICAgcmV0dXJuIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgICB9XG5cbiAgICBfZGVmZXJyZWQucHVzaChldmVudCk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX25ld3NGZWVkU3RvcmU7XG4gIH1cbiAgXG4gIHdpbmRvdy5OZXdzRmVlZFN0b3JlID0gX25ld3NGZWVkU3RvcmU7XG59KSgpO1xuIiwidmFyIHhociA9IHJlcXVpcmUoJy4uL3hocicpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX3VzZXJzID0ge307XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuXG4gIHZhciBfbmV3c0ZlZWRVc2Vyc1N0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgc2V0VXNlcnM6IGZ1bmN0aW9uKHVzZXJzKSB7XG4gICAgICBfdXNlcnMgPSB1c2VycztcbiAgICB9LFxuXG4gICAgYWRkVXNlcnM6IGZ1bmN0aW9uKHVzZXJzKSB7XG4gICAgICBmb3IgKHZhciB1c2VyIGluIHVzZXJzKSB7XG4gICAgICAgIGlmICghX3VzZXJzLmhhc093blByb3BlcnR5KHVzZXIpKSB7XG4gICAgICAgICAgX3VzZXJzW3VzZXJdID0gdXNlcnNbdXNlcl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0VXNlcnM6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gX3VzZXJzO1xuICAgIH0sXG5cbiAgICByZW1vdmVBbGxVc2VyczogZnVuY3Rpb24oKSB7XG4gICAgICBfdXNlcnMgPSBbXTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX25ld3NGZWVkVXNlcnNTdG9yZTtcbiAgfVxuXG4gIHdpbmRvdy5OZXdzRmVlZFVzZXJzU3RvcmUgPSBfbmV3c0ZlZWRVc2Vyc1N0b3JlO1xufSkoKTtcbiIsInZhciB4aHIgPSByZXF1aXJlKCcuLi94aHInKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9zZWxlY3RlZDtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG5cbiAgdmFyIF9kcm9wZG93blN0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgdXBkYXRlU2VsZWN0ZWQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBpdGVtID0gZGF0YS5pdGVtO1xuICAgICAgdmFyIHBhdGggPSBkYXRhLnBhdGg7XG5cbiAgICAgIHdpbmRvdy54aHIucG9zdChwYXRoKTtcblxuICAgICAgX3NlbGVjdGVkID0gaXRlbTtcbiAgICB9LFxuXG4gICAgZ2V0U2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9zZWxlY3RlZDtcbiAgICB9LFxuXG4gICAgc2V0U2VsZWN0ZWQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIF9zZWxlY3RlZCA9IGl0ZW07XG4gICAgfSxcblxuICAgIHJlbW92ZVNlbGVjdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIF9zZWxlY3RlZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG5cbiAgICBpZiAoIV9zdG9yZVthY3Rpb25dKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgX3N0b3JlW2FjdGlvbl0gJiYgX3N0b3JlW2FjdGlvbl0oZGF0YSk7XG4gICAgX3N0b3JlLmVtaXQoZXZlbnQpO1xuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9kcm9wZG93blN0b3JlO1xuICB9XG4gIFxuICB3aW5kb3cuTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93blN0b3JlID0gX2Ryb3Bkb3duU3RvcmU7XG59KSgpO1xuIiwidmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX3Blb3BsZSA9IFtdO1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcbiAgdmFyIF9wZW9wbGVTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgRGlzcGF0Y2hlci5yZW1vdmUoZGlzcGF0Y2hJbmRleCk7XG4gICAgfSxcblxuICAgIHNldFBlb3BsZTogZnVuY3Rpb24ocGVvcGxlKSB7XG4gICAgICBfcGVvcGxlID0gcGVvcGxlO1xuICAgIH0sXG5cbiAgICBnZXRQZW9wbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9wZW9wbGU7XG4gICAgfSxcblxuICAgIGdldFBlcnNvbjogZnVuY3Rpb24odXNlcm5hbWUpIHtcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hQZW9wbGUodXNlcm5hbWUpO1xuXG4gICAgICByZXR1cm4gX3Blb3BsZVtpbmRleF07XG4gICAgfSxcblxuICAgIGFkZFBlcnNvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgX3Blb3BsZS5wdXNoKGRhdGEudXNlcik7XG5cbiAgICAgIHJldHVybiB0aGlzLmdldFBlb3BsZSgpO1xuICAgIH0sXG5cbiAgICByZW1vdmVQZXJzb246IGZ1bmN0aW9uKHVzZXJuYW1lKSB7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoUGVvcGxlKHVzZXJuYW1lKTtcblxuICAgICAgX3Blb3BsZS5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICByZXR1cm4gdGhpcy5nZXRQZW9wbGUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG5cbiAgICBfc3RvcmVbYWN0aW9uXSAmJiBfc3RvcmVbYWN0aW9uXShkYXRhKTtcbiAgICBfc3RvcmUuZW1pdChldmVudCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIF9zZWFyY2hQZW9wbGUodXNlcm5hbWUpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IF9wZW9wbGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoX3Blb3BsZVtpXS51c2VyLnVzZXJuYW1lID09PSB1c2VybmFtZSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9wZW9wbGVTdG9yZTtcbiAgfVxuICBcbiAgd2luZG93LlBlb3BsZVN0b3JlID0gX3Blb3BsZVN0b3JlO1xufSkoKTtcbiIsInZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9wZW9wbGUgPSBbXTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG4gIHZhciBfcGVyc29uUGlja2VyU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICBhZGRQZXJzb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB1c2VyID0gZGF0YS51c2VyO1xuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKF9zZWFyY2hQZW9wbGUodXNlci51c2VybmFtZSkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgX3Blb3BsZS5wdXNoKHVzZXIpO1xuICAgIH0sXG5cbiAgICBnZXRQZXJzb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hQZW9wbGUoZGF0YS51c2VyLnVzZXJuYW1lKTtcblxuICAgICAgcmV0dXJuIF9wZW9wbGVbaW5kZXhdO1xuICAgIH0sXG5cbiAgICBnZXRQZW9wbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9wZW9wbGU7XG4gICAgfSxcblxuICAgIHVwZGF0ZVBlcnNvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHVzZXIgPSBkYXRhLnVzZXI7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoUGVvcGxlKHVzZXIudXNlcm5hbWUpO1xuXG4gICAgICBfcGVvcGxlW2luZGV4XSA9IHVzZXI7XG5cbiAgICAgIHJldHVybiBfcGVvcGxlW2luZGV4XTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlUGVyc29uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdXNlciA9IGRhdGEudXNlcjtcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hQZW9wbGUodXNlci51c2VybmFtZSk7XG5cbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIF9wZW9wbGUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0UGVvcGxlOiBmdW5jdGlvbih1c2Vycykge1xuICAgICAgX3Blb3BsZSA9IHVzZXJzO1xuICAgIH0sXG5cbiAgICByZW1vdmVBbGxQZW9wbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgX3Blb3BsZSA9IFtdO1xuICAgIH1cbiAgfSk7XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcblxuICAgIF9zdG9yZVthY3Rpb25dICYmIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuICAgIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gX3NlYXJjaFBlb3BsZSh1c2VybmFtZSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gX3Blb3BsZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciB1c2VyID0gX3Blb3BsZVtpXTtcblxuICAgICAgaWYgKHVzZXIudXNlcm5hbWUgPT09IHVzZXJuYW1lKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3BlcnNvblBpY2tlclN0b3JlO1xuICB9XG5cbiAgd2luZG93LlBlcnNvblBpY2tlclN0b3JlID0gX3BlcnNvblBpY2tlclN0b3JlO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIFN0b3JlID0gXy5leHRlbmQoe30sIHtcbiAgICBlbWl0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGNhbGxiYWNrcyA9IHRoaXMubGlzdGVuZXJzO1xuXG4gICAgICBpZiAoIV8uaXNFbXB0eShjYWxsYmFja3MpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGNhbGxiYWNrc1tpXSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFkZENoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgdGhpcy5saXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycyB8fCBbXTtcbiAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2goY2FsbGJhY2spO1xuXG4gICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMubGVuZ3RoIC0gMTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlQ2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uKGV2ZW50SW5kZXgpIHtcbiAgICAgIGlmICh0aGlzLmxpc3RlbmVycyAmJiB0aGlzLmxpc3RlbmVyc1tldmVudEluZGV4XSkge1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5zcGxpY2UoZXZlbnRJbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFN0b3JlO1xuICB9XG5cbiAgd2luZG93LlN0b3JlID0gU3RvcmU7XG59KSgpO1xuIiwidmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX3RhZ3MgPSBbXTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG4gIHZhciBfdGFnTGlzdFN0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgYWRkVGFnOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdGFnID0gZGF0YS50YWc7XG4gICAgICB2YXIgdXJsID0gZGF0YS51cmw7XG5cbiAgICAgIC8vIFdlIGRvbid0IHdhbnQgZHVwbGljYXRlIHRhZ3NcbiAgICAgIGlmIChfc2VhcmNoVGFncyh0YWcpICE9PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF90YWdzLnB1c2godGFnKTtcblxuICAgICAgdGhpcy5wZXJzaXN0KHVybCk7XG4gICAgfSxcblxuICAgIHNldFRhZ3M6IGZ1bmN0aW9uKHRhZ3MpIHtcbiAgICAgIF90YWdzID0gdGFncztcbiAgICB9LFxuXG4gICAgZ2V0VGFnczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX3RhZ3NcbiAgICB9LFxuXG4gICAgcmVtb3ZlVGFnOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdGFnID0gZGF0YS50YWc7XG4gICAgICB2YXIgdXJsID0gZGF0YS51cmw7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoVGFncyh0YWcpO1xuXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBfdGFncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAodXJsKSB7XG4gICAgICAgIHRoaXMucGVyc2lzdCh1cmwpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBwZXJzaXN0OiBmdW5jdGlvbih1cmwpIHtcbiAgICAgIGlmICghdXJsKSByZXR1cm47XG5cbiAgICAgIHZhciB0YWdzID0gdGhpcy5nZXRUYWdzKCk7XG5cbiAgICAgIGlmIChfLmlzRW1wdHkodGFncykpIHtcbiAgICAgICAgdGFncyA9IFsnJ107XG4gICAgICB9XG5cbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0YXNrOiB7XG4gICAgICAgICAgICB0YWdfbGlzdDogdGFnc1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGpxeGhyLCBzdGF0dXMpIHtcbiAgICAgICAgICBjb25zb2xlLmRpcihzdGF0dXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsVGFnczogZnVuY3Rpb24oKSB7XG4gICAgICBfdGFncyA9IFtdO1xuICAgIH1cbiAgfSk7XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcblxuICAgIF9zdG9yZVthY3Rpb25dICYmIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuICAgIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gX3NlYXJjaFRhZ3ModGFnKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBfdGFncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChfdGFnc1tpXSA9PT0gdGFnKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMVxuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdGFnTGlzdFN0b3JlO1xuICB9XG5cbiAgd2luZG93LlRhZ0xpc3RTdG9yZSA9IF90YWdMaXN0U3RvcmU7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgeGhyID0ge1xuICAgIGdldDogZnVuY3Rpb24ocGF0aCwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMucmVxdWVzdCgnR0VUJywgcGF0aCwgbnVsbCwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICBub0NzcmZHZXQ6IGZ1bmN0aW9uKHBhdGgsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLm5vQ3NyZlJlcXVlc3QoJ0dFVCcsIHBhdGgsIG51bGwsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgcG9zdDogZnVuY3Rpb24ocGF0aCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMucmVxdWVzdCgnUE9TVCcsIHBhdGgsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdDogZnVuY3Rpb24obWV0aG9kLCBwYXRoLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkge307XG4gICAgICB9XG5cbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHJlcXVlc3Qub3BlbihtZXRob2QsIHBhdGgsIHRydWUpO1xuICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdYLUNTUkYtVG9rZW4nLCBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZSgnY3NyZi10b2tlbicpWzBdLmNvbnRlbnQpO1xuICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmVxdWVzdC5zZW5kKGRhdGEpO1xuXG4gICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBub0NzcmZSZXF1ZXN0OiBmdW5jdGlvbihtZXRob2QsIHBhdGgsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgcGF0aCwgdHJ1ZSk7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXF1ZXN0LnNlbmQoZGF0YSk7XG5cbiAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB4aHI7XG4gIH1cblxuICB3aW5kb3cueGhyID0geGhyO1xufSkoKTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQgRmVsaXggR25hc3NcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuXG4gIC8qIENvbW1vbkpTICovXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JykgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpXG5cbiAgLyogQU1EIG1vZHVsZSAqL1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZhY3RvcnkpXG5cbiAgLyogQnJvd3NlciBnbG9iYWwgKi9cbiAgZWxzZSByb290LlNwaW5uZXIgPSBmYWN0b3J5KClcbn1cbih0aGlzLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIHByZWZpeGVzID0gWyd3ZWJraXQnLCAnTW96JywgJ21zJywgJ08nXSAvKiBWZW5kb3IgcHJlZml4ZXMgKi9cbiAgICAsIGFuaW1hdGlvbnMgPSB7fSAvKiBBbmltYXRpb24gcnVsZXMga2V5ZWQgYnkgdGhlaXIgbmFtZSAqL1xuICAgICwgdXNlQ3NzQW5pbWF0aW9ucyAvKiBXaGV0aGVyIHRvIHVzZSBDU1MgYW5pbWF0aW9ucyBvciBzZXRUaW1lb3V0ICovXG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGVsZW1lbnRzLiBJZiBubyB0YWcgbmFtZSBpcyBnaXZlbixcbiAgICogYSBESVYgaXMgY3JlYXRlZC4gT3B0aW9uYWxseSBwcm9wZXJ0aWVzIGNhbiBiZSBwYXNzZWQuXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVFbCh0YWcsIHByb3ApIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyB8fCAnZGl2JylcbiAgICAgICwgblxuXG4gICAgZm9yKG4gaW4gcHJvcCkgZWxbbl0gPSBwcm9wW25dXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBjaGlsZHJlbiBhbmQgcmV0dXJucyB0aGUgcGFyZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gaW5zKHBhcmVudCAvKiBjaGlsZDEsIGNoaWxkMiwgLi4uKi8pIHtcbiAgICBmb3IgKHZhciBpPTEsIG49YXJndW1lbnRzLmxlbmd0aDsgaTxuOyBpKyspXG4gICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoYXJndW1lbnRzW2ldKVxuXG4gICAgcmV0dXJuIHBhcmVudFxuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhIG5ldyBzdHlsZXNoZWV0IHRvIGhvbGQgdGhlIEBrZXlmcmFtZSBvciBWTUwgcnVsZXMuXG4gICAqL1xuICB2YXIgc2hlZXQgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsID0gY3JlYXRlRWwoJ3N0eWxlJywge3R5cGUgOiAndGV4dC9jc3MnfSlcbiAgICBpbnMoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSwgZWwpXG4gICAgcmV0dXJuIGVsLnNoZWV0IHx8IGVsLnN0eWxlU2hlZXRcbiAgfSgpKVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG9wYWNpdHkga2V5ZnJhbWUgYW5pbWF0aW9uIHJ1bGUgYW5kIHJldHVybnMgaXRzIG5hbWUuXG4gICAqIFNpbmNlIG1vc3QgbW9iaWxlIFdlYmtpdHMgaGF2ZSB0aW1pbmcgaXNzdWVzIHdpdGggYW5pbWF0aW9uLWRlbGF5LFxuICAgKiB3ZSBjcmVhdGUgc2VwYXJhdGUgcnVsZXMgZm9yIGVhY2ggbGluZS9zZWdtZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gYWRkQW5pbWF0aW9uKGFscGhhLCB0cmFpbCwgaSwgbGluZXMpIHtcbiAgICB2YXIgbmFtZSA9IFsnb3BhY2l0eScsIHRyYWlsLCB+fihhbHBoYSoxMDApLCBpLCBsaW5lc10uam9pbignLScpXG4gICAgICAsIHN0YXJ0ID0gMC4wMSArIGkvbGluZXMgKiAxMDBcbiAgICAgICwgeiA9IE1hdGgubWF4KDEgLSAoMS1hbHBoYSkgLyB0cmFpbCAqICgxMDAtc3RhcnQpLCBhbHBoYSlcbiAgICAgICwgcHJlZml4ID0gdXNlQ3NzQW5pbWF0aW9ucy5zdWJzdHJpbmcoMCwgdXNlQ3NzQW5pbWF0aW9ucy5pbmRleE9mKCdBbmltYXRpb24nKSkudG9Mb3dlckNhc2UoKVxuICAgICAgLCBwcmUgPSBwcmVmaXggJiYgJy0nICsgcHJlZml4ICsgJy0nIHx8ICcnXG5cbiAgICBpZiAoIWFuaW1hdGlvbnNbbmFtZV0pIHtcbiAgICAgIHNoZWV0Lmluc2VydFJ1bGUoXG4gICAgICAgICdAJyArIHByZSArICdrZXlmcmFtZXMgJyArIG5hbWUgKyAneycgK1xuICAgICAgICAnMCV7b3BhY2l0eTonICsgeiArICd9JyArXG4gICAgICAgIHN0YXJ0ICsgJyV7b3BhY2l0eTonICsgYWxwaGEgKyAnfScgK1xuICAgICAgICAoc3RhcnQrMC4wMSkgKyAnJXtvcGFjaXR5OjF9JyArXG4gICAgICAgIChzdGFydCt0cmFpbCkgJSAxMDAgKyAnJXtvcGFjaXR5OicgKyBhbHBoYSArICd9JyArXG4gICAgICAgICcxMDAle29wYWNpdHk6JyArIHogKyAnfScgK1xuICAgICAgICAnfScsIHNoZWV0LmNzc1J1bGVzLmxlbmd0aClcblxuICAgICAgYW5pbWF0aW9uc1tuYW1lXSA9IDFcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWVzIHZhcmlvdXMgdmVuZG9yIHByZWZpeGVzIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBzdXBwb3J0ZWQgcHJvcGVydHkuXG4gICAqL1xuICBmdW5jdGlvbiB2ZW5kb3IoZWwsIHByb3ApIHtcbiAgICB2YXIgcyA9IGVsLnN0eWxlXG4gICAgICAsIHBwXG4gICAgICAsIGlcblxuICAgIHByb3AgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKVxuICAgIGZvcihpPTA7IGk8cHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHBwID0gcHJlZml4ZXNbaV0rcHJvcFxuICAgICAgaWYoc1twcF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHBwXG4gICAgfVxuICAgIGlmKHNbcHJvcF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3BcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIG11bHRpcGxlIHN0eWxlIHByb3BlcnRpZXMgYXQgb25jZS5cbiAgICovXG4gIGZ1bmN0aW9uIGNzcyhlbCwgcHJvcCkge1xuICAgIGZvciAodmFyIG4gaW4gcHJvcClcbiAgICAgIGVsLnN0eWxlW3ZlbmRvcihlbCwgbil8fG5dID0gcHJvcFtuXVxuXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogRmlsbHMgaW4gZGVmYXVsdCB2YWx1ZXMuXG4gICAqL1xuICBmdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgICBmb3IgKHZhciBpPTE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZWYgPSBhcmd1bWVudHNbaV1cbiAgICAgIGZvciAodmFyIG4gaW4gZGVmKVxuICAgICAgICBpZiAob2JqW25dID09PSB1bmRlZmluZWQpIG9ialtuXSA9IGRlZltuXVxuICAgIH1cbiAgICByZXR1cm4gb2JqXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWJzb2x1dGUgcGFnZS1vZmZzZXQgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqL1xuICBmdW5jdGlvbiBwb3MoZWwpIHtcbiAgICB2YXIgbyA9IHsgeDplbC5vZmZzZXRMZWZ0LCB5OmVsLm9mZnNldFRvcCB9XG4gICAgd2hpbGUoKGVsID0gZWwub2Zmc2V0UGFyZW50KSlcbiAgICAgIG8ueCs9ZWwub2Zmc2V0TGVmdCwgby55Kz1lbC5vZmZzZXRUb3BcblxuICAgIHJldHVybiBvXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGluZSBjb2xvciBmcm9tIHRoZSBnaXZlbiBzdHJpbmcgb3IgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiBnZXRDb2xvcihjb2xvciwgaWR4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBjb2xvciA9PSAnc3RyaW5nJyA/IGNvbG9yIDogY29sb3JbaWR4ICUgY29sb3IubGVuZ3RoXVxuICB9XG5cbiAgLy8gQnVpbHQtaW4gZGVmYXVsdHNcblxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgbGluZXM6IDEyLCAgICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xuICAgIGxlbmd0aDogNywgICAgICAgICAgICAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgIHdpZHRoOiA1LCAgICAgICAgICAgICAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICByYWRpdXM6IDEwLCAgICAgICAgICAgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgcm90YXRlOiAwLCAgICAgICAgICAgIC8vIFJvdGF0aW9uIG9mZnNldFxuICAgIGNvcm5lcnM6IDEsICAgICAgICAgICAvLyBSb3VuZG5lc3MgKDAuLjEpXG4gICAgY29sb3I6ICcjMDAwJywgICAgICAgIC8vICNyZ2Igb3IgI3JyZ2diYlxuICAgIGRpcmVjdGlvbjogMSwgICAgICAgICAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXG4gICAgc3BlZWQ6IDEsICAgICAgICAgICAgIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICAgdHJhaWw6IDEwMCwgICAgICAgICAgIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gICAgb3BhY2l0eTogMS80LCAgICAgICAgIC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXG4gICAgZnBzOiAyMCwgICAgICAgICAgICAgIC8vIEZyYW1lcyBwZXIgc2Vjb25kIHdoZW4gdXNpbmcgc2V0VGltZW91dCgpXG4gICAgekluZGV4OiAyZTksICAgICAgICAgIC8vIFVzZSBhIGhpZ2ggei1pbmRleCBieSBkZWZhdWx0XG4gICAgY2xhc3NOYW1lOiAnc3Bpbm5lcicsIC8vIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIGVsZW1lbnRcbiAgICB0b3A6ICc1MCUnLCAgICAgICAgICAgLy8gY2VudGVyIHZlcnRpY2FsbHlcbiAgICBsZWZ0OiAnNTAlJywgICAgICAgICAgLy8gY2VudGVyIGhvcml6b250YWxseVxuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnICAvLyBlbGVtZW50IHBvc2l0aW9uXG4gIH1cblxuICAvKiogVGhlIGNvbnN0cnVjdG9yICovXG4gIGZ1bmN0aW9uIFNwaW5uZXIobykge1xuICAgIHRoaXMub3B0cyA9IG1lcmdlKG8gfHwge30sIFNwaW5uZXIuZGVmYXVsdHMsIGRlZmF1bHRzKVxuICB9XG5cbiAgLy8gR2xvYmFsIGRlZmF1bHRzIHRoYXQgb3ZlcnJpZGUgdGhlIGJ1aWx0LWluczpcbiAgU3Bpbm5lci5kZWZhdWx0cyA9IHt9XG5cbiAgbWVyZ2UoU3Bpbm5lci5wcm90b3R5cGUsIHtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHNwaW5uZXIgdG8gdGhlIGdpdmVuIHRhcmdldCBlbGVtZW50LiBJZiB0aGlzIGluc3RhbmNlIGlzIGFscmVhZHlcbiAgICAgKiBzcGlubmluZywgaXQgaXMgYXV0b21hdGljYWxseSByZW1vdmVkIGZyb20gaXRzIHByZXZpb3VzIHRhcmdldCBiIGNhbGxpbmdcbiAgICAgKiBzdG9wKCkgaW50ZXJuYWxseS5cbiAgICAgKi9cbiAgICBzcGluOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIHRoaXMuc3RvcCgpXG5cbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAsIG8gPSBzZWxmLm9wdHNcbiAgICAgICAgLCBlbCA9IHNlbGYuZWwgPSBjc3MoY3JlYXRlRWwoMCwge2NsYXNzTmFtZTogby5jbGFzc05hbWV9KSwge3Bvc2l0aW9uOiBvLnBvc2l0aW9uLCB3aWR0aDogMCwgekluZGV4OiBvLnpJbmRleH0pXG4gICAgICAgICwgbWlkID0gby5yYWRpdXMrby5sZW5ndGgrby53aWR0aFxuXG4gICAgICBjc3MoZWwsIHtcbiAgICAgICAgbGVmdDogby5sZWZ0LFxuICAgICAgICB0b3A6IG8udG9wXG4gICAgICB9KVxuICAgICAgICBcbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0LmZpcnN0Q2hpbGR8fG51bGwpXG4gICAgICB9XG5cbiAgICAgIGVsLnNldEF0dHJpYnV0ZSgncm9sZScsICdwcm9ncmVzc2JhcicpXG4gICAgICBzZWxmLmxpbmVzKGVsLCBzZWxmLm9wdHMpXG5cbiAgICAgIGlmICghdXNlQ3NzQW5pbWF0aW9ucykge1xuICAgICAgICAvLyBObyBDU1MgYW5pbWF0aW9uIHN1cHBvcnQsIHVzZSBzZXRUaW1lb3V0KCkgaW5zdGVhZFxuICAgICAgICB2YXIgaSA9IDBcbiAgICAgICAgICAsIHN0YXJ0ID0gKG8ubGluZXMgLSAxKSAqICgxIC0gby5kaXJlY3Rpb24pIC8gMlxuICAgICAgICAgICwgYWxwaGFcbiAgICAgICAgICAsIGZwcyA9IG8uZnBzXG4gICAgICAgICAgLCBmID0gZnBzL28uc3BlZWRcbiAgICAgICAgICAsIG9zdGVwID0gKDEtby5vcGFjaXR5KSAvIChmKm8udHJhaWwgLyAxMDApXG4gICAgICAgICAgLCBhc3RlcCA9IGYvby5saW5lc1xuXG4gICAgICAgIDsoZnVuY3Rpb24gYW5pbSgpIHtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBvLmxpbmVzOyBqKyspIHtcbiAgICAgICAgICAgIGFscGhhID0gTWF0aC5tYXgoMSAtIChpICsgKG8ubGluZXMgLSBqKSAqIGFzdGVwKSAlIGYgKiBvc3RlcCwgby5vcGFjaXR5KVxuXG4gICAgICAgICAgICBzZWxmLm9wYWNpdHkoZWwsIGogKiBvLmRpcmVjdGlvbiArIHN0YXJ0LCBhbHBoYSwgbylcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsZi50aW1lb3V0ID0gc2VsZi5lbCAmJiBzZXRUaW1lb3V0KGFuaW0sIH5+KDEwMDAvZnBzKSlcbiAgICAgICAgfSkoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNlbGZcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgYW5kIHJlbW92ZXMgdGhlIFNwaW5uZXIuXG4gICAgICovXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzLmVsXG4gICAgICBpZiAoZWwpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgICAgaWYgKGVsLnBhcmVudE5vZGUpIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXG4gICAgICAgIHRoaXMuZWwgPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IGRyYXdzIHRoZSBpbmRpdmlkdWFsIGxpbmVzLiBXaWxsIGJlIG92ZXJ3cml0dGVuXG4gICAgICogaW4gVk1MIGZhbGxiYWNrIG1vZGUgYmVsb3cuXG4gICAgICovXG4gICAgbGluZXM6IGZ1bmN0aW9uKGVsLCBvKSB7XG4gICAgICB2YXIgaSA9IDBcbiAgICAgICAgLCBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDJcbiAgICAgICAgLCBzZWdcblxuICAgICAgZnVuY3Rpb24gZmlsbChjb2xvciwgc2hhZG93KSB7XG4gICAgICAgIHJldHVybiBjc3MoY3JlYXRlRWwoKSwge1xuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIHdpZHRoOiAoby5sZW5ndGgrby53aWR0aCkgKyAncHgnLFxuICAgICAgICAgIGhlaWdodDogby53aWR0aCArICdweCcsXG4gICAgICAgICAgYmFja2dyb3VuZDogY29sb3IsXG4gICAgICAgICAgYm94U2hhZG93OiBzaGFkb3csXG4gICAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAnbGVmdCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiAncm90YXRlKCcgKyB+figzNjAvby5saW5lcyppK28ucm90YXRlKSArICdkZWcpIHRyYW5zbGF0ZSgnICsgby5yYWRpdXMrJ3B4JyArJywwKScsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAoby5jb3JuZXJzICogby53aWR0aD4+MSkgKyAncHgnXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGZvciAoOyBpIDwgby5saW5lczsgaSsrKSB7XG4gICAgICAgIHNlZyA9IGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgdG9wOiAxK34oby53aWR0aC8yKSArICdweCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiBvLmh3YWNjZWwgPyAndHJhbnNsYXRlM2QoMCwwLDApJyA6ICcnLFxuICAgICAgICAgIG9wYWNpdHk6IG8ub3BhY2l0eSxcbiAgICAgICAgICBhbmltYXRpb246IHVzZUNzc0FuaW1hdGlvbnMgJiYgYWRkQW5pbWF0aW9uKG8ub3BhY2l0eSwgby50cmFpbCwgc3RhcnQgKyBpICogby5kaXJlY3Rpb24sIG8ubGluZXMpICsgJyAnICsgMS9vLnNwZWVkICsgJ3MgbGluZWFyIGluZmluaXRlJ1xuICAgICAgICB9KVxuXG4gICAgICAgIGlmIChvLnNoYWRvdykgaW5zKHNlZywgY3NzKGZpbGwoJyMwMDAnLCAnMCAwIDRweCAnICsgJyMwMDAnKSwge3RvcDogMisncHgnfSkpXG4gICAgICAgIGlucyhlbCwgaW5zKHNlZywgZmlsbChnZXRDb2xvcihvLmNvbG9yLCBpKSwgJzAgMCAxcHggcmdiYSgwLDAsMCwuMSknKSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gZWxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgYWRqdXN0cyB0aGUgb3BhY2l0eSBvZiBhIHNpbmdsZSBsaW5lLlxuICAgICAqIFdpbGwgYmUgb3ZlcndyaXR0ZW4gaW4gVk1MIGZhbGxiYWNrIG1vZGUgYmVsb3cuXG4gICAgICovXG4gICAgb3BhY2l0eTogZnVuY3Rpb24oZWwsIGksIHZhbCkge1xuICAgICAgaWYgKGkgPCBlbC5jaGlsZE5vZGVzLmxlbmd0aCkgZWwuY2hpbGROb2Rlc1tpXS5zdHlsZS5vcGFjaXR5ID0gdmFsXG4gICAgfVxuXG4gIH0pXG5cblxuICBmdW5jdGlvbiBpbml0Vk1MKCkge1xuXG4gICAgLyogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBWTUwgdGFnICovXG4gICAgZnVuY3Rpb24gdm1sKHRhZywgYXR0cikge1xuICAgICAgcmV0dXJuIGNyZWF0ZUVsKCc8JyArIHRhZyArICcgeG1sbnM9XCJ1cm46c2NoZW1hcy1taWNyb3NvZnQuY29tOnZtbFwiIGNsYXNzPVwic3Bpbi12bWxcIj4nLCBhdHRyKVxuICAgIH1cblxuICAgIC8vIE5vIENTUyB0cmFuc2Zvcm1zIGJ1dCBWTUwgc3VwcG9ydCwgYWRkIGEgQ1NTIHJ1bGUgZm9yIFZNTCBlbGVtZW50czpcbiAgICBzaGVldC5hZGRSdWxlKCcuc3Bpbi12bWwnLCAnYmVoYXZpb3I6dXJsKCNkZWZhdWx0I1ZNTCknKVxuXG4gICAgU3Bpbm5lci5wcm90b3R5cGUubGluZXMgPSBmdW5jdGlvbihlbCwgbykge1xuICAgICAgdmFyIHIgPSBvLmxlbmd0aCtvLndpZHRoXG4gICAgICAgICwgcyA9IDIqclxuXG4gICAgICBmdW5jdGlvbiBncnAoKSB7XG4gICAgICAgIHJldHVybiBjc3MoXG4gICAgICAgICAgdm1sKCdncm91cCcsIHtcbiAgICAgICAgICAgIGNvb3Jkc2l6ZTogcyArICcgJyArIHMsXG4gICAgICAgICAgICBjb29yZG9yaWdpbjogLXIgKyAnICcgKyAtclxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHsgd2lkdGg6IHMsIGhlaWdodDogcyB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgdmFyIG1hcmdpbiA9IC0oby53aWR0aCtvLmxlbmd0aCkqMiArICdweCdcbiAgICAgICAgLCBnID0gY3NzKGdycCgpLCB7cG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogbWFyZ2luLCBsZWZ0OiBtYXJnaW59KVxuICAgICAgICAsIGlcblxuICAgICAgZnVuY3Rpb24gc2VnKGksIGR4LCBmaWx0ZXIpIHtcbiAgICAgICAgaW5zKGcsXG4gICAgICAgICAgaW5zKGNzcyhncnAoKSwge3JvdGF0aW9uOiAzNjAgLyBvLmxpbmVzICogaSArICdkZWcnLCBsZWZ0OiB+fmR4fSksXG4gICAgICAgICAgICBpbnMoY3NzKHZtbCgncm91bmRyZWN0Jywge2FyY3NpemU6IG8uY29ybmVyc30pLCB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHIsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBvLndpZHRoLFxuICAgICAgICAgICAgICAgIGxlZnQ6IG8ucmFkaXVzLFxuICAgICAgICAgICAgICAgIHRvcDogLW8ud2lkdGg+PjEsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmaWx0ZXJcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIHZtbCgnZmlsbCcsIHtjb2xvcjogZ2V0Q29sb3Ioby5jb2xvciwgaSksIG9wYWNpdHk6IG8ub3BhY2l0eX0pLFxuICAgICAgICAgICAgICB2bWwoJ3N0cm9rZScsIHtvcGFjaXR5OiAwfSkgLy8gdHJhbnNwYXJlbnQgc3Ryb2tlIHRvIGZpeCBjb2xvciBibGVlZGluZyB1cG9uIG9wYWNpdHkgY2hhbmdlXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIGlmIChvLnNoYWRvdylcbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSBvLmxpbmVzOyBpKyspXG4gICAgICAgICAgc2VnKGksIC0yLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkJsdXIocGl4ZWxyYWRpdXM9MixtYWtlc2hhZG93PTEsc2hhZG93b3BhY2l0eT0uMyknKVxuXG4gICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKykgc2VnKGkpXG4gICAgICByZXR1cm4gaW5zKGVsLCBnKVxuICAgIH1cblxuICAgIFNwaW5uZXIucHJvdG90eXBlLm9wYWNpdHkgPSBmdW5jdGlvbihlbCwgaSwgdmFsLCBvKSB7XG4gICAgICB2YXIgYyA9IGVsLmZpcnN0Q2hpbGRcbiAgICAgIG8gPSBvLnNoYWRvdyAmJiBvLmxpbmVzIHx8IDBcbiAgICAgIGlmIChjICYmIGkrbyA8IGMuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgYyA9IGMuY2hpbGROb2Rlc1tpK29dOyBjID0gYyAmJiBjLmZpcnN0Q2hpbGQ7IGMgPSBjICYmIGMuZmlyc3RDaGlsZFxuICAgICAgICBpZiAoYykgYy5vcGFjaXR5ID0gdmFsXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb2JlID0gY3NzKGNyZWF0ZUVsKCdncm91cCcpLCB7YmVoYXZpb3I6ICd1cmwoI2RlZmF1bHQjVk1MKSd9KVxuXG4gIGlmICghdmVuZG9yKHByb2JlLCAndHJhbnNmb3JtJykgJiYgcHJvYmUuYWRqKSBpbml0Vk1MKClcbiAgZWxzZSB1c2VDc3NBbmltYXRpb25zID0gdmVuZG9yKHByb2JlLCAnYW5pbWF0aW9uJylcblxuICByZXR1cm4gU3Bpbm5lclxuXG59KSk7XG4iLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjYuMFxuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gRXN0YWJsaXNoIHRoZSBvYmplY3QgdGhhdCBnZXRzIHJldHVybmVkIHRvIGJyZWFrIG91dCBvZiBhIGxvb3AgaXRlcmF0aW9uLlxuICB2YXIgYnJlYWtlciA9IHt9O1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyXG4gICAgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICBjb25jYXQgICAgICAgICAgID0gQXJyYXlQcm90by5jb25jYXQsXG4gICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUZvckVhY2ggICAgICA9IEFycmF5UHJvdG8uZm9yRWFjaCxcbiAgICBuYXRpdmVNYXAgICAgICAgICAgPSBBcnJheVByb3RvLm1hcCxcbiAgICBuYXRpdmVSZWR1Y2UgICAgICAgPSBBcnJheVByb3RvLnJlZHVjZSxcbiAgICBuYXRpdmVSZWR1Y2VSaWdodCAgPSBBcnJheVByb3RvLnJlZHVjZVJpZ2h0LFxuICAgIG5hdGl2ZUZpbHRlciAgICAgICA9IEFycmF5UHJvdG8uZmlsdGVyLFxuICAgIG5hdGl2ZUV2ZXJ5ICAgICAgICA9IEFycmF5UHJvdG8uZXZlcnksXG4gICAgbmF0aXZlU29tZSAgICAgICAgID0gQXJyYXlQcm90by5zb21lLFxuICAgIG5hdGl2ZUluZGV4T2YgICAgICA9IEFycmF5UHJvdG8uaW5kZXhPZixcbiAgICBuYXRpdmVMYXN0SW5kZXhPZiAgPSBBcnJheVByb3RvLmxhc3RJbmRleE9mLFxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQ7XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0IHZpYSBhIHN0cmluZyBpZGVudGlmaWVyLFxuICAvLyBmb3IgQ2xvc3VyZSBDb21waWxlciBcImFkdmFuY2VkXCIgbW9kZS5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS42LjAnO1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgb2JqZWN0cyB3aXRoIHRoZSBidWlsdC1pbiBgZm9yRWFjaGAsIGFycmF5cywgYW5kIHJhdyBvYmplY3RzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZm9yRWFjaGAgaWYgYXZhaWxhYmxlLlxuICB2YXIgZWFjaCA9IF8uZWFjaCA9IF8uZm9yRWFjaCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgaWYgKG5hdGl2ZUZvckVhY2ggJiYgb2JqLmZvckVhY2ggPT09IG5hdGl2ZUZvckVhY2gpIHtcbiAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRvciB0byBlYWNoIGVsZW1lbnQuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBtYXBgIGlmIGF2YWlsYWJsZS5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVNYXAgJiYgb2JqLm1hcCA9PT0gbmF0aXZlTWFwKSByZXR1cm4gb2JqLm1hcChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgdmFyIHJlZHVjZUVycm9yID0gJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZWAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZSAmJiBvYmoucmVkdWNlID09PSBuYXRpdmVSZWR1Y2UpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2UoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZShpdGVyYXRvcik7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gdmFsdWU7XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlUmlnaHRgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2VSaWdodCAmJiBvYmoucmVkdWNlUmlnaHQgPT09IG5hdGl2ZVJlZHVjZVJpZ2h0KSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCAhPT0gK2xlbmd0aCkge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpbmRleCA9IGtleXMgPyBrZXlzWy0tbGVuZ3RoXSA6IC0tbGVuZ3RoO1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSBvYmpbaW5kZXhdO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIG9ialtpbmRleF0sIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgYW55KG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZmlsdGVyYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlRmlsdGVyICYmIG9iai5maWx0ZXIgPT09IG5hdGl2ZUZpbHRlcikgcmV0dXJuIG9iai5maWx0ZXIocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgfSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBldmVyeWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSB8fCAocHJlZGljYXRlID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVFdmVyeSAmJiBvYmouZXZlcnkgPT09IG5hdGl2ZUV2ZXJ5KSByZXR1cm4gb2JqLmV2ZXJ5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCEocmVzdWx0ID0gcmVzdWx0ICYmIHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBzb21lYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIHZhciBhbnkgPSBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlIHx8IChwcmVkaWNhdGUgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVTb21lICYmIG9iai5zb21lID09PSBuYXRpdmVTb21lKSByZXR1cm4gb2JqLnNvbWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocmVzdWx0IHx8IChyZXN1bHQgPSBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gdmFsdWUgKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIG9iai5pbmRleE9mID09PSBuYXRpdmVJbmRleE9mKSByZXR1cm4gb2JqLmluZGV4T2YodGFyZ2V0KSAhPSAtMTtcbiAgICByZXR1cm4gYW55KG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gdGFyZ2V0O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF0pLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCBvciAoZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIC8vIENhbid0IG9wdGltaXplIGFycmF5cyBvZiBpbnRlZ2VycyBsb25nZXIgdGhhbiA2NSw1MzUgZWxlbWVudHMuXG4gIC8vIFNlZSBbV2ViS2l0IEJ1ZyA4MDc5N10oaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTgwNzk3KVxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNBcnJheShvYmopICYmIG9ialswXSA9PT0gK29ialswXSAmJiBvYmoubGVuZ3RoIDwgNjU1MzUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCBvYmopO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGFuIGFycmF5LCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJhbmQ7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc2h1ZmZsZWQgPSBbXTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJhbmQgPSBfLnJhbmRvbShpbmRleCsrKTtcbiAgICAgIHNodWZmbGVkW2luZGV4IC0gMV0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgbG9va3VwIGl0ZXJhdG9ycy5cbiAgdmFyIGxvb2t1cEl0ZXJhdG9yID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdG9yLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICB2YXIga2V5ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwga2V5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICBfLmhhcyhyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XS5wdXNoKHZhbHVlKSA6IHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgIF8uaGFzKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldKysgOiByZXN1bHRba2V5XSA9IDE7XG4gIH0pO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iaik7XG4gICAgdmFyIGxvdyA9IDAsIGhpZ2ggPSBhcnJheS5sZW5ndGg7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSAobG93ICsgaGlnaCkgPj4+IDE7XG4gICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W21pZF0pIDwgdmFsdWUgPyBsb3cgPSBtaWQgKyAxIDogaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBTYWZlbHkgY3JlYXRlIGEgcmVhbCwgbGl2ZSBhcnJheSBmcm9tIGFueXRoaW5nIGl0ZXJhYmxlLlxuICBfLnRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkgcmV0dXJuIHNsaWNlLmNhbGwob2JqKTtcbiAgICBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiA9PSBudWxsKSB8fCBndWFyZCkgcmV0dXJuIGFycmF5WzBdO1xuICAgIGlmIChuIDwgMCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoXG4gIC8vIGBfLm1hcGAuXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBhcnJheS5sZW5ndGggLSAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbikpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiA9PSBudWxsKSB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBNYXRoLm1heChhcnJheS5sZW5ndGggLSBuLCAwKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5LiBBbGlhc2VkIGFzIGB0YWlsYCBhbmQgYGRyb3BgLlxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxuICAvLyB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKipcbiAgLy8gY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbik7XG4gIH07XG5cbiAgLy8gVHJpbSBvdXQgYWxsIGZhbHN5IHZhbHVlcyBmcm9tIGFuIGFycmF5LlxuICBfLmNvbXBhY3QgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgXy5pZGVudGl0eSk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYSByZWN1cnNpdmUgYGZsYXR0ZW5gIGZ1bmN0aW9uLlxuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGlucHV0LCBzaGFsbG93LCBvdXRwdXQpIHtcbiAgICBpZiAoc2hhbGxvdyAmJiBfLmV2ZXJ5KGlucHV0LCBfLmlzQXJyYXkpKSB7XG4gICAgICByZXR1cm4gY29uY2F0LmFwcGx5KG91dHB1dCwgaW5wdXQpO1xuICAgIH1cbiAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKF8uaXNBcnJheSh2YWx1ZSkgfHwgXy5pc0FyZ3VtZW50cyh2YWx1ZSkpIHtcbiAgICAgICAgc2hhbGxvdyA/IHB1c2guYXBwbHkob3V0cHV0LCB2YWx1ZSkgOiBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBvdXRwdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBbXSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBTcGxpdCBhbiBhcnJheSBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgICB2YXIgcGFzcyA9IFtdLCBmYWlsID0gW107XG4gICAgZWFjaChhcnJheSwgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgKHByZWRpY2F0ZShlbGVtKSA/IHBhc3MgOiBmYWlsKS5wdXNoKGVsZW0pO1xuICAgIH0pO1xuICAgIHJldHVybiBbcGFzcywgZmFpbF07XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdG9yO1xuICAgICAgaXRlcmF0b3IgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBpbml0aWFsID0gaXRlcmF0b3IgPyBfLm1hcChhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIDogYXJyYXk7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGVhY2goaW5pdGlhbCwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICBpZiAoaXNTb3J0ZWQgPyAoIWluZGV4IHx8IHNlZW5bc2Vlbi5sZW5ndGggLSAxXSAhPT0gdmFsdWUpIDogIV8uY29udGFpbnMoc2VlbiwgdmFsdWUpKSB7XG4gICAgICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhcnJheVtpbmRleF0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxuICAvLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbiAgXy51bmlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuaXEoXy5mbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihfLnVuaXEoYXJyYXkpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gXy5ldmVyeShyZXN0LCBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gXy5jb250YWlucyhvdGhlciwgaXRlbSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXsgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTsgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVuZ3RoID0gXy5tYXgoXy5wbHVjayhhcmd1bWVudHMsICdsZW5ndGgnKS5jb25jYXQoMCkpO1xuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJndW1lbnRzLCAnJyArIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgaWYgKGxpc3QgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIElmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcGx5IHVzIHdpdGggaW5kZXhPZiAoSSdtIGxvb2tpbmcgYXQgeW91LCAqKk1TSUUqKiksXG4gIC8vIHdlIG5lZWQgdGhpcyBmdW5jdGlvbi4gUmV0dXJuIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhblxuICAvLyBpdGVtIGluIGFuIGFycmF5LCBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgaW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcbiAgLy8gZm9yICoqaXNTb3J0ZWQqKiB0byB1c2UgYmluYXJ5IHNlYXJjaC5cbiAgXy5pbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGlzU29ydGVkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNTb3J0ZWQgPT0gJ251bWJlcicpIHtcbiAgICAgICAgaSA9IChpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsZW5ndGggKyBpc1NvcnRlZCkgOiBpc1NvcnRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gXy5zb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpXSA9PT0gaXRlbSA/IGkgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgYXJyYXkuaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSwgaXNTb3J0ZWQpO1xuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBsYXN0SW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICBfLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBoYXNJbmRleCA9IGZyb20gIT0gbnVsbDtcbiAgICBpZiAobmF0aXZlTGFzdEluZGV4T2YgJiYgYXJyYXkubGFzdEluZGV4T2YgPT09IG5hdGl2ZUxhc3RJbmRleE9mKSB7XG4gICAgICByZXR1cm4gaGFzSW5kZXggPyBhcnJheS5sYXN0SW5kZXhPZihpdGVtLCBmcm9tKSA6IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0pO1xuICAgIH1cbiAgICB2YXIgaSA9IChoYXNJbmRleCA/IGZyb20gOiBhcnJheS5sZW5ndGgpO1xuICAgIHdoaWxlIChpLS0pIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBhcmd1bWVudHNbMl0gfHwgMTtcblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIGlkeCA9IDA7XG4gICAgdmFyIHJhbmdlID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZShpZHggPCBsZW5ndGgpIHtcbiAgICAgIHJhbmdlW2lkeCsrXSA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXVzYWJsZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgcHJvdG90eXBlIHNldHRpbmcuXG4gIHZhciBjdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIHZhciBhcmdzLCBib3VuZDtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkpIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBzZWxmID0gbmV3IGN0b3I7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGlmIChPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0KSByZXR1cm4gcmVzdWx0O1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LiBfIGFjdHNcbiAgLy8gYXMgYSBwbGFjZWhvbGRlciwgYWxsb3dpbmcgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyB0byBiZSBwcmUtZmlsbGVkLlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgICAgdmFyIGFyZ3MgPSBib3VuZEFyZ3Muc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmdzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcmdzW2ldID09PSBfKSBhcmdzW2ldID0gYXJndW1lbnRzW3Bvc2l0aW9uKytdO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEJpbmQgYSBudW1iZXIgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gUmVtYWluaW5nIGFyZ3VtZW50c1xuICAvLyBhcmUgdGhlIG1ldGhvZCBuYW1lcyB0byBiZSBib3VuZC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0IGFsbCBjYWxsYmFja3NcbiAgLy8gZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgZnVuY3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzJyk7XG4gICAgZWFjaChmdW5jcywgZnVuY3Rpb24oZikgeyBvYmpbZl0gPSBfLmJpbmQob2JqW2ZdLCBvYmopOyB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIE1lbW9pemUgYW4gZXhwZW5zaXZlIGZ1bmN0aW9uIGJ5IHN0b3JpbmcgaXRzIHJlc3VsdHMuXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xuICAgIHZhciBtZW1vID0ge307XG4gICAgaGFzaGVyIHx8IChoYXNoZXIgPSBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gXy5oYXMobWVtbywga2V5KSA/IG1lbW9ba2V5XSA6IChtZW1vW2tleV0gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gRGVsYXlzIGEgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBhbmQgdGhlbiBjYWxsc1xuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXG4gIF8uZGVsYXkgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7IH0sIHdhaXQpO1xuICB9O1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHJldHVybiBfLmRlbGF5LmFwcGx5KF8sIFtmdW5jLCAxXS5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCBhcmdzLCBjb250ZXh0LCB0aW1lc3RhbXAsIHJlc3VsdDtcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3QgPSBfLm5vdygpIC0gdGltZXN0YW1wO1xuICAgICAgaWYgKGxhc3QgPCB3YWl0KSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgcmFuID0gZmFsc2UsIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHJhbikgcmV0dXJuIG1lbW87XG4gICAgICByYW4gPSB0cnVlO1xuICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIF8ucGFydGlhbCh3cmFwcGVyLCBmdW5jKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnVuY3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBmb3IgKHZhciBpID0gZnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgYXJncyA9IFtmdW5jc1tpXS5hcHBseSh0aGlzLCBhcmdzKV07XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnc1swXTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBhZnRlciBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBPYmplY3QgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYE9iamVjdC5rZXlzYFxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvYmpba2V5c1tpXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoa2V5IGluIG9iaikgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKCFfLmNvbnRhaW5zKGtleXMsIGtleSkpIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIGlmIChvYmpbcHJvcF0gPT09IHZvaWQgMCkgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gYSA9PSBTdHJpbmcoYik7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLiBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yXG4gICAgICAgIC8vIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gYSAhPSArYSA/IGIgIT0gK2IgOiAoYSA9PSAwID8gMSAvIGEgPT0gMSAvIGIgOiBhID09ICtiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PSArYjtcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyIHNvdXJjZSBwYXR0ZXJucyBhbmQgZmxhZ3MuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgICByZXR1cm4gYS5zb3VyY2UgPT0gYi5zb3VyY2UgJiZcbiAgICAgICAgICAgICAgIGEuZ2xvYmFsID09IGIuZ2xvYmFsICYmXG4gICAgICAgICAgICAgICBhLm11bHRpbGluZSA9PSBiLm11bHRpbGluZSAmJlxuICAgICAgICAgICAgICAgYS5pZ25vcmVDYXNlID09IGIuaWdub3JlQ2FzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09IGI7XG4gICAgfVxuICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3Rgc1xuICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIChhQ3RvciBpbnN0YW5jZW9mIGFDdG9yKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIChiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICYmICgnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG4gICAgdmFyIHNpemUgPSAwLCByZXN1bHQgPSB0cnVlO1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChjbGFzc05hbWUgPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgLy8gQ29tcGFyZSBhcnJheSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkuXG4gICAgICBzaXplID0gYS5sZW5ndGg7XG4gICAgICByZXN1bHQgPSBzaXplID09IGIubGVuZ3RoO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gZXEoYVtzaXplXSwgYltzaXplXSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYSkge1xuICAgICAgICBpZiAoXy5oYXMoYSwga2V5KSkge1xuICAgICAgICAgIC8vIENvdW50IHRoZSBleHBlY3RlZCBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyLlxuICAgICAgICAgIGlmICghKHJlc3VsdCA9IF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gYikge1xuICAgICAgICAgIGlmIChfLmhhcyhiLCBrZXkpICYmICEoc2l6ZS0tKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gIXNpemU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3Qgb2JqZWN0IGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wb3AoKTtcbiAgICBiU3RhY2sucG9wKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiLCBbXSwgW10pO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAuXG4gIGVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSksIHdoZXJlXG4gIC8vIHRoZXJlIGlzbid0IGFueSBpbnNwZWN0YWJsZSBcIkFyZ3VtZW50c1wiIHR5cGUuXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gICAgXy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICEhKG9iaiAmJiBfLmhhcyhvYmosICdjYWxsZWUnKSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS5cbiAgaWYgKHR5cGVvZiAoLy4vKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xuICB9O1xuXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cbiAgXy5pc05hTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzTnVtYmVyKG9iaikgJiYgb2JqICE9ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0b3JzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ucHJvcGVydHkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PT0gYXR0cnMpIHJldHVybiB0cnVlOyAvL2F2b2lkIGNvbXBhcmluZyBhbiBvYmplY3QgdG8gaXRzZWxmLlxuICAgICAgZm9yICh2YXIga2V5IGluIGF0dHJzKSB7XG4gICAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZW50aXR5TWFwID0ge1xuICAgIGVzY2FwZToge1xuICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgXCInXCI6ICcmI3gyNzsnXG4gICAgfVxuICB9O1xuICBlbnRpdHlNYXAudW5lc2NhcGUgPSBfLmludmVydChlbnRpdHlNYXAuZXNjYXBlKTtcblxuICAvLyBSZWdleGVzIGNvbnRhaW5pbmcgdGhlIGtleXMgYW5kIHZhbHVlcyBsaXN0ZWQgaW1tZWRpYXRlbHkgYWJvdmUuXG4gIHZhciBlbnRpdHlSZWdleGVzID0ge1xuICAgIGVzY2FwZTogICBuZXcgUmVnRXhwKCdbJyArIF8ua2V5cyhlbnRpdHlNYXAuZXNjYXBlKS5qb2luKCcnKSArICddJywgJ2cnKSxcbiAgICB1bmVzY2FwZTogbmV3IFJlZ0V4cCgnKCcgKyBfLmtleXMoZW50aXR5TWFwLnVuZXNjYXBlKS5qb2luKCd8JykgKyAnKScsICdnJylcbiAgfTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIF8uZWFjaChbJ2VzY2FwZScsICd1bmVzY2FwZSddLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBfW21ldGhvZF0gPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIGlmIChzdHJpbmcgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgICAgcmV0dXJuICgnJyArIHN0cmluZykucmVwbGFjZShlbnRpdHlSZWdleGVzW21ldGhvZF0sIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBlbnRpdHlNYXBbbWV0aG9kXVttYXRjaF07XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIGBwcm9wZXJ0eWAgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdCB3aXRoIHRoZVxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKG9iamVjdCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBmdW5jLmFwcGx5KF8sIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgaW50ZWdlciBpZCAodW5pcXVlIHdpdGhpbiB0aGUgZW50aXJlIGNsaWVudCBzZXNzaW9uKS5cbiAgLy8gVXNlZnVsIGZvciB0ZW1wb3JhcnkgRE9NIGlkcy5cbiAgdmFyIGlkQ291bnRlciA9IDA7XG4gIF8udW5pcXVlSWQgPSBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xuICB9O1xuXG4gIC8vIEJ5IGRlZmF1bHQsIFVuZGVyc2NvcmUgdXNlcyBFUkItc3R5bGUgdGVtcGxhdGUgZGVsaW1pdGVycywgY2hhbmdlIHRoZVxuICAvLyBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICBldmFsdWF0ZSAgICA6IC88JShbXFxzXFxTXSs/KSU+L2csXG4gICAgaW50ZXJwb2xhdGUgOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGUgICAgICA6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6ICAgICAgXCInXCIsXG4gICAgJ1xcXFwnOiAgICAgJ1xcXFwnLFxuICAgICdcXHInOiAgICAgJ3InLFxuICAgICdcXG4nOiAgICAgJ24nLFxuICAgICdcXHQnOiAgICAgJ3QnLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICB2YXIgZXNjYXBlciA9IC9cXFxcfCd8XFxyfFxcbnxcXHR8XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIGRhdGEsIHNldHRpbmdzKSB7XG4gICAgdmFyIHJlbmRlcjtcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KVxuICAgICAgICAucmVwbGFjZShlc2NhcGVyLCBmdW5jdGlvbihtYXRjaCkgeyByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07IH0pO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoaW50ZXJwb2xhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBpbnRlcnBvbGF0ZSArIFwiKSk9PW51bGw/Jyc6X190KStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgXCJyZXR1cm4gX19wO1xcblwiO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSkgcmV0dXJuIHJlbmRlcihkYXRhLCBfKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIChzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJykgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbiwgd2hpY2ggd2lsbCBkZWxlZ2F0ZSB0byB0aGUgd3JhcHBlci5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfKG9iaikuY2hhaW4oKTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgcmVzdWx0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICBfLm1peGluKF8pO1xuXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT0gJ3NoaWZ0JyB8fCBuYW1lID09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgXy5leHRlbmQoXy5wcm90b3R5cGUsIHtcblxuICAgIC8vIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgICBjaGFpbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9jaGFpbiA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
