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
      if (this.latestChatUpdate() > this.state.acknowledgedAt) {
        return 1;
      }

      return 0;
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

    latestChatUpdate: function() {
      var chatRoom = ChatNotificationsStore.mostRecentlyUpdatedChatRoom();
      if (chatRoom) {
        return chatRoom.updated;
      }

      return null;
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
});

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
});

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
});

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
  } else {
    window.TipsUi = TipsUi;
  }

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
      var chatCount = ChatNotificationsStore.getUnreadCount(localStorage.chatAck) || 0;
      var newsCount = NewsFeedStore.getUnreadCount(localStorage.newsFeedAck) || 0;

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
  } else {
    window.DropdownTogglerMixin = DropdownTogglerMixin;
  }
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
  } else {
    window.NewsFeedMixin = NewsFeedMixin;
  }
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
          if (acknowledgedAt) {
            return entry.updated > acknowledgedAt;
          }
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
          _chatRooms[keys[i]] = _.extend(_chatRooms[keys[i]], _optimisticallyUpdatedChatRooms[keys[i]])
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

      return _.max(_.values(_chatRooms), func.dot('updated'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvYWN0aXZpdHlfZmVlZC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvYXZhdGFyLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9jaGF0X25vdGlmaWNhdGlvbnMuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2NoYXRfbm90aWZpY2F0aW9uc190b2dnbGVyLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9jb2luX293bmVyc2hpcC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvY29yZV90ZWFtLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9kZXNrdG9wX25vdGlmaWNhdGlvbnMuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2RyYWdfYW5kX2Ryb3Bfdmlldy5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvZHJvcGRvd25fbmV3c19mZWVkLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9kcm9wZG93bl9uZXdzX2ZlZWRfdG9nZ2xlci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvZmluYW5jaWFsc192aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9mb3JtX2dyb3VwLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9mdWxsX3BhZ2VfbmV3c19mZWVkLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9pbnB1dF9wcmV2aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9pbnRlcmVzdF9waWNrZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2ludml0ZV9ib3VudHlfZm9ybS5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaW52aXRlX2ZyaWVuZF9ib3VudHkuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2ludml0ZV9mcmllbmRfcHJvZHVjdC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaW52aXRlX2xpc3QuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2pvaW5fdGVhbV92aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9tZW1iZXJzX3ZpZXcuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL25hdmJhci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvbm90aWZpY2F0aW9uX3ByZWZlcmVuY2VzX2Ryb3Bkb3duLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9udW1iZXJfaW5wdXRfdmlldy5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvcGVvcGxlX3ZpZXcuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3BlcnNvbl9waWNrZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3BvcG92ZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3NoYXJlLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy90YWdfbGlzdF92aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy90aW1lc3RhbXAuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3RpcHNfdWkuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3RpdGxlX25vdGlmaWNhdGlvbnNfY291bnQuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3VyZ2VuY3kuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3VzZXJfbmF2YmFyX2Ryb3Bkb3duLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29uc3RhbnRzLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9kaXNwYXRjaGVyLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9taXhpbnMvZHJvcGRvd25fdG9nZ2xlci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL21peGlucy9uZXdzX2ZlZWQuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9zdG9yZXMvY2hhdF9ub3RpZmljYXRpb25zX3N0b3JlLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9zdG9yZXMvY29pbl9vd25lcnNoaXBfc3RvcmUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL3N0b3Jlcy9pbnRlcmVzdF9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25ld3NfZmVlZF9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25ld3NfZmVlZF91c2Vyc19zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25vdGlmaWNhdGlvbl9wcmVmZXJlbmNlc19kcm9wZG93bl9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3Blb3BsZV9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3BlcnNvbl9waWNrZXJfc3RvcmUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL3N0b3Jlcy9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3RhZ19saXN0X3N0b3JlLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy94aHIuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9ub2RlX21vZHVsZXMvc3Bpbi5qcy9zcGluLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9WQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEFjdGl2aXR5RmVlZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0FjdGl2aXR5RmVlZCcsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IGFjdGl2aXRpZXM6IHRoaXMucHJvcHMuYWN0aXZpdGllcyB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYobnVsbCwgXy5tYXAodGhpcy5zdGF0ZS5hY3Rpdml0aWVzLCBFbnRyeSkpO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEVudHJ5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRW50cnknLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXCJAXCIsIHRoaXMucHJvcHMuYWN0b3IudXNlcm5hbWUsIFwiIFwiLCB0aGlzLnByb3BzLnZlcmIsIFwiIFwiLCB0aGlzLmJvZHkoKSlcbiAgICB9LFxuXG4gICAgYm9keTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5zdWJqZWN0LmJvZHlfaHRtbCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIm1hcmtkb3duLW5vcm1hbGl6ZWRcIiwgcmVmOiBcImJvZHlcIn0pXG4gICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc3ViamVjdC5hdHRhY2htZW50KSB7XG4gICAgICAgIHZhciBocmVmID0gdGhpcy5wcm9wcy5zdWJqZWN0LmF0dGFjaG1lbnQuaHJlZlxuICAgICAgICB2YXIgc3JjID0gdGhpcy5wcm9wcy5zdWJqZWN0LmF0dGFjaG1lbnQuZmlyZXNpemVfdXJsICsgJy8zMDB4MjI1L2ZyYW1lXzAvZ19jZW50ZXIvJyArIGhyZWZcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogaHJlZn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImdhbGxlcnktdGh1bWJcIiwgc3JjOiBzcmN9KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5yZWZzLmJvZHkpIHtcbiAgICAgICAgdGhpcy5yZWZzLmJvZHkuZ2V0RE9NTm9kZSgpLmlubmVySFRNTCA9IHRoaXMucHJvcHMuc3ViamVjdC5ib2R5X2h0bWxcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQWN0aXZpdHlGZWVkO1xuICB9XG5cbiAgd2luZG93LkFjdGl2aXR5RmVlZCA9IEFjdGl2aXR5RmVlZDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgQXZhdGFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQXZhdGFyJyxcbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2l6ZTogMjRcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2l6ZSA9IHRoaXMucHJvcHMuc2l6ZSAmJiB0aGlzLnByb3BzLnNpemUudG9TdHJpbmcoKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJhdmF0YXIgaW1nLWNpcmNsZVwiLCBoZWlnaHQ6IHNpemUsIHNyYzogdGhpcy5hdmF0YXJVcmwoKSwgd2lkdGg6IHNpemV9KTtcbiAgICB9LFxuXG4gICAgYXZhdGFyVXJsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLnVzZXIgJiYgIXRoaXMucHJvcHMuYWx3YXlzRGVmYXVsdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy51c2VyLmF2YXRhcl91cmwgKyAnP3M9JyArICh0aGlzLnByb3BzLnNpemUgKiAyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnL2Fzc2V0cy9hdmF0YXJzL2RlZmF1bHQucG5nJztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQXZhdGFyO1xuICB9XG5cbiAgd2luZG93LkF2YXRhciA9IEF2YXRhcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgQ2hhdE5vdGlmaWNhdGlvblN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL2NoYXRfbm90aWZpY2F0aW9uc19zdG9yZScpO1xudmFyIERlc2t0b3BOb3RpZmljYXRpb25zID0gcmVxdWlyZSgnLi9kZXNrdG9wX25vdGlmaWNhdGlvbnMuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIElDT05fVVJMID0gJ2h0dHBzOi8vZDhpemRrNmJsNGdiaS5jbG91ZGZyb250Lm5ldC84MHgvaHR0cDovL2YuY2wubHkvaXRlbXMvMUkyYTFqME0wdzBWMnAzQzNRME0vQXNzZW1ibHktVHdpdHRlci1BdmF0YXIucG5nJztcbiAgdmFyIE4gPSBDT05TVEFOVFMuQ0hBVF9OT1RJRklDQVRJT05TO1xuXG4gIGZ1bmN0aW9uIGR5bmFtaWNTb3J0KHByb3BlcnR5KSB7XG4gICAgdmFyIHNvcnRPcmRlciA9IDE7XG4gICAgaWYocHJvcGVydHlbMF0gPT09IFwiLVwiKSB7XG4gICAgICBzb3J0T3JkZXIgPSAtMTtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkuc3Vic3RyKDEpO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKGEsYikge1xuICAgICAgdmFyIHJlc3VsdCA9IChhW3Byb3BlcnR5XSA8IGJbcHJvcGVydHldKSA/IC0xIDogKGFbcHJvcGVydHldID4gYltwcm9wZXJ0eV0pID8gMSA6IDA7XG4gICAgICByZXR1cm4gcmVzdWx0ICogc29ydE9yZGVyO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGR5bmFtaWNTb3J0TXVsdGlwbGUoKSB7XG4gICAgLypcbiAgICAgKiBzYXZlIHRoZSBhcmd1bWVudHMgb2JqZWN0IGFzIGl0IHdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgICAgKiBub3RlIHRoYXQgYXJndW1lbnRzIG9iamVjdCBpcyBhbiBhcnJheS1saWtlIG9iamVjdFxuICAgICAqIGNvbnNpc3Rpbmcgb2YgdGhlIG5hbWVzIG9mIHRoZSBwcm9wZXJ0aWVzIHRvIHNvcnQgYnlcbiAgICAgKi9cbiAgICB2YXIgcHJvcHMgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmoxLCBvYmoyKSB7XG4gICAgICB2YXIgaSA9IDAsIHJlc3VsdCA9IDAsIG51bWJlck9mUHJvcGVydGllcyA9IHByb3BzLmxlbmd0aDtcbiAgICAgIC8qIHRyeSBnZXR0aW5nIGEgZGlmZmVyZW50IHJlc3VsdCBmcm9tIDAgKGVxdWFsKVxuICAgICAgICogYXMgbG9uZyBhcyB3ZSBoYXZlIGV4dHJhIHByb3BlcnRpZXMgdG8gY29tcGFyZVxuICAgICAgICovXG4gICAgICB3aGlsZSAocmVzdWx0ID09PSAwICYmIGkgPCBudW1iZXJPZlByb3BlcnRpZXMpIHtcbiAgICAgICAgcmVzdWx0ID0gZHluYW1pY1NvcnQocHJvcHNbaV0pKG9iajEsIG9iajIpO1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIHZhciBDaGF0Tm90aWZpY2F0aW9ucyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NoYXROb3RpZmljYXRpb25zJyxcbiAgICBhcnRpY2xlczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5mbGF0dGVuKF8ubWFwKHRoaXMuc3RhdGUuZGF0YSwgZnVuY3Rpb24oYSl7XG4gICAgICAgIHJldHVybiBhLmVudGl0aWVzO1xuICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAkKCdbZGF0YS10b2dnbGVdJywgdGhpcy5nZXRET01Ob2RlKCkpLnRvb2x0aXAoKTtcbiAgICAgIHZhciB0YXJnZXQgPSB0aGlzLnJlZnMuc3Bpbm5lci5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgb3B0cyA9IHRoaXMuc3Bpbm5lck9wdGlvbnMgfHwge1xuICAgICAgICBsaW5lczogMTEsXG4gICAgICAgIGxlbmd0aDogMzAsXG4gICAgICAgIHJhZGl1czogNTVcbiAgICAgIH07XG5cbiAgICAgIHZhciBzcGlubmVyID0gdGhpcy5zcGlubmVyID0gbmV3IFNwaW5uZXIob3B0cykuc3BpbigpO1xuICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHNwaW5uZXIuZWwpO1xuICAgIH0sXG5cbiAgICBzb3J0QnlMYXN0UmVhZEF0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZXMgPSBfLnZhbHVlcyhkYXRhKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHZhbHVlc1tpXTtcbiAgICAgICAgZW50cnkucmVhZFN0YXRlID0gZW50cnkudXBkYXRlZCA+IGVudHJ5Lmxhc3RfcmVhZF9hdCA/ICdBJyA6ICdaJztcbiAgICAgICAgZW50cnkuc29ydEluZGV4ID0gdGhpcy5zdGF0ZS5zb3J0S2V5cy5pbmRleE9mKGVudHJ5LmlkKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlcy5zb3J0KGR5bmFtaWNTb3J0TXVsdGlwbGUoXCJyZWFkU3RhdGVcIiwgXCJzb3J0SW5kZXhcIiwgXCJsYWJlbFwiKSk7XG5cbiAgICAgIHJldHVybiB2YWx1ZXMgfHwgW107XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAvLyBUT0RPOiBSZW1vdmUgdGhpcyBhbmQgdXNlIHRoZSBEaXNwYXRjaGVyXG4gICAgICAkKHdpbmRvdykuYmluZCgnc3RvcmFnZScsIHRoaXMuc3RvcmVkQWNrQ2hhbmdlZCk7XG5cbiAgICAgIHRoaXMub25QdXNoKGZ1bmN0aW9uKGV2ZW50LCBtc2cpIHtcbiAgICAgICAgaWYgKF8uY29udGFpbnMobXNnLm1lbnRpb25zLCBfdGhpcy5wcm9wcy51c2VybmFtZSkpIHtcbiAgICAgICAgICBfdGhpcy5kZXNrdG9wTm90aWZ5KG1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuZmV0Y2hOb3RpZmljYXRpb25zKCk7XG4gICAgICB9KTtcblxuICAgICAgd2luZG93LnZpc2liaWxpdHkoZnVuY3Rpb24odmlzaWJsZSkge1xuICAgICAgICBpZiAodmlzaWJsZSkgeyBfdGhpcy5mZXRjaE5vdGlmaWNhdGlvbnMoKTsgfVxuICAgICAgfSk7XG5cbiAgICAgIENoYXROb3RpZmljYXRpb25zU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5oYW5kbGVDaGF0Um9vbXNDaGFuZ2VkKTtcbiAgICAgIHRoaXMuZmV0Y2hOb3RpZmljYXRpb25zKCk7XG4gICAgfSxcblxuICAgIGRlc2t0b3BOb3RpZnk6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgbiA9IG5ldyBOb3RpZnkoXCJOZXcgbWVzc2FnZSBvbiBcIiArIChldmVudC53aXAucHJvZHVjdF9uYW1lKSwge1xuICAgICAgICBib2R5OiAoZXZlbnQuYWN0b3IudXNlcm5hbWUgKyBcIjogXCIgKyBldmVudC5ib2R5X3Nhbml0aXplZCksXG4gICAgICAgIHRhZzogZXZlbnQuaWQsXG4gICAgICAgIGljb246IElDT05fVVJMLFxuICAgICAgICB0aW1lb3V0OiAxNSxcblxuICAgICAgICBub3RpZnlDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJCh3aW5kb3cpLmZvY3VzKCk7XG4gICAgICAgICAgaWYgKHdpbmRvdy5hcHAud2lwLmlkICE9IGV2ZW50LndpcC5pZCkge1xuICAgICAgICAgICAgd2luZG93LmFwcC5yZWRpcmVjdFRvKGV2ZW50LndpcC51cmwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBuLnNob3coKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hOb3RpZmljYXRpb25zOiBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogTi5BQ1RJT05TLkZFVENIX0NIQVRfUk9PTVMsXG4gICAgICAgIGV2ZW50OiBOLkVWRU5UUy5DSEFUX1JPT01TX0ZFVENIRUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMudXJsXG4gICAgICB9KTtcbiAgICB9LCAxMDAwKSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICBzb3J0S2V5czogW10sXG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aGlzLnN0b3JlZEFjaygpLFxuICAgICAgICBkZXNrdG9wTm90aWZpY2F0aW9uc0VuYWJsZWQ6IGZhbHNlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBoYW5kbGVDaGF0Um9vbXNDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGRhdGE6IENoYXROb3RpZmljYXRpb25zU3RvcmUuZ2V0Q2hhdFJvb21zKCksXG4gICAgICAgIHNvcnRLZXlzOiBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmdldFNvcnRLZXlzKClcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIV8uaXNFbXB0eShzZWxmLnN0YXRlLmRhdGEpKSB7XG4gICAgICAgICAgc2VsZi5zcGlubmVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZURlc2t0b3BOb3RpZmljYXRpb25zU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKGlzRW5hYmxlZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGRlc2t0b3BOb3RpZmljYXRpb25zRW5hYmxlZDogaXNFbmFibGVkXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25QdXNoOiBmdW5jdGlvbihmbikge1xuICAgICAgaWYgKHdpbmRvdy5wdXNoZXIpIHtcbiAgICAgICAgY2hhbm5lbCA9IHdpbmRvdy5wdXNoZXIuc3Vic2NyaWJlKCdAJyArIHRoaXMucHJvcHMudXNlcm5hbWUpO1xuICAgICAgICBjaGFubmVsLmJpbmRfYWxsKGZuKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbGF0ZXN0QXJ0aWNsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5tYXgodGhpcy5hcnRpY2xlcygpLCBmdW5jdGlvbihhKSB7XG4gICAgICAgIHJldHVybiBhICYmIGEudGltZXN0YW1wO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGxhdGVzdEFydGljbGVUaW1lc3RhbXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFydGljbGUgPSB0aGlzLmxhdGVzdEFydGljbGUoKVxuXG4gICAgICBpZiAoYXJ0aWNsZSkge1xuICAgICAgICByZXR1cm4gYXJ0aWNsZS50aW1lc3RhbXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzb3J0ZWQgPSB0aGlzLnNvcnRCeUxhc3RSZWFkQXQodGhpcy5zdGF0ZS5kYXRhKTtcbiAgICAgIHZhciBwcm9kdWN0c1BhdGggPSAnL3VzZXJzLycgKyB0aGlzLnByb3BzLnVzZXJuYW1lO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51XCIsIHN0eWxlOiB7J21pbi13aWR0aCc6ICczODBweCd9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtyZWY6IFwic3Bpbm5lclwiLCBzdHlsZTogeyAnbWluLWhlaWdodCc6ICc1MHB4JywgJ21heC1oZWlnaHQnOiAnMzAwcHgnfX0sIFxuICAgICAgICAgICAgTm90aWZpY2F0aW9uc0xpc3Qoe2RhdGE6IF8uZmlyc3Qoc29ydGVkLCA3KX0pXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogcHJvZHVjdHNQYXRoLCBjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwifSwgXCJBbGwgUHJvZHVjdHNcIilcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgICF0aGlzLnN0YXRlLmRlc2t0b3BOb3RpZmljYXRpb25zRW5hYmxlZCA/IERlc2t0b3BOb3RpZmljYXRpb25zKHtvbkNoYW5nZTogdGhpcy5oYW5kbGVEZXNrdG9wTm90aWZpY2F0aW9uc1N0YXRlQ2hhbmdlfSkgOiBudWxsXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBzZXRCYWRnZTogZnVuY3Rpb24odG90YWwpIHtcbiAgICAgIGlmICh3aW5kb3cuZmx1aWQpIHtcbiAgICAgICAgd2luZG93LmZsdWlkLmRvY2tCYWRnZSA9IHRvdGFsO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzcGlubmVyT3B0aW9uczoge1xuICAgICAgbGluZXM6IDExLFxuICAgICAgdG9wOiAnMjAlJ1xuICAgIH0sXG5cbiAgICBzdG9yZWRBY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbWVzdGFtcCA9IGxvY2FsU3RvcmFnZS5jaGF0QWNrO1xuXG4gICAgICBpZiAodGltZXN0YW1wID09IG51bGwgfHwgdGltZXN0YW1wID09PSBcIm51bGxcIikge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aW1lc3RhbXApO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9yZWRBY2tDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBhY2tub3dsZWRnZWRBdDogdGhpcy5zdG9yZWRBY2soKVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgTm90aWZpY2F0aW9uc0xpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdOb3RpZmljYXRpb25zTGlzdCcsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9kdWN0Tm9kZXMgPSB0aGlzLnByb3BzLmRhdGEubWFwKGZ1bmN0aW9uKGVudHJ5KXtcbiAgICAgICAgdmFyIGJhZGdlID0gbnVsbDtcblxuICAgICAgICBpZiAoZW50cnkudXBkYXRlZCA+IGVudHJ5Lmxhc3RfcmVhZF9hdCkge1xuICAgICAgICAgIGJhZGdlID0gUmVhY3QuRE9NLnNwYW4oe1xuICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiaW5kaWNhdG9yIGluZGljYXRvci1kYW5nZXIgcHVsbC1yaWdodFwiLCBcbiAgICAgICAgICAgICAgc3R5bGU6IHsgJ3Bvc2l0aW9uJzogJ3JlbGF0aXZlJywgJ3RvcCc6ICcxMHB4J319KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IGVudHJ5LnVybCwga2V5OiBlbnRyeS5pZCwgY2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAtaXRlbVwifSwgXG4gICAgICAgICAgICBiYWRnZSwgXCIgXCIsIGVudHJ5LmxhYmVsXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJsaXN0LWdyb3VwXCJ9LCBcbiAgICAgICAgICBwcm9kdWN0Tm9kZXNcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ2hhdE5vdGlmaWNhdGlvbnM7XG4gIH1cblxuICB3aW5kb3cuQ2hhdE5vdGlmaWNhdGlvbnMgPSBDaGF0Tm90aWZpY2F0aW9ucztcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIENoYXROb3RpZmljYXRpb25zU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvY2hhdF9ub3RpZmljYXRpb25zX3N0b3JlJyk7XG52YXIgRHJvcGRvd25Ub2dnbGVyTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvZHJvcGRvd25fdG9nZ2xlci5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgQ04gPSBDT05TVEFOVFMuQ0hBVF9OT1RJRklDQVRJT05TO1xuXG4gIHZhciBDaGF0Tm90aWZpY2F0aW9uc1RvZ2dsZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDaGF0Tm90aWZpY2F0aW9uc1RvZ2dsZXInLFxuICAgIG1peGluczogW0Ryb3Bkb3duVG9nZ2xlck1peGluXSxcblxuICAgIGFja25vd2xlZGdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICAgIGxvY2FsU3RvcmFnZS5jaGF0QWNrID0gdGltZXN0YW1wO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgYWNrbm93bGVkZ2VkQXQ6IHRpbWVzdGFtcFxuICAgICAgfSk7XG5cbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogQ04uRVZFTlRTLkFDS05PV0xFREdFRCxcbiAgICAgICAgYWN0aW9uOiBDTi5BQ1RJT05TLkFDS05PV0xFREdFLFxuICAgICAgICBkYXRhOiB0aW1lc3RhbXAsXG4gICAgICAgIHN5bmM6IHRydWVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBiYWRnZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uc3Bhbih7XG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiaW5kaWNhdG9yIGluZGljYXRvci1kYW5nZXJcIiwgXG4gICAgICAgICAgICBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgdG9wOiAnNXB4J319KVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgYmFkZ2VDb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5sYXRlc3RDaGF0VXBkYXRlKCkgPiB0aGlzLnN0YXRlLmFja25vd2xlZGdlZEF0KSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gMDtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIENoYXROb3RpZmljYXRpb25zU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5nZXRTdG9yaWVzKTtcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBkb2N1bWVudC50aXRsZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNoYXRSb29tczogbnVsbCxcbiAgICAgICAgYWNrbm93bGVkZ2VkQXQ6IHRoaXMuc3RvcmVkQWNrKClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldFN0b3JpZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNoYXRSb29tczogQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5nZXRDaGF0Um9vbXMoKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGxhdGVzdENoYXRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNoYXRSb29tID0gQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5tb3N0UmVjZW50bHlVcGRhdGVkQ2hhdFJvb20oKTtcbiAgICAgIGlmIChjaGF0Um9vbSkge1xuICAgICAgICByZXR1cm4gY2hhdFJvb20udXBkYXRlZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIHRvdGFsOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIGNvdW50ID0gXy5yZWR1Y2UoXG4gICAgICAgIF8ubWFwKHNlbGYuc3RhdGUuY2hhdFJvb21zLCBmdW5jdGlvbiBtYXBTdG9yaWVzKGNoYXRSb29tKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYXRSb29tLmNvdW50O1xuICAgICAgICB9KSwgZnVuY3Rpb24gcmVkdWNlU3RvcmllcyhtZW1vLCByZWFkKSB7XG4gICAgICAgICAgcmV0dXJuIG1lbW8gKyByZWFkO1xuICAgICAgfSwgMCk7XG5cbiAgICAgIHJldHVybiBjb3VudDtcbiAgICB9LFxuXG4gICAgc3RvcmVkQWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBsb2NhbFN0b3JhZ2UuY2hhdEFjaztcblxuICAgICAgaWYgKHRpbWVzdGFtcCA9PSBudWxsIHx8IHRpbWVzdGFtcCA9PT0gJ251bGwnKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRpbWVzdGFtcCwgMTApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDaGF0Tm90aWZpY2F0aW9uc1RvZ2dsZXI7XG4gIH1cblxuICB3aW5kb3cuQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyID0gQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBDb2luT3duZXJzaGlwU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvY29pbl9vd25lcnNoaXBfc3RvcmUnKTtcbnZhciBBdmF0YXIgPSByZXF1aXJlKCcuL2F2YXRhci5qcy5qc3gnKTtcbnZhciBQZXJzb25QaWNrZXIgPSByZXF1aXJlKCcuL3BlcnNvbl9waWNrZXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIENPID0gQ09OU1RBTlRTLkNPSU5fT1dORVJTSElQO1xuXG4gIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZm4oZSlcbiAgICB9XG4gIH1cblxuICB2YXIgQ29pbk93bmVyc2hpcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NvaW5Pd25lcnNoaXAnLFxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyB0b3RhbENvaW5zOiA2MDAwIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIENvaW5Pd25lcnNoaXBTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLm9uQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNyZWF0b3I6IF8uZXh0ZW5kKGFwcC5jdXJyZW50VXNlcigpLmF0dHJpYnV0ZXMsIHsgY29pbnM6IHRoaXMucHJvcHMudG90YWxDb2lucyB9KSxcbiAgICAgICAgc2hhcmVyczogQ29pbk93bmVyc2hpcFN0b3JlLmdldFVzZXJzKCksXG4gICAgICAgIHBlcmNlbnRhZ2VBdmFpbGFibGU6IDAsXG4gICAgICAgIHBvdGVudGlhbFVzZXI6IG51bGxcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb3duZXJzaGlwOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgIDAsIE1hdGgubWluKFxuICAgICAgICAgIDEwMCwgcGFyc2VJbnQodXNlci5jb2lucyAqIDEwMCAvIHRoaXMudG90YWxDb2lucygpLCAxMClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICB0b3RhbENvaW5zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzaGFyZXJDb2lucyA9IF8ucmVkdWNlKF8ubWFwKHRoaXMuc3RhdGUuc2hhcmVycywgZnVuYy5kb3QoJ2NvaW5zJykpLCBmdW5jdGlvbihtZW1vLCBudW0pIHsgcmV0dXJuIG1lbW8gKyBudW07IH0sIDApXG5cbiAgICAgIHJldHVybiBzaGFyZXJDb2lucyArIHRoaXMuc3RhdGUuY3JlYXRvci5jb2luc1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNyZWF0b3IgPSB0aGlzLnN0YXRlLmNyZWF0b3I7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS50YWJsZSh7Y2xhc3NOYW1lOiBcInRhYmxlXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00udGhlYWQobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y29sU3BhbjogXCIyXCJ9LCBcIlBhcnRuZXJcIiksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCIsIHN0eWxlOiB7d2lkdGg6IDEzMH19LCBcIk93bmVyc2hpcFwiKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFwiQ29pbnNcIiksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00udGJvZHkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00udHIoe2NsYXNzTmFtZTogXCJhY3RpdmVcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgQXZhdGFyKHt1c2VyOiBjcmVhdG9yfSkpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgIFwiQFwiLCBjcmVhdG9yLnVzZXJuYW1lXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIHRoaXMub3duZXJzaGlwKGNyZWF0b3IpLCBcIiVcIilcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1jb2luc1wiLCBzdHlsZToge1wid2hpdGUtc3BhY2VcIjpcIm5vd3JhcFwifX0sIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW5cIn0pLCBcbiAgICAgICAgICAgICAgICAgIGNyZWF0b3IuY29pbnNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFwiKHlvdSlcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIHRoaXMucm93cygpLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgQXZhdGFyKHt1c2VyOiB0aGlzLnN0YXRlLnBvdGVudGlhbFVzZXIsIGFsd2F5c0RlZmF1bHQ6IFwidHJ1ZVwifSkpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgIFBlcnNvblBpY2tlcih7cmVmOiBcInBpY2tlclwiLCB1cmw6IFwiL19lc1wiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXNlclNlbGVjdGVkOiB0aGlzLmhhbmRsZVVzZXJTZWxlY3RlZCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblZhbGlkVXNlckNoYW5nZWQ6IHRoaXMuaGFuZGxlVmFsaWRVc2VyQ2hhbmdlZH0pXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwIGlucHV0LWdyb3VwLXNtXCJ9LCBcblxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sIHRleHQtcmlnaHRcIiwgdHlwZTogXCJudW1iZXJcIiwgdmFsdWU6IHRoaXMuc3RhdGUucGVyY2VudGFnZUF2YWlsYWJsZSwgb25DaGFuZ2U6IHRoaXMuaGFuZGxlSW5wdXRDaGFuZ2V9KSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYWRkb25cIn0sIFwiJVwiKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtY29pbnMgcHVsbC1yaWdodFwiLCBzdHlsZTogeyd3aGl0ZS1zcGFjZSc6XCJub3dyYXBcIn19LCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgICAgICBcIjBcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQnV0dG9uKClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBhZGRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0ZXh0LXN1Y2Nlc3NcIiwgXG4gICAgICAgICAgICBzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfSwgXG4gICAgICAgICAgICBvbkNsaWNrOiB0aGlzLnN0YXRlLnBvdGVudGlhbFVzZXIgPyB0aGlzLmFkZFVzZXJDbGlja2VkIDogJyd9LCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1wbHVzLWNpcmNsZWRcIn0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiQWRkXCIpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGhhbmRsZVVzZXJTZWxlY3RlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5hZGRVc2VyKHVzZXIpXG4gICAgfSxcblxuICAgIGhhbmRsZVZhbGlkVXNlckNoYW5nZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBwb3RlbnRpYWxVc2VyOiB1c2VyXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYWRkVXNlckNsaWNrZWQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5hZGRVc2VyKHRoaXMuc3RhdGUucG90ZW50aWFsVXNlcik7XG4gICAgICB0aGlzLnJlZnMucGlja2VyLmNsZWFyVGV4dCgpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdXNlcnMgPSBDb2luT3duZXJzaGlwU3RvcmUuZ2V0VXNlcnMoKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB1c2Vycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKCF1c2Vyc1tpXS5oYXNPd25Qcm9wZXJ0eSgnY29pbnMnKSkge1xuICAgICAgICAgIHVzZXJzW2ldLmNvaW5zID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2hhcmVyczogdXNlcnNcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhZGRVc2VyOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB2YXIgdXNlciA9IF8uZXh0ZW5kKHVzZXIsIHtjb2luczogMH0pO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKFJlYWN0LmFkZG9ucy51cGRhdGUodGhpcy5zdGF0ZSwge1xuICAgICAgICBwb3RlbnRpYWxVc2VyOiB7JHNldDogbnVsbH0sXG4gICAgICAgIHNoYXJlcnM6IHsgJHB1c2g6IFt1c2VyXSB9XG4gICAgICB9KSk7XG5cbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogQ08uRVZFTlRTLlVTRVJfQURERUQsXG4gICAgICAgIGFjdGlvbjogQ08uQUNUSU9OUy5BRERfVVNFUixcbiAgICAgICAgZGF0YTogeyB1c2VyQW5kQ29pbnM6IHVzZXIgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJvd3M6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWFwKHRoaXMuc3RhdGUuc2hhcmVycywgZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gT3duZXJzaGlwUm93KHtcbiAgICAgICAgICB1c2VyOiB1c2VyLCBcbiAgICAgICAgICB0b3RhbENvaW5zOiB0aGlzLnByb3BzLnRvdGFsQ29pbnMsIFxuICAgICAgICAgIG93bmVyc2hpcDogdGhpcy5vd25lcnNoaXAodXNlciksIFxuICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLmhhbmRsZVVzZXJSZW1vdmVkKHVzZXIpLCBrZXk6IHVzZXIuaWQgfHwgdXNlci5lbWFpbCwgXG4gICAgICAgICAgb25Pd25lcnNoaXBDaGFuZ2VkOiB0aGlzLmhhbmRsZU93bmVyc2hpcENoYW5nZWQodXNlcil9KVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICBoYW5kbGVVc2VyUmVtb3ZlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdXNlcnMgPSBfLnJlamVjdCh0aGlzLnN0YXRlLnNoYXJlcnMsIGZ1bmN0aW9uKHUpe1xuICAgICAgICAgIGlmICh1LmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdS5pZCA9PSB1c2VyLmlkXG4gICAgICAgICAgfSBlbHNlIGlmICh1LmVtYWlsKSB7XG4gICAgICAgICAgICByZXR1cm4gdS5lbWFpbCA9PSB1c2VyLmVtYWlsXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICBldmVudDogQ08uRVZFTlRTLlVTRVJfUkVNT1ZFRCxcbiAgICAgICAgICBhY3Rpb246IENPLkFDVElPTlMuUkVNT1ZFX1VTRVIsXG4gICAgICAgICAgZGF0YTogeyB1c2VyQW5kQ29pbnM6IHVzZXIgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY3JlYXRvciA9IHRoaXMuc3RhdGUuY3JlYXRvcjtcblxuICAgICAgICBjcmVhdG9yLmNvaW5zID0gY3JlYXRvci5jb2lucyArIHVzZXIuY29pbnM7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgc2hhcmVyczogdXNlcnMsXG4gICAgICAgICAgY3JlYXRvcjogY3JlYXRvclxuICAgICAgICB9KTtcblxuICAgICAgfS5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVPd25lcnNoaXBDaGFuZ2VkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAvLyB0aGlzIG5lZWRzIHRvIGJlIGNvbXBsZXRlbHkgcmV3cml0dGVuIHRvIHVzZSB0aGUgZGlzcGF0Y2hlciBhbmQgc3RvcmUocylcbiAgICAgIHJldHVybiBmdW5jdGlvbihvd25lcnNoaXApIHtcbiAgICAgICAgdXNlci5jb2lucyA9IE1hdGguZmxvb3IoKG93bmVyc2hpcCAvIDEwMCkgKiB0aGlzLnByb3BzLnRvdGFsQ29pbnMpO1xuXG4gICAgICAgIHZhciBjcmVhdG9yID0gdGhpcy5zdGF0ZS5jcmVhdG9yO1xuICAgICAgICB2YXIgc2hhcmVycyA9IHRoaXMuc3RhdGUuc2hhcmVycztcblxuICAgICAgICB2YXIgc2hhcmVyQ29pbnMgPSBfLnJlZHVjZShcbiAgICAgICAgICBfLm1hcChzaGFyZXJzLFxuICAgICAgICAgIGZ1bmMuZG90KCdjb2lucycpKSxcbiAgICAgICAgICBmdW5jdGlvbihtZW1vLCBjb2lucykge1xuICAgICAgICAgICAgcmV0dXJuIG1lbW8gKyBjb2lucztcbiAgICAgICAgICB9LFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcblxuICAgICAgICBjcmVhdG9yLmNvaW5zID0gdGhpcy5wcm9wcy50b3RhbENvaW5zIC0gc2hhcmVyQ29pbnMgfHwgMDtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBzaGFyZXJzOiB0aGlzLnN0YXRlLnNoYXJlcnMsXG4gICAgICAgICAgY3JlYXRvcjogY3JlYXRvclxuICAgICAgICB9KTtcblxuICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfVxuICB9KTtcblxuICB2YXIgT3duZXJzaGlwUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnT3duZXJzaGlwUm93JyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3duZXJzaGlwOiAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVzZXIgPSB0aGlzLnByb3BzLnVzZXI7XG5cbiAgICAgIGlmICh1c2VyLmVtYWlsKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBnbHlwaGljb24gZ2x5cGhpY29uLWVudmVsb3BlXCJ9KSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICB1c2VyLmVtYWlsXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwIGlucHV0LWdyb3VwLXNtXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3JlZjogXCJvd25lcnNoaXBcIiwgY2xhc3NOYW1lOiBcImZvcm0tY29udHJvbCB0ZXh0LXJpZ2h0XCIsIHR5cGU6IFwibnVtYmVyXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnb3duZXJzaGlwWycgKyB1c2VyLmVtYWlsICsgJ10nLCBcbiAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUub3duZXJzaGlwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlT3duZXJzaGlwQ2hhbmdlZH0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYWRkb25cIn0sIFwiJVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtY29pbnNcIiwgc3R5bGU6IHsnd2hpdGUtc3BhY2UnOlwibm93cmFwXCJ9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW5cIn0pLCBcbiAgICAgICAgICAgICAgICB1c2VyLmNvaW5zXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgb25DbGljazogcHJldmVudERlZmF1bHQodGhpcy5wcm9wcy5vblJlbW92ZSksIGNsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGxpbmstaG92ZXItZGFuZ2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jbG9zZVwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJSZW1vdmVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIEF2YXRhcih7dXNlcjogdXNlcn0pKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgIFwiQFwiLCB1c2VyLnVzZXJuYW1lXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwIGlucHV0LWdyb3VwLXNtXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3JlZjogXCJvd25lcnNoaXBcIiwgY2xhc3NOYW1lOiBcImZvcm0tY29udHJvbCB0ZXh0LXJpZ2h0XCIsIHR5cGU6IFwibnVtYmVyXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnb3duZXJzaGlwWycgKyB1c2VyLmlkICsgJ10nLCBcbiAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUub3duZXJzaGlwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlT3duZXJzaGlwQ2hhbmdlZH0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYWRkb25cIn0sIFwiJVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtY29pbnNcIiwgc3R5bGU6IHsnd2hpdGUtc3BhY2UnOlwibm93cmFwXCJ9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW5cIn0pLCBcbiAgICAgICAgICAgICAgICB1c2VyLmNvaW5zXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgb25DbGljazogcHJldmVudERlZmF1bHQodGhpcy5wcm9wcy5vblJlbW92ZSksIGNsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGxpbmstaG92ZXItZGFuZ2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jbG9zZVwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJSZW1vdmVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBoYW5kbGVPd25lcnNoaXBDaGFuZ2VkOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdmFsID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUsIDEwKTtcblxuICAgICAgaWYgKHZhbCA8IDApIHtcbiAgICAgICAgdmFsID0gMDtcbiAgICAgIH1cblxuICAgICAgdmFyIHVzZXIgPSB0aGlzLnByb3BzLnVzZXI7XG4gICAgICB2YXIgdXNlcnMgPSBDb2luT3duZXJzaGlwU3RvcmUuZ2V0VXNlcnMoKTtcblxuICAgICAgdmFyIHNoYXJlckNvaW5zID0gXy5yZWR1Y2UoXy5tYXAoXy5yZWplY3QodXNlcnMsXG4gICAgICAgIGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICByZXR1cm4gcy51c2VybmFtZSA9PT0gdXNlci51c2VybmFtZVxuICAgICAgICB9KSxcbiAgICAgICAgZnVuYy5kb3QoJ2NvaW5zJykpLFxuICAgICAgICBmdW5jdGlvbihtZW1vLCBjb2lucykge1xuICAgICAgICAgIHJldHVybiBtZW1vICsgY29pbnM7XG4gICAgICAgIH0sXG4gICAgICAwKTtcblxuICAgICAgdmFyIHBlcmNlbnRhZ2VSZW1haW5pbmcgPSAxMDAgLSBNYXRoLmNlaWwoc2hhcmVyQ29pbnMgLyB0aGlzLnByb3BzLnRvdGFsQ29pbnMgKiAxMDApO1xuXG4gICAgICBpZiAodmFsID49IHBlcmNlbnRhZ2VSZW1haW5pbmcpIHtcbiAgICAgICAgdmFsID0gcGVyY2VudGFnZVJlbWFpbmluZztcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG93bmVyc2hpcDogdmFsXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5wcm9wcy5vbk93bmVyc2hpcENoYW5nZWQodmFsKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ29pbk93bmVyc2hpcDtcbiAgfVxuXG4gIHdpbmRvdy5Db2luT3duZXJzaGlwID0gQ29pbk93bmVyc2hpcDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIGF0VXNlcm5hbWUodXNlcikge1xuICAgIHJldHVybiAnQCcgKyB1c2VyLnVzZXJuYW1lXG4gIH1cblxuICBmdW5jdGlvbiBhdmF0YXJVcmwodXNlciwgc2l6ZSkge1xuICAgIGlmICh1c2VyKSB7XG4gICAgICByZXR1cm4gdXNlci5hdmF0YXJfdXJsICsgJz9zPScgKyA0OFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJy9hc3NldHMvYXZhdGFycy9kZWZhdWx0LnBuZydcbiAgICB9XG4gIH1cblxuICB2YXIgQ29yZVRlYW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDb3JlVGVhbScsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IHVzZXJzOiBbXSwgcG90ZW50aWFsVXNlcjogbnVsbCB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udGFibGUoe2NsYXNzTmFtZTogXCJ0YWJsZVwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRib2R5KG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKHtjbGFzc05hbWU6IFwiYWN0aXZlXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe2FsdDogYXRVc2VybmFtZSh0aGlzLnByb3BzLmN1cnJlbnRVc2VyKSwgXG4gICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYXZhdGFyIGltZy1jaXJjbGVcIiwgXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMjRcIiwgd2lkdGg6IFwiMjRcIiwgXG4gICAgICAgICAgICAgICAgICAgICBzcmM6IGF2YXRhclVybCh0aGlzLnByb3BzLmN1cnJlbnRVc2VyLCA0OCl9KVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIGF0VXNlcm5hbWUodGhpcy5wcm9wcy5jdXJyZW50VXNlcikpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcIih5b3UpXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgdGhpcy5yb3dzKCksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgdGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyID8gdGhpcy5hdmF0YXIodGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyKSA6IHRoaXMuYXZhdGFyKG51bGwpKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBQZXJzb25QaWNrZXIoe3JlZjogXCJwaWNrZXJcIiwgdXJsOiBcIi9fZXNcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJTZWxlY3RlZDogdGhpcy5oYW5kbGVVc2VyU2VsZWN0ZWQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZFVzZXJDaGFuZ2VkOiB0aGlzLmhhbmRsZVZhbGlkVXNlckNoYW5nZWR9KVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRCdXR0b24oKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGFkZEJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0ZXh0LXN1Y2Nlc3NcIiwgaHJlZjogXCIjXCIsIG9uQ2xpY2s6IHRoaXMuYWRkVXNlckNsaWNrZWR9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLXBsdXMtY2lyY2xlZFwifSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJzci1vbmx5XCJ9LCBcIkFkZFwiKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtc3VjY2Vzc1wifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1wbHVzLWNpcmNsZWRcIn0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJBZGRcIilcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBfLm1hcCh0aGlzLnN0YXRlLnVzZXJzLCBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgcmV0dXJuIE1lbWJlclJvdyh7dXNlcjogdXNlciwgb25SZW1vdmU6IHRoaXMuaGFuZGxlVXNlclJlbW92ZWQodXNlciksIGtleTogdXNlci5pZCB8fCB1c2VyLmVtYWlsfSlcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlclNlbGVjdGVkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB0aGlzLmFkZFVzZXIodXNlcilcbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlclJlbW92ZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHVzZXJzID0gXy5yZWplY3QodGhpcy5zdGF0ZS51c2VycywgZnVuY3Rpb24odSl7XG4gICAgICAgICAgaWYgKHUuaWQpIHtcbiAgICAgICAgICAgIHJldHVybiB1LmlkID09IHVzZXIuaWRcbiAgICAgICAgICB9IGVsc2UgaWYgKHUuZW1haWwpIHtcbiAgICAgICAgICAgIHJldHVybiB1LmVtYWlsID09IHVzZXIuZW1haWxcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3VzZXJzOiB1c2Vyc30pO1xuXG4gICAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgIGV2ZW50OiBDT05TVEFOVFMuQ09JTl9PV05FUlNISVAuRVZFTlRTLlVTRVJfUkVNT1ZFRCxcbiAgICAgICAgICBhY3Rpb246IENPTlNUQU5UUy5DT0lOX09XTkVSU0hJUC5BQ1RJT05TLlJFTU9WRV9VU0VSLFxuICAgICAgICAgIGRhdGE6IHsgdXNlckFuZENvaW5zOiB1c2VyIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0sXG5cbiAgICBoYW5kbGVWYWxpZFVzZXJDaGFuZ2VkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtwb3RlbnRpYWxVc2VyOiB1c2VyfSlcbiAgICB9LFxuXG4gICAgYWRkVXNlckNsaWNrZWQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5hZGRVc2VyKHRoaXMuc3RhdGUucG90ZW50aWFsVXNlcilcbiAgICAgIHRoaXMucmVmcy5waWNrZXIuY2xlYXJUZXh0KClcbiAgICB9LFxuXG4gICAgYWRkVXNlcjogZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZShSZWFjdC5hZGRvbnMudXBkYXRlKHRoaXMuc3RhdGUsIHtcbiAgICAgICAgcG90ZW50aWFsVXNlcjogeyRzZXQ6IG51bGx9LFxuICAgICAgICB1c2VyczogeyAkcHVzaDogW3VzZXJdIH1cbiAgICAgIH0pKVxuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IENPTlNUQU5UUy5DT0lOX09XTkVSU0hJUC5FVkVOVFMuVVNFUl9BRERFRCxcbiAgICAgICAgYWN0aW9uOiBDT05TVEFOVFMuQ09JTl9PV05FUlNISVAuQUNUSU9OUy5BRERfVVNFUixcbiAgICAgICAgZGF0YTogeyB1c2VyQW5kQ29pbnM6IHVzZXIgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGF2YXRhcjogZnVuY3Rpb24odXNlcikge1xuICAgICAgaWYgKHVzZXIgJiYgdXNlci5lbWFpbCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGdseXBoaWNvbiBnbHlwaGljb24tZW52ZWxvcGVcIn0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImF2YXRhciBpbWctY2lyY2xlXCIsIGhlaWdodDogXCIyNFwiLCBzcmM6IGF2YXRhclVybCh1c2VyKSwgd2lkdGg6IFwiMjRcIn0pXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZm4oZSlcbiAgICB9XG4gIH1cblxuICB2YXIgTWVtYmVyUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTWVtYmVyUm93JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAodGhpcy5wcm9wcy51c2VyLmVtYWlsKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBnbHlwaGljb24gZ2x5cGhpY29uLWVudmVsb3BlXCJ9KSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMudXNlci5lbWFpbCksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCB2YWx1ZTogdGhpcy5wcm9wcy51c2VyLmVtYWlsLCBuYW1lOiBcImNvcmVfdGVhbVtdXCJ9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgb25DbGljazogcHJldmVudERlZmF1bHQodGhpcy5wcm9wcy5vblJlbW92ZSksIGNsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGxpbmstaG92ZXItZGFuZ2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jbG9zZVwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJSZW1vdmVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgUmVhY3QuRE9NLmltZyh7Y2xhc3NOYW1lOiBcImF2YXRhclwiLCBzcmM6IGF2YXRhclVybCh0aGlzLnByb3BzLnVzZXIsIDQ4KSwgd2lkdGg6IDI0LCBoZWlnaHQ6IDI0fSkpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcIkBcIiwgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3R5cGU6IFwiaGlkZGVuXCIsIHZhbHVlOiB0aGlzLnByb3BzLnVzZXIuaWQsIG5hbWU6IFwiY29yZV90ZWFtW11cIn0pLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wiLCBvbkNsaWNrOiBwcmV2ZW50RGVmYXVsdCh0aGlzLnByb3BzLm9uUmVtb3ZlKSwgY2xhc3NOYW1lOiBcInRleHQtbXV0ZWQgbGluay1ob3Zlci1kYW5nZXJcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWNsb3NlXCJ9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJzci1vbmx5XCJ9LCBcIlJlbW92ZVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENvcmVUZWFtO1xuICB9XG5cbiAgd2luZG93LkNvcmVUZWFtID0gQ29yZVRlYW07XG5cbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgRGVza3RvcE5vdGlmaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEZXNrdG9wTm90aWZpY2F0aW9ucycsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IGVuYWJsZWQ6IGZhbHNlIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlRW5hYmxlZDogZnVuY3Rpb24oZW5hYmxlZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVuYWJsZWQ6IGVuYWJsZWR9KVxuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnN0YXRlLmVuYWJsZWQpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnVwZGF0ZUVuYWJsZWQoIShOb3RpZnkuaXNTdXBwb3J0ZWQoKSAmJiBOb3RpZnkubmVlZHNQZXJtaXNzaW9uKCkpKVxuICAgIH0sXG5cbiAgICBoYW5kbGVDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzXG4gICAgICBOb3RpZnkucmVxdWVzdFBlcm1pc3Npb24oZnVuY3Rpb24oKXtcbiAgICAgICAgX3RoaXMudXBkYXRlRW5hYmxlZCh0cnVlKVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgaWYodGhpcy5zdGF0ZS5lbmFibGVkKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3BhbihudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI2VuYWJsZS1ub3RpZmljYXRpb25zXCIsIGNsYXNzTmFtZTogXCJqcy1lbmFibGUtbm90aWZpY2F0aW9ucyB0ZXh0LXNtYWxsXCIsICdkYXRhLXRvZ2dsZSc6IFwidG9vbHRpcFwiLCAnZGF0YS1wbGFjZW1lbnQnOiBcImxlZnRcIiwgdGl0bGU6IFwiRW5hYmxlwqBkZXNrdG9wIG5vdGlmaWNhdGlvbnMgZm9yIEBtZW50aW9uc1wiLCBvbkNsaWNrOiB0aGlzLmhhbmRsZUNsaWNrfSwgXG4gICAgICAgICAgICBcIkVuYWJsZSBub3RpZmljYXRpb25zXCJcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERlc2t0b3BOb3RpZmljYXRpb25zO1xuICB9XG5cbiAgd2luZG93LkRlc2t0b3BOb3RpZmljYXRpb25zID0gRGVza3RvcE5vdGlmaWNhdGlvbnM7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBEcmFnQW5kRHJvcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0RyYWdBbmREcm9wJyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgZGlzcGxheTogJ25vbmUnLCBvcGFjaXR5OiAxIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uc3Bhbih7aWQ6IFwibG9nby11cGxvYWRcIiwgXG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJpbWctc2hhZG93IGpzLWRyb3B6b25lLXNlbGVjdFwiLCBcbiAgICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ30sIFxuICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI6IHRoaXMub25Nb3VzZUVudGVyLCBcbiAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlOiB0aGlzLm9uTW91c2VMZWF2ZX0sIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmltZyh7c3JjOiB0aGlzLnByb3BzLnVybCwgXG4gICAgICAgICAgICAgIGFsdDogdGhpcy5wcm9wcy5hbHQsIFxuICAgICAgICAgICAgICBzdHlsZToge29wYWNpdHk6IHRoaXMuc3RhdGUub3BhY2l0eX0sIFxuICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiaW1nLXJvdW5kZWRcIiwgXG4gICAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIn0pLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtzdHlsZToge1xuICAgICAgICAgICAgICBkaXNwbGF5OiB0aGlzLnN0YXRlLmRpc3BsYXksXG4gICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAndGV4dC1hbGlnbic6ICdjZW50ZXInLFxuICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAnei1pbmRleCc6IC0xLFxuICAgICAgICAgICAgICB0b3A6ICc0MCUnLFxuICAgICAgICAgICAgICAnZm9udC1zaXplJzogJzEycHgnLFxuICAgICAgICAgICAgICAnZm9udC13ZWlnaHQnOiAnYm9sZCdcbiAgICAgICAgICB9fSwgXG4gICAgICAgICAgICBcIkRyYWcgYW5kIGRyb3Agb3IgY2xpY2sgaGVyZVwiLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5icihudWxsKSwgXG4gICAgICAgICAgICBcInRvIGNoYW5nZSB0aGUgbG9nb1wiXG4gICAgICAgICAgKVxuXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gVE9ETzogRml4IHRoaXMgZ29kYXdmdWwgaGFja1xuICAgICAgdmFyIF90aW1lb3V0LFxuICAgICAgICAgIG5vZGUgPSB0aGlzLmdldERPTU5vZGUoKTtcblxuICAgICAgJChub2RlKS5iaW5kKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgLy8gcHJldmVudCBqaXR0ZXJzXG4gICAgICAgIGlmIChfdGltZW91dCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChfdGltZW91dCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgICAgICAgIG9wYWNpdHk6IDAuNVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAkKG5vZGUpLmJpbmQoJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGlzcGxheTogJ25vbmUnLFxuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbk1vdXNlRW50ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgICAgICBvcGFjaXR5OiAwLjVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbk1vdXNlTGVhdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBkaXNwbGF5OiAnbm9uZScsXG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEcmFnQW5kRHJvcDtcbiAgfVxuXG4gIHdpbmRvdy5EcmFnQW5kRHJvcCA9IERyYWdBbmREcm9wO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBOZXdzRmVlZE1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL25ld3NfZmVlZC5qcy5qc3gnKTtcbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xudmFyIEF2YXRhciA9IHJlcXVpcmUoJy4vYXZhdGFyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIE5GID0gQ09OU1RBTlRTLk5FV1NfRkVFRDtcblxuICB2YXIgRHJvcGRvd25OZXdzRmVlZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0Ryb3Bkb3duTmV3c0ZlZWQnLFxuICAgIG1peGluczogW05ld3NGZWVkTWl4aW5dLFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIE5ld3NGZWVkU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5nZXRTdG9yaWVzKTtcblxuICAgICAgdGhpcy5mZXRjaE5ld3NGZWVkKHRoaXMucHJvcHMudXJsKTtcblxuICAgICAgdGhpcy5vblB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hOZXdzRmVlZCgpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hOZXdzRmVlZDogXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IE5GLkFDVElPTlMuRkVUQ0hfU1RPUklFUyxcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5TVE9SSUVTX0ZFVENIRUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMudXJsXG4gICAgICB9KTtcbiAgICB9LCAxMDAwKSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdG9yaWVzOiBudWxsXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBtYXJrQWxsQXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogTkYuRVZFTlRTLlJFQURfQUxMLFxuICAgICAgICBhY3Rpb246IE5GLkFDVElPTlMuTUFSS19BTExfQVNfUkVBRCxcbiAgICAgICAgZGF0YTogbnVsbFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUHVzaDogZnVuY3Rpb24oZm4pIHtcbiAgICAgIGlmICh3aW5kb3cucHVzaGVyKSB7XG4gICAgICAgIGNoYW5uZWwgPSB3aW5kb3cucHVzaGVyLnN1YnNjcmliZSgnQCcgKyB0aGlzLnByb3BzLnVzZXJuYW1lKTtcbiAgICAgICAgY2hhbm5lbC5iaW5kX2FsbChmbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51XCIsIHN0eWxlOiB7ICdtYXgtaGVpZ2h0JzogJzUwMHB4JywgJ21pbi13aWR0aCc6ICczODBweCd9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtzdHlsZTogeyAnb3ZlcmZsb3cteSc6ICdzY3JvbGwnfSwgcmVmOiBcInNwaW5uZXJcIn0sIFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zdG9yaWVzID8gdGhpcy5yb3dzKHRoaXMuc3RhdGUuc3RvcmllcykgOiBudWxsXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJkaXZpZGVyXCIsIHN0eWxlOiB7ICdtYXJnaW4tdG9wJzogJzBweCd9fSksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMuZWRpdFVzZXJQYXRoLCBjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwifSwgXCJTZXR0aW5nc1wiKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI21hcmstYXMtcmVhZFwiLCBjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwiLCBvbkNsaWNrOiB0aGlzLm1hcmtBbGxBc1JlYWR9LCBcIk1hcmsgYWxsIGFzIHJlYWRcIilcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIi9ub3RpZmljYXRpb25zXCIsIGNsYXNzTmFtZTogXCJ0ZXh0LXNtYWxsXCJ9LCBcIkFsbCBOb3RpZmljYXRpb25zXCIpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbihzdG9yaWVzKSB7XG4gICAgICB2YXIgcm93cyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0b3JpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChpID4gOSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcm93cy5wdXNoKFxuICAgICAgICAgIEVudHJ5KHtzdG9yeTogc3Rvcmllc1tpXSwgYWN0b3JzOiB0aGlzLnN0YXRlLmFjdG9ycywgZnVsbFBhZ2U6IHRoaXMucHJvcHMuZnVsbFBhZ2V9KVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGlzdC1ncm91cFwiLCBzdHlsZTogeyAnbWF4LWhlaWdodCc6ICczMDBweCcsICdtaW4taGVpZ2h0JzogJzUwcHgnfX0sIFxuICAgICAgICAgIHJvd3NcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc3Bpbm5lck9wdGlvbnM6IHtcbiAgICAgIGxpbmVzOiAxMSxcbiAgICAgIHRvcDogJzIwJSdcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBFbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0VudHJ5JyxcbiAgICBhY3RvcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWFwKFxuICAgICAgICB0aGlzLnByb3BzLnN0b3J5LmFjdG9yX2lkcyxcbiAgICAgICAgZnVuY3Rpb24oYWN0b3JJZCkge1xuICAgICAgICAgIHJldHVybiBfLmZpbmRXaGVyZSh0aGlzLnByb3BzLmFjdG9ycywgeyBpZDogYWN0b3JJZCB9KVxuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGJvZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRhcmdldCA9IHRoaXMucHJvcHMuc3RvcnkuYWN0aXZpdGllc1swXS50YXJnZXQ7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIFxuICAgICAgICAgIHRoaXMudmVyYk1hcFt0aGlzLnByb3BzLnN0b3J5LnZlcmJdLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFxuICAgICAgICAgICAgdGhpcy5zdWJqZWN0TWFwW3RoaXMucHJvcHMuc3Rvcnkuc3ViamVjdF90eXBlXS5jYWxsKHRoaXMsIHRhcmdldClcbiAgICAgICAgICApLCBcbiAgICAgICAgICB0aGlzLnByb2R1Y3QoKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5yZWZzLmJvZHkpIHtcbiAgICAgICAgdGhpcy5yZWZzLmJvZHkuZ2V0RE9NTm9kZSgpLmlubmVySFRNTCA9IHRoaXMucHJvcHMuc3Rvcnkuc3ViamVjdC5ib2R5X2h0bWw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGVsbGlwc2lzOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA+IDQwKSB7XG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCA0MCkgKyAn4oCmJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdG9yeTogdGhpcy5wcm9wcy5zdG9yeVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLnN0b3J5Lmxhc3RfcmVhZF9hdCAhPT0gMDtcbiAgICB9LFxuXG4gICAgbWFya0FzUmVhZDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBGSVhNRTogVGhpcyBtZXRob2Qgc2hvdWxkbid0IHdvcmsgdGhpcyB3YXk7IHVzZSB0aGUgRGlzcGF0Y2hlclxuICAgICAgdmFyIHN0b3J5ID0gdGhpcy5zdGF0ZS5zdG9yeTtcbiAgICAgIHN0b3J5Lmxhc3RfcmVhZF9hdCA9IG1vbWVudCgpLnVuaXgoKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHN0b3J5OiBzdG9yeVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG1hcmtBc1JlYWRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmlzUmVhZCgpKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1kaXNjIHB1bGwtcmlnaHRcIiwgb25DbGljazogdGhpcy5tYXJrQXNSZWFkLCB0aXRsZTogJ01hcmsgYXMgcmVhZCcsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfX0pO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBNYXJrIGFzIHVucmVhZFxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWNpcmNsZSBwdWxsLXJpZ2h0XCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfX0pXG4gICAgfSxcblxuICAgIHByZXZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJvZHlfcHJldmlldyA9IHRoaXMucHJvcHMuc3RvcnkuYm9keV9wcmV2aWV3O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIiwgc3R5bGU6IHsgJ3RleHQtb3ZlcmZsb3cnOiAnZWxsaXBzaXMnfX0sIFxuICAgICAgICAgIHRoaXMuZWxsaXBzaXMoYm9keV9wcmV2aWV3KVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBwcm9kdWN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9kdWN0ID0gdGhpcy5wcm9wcy5zdG9yeS5wcm9kdWN0O1xuXG4gICAgICByZXR1cm4gJyBpbiAnICsgcHJvZHVjdC5uYW1lO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFjdG9ycyA9IF8ubWFwKHRoaXMuYWN0b3JzKCksIGZ1bmMuZG90KCd1c2VybmFtZScpKS5qb2luKCcsIEAnKVxuXG4gICAgICB2YXIgY2xhc3NlcyA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldCh7XG4gICAgICAgICdlbnRyeS1yZWFkJzogdGhpcy5pc1JlYWQoKSxcbiAgICAgICAgJ2VudHJ5LXVucmVhZCc6ICF0aGlzLmlzUmVhZCgpLFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6ICdsaXN0LWdyb3VwLWl0ZW0gJyArIGNsYXNzZXMsIFxuICAgICAgICAgICAgaHJlZjogdGhpcy5wcm9wcy5zdG9yeS51cmwsIFxuICAgICAgICAgICAgc3R5bGU6IHsgJ2ZvbnQtc2l6ZSc6ICcxNHB4J30sIFxuICAgICAgICAgICAgb25DbGljazogdGhpcy5zdGF0ZS5zdG9yeS5sYXN0X3JlYWRfYXQgPyBudWxsIDogdGhpcy5tYXJrQXNSZWFkfSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtMVwifSwgXG4gICAgICAgICAgICAgIEF2YXRhcih7dXNlcjogdGhpcy5hY3RvcnMoKVswXSwgc2l6ZTogMTh9KSwgXCLCoFwiXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC0xMFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgYWN0b3JzKSwgXCIgXCIsIHRoaXMuYm9keSgpLCBcbiAgICAgICAgICAgICAgdGhpcy5wcmV2aWV3KClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLW1kLTFcIn0sIFxuICAgICAgICAgICAgICB0aGlzLm1hcmtBc1JlYWRCdXR0b24oKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc3ViamVjdE1hcDoge1xuICAgICAgVGFzazogZnVuY3Rpb24odGFzaykge1xuICAgICAgICByZXR1cm4gXCIjXCIgKyB0YXNrLm51bWJlcjtcbiAgICAgIH0sXG5cbiAgICAgIERpc2N1c3Npb246IGZ1bmN0aW9uKGRpc2N1c3Npb24pIHtcbiAgICAgICAgcmV0dXJuICdkaXNjdXNzaW9uJ1xuICAgICAgfSxcblxuICAgICAgV2lwOiBmdW5jdGlvbihib3VudHkpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZnVsbFBhZ2UpIHtcbiAgICAgICAgICByZXR1cm4gXCIjXCIgKyBib3VudHkubnVtYmVyICsgXCIgXCIgKyBib3VudHkudGl0bGVcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBcIiNcIiArIGJvdW50eS5udW1iZXI7XG4gICAgICB9LFxuICAgIH0sXG5cbiAgICB0aW1lc3RhbXA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG1vbWVudCh0aGlzLnByb3BzLnN0b3J5LmNyZWF0ZWQpLmZvcm1hdChcImRkZCwgaEFcIilcbiAgICB9LFxuXG4gICAgdmVyYk1hcDoge1xuICAgICAgJ0NvbW1lbnQnOiAnY29tbWVudGVkIG9uICcsXG4gICAgICAnQXdhcmQnOiAnYXdhcmRlZCAnLFxuICAgICAgJ0Nsb3NlJzogJ2Nsb3NlZCAnXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERyb3Bkb3duTmV3c0ZlZWQ7XG4gIH1cblxuICB3aW5kb3cuRHJvcGRvd25OZXdzRmVlZCA9IERyb3Bkb3duTmV3c0ZlZWQ7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBEcm9wZG93blRvZ2dsZXJNaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9kcm9wZG93bl90b2dnbGVyLmpzLmpzeCcpO1xudmFyIE5ld3NGZWVkU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIE5GID0gQ09OU1RBTlRTLk5FV1NfRkVFRDtcblxuICB2YXIgRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEcm9wZG93bk5ld3NGZWVkVG9nZ2xlcicsXG4gICAgbWl4aW5zOiBbRHJvcGRvd25Ub2dnbGVyTWl4aW5dLFxuXG4gICAgYWNrbm93bGVkZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbWVzdGFtcCA9IG1vbWVudCgpLnVuaXgoKTtcblxuICAgICAgbG9jYWxTdG9yYWdlLm5ld3NGZWVkQWNrID0gdGltZXN0YW1wO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgYWNrbm93bGVkZ2VkQXQ6IHRpbWVzdGFtcFxuICAgICAgfSk7XG5cbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogTkYuRVZFTlRTLkFDS05PV0xFREdFRCxcbiAgICAgICAgYWN0aW9uOiBORi5BQ1RJT05TLkFDS05PV0xFREdFLFxuICAgICAgICBkYXRhOiB0aW1lc3RhbXAsXG4gICAgICAgIHN5bmM6IHRydWVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBiYWRnZTogZnVuY3Rpb24odG90YWwpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImJhZGdlIGJhZGdlLW5vdGlmaWNhdGlvblwifSwgdG90YWwpO1xuICAgIH0sXG5cbiAgICBiYWRnZUNvdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmxhdGVzdFN0b3J5VGltZXN0YW1wKCkgPiB0aGlzLnN0YXRlLmFja25vd2xlZGdlZEF0KSB7XG4gICAgICAgIHJldHVybiBOZXdzRmVlZFN0b3JlLmdldFVucmVhZENvdW50KHRoaXMuc3RhdGUuYWNrbm93bGVkZ2VkQXQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gMDtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIE5ld3NGZWVkU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5nZXRTdG9yaWVzKTtcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBkb2N1bWVudC50aXRsZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0b3JpZXM6IG51bGwsXG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aGlzLnN0b3JlZEFjaygpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRTdG9yaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzdG9yaWVzOiBOZXdzRmVlZFN0b3JlLmdldFN0b3JpZXMoKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGxhdGVzdFN0b3J5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzdG9yaWVzID0gdGhpcy5zdGF0ZS5zdG9yaWVzO1xuXG4gICAgICBpZiAoIXN0b3JpZXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3Rvcnk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0b3JpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChzdG9yeSAmJiBzdG9yaWVzW2ldLnVwZGF0ZWQgPiBzdG9yeS51cGRhdGVkKSB7XG4gICAgICAgICAgc3RvcnkgPSBzdG9yaWVzW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdG9yeSkge1xuICAgICAgICAgIHN0b3J5ID0gc3Rvcmllc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3Rvcnk7XG4gICAgfSxcblxuICAgIGxhdGVzdFN0b3J5VGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzdG9yeSA9IHRoaXMubGF0ZXN0U3RvcnkoKTtcblxuICAgICAgcmV0dXJuIHN0b3J5ICYmIHN0b3J5LnVwZGF0ZWQgPyBzdG9yeS51cGRhdGVkIDogMDtcbiAgICB9LFxuXG4gICAgc3RvcmVkQWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBsb2NhbFN0b3JhZ2UubmV3c0ZlZWRBY2s7XG5cbiAgICAgIGlmICh0aW1lc3RhbXAgPT0gbnVsbCB8fCB0aW1lc3RhbXAgPT09ICdudWxsJykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aW1lc3RhbXAsIDEwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXI7XG4gIH1cblxuICB3aW5kb3cuRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXIgPSBEcm9wZG93bk5ld3NGZWVkVG9nZ2xlcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gVE9ETzogVGlkeSB1cCBzaGFyZWQgc3RhdGVcblxuLyoqXG4gKiBSaWdodCBub3csIGJvdGggdGhlIHRhYmxlIGFuZCB0aGUgbWV0ZXIgaGF2ZVxuICogYWxsIG9mIHRoZSBmaW5hbmNpYWxzIGluIHN0YXRlOyBpdCB3b3VsZCBiZVxuICogYmV0dGVyIHRvIG1vdmUgYWxsIG9mIHRoaXMgdG8gdGhlIEZpbmFuY2lhbHNTdG9yZVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEZpbmFuY2lhbHNTdG9yZSA9IHtcbiAgICBtb250aDogJ0p1bmUnLFxuICAgIGdldE1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLm1vbnRoO1xuICAgIH0sXG5cbiAgICBzZXRNb250aDogZnVuY3Rpb24obW9udGgpIHtcbiAgICAgIHRoaXMubW9udGggPSBtb250aDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIEZpbmFuY2lhbHNBY3Rpb25zID0ge1xuICAgIGFkZENoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgdGhpcy5saXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycyB8fCBbXTtcbiAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2goY2FsbGJhY2spXG4gICAgfSxcblxuICAgIHNlbmRDaGFuZ2U6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICBfLmVhY2godGhpcy5saXN0ZW5lcnMsIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKHN0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICB2YXIgRmluYW5jaWFscyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ZpbmFuY2lhbHMnLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmluYW5jaWFsczoge1xuICAgICAgICAgIEphbnVhcnk6IDI3NzMyLFxuICAgICAgICAgIEZlYnJ1YXJ5OiAyMDcwNCxcbiAgICAgICAgICBNYXJjaDogMzQwMjAsXG4gICAgICAgICAgQXByaWw6IDMwMDc0LFxuICAgICAgICAgIE1heTogMjY2MzIsXG4gICAgICAgICAgSnVuZTogMjczMzRcbiAgICAgICAgfSxcbiAgICAgICAgZXhwZW5zZXM6IHtcbiAgICAgICAgICBKYW51YXJ5OiAyOTk4LFxuICAgICAgICAgIEZlYnJ1YXJ5OiA0MDI0LFxuICAgICAgICAgIE1hcmNoOiAzMzYzLFxuICAgICAgICAgIEFwcmlsOiAzNDMzLFxuICAgICAgICAgIE1heTogMzQ3NCxcbiAgICAgICAgICBKdW5lOiAzNDg3XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5hbWUgPSB0aGlzLnByb3BzLnByb2R1Y3QubmFtZTtcbiAgICAgIHZhciBjb3N0cyA9IHRoaXMuc3RhdGUuZXhwZW5zZXNbRmluYW5jaWFsc1N0b3JlLmdldE1vbnRoKCldO1xuICAgICAgdmFyIGFubnVpdHkgPSBcIjE4MDAwXCI7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJmaW5hbmNpYWxzXCJ9LCBcbiAgICAgICAgICBGaW5hbmNpYWxzS2V5KHtcbiAgICAgICAgICAgICAgcHJvZHVjdDogdGhpcy5wcm9wcy5wcm9kdWN0fVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgRmluYW5jaWFsc01ldGVyKHtcbiAgICAgICAgICAgICAgcHJvZHVjdDogdGhpcy5wcm9wcy5wcm9kdWN0LCBcbiAgICAgICAgICAgICAgZmluYW5jaWFsczogdGhpcy5zdGF0ZS5maW5hbmNpYWxzLCBcbiAgICAgICAgICAgICAgY29zdHM6IHRoaXMuc3RhdGUuZXhwZW5zZXMsIFxuICAgICAgICAgICAgICBhbm51aXR5OiBhbm51aXR5fVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgRmluYW5jaWFsc1RhYmxlKHtcbiAgICAgICAgICAgICAgcHJvZHVjdDogdGhpcy5wcm9wcy5wcm9kdWN0LCBcbiAgICAgICAgICAgICAgZmluYW5jaWFsczogdGhpcy5zdGF0ZS5maW5hbmNpYWxzLCBcbiAgICAgICAgICAgICAgY29zdHM6IHRoaXMuc3RhdGUuZXhwZW5zZXMsIFxuICAgICAgICAgICAgICBhbm51aXR5OiBhbm51aXR5fVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBGaW5hbmNpYWxzS2V5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRmluYW5jaWFsc0tleScsXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtb250aDogRmluYW5jaWFsc1N0b3JlLmdldE1vbnRoKClcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIEZpbmFuY2lhbHNBY3Rpb25zLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVE9ETzogQnJlYWsgb3V0IGRsLWlubGluZSBzdHlsZXMgaW50byByZXVzYWJsZSBTQ1NTIGNvbXBvbmVudHNcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRsKHtjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZHQoe3N0eWxlOiB7J3dpZHRoJzogJzEwcHgnLCAnaGVpZ2h0JzogJzEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgJ2JhY2tncm91bmQtY29sb3InOiAnIzQ4YTNlZCd9fSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRkKHtzdHlsZTogeydtYXJnaW4tbGVmdCc6ICc1cHgnLCAnbWFyZ2luLXJpZ2h0JzogJzE1cHgnLCBkaXNwbGF5OiAnaW5saW5lJywgY2xlYXI6ICdsZWZ0J319LCB0aGlzLnByb3BzLnByb2R1Y3QubmFtZSwgXCIgYW5udWl0eVwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZHQoe3N0eWxlOiB7J3dpZHRoJzogJzEwcHgnLCAnaGVpZ2h0JzogJzEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgJ2JhY2tncm91bmQtY29sb3InOiAnI2Y5MzIzMid9fSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRkKHtzdHlsZTogeydtYXJnaW4tbGVmdCc6ICc1cHgnLCAnbWFyZ2luLXJpZ2h0JzogJzE1cHgnLCBkaXNwbGF5OiAnaW5saW5lJywgY2xlYXI6ICdsZWZ0J319LCBcIkV4cGVuc2VzIChob3N0aW5nLCBtYWludGVuYW5jZSwgZXRjLilcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmR0KHtzdHlsZTogeyd3aWR0aCc6ICcxMHB4JywgJ2hlaWdodCc6ICcxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmZDZiMmYnfX0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kZCh7c3R5bGU6IHsnbWFyZ2luLWxlZnQnOiAnNXB4JywgJ21hcmdpbi1yaWdodCc6ICcxNXB4JywgZGlzcGxheTogJ2lubGluZScsIGNsZWFyOiAnbGVmdCd9fSwgXCJBc3NlbWJseVwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZHQoe3N0eWxlOiB7J3dpZHRoJzogJzEwcHgnLCAnaGVpZ2h0JzogJzEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgJ2JhY2tncm91bmQtY29sb3InOiAnI2U5YWQxYSd9fSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRkKHtzdHlsZTogeydtYXJnaW4tbGVmdCc6ICc1cHgnLCAnbWFyZ2luLXJpZ2h0JzogJzE1cHgnLCBkaXNwbGF5OiAnaW5saW5lJywgY2xlYXI6ICdsZWZ0J319LCBcIkFwcCBDb2luIGhvbGRlcnNcIilcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIHRoaXMuc3RhdGUubW9udGgpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9vbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEZpbmFuY2lhbHNNZXRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ZpbmFuY2lhbHNNZXRlcicsXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtb250aDogRmluYW5jaWFsc1N0b3JlLmdldE1vbnRoKClcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIEZpbmFuY2lhbHNBY3Rpb25zLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlKVxuICAgIH0sXG5cbiAgICBfb25DaGFuZ2U6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpIH0pXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbmFtZSA9IHRoaXMucHJvcHMucHJvZHVjdC5uYW1lO1xuICAgICAgdmFyIHRvdGFsID0gdGhpcy5wcm9wcy5maW5hbmNpYWxzW3RoaXMuc3RhdGUubW9udGhdO1xuICAgICAgdmFyIGNvc3RzID0gdGhpcy5wcm9wcy5jb3N0c1t0aGlzLnN0YXRlLm1vbnRoXTtcblxuICAgICAgdmFyIGFubnVpdHkgPSBjYWxjdWxhdGVBbm51aXR5KHRvdGFsLCBjb3N0cywgdGhpcy5wcm9wcy5hbm51aXR5KTtcbiAgICAgIHZhciBleHBlbnNlcyA9IGNhbGN1bGF0ZUV4cGVuc2VzKHRvdGFsLCBjb3N0cyk7XG4gICAgICB2YXIgY29tbXVuaXR5U2hhcmUgPSBjYWxjdWxhdGVDb21tdW5pdHlTaGFyZSh0b3RhbCwgY29zdHMsIHRoaXMucHJvcHMuYW5udWl0eSk7XG4gICAgICB2YXIgYXNzZW1ibHlTaGFyZSA9IGNvbW11bml0eVNoYXJlICogMC4xO1xuICAgICAgY29tbXVuaXR5U2hhcmUgPSBjb21tdW5pdHlTaGFyZSAtIGFzc2VtYmx5U2hhcmU7XG5cbiAgICAgIHZhciBhbm51aXR5V2lkdGggPSBhbm51aXR5IC8gdG90YWwgKiAxMDA7XG4gICAgICB2YXIgY29zdHNXaWR0aCA9IGV4cGVuc2VzIC8gdG90YWwgKiAxMDA7XG4gICAgICB2YXIgY29tbXVuaXR5V2lkdGggPSBjb21tdW5pdHlTaGFyZSAvIHRvdGFsICogMTAwO1xuICAgICAgdmFyIGFzc2VtYmx5V2lkdGggPSBhc3NlbWJseVNoYXJlIC8gdG90YWwgKiAxMDAgO1xuXG4gICAgICBpZiAoYXNzZW1ibHlTaGFyZSA+IDApIHtcbiAgICAgICAgYXNzZW1ibHlXaWR0aCArPSA1O1xuICAgICAgICBhbm51aXR5V2lkdGggLT0gNTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInByb2dyZXNzXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtpZDogbmFtZSArICctbWV0ZXInLCBcbiAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICByb2xlOiBcInByb2dyZXNzLWJhclwiLCBcbiAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiBhbm51aXR5V2lkdGggKyAnJSd9fSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCAnJCcgKyBudW1lcmFsKGFubnVpdHkpLmZvcm1hdCgnMCwwJykpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IFwiY29zdHMtc2hhcmVcIiwgXG4gICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1kYW5nZXJcIiwgXG4gICAgICAgICAgICAgICByb2xlOiBcInByb2dyZXNzLWJhclwiLCBcbiAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiBjb3N0c1dpZHRoICsgJyUnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgJyQnICsgbnVtZXJhbChleHBlbnNlcykuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtpZDogXCJhc3NlbWJseS1zaGFyZVwiLCBcbiAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICByb2xlOiBcInByb2dyZXNzLWJhclwiLCBcbiAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiBhc3NlbWJseVdpZHRoICsgJyUnLCAnYmFja2dyb3VuZC1jb2xvcic6ICcjZmQ2YjJmJ319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsICckJyArIG51bWVyYWwoYXNzZW1ibHlTaGFyZSkuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtpZDogXCJjb21tdW5pdHktbWV0ZXJcIiwgXG4gICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci13YXJuaW5nXCIsIFxuICAgICAgICAgICAgICAgcm9sZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogY29tbXVuaXR5V2lkdGggKyAnJSd9fSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCAnJCcgKyBudW1lcmFsKGNvbW11bml0eVNoYXJlKS5mb3JtYXQoJzAsMCcpKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBGaW5hbmNpYWxzVGFibGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGaW5hbmNpYWxzVGFibGUnLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBGaW5hbmNpYWxzQWN0aW9ucy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSlcbiAgICB9LFxuXG4gICAgX29uQ2hhbmdlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vbnRoOiBGaW5hbmNpYWxzU3RvcmUuZ2V0TW9udGgoKSB9KVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5hbWUgPSB0aGlzLnByb3BzLnByb2R1Y3QubmFtZTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRhYmxlLXJlc3BvbnNpdmVcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS50YWJsZSh7Y2xhc3NOYW1lOiBcInRhYmxlIHRhYmxlLWhvdmVyXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50aGVhZChudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1sZWZ0XCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiVG90YWwgcmV2ZW51ZVwiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgICBcIkV4cGVuc2VzXCJcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiQXNzZW1ibHlcIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgICAgXCJBcHAgQ29pbiBob2xkZXJzXCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRib2R5KG51bGwsIFxuICAgICAgICAgICAgICB0aGlzLnRCb2R5KClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRCb2R5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBmaW5hbmNpYWxzID0gdGhpcy5wcm9wcy5maW5hbmNpYWxzO1xuXG4gICAgICByZXR1cm4gXy5tYXAoT2JqZWN0LmtleXMoZmluYW5jaWFscyksIGZ1bmN0aW9uIG1hcEZpbmFuY2lhbHMobW9udGgpIHtcbiAgICAgICAgdmFyIHRvdGFsID0gZmluYW5jaWFsc1ttb250aF07XG4gICAgICAgIHZhciBjb3N0cyA9IHNlbGYucHJvcHMuY29zdHNbbW9udGhdO1xuXG4gICAgICAgIHZhciBwcm9maXQgPSBjYWxjdWxhdGVQcm9maXQodG90YWwsIGNvc3RzKTtcbiAgICAgICAgdmFyIGFubnVpdHkgPSBjYWxjdWxhdGVBbm51aXR5KHRvdGFsLCBjb3N0cywgc2VsZi5wcm9wcy5hbm51aXR5KTtcbiAgICAgICAgdmFyIGV4cGVuc2VzID0gY2FsY3VsYXRlRXhwZW5zZXModG90YWwsIGNvc3RzKTtcbiAgICAgICAgdmFyIGNvbW11bml0eVNoYXJlID0gY2FsY3VsYXRlQ29tbXVuaXR5U2hhcmUodG90YWwsIGNvc3RzLCBzZWxmLnByb3BzLmFubnVpdHkpO1xuICAgICAgICB2YXIgYXNzZW1ibHlTaGFyZSA9IGNvbW11bml0eVNoYXJlICogMC4xO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgc2VsZi50Um93KG1vbnRoLCB0b3RhbCwgYW5udWl0eSwgZXhwZW5zZXMsIGFzc2VtYmx5U2hhcmUsIGNvbW11bml0eVNoYXJlKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHRSb3c6IGZ1bmN0aW9uKG1vbnRoLCB0b3RhbCwgYW5udWl0eSwgY29zdHMsIGFzc2VtYmx5LCBjb21tdW5pdHkpIHtcbiAgICAgIHZhciBtdXRlZCA9ICcnO1xuICAgICAgaWYgKFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknXS5pbmRleE9mKG1vbnRoKSA+PSAwKSB7XG4gICAgICAgIG11dGVkID0gJyB0ZXh0LW11dGVkJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnRyKHtzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfSwgb25Nb3VzZU92ZXI6IHRoaXMubW9udGhDaGFuZ2VkKG1vbnRoKSwga2V5OiBtb250aH0sIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7aWQ6ICdmaW5hbmNpYWxzLScgKyBtb250aH0sIG1vbnRoKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsICckJyArIG51bWVyYWwodG90YWwpLmZvcm1hdCgnMCwwJykpLCBcbiAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCAnJCcgKyBudW1lcmFsKGNvc3RzKS5mb3JtYXQoJzAsMCcpKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgJyQnICsgbnVtZXJhbChhbm51aXR5KS5mb3JtYXQoJzAsMCcpKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwiICsgbXV0ZWR9LCAnJCcgKyBudW1lcmFsKGFzc2VtYmx5KS5mb3JtYXQoJzAsMCcpKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwiICsgbXV0ZWR9LCAnJCcgKyBudW1lcmFsKGNvbW11bml0eSAtIGFzc2VtYmx5KS5mb3JtYXQoJzAsMCcpKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBtb250aENoYW5nZWQ6IGZ1bmN0aW9uKG1vbnRoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBGaW5hbmNpYWxzU3RvcmUuc2V0TW9udGgobW9udGgpO1xuICAgICAgICBGaW5hbmNpYWxzQWN0aW9ucy5zZW5kQ2hhbmdlKG1vbnRoKTtcbiAgICAgIH07XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBjYWxjdWxhdGVQcm9maXQodG90YWwsIGNvc3RzKSB7XG4gICAgdG90YWwgPSBwYXJzZUludCh0b3RhbCwgMTApO1xuICAgIGNvc3RzID0gcGFyc2VJbnQoY29zdHMsIDEwKTtcblxuICAgIHJldHVybiB0b3RhbCAtIGNvc3RzO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlRXhwZW5zZXModG90YWwsIGNvc3RzKSB7XG4gICAgdG90YWwgPSBwYXJzZUludCh0b3RhbCwgMTApO1xuICAgIGNvc3RzID0gcGFyc2VJbnQoY29zdHMsIDEwKTtcblxuICAgIHJldHVybiBjb3N0cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZUFubnVpdHkodG90YWwsIGNvc3RzLCBhbm51aXR5KSB7XG4gICAgdG90YWwgPSBwYXJzZUludCh0b3RhbCwgMTApO1xuICAgIGNvc3RzID0gY2FsY3VsYXRlRXhwZW5zZXModG90YWwsIHBhcnNlSW50KGNvc3RzLCAxMCkpO1xuICAgIGFubnVpdHkgPSBwYXJzZUludChhbm51aXR5LCAxMCk7XG5cbiAgICB2YXIgcHJvZml0ID0gY2FsY3VsYXRlUHJvZml0KHRvdGFsLCBjb3N0cyk7XG5cbiAgICByZXR1cm4gcHJvZml0IDwgYW5udWl0eSA/IHByb2ZpdCA6IGFubnVpdHk7XG4gIH1cblxuICBmdW5jdGlvbiBjYWxjdWxhdGVDb21tdW5pdHlTaGFyZSh0b3RhbCwgY29zdHMsIGFubnVpdHkpIHtcbiAgICB0b3RhbCA9IHBhcnNlSW50KHRvdGFsLCAxMCk7XG4gICAgY29zdHMgPSBjYWxjdWxhdGVFeHBlbnNlcyh0b3RhbCwgcGFyc2VJbnQoY29zdHMsIDEwKSk7XG4gICAgYW5udWl0eSA9IHBhcnNlSW50KGFubnVpdHksIDEwKTtcblxuICAgIHZhciBwcm9maXQgPSBjYWxjdWxhdGVQcm9maXQodG90YWwsIGNvc3RzKTtcblxuICAgIHJldHVybiBwcm9maXQgPCBhbm51aXR5ID8gMCA6IHByb2ZpdCAtIGFubnVpdHk7XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEZpbmFuY2lhbHM7XG4gIH1cblxuICB3aW5kb3cuRmluYW5jaWFscyA9IEZpbmFuY2lhbHM7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEZvcm1Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0Zvcm1Hcm91cCcsXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IGVycm9yOiBudWxsIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjbGFzc2VzID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0KHtcbiAgICAgICAgJ2Zvcm0tZ3JvdXAnOiB0cnVlLFxuICAgICAgICAnaGFzLWVycm9yJzogdGhpcy5wcm9wcy5lcnJvcixcbiAgICAgICAgJ2hhcy1mZWVkYmFjayc6IHRoaXMucHJvcHMuZXJyb3JcbiAgICAgIH0pXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGNsYXNzZXN9LCBcbiAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuLCBcbiAgICAgICAgICB0aGlzLnByb3BzLmVycm9yID8gdGhpcy5lcnJvckdseXBoKCkgOiBudWxsLCBcbiAgICAgICAgICB0aGlzLnByb3BzLmVycm9yID8gdGhpcy5lcnJvck1lc3NhZ2UoKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBlcnJvckdseXBoOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlIGZvcm0tY29udHJvbC1mZWVkYmFja1wifSlcbiAgICB9LFxuXG4gICAgZXJyb3JNZXNzYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImhlbHAtYmxvY2tcIn0sIHRoaXMucHJvcHMuZXJyb3IpXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEZvcm1Hcm91cDtcbiAgfVxuXG4gIHdpbmRvdy5Gb3JtR3JvdXAgPSBGb3JtR3JvdXA7XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBOZXdzRmVlZE1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL25ld3NfZmVlZC5qcy5qc3gnKTtcbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xudmFyIEF2YXRhciA9IHJlcXVpcmUoJy4vYXZhdGFyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBORiA9IENPTlNUQU5UUy5ORVdTX0ZFRUQ7XG5cbiAgdmFyIEZ1bGxQYWdlTmV3c0ZlZWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGdWxsUGFnZU5ld3NGZWVkJyxcbiAgICBtaXhpbnM6IFtOZXdzRmVlZE1peGluXSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBOZXdzRmVlZFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3Rvcmllcyk7XG4gICAgICB0aGlzLmZldGNoTmV3c0ZlZWQoKTtcblxuICAgICAgdGhpcy5vblB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hOZXdzRmVlZCgpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hOZXdzRmVlZDogXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IE5GLkFDVElPTlMuRkVUQ0hfU1RPUklFUyxcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5TVE9SSUVTX0ZFVENIRUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMudXJsXG4gICAgICB9KTtcbiAgICB9LCAxMDAwKSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdG9yaWVzOiBudWxsXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBtb3JlU3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdFN0b3J5ID0gdGhpcy5zdGF0ZS5zdG9yaWVzW3RoaXMuc3RhdGUuc3Rvcmllcy5sZW5ndGggLSAxXTtcblxuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogTkYuQUNUSU9OUy5GRVRDSF9NT1JFX1NUT1JJRVMsXG4gICAgICAgIGV2ZW50OiBORi5FVkVOVFMuU1RPUklFU19GRVRDSEVELFxuICAgICAgICBkYXRhOiB0aGlzLnByb3BzLnVybCArICc/dG9wX2lkPScgKyBsYXN0U3RvcnkuaWRcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblB1c2g6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICBpZiAod2luZG93LnB1c2hlcikge1xuICAgICAgICBjaGFubmVsID0gd2luZG93LnB1c2hlci5zdWJzY3JpYmUoJ0AnICsgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lKTtcbiAgICAgICAgY2hhbm5lbC5iaW5kX2FsbChmbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic2hlZXRcIiwgc3R5bGU6IHsgJ21pbi1oZWlnaHQnOiAnNjAwcHgnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYWdlLWhlYWRlciBzaGVldC1oZWFkZXJcIiwgc3R5bGU6IHsgJ3BhZGRpbmctbGVmdCc6ICcyMHB4J319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMih7Y2xhc3NOYW1lOiBcInBhZ2UtaGVhZGVyLXRpdGxlXCJ9LCBcIllvdXIgbm90aWZpY2F0aW9uc1wiKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAgbGlzdC1ncm91cC1icmVha291dFwiLCByZWY6IFwic3Bpbm5lclwifSwgXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnN0b3JpZXMgPyB0aGlzLnJvd3ModGhpcy5zdGF0ZS5zdG9yaWVzKSA6IG51bGxcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNtb3JlXCIsIGNsYXNzTmFtZTogXCJidG4gYnRuLWJsb2NrXCIsIG9uQ2xpY2s6IHRoaXMubW9yZVN0b3JpZXN9LCBcIk1vcmVcIilcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oc3Rvcmllcykge1xuICAgICAgdmFyIHJvd3MgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICByb3dzLnB1c2goXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAtaXRlbVwiLCBrZXk6IHN0b3JpZXNbaV0ua2V5fSwgXG4gICAgICAgICAgICBFbnRyeSh7c3Rvcnk6IHN0b3JpZXNbaV0sIGFjdG9yczogdGhpcy5zdGF0ZS5hY3RvcnMsIGZ1bGxQYWdlOiB0aGlzLnByb3BzLmZ1bGxQYWdlfSlcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByb3dzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEVudHJ5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRW50cnknLFxuICAgIGFjdG9yczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5tYXAoXG4gICAgICAgIHRoaXMucHJvcHMuc3RvcnkuYWN0b3JfaWRzLFxuICAgICAgICBmdW5jdGlvbihhY3RvcklkKSB7XG4gICAgICAgICAgcmV0dXJuIF8uZmluZFdoZXJlKHRoaXMucHJvcHMuYWN0b3JzLCB7IGlkOiBhY3RvcklkIH0pXG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgYm9keTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5wcm9wcy5zdG9yeS5hY3Rpdml0aWVzWzBdLnRhcmdldDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgXG4gICAgICAgICAgdGhpcy52ZXJiTWFwW3RoaXMucHJvcHMuc3RvcnkudmVyYl0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXG4gICAgICAgICAgICB0aGlzLnN1YmplY3RNYXBbdGhpcy5wcm9wcy5zdG9yeS5zdWJqZWN0X3R5cGVdLmNhbGwodGhpcywgdGFyZ2V0KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnN0b3J5Lmxhc3RfcmVhZF9hdCAhPSBudWxsO1xuICAgIH0sXG5cbiAgICBtYXJrQXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogTkYuRVZFTlRTLlJFQUQsXG4gICAgICAgIGFjdGlvbjogTkYuQUNUSU9OUy5NQVJLX0FTX1JFQUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMuc3RvcnkuaWRcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtYXJrQXNSZWFkQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5pc1JlYWQoKSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tZGlzY1wiLCBvbkNsaWNrOiB0aGlzLm1hcmtBc1JlYWQsIHRpdGxlOiAnTWFyayBhcyByZWFkJywgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9fSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IE1hcmsgYXMgdW5yZWFkXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2lyY2xlXCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfX0pO1xuICAgIH0sXG5cbiAgICBwcmV2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib2R5UHJldmlldyA9IHRoaXMucHJvcHMuc3RvcnkuYm9keV9wcmV2aWV3O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIiwgc3R5bGU6IHsgJ3RleHQtb3ZlcmZsb3cnOiAnZWxsaXBzaXMnfX0sIFxuICAgICAgICAgIGJvZHlQcmV2aWV3XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWN0b3JzID0gXy5tYXAodGhpcy5hY3RvcnMoKSwgZnVuYy5kb3QoJ3VzZXJuYW1lJykpLmpvaW4oJywgQCcpXG5cbiAgICAgIHZhciBjbGFzc2VzID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0KHtcbiAgICAgICAgJ2VudHJ5LXJlYWQnOiB0aGlzLmlzUmVhZCgpLFxuICAgICAgICAnZW50cnktdW5yZWFkJzogIXRoaXMuaXNSZWFkKCksXG4gICAgICB9KTtcblxuICAgICAgdmFyIHByb2R1Y3ROYW1lID0gdGhpcy5wcm9wcy5zdG9yeS5wcm9kdWN0Lm5hbWU7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogY2xhc3Nlc30sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC0zXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6ICcvJyArIHRoaXMucHJvcHMuc3RvcnkucHJvZHVjdC5zbHVnfSwgcHJvZHVjdE5hbWUpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmJyKG51bGwpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIHRleHQtc21hbGxcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMudGltZXN0YW1wKClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtOFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IGNsYXNzZXMsIGhyZWY6IHRoaXMucHJvcHMuc3RvcnkudXJsLCBvbkNsaWNrOiB0aGlzLm1hcmtBc1JlYWR9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7c3R5bGU6IHsgJ21hcmdpbi1yaWdodCc6ICc1cHgnfX0sIFxuICAgICAgICAgICAgICAgICAgQXZhdGFyKHt1c2VyOiB0aGlzLmFjdG9ycygpWzBdfSlcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIGFjdG9ycyksIFwiIFwiLCB0aGlzLmJvZHkoKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LXNtYWxsIHRleHQtbXV0ZWRcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlldygpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6ICdjb2wtbWQtMSAnICsgY2xhc3Nlc30sIFxuICAgICAgICAgICAgICB0aGlzLm1hcmtBc1JlYWRCdXR0b24oKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtb21lbnQodGhpcy5wcm9wcy5zdG9yeS5jcmVhdGVkKS5mb3JtYXQoXCJkZGQsIGhBXCIpXG4gICAgfSxcblxuICAgIHN1YmplY3RNYXA6IHtcbiAgICAgIFRhc2s6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgcmV0dXJuIFwiI1wiICsgdGFzay5udW1iZXIgKyBcIiBcIiArIHRhc2sudGl0bGU7XG4gICAgICB9LFxuXG4gICAgICBEaXNjdXNzaW9uOiBmdW5jdGlvbihkaXNjdXNzaW9uKSB7XG4gICAgICAgIHJldHVybiAnYSBkaXNjdXNzaW9uJztcbiAgICAgIH0sXG5cbiAgICAgIFdpcDogZnVuY3Rpb24oYm91bnR5KSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZ1bGxQYWdlKSB7XG4gICAgICAgICAgcmV0dXJuIFwiI1wiICsgYm91bnR5Lm51bWJlciArIFwiIFwiICsgYm91bnR5LnRpdGxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFwiI1wiICsgYm91bnR5Lm51bWJlcjtcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHZlcmJNYXA6IHtcbiAgICAgICdDb21tZW50JzogJ2NvbW1lbnRlZCBvbiAnLFxuICAgICAgJ0F3YXJkJzogJ2F3YXJkZWQnLFxuICAgICAgJ0Nsb3NlJzogJ2Nsb3NlZCAnXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEZ1bGxQYWdlTmV3c0ZlZWQ7XG4gIH1cblxuICB3aW5kb3cuRnVsbFBhZ2VOZXdzRmVlZCA9IEZ1bGxQYWdlTmV3c0ZlZWQ7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBGb3JtR3JvdXAgPSByZXF1aXJlKCcuL2Zvcm1fZ3JvdXAuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIElucHV0UHJldmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0lucHV0UHJldmlldycsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlucHV0UHJldmlldzogJycsXG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5wcm9wcy50cmFuc2Zvcm0gfHwgdGhpcy50cmFuc2Zvcm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBGb3JtR3JvdXAobnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwXCIsIHN0eWxlOiB7IHdpZHRoOiAnMzUlJ319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMucHJvcHMuaW5wdXROYW1lLCBcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sXCIsIFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLmlucHV0UHJldmlldywgXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHRoaXMucHJvcHMucGxhY2Vob2xkZXIsIFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlfSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cC1idG5cIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHt0eXBlOiBcInN1Ym1pdFwiLCBvblN1Ym1pdDogdGhpcy5vblN1Ym1pdCwgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeVwiLCBkaXNhYmxlZDogdGhpcy5idXR0b25TdGF0ZSgpfSwgdGhpcy5wcm9wcy5idXR0b25UZXh0KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBvbWVnYVwiLCBzdHlsZTogeyAnbWFyZ2luLXRvcCc6ICc1cHgnLCAnbWFyZ2luLWxlZnQnOiAnMXB4J319LCBcbiAgICAgICAgICAgIFwiUHJldmlldzogXCIsIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgdGhpcy5wcm9wcy5hZGRvblRleHQgKyB0aGlzLnN0YXRlLmlucHV0UHJldmlldylcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdmFsdWUgPSBlLnRhcmdldC52YWx1ZTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlucHV0UHJldmlldzogdGhpcy5zdGF0ZS50cmFuc2Zvcm0odmFsdWUpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYnV0dG9uU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuaW5wdXRQcmV2aWV3Lmxlbmd0aCA+PSAyID8gZmFsc2UgOiB0cnVlO1xuICAgIH0sXG5cbiAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1teXFx3LVxcLl0rL2csICctJykudG9Mb3dlckNhc2UoKTtcbiAgICB9LFxuXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW5wdXRQcmV2aWV3O1xuICB9XG5cbiAgd2luZG93LklucHV0UHJldmlldyA9IElucHV0UHJldmlldztcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgSW50ZXJlc3RTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9pbnRlcmVzdF9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJUCA9IENPTlNUQU5UUy5JTlRFUkVTVF9QSUNLRVI7XG5cbiAgdmFyIGtleXMgPSB7XG4gICAgZW50ZXI6IDEzLFxuICAgIGVzYzogMjcsXG4gICAgdXA6IDM4LFxuICAgIGRvd246IDQwLFxuICAgIGRlbGV0ZTogOFxuICB9O1xuXG4gIHZhciBJbnRlcmVzdFBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludGVyZXN0UGlja2VyJyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2VsZWN0ZWRJbnRlcmVzdHM6IEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCksXG4gICAgICAgIGhpZ2hsaWdodEluZGV4OiAwLFxuICAgICAgICB2aXNpYmxlSW50ZXJlc3RzOiBbXSxcbiAgICAgICAgdXNlcklucHV0OiAnJ1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLnVzZXJJbnRlcmVzdHMgJiYgdGhpcy5wcm9wcy51c2VySW50ZXJlc3RzLmxlbmd0aCkge1xuICAgICAgICBJbnRlcmVzdFN0b3JlLnNldEludGVyZXN0cyh0aGlzLnByb3BzLnVzZXJJbnRlcmVzdHMpO1xuICAgICAgfVxuXG4gICAgICBJbnRlcmVzdFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMub25TdG9yZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgY3Vyc29yOiAndGV4dCd9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNlbGVjdCh7XG4gICAgICAgICAgICAgIG5hbWU6IHRoaXMucHJvcHMubmFtZSwgXG4gICAgICAgICAgICAgIG11bHRpcGxlOiBcInRydWVcIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJ30sIFxuICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5zZWxlY3RlZEludGVyZXN0c30sIFxuICAgICAgICAgICAgdGhpcy5mb3JtYXRTZWxlY3RlZCgnb3B0aW9uJylcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe1xuICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicGlsbC1saXN0XCIsIFxuICAgICAgICAgICAgICByZWY6IFwiY29udGFpbmVyXCIsIFxuICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmhhbmRsZUNvbnRhaW5lckNsaWNrfSwgXG4gICAgICAgICAgICB0aGlzLmZvcm1hdFNlbGVjdGVkKCdwaWxsJyksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICAgICAgcmVmOiBcInVzZXJJbnB1dFwiLCBcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUNoYW5nZSwgXG4gICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuaGFuZGxlS2V5RG93biwgXG4gICAgICAgICAgICAgICAgICBvbkZvY3VzOiB0aGlzLmhhbmRsZUZvY3VzLCBcbiAgICAgICAgICAgICAgICAgIG9uQmx1cjogdGhpcy5oYW5kbGVCbHVyLCBcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnVzZXJJbnB1dH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgICB0aGlzLnN0YXRlLnZpc2libGVJbnRlcmVzdHMubGVuZ3RoID4gMCAmJiB0aGlzLnN0YXRlLnNob3cgPyB0aGlzLmludGVyZXN0RHJvcGRvd24oKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW50ZXJlc3REcm9wZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBJbnRlcmVzdERyb3Bkb3duKHtcbiAgICAgICAgICAgIGludGVyZXN0czogdGhpcy5zdGF0ZS52aXNpYmxlSW50ZXJlc3RzLCBcbiAgICAgICAgICAgIGhpZ2hsaWdodEluZGV4OiB0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4LCBcbiAgICAgICAgICAgIG9uSW50ZXJlc3RTZWxlY3RlZDogdGhpcy5vbkludGVyZXN0U2VsZWN0ZWR9XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGhhbmRsZUNvbnRhaW5lckNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLnJlZnMudXNlcklucHV0LmdldERPTU5vZGUoKS5mb2N1cygpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgdmFyIHZpc2libGVJbnRlcmVzdHMgPSB0aGlzLmdldFZpc2libGVJbnRlcmVzdHModmFsdWUpO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgdXNlcklucHV0OiB0aGlzLnRyYW5zZm9ybSh2YWx1ZSksXG4gICAgICAgIHZpc2libGVJbnRlcmVzdHM6IHZpc2libGVJbnRlcmVzdHNcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVLZXlEb3duOiBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlzLnVwKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5tb3ZlSGlnaGxpZ2h0KC0xKTtcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBrZXlzLmRvd24pIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLm1vdmVIaWdobGlnaHQoMSk7XG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0ga2V5cy5kZWxldGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudXNlcklucHV0ID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogSVAuQUNUSU9OUy5QT1AsXG4gICAgICAgICAgICBldmVudDogSVAuRVZFTlRTLlBPUFBFRFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0ga2V5cy5lbnRlcikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2VsZWN0Q3VycmVudEludGVyZXN0KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFZpc2libGVJbnRlcmVzdHM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgaW50ZXJlc3RzID0gXy5maWx0ZXIodGhpcy5wcm9wcy5pbnRlcmVzdHMsIGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIHJldHVybiBpbnRlcmVzdC5pbmRleE9mKHZhbHVlKSA+PSAwICYmIEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCkuaW5kZXhPZihpbnRlcmVzdCkgPT09IC0xO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh2YWx1ZSAmJiBpbnRlcmVzdHMuaW5kZXhPZih2YWx1ZSkgPT09IC0xKSB7XG4gICAgICAgIGludGVyZXN0cy5wdXNoKHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGludGVyZXN0cztcbiAgICB9LFxuXG4gICAgbW92ZUhpZ2hsaWdodDogZnVuY3Rpb24oaW5jKSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmNvbnN0cmFpbkhpZ2hsaWdodCh0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4ICsgaW5jKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGhpZ2hsaWdodEluZGV4OiBpbmRleFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbnN0cmFpbkhpZ2hsaWdodDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgMCwgTWF0aC5taW4odGhpcy5zdGF0ZS52aXNpYmxlSW50ZXJlc3RzLmxlbmd0aCAtIDEsIGluZGV4KVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc2VsZWN0Q3VycmVudEludGVyZXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IElQLkFDVElPTlMuQUREX0lOVEVSRVNULFxuICAgICAgICBldmVudDogSVAuRVZFTlRTLklOVEVSRVNUX0FEREVELFxuICAgICAgICBkYXRhOiB0aGlzLnN0YXRlLnZpc2libGVJbnRlcmVzdHNbdGhpcy5zdGF0ZS5oaWdobGlnaHRJbmRleF1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblN0b3JlQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2aXNpYmxlSW50ZXJlc3RzOiBbXSxcbiAgICAgICAgc2VsZWN0ZWRJbnRlcmVzdHM6IEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCksXG4gICAgICAgIHVzZXJJbnB1dDogJydcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1teXFx3LV0rL2csICctJykudG9Mb3dlckNhc2UoKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlRm9jdXM6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucmVmcy5jb250YWluZXIuZ2V0RE9NTm9kZSgpLnN0eWxlLmNzc1RleHQgPSBcImJvcmRlcjogMXB4IHNvbGlkICM0OGEzZWQ7IGJveC1zaGFkb3c6IDBweCAwcHggM3B4ICM2NmFmZTlcIjtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgIHZpc2libGVJbnRlcmVzdHM6IF8uZGlmZmVyZW5jZSh0aGlzLnByb3BzLmludGVyZXN0cywgSW50ZXJlc3RTdG9yZS5nZXRJbnRlcmVzdHMoKSlcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVCbHVyOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnJlZnMuY29udGFpbmVyLmdldERPTU5vZGUoKS5zdHlsZS5jc3NUZXh0ID0gJyc7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gRklYTUU6IFRoZXJlIGhhcyB0byBiZSBhIGJldHRlciB3YXkgdG8gaGFuZGxlIHRoaXM6XG4gICAgICAvLyAgICAgICAgVGhlIGlzc3VlIGlzIHRoYXQgaGlkaW5nIHRoZSBkcm9wZG93biBvbiBibHVyXG4gICAgICAvLyAgICAgICAgY2F1c2VzIHNlbGVjdGluZyBhbiBpdGVtIHRvIGZhaWwgd2l0aG91dCBhXG4gICAgICAvLyAgICAgICAgdGltZW91dCBvZiB+MjAwIHRvIH4zMDAgbXMuXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICBzaG93OiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH0sIDMwMCk7XG4gICAgfSxcblxuICAgIG9uSW50ZXJlc3RTZWxlY3RlZDogZnVuY3Rpb24oZSkge1xuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogSVAuRVZFTlRTLkFERF9JTlRFUkVTVCxcbiAgICAgICAgZXZlbnQ6IElQLkVWRU5UUy5JTlRFUkVTVF9BRERFRCxcbiAgICAgICAgZGF0YTogJydcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVSZW1vdmU6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiBJUC5BQ1RJT05TLlJFTU9WRV9JTlRFUkVTVCxcbiAgICAgICAgZXZlbnQ6IElQLkVWRU5UUy5JTlRFUkVTVF9SRU1PVkVELFxuICAgICAgICBkYXRhOiBpbnRlcmVzdFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZvcm1hdFNlbGVjdGVkOiBmdW5jdGlvbihvcHRpb25PclBpbGwpIHtcbiAgICAgIHZhciBpbnRlcmVzdHMgPSBJbnRlcmVzdFN0b3JlLmdldEludGVyZXN0cygpO1xuICAgICAgdmFyIHNlbGVjdGVkSW50ZXJlc3RzID0gXy5tYXAoaW50ZXJlc3RzLCB0aGlzLmludGVyZXN0VG9bb3B0aW9uT3JQaWxsXS5iaW5kKHRoaXMpKTtcblxuICAgICAgcmV0dXJuIHNlbGVjdGVkSW50ZXJlc3RzO1xuICAgIH0sXG5cbiAgICBpbnRlcmVzdFRvOiB7XG4gICAgICBvcHRpb246IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00ub3B0aW9uKHt2YWx1ZTogaW50ZXJlc3QsIGtleTogaW50ZXJlc3R9LCBpbnRlcmVzdClcbiAgICAgIH0sXG5cbiAgICAgIHBpbGw6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiaW50ZXJlc3QtY2hvaWNlXCIsIGtleTogaW50ZXJlc3R9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiaW50ZXJlc3QtY2xvc2VcIiwgb25DbGljazogdGhpcy5oYW5kbGVSZW1vdmUuYmluZCh0aGlzLCBpbnRlcmVzdCl9LCBcIkBcIiwgaW50ZXJlc3QsIFwiIMOXXCIpXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEludGVyZXN0RHJvcGRvd24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnRlcmVzdERyb3Bkb3duJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgJ3otaW5kZXgnOiAxMDAsXG4gICAgICAgIHRvcDogNDUsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgIGRpc3BsYXk6ICdibG9jaydcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duLW1lbnVcIiwgc3R5bGU6IHN0eWxlfSwgXG4gICAgICAgICAgdGhpcy5yb3dzKClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IC0xO1xuXG4gICAgICB2YXIgaW50ZXJlc3RzID0gXy5tYXAodGhpcy5wcm9wcy5pbnRlcmVzdHMsIGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIGkrKztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIEludGVyZXN0RHJvcGRvd25FbnRyeSh7XG4gICAgICAgICAgICAgIGtleTogaW50ZXJlc3QsIFxuICAgICAgICAgICAgICBpbnRlcmVzdDogaW50ZXJlc3QsIFxuICAgICAgICAgICAgICBzZWxlY3RlZDogaSA9PT0gdGhpcy5wcm9wcy5oaWdobGlnaHRJbmRleH1cbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICByZXR1cm4gaW50ZXJlc3RzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEludGVyZXN0RHJvcGRvd25FbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludGVyZXN0RHJvcGRvd25FbnRyeScsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbnRlcmVzdCA9IHRoaXMucHJvcHMuaW50ZXJlc3Q7XG4gICAgICB2YXIgY2xhc3NOYW1lID0gJ3RleHRjb21wbGV0ZS1pdGVtJztcblxuICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcbiAgICAgICAgY2xhc3NOYW1lICs9ICcgYWN0aXZlJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IGNsYXNzTmFtZX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiAnI0AnICsgaW50ZXJlc3QsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfSwgb25DbGljazogdGhpcy5oYW5kbGVJbnRlcmVzdFNlbGVjdGVkLmJpbmQodGhpcywgaW50ZXJlc3QpfSwgXG4gICAgICAgICAgICBcIkBcIiwgdGhpcy5wcm9wcy5pbnRlcmVzdFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlSW50ZXJlc3RTZWxlY3RlZDogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IElQLkFDVElPTlMuQUREX0lOVEVSRVNULFxuICAgICAgICBldmVudDogSVAuRVZFTlRTLklOVEVSRVNUX0FEREVELFxuICAgICAgICBkYXRhOiBpbnRlcmVzdFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludGVyZXN0UGlja2VyO1xuICB9XG5cbiAgd2luZG93LkludGVyZXN0UGlja2VyID0gSW50ZXJlc3RQaWNrZXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBGb3JtR3JvdXAgPSByZXF1aXJlKCcuL2Zvcm1fZ3JvdXAuanMuanN4Jyk7XG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJbnZpdGVCb3VudHlGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW52aXRlQm91bnR5Rm9ybScsXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IG1vZGVsOiAnaW52aXRlJyB9XG4gICAgfSxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgZXJyb3JzOiB7fSB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZm9ybSh7c3R5bGU6IHt3aWR0aDozMDB9LCBvblN1Ym1pdDogdGhpcy5oYW5kbGVTdWJtaXR9LCBcbiAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuLCBcbiAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgIEZvcm1Hcm91cCh7ZXJyb3I6IHRoaXMuc3RhdGUuZXJyb3JzLnVzZXJuYW1lX29yX2VtYWlsfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGFiZWwoe2NsYXNzTmFtZTogXCJjb250cm9sLWxhYmVsXCJ9LCBcIlVzZXJuYW1lIG9yIGVtYWlsIGFkZHJlc3NcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtuYW1lOiBcImludml0ZVt1c2VybmFtZV9vcl9lbWFpbF1cIiwgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcImZyaWVuZEBleGFtcGxlLmNvbVwiLCBjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sXCJ9KVxuICAgICAgICAgICksIFxuICAgICAgICAgIEZvcm1Hcm91cCh7ZXJyb3I6IHRoaXMuc3RhdGUuZXJyb3JzLm5vdGV9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5sYWJlbChudWxsLCBcIlBlcnNvbmFsIG5vdGVcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRleHRhcmVhKHtuYW1lOiBcImludml0ZVtub3RlXVwiLCBwbGFjZWhvbGRlcjogdGhpcy5wcm9wcy5ub3RlUGxhY2Vob2xkZXIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2xcIn0pXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgRm9ybUdyb3VwKHtlcnJvcjogdGhpcy5zdGF0ZS5lcnJvcnMudGlwX2NlbnRzfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGFiZWwobnVsbCwgXCJMZWF2ZSBhIHRpcFwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImhlbHAtYmxvY2tcIn0sIFwiU3RhcnQgb2ZmIG9uIHRoZSByaWdodCBmb290OyBnZW5lcm9zaXR5IGFsd2F5cyBwYXlzIG9mZi5cIiksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYnRuLWdyb3VwIHRleHQtY2VudGVyXCIsICdkYXRhLXRvZ2dsZSc6IFwiYnV0dG9uc1wiLCBzdHlsZToge3dpZHRoOicxMDAlJ319LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0IGFjdGl2ZVwiLCBzdHlsZToge3dpZHRoOiczNCUnfX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImludml0ZVt0aXBfY2VudHNdXCIsIHZhbHVlOiBcIjEwMDBcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWV9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW4gdGV4dC1jb2luc1wifSksIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1jb2luc1wifSwgXCIxMFwiKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIHN0eWxlOiB7d2lkdGg6JzMzJSd9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiaW52aXRlW3RpcF9jZW50c11cIiwgdmFsdWU6IFwiMTAwMDBcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1hcHAtY29pbiB0ZXh0LWNvaW5zXCJ9KSwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zXCJ9LCBcIjEwMFwiKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIHN0eWxlOiB7d2lkdGg6JzMzJSd9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiaW52aXRlW3RpcF9jZW50c11cIiwgdmFsdWU6IFwiNTAwMDBcIn0pLCBcIiBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW4gdGV4dC1jb2luc1wifSksIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1jb2luc1wifSwgXCI1MDBcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCBuYW1lOiBcImludml0ZVt2aWFfdHlwZV1cIiwgdmFsdWU6IHRoaXMucHJvcHMudmlhX3R5cGV9KSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCBuYW1lOiBcImludml0ZVt2aWFfaWRdXCIsIHZhbHVlOiB0aGlzLnByb3BzLnZpYV9pZH0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9ja1wiLCBzdHlsZToge1wibWFyZ2luLWJvdHRvbVwiOjIwfX0sIFwiU2VuZCBtZXNzYWdlXCIpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgaGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdGhpcy5wcm9wcy51cmwsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgZGF0YTogJChlLnRhcmdldCkuc2VyaWFsaXplKCksXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB0aGlzLnByb3BzLm9uU3VibWl0KGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcbiAgICAgICAgICBpZiAoeGhyLnJlc3BvbnNlSlNPTiAmJiB4aHIucmVzcG9uc2VKU09OLmVycm9ycykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcnMoeGhyLnJlc3BvbnNlSlNPTi5lcnJvcnMpXG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVFcnJvcnM6IGZ1bmN0aW9uKGVycm9ycykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXJyb3JzOiBlcnJvcnN9KVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnZpdGVCb3VudHlGb3JtO1xuICB9XG5cbiAgd2luZG93Lkludml0ZUJvdW50eUZvcm0gPSBJbnZpdGVCb3VudHlGb3JtO1xufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0Q1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cDtcbnZhciBQb3BvdmVyID0gcmVxdWlyZSgnLi9wb3BvdmVyLmpzLmpzeCcpO1xudmFyIEludml0ZUJvdW50eUZvcm0gPSByZXF1aXJlKCcuL2ludml0ZV9ib3VudHlfZm9ybS5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgSW52aXRlRnJpZW5kQm91bnR5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW52aXRlRnJpZW5kQm91bnR5JyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgbW9kYWw6IGZhbHNlLCBpbnZpdGVzOiB0aGlzLnByb3BzLmludml0ZXMgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHQgYnRuLWJsb2NrIGJ0bi1zbVwiLCBocmVmOiBcIiNoZWxwLW1lXCIsIG9uQ2xpY2s6IHRoaXMuY2xpY2t9LCBcIkludml0ZSBhIGZyaWVuZCB0byBoZWxwXCIpLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLmludml0ZXMubGVuZ3RoID4gMCA/IEludml0ZUxpc3Qoe2ludml0ZXM6IHRoaXMuc3RhdGUuaW52aXRlc30pIDogbnVsbCwgXG4gICAgICAgICAgdGhpcy5zdGF0ZS5tb2RhbCA/IHRoaXMucG9wb3ZlcigpIDogbnVsbFxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHBvcG92ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUG9wb3Zlcih7cGxhY2VtZW50OiBcImxlZnRcIiwgcG9zaXRpb25MZWZ0OiAtMzI1LCBwb3NpdGlvblRvcDogLTEyMH0sIFxuICAgICAgICAgIEludml0ZUJvdW50eUZvcm0oe3VybDogdGhpcy5wcm9wcy51cmwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpYV90eXBlOiB0aGlzLnByb3BzLnZpYV90eXBlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWFfaWQ6IHRoaXMucHJvcHMudmlhX2lkLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN1Ym1pdDogdGhpcy5vblN1Ym1pdC5iaW5kKHRoaXMpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlUGxhY2Vob2xkZXI6IFwiSGV5ISBUaGlzIGJvdW50eSBzZWVtcyByaWdodCB1cCB5b3VyIGFsbGV5XCJ9LCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmgyKHtjbGFzc05hbWU6IFwiYWxwaGFcIn0sIFwiQXNrIGEgZnJpZW5kXCIpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXCJLbm93IHNvbWVib2R5IHdobyBjb3VsZCBoZWxwIHdpdGggdGhpcz8gQW55Ym9keSBjYW4gaGVscCBvdXQsIGFsbCB5b3UgbmVlZCB0byBkbyBpcyBhc2suXCIpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGFsOiAhdGhpcy5zdGF0ZS5tb2RhbH0pXG4gICAgfSxcblxuICAgIG9uU3VibWl0OiBmdW5jdGlvbihpbnZpdGUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgIFJlYWN0LmFkZG9ucy51cGRhdGUodGhpcy5zdGF0ZSwge1xuICAgICAgICAgIGludml0ZXM6IHskcHVzaDogW2ludml0ZV0gfSxcbiAgICAgICAgICBtb2RhbDogeyRzZXQ6IGZhbHNlIH1cbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW52aXRlRnJpZW5kQm91bnR5O1xuICB9XG5cbiAgd2luZG93Lkludml0ZUZyaWVuZEJvdW50eSA9IEludml0ZUZyaWVuZEJvdW50eTtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0Q1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cDtcbnZhciBQb3BvdmVyID0gcmVxdWlyZSgnLi9wb3BvdmVyLmpzLmpzeCcpO1xudmFyIEludml0ZUJvdW50eUZvcm0gPSByZXF1aXJlKCcuL2ludml0ZV9ib3VudHlfZm9ybS5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgSW52aXRlRnJpZW5kUHJvZHVjdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludml0ZUZyaWVuZFByb2R1Y3QnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBtb2RhbDogZmFsc2UsIGludml0ZXM6IHRoaXMucHJvcHMuaW52aXRlcyB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSBidG4tYmxvY2tcIiwgc3R5bGU6IHtcIm1hcmdpbi1ib3R0b21cIjoxNn0sIG9uQ2xpY2s6IHRoaXMuY2xpY2t9LCBcIkludml0ZSBhIGZyaWVuZFwiKSwgXG4gICAgICAgICAgdGhpcy5zdGF0ZS5pbnZpdGVzLmxlbmd0aCA+IDAgPyBJbnZpdGVMaXN0KHtpbnZpdGVzOiB0aGlzLnN0YXRlLmludml0ZXN9KSA6IG51bGwsIFxuICAgICAgICAgIHRoaXMuc3RhdGUubW9kYWwgPyB0aGlzLnBvcG92ZXIoKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBwb3BvdmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFBvcG92ZXIoe3BsYWNlbWVudDogXCJsZWZ0XCIsIHBvc2l0aW9uTGVmdDogLTMyNSwgcG9zaXRpb25Ub3A6IC0xMjl9LCBcbiAgICAgICAgICBJbnZpdGVCb3VudHlGb3JtKHt1cmw6IHRoaXMucHJvcHMudXJsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWFfdHlwZTogdGhpcy5wcm9wcy52aWFfdHlwZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlhX2lkOiB0aGlzLnByb3BzLnZpYV9pZCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ6IHRoaXMub25TdWJtaXQuYmluZCh0aGlzKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZVBsYWNlaG9sZGVyOiB0aGlzLnByb3BzLm5vdGVQbGFjZWhvbGRlcn0sIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uaDIoe2NsYXNzOiBcImFscGhhXCJ9LCBcIkFzayBhIGZyaWVuZFwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFwiS25vdyBzb21lYm9keSB3aG8gY291bGQgaGVscCB3aXRoIHRoaXM/IEFueWJvZHkgY2FuIGhlbHAgb3V0LCBhbGwgeW91IG5lZWQgdG8gZG8gaXMgYXNrLlwiKVxuXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGFsOiAhdGhpcy5zdGF0ZS5tb2RhbH0pXG4gICAgfSxcblxuICAgIG9uU3VibWl0OiBmdW5jdGlvbihpbnZpdGUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgIFJlYWN0LmFkZG9ucy51cGRhdGUodGhpcy5zdGF0ZSwge1xuICAgICAgICAgIGludml0ZXM6IHskcHVzaDogW2ludml0ZV0gfSxcbiAgICAgICAgICBtb2RhbDogeyRzZXQ6IGZhbHNlIH1cbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW52aXRlRnJpZW5kUHJvZHVjdDtcbiAgfVxuXG4gIHdpbmRvdy5JbnZpdGVGcmllbmRQcm9kdWN0ID0gSW52aXRlRnJpZW5kUHJvZHVjdDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0Q1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cDtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgSW52aXRlTGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludml0ZUxpc3QnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaW52aXRlTm9kZXMgPSBfLm1hcCh0aGlzLnByb3BzLmludml0ZXMsIGZ1bmN0aW9uKGludml0ZSkge1xuICAgICAgICByZXR1cm4gSW52aXRlRW50cnkoe2tleTogaW52aXRlLmlkLCBpZDogaW52aXRlLmlkLCBpbnZpdGVlX2VtYWlsOiBpbnZpdGUuaW52aXRlZV9lbWFpbCwgaW52aXRlZTogaW52aXRlLmludml0ZWV9KVxuICAgICAgfSlcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbCBwYW5lbC1kZWZhdWx0XCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJsaXN0LWdyb3VwIGxpc3QtZ3JvdXAtYnJlYWtvdXQgc21hbGwgb21lZ2FcIn0sIFxuICAgICAgICAgICAgUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiBcImludml0ZVwifSwgXG4gICAgICAgICAgICAgIGludml0ZU5vZGVzXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcbiAgfSk7XG5cbiAgdmFyIEludml0ZUVudHJ5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW52aXRlRW50cnknLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJsaXN0LWdyb3VwLWl0ZW1cIiwga2V5OiB0aGlzLnByb3BzLmlkfSwgXG4gICAgICAgIHRoaXMubGFiZWwoKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGxhYmVsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLmludml0ZWUpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKG51bGwsIFwiSW52aXRlZCBcIiwgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMuaW52aXRlZS51cmx9LCBcIkBcIiwgdGhpcy5wcm9wcy5pbnZpdGVlLnVzZXJuYW1lKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3BhbihudWxsLCBcIkVtYWlsZWQgXCIsIHRoaXMucHJvcHMuaW52aXRlZV9lbWFpbClcbiAgICAgIH1cblxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnZpdGVMaXN0O1xuICB9XG5cbiAgd2luZG93Lkludml0ZUxpc3QgPSBJbnZpdGVMaXN0O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgSm9pblRlYW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdKb2luVGVhbScsXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBjb3VudDogdGhpcy5wcm9wcy5jb3VudCxcbiAgICAgICAgaXNfbWVtYmVyOiB0aGlzLnByb3BzLmlzX21lbWJlclxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidG9nZ2xlciB0b2dnbGVyLXNtXCJ9LCBcbiAgICAgICAgICB0aGlzLmxhYmVsKCksIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0b2dnbGVyLWJhZGdlXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB0aGlzLnByb3BzLmpvaW5fcGF0aH0sIHRoaXMuc3RhdGUuY291bnQpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGxpc3RlbkZvckpvaW46IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuXG4gICAgICAkKG5vZGUpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKCFhcHAuY3VycmVudFVzZXIoKSkge1xuICAgICAgICAgIHJldHVybiBhcHAucmVkaXJlY3RUbygnL2xvZ2luJylcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgJChkb2N1bWVudCkuc2Nyb2xsKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgJChub2RlKS5wb3BvdmVyKCdoaWRlJyk7XG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBsaXN0ZW5Gb3JDaGFuZ2VzOiBmdW5jdGlvbihiaW9FZGl0b3IpIHtcbiAgICAgIHZhciBqb2luQnV0dG9uID0gJCgnI2pvaW4taW50cm8tYnV0dG9uJylcbiAgICAgIHZhciBzdGFydGluZ1ZhbCA9IGJpb0VkaXRvci52YWwoKVxuXG4gICAgICBpZiAoc3RhcnRpbmdWYWwgJiYgc3RhcnRpbmdWYWwubGVuZ3RoID49IDIpIHtcbiAgICAgICAgam9pbkJ1dHRvbi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKVxuICAgICAgfVxuXG4gICAgICBiaW9FZGl0b3Iub24oJ2tleXVwJywgZnVuY3Rpb24gdGV4dEVudGVyZWQoZSkge1xuICAgICAgICB2YXIgdmFsID0gYmlvRWRpdG9yLnZhbCgpLnRyaW0oKVxuXG4gICAgICAgIGlmICh2YWwubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICBqb2luQnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpXG4gICAgICAgIH0gZWxzZSBpZiAodmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICBqb2luQnV0dG9uLmFkZENsYXNzKCdkaXNhYmxlZCcpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGxhYmVsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmlzX21lbWJlcikge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwidG9nZ2xlci1idG4gYnRuIGJ0bi1cIiArIHRoaXMuYnV0dG9uKCksICdkYXRhLXRvZ2dsZSc6IFwicG9wb3ZlclwiLCBvbkNsaWNrOiB0aGlzLmNsaWNrKCl9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLXVzZXItdW5mb2xsb3dcIiwgc3R5bGU6IHsnbWFyZ2luLXJpZ2h0JzogJzVweCcsfX0pLCBcbiAgICAgICAgICAgIFwiTGVhdmUgVGVhbVwiXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwidG9nZ2xlci1idG4gYnRuIGJ0bi1cIiArIHRoaXMuYnV0dG9uKCksICdkYXRhLXRvZ2dsZSc6IFwicG9wb3ZlclwiLCBvbkNsaWNrOiB0aGlzLmNsaWNrKCksIFxuICAgICAgICAgICAgcm9sZTogXCJidXR0b25cIiwgXG4gICAgICAgICAgICBpZDogXCJqcy1qb2luLXBvcG92ZXJcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLXVzZXItZm9sbG93XCIsIHN0eWxlOiB7J21hcmdpbi1yaWdodCc6ICc1cHgnfX0pLCBcbiAgICAgICAgICBcIkpvaW4gVGVhbVwiXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgYnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmlzX21lbWJlcikge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tZW1iZXJzaGlwICYmIHRoaXMucHJvcHMubWVtYmVyc2hpcC5jb3JlX3RlYW0pIHtcbiAgICAgICAgICByZXR1cm4gJ2RlZmF1bHQgZGlzYWJsZWQnXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICdkZWZhdWx0IGluYWN0aXZlJ1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAncHJpbWFyeSdcbiAgICB9LFxuXG4gICAgY2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuaXNfbWVtYmVyID8gdGhpcy5vbkxlYXZlIDogdGhpcy5vbkpvaW5cbiAgICB9LFxuXG4gICAgaGFuZGxlSm9pbk9yTGVhdmU6IGZ1bmN0aW9uKHVybCwgbmV3U3RhdGUsIG1ldGhvZCwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHRoaXMuc3RhdGVcbiAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpXG5cbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpXG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbihqcXhociwgc3RhdHVzKSB7XG4gICAgICAgICAgc2VsZi5zZXRTdGF0ZShjdXJyZW50U3RhdGUpXG4gICAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKHN0YXR1cykpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcblxuICAgIG9uSm9pbjogZnVuY3Rpb24oZSkge1xuICAgICAgdGhpcy5oYW5kbGVKb2luT3JMZWF2ZShcbiAgICAgICAgdGhpcy5wcm9wcy5qb2luX3BhdGgsXG4gICAgICAgIHsgY291bnQ6ICh0aGlzLnN0YXRlLmNvdW50ICsgMSksIGlzX21lbWJlcjogdHJ1ZSB9LFxuICAgICAgICAnUE9TVCcsXG4gICAgICAgIGZ1bmN0aW9uIGpvaW5lZChlcnIsIGRhdGEpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBwcm9kdWN0ID0gYXBwLmN1cnJlbnRBbmFseXRpY3NQcm9kdWN0KClcbiAgICAgICAgICBhbmFseXRpY3MudHJhY2soJ3Byb2R1Y3QudGVhbS5qb2luZWQnLCBwcm9kdWN0KVxuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICAkKCcjZWRpdC1tZW1iZXJzaGlwLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcblxuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogJ2FkZFBlcnNvbicsXG4gICAgICAgIGRhdGE6IHsgdXNlcjogdGhpcy5wcm9wcy5tZW1iZXJzaGlwIH0sXG4gICAgICAgIGV2ZW50OiAncGVvcGxlOmNoYW5nZSdcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbkxlYXZlOiBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5tZW1iZXJzaGlwICYmIHRoaXMucHJvcHMubWVtYmVyc2hpcC5jb3JlX3RlYW0pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGFuZGxlSm9pbk9yTGVhdmUoXG4gICAgICAgIHRoaXMucHJvcHMubGVhdmVfcGF0aCxcbiAgICAgICAgeyBjb3VudDogKHRoaXMuc3RhdGUuY291bnQgLSAxKSAsIGlzX21lbWJlcjogZmFsc2UgfSxcbiAgICAgICAgJ0RFTEVURScsXG4gICAgICAgIGZ1bmN0aW9uIGxlZnQoZXJyLCBkYXRhKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcHJvZHVjdCA9IGFwcC5jdXJyZW50QW5hbHl0aWNzUHJvZHVjdCgpXG4gICAgICAgICAgYW5hbHl0aWNzLnRyYWNrKCdwcm9kdWN0LnRlYW0ubGVmdCcsIHByb2R1Y3QpXG4gICAgICAgIH1cbiAgICAgIClcblxuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogJ3JlbW92ZVBlcnNvbicsXG4gICAgICAgIGRhdGE6IHsgdXNlcjogdGhpcy5wcm9wcy5tZW1iZXJzaGlwLnVzZXIgfSxcbiAgICAgICAgZXZlbnQ6ICdwZW9wbGU6Y2hhbmdlJ1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEpvaW5UZWFtO1xuICB9XG5cbiAgd2luZG93LkpvaW5UZWFtID0gSm9pblRlYW07XG59KSgpO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIGlzTWVtYmVyT25saW5lID0gZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgcmV0dXJuIG1vbWVudChtZW1iZXIubGFzdF9vbmxpbmUpLmlzQWZ0ZXIobW9tZW50KCkuc3VidHJhY3QoJ2hvdXInLCAxKSlcbiAgfVxuXG4gIHZhciBpc01lbWJlclJlY2VudGx5QWN0aXZlID0gZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgcmV0dXJuIG1vbWVudChtZW1iZXIubGFzdF9vbmxpbmUpLmlzQWZ0ZXIobW9tZW50KCkuc3VidHJhY3QoJ21vbnRoJywgMSkpXG4gIH1cblxuICB2YXIgTUVNQkVSX1ZJRVdfUkVGUkVTSF9QRVJJT0QgPSA2MCAqIDEwMDA7IC8vIDEgbWludXRlXG5cbiAgdmFyIE1lbWJlcnNWaWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTWVtYmVyc1ZpZXcnLFxuXG4gICAgIGxvYWRNZW1iZXJzRnJvbVNlcnZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHRoaXMucHJvcHMudXJsLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBtaW1lVHlwZTogJ3RleHRQbGFpbicsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgbWVtYmVycyA9IF8ucmVkdWNlKGRhdGEsIGZ1bmN0aW9uKG1lbW8sIG1lbWJlcikge1xuICAgICAgICAgICAgbWVtb1ttZW1iZXIuaWRdID0gbWVtYmVyXG4gICAgICAgICAgICBtZW1vW21lbWJlci5pZF0uaXNXYXRjaGVyID0gdHJ1ZVxuICAgICAgICAgICAgcmV0dXJuIG1lbW9cbiAgICAgICAgICB9LCB7fSlcblxuICAgICAgICAgIHRoaXMuYWRkTWVtYmVycyhtZW1iZXJzKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBsb2FkTWVtYmVyc0Zyb21DaGFubmVsOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucHJvcHMuY2hhbm5lbC5iaW5kKCdwdXNoZXI6c3Vic2NyaXB0aW9uX3N1Y2NlZWRlZCcsXG4gICAgICAgIF8uYmluZChcbiAgICAgICAgICBmdW5jdGlvbihtZW1iZXJzKSB7XG4gICAgICAgICAgICBtZW1iZXJzLmVhY2goXy5iaW5kKGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgICB0aGlzLmFkZE1lbWJlcihtZW1iZXIuaWQsIG1lbWJlci5pbmZvKVxuICAgICAgICAgICAgfSwgdGhpcykpXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0aGlzXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1lbWJlcnM6IHt9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubG9hZE1lbWJlcnNGcm9tQ2hhbm5lbCgpXG5cbiAgICAgIHRoaXMucHJvcHMuY2hhbm5lbC5iaW5kKFxuICAgICAgICAncHVzaGVyOm1lbWJlcl9hZGRlZCcsXG4gICAgICAgIF8uYmluZCh0aGlzLmFkZE1lbWJlckZyb21QdXNoZXIsIHRoaXMpXG4gICAgICApXG5cbiAgICAgIHRoaXMucHJvcHMuY2hhbm5lbC5iaW5kKFxuICAgICAgICAncHVzaGVyOm1lbWJlcl9yZW1vdmVkJyxcbiAgICAgICAgXy5iaW5kKHRoaXMucmVtb3ZlTWVtYmVyRnJvbVB1c2hlciwgdGhpcylcbiAgICAgIClcblxuICAgICAgZXZlcnkoTUVNQkVSX1ZJRVdfUkVGUkVTSF9QRVJJT0QsIF8uYmluZCh0aGlzLmxvYWRNZW1iZXJzRnJvbVNlcnZlciwgdGhpcykpXG4gICAgfSxcblxuICAgIHJlbmRlck1lbWJlcjogZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICB2YXIgaXNPbmxpbmUgPSBpc01lbWJlck9ubGluZShtZW1iZXIpXG4gICAgICB2YXIgY2xhc3NlcyA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldCh7XG4gICAgICAgICd0ZXh0LXdlaWdodC1ib2xkIHRleHQtc3VjY2Vzcyc6IGlzT25saW5lLFxuICAgICAgICAndGV4dC1lbXBoYXNpcyc6ICFpc09ubGluZVxuICAgICAgfSlcblxuICAgICAgdmFyIG1hcmtlclxuICAgICAgaWYoaXNPbmxpbmUpIHtcbiAgICAgICAgbWFya2VyID0gKFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaW5kaWNhdG9yIGluZGljYXRvci1zdWNjZXNzXCJ9LCBcIsKgXCIpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFya2VyID0gKFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaW5kaWNhdG9yIGluZGljYXRvci1kZWZhdWx0XCJ9LCBcIsKgXCIpKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtrZXk6IG1lbWJlci5pZH0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IGNsYXNzZXMsIGhyZWY6IG1lbWJlci51cmx9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwdWxsLXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgIG1hcmtlclxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtjbGFzc05hbWU6IFwiYXZhdGFyXCIsIHNyYzogbWVtYmVyLmF2YXRhcl91cmwsIHdpZHRoOiBcIjE2XCIsIGhlaWdodDogXCIxNlwiLCBhbHQ6IG1lbWJlci51c2VybmFtZSwgc3R5bGU6IHttYXJnaW5SaWdodDogMTB9fSksIFxuICAgICAgICAgICAgbWVtYmVyLnVzZXJuYW1lXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwtZ3JvdXBcIiwgaWQ6IFwiYWNjb3JkaW9uXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwgcGFuZWwtZGVmYXVsdFwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwtaGVhZGluZ1wifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5oNih7Y2xhc3NOYW1lOiBcInBhbmVsLXRpdGxlXCJ9LCBcIk9ubGluZVwiKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwtYm9keSBzbWFsbFwifSwgXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIF8ubWFwKHRoaXMub25saW5lTWVtYmVycygpLCB0aGlzLnJlbmRlck1lbWJlcilcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbC1oZWFkaW5nXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoeydkYXRhLXRvZ2dsZSc6IFwiY29sbGFwc2VcIiwgJ2RhdGEtcGFyZW50JzogXCIjYWNjb3JkaW9uXCIsIGhyZWY6IFwiI2NvbGxhcHNlUmVjZW50XCIsIGNsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jaGV2cm9uLXVwIHB1bGwtcmlnaHRcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDYoe2NsYXNzTmFtZTogXCJwYW5lbC10aXRsZVwifSwgXCJSZWNlbnRseSBBY3RpdmVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtpZDogXCJjb2xsYXBzZVJlY2VudFwiLCBjbGFzc05hbWU6IFwicGFuZWwtY29sbGFwc2UgY29sbGFwc2UgaW5cIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwtYm9keSBzbWFsbFwifSwgXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIF8ubWFwKHRoaXMucmVjZW50bHlBY3RpdmVNZW1iZXJzKCksIHRoaXMucmVuZGVyTWVtYmVyKVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBhZGRNZW1iZXJzOiBmdW5jdGlvbihtZW1iZXJzKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbWVtYmVyczogXy5leHRlbmQodGhpcy5zdGF0ZS5tZW1iZXJzLCBtZW1iZXJzKVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgYWRkTWVtYmVyRnJvbVB1c2hlcjogZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICBtZW1iZXIuaW5mby5sYXN0X29ubGluZSA9IChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXG4gICAgICB0aGlzLmFkZE1lbWJlcihtZW1iZXIuaWQsIG1lbWJlci5pbmZvKVxuICAgIH0sXG5cbiAgICByZW1vdmVNZW1iZXJGcm9tUHVzaGVyOiBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgIHRoaXMubWVtYmVyV2VudE9mZmxpbmUobWVtYmVyLmlkKVxuICAgIH0sXG5cbiAgICBhZGRNZW1iZXI6IGZ1bmN0aW9uKGlkLCBtZW1iZXIpIHtcbiAgICAgIHZhciB1cGRhdGUgPSB7fVxuICAgICAgdXBkYXRlW2lkXSA9IHsnJHNldCc6IG1lbWJlcn1cbiAgICAgIHRoaXMuc2V0U3RhdGUoUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB7bWVtYmVyczogdXBkYXRlfSkpXG4gICAgfSxcblxuICAgIG1lbWJlcldlbnRPZmZsaW5lOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIG1lbWJlciA9IHRoaXMuc3RhdGUubWVtYmVyc1tpZF1cbiAgICAgIGlmKG1lbWJlci5pc1dhdGNoZXIpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbWVtYmVycyA9IHRoaXMuc3RhdGUubWVtYmVycztcbiAgICAgICAgZGVsZXRlIG1lbWJlcnNbaWRdXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21lbWJlcnM6IG1lbWJlcnN9KVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBvbmxpbmVNZW1iZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLmNoYWluKHRoaXMuc3RhdGUubWVtYmVycykudmFsdWVzKCkuZmlsdGVyKGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICByZXR1cm4gaXNNZW1iZXJPbmxpbmUobWVtYmVyKVxuICAgICAgfSkuc29ydEJ5KGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICByZXR1cm4gbWVtYmVyLnVzZXJuYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgIH0pLnZhbHVlKClcbiAgICB9LFxuXG4gICAgcmVjZW50bHlBY3RpdmVNZW1iZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLmNoYWluKHRoaXMuc3RhdGUubWVtYmVycykudmFsdWVzKCkuZmlsdGVyKGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICByZXR1cm4gIWlzTWVtYmVyT25saW5lKG1lbWJlcikgJiYgaXNNZW1iZXJSZWNlbnRseUFjdGl2ZShtZW1iZXIpXG4gICAgICB9KS5zb3J0QnkoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgIHJldHVybiBtZW1iZXIudXNlcm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgfSkudmFsdWUoKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBNZW1iZXJzVmlldztcbiAgfVxuXG4gIHdpbmRvdy5NZW1iZXJzVmlldyA9IE1lbWJlcnNWaWV3O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBUaXRsZU5vdGlmaWNhdGlvbnNDb3VudCA9IHJlcXVpcmUoJy4vdGl0bGVfbm90aWZpY2F0aW9uc19jb3VudC5qcy5qc3gnKTtcbnZhciBEcm9wZG93bk5ld3NGZWVkVG9nZ2xlciA9IHJlcXVpcmUoJy4vZHJvcGRvd25fbmV3c19mZWVkX3RvZ2dsZXIuanMuanN4Jyk7XG52YXIgRHJvcGRvd25OZXdzRmVlZCA9IHJlcXVpcmUoJy4vZHJvcGRvd25fbmV3c19mZWVkLmpzLmpzeCcpO1xudmFyIENoYXROb3RpZmljYXRpb25zVG9nZ2xlciA9IHJlcXVpcmUoJy4vY2hhdF9ub3RpZmljYXRpb25zX3RvZ2dsZXIuanMuanN4Jyk7XG52YXIgQ2hhdE5vdGlmaWNhdGlvbnMgPSByZXF1aXJlKCcuL2NoYXRfbm90aWZpY2F0aW9ucy5qcy5qc3gnKTtcbnZhciBVc2VyTmF2YmFyRHJvcGRvd24gPSByZXF1aXJlKCcuL3VzZXJfbmF2YmFyX2Ryb3Bkb3duLmpzLmpzeCcpO1xudmFyIEF2YXRhciA9IHJlcXVpcmUoJy4vYXZhdGFyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBOYXZiYXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdOYXZiYXInLFxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1c2VyOiBhcHAuY3VycmVudFVzZXIoKS5hdHRyaWJ1dGVzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVzZXIgPSB0aGlzLnByb3BzLmN1cnJlbnRVc2VyO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJuYXYgbmF2YmFyLW5hdlwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgVGl0bGVOb3RpZmljYXRpb25zQ291bnQobnVsbClcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIERyb3Bkb3duTmV3c0ZlZWRUb2dnbGVyKHtcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3M6IFwiaWNvbi1iZWxsXCIsIFxuICAgICAgICAgICAgICAgIGhyZWY6IFwiI3N0b3JpZXNcIiwgXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiTm90aWZpY2F0aW9uc1wifSksIFxuXG4gICAgICAgICAgICBEcm9wZG93bk5ld3NGZWVkKHtcbiAgICAgICAgICAgICAgICB1cmw6IHRoaXMucHJvcHMubmV3c0ZlZWRQYXRoLCBcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lLCBcbiAgICAgICAgICAgICAgICBlZGl0VXNlclBhdGg6IHRoaXMucHJvcHMuZWRpdFVzZXJQYXRofSlcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIENoYXROb3RpZmljYXRpb25zVG9nZ2xlcih7XG4gICAgICAgICAgICAgIGljb25DbGFzczogXCJpY29uLWJ1YmJsZXNcIiwgXG4gICAgICAgICAgICAgIGhyZWY6IFwiI25vdGlmaWNhdGlvbnNcIiwgXG4gICAgICAgICAgICAgIGxhYmVsOiBcIkNoYXRcIn0pLCBcblxuICAgICAgICAgICAgQ2hhdE5vdGlmaWNhdGlvbnMoe1xuICAgICAgICAgICAgICAgIHVybDogdGhpcy5wcm9wcy5jaGF0UGF0aCwgXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMucHJvcHMudXNlci51c2VybmFtZX1cbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgY2xhc3NOYW1lOiBcImRyb3Bkb3duLXRvZ2dsZVwiLCAnZGF0YS10b2dnbGUnOiBcImRyb3Bkb3duXCJ9LCBcbiAgICAgICAgICAgICAgQXZhdGFyKHt1c2VyOiB0aGlzLnByb3BzLnVzZXJ9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidmlzaWJsZS14cy1pbmxpbmVcIiwgc3R5bGU6IHsgJ21hcmdpbi1sZWZ0JzogJzVweCd9fSwgXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICB0aGlzLnRyYW5zZmVyUHJvcHNUbyhVc2VyTmF2YmFyRHJvcGRvd24obnVsbCkpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBOYXZiYXI7XG4gIH1cblxuICB3aW5kb3cuTmF2YmFyID0gTmF2YmFyO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbm90aWZpY2F0aW9uX3ByZWZlcmVuY2VzX2Ryb3Bkb3duX3N0b3JlJyk7XG52YXIgQXZhdGFyID0gcmVxdWlyZSgnLi9hdmF0YXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEQgPSBDT05TVEFOVFMuTk9USUZJQ0FUSU9OX1BSRUZFUkVOQ0VTX0RST1BET1dOO1xuXG4gIHZhciBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93bicsXG4gICAgY2hldnJvbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5jaGV2cm9uKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jaGV2cm9uLWRvd25cIn0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe3N0eWxlOiB7ICdtYXJnaW4tcmlnaHQnOiAnN3B4JywgJ21hcmdpbi1sZWZ0JzogJzdweCd9fSlcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIE5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd25TdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmhhbmRsZVVwZGF0ZSk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9kdWN0V2F0Y2hlcnNDb3VudDogdGhpcy5wcm9wcy5wcm9kdWN0V2F0Y2hlcnNDb3VudCxcbiAgICAgICAgc2VsZWN0ZWQ6IHRoaXMucHJvcHMud2F0Y2hpbmdTdGF0ZSxcbiAgICAgICAgY2hldnJvbjogZmFsc2VcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGhpZGVDaGV2cm9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBjaGV2cm9uOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidG9nZ2xlciB0b2dnbGVyLXNtIGJ0bi1ncm91cFwiLCBvbk1vdXNlT3ZlcjogdGhpcy5zaG93Q2hldnJvbiwgb25Nb3VzZU91dDogdGhpcy5oaWRlQ2hldnJvbn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLmJ1dHRvbkNsYXNzZXModHJ1ZSksIFxuICAgICAgICAgICAgICAnZGF0YS10b2dnbGUnOiBcImRyb3Bkb3duXCIsIFxuICAgICAgICAgICAgICBzdHlsZTogeyAnbWFyZ2luLWJvdHRvbSc6ICcxM3B4J319LCBcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uU3RhdGUoKSwgXG4gICAgICAgICAgICB0aGlzLmNoZXZyb24oKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0b2dnbGVyLWJhZGdlXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLCBcbiAgICAgICAgICAgICAgICBocmVmOiB0aGlzLnByb3BzLnByb2R1Y3RXYXRjaGVyc1BhdGgsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7IG9wYWNpdHk6ICcwLjUnLCAnYm9yZGVyLXRvcC1yaWdodC1yYWRpdXMnOiAnMnB4JywgJ2JvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzJzogJzJweCd9fSwgXG4gICAgICAgICAgICAgIHRoaXMuc3RhdGUucHJvZHVjdFdhdGNoZXJzQ291bnRcbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe1xuICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiZHJvcGRvd24tbWVudSBkcm9wZG93bi1tZW51LXJpZ2h0XCIsIFxuICAgICAgICAgICAgICByb2xlOiBcIm1lbnVcIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAnYXV0bycsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICczNXB4JywgJ3BhZGRpbmctdG9wJzogMH19LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7XG4gICAgICAgICAgICAgICAgcm9sZTogXCJwcmVzZW50YXRpb25cIiwgXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImRyb3Bkb3duLWhlYWRlclwiLCBcbiAgICAgICAgICAgICAgICBzdHlsZTogeyBjb2xvcjogJyNhNmE2YTYnLCAnYmFja2dyb3VuZC1jb2xvcic6ICcjZjNmM2YzJ319LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcIkZvbGxvd2luZyBQcmVmZXJlbmNlc1wiKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7cm9sZTogXCJwcmVzZW50YXRpb25cIiwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9LCBjbGFzc05hbWU6IHRoaXMuc2VsZWN0ZWRDbGFzcygnbm90IHdhdGNoaW5nJyl9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe3JvbGU6IFwibWVudWl0ZW1cIiwgdGFiSW5kZXg6IFwiLTFcIiwgb25DbGljazogdGhpcy51cGRhdGVQcmVmZXJlbmNlLmJpbmQodGhpcywgJ25vdCB3YXRjaGluZycsIHRoaXMucHJvcHMucHJvZHVjdFVuZm9sbG93UGF0aCl9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcIk5vdCBmb2xsb3dpbmdcIilcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFxuICAgICAgICAgICAgICAgICAgXCJSZWNlaXZlIG5vdGlmaWNhdGlvbnMgd2hlbiB5b3UgYXJlIEBtZW50aW9uZWRcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7cm9sZTogXCJwcmVzZW50YXRpb25cIiwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9LCBjbGFzc05hbWU6IHRoaXMuc2VsZWN0ZWRDbGFzcygnd2F0Y2hpbmcnKX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7cm9sZTogXCJtZW51aXRlbVwiLCB0YWJJbmRleDogXCItMVwiLCBvbkNsaWNrOiB0aGlzLnVwZGF0ZVByZWZlcmVuY2UuYmluZCh0aGlzLCAnd2F0Y2hpbmcnLCB0aGlzLnByb3BzLnByb2R1Y3RGb2xsb3dQYXRoKX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFwiRm9sbG93IGFubm91bmNlbWVudHMgb25seVwiKVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiUmVjZWl2ZSBub3RpZmljYXRpb25zIHdoZW4gdGhlcmUgYXJlIG5ldyBibG9nIHBvc3RzXCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkoe3JvbGU6IFwicHJlc2VudGF0aW9uXCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfSwgY2xhc3NOYW1lOiB0aGlzLnNlbGVjdGVkQ2xhc3MoJ3N1YnNjcmliZWQnKX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7cm9sZTogXCJtZW51aXRlbVwiLCB0YWJJbmRleDogXCItMVwiLCBvbkNsaWNrOiB0aGlzLnVwZGF0ZVByZWZlcmVuY2UuYmluZCh0aGlzLCAnc3Vic2NyaWJlZCcsIHRoaXMucHJvcHMucHJvZHVjdFN1YnNjcmliZVBhdGgpfSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXCJGb2xsb3dcIilcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXG4gICAgICAgICAgICAgICAgICBcIlJlY2VpdmUgbm90aWZpY2F0aW9ucyB3aGVuIHRoZXJlIGFyZSBuZXcgYmxvZyBwb3N0cywgZGlzY3Vzc2lvbnMsIGFuZCBjaGF0IG1lc3NhZ2VzXCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHNob3dDaGV2cm9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBjaGV2cm9uOiB0cnVlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzZWxlY3RlZDogTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93blN0b3JlLmdldFNlbGVjdGVkKClcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBidXR0b25TdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgY2FzZSAnc3Vic2NyaWJlZCc6XG4gICAgICAgICAgcmV0dXJuICdGb2xsb3dpbmcnO1xuICAgICAgICBjYXNlICd3YXRjaGluZyc6XG4gICAgICAgICAgcmV0dXJuICdGb2xsb3dpbmcgYW5ub3VuY2VtZW50cyBvbmx5JztcbiAgICAgICAgY2FzZSAnbm90IHdhdGNoaW5nJzpcbiAgICAgICAgICByZXR1cm4gJ0ZvbGxvdyc7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGJ1dHRvbkNsYXNzZXM6IGZ1bmN0aW9uKGRyb3Bkb3duVG9nZ2xlKSB7XG4gICAgICByZXR1cm4gUmVhY3QuYWRkb25zLmNsYXNzU2V0KHtcbiAgICAgICAgJ2J0bic6IHRydWUsXG4gICAgICAgICdidG4tcHJpbWFyeSc6ICh0aGlzLnN0YXRlLnNlbGVjdGVkID09PSAnbm90IHdhdGNoaW5nJyksXG4gICAgICAgICdidG4tZGVmYXVsdCc6ICh0aGlzLnN0YXRlLnNlbGVjdGVkICE9PSAnbm90IHdhdGNoaW5nJyksXG4gICAgICAgICdidG4tc20nOiB0cnVlLFxuICAgICAgICAnZHJvcGRvd24tdG9nZ2xlJzogZHJvcGRvd25Ub2dnbGVcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHNlbGVjdGVkQ2xhc3M6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQgPT09IG9wdGlvbikge1xuICAgICAgICByZXR1cm4gXCJhY3RpdmVcIjtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlUHJlZmVyZW5jZTogZnVuY3Rpb24oaXRlbSwgcGF0aCkge1xuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGV2ZW50OiBELkVWRU5UUy5TRUxFQ1RFRF9VUERBVEVELFxuICAgICAgICBhY3Rpb246IEQuQUNUSU9OUy5VUERBVEVfU0VMRUNURUQsXG4gICAgICAgIGRhdGE6IHsgaXRlbTogaXRlbSwgcGF0aDogcGF0aCB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93bjtcbiAgfVxuXG4gIHdpbmRvdy5Ob3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duID0gTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93bjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgTnVtYmVySW5wdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdOdW1iZXJJbnB1dCcsXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBhbW91bnQ6IHRoaXMucHJvcHMuc3RhcnRpbmdBbW91bnQsXG4gICAgICAgIGVkaXRhYmxlOiB0aGlzLnByb3BzLmFsd2F5c0VkaXRhYmxlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5saXN0ZW5Gb3JDaGFuZ2VzKHRoaXMucmVmcy5pbnB1dEZpZWxkICYmIHRoaXMucmVmcy5pbnB1dEZpZWxkLmdldERPTU5vZGUoKSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudERpZE1vdW50KCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0YWJsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lZGl0YWJsZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy51bmVkaXRhYmxlKCk7XG4gICAgfSxcblxuICAgIGVkaXRhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cFwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtuYW1lOiB0aGlzLnByb3BzLm5hbWUsIHJlZjogXCJpbnB1dEZpZWxkXCIsIHR5cGU6IFwibnVtYmVyXCIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2xcIiwgbWluOiBcIjBcIiwgc3RlcDogXCIwLjFcIiwgZGVmYXVsdFZhbHVlOiB0aGlzLnN0YXRlLmFtb3VudH0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWFkZG9uXCJ9LCBcIiVcIilcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdW5lZGl0YWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQoJyNlZGl0LWNvbnRyYWN0LScgKyB0aGlzLnByb3BzLnVzZXIudXNlcm5hbWUpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgJChzZWxmLnByb3BzLmNvbmZpcm1CdXR0b24pLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgJCh0aGlzKS50ZXh0KCkgPT09ICdFZGl0JyA/ICQodGhpcykudGV4dCgnQ2FuY2VsJykgOiAkKHRoaXMpLnRleHQoJ0VkaXQnKTtcbiAgICAgICAgc2VsZi5zZXRTdGF0ZSh7IGVkaXRhYmxlOiAhc2VsZi5zdGF0ZS5lZGl0YWJsZSB9KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKFJlYWN0LkRPTS5zcGFuKG51bGwsIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgdGhpcy5wcm9wcy5zdGFydGluZ0Ftb3VudCArICclJyksIFwiIHRpcCB3aGVuIGNvaW5zIGFyZSBtaW50ZWRcIikpO1xuICAgIH0sXG5cbiAgICBsaXN0ZW5Gb3JDaGFuZ2VzOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAkKG5vZGUpLm9uKCdjaGFuZ2Uga2V5ZG93bicsIHRoaXMuaGFuZGxlQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgY29uZmlybUxpbmsgPSAkKHRoaXMucHJvcHMuY29uZmlybUJ1dHRvbik7XG5cbiAgICAgIGlmICghXy5pc0VtcHR5KGNvbmZpcm1MaW5rKSkge1xuICAgICAgICB2YXIgbm9kZSA9ICQodGhpcy5yZWZzLmlucHV0RmllbGQuZ2V0RE9NTm9kZSgpKTtcblxuICAgICAgICBpZiAobm9kZSAmJiBub2RlLnZhbCgpICE9PSB0aGlzLnByb3BzLnN0YXJ0aW5nQW1vdW50KSB7XG4gICAgICAgICAgY29uZmlybUxpbmsuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICBjb25maXJtTGluay5vZmYoJ2NsaWNrJyk7XG4gICAgICAgICAgY29uZmlybUxpbmsub24oJ2NsaWNrJywgeyBub2RlOiBub2RlLCBzZWxmOiB0aGlzIH0sIHRoaXMuY29uZmlybSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uZmlybUxpbmsuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICAgIGNvbmZpcm1MaW5rLm9mZignY2xpY2snKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb25maXJtOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgbm9kZSA9IGUuZGF0YS5ub2RlO1xuICAgICAgdmFyIHNlbGYgPSBlLmRhdGEuc2VsZjtcbiAgICAgIHZhciBvYmogPSB7XG4gICAgICAgIGNvbnRyYWN0OiB7XG4gICAgICAgICAgYW1vdW50OiBub2RlLnZhbCgpLFxuICAgICAgICAgIHVzZXI6IHRoaXMucHJvcHMudXNlci5pZFxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBfLmRlYm91bmNlKCQuYWpheCh7XG4gICAgICAgIHVybDogc2VsZi5wcm9wcy51cGRhdGVQYXRoLFxuICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgIGRhdGE6IG9iaixcbiAgICAgICAgc3VjY2Vzczogc2VsZi5oYW5kbGVTdWNjZXNzLFxuICAgICAgICBlcnJvcjogc2VsZi5oYW5kbGVFcnJvclxuICAgICAgfSksIDMwMCk7XG4gICAgfSxcblxuICAgIGhhbmRsZVN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgfSxcblxuICAgIGhhbmRsZUVycm9yOiBmdW5jdGlvbihqcXhociwgc3RhdHVzKSB7XG4gICAgICBjb25zb2xlLmVycm9yKHN0YXR1cyk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE51bWJlcklucHV0O1xuICB9XG5cbiAgd2luZG93Lk51bWJlcklucHV0ID0gTnVtYmVySW5wdXQ7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBQZW9wbGVTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9wZW9wbGVfc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgUGVvcGxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnUGVvcGxlJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAodGhpcy5wcm9wcy5jb3JlT25seSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFBlb3BsZUxpc3Qoe1xuICAgICAgICAgICAgbWVtYmVyc2hpcHM6IHRoaXMuc3RhdGUuZmlsdGVyZWRNZW1iZXJzaGlwcywgXG4gICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZCwgXG4gICAgICAgICAgICBvbkZpbHRlcjogdGhpcy5vbkZpbHRlciwgXG4gICAgICAgICAgICBpbnRlcmVzdEZpbHRlcnM6IHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBcbiAgICAgICAgICAgIGN1cnJlbnRVc2VyOiB0aGlzLnByb3BzLmN1cnJlbnRVc2VyLCBcbiAgICAgICAgICAgIHVwZGF0ZVBhdGg6IHRoaXMucHJvcHMudXBkYXRlUGF0aCwgXG4gICAgICAgICAgICBjb3JlTWVtYmVyc2hpcHM6IHRoaXMucHJvcHMuY29yZU1lbWJlcnNoaXBzfSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuXG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgUGVvcGxlRmlsdGVyKHtcbiAgICAgICAgICAgICAgaW50ZXJlc3RGaWx0ZXJzOiB0aGlzLnByb3BzLmludGVyZXN0RmlsdGVycywgXG4gICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkLCBcbiAgICAgICAgICAgICAgb25GaWx0ZXI6IHRoaXMub25GaWx0ZXJ9KSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpLCBcbiAgICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWQgdGV4dC1jZW50ZXJcIn0sIFwiVGlwOiBZb3UgY2FuIHVzZSBAbWVudGlvbnMgdG8gZ2V0IHRoZSBhdHRlbnRpb24gb2YgXCIsIHRoaXMuZmlsdGVyTGFiZWwoKSwgXCIgaW4gY2hhdCBvciBCb3VudGllcy5cIiksIFxuICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgUGVvcGxlTGlzdCh7XG4gICAgICAgICAgICAgIG1lbWJlcnNoaXBzOiB0aGlzLnN0YXRlLmZpbHRlcmVkTWVtYmVyc2hpcHMsIFxuICAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZCwgXG4gICAgICAgICAgICAgIG9uRmlsdGVyOiB0aGlzLm9uRmlsdGVyLCBcbiAgICAgICAgICAgICAgaW50ZXJlc3RGaWx0ZXJzOiB0aGlzLnByb3BzLmludGVyZXN0RmlsdGVycywgXG4gICAgICAgICAgICAgIGN1cnJlbnRVc2VyOiB0aGlzLnByb3BzLmN1cnJlbnRVc2VyLCBcbiAgICAgICAgICAgICAgdXBkYXRlUGF0aDogdGhpcy5wcm9wcy51cGRhdGVQYXRoLCBcbiAgICAgICAgICAgICAgY29yZU1lbWJlcnNoaXBzOiB0aGlzLnByb3BzLmNvcmVNZW1iZXJzaGlwc30pXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIFBlb3BsZVN0b3JlLnNldFBlb3BsZSh0aGlzLnByb3BzLm1lbWJlcnNoaXBzKTtcbiAgICAgIHRoaXMub25GaWx0ZXIodGhpcy5wcm9wcy5zZWxlY3RlZCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIFBlb3BsZVN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMub25DaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9uRmlsdGVyKHRoaXMuc3RhdGUuc2VsZWN0ZWQpO1xuICAgIH0sXG5cbiAgICBvbkZpbHRlcjogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIHZhciBmaWx0ZXJlZE1lbWJlcnNoaXBzID0gUGVvcGxlU3RvcmUuZ2V0UGVvcGxlKCk7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChpbnRlcmVzdCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLnNlbGVjdGVkID09PSBpbnRlcmVzdCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9uRmlsdGVyKClcbiAgICAgICAgfVxuXG4gICAgICAgIGZpbHRlcmVkTWVtYmVyc2hpcHMgPSBfLmZpbHRlcihmaWx0ZXJlZE1lbWJlcnNoaXBzLCBmdW5jdGlvbiBmaWx0ZXJNZW1iZXJzaGlwcyhtKSB7XG4gICAgICAgICAgaWYgKGludGVyZXN0ID09PSAnY29yZScpIHtcbiAgICAgICAgICAgIHJldHVybiBtLmNvcmVfdGVhbTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gXy5pbmNsdWRlKG0uaW50ZXJlc3RzLCBpbnRlcmVzdClcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgdmFyIHNvcnRlZE1lbWJlcnNoaXBzID0gXy5zb3J0QnkoZmlsdGVyZWRNZW1iZXJzaGlwcywgZnVuY3Rpb24obSkge1xuICAgICAgICBpZiAoIW0pIHJldHVybjtcblxuICAgICAgICByZXR1cm4gKHNlbGYucHJvcHMuY3VycmVudFVzZXIgJiYgc2VsZi5wcm9wcy5jdXJyZW50VXNlci5pZCA9PT0gbS51c2VyLmlkID9cbiAgICAgICAgICAnLTEnIDpcbiAgICAgICAgICBtLmNvcmVfdGVhbSA/ICcwJyA6ICcxJykgK1xuICAgICAgICAgIG0udXNlci51c2VybmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZpbHRlcmVkTWVtYmVyc2hpcHM6IHNvcnRlZE1lbWJlcnNoaXBzLCBzZWxlY3RlZDogaW50ZXJlc3QgfSk7XG4gICAgfSxcblxuICAgIGZpbHRlckxhYmVsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkKSB7XG4gICAgICAgIHJldHVybiAoUmVhY3QuRE9NLnNwYW4obnVsbCwgXCIgdGhlIFwiLCBSZWFjdC5ET00uYSh7c3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ319LCBcIkBcIiwgdGhpcy5zdGF0ZS5zZWxlY3RlZCksIFwiIHRlYW1cIikpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJ3RoZXNlIHRlYW1zJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICB2YXIgUGVvcGxlRmlsdGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnUGVvcGxlRmlsdGVyJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGhpZ2hsaWdodEFsbCA9IHNlbGYucHJvcHMgJiYgIXNlbGYucHJvcHMuc2VsZWN0ZWQgPyAncHJpbWFyeSc6ICdkZWZhdWx0JztcbiAgICAgIHZhciBoaWdobGlnaHRDb3JlID0gc2VsZi5wcm9wcyAmJiBzZWxmLnByb3BzLnNlbGVjdGVkID09PSAnY29yZScgPyAncHJpbWFyeSc6ICdkZWZhdWx0JztcblxuICAgICAgdmFyIHRhZ3MgPSBfLm1hcCh0aGlzLnByb3BzLmludGVyZXN0RmlsdGVycywgZnVuY3Rpb24oaW50ZXJlc3Qpe1xuICAgICAgICBpZiAoaW50ZXJlc3QgPT09ICdjb3JlJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsYWJlbCA9ICdAJyArIGludGVyZXN0O1xuICAgICAgICB2YXIgaGlnaGxpZ2h0ID0gc2VsZi5wcm9wcyAmJiBzZWxmLnByb3BzLnNlbGVjdGVkID09PSBpbnRlcmVzdCA/ICdwcmltYXJ5JyA6ICdkZWZhdWx0JztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6ICdidG4gYnRuLScgKyBoaWdobGlnaHQsIFxuICAgICAgICAgICAgICBocmVmOiAnIycgKyBsYWJlbCwgXG4gICAgICAgICAgICAgIG9uQ2xpY2s6IHNlbGYuZmlsdGVyQ2hhbmdlZChpbnRlcmVzdCksIFxuICAgICAgICAgICAgICBrZXk6IGludGVyZXN0fSwgXG4gICAgICAgICAgICBsYWJlbFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC14cy0yXCJ9LCBcbiAgICAgICAgICAgIFwiQnJvd3NlIGJ5OlwiXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC14cy0xMCBidG4tZ3JvdXAgYnRuLWdyb3VwLXNtXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6ICd0ZXh0LW11dGVkIGJ0biBidG4tJyArIGhpZ2hsaWdodEFsbCwgXG4gICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5jbGVhckludGVyZXN0LCBcbiAgICAgICAgICAgICAgICBzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfX0sIFxuICAgICAgICAgICAgICBcIkFsbFwiXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6ICd0ZXh0LW11dGVkIGJ0biBidG4tJyArIGhpZ2hsaWdodENvcmUsIFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuaGlnaGxpZ2h0Q29yZSwgXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ319LCBcbiAgICAgICAgICAgICAgXCJAY29yZVwiXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIHRhZ3NcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgZmlsdGVyQ2hhbmdlZDogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYucHJvcHMub25GaWx0ZXIoaW50ZXJlc3QpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjbGVhckludGVyZXN0OiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uRmlsdGVyKCk7XG4gICAgfSxcblxuICAgIGhpZ2hsaWdodENvcmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucHJvcHMub25GaWx0ZXIoJ2NvcmUnKVxuICAgIH1cbiAgfSk7XG5cbiAgdmFyIFBlb3BsZUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdQZW9wbGVMaXN0JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAgbGlzdC1ncm91cC1icmVha291dCBsaXN0LWdyb3VwLXBhZGRlZFwifSwgXG4gICAgICAgICAgdGhpcy5yb3dzKHRoaXMucHJvcHMubWVtYmVyc2hpcHMpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24obWVtYmVyc2hpcHMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIHJvd3MgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBtZW1iZXJzaGlwcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIG1lbWJlciA9IG1lbWJlcnNoaXBzW2ldO1xuXG4gICAgICAgIGlmICghbWVtYmVyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVzZXIgPSBtZW1iZXIudXNlcjtcblxuICAgICAgICB2YXIgcm93ID0gKFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIiwgXG4gICAgICAgICAgICBrZXk6ICdyb3ctJyArIHVzZXIuaWQsIFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgJ3BhZGRpbmctdG9wJzogJzE1cHgnLFxuICAgICAgICAgICAgICAncGFkZGluZy1ib3R0b20nOiAnMTVweCcsXG4gICAgICAgICAgICAgICdib3JkZXItYm90dG9tJzogJzFweCBzb2xpZCAjZWJlYmViJ1xuICAgICAgICAgICAgfX0sIFxuICAgICAgICAgICAgdGhpcy5hdmF0YXIodXNlciksIFxuICAgICAgICAgICAgdGhpcy5tZW1iZXIobWVtYmVyKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuXG4gICAgICAgIHJvd3MucHVzaChyb3cpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcm93cztcbiAgICB9LFxuXG4gICAgYXZhdGFyOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLXNtLTEgY29sLXhzLTEgXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdXNlci51cmwsIHRpdGxlOiAnQCcgKyB1c2VyLnVzZXJuYW1lfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtzcmM6IHVzZXIuYXZhdGFyX3VybCwgXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImF2YXRhclwiLCBcbiAgICAgICAgICAgICAgICBhbHQ6ICdAJyArIHVzZXIudXNlcm5hbWUsIFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIjMwXCIsIFxuICAgICAgICAgICAgICAgIGhlaWdodDogXCIzMFwifVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgbWVtYmVyOiBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgIGlmICghbWVtYmVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHVzZXIgPSBtZW1iZXIudXNlcjtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1zbS0xMSBjb2wteHMtMTFcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwib21lZ2FcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibGlzdC1pbmxpbmUgb21lZ2EgcHVsbC1yaWdodFwifSwgXG4gICAgICAgICAgICAgIHRoaXMuc2tpbGxzKG1lbWJlcilcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHVzZXIudXJsLCB0aXRsZTogJ0AnICsgdXNlci51c2VybmFtZX0sIFxuICAgICAgICAgICAgICAgIHVzZXIudXNlcm5hbWVcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIHVzZXIuYmlvID8gdGhpcy5oYXNCaW8odXNlcikgOiAnJywgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgIEJpb0VkaXRvcih7XG4gICAgICAgICAgICAgICAgbWVtYmVyOiBtZW1iZXIsIFxuICAgICAgICAgICAgICAgIG9uRmlsdGVyOiB0aGlzLnByb3BzLm9uRmlsdGVyLCBcbiAgICAgICAgICAgICAgICBjdXJyZW50VXNlcjogdGhpcy5wcm9wcy5jdXJyZW50VXNlciwgXG4gICAgICAgICAgICAgICAgdXBkYXRlUGF0aDogdGhpcy5wcm9wcy51cGRhdGVQYXRoLCBcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEJpbzogbWVtYmVyLmJpbywgXG4gICAgICAgICAgICAgICAgaW50ZXJlc3RGaWx0ZXJzOiB0aGlzLnByb3BzLmludGVyZXN0RmlsdGVycywgXG4gICAgICAgICAgICAgICAgdXBkYXRlU2tpbGxzOiB0aGlzLnVwZGF0ZVNraWxscywgXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMucHJvcHMuc2VsZWN0ZWR9XG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgdGhpcy5jb3JlVGVhbUluZm8obWVtYmVyKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGNvcmVUZWFtSW5mbzogZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICB2YXIgY29yZSA9IHRoaXMucHJvcHMuY29yZU1lbWJlcnNoaXBzO1xuXG4gICAgICBpZiAoY29yZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNvcmUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGMgPSBjb3JlW2ldO1xuXG4gICAgICAgICAgaWYgKGMudXNlcl9pZCA9PT0gbWVtYmVyLnVzZXIuaWQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgJ0NvcmUgdGVhbSBzaW5jZSAnICsgX3BhcnNlRGF0ZShjLmNyZWF0ZWRfYXQpKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoYXNCaW86IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCB0ZXh0LXNtYWxsXCJ9LCBcbiAgICAgICAgICB1c2VyLmJpbyA/IHVzZXIuYmlvIDogJydcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBza2lsbHM6IGZ1bmN0aW9uKG1lbWJlcnNoaXApIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKG1lbWJlcnNoaXAuY29yZV90ZWFtICYmIG1lbWJlcnNoaXAuaW50ZXJlc3RzLmluZGV4T2YoJ2NvcmUnKSA8IDApIHtcbiAgICAgICAgbWVtYmVyc2hpcC5pbnRlcmVzdHMucHVzaCgnY29yZScpXG4gICAgICB9XG5cbiAgICAgIG1lbWJlcnNoaXAuaW50ZXJlc3RzLnNvcnQoKTtcblxuICAgICAgcmV0dXJuIF8ubWFwKG1lbWJlcnNoaXAuaW50ZXJlc3RzLCBmdW5jdGlvbiBtYXBJbnRlcmVzdHMoaW50ZXJlc3QpIHtcbiAgICAgICAgdmFyIGxhYmVsID0gJ0AnICsgaW50ZXJlc3Q7XG4gICAgICAgIHZhciBoaWdobGlnaHQgPSBzZWxmLnByb3BzICYmIHNlbGYucHJvcHMuc2VsZWN0ZWQgPT09IGludGVyZXN0ID8gJ3ByaW1hcnknIDogJ291dGxpbmVkJztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6ICdsYWJlbCBsYWJlbC0nICsgaGlnaGxpZ2h0LCBcbiAgICAgICAgICAgICAgICBrZXk6IG1lbWJlcnNoaXAudXNlci5pZCArICctJyArIGludGVyZXN0LCBcbiAgICAgICAgICAgICAgICBzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfSwgXG4gICAgICAgICAgICAgICAgb25DbGljazogc2VsZi5wcm9wcy5vbkZpbHRlci5iaW5kKG51bGwsIGludGVyZXN0KX0sIFxuICAgICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEJpb0VkaXRvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0Jpb0VkaXRvcicsXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBjdXJyZW50VXNlcjogdGhpcy5wcm9wcy5jdXJyZW50VXNlcixcbiAgICAgICAgbWVtYmVyOiB0aGlzLnByb3BzLm1lbWJlcixcbiAgICAgICAgb3JpZ2luYWxCaW86IHRoaXMucHJvcHMub3JpZ2luYWxCaW8sXG4gICAgICAgIGVkaXRpbmc6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBhcmFtcyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNsaWNlKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJz8nKSArIDEpLnNwbGl0KCcmJyk7XG5cbiAgICAgIGlmICghdGhpcy5pbnRyb2R1Y2VkICYmIHBhcmFtcy5pbmRleE9mKCdpbnRyb2R1Y3Rpb249dHJ1ZScpID49IDApIHtcbiAgICAgICAgdGhpcy5pbnRyb2R1Y2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYWtlRWRpdGFibGUoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdXJyZW50VXNlciA9IHRoaXMuc3RhdGUuY3VycmVudFVzZXI7XG4gICAgICB2YXIgbWVtYmVyID0gdGhpcy5zdGF0ZS5tZW1iZXI7XG5cbiAgICAgIGlmICghbWVtYmVyIHx8ICFjdXJyZW50VXNlcikge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdihudWxsKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRVc2VyLmlkID09PSBtZW1iZXIudXNlci5pZCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwianMtZWRpdC1iaW9cIiwga2V5OiAnYi0nICsgY3VycmVudFVzZXIuaWR9LCBcbiAgICAgICAgICAgICAgbWVtYmVyLmJpbywgXG4gICAgICAgICAgICAgIFwiwqBcIiwgdGhpcy5zdGF0ZS5lZGl0aW5nID8gdGhpcy5zYXZlQnV0dG9uKCkgOiB0aGlzLmVkaXRCdXR0b24oKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtrZXk6ICdiLScgKyBtZW1iZXIudXNlci5pZH0sIFxuICAgICAgICAgIG1lbWJlci5iaW9cbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBlZGl0QnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwiLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ30sIG9uQ2xpY2s6IHRoaXMubWFrZUVkaXRhYmxlfSwgXCLigJTCoFVwZGF0ZSBJbnRyb1wiKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBzYXZlQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCIsIHN0eWxlOiB7J21hcmdpbi10b3AnOicxNnB4J319LCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdCBidG4tc21cIiwgb25DbGljazogdGhpcy5tYWtlVW5lZGl0YWJsZSwgc3R5bGU6IHsnbWFyZ2luLXJpZ2h0JyA6ICc4cHgnfX0sIFwiQ2FuY2VsXCIpLCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeSBidG4tc21cIiwgb25DbGljazogdGhpcy51cGRhdGVCaW99LCBcIlNhdmVcIilcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBtYWtlRWRpdGFibGU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICQoJyNlZGl0LW1lbWJlcnNoaXAtbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuXG4gICAgICAkKCcjbW9kYWwtYmlvLWVkaXRvcicpLnZhbCh0aGlzLnN0YXRlLm9yaWdpbmFsQmlvKTtcbiAgICB9LFxuXG4gICAgc2tpbGxzT3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IF8ubWFwKHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBmdW5jdGlvbihpbnRlcmVzdCkge1xuICAgICAgICBpZiAoaW50ZXJlc3QgPT09ICdjb3JlJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5vcHRpb24oe3ZhbHVlOiBpbnRlcmVzdH0sICdAJyArIGludGVyZXN0KSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfSxcblxuICAgIG1ha2VVbmVkaXRhYmxlOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgbWVtYmVyID0gdGhpcy5zdGF0ZS5tZW1iZXI7XG4gICAgICB2YXIgYmlvID0gdGhpcy5zdGF0ZS5vcmlnaW5hbEJpbyB8fCB0aGlzLnByb3BzLm9yaWdpbmFsQmlvO1xuXG4gICAgICB0aGlzLnNhdmUobWVtYmVyLCBiaW8sIG1lbWJlci5pbnRlcmVzdHMpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVCaW86IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBiaW8gPSAkKCcuYmlvLWVkaXRvcicpLnZhbCgpO1xuICAgICAgdmFyIGludGVyZXN0cyA9ICQoJyNqb2luLWludGVyZXN0cycpLnZhbCgpO1xuICAgICAgdmFyIG1lbWJlciA9IHRoaXMuc3RhdGUubWVtYmVyO1xuXG4gICAgICB0aGlzLnNhdmUobWVtYmVyLCBiaW8sIGludGVyZXN0cyk7XG4gICAgfSxcblxuICAgIHNhdmU6IGZ1bmN0aW9uKG1lbWJlciwgYmlvLCBpbnRlcmVzdHMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiB0aGlzLnByb3BzLnVwZGF0ZVBhdGgsXG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIG1lbWJlcnNoaXA6IHtcbiAgICAgICAgICAgIGJpbzogYmlvLFxuICAgICAgICAgICAgaW50ZXJlc3RzOiBpbnRlcmVzdHNcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBtZW1iZXIuYmlvID0gZGF0YS5iaW9cbiAgICAgICAgICBtZW1iZXIuaW50ZXJlc3RzID0gZGF0YS5pbnRlcmVzdHNcbiAgICAgICAgICBzZWxmLnNldFN0YXRlKHsgbWVtYmVyOiBtZW1iZXIsIGVkaXRpbmc6IGZhbHNlLCBvcmlnaW5hbEJpbzogZGF0YS5iaW8gfSlcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGRhdGEsIHN0YXR1cykge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3Ioc3RhdHVzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBlb3BsZTtcbiAgfVxuXG4gIHdpbmRvdy5QZW9wbGUgPSBQZW9wbGU7XG5cbiAgZnVuY3Rpb24gX3BhcnNlRGF0ZShkYXRlKSB7XG4gICAgdmFyIHBhcnNlZERhdGUgPSBuZXcgRGF0ZShkYXRlKTtcblxuICAgIHJldHVybiAocGFyc2VkRGF0ZS5nZXRNb250aCgpICsgMSkudG9TdHJpbmcoKSArICctJyArIHBhcnNlZERhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkgKyAnLScgKyBwYXJzZWREYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcbiAgfVxufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgUGVyc29uUGlja2VyU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvcGVyc29uX3BpY2tlcl9zdG9yZScpO1xudmFyIEF2YXRhciA9IHJlcXVpcmUoJy4vYXZhdGFyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFBQID0gQ09OU1RBTlRTLlBFUlNPTl9QSUNLRVI7XG5cbiAgdmFyIGtleXMgPSB7XG4gICAgZW50ZXI6IDEzLFxuICAgIGVzYzogMjcsXG4gICAgdXA6IDM4LFxuICAgIGRvd246IDQwXG4gIH1cblxuICB2YXIgUGVyc29uUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnUGVyc29uUGlja2VyJyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgdXNlcnM6IFtdLCBoaWdobGlnaHRJbmRleDogMCB9XG4gICAgfSxcblxuICAgIGNsZWFyVGV4dDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnJlZnMudXNlcm5hbWVPckVtYWlsLmdldERPTU5vZGUoKS52YWx1ZSA9ICcnXG4gICAgICB0aGlzLnNldFN0YXRlKHRoaXMuZ2V0SW5pdGlhbFN0YXRlKCkpXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sIGlucHV0LXNtXCIsIHR5cGU6IFwidGV4dFwiLCBcbiAgICAgICAgICAgICAgICAgcmVmOiBcInVzZXJuYW1lT3JFbWFpbFwiLCBcbiAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlQ2hhbmdlLCBcbiAgICAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLmhhbmRsZUtleSwgXG4gICAgICAgICAgICAgICAgIG9uQmx1cjogdGhpcy5zZWxlY3RDdXJyZW50VXNlciwgXG4gICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBcIkB1c2VybmFtZSBvciBlbWFpbCBhZGRyZXNzXCJ9KSwgXG4gICAgICAgICAgdGhpcy5zdGF0ZS51c2Vycy5sZW5ndGggPiAwID8gdGhpcy51c2VyUGlja2VyKCkgOiBudWxsXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgdXNlclBpY2tlcjogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBVc2VyUGlja2VyKHtcbiAgICAgICAgdXNlcnM6IHRoaXMuc3RhdGUudXNlcnMsIFxuICAgICAgICBoaWdobGlnaHRJbmRleDogdGhpcy5zdGF0ZS5oaWdobGlnaHRJbmRleCwgXG4gICAgICAgIG9uVXNlclNlbGVjdGVkOiB0aGlzLmhhbmRsZVVzZXJTZWxlY3RlZH0pXG4gICAgfSxcblxuICAgIGhhbmRsZUNoYW5nZTogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHRleHQgPSB0aGlzLnJlZnMudXNlcm5hbWVPckVtYWlsLmdldERPTU5vZGUoKS52YWx1ZVxuICAgICAgaWYodGhpcy5pc0VtYWlsKHRleHQpKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRW1haWwodGV4dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaGFuZGxlVXNlcm5hbWUodGV4dClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlcm5hbWU6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHZhciBwb3N0RGF0YSA9IHtcbiAgICAgICAgc3VnZ2VzdF91c2VybmFtZToge1xuICAgICAgICAgIHRleHQ6IHRleHQsXG4gICAgICAgICAgY29tcGxldGlvbjoge1xuICAgICAgICAgICAgZmllbGQ6ICdzdWdnZXN0X3VzZXJuYW1lJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiB0aGlzLnByb3BzLnVybCArICcvdXNlcnMvX3N1Z2dlc3QnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHBvc3REYXRhKSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciB1c2VycyA9IF8ubWFwKGRhdGEuc3VnZ2VzdF91c2VybmFtZVswXS5vcHRpb25zLCBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZChvcHRpb24ucGF5bG9hZCwgeyB1c2VybmFtZTogb3B0aW9uLnRleHQgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuY29uc3RyYWluSGlnaGxpZ2h0KHRoaXMuc3RhdGUuaGlnaGxpZ2h0SW5kZXgpXG4gICAgICAgICAgdGhpcy5wcm9wcy5vblZhbGlkVXNlckNoYW5nZWQodXNlcnNbaW5kZXhdKVxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3VzZXJzOiB1c2VycywgaGlnaGxpZ2h0SW5kZXg6IGluZGV4fSlcbiAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2Vycm9yJywgYXJndW1lbnRzKVxuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVFbWFpbDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgdGhpcy5wcm9wcy5vblZhbGlkVXNlckNoYW5nZWQoe2VtYWlsOiB0ZXh0fSlcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3VzZXJzOiBbXX0pXG4gICAgfSxcblxuICAgIGhhbmRsZUtleTogZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGUua2V5Q29kZSA9PSBrZXlzLnVwKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0aGlzLm1vdmVIaWdobGlnaHQoLTEpXG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PSBrZXlzLmRvd24pIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMubW92ZUhpZ2hsaWdodCgxKVxuICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT0ga2V5cy5lbnRlcikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgdGhpcy5zZWxlY3RDdXJyZW50VXNlcigpXG4gICAgICB9XG4gICAgfSxcblxuICAgIG1vdmVIaWdobGlnaHQ6IGZ1bmN0aW9uKGluYykge1xuICAgICAgdmFyIGluZGV4ID0gdGhpcy5jb25zdHJhaW5IaWdobGlnaHQodGhpcy5zdGF0ZS5oaWdobGlnaHRJbmRleCArIGluYylcbiAgICAgIHRoaXMucHJvcHMub25WYWxpZFVzZXJDaGFuZ2VkKHRoaXMuc3RhdGUuIHVzZXJzW2luZGV4XSlcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBoaWdobGlnaHRJbmRleDogaW5kZXggfSlcbiAgICB9LFxuXG4gICAgc2VsZWN0Q3VycmVudFVzZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRleHQgPSB0aGlzLnJlZnMudXNlcm5hbWVPckVtYWlsLmdldERPTU5vZGUoKS52YWx1ZVxuICAgICAgdGhpcy5jbGVhclRleHQoKVxuXG4gICAgICBpZiAodGhpcy5zdGF0ZS51c2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0SGlnaGxpZ2h0KClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0VtYWlsKHRleHQpKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0RW1haWwodGV4dClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2VsZWN0SGlnaGxpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaGFuZGxlVXNlclNlbGVjdGVkKHRoaXMuc3RhdGUudXNlcnNbdGhpcy5zdGF0ZS5oaWdobGlnaHRJbmRleF0pXG4gICAgfSxcblxuICAgIHNlbGVjdEVtYWlsOiBmdW5jdGlvbihlbWFpbCkge1xuICAgICAgdGhpcy5wcm9wcy5vblVzZXJTZWxlY3RlZCh7ZW1haWw6IGVtYWlsfSlcbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlclNlbGVjdGVkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB0aGlzLmNsZWFyVGV4dCgpXG4gICAgICB0aGlzLnNldFN0YXRlKHsgdXNlcnM6IFtdIH0pXG4gICAgICB0aGlzLnByb3BzLm9uVXNlclNlbGVjdGVkKHVzZXIpXG4gICAgfSxcblxuICAgIGNvbnN0cmFpbkhpZ2hsaWdodDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgMCwgTWF0aC5taW4odGhpcy5zdGF0ZS51c2Vycy5sZW5ndGggLSAxLCBpbmRleClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgaXNFbWFpbDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgcmV0dXJuIC9eQD9cXHcrQC8uZXhlYyh0ZXh0KVxuICAgIH1cbiAgfSlcblxuICB2YXIgVXNlclBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1VzZXJQaWNrZXInLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAnei1pbmRleCc6IDEwMCxcbiAgICAgICAgdG9wOiAyNyxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgZGlzcGxheTogJ2Jsb2NrJ1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51XCIsIHN0eWxlOiBzdHlsZX0sIFxuICAgICAgICAgIHRoaXMucm93cygpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IC0xXG4gICAgICByZXR1cm4gXy5tYXAodGhpcy5wcm9wcy51c2VycywgZnVuY3Rpb24odXNlcil7XG4gICAgICAgIGkgKz0gMVxuICAgICAgICByZXR1cm4gVXNlclBpY2tlckVudHJ5KHtrZXk6IHVzZXIudXNlcm5hbWUsIHVzZXI6IHVzZXIsIHNlbGVjdGVkOiBpID09PSB0aGlzLnByb3BzLmhpZ2hsaWdodEluZGV4LCBvblVzZXJTZWxlY3RlZDogdGhpcy5wcm9wcy5vblVzZXJTZWxlY3RlZH0pXG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgfVxuICB9KVxuXG4gIHZhciBVc2VyUGlja2VyRW50cnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdVc2VyUGlja2VyRW50cnknLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2xhc3NOYW1lID0gJ3RleHRjb21wbGV0ZS1pdGVtJ1xuICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcbiAgICAgICAgY2xhc3NOYW1lICs9ICcgYWN0aXZlJ1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogY2xhc3NOYW1lfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6ICcjQCcgKyB0aGlzLnByb3BzLnVzZXIudXNlcm5hbWUsIG9uQ2xpY2s6IHRoaXMuaGFuZGxlVXNlclNlbGVjdGVkKHRoaXMucHJvcHMudXNlcil9LCBcbiAgICAgICAgICAgIEF2YXRhcih7dXNlcjogdGhpcy5wcm9wcy51c2VyLCBcbiAgICAgICAgICAgICAgICBzdHlsZTogeydtYXJnaW4tcmlnaHQnOiAnMTBweCd9fSksIFxuICAgICAgICAgICAgXCJAXCIsIHRoaXMucHJvcHMudXNlci51c2VybmFtZSwgXCIgXCIsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgdGhpcy5wcm9wcy51c2VyLm5hbWUpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGhhbmRsZVVzZXJTZWxlY3RlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uVXNlclNlbGVjdGVkKHVzZXIpXG4gICAgICB9LmJpbmQodGhpcylcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGVyc29uUGlja2VyO1xuICB9XG5cbiAgd2luZG93LlBlcnNvblBpY2tlciA9IFBlcnNvblBpY2tlcjtcblxufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBQb3BvdmVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnUG9wb3ZlcicsXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICBwbGFjZW1lbnQ6IFJlYWN0LlByb3BUeXBlcy5vbmVPZihbJ3RvcCcsJ3JpZ2h0JywgJ2JvdHRvbScsICdsZWZ0J10pLFxuICAgICAgcG9zaXRpb25MZWZ0OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgcG9zaXRpb25Ub3A6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgICBhcnJvd09mZnNldExlZnQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgICBhcnJvd09mZnNldFRvcDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIHRpdGxlOiBSZWFjdC5Qcm9wVHlwZXMucmVuZGVyYWJsZVxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBsYWNlbWVudDogJ3JpZ2h0J1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgICAgcG9wb3ZlcjogdHJ1ZSxcbiAgICAgICAgaW46IHRoaXMucHJvcHMucG9zaXRpb25MZWZ0ICE9IG51bGwgfHwgdGhpcy5wcm9wcy5wb3NpdGlvblRvcCAhPSBudWxsXG4gICAgICB9O1xuXG4gICAgICBjbGFzc2VzW3RoaXMucHJvcHMucGxhY2VtZW50XSA9IHRydWU7XG5cbiAgICAgIHZhciBzdHlsZSA9IHtcbiAgICAgICAgbGVmdDogdGhpcy5wcm9wcy5wb3NpdGlvbkxlZnQsXG4gICAgICAgIHRvcDogdGhpcy5wcm9wcy5wb3NpdGlvblRvcCxcbiAgICAgICAgZGlzcGxheTogJ2Jsb2NrJ1xuICAgICAgfTtcblxuICAgICAgdmFyIGFycm93U3R5bGUgPSB7XG4gICAgICAgIGxlZnQ6IHRoaXMucHJvcHMuYXJyb3dPZmZzZXRMZWZ0LFxuICAgICAgICB0b3A6IHRoaXMucHJvcHMuYXJyb3dPZmZzZXRUb3BcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogUmVhY3QuYWRkb25zLmNsYXNzU2V0KGNsYXNzZXMpLCBzdHlsZTogc3R5bGV9LCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYXJyb3dcIiwgc3R5bGU6IGFycm93U3R5bGV9KSwgXG4gICAgICAgICAgdGhpcy5wcm9wcy50aXRsZSA/IHRoaXMucmVuZGVyVGl0bGUoKSA6IG51bGwsIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwb3BvdmVyLWNvbnRlbnRcIn0sIFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyVGl0bGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmgzKHtjbGFzc05hbWU6IFwicG9wb3Zlci10aXRsZVwifSwgdGhpcy5wcm9wcy50aXRsZSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBvcG92ZXI7XG4gIH1cblxuICB3aW5kb3cuUG9wb3ZlciA9IFBvcG92ZXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBQb3BvdmVyID0gcmVxdWlyZSgnLi9wb3BvdmVyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBTaGFyZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1NoYXJlJyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgbW9kYWw6IGZhbHNlIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeSBidG4tc21cIiwgc3R5bGU6IHsndmVydGljYWwtYWxpZ24nOiAnYm90dG9tJ30sIG9uQ2xpY2s6IHRoaXMudG9nZ2xlTW9kYWx9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLXNoYXJlLWFsdFwiLCBzdHlsZToge1wibWFyZ2luLXJpZ2h0XCI6IDJ9fSksIFxuICAgICAgICAgICAgXCJTaGFyZVwiXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgdGhpcy5zdGF0ZS5tb2RhbCA/IHRoaXMucG9wb3ZlcigpIDogbnVsbFxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHRvZ2dsZU1vZGFsOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGFsOiAhdGhpcy5zdGF0ZS5tb2RhbH0pXG4gICAgfSxcblxuICAgIHBvcG92ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUG9wb3Zlcih7cGxhY2VtZW50OiBcImJvdHRvbVwiLCBwb3NpdGlvbkxlZnQ6IDQ0MCwgcG9zaXRpb25Ub3A6IDMwLCB0aXRsZTogdGhpcy5wcm9wcy50aXRsZX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImxpc3QgbGlzdC11bnN0eWxlZFwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkoe3N0eWxlOiB7XCJtYXJnaW4tYm90dG9tXCI6IDEwfX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLW1kLTZcIn0sIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJidG4gYnRuLXR3aXR0ZXIgYnRuLWJsb2NrXCIsIG9uQ2xpY2s6IHRoaXMuaGFuZGxlVHdpdHRlckNsaWNrfSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLXR3aXR0ZXJcIiwgc3R5bGU6IHsnbWFyZ2luLXJpZ2h0JzogMn19KSwgXG4gICAgICAgICAgICAgICAgICAgIFwiVHdpdHRlclwiXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC02XCJ9LCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1mYWNlYm9vayBidG4tYmxvY2tcIiwgaHJlZjogXCIjXCIsIG9uQ2xpY2s6IHRoaXMuaGFuZGxlRmFjZWJvb2tDbGlja30sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1mYWNlYm9va1wiLCBzdHlsZTogeydtYXJnaW4tcmlnaHQnOiAyfX0pLCBcbiAgICAgICAgICAgICAgICAgICAgXCJGYWNlYm9va1wiXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgICAgQ29weUxpbmsoe3VybDogdGhpcy5wcm9wcy51cmx9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVUd2l0dGVyQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93Lm9wZW4oJ2h0dHA6Ly90d2l0dGVyLmNvbS9zaGFyZT91cmw9JyArIHRoaXMucHJvcHMudXJsICsgJyZ0ZXh0PScgKyB0aGlzLnByb3BzLnNoYXJlVGV4dCArICcmJywgJ3R3aXR0ZXJ3aW5kb3cnLCAnaGVpZ2h0PTQ1MCwgd2lkdGg9NTUwLCB0b3A9JysoJCh3aW5kb3cpLmhlaWdodCgpLzIgLSAyMjUpICsnLCBsZWZ0PScrJCh3aW5kb3cpLndpZHRoKCkvMiArJywgdG9vbGJhcj0wLCBsb2NhdGlvbj0wLCBtZW51YmFyPTAsIGRpcmVjdG9yaWVzPTAsIHNjcm9sbGJhcnM9MCcpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVGYWNlYm9va0NsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIEZCLnVpKHtcbiAgICAgICAgbWV0aG9kOiAnc2hhcmUnLFxuICAgICAgICBocmVmOiB0aGlzLnByb3BzLnVybCxcbiAgICAgIH0sIGZ1bmN0aW9uKHJlc3BvbnNlKXt9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBDb3B5TGluayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NvcHlMaW5rJyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgbGFiZWw6ICdDb3B5JyB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXBcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7cmVmOiBcInRleHRcIiwgdHlwZTogXCJ0ZXh0XCIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2xcIiwgaWQ6IFwic2hhcmUtdXJsXCIsIHZhbHVlOiB0aGlzLnByb3BzLnVybH0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWJ0blwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtyZWY6IFwiY29weVwiLCBjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIHR5cGU6IFwiYnV0dG9uXCJ9LCB0aGlzLnN0YXRlLmxhYmVsKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgIHZhciBjbGllbnQgPSBuZXcgWmVyb0NsaXBib2FyZCh0aGlzLnJlZnMuY29weS5nZXRET01Ob2RlKCkpXG4gICAgICBjbGllbnQub24oJ3JlYWR5JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgY2xpZW50Lm9uKCdjb3B5JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBldmVudC5jbGlwYm9hcmREYXRhLnNldERhdGEoJ3RleHQvcGxhaW4nLCBzZWxmLnByb3BzLnVybClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2xpZW50Lm9uKCdhZnRlcmNvcHknLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIHNlbGYuc2V0U3RhdGUoe2xhYmVsOiAnQ29waWVkISd9KVxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnNldFN0YXRlKHtsYWJlbDogJ0NvcHknfSlcbiAgICAgICAgICB9LCAxMDAwKVxuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNoYXJlO1xuICB9XG5cbiAgd2luZG93LlNoYXJlID0gU2hhcmU7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBUYWdMaXN0U3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvdGFnX2xpc3Rfc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgVEMgPSBDT05TVEFOVFMuVEVYVF9DT01QTEVURTtcbiAgdmFyIFRBR19MSVNUID0gQ09OU1RBTlRTLlRBR19MSVNUO1xuXG4gIHZhciBUYWdMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVGFnTGlzdCcsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRhZ3M6IHRoaXMucHJvcHMudGFnc1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuZGVzdGluYXRpb24pIHtcbiAgICAgICAgVGFnTGlzdFN0b3JlLnNldFRhZ3ModGhpcy5wcm9wcy50YWdzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImxpc3QtaW5saW5lIG9tZWdhXCJ9LCBcbiAgICAgICAgICB0aGlzLnRhZ3ModGhpcy5zdGF0ZS50YWdzKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0YWdzOiBmdW5jdGlvbih0YWdzKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgYWRkZWRUYWdzID0gVGFnTGlzdFN0b3JlLmdldFRhZ3MoKTtcblxuICAgICAgdmFyIG1hcHBlZFRhZ3MgPSBfLm1hcCh0YWdzLCBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICAgICdmb250LXNpemUnOiAnMTRweCcsXG4gICAgICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIXNlbGYucHJvcHMuZGVzdGluYXRpb24gJiYgYWRkZWRUYWdzLmluZGV4T2YodGFnKSA+PSAwKSB7XG4gICAgICAgICAgc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgICAgIHN0eWxlLmNvbG9yID0gJyNkM2QzZDMnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0YWcpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZi5wcm9wcy5hbGxvd1JlbW92YWwpIHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtzdHlsZTogeydtYXJnaW4nOiAnMHB4J319LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe3N0eWxlOiBzdHlsZX0sIHRhZyksIFJlYWN0LkRPTS5zcGFuKG51bGwsIFJlYWN0LkRPTS5hKHtzdHlsZTogeydtYXJnaW4tbGVmdCc6ICcycHgnLCAnZm9udC1zaXplJzogJzEwcHgnLCBjdXJzb3I6ICdwb2ludGVyJ30sIG9uQ2xpY2s6IHNlbGYuaGFuZGxlQ2xpY2sodGFnKX0sIFwiw5dcIikpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtzdHlsZTogeydtYXJnaW4nOiAnMHB4J319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtzdHlsZTogc3R5bGUsIGhyZWY6IHNlbGYucHJvcHMuZmlsdGVyVXJsID8gc2VsZi5wcm9wcy5maWx0ZXJVcmwgKyAnP3RhZz0nICsgdGFnIDogJ2phdmFzY3JpcHQ6dm9pZCgwKTsnLCBvbkNsaWNrOiBzZWxmLmhhbmRsZUNsaWNrKHRhZyl9LCB0YWcpXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEZJWE1FOiBXaGVuIHRoZXJlIGFyZSBubyB0YWdzLCB0aGUgY2xpZW50IGp1c3QgcmVjZWl2ZXMgW1wiXCJdLCB3aGljaCByZXF1aXJlcyB3ZWlyZCBjaGVja3MgbGlrZSB0aGlzLlxuICAgICAgaWYgKHRoaXMucHJvcHMuZGVzdGluYXRpb24gJiZcbiAgICAgICAgICAoXy5pc0VtcHR5KG1hcHBlZFRhZ3MpIHx8XG4gICAgICAgICAgICAobWFwcGVkVGFnc1swXSA9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICBtYXBwZWRUYWdzWzFdID09IHVuZGVmaW5lZCkpKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtzdHlsZToge2NvbG9yOiAnI2QzZDNkMycsICdmb250LXNpemUnOiAnMTNweCd9fSwgXCJObyB0YWdzIHlldCDigJQgd2h5IG5vdCBhZGQgc29tZT9cIilcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hcHBlZFRhZ3M7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIFRhZ0xpc3RTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLm9uQ2hhbmdlKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRhZ3MgPSBUYWdMaXN0U3RvcmUuZ2V0VGFncygpO1xuXG4gICAgICBpZiAodGhpcy5wcm9wcy5kZXN0aW5hdGlvbikge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB0YWdzOiB0YWdzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB0YWdMaXN0SGFjayA9ICQoJyN0YWctbGlzdC1oYWNrJyk7XG5cbiAgICAgICAgaWYgKHRhZ0xpc3RIYWNrLmxlbmd0aCkge1xuICAgICAgICAgIGlmIChfLmlzRW1wdHkodGFncykpIHtcbiAgICAgICAgICAgIHRhZ0xpc3RIYWNrLmVtcHR5KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHNlbGVjdGVkID0gdGFnTGlzdEhhY2sudmFsKCk7XG5cbiAgICAgICAgICAkKHRhZ0xpc3RIYWNrKS5hcHBlbmQoXy5tYXAodGFncywgZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICBpZiAoKHNlbGVjdGVkICYmIHNlbGVjdGVkLmluZGV4T2YodGFnKSA9PT0gLTEpIHx8ICFzZWxlY3RlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gJzxvcHRpb24gdmFsdWU9JyArIHRhZyArICcgc2VsZWN0ZWQ9XCJ0cnVlXCI+JyArIHRhZyArICc8L29wdGlvbj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdGFnczogdGhpcy5wcm9wcy50YWdzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBoYW5kbGVDbGljazogZnVuY3Rpb24odGFnKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmICh0aGlzLnByb3BzLmRlc3RpbmF0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5hbGxvd1JlbW92YWwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBUQUdfTElTVC5BQ1RJT05TLlJFTU9WRV9UQUcsXG4gICAgICAgICAgICBkYXRhOiB7IHRhZzogdGFnLCB1cmw6IHNlbGYucHJvcHMudXJsIH0sXG4gICAgICAgICAgICBldmVudDogVEFHX0xJU1QuRVZFTlRTLlRBR19SRU1PVkVEXG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgIGFjdGlvbjogVEFHX0xJU1QuQUNUSU9OUy5BRERfVEFHLFxuICAgICAgICAgIGRhdGE6IHsgdGFnOiB0YWcsIHVybDogc2VsZi5wcm9wcy51cmwgfSxcbiAgICAgICAgICBldmVudDogVEFHX0xJU1QuRVZFTlRTLlRBR19BRERFRCArICctdHJ1ZSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5zZXRTdGF0ZSh7XG4gICAgICAgICAgdGFnczogc2VsZi5zdGF0ZS50YWdzXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGFnTGlzdDtcbiAgfVxuXG4gIHdpbmRvdy5UYWdMaXN0ID0gVGFnTGlzdDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgVGltZXN0YW1wID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVGltZXN0YW1wJyxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS50aW1lYWdvKCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLnRpbWVhZ28oJ2Rpc3Bvc2UnKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS50aW1lKHtjbGFzc05hbWU6IFwidGltZXN0YW1wXCIsIGRhdGVUaW1lOiB0aGlzLnByb3BzLnRpbWV9KVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGltZXN0YW1wO1xuICB9XG5cbiAgd2luZG93LlRpbWVzdGFtcCA9IFRpbWVzdGFtcDtcbn0pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcblxuICBDT0lOX0lOQ1JFTUVOVCA9IDEwMFxuICBERUJPVU5DRV9USU1FT1VUID0gMjAwMFxuXG4gIHZhciBUaXBzVWkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdUaXBzVWknLFxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3VycmVudFVzZXIgPSBhcHAuY3VycmVudFVzZXIoKVxuICAgICAgaWYgKGN1cnJlbnRVc2VyKSB7XG4gICAgICAgIGN1cnJlbnRVc2VyID0gY3VycmVudFVzZXIuYXR0cmlidXRlc1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50VXNlcjogY3VycmVudFVzZXIsXG4gICAgICAgIHVybDogYXBwLnByb2R1Y3QuZ2V0KCd1cmwnKSArICcvdGlwcydcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpcHM6IF8ucmVkdWNlKHRoaXMucHJvcHMudGlwcywgZnVuY3Rpb24oaCwgdGlwKSB7IGhbdGlwLmZyb20uaWRdID0gdGlwOyByZXR1cm4gaCB9LCB7fSksXG4gICAgICAgIHVzZXJDZW50czogYXBwLmN1cnJlbnRQcm9kdWN0QmFsYW5jZSgpLFxuICAgICAgICBwZW5kaW5nQ2VudHM6IDBcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzLnJlZnMuYnV0dG9uLmdldERPTU5vZGUoKSkudG9vbHRpcCgpXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdG90YWxDZW50cyA9IHRoaXMudG90YWxDZW50cygpXG5cbiAgICAgIHZhciB0b29sdGlwID0gbnVsbFxuICAgICAgaWYgKHRoaXMucHJvcHMuY3VycmVudFVzZXIgPT0gbnVsbCkge1xuICAgICAgICB0b29sdGlwID0gJ1lvdSBuZWVkIHRvIHNpZ24gdXAgYmVmb3JlIHlvdSBjYW4gdGlwJ1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnVzZXJDZW50cyA8PSAwKSB7XG4gICAgICAgIHRvb2x0aXAgPSAnWW91IGhhdmUgbm8gY29pbnMgdG8gdGlwJ1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRVc2VySXNSZWNpcGllbnQoKSkge1xuICAgICAgICB0b29sdGlwID0gXCJZb3UgY2FuJ3QgdGlwIHlvdXJzZWxmXCJcbiAgICAgIH1cblxuICAgICAgdmFyIHRpcHBlcnMgPSBudWxsXG4gICAgICBpZiAodG90YWxDZW50cyA+IDApIHtcbiAgICAgICAgdGlwcGVycyA9IFRpcHBlcnMoe3RpcHM6IHRoaXMudGlwcygpfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImpzLXRpcHNcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogdG90YWxDZW50cyA+IDAgPyAndGV4dC1jb2lucycgOiBudWxsfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7cmVmOiBcImJ1dHRvblwiLCBocmVmOiBcImphdmFzY3JpcHQ6O1wiLCAnZGF0YS1wbGFjZW1lbnQnOiBcInRvcFwiLCAnZGF0YS10b2dnbGUnOiBcInRvb2x0aXBcIiwgdGl0bGU6IHRvb2x0aXAsIG9uQ2xpY2s6IHRoaXMuY3VycmVudFVzZXJDYW5UaXAoKSA/IHRoaXMuaGFuZGxlQ2xpY2sgOiBudWxsfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIFwiIFwiLCBudW1lcmFsKHRoaXMudG90YWxDZW50cygpIC8gMTAwKS5mb3JtYXQoJzAsMCcpKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICB0aXBwZXJzXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIG9wdGltaXN0aWNUaXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVwZGF0ZSA9IHsgcGVuZGluZ0NlbnRzOiB7ICRzZXQ6IHRoaXMuc3RhdGUucGVuZGluZ0NlbnRzICsgQ09JTl9JTkNSRU1FTlQgfSwgdGlwczoge319XG5cbiAgICAgIHZhciB0aXAgPSB0aGlzLnN0YXRlLnRpcHNbdGhpcy5wcm9wcy5jdXJyZW50VXNlci5pZF1cbiAgICAgIGlmICh0aXApIHtcbiAgICAgICAgdXBkYXRlLnRpcHNbdGhpcy5wcm9wcy5jdXJyZW50VXNlci5pZF0gPSB7ICRtZXJnZTogeyBjZW50czogdGlwLmNlbnRzICsgQ09JTl9JTkNSRU1FTlQgfSB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cGRhdGUudGlwc1t0aGlzLnByb3BzLmN1cnJlbnRVc2VyLmlkXSA9IHsgJHNldDogeyBmcm9tOiB0aGlzLnByb3BzLmN1cnJlbnRVc2VyLCBjZW50czogQ09JTl9JTkNSRU1FTlQgfSB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB1cGRhdGUpKVxuICAgIH0sXG5cbiAgICBzYXZlOiBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgIHVybDogdGhpcy5wcm9wcy51cmwsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0aXA6IHtcbiAgICAgICAgICAgIGFkZDogdGhpcy5zdGF0ZS5wZW5kaW5nQ2VudHMsXG4gICAgICAgICAgICB2aWFfdHlwZTogdGhpcy5wcm9wcy52aWFUeXBlLFxuICAgICAgICAgICAgdmlhX2lkOiB0aGlzLnByb3BzLnZpYUlkXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGVuZGluZ0NlbnRzOiAwfSlcbiAgICAgIH0uYmluZCh0aGlzKX0pXG4gICAgfSwgREVCT1VOQ0VfVElNRU9VVCksXG5cbiAgICBoYW5kbGVDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9wdGltaXN0aWNUaXAoKVxuICAgICAgdGhpcy5zYXZlKClcbiAgICB9LFxuXG4gICAgY3VycmVudFVzZXJDYW5UaXA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudXNlckNlbnRzID4gMCAmJiAhdGhpcy5jdXJyZW50VXNlcklzUmVjaXBpZW50KClcbiAgICB9LFxuXG4gICAgY3VycmVudFVzZXJJc1JlY2lwaWVudDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jdXJyZW50VXNlci5pZCA9PSB0aGlzLnByb3BzLnJlY2lwaWVudC5pZFxuICAgIH0sXG5cbiAgICB0b3RhbENlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLnJlZHVjZShfLm1hcCh0aGlzLnRpcHMoKSwgZnVuYy5kb3QoJ2NlbnRzJykpLCBmdW5jLmFkZCwgMClcbiAgICB9LFxuXG4gICAgdGlwczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy52YWx1ZXModGhpcy5zdGF0ZS50aXBzKVxuICAgIH1cbiAgfSlcblxuICB2YXIgVGlwcGVycyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1RpcHBlcnMnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFwi4oCUIHRpcHBlZCBieSDCoFwiLCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJsaXN0LWlubGluZS1tZWRpYVwifSwgXG4gICAgICAgICAgICBfLm1hcCh0aGlzLnByb3BzLnRpcHMsIHRoaXMucm93KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICByb3c6IGZ1bmN0aW9uKHRpcCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmxpKHtrZXk6IHRpcC5mcm9tLmlkfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmltZyh7XG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiaW1nLWNpcmNsZVwiLCBcbiAgICAgICAgICAgIHNyYzogdGlwLmZyb20uYXZhdGFyX3VybCwgXG4gICAgICAgICAgICBhbHQ6ICdAJyArIHRpcC5mcm9tLnVzZXJuYW1lLCBcbiAgICAgICAgICAgICdkYXRhLXRvZ2dsZSc6IFwidG9vbHRpcFwiLCBcbiAgICAgICAgICAgICdkYXRhLXBsYWNlbWVudCc6IFwidG9wXCIsIFxuICAgICAgICAgICAgdGl0bGU6ICdAJyArIHRpcC5mcm9tLnVzZXJuYW1lLCBcbiAgICAgICAgICAgIHdpZHRoOiBcIjE2XCIsIGhlaWdodDogXCIxNlwifSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUaXBzVWk7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93LlRpcHNVaSA9IFRpcHNVaTtcbiAgfVxuXG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL2NoYXRfbm90aWZpY2F0aW9uc19zdG9yZScpO1xudmFyIE5ld3NGZWVkU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFRpdGxlTm90aWZpY2F0aW9uc0NvdW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVGl0bGVOb3RpZmljYXRpb25zQ291bnQnLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuc2V0VGl0bGUpO1xuICAgICAgTmV3c0ZlZWRTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLnNldFRpdGxlKTtcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBkb2N1bWVudC50aXRsZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvdW50OiAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKG51bGwpO1xuICAgIH0sXG5cbiAgICBzZXRUaXRsZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2hhdENvdW50ID0gQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5nZXRVbnJlYWRDb3VudChsb2NhbFN0b3JhZ2UuY2hhdEFjaykgfHwgMDtcbiAgICAgIHZhciBuZXdzQ291bnQgPSBOZXdzRmVlZFN0b3JlLmdldFVucmVhZENvdW50KGxvY2FsU3RvcmFnZS5uZXdzRmVlZEFjaykgfHwgMDtcblxuICAgICAgdmFyIHRvdGFsID0gY2hhdENvdW50ICsgbmV3c0NvdW50O1xuXG4gICAgICBkb2N1bWVudC50aXRsZSA9IHRvdGFsID4gMCA/XG4gICAgICAgICcoJyArIHRvdGFsICsgJykgJyArIHRoaXMucHJvcHMudGl0bGUgOlxuICAgICAgICB0aGlzLnByb3BzLnRpdGxlO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUaXRsZU5vdGlmaWNhdGlvbnNDb3VudDtcbiAgfVxuXG4gIHdpbmRvdy5UaXRsZU5vdGlmaWNhdGlvbnNDb3VudCA9IFRpdGxlTm90aWZpY2F0aW9uc0NvdW50O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBVcmdlbmN5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVXJnZW5jeScsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IGxhYmVsOiB0aGlzLnByb3BzLmluaXRpYWxMYWJlbCB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiZHJvcGRvd25cIiwgc3R5bGU6IHtcImRpc3BsYXlcIjpcImlubGluZS1ibG9ja1wifX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHsnZGF0YS10b2dnbGUnOiBcImRyb3Bkb3duXCIsIGhyZWY6IFwiI1wifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLmxhYmVsQ2xhc3ModGhpcy5zdGF0ZS5sYWJlbCl9LCB0aGlzLnN0YXRlLmxhYmVsKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duLW1lbnVcIn0sIFxuICAgICAgICAgICAgdGhpcy5saXN0SXRlbXMoKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBsaXN0SXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMudXJnZW5jaWVzLm1hcChmdW5jdGlvbih1KXtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00ubGkoe2tleTogdX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMudXBkYXRlVXJnZW5jeSh1KX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLmxhYmVsQ2xhc3ModSl9LCB1KVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIH0sXG5cbiAgICB1cGRhdGVVcmdlbmN5OiBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtsYWJlbDogbGFiZWx9KVxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogdGhpcy5wcm9wcy51cmwsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICB0eXBlOiAnUEFUQ0gnLFxuICAgICAgICAgIGRhdGE6IHsgdXJnZW5jeTogbGFiZWwudG9Mb3dlckNhc2UoKSB9XG4gICAgICAgIH0pO1xuICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfSxcblxuICAgIGxhYmVsQ2xhc3M6IGZ1bmN0aW9uKHVyZ2VuY3kpIHtcbiAgICAgIHJldHVybiBcImxhYmVsIGxhYmVsLVwiICsgdXJnZW5jeS50b0xvd2VyQ2FzZSgpXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFVyZ2VuY3k7XG4gIH1cblxuICB3aW5kb3cuVXJnZW5jeSA9IFVyZ2VuY3k7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFVzZXJOYXZiYXJEcm9wZG93biA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1VzZXJOYXZiYXJEcm9wZG93bicsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duLW1lbnVcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB0aGlzLnByb3BzLnVzZXJQYXRofSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLXVzZXIgZHJvcGRvd24tZ2x5cGhcIn0pLCBcbiAgICAgICAgICAgICAgXCJQcm9maWxlXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB0aGlzLnByb3BzLmVkaXRVc2VyUGF0aH0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1zZXR0aW5ncyBkcm9wZG93bi1nbHlwaFwifSksIFxuICAgICAgICAgICAgICBcIlNldHR0aW5nc1wiXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJkaXZpZGVyXCJ9KSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdGhpcy5wcm9wcy5kZXN0cm95VXNlclNlc3Npb25QYXRoLCAnZGF0YS1tZXRob2QnOiBcImRlbGV0ZVwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWxvZ291dCBkcm9wZG93bi1nbHlwaFwifSksIFxuICAgICAgICAgICAgICBcIkxvZyBvdXRcIlxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVXNlck5hdmJhckRyb3Bkb3duO1xuICB9XG4gIFxuICB3aW5kb3cuVXNlck5hdmJhckRyb3Bkb3duID0gVXNlck5hdmJhckRyb3Bkb3duO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIENPTlNUQU5UUyA9IHtcbiAgICBDSEFUX05PVElGSUNBVElPTlM6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUNLTk9XTEVER0U6ICdjaGF0OmFja25vd2xlZGdlJyxcbiAgICAgICAgRkVUQ0hfQ0hBVF9ST09NUzogJ2NoYXQ6ZmV0Y2hDaGF0Um9vbXMnLFxuICAgICAgICBNQVJLX1JPT01fQVNfUkVBRDogJ2NoYXQ6bWFya1Jvb21Bc1JlYWQnXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIEFDS05PV0xFREdFRDogJ2NoYXQ6YWNrbm93bGVkZ2VkJyxcbiAgICAgICAgQ0hBVF9ST09NU19GRVRDSEVEOiAnY2hhdDpjaGF0Um9vbXNGZXRjaGVkJyxcbiAgICAgICAgQ0hBVF9ST09NX1JFQUQ6ICdjaGF0OmNoYXRSb29tUmVhZCdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgQ09JTl9PV05FUlNISVA6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUREX1VTRVI6ICdhZGRVc2VyJyxcbiAgICAgICAgUkVNT1ZFX1VTRVI6ICdyZW1vdmVVc2VyJyxcbiAgICAgICAgVVBEQVRFX1VTRVI6ICd1cGRhdGVVc2VyJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBVU0VSX0FEREVEOiAnY29pbk93bmVyc2hpcDp1c2VyQWRkZWQnLFxuICAgICAgICBVU0VSX1JFTU9WRUQ6ICdjb2luT3duZXJzaGlwOnVzZXJSZW1vdmVkJyxcbiAgICAgICAgVVNFUl9VUERBVEVEOiAnY29pbk93bmVyc2hpcDp1c2VyVXBkYXRlZCdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgSU5URVJFU1RfUElDS0VSOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFERF9JTlRFUkVTVDogJ2FkZEludGVyZXN0JyxcbiAgICAgICAgUkVNT1ZFX0lOVEVSRVNUOiAncmVtb3ZlSW50ZXJlc3QnLFxuICAgICAgICBQT1A6ICdwb3AnXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIElOVEVSRVNUX0FEREVEOiAnaW50ZXJlc3RQaWNrZXI6aW50ZXJlc3RBZGRlZCcsXG4gICAgICAgIElOVEVSRVNUX1JFTU9WRUQ6ICdpbnRlcmVzdFBpY2tlcjppbnRlcmVzdFJlbW92ZWQnLFxuICAgICAgICBQT1BQRUQ6ICdpbnRlcmVzdFBpY2tlcjpwb3BwZWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIE5FV1NfRkVFRDoge1xuICAgICAgQUNUSU9OUzoge1xuICAgICAgICBBQ0tOT1dMRURHRTogJ25ld3NGZWVkOmFja25vd2xlZGdlJyxcbiAgICAgICAgRkVUQ0hfU1RPUklFUzogJ25ld3NGZWVkOmZldGNoU3RvcmllcycsXG4gICAgICAgIEZFVENIX01PUkVfU1RPUklFUzogJ25ld3NGZWVkOmZldGNoTW9yZVN0b3JpZXMnLFxuICAgICAgICBNQVJLX0FTX1JFQUQ6ICduZXdzRmVlZDptYXJrQXNSZWFkJyxcbiAgICAgICAgTUFSS19BTExfQVNfUkVBRDogJ25ld3NGZWVkOm1hcmtBbGxBc1JlYWQnLFxuICAgICAgICBNQVJLX1NUT1JZX0FTX1JFQUQ6ICduZXdzRmVlZDptYXJrU3RvcnlBc1JlYWQnXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIEFDS05PV0xFREdFRDogJ25ld3NGZWVkOmFja25vd2xlZGdlZCcsXG4gICAgICAgIFJFQUQ6ICduZXdzRmVlZDpyZWFkJyxcbiAgICAgICAgUkVBRF9BTEw6ICduZXdzRmVlZDpyZWFkQWxsJyxcbiAgICAgICAgU1RPUklFU19GRVRDSEVEOiAnbmV3c0ZlZWQ6c3Rvcmllc0ZldGNoZWQnLFxuICAgICAgICBTVE9SWV9SRUFEOiAnbmV3c0ZlZWQ6c3RvcnlSZWFkJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBOT1RJRklDQVRJT05fUFJFRkVSRU5DRVNfRFJPUERPV046IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgVVBEQVRFX1NFTEVDVEVEOiAndXBkYXRlU2VsZWN0ZWQnXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIFNFTEVDVEVEX1VQREFURUQ6ICdub3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duOnNlbGVjdGVkVXBkYXRlZCdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgUEVSU09OX1BJQ0tFUjoge1xuICAgICAgQUNUSU9OUzoge1xuICAgICAgICBBRERfVVNFUjogJ2FkZFBpY2tlZFVzZXInLFxuICAgICAgICBSRU1PVkVfVVNFUjogJ3JlbW92ZVBpY2tlZFVzZXInLFxuICAgICAgICBVUERBVEVfVVNFUjogJ3VwZGF0ZVBpY2tlZFVzZXInXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIFVTRVJfQURERUQ6ICdwZXJzb25QaWNrZXI6dXNlckFkZGVkJyxcbiAgICAgICAgVVNFUl9SRU1PVkVEOiAncGVyc29uUGlja2VyOnVzZXJSZW1vdmVkJyxcbiAgICAgICAgVVNFUl9VUERBVEVEOiAncGVyc29uUGlja2VyOnVzZXJVcGRhdGVkJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBUQUdfTElTVDoge1xuICAgICAgQUNUSU9OUzoge1xuICAgICAgICBBRERfVEFHOiAnYWRkVGFnJyxcbiAgICAgICAgUkVNT1ZFX1RBRzogJ3JlbW92ZVRhZydcbiAgICAgIH0sXG4gICAgICBFVkVOVFM6IHtcbiAgICAgICAgVEFHX0FEREVEOiAndGV4dENvbXBsZXRlOnRhZ0FkZGVkJyxcbiAgICAgICAgVEFHX1JFTU9WRUQ6ICd0YWdMaXN0OnRhZ1JlbW92ZWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIFRFWFRfQ09NUExFVEU6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUREX1RBRzogJ2FkZFRhZydcbiAgICAgIH0sXG4gICAgICBFVkVOVFM6IHtcbiAgICAgICAgRElEX01PVU5UOiAndGV4dENvbXBsZXRlOmRpZE1vdW50JyxcbiAgICAgICAgVEFHX0FEREVEOiAndGV4dENvbXBsZXRlOnRhZ0FkZGVkJ1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENPTlNUQU5UUztcbiAgfVxuXG4gIHdpbmRvdy5DT05TVEFOVFMgPSBDT05TVEFOVFM7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgX2NhbGxiYWNrcyA9IFtdO1xuXG4gIHZhciBEaXNwYXRjaGVyID0gXy5leHRlbmQoRnVuY3Rpb24ucHJvdG90eXBlLCB7XG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICBfY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuXG4gICAgICAvLyBSZXR1cm5pbmcgdGhlIGNhbGxiYWNrJ3MgaW5kZXggYWxsb3dzXG4gICAgICAvLyBleHBsaWNpdCByZWZlcmVuY2VzIHRvIHRoZSBjYWxsYmFja1xuICAgICAgLy8gb3V0c2lkZSBvZiB0aGUgZGlzcGF0Y2hlclxuICAgICAgcmV0dXJuIF9jYWxsYmFja3MubGVuZ3RoIC0gMTtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2g6IGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICAgIGlmIChfLmlzRW1wdHkoX2NhbGxiYWNrcykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IF9jYWxsYmFja3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIF9jYWxsYmFja3NbaV0ocGF5bG9hZCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIGlmIChfY2FsbGJhY2tzW2luZGV4XSkge1xuICAgICAgICBfY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgICBfY2FsbGJhY2tzID0gW107XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERpc3BhdGNoZXI7XG4gIH1cblxuICB3aW5kb3cuRGlzcGF0Y2hlciA9IERpc3BhdGNoZXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIERyb3Bkb3duVG9nZ2xlck1peGluID0ge1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IFsnaWNvbicsICduYXZiYXItaWNvbicsIHRoaXMucHJvcHMuaWNvbkNsYXNzXTtcbiAgICAgIHZhciB0b3RhbCA9IHRoaXMuYmFkZ2VDb3VudCgpO1xuICAgICAgdmFyIGJhZGdlID0gbnVsbDtcblxuICAgICAgaWYgKHRvdGFsID4gMCkge1xuICAgICAgICBiYWRnZSA9IHRoaXMuYmFkZ2UodG90YWwpO1xuICAgICAgICBjbGFzc2VzLnB1c2goJ2dseXBoaWNvbi1oaWdobGlnaHQnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMuaHJlZiwgJ2RhdGEtdG9nZ2xlJzogXCJkcm9wZG93blwiLCBvbkNsaWNrOiB0aGlzLmFja25vd2xlZGdlfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogY2xhc3Nlcy5qb2luKCcgJyl9KSwgXG4gICAgICAgICAgYmFkZ2UsIFxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidmlzaWJsZS14cy1pbmxpbmVcIiwgc3R5bGU6IHsgJ21hcmdpbi1sZWZ0JzogJzVweCd9fSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLmxhYmVsXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERyb3Bkb3duVG9nZ2xlck1peGluO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5Ecm9wZG93blRvZ2dsZXJNaXhpbiA9IERyb3Bkb3duVG9nZ2xlck1peGluO1xuICB9XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xudmFyIE5ld3NGZWVkVXNlcnNTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9uZXdzX2ZlZWRfdXNlcnNfc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgTmV3c0ZlZWRNaXhpbiA9IHtcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5yZWZzLnNwaW5uZXIuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIG9wdHMgPSB0aGlzLnNwaW5uZXJPcHRpb25zIHx8IHtcbiAgICAgICAgbGluZXM6IDEzLFxuICAgICAgICBsZW5ndGg6IDMwLFxuICAgICAgICByYWRpdXM6IDU1XG4gICAgICB9O1xuXG4gICAgICB2YXIgc3Bpbm5lciA9IHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4oKTtcblxuICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHNwaW5uZXIuZWwpO1xuICAgIH0sXG5cbiAgICBnZXRTdG9yaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHN0b3JpZXM6IE5ld3NGZWVkU3RvcmUuZ2V0U3RvcmllcygpLFxuICAgICAgICBhY3RvcnM6IE5ld3NGZWVkVXNlcnNTdG9yZS5nZXRVc2VycygpXG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNlbGYuc3RhdGUuc3Rvcmllcy5sZW5ndGgpIHtcbiAgICAgICAgICBzZWxmLnNwaW5uZXIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE5ld3NGZWVkTWl4aW47XG4gIH0gZWxzZSB7XG4gICAgd2luZG93Lk5ld3NGZWVkTWl4aW4gPSBOZXdzRmVlZE1peGluO1xuICB9XG59KSgpO1xuIiwidmFyIHhociA9IHJlcXVpcmUoJy4uL3hocicpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgcnJNZXRhVGFnID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoJ3JlYWQtcmFwdG9yLXVybCcpO1xuICB2YXIgUkVBRF9SQVBUT1JfVVJMID0gcnJNZXRhVGFnICYmIHJyTWV0YVRhZ1swXSAmJiByck1ldGFUYWdbMF0uY29udGVudDtcblxuICB2YXIgX2NoYXRSb29tcyA9IHt9O1xuICB2YXIgX3NvcnRLZXlzID0gW107XG4gIHZhciBfb3B0aW1pc3RpY2FsbHlVcGRhdGVkQ2hhdFJvb21zID0ge307XG4gIHZhciBfZGVmZXJyZWQgPSBbXTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG4gIHZhciBub29wID0gZnVuY3Rpb24oKSB7fTtcblxuICB2YXIgX25vdGlmaWNhdGlvbnNTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgICdjaGF0OmFja25vd2xlZGdlJzogbm9vcCxcblxuICAgICdjaGF0Om1hcmtSb29tQXNSZWFkJzogZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgICAgd2luZG93Lnhoci5ub0NzcmZHZXQocGF5bG9hZC5yZWFkcmFwdG9yX3VybCk7XG5cbiAgICAgIF9vcHRpbWlzdGljYWxseVVwZGF0ZWRDaGF0Um9vbXNbcGF5bG9hZC5pZF0gPSB7XG4gICAgICAgIGxhc3RfcmVhZF9hdDogbW9tZW50KCkudW5peCgpXG4gICAgICB9O1xuXG4gICAgICB0aGlzLmVtaXQoX2RlZmVycmVkLnBvcCgpKTtcbiAgICB9LFxuXG4gICAgJ2NoYXQ6ZmV0Y2hDaGF0Um9vbXMnOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgIHdpbmRvdy54aHIuZ2V0KHVybCwgdGhpcy5oYW5kbGVGZXRjaGVkQ2hhdFJvb21zLmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBnZXRVbnJlYWRDb3VudDogZnVuY3Rpb24oYWNrbm93bGVkZ2VkQXQpIHtcbiAgICAgIHZhciBjb3VudCA9IF8uY291bnRCeShcbiAgICAgICAgX2NoYXRSb29tcyxcbiAgICAgICAgZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgICAgICBpZiAoYWNrbm93bGVkZ2VkQXQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRyeS51cGRhdGVkID4gYWNrbm93bGVkZ2VkQXQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICByZXR1cm4gY291bnQudHJ1ZSB8fCAwO1xuICAgIH0sXG5cbiAgICBoYW5kbGVGZXRjaGVkQ2hhdFJvb21zOiBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2hhdFJvb21zID0gZGF0YS5jaGF0X3Jvb21zO1xuICAgICAgX3NvcnRLZXlzID0gZGF0YS5zb3J0X2tleXM7XG5cbiAgICAgIHZhciB1cmwgPSBSRUFEX1JBUFRPUl9VUkwgK1xuICAgICAgICAnL3JlYWRlcnMvJyArXG4gICAgICAgIGFwcC5jdXJyZW50VXNlcigpLmdldCgnaWQnKSArXG4gICAgICAgICcvYXJ0aWNsZXM/JyArXG4gICAgICAgIF8ubWFwKFxuICAgICAgICAgIGNoYXRSb29tcyxcbiAgICAgICAgICBmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2tleT0nICsgci5pZFxuICAgICAgICAgIH1cbiAgICAgICAgKS5qb2luKCcmJyk7XG5cbiAgICAgIHdpbmRvdy54aHIubm9Dc3JmR2V0KHVybCwgdGhpcy5oYW5kbGVSZWFkUmFwdG9yKGNoYXRSb29tcykpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVSZWFkUmFwdG9yOiBmdW5jdGlvbihjaGF0Um9vbXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiByZWFkUmFwdG9yQ2FsbGJhY2soZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmIChlcnIpIHsgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTsgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXRSb29tcyA9IF8ucmVkdWNlKFxuICAgICAgICAgIGNoYXRSb29tcyxcbiAgICAgICAgICBmdW5jdGlvbihoLCBjaGF0Um9vbSkge1xuICAgICAgICAgICAgaFtjaGF0Um9vbS5pZF0gPSBjaGF0Um9vbTtcbiAgICAgICAgICAgIGhbY2hhdFJvb20uaWRdLmxhc3RfcmVhZF9hdCA9IDA7XG5cbiAgICAgICAgICAgIHJldHVybiBoO1xuICAgICAgICAgIH0sXG4gICAgICAgICAge31cbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmFwcGx5UmVhZFRpbWVzKGRhdGEsIGNoYXRSb29tcyk7XG4gICAgICAgIHRoaXMuc2V0Q2hhdFJvb21zKGNoYXRSb29tcyk7XG4gICAgICAgIHRoaXMuZW1pdChfZGVmZXJyZWQucG9wKCkpO1xuICAgICAgfS5iaW5kKHRoaXMpO1xuICAgIH0sXG5cbiAgICBhcHBseVJlYWRUaW1lczogZnVuY3Rpb24oZGF0YSwgY2hhdFJvb21zKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBkYXR1bSA9IGRhdGFbaV07XG5cbiAgICAgICAgaWYgKGRhdHVtLmxhc3RfcmVhZF9hdCAmJiBjaGF0Um9vbXNbZGF0dW0ua2V5XSkge1xuICAgICAgICAgIGNoYXRSb29tc1tkYXR1bS5rZXldLmxhc3RfcmVhZF9hdCA9IGRhdHVtLmxhc3RfcmVhZF9hdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRDaGF0Um9vbTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiBfY2hhdFJvb21zW2lkXTtcbiAgICB9LFxuXG4gICAgZ2V0Q2hhdFJvb21zOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfY2hhdFJvb21zO1xuICAgIH0sXG5cbiAgICBnZXRTb3J0S2V5czogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX3NvcnRLZXlzO1xuICAgIH0sXG5cbiAgICBzZXRDaGF0Um9vbXM6IGZ1bmN0aW9uKGNoYXRSb29tcykge1xuICAgICAgX2NoYXRSb29tcyA9IGNoYXRSb29tcztcblxuICAgICAgdmFyIGtleXMgPSBfLmtleXMoX29wdGltaXN0aWNhbGx5VXBkYXRlZENoYXRSb29tcylcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoX2NoYXRSb29tc1trZXlzW2ldXSkge1xuICAgICAgICAgIF9jaGF0Um9vbXNba2V5c1tpXV0gPSBfLmV4dGVuZChfY2hhdFJvb21zW2tleXNbaV1dLCBfb3B0aW1pc3RpY2FsbHlVcGRhdGVkQ2hhdFJvb21zW2tleXNbaV1dKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIF9vcHRpbWlzdGljYWxseVVwZGF0ZWRDaGF0Um9vbXMgPSB7fVxuICAgIH0sXG5cbiAgICByZW1vdmVDaGF0Um9vbTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIGRlbGV0ZSBfY2hhdFJvb21zW2lkXVxuICAgIH0sXG5cbiAgICByZW1vdmVBbGxDaGF0Um9vbXM6IGZ1bmN0aW9uKCkge1xuICAgICAgX2NoYXRSb29tcyA9IHt9O1xuICAgIH0sXG5cbiAgICBtb3N0UmVjZW50bHlVcGRhdGVkQ2hhdFJvb206IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKF8ua2V5cyhfY2hhdFJvb21zKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfLm1heChfLnZhbHVlcyhfY2hhdFJvb21zKSwgZnVuYy5kb3QoJ3VwZGF0ZWQnKSk7XG4gICAgfSxcbiAgfSk7XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcbiAgICB2YXIgc3luYyA9IHBheWxvYWQuc3luYztcblxuICAgIGlmICghX3N0b3JlW2FjdGlvbl0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBfc3RvcmVbYWN0aW9uXShkYXRhKTtcblxuICAgIGlmIChzeW5jKSB7XG4gICAgICByZXR1cm4gX3N0b3JlLmVtaXQoZXZlbnQpO1xuICAgIH1cblxuICAgIF9kZWZlcnJlZC5wdXNoKGV2ZW50KTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfbm90aWZpY2F0aW9uc1N0b3JlO1xuICB9XG5cbiAgd2luZG93LkNoYXROb3RpZmljYXRpb25zU3RvcmUgPSBfbm90aWZpY2F0aW9uc1N0b3JlO1xufSkoKTtcbiIsInZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgLy8geyB1c2VyOiBVc2VyLCBjb2luczogTnVtYmVyIH1cbiAgdmFyIF91c2Vyc0FuZENvaW5zID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuICB2YXIgX2NvaW5Pd25lcnNoaXBTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIGFkZFVzZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB1c2VyQW5kQ29pbnMgPSBkYXRhLnVzZXJBbmRDb2lucztcblxuICAgICAgaWYgKF9zZWFyY2hVc2Vycyh1c2VyQW5kQ29pbnMudXNlcm5hbWUpICE9PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF91c2Vyc0FuZENvaW5zLnB1c2godXNlckFuZENvaW5zKTtcbiAgICB9LFxuXG4gICAgZ2V0VXNlcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFVzZXJzKGRhdGEudXNlcm5hbWUpO1xuXG4gICAgICByZXR1cm4gX3VzZXJzQW5kQ29pbnNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICBnZXRVc2VyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX3VzZXJzQW5kQ29pbnM7XG4gICAgfSxcblxuICAgIHVwZGF0ZVVzZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB1c2VyQW5kQ29pbnMgPSBkYXRhLnVzZXJBbmRDb2lucztcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hVc2Vycyh1c2VyQW5kQ29pbnMudXNlcm5hbWUpO1xuXG4gICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgX3VzZXJzQW5kQ29pbnNbaW5kZXhdID0gdXNlckFuZENvaW5zO1xuXG4gICAgICByZXR1cm4gX3VzZXJzQW5kQ29pbnNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICByZW1vdmVVc2VyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdXNlckFuZENvaW5zID0gZGF0YS51c2VyQW5kQ29pbnM7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoVXNlcnModXNlckFuZENvaW5zLnVzZXJuYW1lKTtcblxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgX3VzZXJzQW5kQ29pbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0VXNlcnM6IGZ1bmN0aW9uKHVzZXJzKSB7XG4gICAgICBfdXNlcnNBbmRDb2lucyA9IHVzZXJzO1xuICAgIH0sXG5cbiAgICByZW1vdmVBbGxVc2VyczogZnVuY3Rpb24oKSB7XG4gICAgICBfdXNlcnNBbmRDb2lucyA9IFtdO1xuICAgIH1cbiAgfSk7XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcblxuICAgIF9zdG9yZVthY3Rpb25dICYmIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuICAgIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gX3NlYXJjaFVzZXJzKHVzZXJuYW1lKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBfdXNlcnNBbmRDb2lucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciB1c2VyQW5kQ29pbnMgPSBfdXNlcnNBbmRDb2luc1tpXTtcblxuICAgICAgaWYgKHVzZXJBbmRDb2lucy51c2VybmFtZSA9PT0gdXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfY29pbk93bmVyc2hpcFN0b3JlO1xuICB9XG5cbiAgd2luZG93LkNvaW5Pd25lcnNoaXBTdG9yZSA9IF9jb2luT3duZXJzaGlwU3RvcmU7XG59KSgpO1xuIiwidmFyIHhociA9IHJlcXVpcmUoJy4uL3hocicpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX2ludGVyZXN0cyA9IFsnY29kZScsICdkZXNpZ24nXTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG5cbiAgdmFyIF9pbnRlcmVzdFN0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgYWRkSW50ZXJlc3Q6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICBpZiAoIWludGVyZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKF9pbnRlcmVzdHMuaW5kZXhPZihpbnRlcmVzdCkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgX2ludGVyZXN0cy5wdXNoKGludGVyZXN0KTtcbiAgICB9LFxuXG4gICAgZ2V0SW50ZXJlc3RzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfaW50ZXJlc3RzO1xuICAgIH0sXG5cbiAgICByZW1vdmVJbnRlcmVzdDogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIHZhciBpbmRleCA9IF9pbnRlcmVzdHMuaW5kZXhPZihpbnRlcmVzdCk7XG5cbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIF9pbnRlcmVzdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIF9pbnRlcmVzdHMucG9wKCk7XG4gICAgfSxcblxuICAgIHNldEludGVyZXN0czogZnVuY3Rpb24oaW50ZXJlc3RzKSB7XG4gICAgICBfaW50ZXJlc3RzID0gaW50ZXJlc3RzO1xuICAgIH0sXG5cbiAgICByZW1vdmVBbGxJbnRlcmVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgX2ludGVyZXN0cyA9IFsnY29kZScsICdkZXNpZ24nXTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG5cbiAgICBfc3RvcmVbYWN0aW9uXSAmJiBfc3RvcmVbYWN0aW9uXShkYXRhKTtcbiAgICBfc3RvcmUuZW1pdChldmVudCk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2ludGVyZXN0U3RvcmU7XG4gIH1cbiAgXG4gIHdpbmRvdy5JbnRlcmVzdFN0b3JlID0gX2ludGVyZXN0U3RvcmU7XG59KSgpO1xuIiwidmFyIHhociA9IHJlcXVpcmUoJy4uL3hocicpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcbnZhciBOZXdzRmVlZFVzZXJzU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3VzZXJzX3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIHJyTWV0YVRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdyZWFkLXJhcHRvci11cmwnKTtcbiAgdmFyIFJFQURfUkFQVE9SX1VSTCA9IHJyTWV0YVRhZyAmJiByck1ldGFUYWdbMF0gJiYgcnJNZXRhVGFnWzBdLmNvbnRlbnQ7XG5cbiAgdmFyIF9zdG9yaWVzID0ge307XG4gIHZhciBfb3B0aW1pc3RpY1N0b3JpZXMgPSB7fTtcbiAgdmFyIF9kZWZlcnJlZCA9IFtdO1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcblxuICB2YXIgX25ld3NGZWVkU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICBhZGRTdG9yeTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0b3J5ID0gZGF0YS5zdG9yeTtcblxuICAgICAgX3N0b3JpZXNbc3Rvcnkua2V5XSA9IHN0b3J5O1xuICAgIH0sXG5cbiAgICBhZGRTdG9yaWVzOiBmdW5jdGlvbihzdG9yaWVzKSB7XG4gICAgICBpZiAoIXN0b3JpZXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0b3JpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBzdG9yeSA9IHN0b3JpZXNbaV07XG5cbiAgICAgICAgX3N0b3JpZXNbc3Rvcnkua2V5XSA9IHN0b3J5O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBhcHBseVJlYWRUaW1lczogZnVuY3Rpb24oZGF0YSwgc3Rvcmllcykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgZGF0dW0gPSBkYXRhW2ldO1xuXG4gICAgICAgIGlmIChkYXR1bS5sYXN0X3JlYWRfYXQgJiYgc3Rvcmllc1tkYXR1bS5rZXldKSB7XG4gICAgICAgICAgc3Rvcmllc1tkYXR1bS5rZXldLmxhc3RfcmVhZF9hdCA9IGRhdHVtLmxhc3RfcmVhZF9hdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoYW5kbGVGZXRjaGVkU3RvcmllczogZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdXNlcnMgPSBkYXRhLnVzZXJzO1xuICAgICAgICB2YXIgc3RvcmllcyA9IGRhdGEuc3RvcmllcztcblxuICAgICAgICBOZXdzRmVlZFVzZXJzU3RvcmUuc2V0VXNlcnModXNlcnMpO1xuXG4gICAgICAgIHZhciB1cmwgPSBSRUFEX1JBUFRPUl9VUkwgK1xuICAgICAgICAgICcvcmVhZGVycy8nICtcbiAgICAgICAgICBhcHAuY3VycmVudFVzZXIoKS5nZXQoJ2lkJykgK1xuICAgICAgICAgICcvYXJ0aWNsZXM/JyArXG4gICAgICAgICAgXy5tYXAoXG4gICAgICAgICAgICBzdG9yaWVzLFxuICAgICAgICAgICAgZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgICByZXR1cm4gJ2tleT1TdG9yeV8nICsgcy5pZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICkuam9pbignJicpXG5cbiAgICAgICAgd2luZG93Lnhoci5ub0NzcmZHZXQodXJsLCBzZWxmLmhhbmRsZVJlYWRSYXB0b3Ioc3RvcmllcywgbWV0aG9kKSk7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgaGFuZGxlUmVhZFJhcHRvcjogZnVuY3Rpb24oc3RvcmllcywgbWV0aG9kKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiByZWFkUmFwdG9yQ2FsbGJhY2soZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RvcmllcyA9IF8ucmVkdWNlKFxuICAgICAgICAgIHN0b3JpZXMsXG4gICAgICAgICAgZnVuY3Rpb24oaGFzaCwgc3RvcnkpIHtcbiAgICAgICAgICAgIGhhc2hbc3Rvcnkua2V5XSA9IHN0b3J5O1xuICAgICAgICAgICAgaGFzaFtzdG9yeS5rZXldLmxhc3RfcmVhZF9hdCA9IDA7XG5cbiAgICAgICAgICAgIHJldHVybiBoYXNoO1xuICAgICAgICAgIH0sXG4gICAgICAgICAge31cbiAgICAgICAgKTtcblxuICAgICAgICBzZWxmLmFwcGx5UmVhZFRpbWVzKGRhdGEsIHN0b3JpZXMpO1xuICAgICAgICBzZWxmW21ldGhvZF0oc3Rvcmllcyk7XG4gICAgICAgIHNlbGYuZW1pdChfZGVmZXJyZWQucG9wKCkpO1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOmFja25vd2xlZGdlJzogZnVuY3Rpb24odGltZXN0YW1wKSB7fSxcblxuICAgICduZXdzRmVlZDpmZXRjaFN0b3JpZXMnOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgIHdpbmRvdy54aHIuZ2V0KHVybCwgdGhpcy5oYW5kbGVGZXRjaGVkU3Rvcmllcygnc2V0U3RvcmllcycpKTtcbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOmZldGNoTW9yZVN0b3JpZXMnOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgIHdpbmRvdy54aHIuZ2V0KHVybCwgdGhpcy5oYW5kbGVGZXRjaGVkU3RvcmllcygnYWRkU3RvcmllcycpKTtcbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOm1hcmtBc1JlYWQnOiBmdW5jdGlvbihzdG9yeUlkKSB7XG4gICAgICB2YXIgdXJsID0gJy91c2VyL3RyYWNraW5nLycgKyBzdG9yeUlkO1xuXG4gICAgICB3aW5kb3cueGhyLmdldCh1cmwsIHRoaXMubWFya2VkQXNSZWFkKHN0b3J5SWQpKTtcbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOm1hcmtBbGxBc1JlYWQnOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB1bnJlYWQgPSBfLmZpbHRlcihfc3RvcmllcywgZnVuY3Rpb24oc3RvcnkpIHtcbiAgICAgICAgcmV0dXJuIHN0b3J5Lmxhc3RfcmVhZF9hdCA9PSBudWxsO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB1bnJlYWQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIChmdW5jdGlvbihqKSB7XG4gICAgICAgICAgdmFyIHN0b3J5ID0gdW5yZWFkW2pdO1xuXG4gICAgICAgICAgaWYgKCFzdG9yeS5sYXN0X3JlYWRfYXQpIHtcbiAgICAgICAgICAgIC8vIHdlIGRvIGFjdHVhbGx5IHdhbnQgdGhlIGlkIGhlcmUsIG5vdCB0aGUga2V5XG4gICAgICAgICAgICB2YXIgc3RvcnlJZCA9IHN0b3J5LmlkO1xuICAgICAgICAgICAgdmFyIHVybCA9ICcvdXNlci90cmFja2luZy8nICsgc3RvcnlJZDtcblxuICAgICAgICAgICAgd2luZG93Lnhoci5nZXQodXJsLCBzZWxmLm1hcmtlZEFzUmVhZChzdG9yeUlkLCB0cnVlLCAoaiArIDEgPT09IGwpKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KShpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgJ25ld3NGZWVkOm1hcmtTdG9yeUFzUmVhZCc6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBzdG9yeUlkID0gZGF0YS5rZXk7XG4gICAgICB2YXIgdXJsID0gZGF0YS5yZWFkcmFwdG9yX3VybDtcblxuICAgICAgd2luZG93Lnhoci5ub0NzcmZHZXQodXJsKTtcblxuICAgICAgX29wdGltaXN0aWNTdG9yaWVzW3N0b3J5SWRdID0ge1xuICAgICAgICBsYXN0X3JlYWRfYXQ6IG1vbWVudCgpLnVuaXgoKVxuICAgICAgfTtcblxuICAgICAgdGhpcy5lbWl0KF9kZWZlcnJlZC5wb3AoKSk7XG4gICAgfSxcblxuICAgIG1hcmtlZEFzUmVhZDogZnVuY3Rpb24oc3RvcnlJZCwgd2FpdCwgcmVhZHkpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIG1hcmtlZEFzUmVhZChlcnIsIGRhdGEpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3RvcnkgPSBzZWxmLmdldFN0b3J5KHN0b3J5SWQpO1xuXG4gICAgICAgIC8vIEZJWE1FOiBVc2UgdGhlIHZhbHVlIGZyb20gUmVhZHJhcHRvclxuICAgICAgICBzdG9yeS5sYXN0X3JlYWRfYXQgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICAgICAgaWYgKCF3YWl0KSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuZW1pdChfZGVmZXJyZWQucG9wKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRklYTUU6IFdlIHJlYWxseSBuZWVkIGEgcHJvcGVyIGV2ZW50IGVtaXR0ZXJcbiAgICAgICAgaWYgKHJlYWR5KSB7XG4gICAgICAgICAgc2VsZi5lbWl0KF9kZWZlcnJlZC5wb3AoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5lbWl0KF9kZWZlcnJlZFtfZGVmZXJyZWQubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFN0b3J5OiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFN0b3JpZXMoaWQpO1xuXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICByZXR1cm4gX3N0b3JpZXNbaW5kZXhdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgZ2V0U3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3RvcmllcyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpIGluIF9zdG9yaWVzKSB7XG4gICAgICAgIHN0b3JpZXMucHVzaChfc3Rvcmllc1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdG9yaWVzO1xuICAgIH0sXG5cbiAgICBnZXRVbnJlYWRDb3VudDogZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgICB2YXIgY291bnQgPSBfLmNvdW50QnkoXG4gICAgICAgIF9zdG9yaWVzLFxuICAgICAgICBmdW5jdGlvbihlbnRyeSkge1xuICAgICAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRyeS51cGRhdGVkID4gdGltZXN0YW1wXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICByZXR1cm4gY291bnQudHJ1ZSB8fCAwO1xuICAgIH0sXG5cbiAgICBzZXRTdG9yaWVzOiBmdW5jdGlvbihzdG9yaWVzKSB7XG4gICAgICBmb3IgKHZhciBzdG9yeSBpbiBfb3B0aW1pc3RpY1N0b3JpZXMpIHtcbiAgICAgICAgaWYgKHN0b3JpZXMuaGFzT3duUHJvcGVydHkoc3RvcnkpKSB7XG4gICAgICAgICAgc3Rvcmllc1tzdG9yeV0ubGFzdF9yZWFkX2F0ID0gX29wdGltaXN0aWNTdG9yaWVzW3N0b3J5XS5sYXN0X3JlYWRfYXQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgX29wdGltaXN0aWNTdG9yaWVzID0ge307XG5cbiAgICAgIF9zdG9yaWVzID0gc3RvcmllcztcbiAgICB9LFxuXG4gICAgcmVtb3ZlU3Rvcnk6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoU3RvcmllcyhpZCk7XG5cbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIF9zdG9yaWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbFN0b3JpZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgX3N0b3JpZXMgPSBbXTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zZWFyY2hTdG9yaWVzID0gZnVuY3Rpb24oaWQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IF9zdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKF9zdG9yaWVzW2ldLmlkID09PSBpZCkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuICAgIHZhciBzeW5jID0gcGF5bG9hZC5zeW5jO1xuXG4gICAgaWYgKCFfc3RvcmVbYWN0aW9uXSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuXG4gICAgaWYgKHN5bmMpIHtcbiAgICAgIHJldHVybiBfc3RvcmUuZW1pdChldmVudCk7XG4gICAgfVxuXG4gICAgX2RlZmVycmVkLnB1c2goZXZlbnQpO1xuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9uZXdzRmVlZFN0b3JlO1xuICB9XG4gIFxuICB3aW5kb3cuTmV3c0ZlZWRTdG9yZSA9IF9uZXdzRmVlZFN0b3JlO1xufSkoKTtcbiIsInZhciB4aHIgPSByZXF1aXJlKCcuLi94aHInKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF91c2VycyA9IHt9O1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcblxuICB2YXIgX25ld3NGZWVkVXNlcnNTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIHNldFVzZXJzOiBmdW5jdGlvbih1c2Vycykge1xuICAgICAgX3VzZXJzID0gdXNlcnM7XG4gICAgfSxcblxuICAgIGFkZFVzZXJzOiBmdW5jdGlvbih1c2Vycykge1xuICAgICAgZm9yICh2YXIgdXNlciBpbiB1c2Vycykge1xuICAgICAgICBpZiAoIV91c2Vycy5oYXNPd25Qcm9wZXJ0eSh1c2VyKSkge1xuICAgICAgICAgIF91c2Vyc1t1c2VyXSA9IHVzZXJzW3VzZXJdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFVzZXJzOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIF91c2VycztcbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsVXNlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgX3VzZXJzID0gW107XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9uZXdzRmVlZFVzZXJzU3RvcmU7XG4gIH1cblxuICB3aW5kb3cuTmV3c0ZlZWRVc2Vyc1N0b3JlID0gX25ld3NGZWVkVXNlcnNTdG9yZTtcbn0pKCk7XG4iLCJ2YXIgeGhyID0gcmVxdWlyZSgnLi4veGhyJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfc2VsZWN0ZWQ7XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuXG4gIHZhciBfZHJvcGRvd25TdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIHVwZGF0ZVNlbGVjdGVkOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXRlbSA9IGRhdGEuaXRlbTtcbiAgICAgIHZhciBwYXRoID0gZGF0YS5wYXRoO1xuXG4gICAgICB3aW5kb3cueGhyLnBvc3QocGF0aCk7XG5cbiAgICAgIF9zZWxlY3RlZCA9IGl0ZW07XG4gICAgfSxcblxuICAgIGdldFNlbGVjdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfc2VsZWN0ZWQ7XG4gICAgfSxcblxuICAgIHNldFNlbGVjdGVkOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICBfc2VsZWN0ZWQgPSBpdGVtO1xuICAgIH0sXG5cbiAgICByZW1vdmVTZWxlY3RlZDogZnVuY3Rpb24oKSB7XG4gICAgICBfc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9KTtcblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuXG4gICAgaWYgKCFfc3RvcmVbYWN0aW9uXSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIF9zdG9yZVthY3Rpb25dICYmIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuICAgIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfZHJvcGRvd25TdG9yZTtcbiAgfVxuICBcbiAgd2luZG93Lk5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd25TdG9yZSA9IF9kcm9wZG93blN0b3JlO1xufSkoKTtcbiIsInZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9wZW9wbGUgPSBbXTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG4gIHZhciBfcGVvcGxlU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIucmVtb3ZlKGRpc3BhdGNoSW5kZXgpO1xuICAgIH0sXG5cbiAgICBzZXRQZW9wbGU6IGZ1bmN0aW9uKHBlb3BsZSkge1xuICAgICAgX3Blb3BsZSA9IHBlb3BsZTtcbiAgICB9LFxuXG4gICAgZ2V0UGVvcGxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfcGVvcGxlO1xuICAgIH0sXG5cbiAgICBnZXRQZXJzb246IGZ1bmN0aW9uKHVzZXJuYW1lKSB7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoUGVvcGxlKHVzZXJuYW1lKTtcblxuICAgICAgcmV0dXJuIF9wZW9wbGVbaW5kZXhdO1xuICAgIH0sXG5cbiAgICBhZGRQZXJzb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIF9wZW9wbGUucHVzaChkYXRhLnVzZXIpO1xuXG4gICAgICByZXR1cm4gdGhpcy5nZXRQZW9wbGUoKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlUGVyc29uOiBmdW5jdGlvbih1c2VybmFtZSkge1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFBlb3BsZSh1c2VybmFtZSk7XG5cbiAgICAgIF9wZW9wbGUuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0UGVvcGxlKCk7XG4gICAgfVxuICB9KTtcblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuXG4gICAgX3N0b3JlW2FjdGlvbl0gJiYgX3N0b3JlW2FjdGlvbl0oZGF0YSk7XG4gICAgX3N0b3JlLmVtaXQoZXZlbnQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBfc2VhcmNoUGVvcGxlKHVzZXJuYW1lKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBfcGVvcGxlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKF9wZW9wbGVbaV0udXNlci51c2VybmFtZSA9PT0gdXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfcGVvcGxlU3RvcmU7XG4gIH1cbiAgXG4gIHdpbmRvdy5QZW9wbGVTdG9yZSA9IF9wZW9wbGVTdG9yZTtcbn0pKCk7XG4iLCJ2YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfcGVvcGxlID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuICB2YXIgX3BlcnNvblBpY2tlclN0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgYWRkUGVyc29uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdXNlciA9IGRhdGEudXNlcjtcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChfc2VhcmNoUGVvcGxlKHVzZXIudXNlcm5hbWUpICE9PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF9wZW9wbGUucHVzaCh1c2VyKTtcbiAgICB9LFxuXG4gICAgZ2V0UGVyc29uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoUGVvcGxlKGRhdGEudXNlci51c2VybmFtZSk7XG5cbiAgICAgIHJldHVybiBfcGVvcGxlW2luZGV4XTtcbiAgICB9LFxuXG4gICAgZ2V0UGVvcGxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfcGVvcGxlO1xuICAgIH0sXG5cbiAgICB1cGRhdGVQZXJzb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB1c2VyID0gZGF0YS51c2VyO1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFBlb3BsZSh1c2VyLnVzZXJuYW1lKTtcblxuICAgICAgX3Blb3BsZVtpbmRleF0gPSB1c2VyO1xuXG4gICAgICByZXR1cm4gX3Blb3BsZVtpbmRleF07XG4gICAgfSxcblxuICAgIHJlbW92ZVBlcnNvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHVzZXIgPSBkYXRhLnVzZXI7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoUGVvcGxlKHVzZXIudXNlcm5hbWUpO1xuXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBfcGVvcGxlLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldFBlb3BsZTogZnVuY3Rpb24odXNlcnMpIHtcbiAgICAgIF9wZW9wbGUgPSB1c2VycztcbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsUGVvcGxlOiBmdW5jdGlvbigpIHtcbiAgICAgIF9wZW9wbGUgPSBbXTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG5cbiAgICBfc3RvcmVbYWN0aW9uXSAmJiBfc3RvcmVbYWN0aW9uXShkYXRhKTtcbiAgICBfc3RvcmUuZW1pdChldmVudCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIF9zZWFyY2hQZW9wbGUodXNlcm5hbWUpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IF9wZW9wbGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgdXNlciA9IF9wZW9wbGVbaV07XG5cbiAgICAgIGlmICh1c2VyLnVzZXJuYW1lID09PSB1c2VybmFtZSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9wZXJzb25QaWNrZXJTdG9yZTtcbiAgfVxuXG4gIHdpbmRvdy5QZXJzb25QaWNrZXJTdG9yZSA9IF9wZXJzb25QaWNrZXJTdG9yZTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBTdG9yZSA9IF8uZXh0ZW5kKHt9LCB7XG4gICAgZW1pdDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBjYWxsYmFja3MgPSB0aGlzLmxpc3RlbmVycztcblxuICAgICAgaWYgKCFfLmlzRW1wdHkoY2FsbGJhY2tzKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBjYWxsYmFja3NbaV0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhZGRDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMgfHwgW107XG4gICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcblxuICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzLmxlbmd0aCAtIDE7XG4gICAgfSxcblxuICAgIHJlbW92ZUNoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihldmVudEluZGV4KSB7XG4gICAgICBpZiAodGhpcy5saXN0ZW5lcnMgJiYgdGhpcy5saXN0ZW5lcnNbZXZlbnRJbmRleF0pIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuc3BsaWNlKGV2ZW50SW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTdG9yZTtcbiAgfVxuXG4gIHdpbmRvdy5TdG9yZSA9IFN0b3JlO1xufSkoKTtcbiIsInZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF90YWdzID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuICB2YXIgX3RhZ0xpc3RTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIGFkZFRhZzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHRhZyA9IGRhdGEudGFnO1xuICAgICAgdmFyIHVybCA9IGRhdGEudXJsO1xuXG4gICAgICAvLyBXZSBkb24ndCB3YW50IGR1cGxpY2F0ZSB0YWdzXG4gICAgICBpZiAoX3NlYXJjaFRhZ3ModGFnKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfdGFncy5wdXNoKHRhZyk7XG5cbiAgICAgIHRoaXMucGVyc2lzdCh1cmwpO1xuICAgIH0sXG5cbiAgICBzZXRUYWdzOiBmdW5jdGlvbih0YWdzKSB7XG4gICAgICBfdGFncyA9IHRhZ3M7XG4gICAgfSxcblxuICAgIGdldFRhZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF90YWdzXG4gICAgfSxcblxuICAgIHJlbW92ZVRhZzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHRhZyA9IGRhdGEudGFnO1xuICAgICAgdmFyIHVybCA9IGRhdGEudXJsO1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFRhZ3ModGFnKTtcblxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgX3RhZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHVybCkge1xuICAgICAgICB0aGlzLnBlcnNpc3QodXJsKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcGVyc2lzdDogZnVuY3Rpb24odXJsKSB7XG4gICAgICBpZiAoIXVybCkgcmV0dXJuO1xuXG4gICAgICB2YXIgdGFncyA9IHRoaXMuZ2V0VGFncygpO1xuXG4gICAgICBpZiAoXy5pc0VtcHR5KHRhZ3MpKSB7XG4gICAgICAgIHRhZ3MgPSBbJyddO1xuICAgICAgfVxuXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgdGFzazoge1xuICAgICAgICAgICAgdGFnX2xpc3Q6IHRhZ3NcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB9LFxuXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbihqcXhociwgc3RhdHVzKSB7XG4gICAgICAgICAgY29uc29sZS5kaXIoc3RhdHVzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbFRhZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgX3RhZ3MgPSBbXTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG5cbiAgICBfc3RvcmVbYWN0aW9uXSAmJiBfc3RvcmVbYWN0aW9uXShkYXRhKTtcbiAgICBfc3RvcmUuZW1pdChldmVudCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIF9zZWFyY2hUYWdzKHRhZykge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gX3RhZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoX3RhZ3NbaV0gPT09IHRhZykge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3RhZ0xpc3RTdG9yZTtcbiAgfVxuXG4gIHdpbmRvdy5UYWdMaXN0U3RvcmUgPSBfdGFnTGlzdFN0b3JlO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIHhociA9IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKHBhdGgsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLnJlcXVlc3QoJ0dFVCcsIHBhdGgsIG51bGwsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgbm9Dc3JmR2V0OiBmdW5jdGlvbihwYXRoLCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5ub0NzcmZSZXF1ZXN0KCdHRVQnLCBwYXRoLCBudWxsLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIHBvc3Q6IGZ1bmN0aW9uKHBhdGgsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLnJlcXVlc3QoJ1BPU1QnLCBwYXRoLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKG1ldGhvZCwgcGF0aCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBwYXRoLCB0cnVlKTtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignWC1DU1JGLVRva2VuJywgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoJ2NzcmYtdG9rZW4nKVswXS5jb250ZW50KTtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHJlcXVlc3Quc2VuZChkYXRhKTtcblxuICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbm9Dc3JmUmVxdWVzdDogZnVuY3Rpb24obWV0aG9kLCBwYXRoLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCkge307XG4gICAgICB9XG5cbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHJlcXVlc3Qub3BlbihtZXRob2QsIHBhdGgsIHRydWUpO1xuICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmVxdWVzdC5zZW5kKGRhdGEpO1xuXG4gICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHhocjtcbiAgfVxuXG4gIHdpbmRvdy54aHIgPSB4aHI7XG59KSgpO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCBGZWxpeCBHbmFzc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG5cbiAgLyogQ29tbW9uSlMgKi9cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnKSAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KClcblxuICAvKiBBTUQgbW9kdWxlICovXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZmFjdG9yeSlcblxuICAvKiBCcm93c2VyIGdsb2JhbCAqL1xuICBlbHNlIHJvb3QuU3Bpbm5lciA9IGZhY3RvcnkoKVxufVxuKHRoaXMsIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgcHJlZml4ZXMgPSBbJ3dlYmtpdCcsICdNb3onLCAnbXMnLCAnTyddIC8qIFZlbmRvciBwcmVmaXhlcyAqL1xuICAgICwgYW5pbWF0aW9ucyA9IHt9IC8qIEFuaW1hdGlvbiBydWxlcyBrZXllZCBieSB0aGVpciBuYW1lICovXG4gICAgLCB1c2VDc3NBbmltYXRpb25zIC8qIFdoZXRoZXIgdG8gdXNlIENTUyBhbmltYXRpb25zIG9yIHNldFRpbWVvdXQgKi9cblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgZWxlbWVudHMuIElmIG5vIHRhZyBuYW1lIGlzIGdpdmVuLFxuICAgKiBhIERJViBpcyBjcmVhdGVkLiBPcHRpb25hbGx5IHByb3BlcnRpZXMgY2FuIGJlIHBhc3NlZC5cbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsKHRhZywgcHJvcCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnIHx8ICdkaXYnKVxuICAgICAgLCBuXG5cbiAgICBmb3IobiBpbiBwcm9wKSBlbFtuXSA9IHByb3Bbbl1cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGNoaWxkcmVuIGFuZCByZXR1cm5zIHRoZSBwYXJlbnQuXG4gICAqL1xuICBmdW5jdGlvbiBpbnMocGFyZW50IC8qIGNoaWxkMSwgY2hpbGQyLCAuLi4qLykge1xuICAgIGZvciAodmFyIGk9MSwgbj1hcmd1bWVudHMubGVuZ3RoOyBpPG47IGkrKylcbiAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChhcmd1bWVudHNbaV0pXG5cbiAgICByZXR1cm4gcGFyZW50XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGEgbmV3IHN0eWxlc2hlZXQgdG8gaG9sZCB0aGUgQGtleWZyYW1lIG9yIFZNTCBydWxlcy5cbiAgICovXG4gIHZhciBzaGVldCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZWwgPSBjcmVhdGVFbCgnc3R5bGUnLCB7dHlwZSA6ICd0ZXh0L2Nzcyd9KVxuICAgIGlucyhkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLCBlbClcbiAgICByZXR1cm4gZWwuc2hlZXQgfHwgZWwuc3R5bGVTaGVldFxuICB9KCkpXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb3BhY2l0eSBrZXlmcmFtZSBhbmltYXRpb24gcnVsZSBhbmQgcmV0dXJucyBpdHMgbmFtZS5cbiAgICogU2luY2UgbW9zdCBtb2JpbGUgV2Via2l0cyBoYXZlIHRpbWluZyBpc3N1ZXMgd2l0aCBhbmltYXRpb24tZGVsYXksXG4gICAqIHdlIGNyZWF0ZSBzZXBhcmF0ZSBydWxlcyBmb3IgZWFjaCBsaW5lL3NlZ21lbnQuXG4gICAqL1xuICBmdW5jdGlvbiBhZGRBbmltYXRpb24oYWxwaGEsIHRyYWlsLCBpLCBsaW5lcykge1xuICAgIHZhciBuYW1lID0gWydvcGFjaXR5JywgdHJhaWwsIH5+KGFscGhhKjEwMCksIGksIGxpbmVzXS5qb2luKCctJylcbiAgICAgICwgc3RhcnQgPSAwLjAxICsgaS9saW5lcyAqIDEwMFxuICAgICAgLCB6ID0gTWF0aC5tYXgoMSAtICgxLWFscGhhKSAvIHRyYWlsICogKDEwMC1zdGFydCksIGFscGhhKVxuICAgICAgLCBwcmVmaXggPSB1c2VDc3NBbmltYXRpb25zLnN1YnN0cmluZygwLCB1c2VDc3NBbmltYXRpb25zLmluZGV4T2YoJ0FuaW1hdGlvbicpKS50b0xvd2VyQ2FzZSgpXG4gICAgICAsIHByZSA9IHByZWZpeCAmJiAnLScgKyBwcmVmaXggKyAnLScgfHwgJydcblxuICAgIGlmICghYW5pbWF0aW9uc1tuYW1lXSkge1xuICAgICAgc2hlZXQuaW5zZXJ0UnVsZShcbiAgICAgICAgJ0AnICsgcHJlICsgJ2tleWZyYW1lcyAnICsgbmFtZSArICd7JyArXG4gICAgICAgICcwJXtvcGFjaXR5OicgKyB6ICsgJ30nICtcbiAgICAgICAgc3RhcnQgKyAnJXtvcGFjaXR5OicgKyBhbHBoYSArICd9JyArXG4gICAgICAgIChzdGFydCswLjAxKSArICcle29wYWNpdHk6MX0nICtcbiAgICAgICAgKHN0YXJ0K3RyYWlsKSAlIDEwMCArICcle29wYWNpdHk6JyArIGFscGhhICsgJ30nICtcbiAgICAgICAgJzEwMCV7b3BhY2l0eTonICsgeiArICd9JyArXG4gICAgICAgICd9Jywgc2hlZXQuY3NzUnVsZXMubGVuZ3RoKVxuXG4gICAgICBhbmltYXRpb25zW25hbWVdID0gMVxuICAgIH1cblxuICAgIHJldHVybiBuYW1lXG4gIH1cblxuICAvKipcbiAgICogVHJpZXMgdmFyaW91cyB2ZW5kb3IgcHJlZml4ZXMgYW5kIHJldHVybnMgdGhlIGZpcnN0IHN1cHBvcnRlZCBwcm9wZXJ0eS5cbiAgICovXG4gIGZ1bmN0aW9uIHZlbmRvcihlbCwgcHJvcCkge1xuICAgIHZhciBzID0gZWwuc3R5bGVcbiAgICAgICwgcHBcbiAgICAgICwgaVxuXG4gICAgcHJvcCA9IHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpXG4gICAgZm9yKGk9MDsgaTxwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcHAgPSBwcmVmaXhlc1tpXStwcm9wXG4gICAgICBpZihzW3BwXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHBcbiAgICB9XG4gICAgaWYoc1twcm9wXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcFxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgbXVsdGlwbGUgc3R5bGUgcHJvcGVydGllcyBhdCBvbmNlLlxuICAgKi9cbiAgZnVuY3Rpb24gY3NzKGVsLCBwcm9wKSB7XG4gICAgZm9yICh2YXIgbiBpbiBwcm9wKVxuICAgICAgZWwuc3R5bGVbdmVuZG9yKGVsLCBuKXx8bl0gPSBwcm9wW25dXG5cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWxscyBpbiBkZWZhdWx0IHZhbHVlcy5cbiAgICovXG4gIGZ1bmN0aW9uIG1lcmdlKG9iaikge1xuICAgIGZvciAodmFyIGk9MTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlZiA9IGFyZ3VtZW50c1tpXVxuICAgICAgZm9yICh2YXIgbiBpbiBkZWYpXG4gICAgICAgIGlmIChvYmpbbl0gPT09IHVuZGVmaW5lZCkgb2JqW25dID0gZGVmW25dXG4gICAgfVxuICAgIHJldHVybiBvYmpcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSBwYWdlLW9mZnNldCBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICovXG4gIGZ1bmN0aW9uIHBvcyhlbCkge1xuICAgIHZhciBvID0geyB4OmVsLm9mZnNldExlZnQsIHk6ZWwub2Zmc2V0VG9wIH1cbiAgICB3aGlsZSgoZWwgPSBlbC5vZmZzZXRQYXJlbnQpKVxuICAgICAgby54Kz1lbC5vZmZzZXRMZWZ0LCBvLnkrPWVsLm9mZnNldFRvcFxuXG4gICAgcmV0dXJuIG9cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsaW5lIGNvbG9yIGZyb20gdGhlIGdpdmVuIHN0cmluZyBvciBhcnJheS5cbiAgICovXG4gIGZ1bmN0aW9uIGdldENvbG9yKGNvbG9yLCBpZHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGNvbG9yID09ICdzdHJpbmcnID8gY29sb3IgOiBjb2xvcltpZHggJSBjb2xvci5sZW5ndGhdXG4gIH1cblxuICAvLyBCdWlsdC1pbiBkZWZhdWx0c1xuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBsaW5lczogMTIsICAgICAgICAgICAgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgbGVuZ3RoOiA3LCAgICAgICAgICAgIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgd2lkdGg6IDUsICAgICAgICAgICAgIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgIHJhZGl1czogMTAsICAgICAgICAgICAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICByb3RhdGU6IDAsICAgICAgICAgICAgLy8gUm90YXRpb24gb2Zmc2V0XG4gICAgY29ybmVyczogMSwgICAgICAgICAgIC8vIFJvdW5kbmVzcyAoMC4uMSlcbiAgICBjb2xvcjogJyMwMDAnLCAgICAgICAgLy8gI3JnYiBvciAjcnJnZ2JiXG4gICAgZGlyZWN0aW9uOiAxLCAgICAgICAgIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcbiAgICBzcGVlZDogMSwgICAgICAgICAgICAgLy8gUm91bmRzIHBlciBzZWNvbmRcbiAgICB0cmFpbDogMTAwLCAgICAgICAgICAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcbiAgICBvcGFjaXR5OiAxLzQsICAgICAgICAgLy8gT3BhY2l0eSBvZiB0aGUgbGluZXNcbiAgICBmcHM6IDIwLCAgICAgICAgICAgICAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KClcbiAgICB6SW5kZXg6IDJlOSwgICAgICAgICAgLy8gVXNlIGEgaGlnaCB6LWluZGV4IGJ5IGRlZmF1bHRcbiAgICBjbGFzc05hbWU6ICdzcGlubmVyJywgLy8gQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgZWxlbWVudFxuICAgIHRvcDogJzUwJScsICAgICAgICAgICAvLyBjZW50ZXIgdmVydGljYWxseVxuICAgIGxlZnQ6ICc1MCUnLCAgICAgICAgICAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScgIC8vIGVsZW1lbnQgcG9zaXRpb25cbiAgfVxuXG4gIC8qKiBUaGUgY29uc3RydWN0b3IgKi9cbiAgZnVuY3Rpb24gU3Bpbm5lcihvKSB7XG4gICAgdGhpcy5vcHRzID0gbWVyZ2UobyB8fCB7fSwgU3Bpbm5lci5kZWZhdWx0cywgZGVmYXVsdHMpXG4gIH1cblxuICAvLyBHbG9iYWwgZGVmYXVsdHMgdGhhdCBvdmVycmlkZSB0aGUgYnVpbHQtaW5zOlxuICBTcGlubmVyLmRlZmF1bHRzID0ge31cblxuICBtZXJnZShTcGlubmVyLnByb3RvdHlwZSwge1xuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgc3Bpbm5lciB0byB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnQuIElmIHRoaXMgaW5zdGFuY2UgaXMgYWxyZWFkeVxuICAgICAqIHNwaW5uaW5nLCBpdCBpcyBhdXRvbWF0aWNhbGx5IHJlbW92ZWQgZnJvbSBpdHMgcHJldmlvdXMgdGFyZ2V0IGIgY2FsbGluZ1xuICAgICAqIHN0b3AoKSBpbnRlcm5hbGx5LlxuICAgICAqL1xuICAgIHNwaW46IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgdGhpcy5zdG9wKClcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICwgbyA9IHNlbGYub3B0c1xuICAgICAgICAsIGVsID0gc2VsZi5lbCA9IGNzcyhjcmVhdGVFbCgwLCB7Y2xhc3NOYW1lOiBvLmNsYXNzTmFtZX0pLCB7cG9zaXRpb246IG8ucG9zaXRpb24sIHdpZHRoOiAwLCB6SW5kZXg6IG8uekluZGV4fSlcbiAgICAgICAgLCBtaWQgPSBvLnJhZGl1cytvLmxlbmd0aCtvLndpZHRoXG5cbiAgICAgIGNzcyhlbCwge1xuICAgICAgICBsZWZ0OiBvLmxlZnQsXG4gICAgICAgIHRvcDogby50b3BcbiAgICAgIH0pXG4gICAgICAgIFxuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQuZmlyc3RDaGlsZHx8bnVsbClcbiAgICAgIH1cblxuICAgICAgZWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Byb2dyZXNzYmFyJylcbiAgICAgIHNlbGYubGluZXMoZWwsIHNlbGYub3B0cylcblxuICAgICAgaWYgKCF1c2VDc3NBbmltYXRpb25zKSB7XG4gICAgICAgIC8vIE5vIENTUyBhbmltYXRpb24gc3VwcG9ydCwgdXNlIHNldFRpbWVvdXQoKSBpbnN0ZWFkXG4gICAgICAgIHZhciBpID0gMFxuICAgICAgICAgICwgc3RhcnQgPSAoby5saW5lcyAtIDEpICogKDEgLSBvLmRpcmVjdGlvbikgLyAyXG4gICAgICAgICAgLCBhbHBoYVxuICAgICAgICAgICwgZnBzID0gby5mcHNcbiAgICAgICAgICAsIGYgPSBmcHMvby5zcGVlZFxuICAgICAgICAgICwgb3N0ZXAgPSAoMS1vLm9wYWNpdHkpIC8gKGYqby50cmFpbCAvIDEwMClcbiAgICAgICAgICAsIGFzdGVwID0gZi9vLmxpbmVzXG5cbiAgICAgICAgOyhmdW5jdGlvbiBhbmltKCkge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG8ubGluZXM7IGorKykge1xuICAgICAgICAgICAgYWxwaGEgPSBNYXRoLm1heCgxIC0gKGkgKyAoby5saW5lcyAtIGopICogYXN0ZXApICUgZiAqIG9zdGVwLCBvLm9wYWNpdHkpXG5cbiAgICAgICAgICAgIHNlbGYub3BhY2l0eShlbCwgaiAqIG8uZGlyZWN0aW9uICsgc3RhcnQsIGFscGhhLCBvKVxuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLnRpbWVvdXQgPSBzZWxmLmVsICYmIHNldFRpbWVvdXQoYW5pbSwgfn4oMTAwMC9mcHMpKVxuICAgICAgICB9KSgpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZlxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBhbmQgcmVtb3ZlcyB0aGUgU3Bpbm5lci5cbiAgICAgKi9cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbCA9IHRoaXMuZWxcbiAgICAgIGlmIChlbCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSkgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcbiAgICAgICAgdGhpcy5lbCA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgZHJhd3MgdGhlIGluZGl2aWR1YWwgbGluZXMuIFdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgICAgKiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgKi9cbiAgICBsaW5lczogZnVuY3Rpb24oZWwsIG8pIHtcbiAgICAgIHZhciBpID0gMFxuICAgICAgICAsIHN0YXJ0ID0gKG8ubGluZXMgLSAxKSAqICgxIC0gby5kaXJlY3Rpb24pIC8gMlxuICAgICAgICAsIHNlZ1xuXG4gICAgICBmdW5jdGlvbiBmaWxsKGNvbG9yLCBzaGFkb3cpIHtcbiAgICAgICAgcmV0dXJuIGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgd2lkdGg6IChvLmxlbmd0aCtvLndpZHRoKSArICdweCcsXG4gICAgICAgICAgaGVpZ2h0OiBvLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICBiYWNrZ3JvdW5kOiBjb2xvcixcbiAgICAgICAgICBib3hTaGFkb3c6IHNoYWRvdyxcbiAgICAgICAgICB0cmFuc2Zvcm1PcmlnaW46ICdsZWZ0JyxcbiAgICAgICAgICB0cmFuc2Zvcm06ICdyb3RhdGUoJyArIH5+KDM2MC9vLmxpbmVzKmkrby5yb3RhdGUpICsgJ2RlZykgdHJhbnNsYXRlKCcgKyBvLnJhZGl1cysncHgnICsnLDApJyxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IChvLmNvcm5lcnMgKiBvLndpZHRoPj4xKSArICdweCdcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgZm9yICg7IGkgPCBvLmxpbmVzOyBpKyspIHtcbiAgICAgICAgc2VnID0gY3NzKGNyZWF0ZUVsKCksIHtcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICB0b3A6IDErfihvLndpZHRoLzIpICsgJ3B4JyxcbiAgICAgICAgICB0cmFuc2Zvcm06IG8uaHdhY2NlbCA/ICd0cmFuc2xhdGUzZCgwLDAsMCknIDogJycsXG4gICAgICAgICAgb3BhY2l0eTogby5vcGFjaXR5LFxuICAgICAgICAgIGFuaW1hdGlvbjogdXNlQ3NzQW5pbWF0aW9ucyAmJiBhZGRBbmltYXRpb24oby5vcGFjaXR5LCBvLnRyYWlsLCBzdGFydCArIGkgKiBvLmRpcmVjdGlvbiwgby5saW5lcykgKyAnICcgKyAxL28uc3BlZWQgKyAncyBsaW5lYXIgaW5maW5pdGUnXG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKG8uc2hhZG93KSBpbnMoc2VnLCBjc3MoZmlsbCgnIzAwMCcsICcwIDAgNHB4ICcgKyAnIzAwMCcpLCB7dG9wOiAyKydweCd9KSlcbiAgICAgICAgaW5zKGVsLCBpbnMoc2VnLCBmaWxsKGdldENvbG9yKG8uY29sb3IsIGkpLCAnMCAwIDFweCByZ2JhKDAsMCwwLC4xKScpKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBtZXRob2QgdGhhdCBhZGp1c3RzIHRoZSBvcGFjaXR5IG9mIGEgc2luZ2xlIGxpbmUuXG4gICAgICogV2lsbCBiZSBvdmVyd3JpdHRlbiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgKi9cbiAgICBvcGFjaXR5OiBmdW5jdGlvbihlbCwgaSwgdmFsKSB7XG4gICAgICBpZiAoaSA8IGVsLmNoaWxkTm9kZXMubGVuZ3RoKSBlbC5jaGlsZE5vZGVzW2ldLnN0eWxlLm9wYWNpdHkgPSB2YWxcbiAgICB9XG5cbiAgfSlcblxuXG4gIGZ1bmN0aW9uIGluaXRWTUwoKSB7XG5cbiAgICAvKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIFZNTCB0YWcgKi9cbiAgICBmdW5jdGlvbiB2bWwodGFnLCBhdHRyKSB7XG4gICAgICByZXR1cm4gY3JlYXRlRWwoJzwnICsgdGFnICsgJyB4bWxucz1cInVybjpzY2hlbWFzLW1pY3Jvc29mdC5jb206dm1sXCIgY2xhc3M9XCJzcGluLXZtbFwiPicsIGF0dHIpXG4gICAgfVxuXG4gICAgLy8gTm8gQ1NTIHRyYW5zZm9ybXMgYnV0IFZNTCBzdXBwb3J0LCBhZGQgYSBDU1MgcnVsZSBmb3IgVk1MIGVsZW1lbnRzOlxuICAgIHNoZWV0LmFkZFJ1bGUoJy5zcGluLXZtbCcsICdiZWhhdmlvcjp1cmwoI2RlZmF1bHQjVk1MKScpXG5cbiAgICBTcGlubmVyLnByb3RvdHlwZS5saW5lcyA9IGZ1bmN0aW9uKGVsLCBvKSB7XG4gICAgICB2YXIgciA9IG8ubGVuZ3RoK28ud2lkdGhcbiAgICAgICAgLCBzID0gMipyXG5cbiAgICAgIGZ1bmN0aW9uIGdycCgpIHtcbiAgICAgICAgcmV0dXJuIGNzcyhcbiAgICAgICAgICB2bWwoJ2dyb3VwJywge1xuICAgICAgICAgICAgY29vcmRzaXplOiBzICsgJyAnICsgcyxcbiAgICAgICAgICAgIGNvb3Jkb3JpZ2luOiAtciArICcgJyArIC1yXG4gICAgICAgICAgfSksXG4gICAgICAgICAgeyB3aWR0aDogcywgaGVpZ2h0OiBzIH1cbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICB2YXIgbWFyZ2luID0gLShvLndpZHRoK28ubGVuZ3RoKSoyICsgJ3B4J1xuICAgICAgICAsIGcgPSBjc3MoZ3JwKCksIHtwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiBtYXJnaW4sIGxlZnQ6IG1hcmdpbn0pXG4gICAgICAgICwgaVxuXG4gICAgICBmdW5jdGlvbiBzZWcoaSwgZHgsIGZpbHRlcikge1xuICAgICAgICBpbnMoZyxcbiAgICAgICAgICBpbnMoY3NzKGdycCgpLCB7cm90YXRpb246IDM2MCAvIG8ubGluZXMgKiBpICsgJ2RlZycsIGxlZnQ6IH5+ZHh9KSxcbiAgICAgICAgICAgIGlucyhjc3Modm1sKCdyb3VuZHJlY3QnLCB7YXJjc2l6ZTogby5jb3JuZXJzfSksIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogcixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IG8ud2lkdGgsXG4gICAgICAgICAgICAgICAgbGVmdDogby5yYWRpdXMsXG4gICAgICAgICAgICAgICAgdG9wOiAtby53aWR0aD4+MSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZpbHRlclxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgdm1sKCdmaWxsJywge2NvbG9yOiBnZXRDb2xvcihvLmNvbG9yLCBpKSwgb3BhY2l0eTogby5vcGFjaXR5fSksXG4gICAgICAgICAgICAgIHZtbCgnc3Ryb2tlJywge29wYWNpdHk6IDB9KSAvLyB0cmFuc3BhcmVudCBzdHJva2UgdG8gZml4IGNvbG9yIGJsZWVkaW5nIHVwb24gb3BhY2l0eSBjaGFuZ2VcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKG8uc2hhZG93KVxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKylcbiAgICAgICAgICBzZWcoaSwgLTIsICdwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQmx1cihwaXhlbHJhZGl1cz0yLG1ha2VzaGFkb3c9MSxzaGFkb3dvcGFjaXR5PS4zKScpXG5cbiAgICAgIGZvciAoaSA9IDE7IGkgPD0gby5saW5lczsgaSsrKSBzZWcoaSlcbiAgICAgIHJldHVybiBpbnMoZWwsIGcpXG4gICAgfVxuXG4gICAgU3Bpbm5lci5wcm90b3R5cGUub3BhY2l0eSA9IGZ1bmN0aW9uKGVsLCBpLCB2YWwsIG8pIHtcbiAgICAgIHZhciBjID0gZWwuZmlyc3RDaGlsZFxuICAgICAgbyA9IG8uc2hhZG93ICYmIG8ubGluZXMgfHwgMFxuICAgICAgaWYgKGMgJiYgaStvIDwgYy5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICBjID0gYy5jaGlsZE5vZGVzW2krb107IGMgPSBjICYmIGMuZmlyc3RDaGlsZDsgYyA9IGMgJiYgYy5maXJzdENoaWxkXG4gICAgICAgIGlmIChjKSBjLm9wYWNpdHkgPSB2YWxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgcHJvYmUgPSBjc3MoY3JlYXRlRWwoJ2dyb3VwJyksIHtiZWhhdmlvcjogJ3VybCgjZGVmYXVsdCNWTUwpJ30pXG5cbiAgaWYgKCF2ZW5kb3IocHJvYmUsICd0cmFuc2Zvcm0nKSAmJiBwcm9iZS5hZGopIGluaXRWTUwoKVxuICBlbHNlIHVzZUNzc0FuaW1hdGlvbnMgPSB2ZW5kb3IocHJvYmUsICdhbmltYXRpb24nKVxuXG4gIHJldHVybiBTcGlubmVyXG5cbn0pKTtcbiIsIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuNi4wXG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDE0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgaW4gdGhlIGJyb3dzZXIsIG9yIGBleHBvcnRzYCBvbiB0aGUgc2VydmVyLlxuICB2YXIgcm9vdCA9IHRoaXM7XG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBfYCB2YXJpYWJsZS5cbiAgdmFyIHByZXZpb3VzVW5kZXJzY29yZSA9IHJvb3QuXztcblxuICAvLyBFc3RhYmxpc2ggdGhlIG9iamVjdCB0aGF0IGdldHMgcmV0dXJuZWQgdG8gYnJlYWsgb3V0IG9mIGEgbG9vcCBpdGVyYXRpb24uXG4gIHZhciBicmVha2VyID0ge307XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIGNvbmNhdCAgICAgICAgICAgPSBBcnJheVByb3RvLmNvbmNhdCxcbiAgICB0b1N0cmluZyAgICAgICAgID0gT2JqUHJvdG8udG9TdHJpbmcsXG4gICAgaGFzT3duUHJvcGVydHkgICA9IE9ialByb3RvLmhhc093blByb3BlcnR5O1xuXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuICAvLyBhcmUgZGVjbGFyZWQgaGVyZS5cbiAgdmFyXG4gICAgbmF0aXZlRm9yRWFjaCAgICAgID0gQXJyYXlQcm90by5mb3JFYWNoLFxuICAgIG5hdGl2ZU1hcCAgICAgICAgICA9IEFycmF5UHJvdG8ubWFwLFxuICAgIG5hdGl2ZVJlZHVjZSAgICAgICA9IEFycmF5UHJvdG8ucmVkdWNlLFxuICAgIG5hdGl2ZVJlZHVjZVJpZ2h0ICA9IEFycmF5UHJvdG8ucmVkdWNlUmlnaHQsXG4gICAgbmF0aXZlRmlsdGVyICAgICAgID0gQXJyYXlQcm90by5maWx0ZXIsXG4gICAgbmF0aXZlRXZlcnkgICAgICAgID0gQXJyYXlQcm90by5ldmVyeSxcbiAgICBuYXRpdmVTb21lICAgICAgICAgPSBBcnJheVByb3RvLnNvbWUsXG4gICAgbmF0aXZlSW5kZXhPZiAgICAgID0gQXJyYXlQcm90by5pbmRleE9mLFxuICAgIG5hdGl2ZUxhc3RJbmRleE9mICA9IEFycmF5UHJvdG8ubGFzdEluZGV4T2YsXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcbiAgICBuYXRpdmVLZXlzICAgICAgICAgPSBPYmplY3Qua2V5cyxcbiAgICBuYXRpdmVCaW5kICAgICAgICAgPSBGdW5jUHJvdG8uYmluZDtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QgdmlhIGEgc3RyaW5nIGlkZW50aWZpZXIsXG4gIC8vIGZvciBDbG9zdXJlIENvbXBpbGVyIFwiYWR2YW5jZWRcIiBtb2RlLlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjYuMCc7XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyBvYmplY3RzIHdpdGggdGhlIGJ1aWx0LWluIGBmb3JFYWNoYCwgYXJyYXlzLCBhbmQgcmF3IG9iamVjdHMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBmb3JFYWNoYCBpZiBhdmFpbGFibGUuXG4gIHZhciBlYWNoID0gXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICBpZiAobmF0aXZlRm9yRWFjaCAmJiBvYmouZm9yRWFjaCA9PT0gbmF0aXZlRm9yRWFjaCkge1xuICAgICAgb2JqLmZvckVhY2goaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIH0gZWxzZSBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdG9yIHRvIGVhY2ggZWxlbWVudC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYG1hcGAgaWYgYXZhaWxhYmxlLlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgaWYgKG5hdGl2ZU1hcCAmJiBvYmoubWFwID09PSBuYXRpdmVNYXApIHJldHVybiBvYmoubWFwKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXN1bHRzLnB1c2goaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICB2YXIgcmVkdWNlRXJyb3IgPSAnUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZSc7XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlYCBpZiBhdmFpbGFibGUuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgbWVtbywgY29udGV4dCkge1xuICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpZiAobmF0aXZlUmVkdWNlICYmIG9iai5yZWR1Y2UgPT09IG5hdGl2ZVJlZHVjZSkge1xuICAgICAgaWYgKGNvbnRleHQpIGl0ZXJhdG9yID0gXy5iaW5kKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiBpbml0aWFsID8gb2JqLnJlZHVjZShpdGVyYXRvciwgbWVtbykgOiBvYmoucmVkdWNlKGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSB2YWx1ZTtcbiAgICAgICAgaW5pdGlhbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZW1vID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBtZW1vLCB2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaW5pdGlhbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGByZWR1Y2VSaWdodGAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZVJpZ2h0ICYmIG9iai5yZWR1Y2VSaWdodCA9PT0gbmF0aXZlUmVkdWNlUmlnaHQpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2VSaWdodChpdGVyYXRvciwgbWVtbykgOiBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoICE9PSArbGVuZ3RoKSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGluZGV4ID0ga2V5cyA/IGtleXNbLS1sZW5ndGhdIDogLS1sZW5ndGg7XG4gICAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgICAgbWVtbyA9IG9ialtpbmRleF07XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgb2JqW2luZGV4XSwgaW5kZXgsIGxpc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaW5pdGlhbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBhbnkob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBmaWx0ZXJgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgc2VsZWN0YC5cbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVGaWx0ZXIgJiYgb2JqLmZpbHRlciA9PT0gbmF0aXZlRmlsdGVyKSByZXR1cm4gb2JqLmZpbHRlcihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGZvciB3aGljaCBhIHRydXRoIHRlc3QgZmFpbHMuXG4gIF8ucmVqZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiAhcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICB9LCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGV2ZXJ5YCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXG4gIF8uZXZlcnkgPSBfLmFsbCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlIHx8IChwcmVkaWNhdGUgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKG5hdGl2ZUV2ZXJ5ICYmIG9iai5ldmVyeSA9PT0gbmF0aXZlRXZlcnkpIHJldHVybiBvYmouZXZlcnkocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoIShyZXN1bHQgPSByZXN1bHQgJiYgcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkpIHJldHVybiBicmVha2VyO1xuICAgIH0pO1xuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHNvbWVgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgdmFyIGFueSA9IF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgfHwgKHByZWRpY2F0ZSA9IF8uaWRlbnRpdHkpO1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKG5hdGl2ZVNvbWUgJiYgb2JqLnNvbWUgPT09IG5hdGl2ZVNvbWUpIHJldHVybiBvYmouc29tZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChyZXN1bHQgfHwgKHJlc3VsdCA9IHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbnMgYSBnaXZlbiB2YWx1ZSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZSA9IGZ1bmN0aW9uKG9iaiwgdGFyZ2V0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgb2JqLmluZGV4T2YgPT09IG5hdGl2ZUluZGV4T2YpIHJldHVybiBvYmouaW5kZXhPZih0YXJnZXQpICE9IC0xO1xuICAgIHJldHVybiBhbnkob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlID09PSB0YXJnZXQ7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiAoaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXSkuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG4gIF8ucGx1Y2sgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBfLm1hcChvYmosIF8ucHJvcGVydHkoa2V5KSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmlsdGVyYDogc2VsZWN0aW5nIG9ubHkgb2JqZWN0c1xuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLndoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubWF0Y2hlcyhhdHRycykpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbmRgOiBnZXR0aW5nIHRoZSBmaXJzdCBvYmplY3RcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5maW5kV2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmluZChvYmosIF8ubWF0Y2hlcyhhdHRycykpO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWF4aW11bSBlbGVtZW50IG9yIChlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgLy8gQ2FuJ3Qgb3B0aW1pemUgYXJyYXlzIG9mIGludGVnZXJzIGxvbmdlciB0aGFuIDY1LDUzNSBlbGVtZW50cy5cbiAgLy8gU2VlIFtXZWJLaXQgQnVnIDgwNzk3XShodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODA3OTcpXG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRvciA/IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSA6IHZhbHVlO1xuICAgICAgaWYgKGNvbXB1dGVkID4gbGFzdENvbXB1dGVkKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzQXJyYXkob2JqKSAmJiBvYmpbMF0gPT09ICtvYmpbMF0gJiYgb2JqLmxlbmd0aCA8IDY1NTM1KSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgb2JqKTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRvciA/IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSA6IHZhbHVlO1xuICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYW4gYXJyYXksIHVzaW5nIHRoZSBtb2Rlcm4gdmVyc2lvbiBvZiB0aGVcbiAgLy8gW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlcuKAk1lhdGVzX3NodWZmbGUpLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmFuZDtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzaHVmZmxlZCA9IFtdO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKGluZGV4KyspO1xuICAgICAgc2h1ZmZsZWRbaW5kZXggLSAxXSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgc2h1ZmZsZWRbcmFuZF0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24uXG4gIC8vIElmICoqbioqIGlzIG5vdCBzcGVjaWZpZWQsIHJldHVybnMgYSBzaW5nbGUgcmFuZG9tIGVsZW1lbnQuXG4gIC8vIFRoZSBpbnRlcm5hbCBgZ3VhcmRgIGFyZ3VtZW50IGFsbG93cyBpdCB0byB3b3JrIHdpdGggYG1hcGAuXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgIGlmIChvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgcmV0dXJuIF8uc2h1ZmZsZShvYmopLnNsaWNlKDAsIE1hdGgubWF4KDAsIG4pKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBsb29rdXAgaXRlcmF0b3JzLlxuICB2YXIgbG9va3VwSXRlcmF0b3IgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gXy5pZGVudGl0eTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIHJldHVybiBfLnByb3BlcnR5KHZhbHVlKTtcbiAgfTtcblxuICAvLyBTb3J0IHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24gcHJvZHVjZWQgYnkgYW4gaXRlcmF0b3IuXG4gIF8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgY3JpdGVyaWE6IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcihpdGVyYXRvcik7XG4gICAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHZhciBrZXkgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCBrZXksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIF8uaGFzKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldLnB1c2godmFsdWUpIDogcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5KSB7XG4gICAgXy5oYXMocmVzdWx0LCBrZXkpID8gcmVzdWx0W2tleV0rKyA6IHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IChsb3cgKyBoaWdoKSA+Pj4gMTtcbiAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgYXJyYXlbbWlkXSkgPCB2YWx1ZSA/IGxvdyA9IG1pZCArIDEgOiBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgcmV0dXJuIF8ubWFwKG9iaiwgXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuICBfLnNpemUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAwO1xuICAgIHJldHVybiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpID8gb2JqLmxlbmd0aCA6IF8ua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICAvLyBBcnJheSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYGhlYWRgIGFuZCBgdGFrZWAuIFRoZSAqKmd1YXJkKiogY2hlY2tcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmZpcnN0ID0gXy5oZWFkID0gXy50YWtlID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKChuID09IG51bGwpIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgaWYgKG4gPCAwKSByZXR1cm4gW107XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIG4pO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGxhc3QgZW50cnkgb2YgdGhlIGFycmF5LiBFc3BlY2lhbGx5IHVzZWZ1bCBvblxuICAvLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiBhbGwgdGhlIHZhbHVlcyBpblxuICAvLyB0aGUgYXJyYXksIGV4Y2x1ZGluZyB0aGUgbGFzdCBOLiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGhcbiAgLy8gYF8ubWFwYC5cbiAgXy5pbml0aWFsID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIGFycmF5Lmxlbmd0aCAtICgobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5sYXN0ID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKChuID09IG51bGwpIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIE1hdGgubWF4KGFycmF5Lmxlbmd0aCAtIG4sIDApKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKlxuICAvLyBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ucmVzdCA9IF8udGFpbCA9IF8uZHJvcCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIG91dHB1dCkge1xuICAgIGlmIChzaGFsbG93ICYmIF8uZXZlcnkoaW5wdXQsIF8uaXNBcnJheSkpIHtcbiAgICAgIHJldHVybiBjb25jYXQuYXBwbHkob3V0cHV0LCBpbnB1dCk7XG4gICAgfVxuICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSB8fCBfLmlzQXJndW1lbnRzKHZhbHVlKSkge1xuICAgICAgICBzaGFsbG93ID8gcHVzaC5hcHBseShvdXRwdXQsIHZhbHVlKSA6IGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIG91dHB1dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICAvLyBGbGF0dGVuIG91dCBhbiBhcnJheSwgZWl0aGVyIHJlY3Vyc2l2ZWx5IChieSBkZWZhdWx0KSwgb3IganVzdCBvbmUgbGV2ZWwuXG4gIF8uZmxhdHRlbiA9IGZ1bmN0aW9uKGFycmF5LCBzaGFsbG93KSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4oYXJyYXksIHNoYWxsb3csIFtdKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoZSBhcnJheSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNwZWNpZmllZCB2YWx1ZShzKS5cbiAgXy53aXRob3V0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9O1xuXG4gIC8vIFNwbGl0IGFuIGFycmF5IGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24oYXJyYXksIHByZWRpY2F0ZSkge1xuICAgIHZhciBwYXNzID0gW10sIGZhaWwgPSBbXTtcbiAgICBlYWNoKGFycmF5LCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAocHJlZGljYXRlKGVsZW0pID8gcGFzcyA6IGZhaWwpLnB1c2goZWxlbSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtwYXNzLCBmYWlsXTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0b3I7XG4gICAgICBpdGVyYXRvciA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGluaXRpYWwgPSBpdGVyYXRvciA/IF8ubWFwKGFycmF5LCBpdGVyYXRvciwgY29udGV4dCkgOiBhcnJheTtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHZhciBzZWVuID0gW107XG4gICAgZWFjaChpbml0aWFsLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIGlmIChpc1NvcnRlZCA/ICghaW5kZXggfHwgc2VlbltzZWVuLmxlbmd0aCAtIDFdICE9PSB2YWx1ZSkgOiAhXy5jb250YWlucyhzZWVuLCB2YWx1ZSkpIHtcbiAgICAgICAgc2Vlbi5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGFycmF5W2luZGV4XSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pcShfLmZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKF8udW5pcShhcnJheSksIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiBfLmV2ZXJ5KHJlc3QsIGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBfLmNvbnRhaW5zKG90aGVyLCBpdGVtKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFRha2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvbmUgYXJyYXkgYW5kIGEgbnVtYmVyIG9mIG90aGVyIGFycmF5cy5cbiAgLy8gT25seSB0aGUgZWxlbWVudHMgcHJlc2VudCBpbiBqdXN0IHRoZSBmaXJzdCBhcnJheSB3aWxsIHJlbWFpbi5cbiAgXy5kaWZmZXJlbmNlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpeyByZXR1cm4gIV8uY29udGFpbnMocmVzdCwgdmFsdWUpOyB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGggPSBfLm1heChfLnBsdWNrKGFyZ3VtZW50cywgJ2xlbmd0aCcpLmNvbmNhdCgwKSk7XG4gICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRzW2ldID0gXy5wbHVjayhhcmd1bWVudHMsICcnICsgaSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENvbnZlcnRzIGxpc3RzIGludG8gb2JqZWN0cy4gUGFzcyBlaXRoZXIgYSBzaW5nbGUgYXJyYXkgb2YgYFtrZXksIHZhbHVlXWBcbiAgLy8gcGFpcnMsIG9yIHR3byBwYXJhbGxlbCBhcnJheXMgb2YgdGhlIHNhbWUgbGVuZ3RoIC0tIG9uZSBvZiBrZXlzLCBhbmQgb25lIG9mXG4gIC8vIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgXy5vYmplY3QgPSBmdW5jdGlvbihsaXN0LCB2YWx1ZXMpIHtcbiAgICBpZiAobGlzdCA9PSBudWxsKSByZXR1cm4ge307XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gSWYgdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwbHkgdXMgd2l0aCBpbmRleE9mIChJJ20gbG9va2luZyBhdCB5b3UsICoqTVNJRSoqKSxcbiAgLy8gd2UgbmVlZCB0aGlzIGZ1bmN0aW9uLiBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuXG4gIC8vIGl0ZW0gaW4gYW4gYXJyYXksIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBpbmRleE9mYCBpZiBhdmFpbGFibGUuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgaXNTb3J0ZWQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgaWYgKHR5cGVvZiBpc1NvcnRlZCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpID0gKGlzU29ydGVkIDwgMCA/IE1hdGgubWF4KDAsIGxlbmd0aCArIGlzU29ydGVkKSA6IGlzU29ydGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGkgPSBfLnNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2ldID09PSBpdGVtID8gaSA6IC0xO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmF0aXZlSW5kZXhPZiAmJiBhcnJheS5pbmRleE9mID09PSBuYXRpdmVJbmRleE9mKSByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtLCBpc1NvcnRlZCk7XG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGxhc3RJbmRleE9mYCBpZiBhdmFpbGFibGUuXG4gIF8ubGFzdEluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgZnJvbSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGhhc0luZGV4ID0gZnJvbSAhPSBudWxsO1xuICAgIGlmIChuYXRpdmVMYXN0SW5kZXhPZiAmJiBhcnJheS5sYXN0SW5kZXhPZiA9PT0gbmF0aXZlTGFzdEluZGV4T2YpIHtcbiAgICAgIHJldHVybiBoYXNJbmRleCA/IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0sIGZyb20pIDogYXJyYXkubGFzdEluZGV4T2YoaXRlbSk7XG4gICAgfVxuICAgIHZhciBpID0gKGhhc0luZGV4ID8gZnJvbSA6IGFycmF5Lmxlbmd0aCk7XG4gICAgd2hpbGUgKGktLSkgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYW4gaW50ZWdlciBBcnJheSBjb250YWluaW5nIGFuIGFyaXRobWV0aWMgcHJvZ3Jlc3Npb24uIEEgcG9ydCBvZlxuICAvLyB0aGUgbmF0aXZlIFB5dGhvbiBgcmFuZ2UoKWAgZnVuY3Rpb24uIFNlZVxuICAvLyBbdGhlIFB5dGhvbiBkb2N1bWVudGF0aW9uXShodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvZnVuY3Rpb25zLmh0bWwjcmFuZ2UpLlxuICBfLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICBzdG9wID0gc3RhcnQgfHwgMDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgc3RlcCA9IGFyZ3VtZW50c1syXSB8fCAxO1xuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgaWR4ID0gMDtcbiAgICB2YXIgcmFuZ2UgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlKGlkeCA8IGxlbmd0aCkge1xuICAgICAgcmFuZ2VbaWR4KytdID0gc3RhcnQ7XG4gICAgICBzdGFydCArPSBzdGVwO1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldXNhYmxlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciBwcm90b3R5cGUgc2V0dGluZy5cbiAgdmFyIGN0b3IgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4gIC8vIG9wdGlvbmFsbHkpLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgRnVuY3Rpb24uYmluZGAgaWZcbiAgLy8gYXZhaWxhYmxlLlxuICBfLmJpbmQgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MsIGJvdW5kO1xuICAgIGlmIChuYXRpdmVCaW5kICYmIGZ1bmMuYmluZCA9PT0gbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmdW5jKSkgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSkgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIHNlbGYgPSBuZXcgY3RvcjtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHNlbGYsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgaWYgKE9iamVjdChyZXN1bHQpID09PSByZXN1bHQpIHJldHVybiByZXN1bHQ7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xuICAvLyBhcyBhIHBsYWNlaG9sZGVyLCBhbGxvd2luZyBhbnkgY29tYmluYXRpb24gb2YgYXJndW1lbnRzIHRvIGJlIHByZS1maWxsZWQuXG4gIF8ucGFydGlhbCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgYm91bmRBcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IDA7XG4gICAgICB2YXIgYXJncyA9IGJvdW5kQXJncy5zbGljZSgpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyZ3MubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3NbaV0gPT09IF8pIGFyZ3NbaV0gPSBhcmd1bWVudHNbcG9zaXRpb24rK107XG4gICAgICB9XG4gICAgICB3aGlsZSAocG9zaXRpb24gPCBhcmd1bWVudHMubGVuZ3RoKSBhcmdzLnB1c2goYXJndW1lbnRzW3Bvc2l0aW9uKytdKTtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQmluZCBhIG51bWJlciBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBSZW1haW5pbmcgYXJndW1lbnRzXG4gIC8vIGFyZSB0aGUgbWV0aG9kIG5hbWVzIHRvIGJlIGJvdW5kLiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXQgYWxsIGNhbGxiYWNrc1xuICAvLyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBmdW5jcyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBpZiAoZnVuY3MubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBbGwgbXVzdCBiZSBwYXNzZWQgZnVuY3Rpb24gbmFtZXMnKTtcbiAgICBlYWNoKGZ1bmNzLCBmdW5jdGlvbihmKSB7IG9ialtmXSA9IF8uYmluZChvYmpbZl0sIG9iaik7IH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW8gPSB7fTtcbiAgICBoYXNoZXIgfHwgKGhhc2hlciA9IF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBfLmhhcyhtZW1vLCBrZXkpID8gbWVtb1trZXldIDogKG1lbW9ba2V5XSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpeyByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTsgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgcmV0dXJuIF8uZGVsYXkuYXBwbHkoXywgW2Z1bmMsIDFdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBhdCBtb3N0IG9uY2VcbiAgLy8gZHVyaW5nIGEgZ2l2ZW4gd2luZG93IG9mIHRpbWUuIE5vcm1hbGx5LCB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHdpbGwgcnVuXG4gIC8vIGFzIG11Y2ggYXMgaXQgY2FuLCB3aXRob3V0IGV2ZXIgZ29pbmcgbW9yZSB0aGFuIG9uY2UgcGVyIGB3YWl0YCBkdXJhdGlvbjtcbiAgLy8gYnV0IGlmIHlvdSdkIGxpa2UgdG8gZGlzYWJsZSB0aGUgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2UsIHBhc3NcbiAgLy8gYHtsZWFkaW5nOiBmYWxzZX1gLiBUbyBkaXNhYmxlIGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSwgZGl0dG8uXG4gIF8udGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gICAgdmFyIGNvbnRleHQsIGFyZ3MsIHJlc3VsdDtcbiAgICB2YXIgdGltZW91dCA9IG51bGw7XG4gICAgdmFyIHByZXZpb3VzID0gMDtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IF8ubm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbm93ID0gXy5ub3coKTtcbiAgICAgIGlmICghcHJldmlvdXMgJiYgb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSkgcHJldmlvdXMgPSBub3c7XG4gICAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChub3cgLSBwcmV2aW91cyk7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBpZiAocmVtYWluaW5nIDw9IDApIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xuXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdCA9IF8ubm93KCkgLSB0aW1lc3RhbXA7XG4gICAgICBpZiAobGFzdCA8IHdhaXQpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHRpbWVzdGFtcCA9IF8ubm93KCk7XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICB9XG4gICAgICBpZiAoY2FsbE5vdykge1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciByYW4gPSBmYWxzZSwgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocmFuKSByZXR1cm4gbWVtbztcbiAgICAgIHJhbiA9IHRydWU7XG4gICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgZnVuYyA9IG51bGw7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmdW5jcyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGZvciAodmFyIGkgPSBmdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBhcmdzID0gW2Z1bmNzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmdzWzBdO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIGFmdGVyIGJlaW5nIGNhbGxlZCBOIHRpbWVzLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgXG4gIF8ua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgaWYgKG5hdGl2ZUtleXMpIHJldHVybiBuYXRpdmVLZXlzKG9iaik7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBDb252ZXJ0IGFuIG9iamVjdCBpbnRvIGEgbGlzdCBvZiBgW2tleSwgdmFsdWVdYCBwYWlycy5cbiAgXy5wYWlycyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciBwYWlycyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgb25seSBjb250YWluaW5nIHRoZSB3aGl0ZWxpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLnBpY2sgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZWFjaChrZXlzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChrZXkgaW4gb2JqKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ub21pdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjb3B5ID0ge307XG4gICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoIV8uY29udGFpbnMoa2V5cywga2V5KSkgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xuICB9O1xuXG4gIC8vIEZpbGwgaW4gYSBnaXZlbiBvYmplY3Qgd2l0aCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gIF8uZGVmYXVsdHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgaWYgKG9ialtwcm9wXSA9PT0gdm9pZCAwKSBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIChzaGFsbG93LWNsb25lZCkgZHVwbGljYXRlIG9mIGFuIG9iamVjdC5cbiAgXy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiBfLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogXy5leHRlbmQoe30sIG9iaik7XG4gIH07XG5cbiAgLy8gSW52b2tlcyBpbnRlcmNlcHRvciB3aXRoIHRoZSBvYmosIGFuZCB0aGVuIHJldHVybnMgb2JqLlxuICAvLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXG4gIF8udGFwID0gZnVuY3Rpb24ob2JqLCBpbnRlcmNlcHRvcikge1xuICAgIGludGVyY2VwdG9yKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT0gMSAvIGI7XG4gICAgLy8gQSBzdHJpY3QgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkgYmVjYXVzZSBgbnVsbCA9PSB1bmRlZmluZWRgLlxuICAgIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSByZXR1cm4gYSA9PT0gYjtcbiAgICAvLyBVbndyYXAgYW55IHdyYXBwZWQgb2JqZWN0cy5cbiAgICBpZiAoYSBpbnN0YW5jZW9mIF8pIGEgPSBhLl93cmFwcGVkO1xuICAgIGlmIChiIGluc3RhbmNlb2YgXykgYiA9IGIuX3dyYXBwZWQ7XG4gICAgLy8gQ29tcGFyZSBgW1tDbGFzc11dYCBuYW1lcy5cbiAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKTtcbiAgICBpZiAoY2xhc3NOYW1lICE9IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgLy8gU3RyaW5ncywgbnVtYmVycywgZGF0ZXMsIGFuZCBib29sZWFucyBhcmUgY29tcGFyZWQgYnkgdmFsdWUuXG4gICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgICAvLyBQcmltaXRpdmVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG9iamVjdCB3cmFwcGVycyBhcmUgZXF1aXZhbGVudDsgdGh1cywgYFwiNVwiYCBpc1xuICAgICAgICAvLyBlcXVpdmFsZW50IHRvIGBuZXcgU3RyaW5nKFwiNVwiKWAuXG4gICAgICAgIHJldHVybiBhID09IFN0cmluZyhiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgTnVtYmVyXSc6XG4gICAgICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3JcbiAgICAgICAgLy8gb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiBhICE9ICthID8gYiAhPSArYiA6IChhID09IDAgPyAxIC8gYSA9PSAxIC8gYiA6IGEgPT0gK2IpO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09ICtiO1xuICAgICAgLy8gUmVnRXhwcyBhcmUgY29tcGFyZWQgYnkgdGhlaXIgc291cmNlIHBhdHRlcm5zIGFuZCBmbGFncy5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAgIHJldHVybiBhLnNvdXJjZSA9PSBiLnNvdXJjZSAmJlxuICAgICAgICAgICAgICAgYS5nbG9iYWwgPT0gYi5nbG9iYWwgJiZcbiAgICAgICAgICAgICAgIGEubXVsdGlsaW5lID09IGIubXVsdGlsaW5lICYmXG4gICAgICAgICAgICAgICBhLmlnbm9yZUNhc2UgPT0gYi5pZ25vcmVDYXNlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PSBhKSByZXR1cm4gYlN0YWNrW2xlbmd0aF0gPT0gYjtcbiAgICB9XG4gICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzXG4gICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgaWYgKGFDdG9yICE9PSBiQ3RvciAmJiAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgKGFDdG9yIGluc3RhbmNlb2YgYUN0b3IpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgKGJDdG9yIGluc3RhbmNlb2YgYkN0b3IpKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcbiAgICB2YXIgc2l6ZSA9IDAsIHJlc3VsdCA9IHRydWU7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGNsYXNzTmFtZSA9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIHNpemUgPSBhLmxlbmd0aDtcbiAgICAgIHJlc3VsdCA9IHNpemUgPT0gYi5sZW5ndGg7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICAgIHdoaWxlIChzaXplLS0pIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBlcShhW3NpemVdLCBiW3NpemVdLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgICAgIGZvciAodmFyIGtleSBpbiBhKSB7XG4gICAgICAgIGlmIChfLmhhcyhhLCBrZXkpKSB7XG4gICAgICAgICAgLy8gQ291bnQgdGhlIGV4cGVjdGVkIG51bWJlciBvZiBwcm9wZXJ0aWVzLlxuICAgICAgICAgIHNpemUrKztcbiAgICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXIuXG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzLlxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBmb3IgKGtleSBpbiBiKSB7XG4gICAgICAgICAgaWYgKF8uaGFzKGIsIGtleSkgJiYgIShzaXplLS0pKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSAhc2l6ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIsIFtdLCBbXSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiBhcnJheSwgc3RyaW5nLCBvciBvYmplY3QgZW1wdHk/XG4gIC8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNTdHJpbmcob2JqKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cbiAgXy5pc0VsZW1lbnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9iai5ub2RlVHlwZSA9PT0gMSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhbiBhcnJheT9cbiAgLy8gRGVsZWdhdGVzIHRvIEVDTUE1J3MgbmF0aXZlIEFycmF5LmlzQXJyYXlcbiAgXy5pc0FycmF5ID0gbmF0aXZlSXNBcnJheSB8fCBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cC5cbiAgZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCAnICsgbmFtZSArICddJztcbiAgICB9O1xuICB9KTtcblxuICAvLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFKSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gISEob2JqICYmIF8uaGFzKG9iaiwgJ2NhbGxlZScpKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLlxuICBpZiAodHlwZW9mICgvLi8pICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgXy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT0gK29iajtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgYm9vbGVhbj9cbiAgXy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB0cnVlIHx8IG9iaiA9PT0gZmFsc2UgfHwgdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG4gIH07XG5cbiAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gVW5kZXJzY29yZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgX2AgdmFyaWFibGUgdG8gaXRzXG4gIC8vIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5fID0gcHJldmlvdXNVbmRlcnNjb3JlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRvcnMuXG4gIF8uaWRlbnRpdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBfLmNvbnN0YW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgXy5wcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBwcmVkaWNhdGUgZm9yIGNoZWNraW5nIHdoZXRoZXIgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHNldCBvZiBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5tYXRjaGVzID0gZnVuY3Rpb24oYXR0cnMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICBpZiAob2JqID09PSBhdHRycykgcmV0dXJuIHRydWU7IC8vYXZvaWQgY29tcGFyaW5nIGFuIG9iamVjdCB0byBpdHNlbGYuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgaWYgKGF0dHJzW2tleV0gIT09IG9ialtrZXldKVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcblxuICAvLyBSdW4gYSBmdW5jdGlvbiAqKm4qKiB0aW1lcy5cbiAgXy50aW1lcyA9IGZ1bmN0aW9uKG4sIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIGFjY3VtID0gQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgaSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXG4gIF8ucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICB9O1xuXG4gIC8vIEEgKHBvc3NpYmx5IGZhc3Rlcikgd2F5IHRvIGdldCB0aGUgY3VycmVudCB0aW1lc3RhbXAgYXMgYW4gaW50ZWdlci5cbiAgXy5ub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG4gIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlbnRpdHlNYXAgPSB7XG4gICAgZXNjYXBlOiB7XG4gICAgICAnJic6ICcmYW1wOycsXG4gICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICc+JzogJyZndDsnLFxuICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICBcIidcIjogJyYjeDI3OydcbiAgICB9XG4gIH07XG4gIGVudGl0eU1hcC51bmVzY2FwZSA9IF8uaW52ZXJ0KGVudGl0eU1hcC5lc2NhcGUpO1xuXG4gIC8vIFJlZ2V4ZXMgY29udGFpbmluZyB0aGUga2V5cyBhbmQgdmFsdWVzIGxpc3RlZCBpbW1lZGlhdGVseSBhYm92ZS5cbiAgdmFyIGVudGl0eVJlZ2V4ZXMgPSB7XG4gICAgZXNjYXBlOiAgIG5ldyBSZWdFeHAoJ1snICsgXy5rZXlzKGVudGl0eU1hcC5lc2NhcGUpLmpvaW4oJycpICsgJ10nLCAnZycpLFxuICAgIHVuZXNjYXBlOiBuZXcgUmVnRXhwKCcoJyArIF8ua2V5cyhlbnRpdHlNYXAudW5lc2NhcGUpLmpvaW4oJ3wnKSArICcpJywgJ2cnKVxuICB9O1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgXy5lYWNoKFsnZXNjYXBlJywgJ3VuZXNjYXBlJ10sIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIF9bbWV0aG9kXSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgaWYgKHN0cmluZyA9PSBudWxsKSByZXR1cm4gJyc7XG4gICAgICByZXR1cm4gKCcnICsgc3RyaW5nKS5yZXBsYWNlKGVudGl0eVJlZ2V4ZXNbbWV0aG9kXSwgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGVudGl0eU1hcFttZXRob2RdW21hdGNoXTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlLmNhbGwob2JqZWN0KSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goXy5mdW5jdGlvbnMob2JqKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdCc6ICAgICAndCcsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdHxcXHUyMDI4fFxcdTIwMjkvZztcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgZGF0YSwgc2V0dGluZ3MpIHtcbiAgICB2YXIgcmVuZGVyO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpXG4gICAgICAgIC5yZXBsYWNlKGVzY2FwZXIsIGZ1bmN0aW9uKG1hdGNoKSB7IHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTsgfSk7XG5cbiAgICAgIGlmIChlc2NhcGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBlc2NhcGUgKyBcIikpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuICAgICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyBcInJldHVybiBfX3A7XFxuXCI7XG5cbiAgICB0cnkge1xuICAgICAgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGlmIChkYXRhKSByZXR1cm4gcmVuZGVyKGRhdGEsIF8pO1xuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24gc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonKSArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLCB3aGljaCB3aWxsIGRlbGVnYXRlIHRvIHRoZSB3cmFwcGVyLlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8ob2JqKS5jaGFpbigpO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndW5zaGlmdCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvYmogPSB0aGlzLl93cmFwcGVkO1xuICAgICAgbWV0aG9kLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICAgIGlmICgobmFtZSA9PSAnc2hpZnQnIHx8IG5hbWUgPT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICBfLmV4dGVuZChfLnByb3RvdHlwZSwge1xuXG4gICAgLy8gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICAgIGNoYWluOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2NoYWluID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gQU1EIHJlZ2lzdHJhdGlvbiBoYXBwZW5zIGF0IHRoZSBlbmQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBBTUQgbG9hZGVyc1xuICAvLyB0aGF0IG1heSBub3QgZW5mb3JjZSBuZXh0LXR1cm4gc2VtYW50aWNzIG9uIG1vZHVsZXMuIEV2ZW4gdGhvdWdoIGdlbmVyYWxcbiAgLy8gcHJhY3RpY2UgZm9yIEFNRCByZWdpc3RyYXRpb24gaXMgdG8gYmUgYW5vbnltb3VzLCB1bmRlcnNjb3JlIHJlZ2lzdGVyc1xuICAvLyBhcyBhIG5hbWVkIG1vZHVsZSBiZWNhdXNlLCBsaWtlIGpRdWVyeSwgaXQgaXMgYSBiYXNlIGxpYnJhcnkgdGhhdCBpc1xuICAvLyBwb3B1bGFyIGVub3VnaCB0byBiZSBidW5kbGVkIGluIGEgdGhpcmQgcGFydHkgbGliLCBidXQgbm90IGJlIHBhcnQgb2ZcbiAgLy8gYW4gQU1EIGxvYWQgcmVxdWVzdC4gVGhvc2UgY2FzZXMgY291bGQgZ2VuZXJhdGUgYW4gZXJyb3Igd2hlbiBhblxuICAvLyBhbm9ueW1vdXMgZGVmaW5lKCkgaXMgY2FsbGVkIG91dHNpZGUgb2YgYSBsb2FkZXIgcmVxdWVzdC5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZSgndW5kZXJzY29yZScsIFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfO1xuICAgIH0pO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIl19
