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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvYWN0aXZpdHlfZmVlZC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvYXZhdGFyLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9jaGF0X25vdGlmaWNhdGlvbnMuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2NoYXRfbm90aWZpY2F0aW9uc190b2dnbGVyLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9jb2luX293bmVyc2hpcC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvY29yZV90ZWFtLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9kZXNrdG9wX25vdGlmaWNhdGlvbnMuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2RyYWdfYW5kX2Ryb3Bfdmlldy5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvZHJvcGRvd25fbmV3c19mZWVkLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9kcm9wZG93bl9uZXdzX2ZlZWRfdG9nZ2xlci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvZmluYW5jaWFsc192aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9mb3JtX2dyb3VwLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9mdWxsX3BhZ2VfbmV3c19mZWVkLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9pbnB1dF9wcmV2aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9pbnRlcmVzdF9waWNrZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2ludml0ZV9ib3VudHlfZm9ybS5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaW52aXRlX2ZyaWVuZF9ib3VudHkuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2ludml0ZV9mcmllbmRfcHJvZHVjdC5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaW52aXRlX2xpc3QuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL2pvaW5fdGVhbV92aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9tZW1iZXJzX3ZpZXcuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL25hdmJhci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvbm90aWZpY2F0aW9uX3ByZWZlcmVuY2VzX2Ryb3Bkb3duLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy9udW1iZXJfaW5wdXRfdmlldy5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvcGVvcGxlX3ZpZXcuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3BlcnNvbl9waWNrZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3BvcG92ZXIuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3NoYXJlLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy90YWdfbGlzdF92aWV3LmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29tcG9uZW50cy90aW1lc3RhbXAuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3RpcHNfdWkuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3RpdGxlX25vdGlmaWNhdGlvbnNfY291bnQuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3VyZ2VuY3kuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9jb21wb25lbnRzL3VzZXJfbmF2YmFyX2Ryb3Bkb3duLmpzLmpzeCIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvY29uc3RhbnRzLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9kaXNwYXRjaGVyLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9taXhpbnMvZHJvcGRvd25fdG9nZ2xlci5qcy5qc3giLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL21peGlucy9uZXdzX2ZlZWQuanMuanN4IiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9zdG9yZXMvY2hhdF9ub3RpZmljYXRpb25zX3N0b3JlLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy9zdG9yZXMvY29pbl9vd25lcnNoaXBfc3RvcmUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL3N0b3Jlcy9pbnRlcmVzdF9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25ld3NfZmVlZF9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25ld3NfZmVlZF91c2Vyc19zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL25vdGlmaWNhdGlvbl9wcmVmZXJlbmNlc19kcm9wZG93bl9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3Blb3BsZV9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3BlcnNvbl9waWNrZXJfc3RvcmUuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9hcHAvYXNzZXRzL2phdmFzY3JpcHRzL3N0b3Jlcy9zdG9yZS5qcyIsIi9Vc2Vycy9wbGV0Y2hlci9Qcm9qZWN0cy9tZXRhL2FwcC9hc3NldHMvamF2YXNjcmlwdHMvc3RvcmVzL3RhZ19saXN0X3N0b3JlLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvYXBwL2Fzc2V0cy9qYXZhc2NyaXB0cy94aHIuanMiLCIvVXNlcnMvcGxldGNoZXIvUHJvamVjdHMvbWV0YS9ub2RlX21vZHVsZXMvc3Bpbi5qcy9zcGluLmpzIiwiL1VzZXJzL3BsZXRjaGVyL1Byb2plY3RzL21ldGEvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9WQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBBY3Rpdml0eUZlZWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdBY3Rpdml0eUZlZWQnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBhY3Rpdml0aWVzOiB0aGlzLnByb3BzLmFjdGl2aXRpZXMgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KG51bGwsIF8ubWFwKHRoaXMuc3RhdGUuYWN0aXZpdGllcywgRW50cnkpKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBFbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0VudHJ5JyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFwiQFwiLCB0aGlzLnByb3BzLmFjdG9yLnVzZXJuYW1lLCBcIiBcIiwgdGhpcy5wcm9wcy52ZXJiLCBcIiBcIiwgdGhpcy5ib2R5KCkpXG4gICAgfSxcblxuICAgIGJvZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuc3ViamVjdC5ib2R5X2h0bWwpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJtYXJrZG93bi1ub3JtYWxpemVkXCIsIHJlZjogXCJib2R5XCJ9KVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnN1YmplY3QuYXR0YWNobWVudCkge1xuICAgICAgICB2YXIgaHJlZiA9IHRoaXMucHJvcHMuc3ViamVjdC5hdHRhY2htZW50LmhyZWZcbiAgICAgICAgdmFyIHNyYyA9IHRoaXMucHJvcHMuc3ViamVjdC5hdHRhY2htZW50LmZpcmVzaXplX3VybCArICcvMzAweDIyNS9mcmFtZV8wL2dfY2VudGVyLycgKyBocmVmXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IGhyZWZ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJnYWxsZXJ5LXRodW1iXCIsIHNyYzogc3JjfSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucmVmcy5ib2R5KSB7XG4gICAgICAgIHRoaXMucmVmcy5ib2R5LmdldERPTU5vZGUoKS5pbm5lckhUTUwgPSB0aGlzLnByb3BzLnN1YmplY3QuYm9keV9odG1sXG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFjdGl2aXR5RmVlZDtcbiAgfVxuXG4gIHdpbmRvdy5BY3Rpdml0eUZlZWQgPSBBY3Rpdml0eUZlZWQ7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIEF2YXRhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0F2YXRhcicsXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNpemU6IDI0XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNpemUgPSB0aGlzLnByb3BzLnNpemUgJiYgdGhpcy5wcm9wcy5zaXplLnRvU3RyaW5nKCk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00uaW1nKHtjbGFzc05hbWU6IFwiYXZhdGFyIGltZy1jaXJjbGVcIiwgaGVpZ2h0OiBzaXplLCBzcmM6IHRoaXMuYXZhdGFyVXJsKCksIHdpZHRoOiBzaXplfSk7XG4gICAgfSxcblxuICAgIGF2YXRhclVybDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy51c2VyICYmICF0aGlzLnByb3BzLmFsd2F5c0RlZmF1bHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMudXNlci5hdmF0YXJfdXJsICsgJz9zPScgKyAodGhpcy5wcm9wcy5zaXplICogMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJy9hc3NldHMvYXZhdGFycy9kZWZhdWx0LnBuZyc7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEF2YXRhcjtcbiAgfVxuXG4gIHdpbmRvdy5BdmF0YXIgPSBBdmF0YXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIENoYXROb3RpZmljYXRpb25TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9jaGF0X25vdGlmaWNhdGlvbnNfc3RvcmUnKTtcbnZhciBEZXNrdG9wTm90aWZpY2F0aW9ucyA9IHJlcXVpcmUoJy4vZGVza3RvcF9ub3RpZmljYXRpb25zLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJQ09OX1VSTCA9ICdodHRwczovL2Q4aXpkazZibDRnYmkuY2xvdWRmcm9udC5uZXQvODB4L2h0dHA6Ly9mLmNsLmx5L2l0ZW1zLzFJMmExajBNMHcwVjJwM0MzUTBNL0Fzc2VtYmx5LVR3aXR0ZXItQXZhdGFyLnBuZyc7XG4gIHZhciBOID0gQ09OU1RBTlRTLkNIQVRfTk9USUZJQ0FUSU9OUztcblxuICBmdW5jdGlvbiBkeW5hbWljU29ydChwcm9wZXJ0eSkge1xuICAgIHZhciBzb3J0T3JkZXIgPSAxO1xuICAgIGlmKHByb3BlcnR5WzBdID09PSBcIi1cIikge1xuICAgICAgc29ydE9yZGVyID0gLTE7XG4gICAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnN1YnN0cigxKTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhLGIpIHtcbiAgICAgIHZhciByZXN1bHQgPSAoYVtwcm9wZXJ0eV0gPCBiW3Byb3BlcnR5XSkgPyAtMSA6IChhW3Byb3BlcnR5XSA+IGJbcHJvcGVydHldKSA/IDEgOiAwO1xuICAgICAgcmV0dXJuIHJlc3VsdCAqIHNvcnRPcmRlcjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkeW5hbWljU29ydE11bHRpcGxlKCkge1xuICAgIC8qXG4gICAgICogc2F2ZSB0aGUgYXJndW1lbnRzIG9iamVjdCBhcyBpdCB3aWxsIGJlIG92ZXJ3cml0dGVuXG4gICAgICogbm90ZSB0aGF0IGFyZ3VtZW50cyBvYmplY3QgaXMgYW4gYXJyYXktbGlrZSBvYmplY3RcbiAgICAgKiBjb25zaXN0aW5nIG9mIHRoZSBuYW1lcyBvZiB0aGUgcHJvcGVydGllcyB0byBzb3J0IGJ5XG4gICAgICovXG4gICAgdmFyIHByb3BzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBmdW5jdGlvbiAob2JqMSwgb2JqMikge1xuICAgICAgdmFyIGkgPSAwLCByZXN1bHQgPSAwLCBudW1iZXJPZlByb3BlcnRpZXMgPSBwcm9wcy5sZW5ndGg7XG4gICAgICAvKiB0cnkgZ2V0dGluZyBhIGRpZmZlcmVudCByZXN1bHQgZnJvbSAwIChlcXVhbClcbiAgICAgICAqIGFzIGxvbmcgYXMgd2UgaGF2ZSBleHRyYSBwcm9wZXJ0aWVzIHRvIGNvbXBhcmVcbiAgICAgICAqL1xuICAgICAgd2hpbGUgKHJlc3VsdCA9PT0gMCAmJiBpIDwgbnVtYmVyT2ZQcm9wZXJ0aWVzKSB7XG4gICAgICAgIHJlc3VsdCA9IGR5bmFtaWNTb3J0KHByb3BzW2ldKShvYmoxLCBvYmoyKTtcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICB2YXIgQ2hhdE5vdGlmaWNhdGlvbnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDaGF0Tm90aWZpY2F0aW9ucycsXG4gICAgYXJ0aWNsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8uZmxhdHRlbihfLm1hcCh0aGlzLnN0YXRlLmRhdGEsIGZ1bmN0aW9uKGEpe1xuICAgICAgICByZXR1cm4gYS5lbnRpdGllcztcbiAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJCgnW2RhdGEtdG9nZ2xlXScsIHRoaXMuZ2V0RE9NTm9kZSgpKS50b29sdGlwKCk7XG4gICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5yZWZzLnNwaW5uZXIuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIG9wdHMgPSB0aGlzLnNwaW5uZXJPcHRpb25zIHx8IHtcbiAgICAgICAgbGluZXM6IDExLFxuICAgICAgICBsZW5ndGg6IDMwLFxuICAgICAgICByYWRpdXM6IDU1XG4gICAgICB9O1xuXG4gICAgICB2YXIgc3Bpbm5lciA9IHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4oKTtcbiAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChzcGlubmVyLmVsKTtcbiAgICB9LFxuXG4gICAgc29ydEJ5TGFzdFJlYWRBdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWVzID0gXy52YWx1ZXMoZGF0YSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZW50cnkgPSB2YWx1ZXNbaV07XG4gICAgICAgIGVudHJ5LnJlYWRTdGF0ZSA9IGVudHJ5LnVwZGF0ZWQgPiBlbnRyeS5sYXN0X3JlYWRfYXQgPyAnQScgOiAnWic7XG4gICAgICAgIGVudHJ5LnNvcnRJbmRleCA9IHRoaXMuc3RhdGUuc29ydEtleXMuaW5kZXhPZihlbnRyeS5pZCk7XG4gICAgICB9XG4gICAgICB2YWx1ZXMuc29ydChkeW5hbWljU29ydE11bHRpcGxlKFwicmVhZFN0YXRlXCIsIFwic29ydEluZGV4XCIsIFwibGFiZWxcIikpO1xuXG4gICAgICByZXR1cm4gdmFsdWVzIHx8IFtdO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgLy8gVE9ETzogUmVtb3ZlIHRoaXMgYW5kIHVzZSB0aGUgRGlzcGF0Y2hlclxuICAgICAgJCh3aW5kb3cpLmJpbmQoJ3N0b3JhZ2UnLCB0aGlzLnN0b3JlZEFja0NoYW5nZWQpO1xuXG4gICAgICB0aGlzLm9uUHVzaChmdW5jdGlvbihldmVudCwgbXNnKSB7XG4gICAgICAgIGlmIChfLmNvbnRhaW5zKG1zZy5tZW50aW9ucywgX3RoaXMucHJvcHMudXNlcm5hbWUpKSB7XG4gICAgICAgICAgX3RoaXMuZGVza3RvcE5vdGlmeShtc2cpO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLmZldGNoTm90aWZpY2F0aW9ucygpO1xuICAgICAgfSk7XG5cbiAgICAgIHdpbmRvdy52aXNpYmlsaXR5KGZ1bmN0aW9uKHZpc2libGUpIHtcbiAgICAgICAgaWYgKHZpc2libGUpIHsgX3RoaXMuZmV0Y2hOb3RpZmljYXRpb25zKCk7IH1cbiAgICAgIH0pO1xuXG4gICAgICBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuaGFuZGxlQ2hhdFJvb21zQ2hhbmdlZCk7XG4gICAgICB0aGlzLmZldGNoTm90aWZpY2F0aW9ucygpO1xuICAgIH0sXG5cbiAgICBkZXNrdG9wTm90aWZ5OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIG4gPSBuZXcgTm90aWZ5KFwiTmV3IG1lc3NhZ2Ugb24gXCIgKyAoZXZlbnQud2lwLnByb2R1Y3RfbmFtZSksIHtcbiAgICAgICAgYm9keTogKGV2ZW50LmFjdG9yLnVzZXJuYW1lICsgXCI6IFwiICsgZXZlbnQuYm9keV9zYW5pdGl6ZWQpLFxuICAgICAgICB0YWc6IGV2ZW50LmlkLFxuICAgICAgICBpY29uOiBJQ09OX1VSTCxcbiAgICAgICAgdGltZW91dDogMTUsXG5cbiAgICAgICAgbm90aWZ5Q2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQod2luZG93KS5mb2N1cygpO1xuICAgICAgICAgIGlmICh3aW5kb3cuYXBwLndpcC5pZCAhPSBldmVudC53aXAuaWQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hcHAucmVkaXJlY3RUbyhldmVudC53aXAudXJsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gbi5zaG93KCk7XG4gICAgfSxcblxuICAgIGZldGNoTm90aWZpY2F0aW9uczogXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IE4uQUNUSU9OUy5GRVRDSF9DSEFUX1JPT01TLFxuICAgICAgICBldmVudDogTi5FVkVOVFMuQ0hBVF9ST09NU19GRVRDSEVELFxuICAgICAgICBkYXRhOiB0aGlzLnByb3BzLnVybFxuICAgICAgfSk7XG4gICAgfSwgMTAwMCksXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IGRvY3VtZW50LnRpdGxlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogbnVsbCxcbiAgICAgICAgc29ydEtleXM6IFtdLFxuICAgICAgICBhY2tub3dsZWRnZWRBdDogdGhpcy5zdG9yZWRBY2soKSxcbiAgICAgICAgZGVza3RvcE5vdGlmaWNhdGlvbnNFbmFibGVkOiBmYWxzZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaGFuZGxlQ2hhdFJvb21zQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBkYXRhOiBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmdldENoYXRSb29tcygpLFxuICAgICAgICBzb3J0S2V5czogQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5nZXRTb3J0S2V5cygpXG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFfLmlzRW1wdHkoc2VsZi5zdGF0ZS5kYXRhKSkge1xuICAgICAgICAgIHNlbGYuc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVEZXNrdG9wTm90aWZpY2F0aW9uc1N0YXRlQ2hhbmdlOiBmdW5jdGlvbihpc0VuYWJsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBkZXNrdG9wTm90aWZpY2F0aW9uc0VuYWJsZWQ6IGlzRW5hYmxlZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUHVzaDogZnVuY3Rpb24oZm4pIHtcbiAgICAgIGlmICh3aW5kb3cucHVzaGVyKSB7XG4gICAgICAgIGNoYW5uZWwgPSB3aW5kb3cucHVzaGVyLnN1YnNjcmliZSgnQCcgKyB0aGlzLnByb3BzLnVzZXJuYW1lKTtcbiAgICAgICAgY2hhbm5lbC5iaW5kX2FsbChmbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGxhdGVzdEFydGljbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8ubWF4KHRoaXMuYXJ0aWNsZXMoKSwgZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gYSAmJiBhLnRpbWVzdGFtcDtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBsYXRlc3RBcnRpY2xlVGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcnRpY2xlID0gdGhpcy5sYXRlc3RBcnRpY2xlKClcblxuICAgICAgaWYgKGFydGljbGUpIHtcbiAgICAgICAgcmV0dXJuIGFydGljbGUudGltZXN0YW1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc29ydGVkID0gdGhpcy5zb3J0QnlMYXN0UmVhZEF0KHRoaXMuc3RhdGUuZGF0YSk7XG4gICAgICB2YXIgcHJvZHVjdHNQYXRoID0gJy91c2Vycy8nICsgdGhpcy5wcm9wcy51c2VybmFtZTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiZHJvcGRvd24tbWVudVwiLCBzdHlsZTogeydtaW4td2lkdGgnOiAnMzgwcHgnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7cmVmOiBcInNwaW5uZXJcIiwgc3R5bGU6IHsgJ21pbi1oZWlnaHQnOiAnNTBweCcsICdtYXgtaGVpZ2h0JzogJzMwMHB4J319LCBcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvbnNMaXN0KHtkYXRhOiBfLmZpcnN0KHNvcnRlZCwgNyl9KVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHByb2R1Y3RzUGF0aCwgY2xhc3NOYW1lOiBcInRleHQtc21hbGxcIn0sIFwiQWxsIFByb2R1Y3RzXCIpXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICAhdGhpcy5zdGF0ZS5kZXNrdG9wTm90aWZpY2F0aW9uc0VuYWJsZWQgPyBEZXNrdG9wTm90aWZpY2F0aW9ucyh7b25DaGFuZ2U6IHRoaXMuaGFuZGxlRGVza3RvcE5vdGlmaWNhdGlvbnNTdGF0ZUNoYW5nZX0pIDogbnVsbFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc2V0QmFkZ2U6IGZ1bmN0aW9uKHRvdGFsKSB7XG4gICAgICBpZiAod2luZG93LmZsdWlkKSB7XG4gICAgICAgIHdpbmRvdy5mbHVpZC5kb2NrQmFkZ2UgPSB0b3RhbDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3Bpbm5lck9wdGlvbnM6IHtcbiAgICAgIGxpbmVzOiAxMSxcbiAgICAgIHRvcDogJzIwJSdcbiAgICB9LFxuXG4gICAgc3RvcmVkQWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBsb2NhbFN0b3JhZ2UuY2hhdEFjaztcblxuICAgICAgaWYgKHRpbWVzdGFtcCA9PSBudWxsIHx8IHRpbWVzdGFtcCA9PT0gXCJudWxsXCIpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQodGltZXN0YW1wKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcmVkQWNrQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgYWNrbm93bGVkZ2VkQXQ6IHRoaXMuc3RvcmVkQWNrKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIE5vdGlmaWNhdGlvbnNMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnTm90aWZpY2F0aW9uc0xpc3QnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvZHVjdE5vZGVzID0gdGhpcy5wcm9wcy5kYXRhLm1hcChmdW5jdGlvbihlbnRyeSl7XG4gICAgICAgIHZhciBiYWRnZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKGVudHJ5LnVwZGF0ZWQgPiBlbnRyeS5sYXN0X3JlYWRfYXQpIHtcbiAgICAgICAgICBiYWRnZSA9IFJlYWN0LkRPTS5zcGFuKHtcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImluZGljYXRvciBpbmRpY2F0b3ItZGFuZ2VyIHB1bGwtcmlnaHRcIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7ICdwb3NpdGlvbic6ICdyZWxhdGl2ZScsICd0b3AnOiAnMTBweCd9fSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBlbnRyeS51cmwsIGtleTogZW50cnkuaWQsIGNsYXNzTmFtZTogXCJsaXN0LWdyb3VwLWl0ZW1cIn0sIFxuICAgICAgICAgICAgYmFkZ2UsIFwiIFwiLCBlbnRyeS5sYWJlbFxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGlzdC1ncm91cFwifSwgXG4gICAgICAgICAgcHJvZHVjdE5vZGVzXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENoYXROb3RpZmljYXRpb25zO1xuICB9XG5cbiAgd2luZG93LkNoYXROb3RpZmljYXRpb25zID0gQ2hhdE5vdGlmaWNhdGlvbnM7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL2NoYXRfbm90aWZpY2F0aW9uc19zdG9yZScpO1xudmFyIERyb3Bkb3duVG9nZ2xlck1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL2Ryb3Bkb3duX3RvZ2dsZXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIENOID0gQ09OU1RBTlRTLkNIQVRfTk9USUZJQ0FUSU9OUztcblxuICB2YXIgQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyJyxcbiAgICBtaXhpbnM6IFtEcm9wZG93blRvZ2dsZXJNaXhpbl0sXG5cbiAgICBhY2tub3dsZWRnZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZXN0YW1wID0gbW9tZW50KCkudW5peCgpO1xuXG4gICAgICBsb2NhbFN0b3JhZ2UuY2hhdEFjayA9IHRpbWVzdGFtcDtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aW1lc3RhbXBcbiAgICAgIH0pO1xuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IENOLkVWRU5UUy5BQ0tOT1dMRURHRUQsXG4gICAgICAgIGFjdGlvbjogQ04uQUNUSU9OUy5BQ0tOT1dMRURHRSxcbiAgICAgICAgZGF0YTogdGltZXN0YW1wLFxuICAgICAgICBzeW5jOiB0cnVlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYmFkZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnNwYW4oe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiBcImluZGljYXRvciBpbmRpY2F0b3ItZGFuZ2VyXCIsIFxuICAgICAgICAgICAgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIHRvcDogJzVweCd9fSlcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGJhZGdlQ291bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMubGF0ZXN0Q2hhdFVwZGF0ZSgpID4gdGhpcy5zdGF0ZS5hY2tub3dsZWRnZWRBdCkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIDA7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBDaGF0Tm90aWZpY2F0aW9uc1N0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3Rvcmllcyk7XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjaGF0Um9vbXM6IG51bGwsXG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aGlzLnN0b3JlZEFjaygpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRTdG9yaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBjaGF0Um9vbXM6IENoYXROb3RpZmljYXRpb25zU3RvcmUuZ2V0Q2hhdFJvb21zKClcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBsYXRlc3RDaGF0VXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjaGF0Um9vbSA9IENoYXROb3RpZmljYXRpb25zU3RvcmUubW9zdFJlY2VudGx5VXBkYXRlZENoYXRSb29tKCk7XG4gICAgICBpZiAoY2hhdFJvb20pIHtcbiAgICAgICAgcmV0dXJuIGNoYXRSb29tLnVwZGF0ZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICB0b3RhbDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBjb3VudCA9IF8ucmVkdWNlKFxuICAgICAgICBfLm1hcChzZWxmLnN0YXRlLmNoYXRSb29tcywgZnVuY3Rpb24gbWFwU3RvcmllcyhjaGF0Um9vbSkge1xuICAgICAgICAgIHJldHVybiBjaGF0Um9vbS5jb3VudDtcbiAgICAgICAgfSksIGZ1bmN0aW9uIHJlZHVjZVN0b3JpZXMobWVtbywgcmVhZCkge1xuICAgICAgICAgIHJldHVybiBtZW1vICsgcmVhZDtcbiAgICAgIH0sIDApO1xuXG4gICAgICByZXR1cm4gY291bnQ7XG4gICAgfSxcblxuICAgIHN0b3JlZEFjazogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZXN0YW1wID0gbG9jYWxTdG9yYWdlLmNoYXRBY2s7XG5cbiAgICAgIGlmICh0aW1lc3RhbXAgPT0gbnVsbCB8fCB0aW1lc3RhbXAgPT09ICdudWxsJykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aW1lc3RhbXAsIDEwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyO1xuICB9XG5cbiAgd2luZG93LkNoYXROb3RpZmljYXRpb25zVG9nZ2xlciA9IENoYXROb3RpZmljYXRpb25zVG9nZ2xlcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgQ29pbk93bmVyc2hpcFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL2NvaW5fb3duZXJzaGlwX3N0b3JlJyk7XG52YXIgQXZhdGFyID0gcmVxdWlyZSgnLi9hdmF0YXIuanMuanN4Jyk7XG52YXIgUGVyc29uUGlja2VyID0gcmVxdWlyZSgnLi9wZXJzb25fcGlja2VyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBDTyA9IENPTlNUQU5UUy5DT0lOX09XTkVSU0hJUDtcblxuICBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGZuKGUpXG4gICAgfVxuICB9XG5cbiAgdmFyIENvaW5Pd25lcnNoaXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDb2luT3duZXJzaGlwJyxcbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgdG90YWxDb2luczogNjAwMCB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBDb2luT3duZXJzaGlwU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5vbkNoYW5nZSk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdG9yOiBfLmV4dGVuZChhcHAuY3VycmVudFVzZXIoKS5hdHRyaWJ1dGVzLCB7IGNvaW5zOiB0aGlzLnByb3BzLnRvdGFsQ29pbnMgfSksXG4gICAgICAgIHNoYXJlcnM6IENvaW5Pd25lcnNoaXBTdG9yZS5nZXRVc2VycygpLFxuICAgICAgICBwZXJjZW50YWdlQXZhaWxhYmxlOiAwLFxuICAgICAgICBwb3RlbnRpYWxVc2VyOiBudWxsXG4gICAgICB9XG4gICAgfSxcblxuICAgIG93bmVyc2hpcDogZnVuY3Rpb24odXNlcikge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICAwLCBNYXRoLm1pbihcbiAgICAgICAgICAxMDAsIHBhcnNlSW50KHVzZXIuY29pbnMgKiAxMDAgLyB0aGlzLnRvdGFsQ29pbnMoKSwgMTApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgdG90YWxDb2luczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2hhcmVyQ29pbnMgPSBfLnJlZHVjZShfLm1hcCh0aGlzLnN0YXRlLnNoYXJlcnMsIGZ1bmMuZG90KCdjb2lucycpKSwgZnVuY3Rpb24obWVtbywgbnVtKSB7IHJldHVybiBtZW1vICsgbnVtOyB9LCAwKVxuXG4gICAgICByZXR1cm4gc2hhcmVyQ29pbnMgKyB0aGlzLnN0YXRlLmNyZWF0b3IuY29pbnNcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjcmVhdG9yID0gdGhpcy5zdGF0ZS5jcmVhdG9yO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udGFibGUoe2NsYXNzTmFtZTogXCJ0YWJsZVwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRoZWFkKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NvbFNwYW46IFwiMlwifSwgXCJQYXJ0bmVyXCIpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwiLCBzdHlsZToge3dpZHRoOiAxMzB9fSwgXCJPd25lcnNoaXBcIiksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcIkNvaW5zXCIpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRib2R5KG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKHtjbGFzc05hbWU6IFwiYWN0aXZlXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIEF2YXRhcih7dXNlcjogY3JlYXRvcn0pKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBcIkBcIiwgY3JlYXRvci51c2VybmFtZVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCB0aGlzLm93bmVyc2hpcChjcmVhdG9yKSwgXCIlXCIpXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtY29pbnNcIiwgc3R5bGU6IHtcIndoaXRlLXNwYWNlXCI6XCJub3dyYXBcIn19LCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgICAgICBjcmVhdG9yLmNvaW5zXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcIih5b3UpXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICB0aGlzLnJvd3MoKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIEF2YXRhcih7dXNlcjogdGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyLCBhbHdheXNEZWZhdWx0OiBcInRydWVcIn0pKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBQZXJzb25QaWNrZXIoe3JlZjogXCJwaWNrZXJcIiwgdXJsOiBcIi9fZXNcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJTZWxlY3RlZDogdGhpcy5oYW5kbGVVc2VyU2VsZWN0ZWQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZFVzZXJDaGFuZ2VkOiB0aGlzLmhhbmRsZVZhbGlkVXNlckNoYW5nZWR9KVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cCBpbnB1dC1ncm91cC1zbVwifSwgXG5cbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7Y2xhc3NOYW1lOiBcImZvcm0tY29udHJvbCB0ZXh0LXJpZ2h0XCIsIHR5cGU6IFwibnVtYmVyXCIsIHZhbHVlOiB0aGlzLnN0YXRlLnBlcmNlbnRhZ2VBdmFpbGFibGUsIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUlucHV0Q2hhbmdlfSksIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWFkZG9uXCJ9LCBcIiVcIilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zIHB1bGwtcmlnaHRcIiwgc3R5bGU6IHsnd2hpdGUtc3BhY2UnOlwibm93cmFwXCJ9fSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1hcHAtY29pblwifSksIFxuICAgICAgICAgICAgICAgICAgXCIwXCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEJ1dHRvbigpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgYWRkQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwidGV4dC1zdWNjZXNzXCIsIFxuICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ30sIFxuICAgICAgICAgICAgb25DbGljazogdGhpcy5zdGF0ZS5wb3RlbnRpYWxVc2VyID8gdGhpcy5hZGRVc2VyQ2xpY2tlZCA6ICcnfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tcGx1cy1jaXJjbGVkXCJ9KSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJzci1vbmx5XCJ9LCBcIkFkZFwiKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBoYW5kbGVVc2VyU2VsZWN0ZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHRoaXMuYWRkVXNlcih1c2VyKVxuICAgIH0sXG5cbiAgICBoYW5kbGVWYWxpZFVzZXJDaGFuZ2VkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcG90ZW50aWFsVXNlcjogdXNlclxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGFkZFVzZXJDbGlja2VkOiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuYWRkVXNlcih0aGlzLnN0YXRlLnBvdGVudGlhbFVzZXIpO1xuICAgICAgdGhpcy5yZWZzLnBpY2tlci5jbGVhclRleHQoKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVzZXJzID0gQ29pbk93bmVyc2hpcFN0b3JlLmdldFVzZXJzKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdXNlcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmICghdXNlcnNbaV0uaGFzT3duUHJvcGVydHkoJ2NvaW5zJykpIHtcbiAgICAgICAgICB1c2Vyc1tpXS5jb2lucyA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNoYXJlcnM6IHVzZXJzXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYWRkVXNlcjogZnVuY3Rpb24odXNlcikge1xuICAgICAgdmFyIHVzZXIgPSBfLmV4dGVuZCh1c2VyLCB7Y29pbnM6IDB9KTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZShSZWFjdC5hZGRvbnMudXBkYXRlKHRoaXMuc3RhdGUsIHtcbiAgICAgICAgcG90ZW50aWFsVXNlcjogeyRzZXQ6IG51bGx9LFxuICAgICAgICBzaGFyZXJzOiB7ICRwdXNoOiBbdXNlcl0gfVxuICAgICAgfSkpO1xuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IENPLkVWRU5UUy5VU0VSX0FEREVELFxuICAgICAgICBhY3Rpb246IENPLkFDVElPTlMuQUREX1VTRVIsXG4gICAgICAgIGRhdGE6IHsgdXNlckFuZENvaW5zOiB1c2VyIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1hcCh0aGlzLnN0YXRlLnNoYXJlcnMsIGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIE93bmVyc2hpcFJvdyh7XG4gICAgICAgICAgdXNlcjogdXNlciwgXG4gICAgICAgICAgdG90YWxDb2luczogdGhpcy5wcm9wcy50b3RhbENvaW5zLCBcbiAgICAgICAgICBvd25lcnNoaXA6IHRoaXMub3duZXJzaGlwKHVzZXIpLCBcbiAgICAgICAgICBvblJlbW92ZTogdGhpcy5oYW5kbGVVc2VyUmVtb3ZlZCh1c2VyKSwga2V5OiB1c2VyLmlkIHx8IHVzZXIuZW1haWwsIFxuICAgICAgICAgIG9uT3duZXJzaGlwQ2hhbmdlZDogdGhpcy5oYW5kbGVPd25lcnNoaXBDaGFuZ2VkKHVzZXIpfSlcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlclJlbW92ZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHVzZXJzID0gXy5yZWplY3QodGhpcy5zdGF0ZS5zaGFyZXJzLCBmdW5jdGlvbih1KXtcbiAgICAgICAgICBpZiAodS5pZCkge1xuICAgICAgICAgICAgcmV0dXJuIHUuaWQgPT0gdXNlci5pZFxuICAgICAgICAgIH0gZWxzZSBpZiAodS5lbWFpbCkge1xuICAgICAgICAgICAgcmV0dXJuIHUuZW1haWwgPT0gdXNlci5lbWFpbFxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgZXZlbnQ6IENPLkVWRU5UUy5VU0VSX1JFTU9WRUQsXG4gICAgICAgICAgYWN0aW9uOiBDTy5BQ1RJT05TLlJFTU9WRV9VU0VSLFxuICAgICAgICAgIGRhdGE6IHsgdXNlckFuZENvaW5zOiB1c2VyIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGNyZWF0b3IgPSB0aGlzLnN0YXRlLmNyZWF0b3I7XG5cbiAgICAgICAgY3JlYXRvci5jb2lucyA9IGNyZWF0b3IuY29pbnMgKyB1c2VyLmNvaW5zO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHNoYXJlcnM6IHVzZXJzLFxuICAgICAgICAgIGNyZWF0b3I6IGNyZWF0b3JcbiAgICAgICAgfSk7XG5cbiAgICAgIH0uYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlT3duZXJzaGlwQ2hhbmdlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgLy8gdGhpcyBuZWVkcyB0byBiZSBjb21wbGV0ZWx5IHJld3JpdHRlbiB0byB1c2UgdGhlIGRpc3BhdGNoZXIgYW5kIHN0b3JlKHMpXG4gICAgICByZXR1cm4gZnVuY3Rpb24ob3duZXJzaGlwKSB7XG4gICAgICAgIHVzZXIuY29pbnMgPSBNYXRoLmZsb29yKChvd25lcnNoaXAgLyAxMDApICogdGhpcy5wcm9wcy50b3RhbENvaW5zKTtcblxuICAgICAgICB2YXIgY3JlYXRvciA9IHRoaXMuc3RhdGUuY3JlYXRvcjtcbiAgICAgICAgdmFyIHNoYXJlcnMgPSB0aGlzLnN0YXRlLnNoYXJlcnM7XG5cbiAgICAgICAgdmFyIHNoYXJlckNvaW5zID0gXy5yZWR1Y2UoXG4gICAgICAgICAgXy5tYXAoc2hhcmVycyxcbiAgICAgICAgICBmdW5jLmRvdCgnY29pbnMnKSksXG4gICAgICAgICAgZnVuY3Rpb24obWVtbywgY29pbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1vICsgY29pbnM7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAwXG4gICAgICAgICk7XG5cbiAgICAgICAgY3JlYXRvci5jb2lucyA9IHRoaXMucHJvcHMudG90YWxDb2lucyAtIHNoYXJlckNvaW5zIHx8IDA7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgc2hhcmVyczogdGhpcy5zdGF0ZS5zaGFyZXJzLFxuICAgICAgICAgIGNyZWF0b3I6IGNyZWF0b3JcbiAgICAgICAgfSk7XG5cbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH1cbiAgfSk7XG5cbiAgdmFyIE93bmVyc2hpcFJvdyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ093bmVyc2hpcFJvdycsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG93bmVyc2hpcDogMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB1c2VyID0gdGhpcy5wcm9wcy51c2VyO1xuXG4gICAgICBpZiAodXNlci5lbWFpbCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWQgZ2x5cGhpY29uIGdseXBoaWNvbi1lbnZlbG9wZVwifSkpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgdXNlci5lbWFpbFxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cCBpbnB1dC1ncm91cC1zbVwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtyZWY6IFwib3duZXJzaGlwXCIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2wgdGV4dC1yaWdodFwiLCB0eXBlOiBcIm51bWJlclwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ293bmVyc2hpcFsnICsgdXNlci5lbWFpbCArICddJywgXG4gICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLm93bmVyc2hpcCwgXG4gICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZU93bmVyc2hpcENoYW5nZWR9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWFkZG9uXCJ9LCBcIiVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zXCIsIHN0eWxlOiB7J3doaXRlLXNwYWNlJzpcIm5vd3JhcFwifX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgICAgdXNlci5jb2luc1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCIsIG9uQ2xpY2s6IHByZXZlbnREZWZhdWx0KHRoaXMucHJvcHMub25SZW1vdmUpLCBjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBsaW5rLWhvdmVyLWRhbmdlclwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2xvc2VcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiUmVtb3ZlXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBBdmF0YXIoe3VzZXI6IHVzZXJ9KSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICBcIkBcIiwgdXNlci51c2VybmFtZVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cCBpbnB1dC1ncm91cC1zbVwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtyZWY6IFwib3duZXJzaGlwXCIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2wgdGV4dC1yaWdodFwiLCB0eXBlOiBcIm51bWJlclwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ293bmVyc2hpcFsnICsgdXNlci5pZCArICddJywgXG4gICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLm93bmVyc2hpcCwgXG4gICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZU93bmVyc2hpcENoYW5nZWR9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwLWFkZG9uXCJ9LCBcIiVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zXCIsIHN0eWxlOiB7J3doaXRlLXNwYWNlJzpcIm5vd3JhcFwifX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWFwcC1jb2luXCJ9KSwgXG4gICAgICAgICAgICAgICAgdXNlci5jb2luc1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCIsIG9uQ2xpY2s6IHByZXZlbnREZWZhdWx0KHRoaXMucHJvcHMub25SZW1vdmUpLCBjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBsaW5rLWhvdmVyLWRhbmdlclwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2xvc2VcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiUmVtb3ZlXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgaGFuZGxlT3duZXJzaGlwQ2hhbmdlZDogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHZhbCA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlLCAxMCk7XG5cbiAgICAgIGlmICh2YWwgPCAwKSB7XG4gICAgICAgIHZhbCA9IDA7XG4gICAgICB9XG5cbiAgICAgIHZhciB1c2VyID0gdGhpcy5wcm9wcy51c2VyO1xuICAgICAgdmFyIHVzZXJzID0gQ29pbk93bmVyc2hpcFN0b3JlLmdldFVzZXJzKCk7XG5cbiAgICAgIHZhciBzaGFyZXJDb2lucyA9IF8ucmVkdWNlKF8ubWFwKF8ucmVqZWN0KHVzZXJzLFxuICAgICAgICBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgcmV0dXJuIHMudXNlcm5hbWUgPT09IHVzZXIudXNlcm5hbWVcbiAgICAgICAgfSksXG4gICAgICAgIGZ1bmMuZG90KCdjb2lucycpKSxcbiAgICAgICAgZnVuY3Rpb24obWVtbywgY29pbnMpIHtcbiAgICAgICAgICByZXR1cm4gbWVtbyArIGNvaW5zO1xuICAgICAgICB9LFxuICAgICAgMCk7XG5cbiAgICAgIHZhciBwZXJjZW50YWdlUmVtYWluaW5nID0gMTAwIC0gTWF0aC5jZWlsKHNoYXJlckNvaW5zIC8gdGhpcy5wcm9wcy50b3RhbENvaW5zICogMTAwKTtcblxuICAgICAgaWYgKHZhbCA+PSBwZXJjZW50YWdlUmVtYWluaW5nKSB7XG4gICAgICAgIHZhbCA9IHBlcmNlbnRhZ2VSZW1haW5pbmc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBvd25lcnNoaXA6IHZhbFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMucHJvcHMub25Pd25lcnNoaXBDaGFuZ2VkKHZhbCk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENvaW5Pd25lcnNoaXA7XG4gIH1cblxuICB3aW5kb3cuQ29pbk93bmVyc2hpcCA9IENvaW5Pd25lcnNoaXA7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcblxuICBmdW5jdGlvbiBhdFVzZXJuYW1lKHVzZXIpIHtcbiAgICByZXR1cm4gJ0AnICsgdXNlci51c2VybmFtZVxuICB9XG5cbiAgZnVuY3Rpb24gYXZhdGFyVXJsKHVzZXIsIHNpemUpIHtcbiAgICBpZiAodXNlcikge1xuICAgICAgcmV0dXJuIHVzZXIuYXZhdGFyX3VybCArICc/cz0nICsgNDhcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcvYXNzZXRzL2F2YXRhcnMvZGVmYXVsdC5wbmcnXG4gICAgfVxuICB9XG5cbiAgdmFyIENvcmVUZWFtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ29yZVRlYW0nLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyB1c2VyczogW10sIHBvdGVudGlhbFVzZXI6IG51bGwgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnRhYmxlKHtjbGFzc05hbWU6IFwidGFibGVcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS50Ym9keShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50cih7Y2xhc3NOYW1lOiBcImFjdGl2ZVwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW1nKHthbHQ6IGF0VXNlcm5hbWUodGhpcy5wcm9wcy5jdXJyZW50VXNlciksIFxuICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImF2YXRhciBpbWctY2lyY2xlXCIsIFxuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjI0XCIsIHdpZHRoOiBcIjI0XCIsIFxuICAgICAgICAgICAgICAgICAgICAgc3JjOiBhdmF0YXJVcmwodGhpcy5wcm9wcy5jdXJyZW50VXNlciwgNDgpfSlcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBhdFVzZXJuYW1lKHRoaXMucHJvcHMuY3VycmVudFVzZXIpKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXCIoeW91KVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIHRoaXMucm93cygpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMuc3RhdGUucG90ZW50aWFsVXNlciA/IHRoaXMuYXZhdGFyKHRoaXMuc3RhdGUucG90ZW50aWFsVXNlcikgOiB0aGlzLmF2YXRhcihudWxsKSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgICAgUGVyc29uUGlja2VyKHtyZWY6IFwicGlja2VyXCIsIHVybDogXCIvX2VzXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyU2VsZWN0ZWQ6IHRoaXMuaGFuZGxlVXNlclNlbGVjdGVkLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsaWRVc2VyQ2hhbmdlZDogdGhpcy5oYW5kbGVWYWxpZFVzZXJDaGFuZ2VkfSlcbiAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQnV0dG9uKClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBhZGRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUucG90ZW50aWFsVXNlcikge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwidGV4dC1zdWNjZXNzXCIsIGhyZWY6IFwiI1wiLCBvbkNsaWNrOiB0aGlzLmFkZFVzZXJDbGlja2VkfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1wbHVzLWNpcmNsZWRcIn0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJBZGRcIilcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LXN1Y2Nlc3NcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tcGx1cy1jaXJjbGVkXCJ9KSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiQWRkXCIpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSxcblxuICAgIHJvd3M6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gXy5tYXAodGhpcy5zdGF0ZS51c2VycywgZnVuY3Rpb24odXNlcil7XG4gICAgICAgIHJldHVybiBNZW1iZXJSb3coe3VzZXI6IHVzZXIsIG9uUmVtb3ZlOiB0aGlzLmhhbmRsZVVzZXJSZW1vdmVkKHVzZXIpLCBrZXk6IHVzZXIuaWQgfHwgdXNlci5lbWFpbH0pXG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIGhhbmRsZVVzZXJTZWxlY3RlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5hZGRVc2VyKHVzZXIpXG4gICAgfSxcblxuICAgIGhhbmRsZVVzZXJSZW1vdmVkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB1c2VycyA9IF8ucmVqZWN0KHRoaXMuc3RhdGUudXNlcnMsIGZ1bmN0aW9uKHUpe1xuICAgICAgICAgIGlmICh1LmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdS5pZCA9PSB1c2VyLmlkXG4gICAgICAgICAgfSBlbHNlIGlmICh1LmVtYWlsKSB7XG4gICAgICAgICAgICByZXR1cm4gdS5lbWFpbCA9PSB1c2VyLmVtYWlsXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHt1c2VyczogdXNlcnN9KTtcblxuICAgICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICBldmVudDogQ09OU1RBTlRTLkNPSU5fT1dORVJTSElQLkVWRU5UUy5VU0VSX1JFTU9WRUQsXG4gICAgICAgICAgYWN0aW9uOiBDT05TVEFOVFMuQ09JTl9PV05FUlNISVAuQUNUSU9OUy5SRU1PVkVfVVNFUixcbiAgICAgICAgICBkYXRhOiB7IHVzZXJBbmRDb2luczogdXNlciB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9LmJpbmQodGhpcylcbiAgICB9LFxuXG4gICAgaGFuZGxlVmFsaWRVc2VyQ2hhbmdlZDogZnVuY3Rpb24odXNlcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7cG90ZW50aWFsVXNlcjogdXNlcn0pXG4gICAgfSxcblxuICAgIGFkZFVzZXJDbGlja2VkOiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuYWRkVXNlcih0aGlzLnN0YXRlLnBvdGVudGlhbFVzZXIpXG4gICAgICB0aGlzLnJlZnMucGlja2VyLmNsZWFyVGV4dCgpXG4gICAgfSxcblxuICAgIGFkZFVzZXI6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB7XG4gICAgICAgIHBvdGVudGlhbFVzZXI6IHskc2V0OiBudWxsfSxcbiAgICAgICAgdXNlcnM6IHsgJHB1c2g6IFt1c2VyXSB9XG4gICAgICB9KSlcblxuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGV2ZW50OiBDT05TVEFOVFMuQ09JTl9PV05FUlNISVAuRVZFTlRTLlVTRVJfQURERUQsXG4gICAgICAgIGFjdGlvbjogQ09OU1RBTlRTLkNPSU5fT1dORVJTSElQLkFDVElPTlMuQUREX1VTRVIsXG4gICAgICAgIGRhdGE6IHsgdXNlckFuZENvaW5zOiB1c2VyIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhdmF0YXI6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIGlmICh1c2VyICYmIHVzZXIuZW1haWwpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBnbHlwaGljb24gZ2x5cGhpY29uLWVudmVsb3BlXCJ9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJhdmF0YXIgaW1nLWNpcmNsZVwiLCBoZWlnaHQ6IFwiMjRcIiwgc3JjOiBhdmF0YXJVcmwodXNlciksIHdpZHRoOiBcIjI0XCJ9KVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGZuKGUpXG4gICAgfVxuICB9XG5cbiAgdmFyIE1lbWJlclJvdyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ01lbWJlclJvdycsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgaWYgKHRoaXMucHJvcHMudXNlci5lbWFpbCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWQgZ2x5cGhpY29uIGdseXBoaWNvbi1lbnZlbG9wZVwifSkpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCB0aGlzLnByb3BzLnVzZXIuZW1haWwpLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJoaWRkZW5cIiwgdmFsdWU6IHRoaXMucHJvcHMudXNlci5lbWFpbCwgbmFtZTogXCJjb3JlX3RlYW1bXVwifSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCIsIG9uQ2xpY2s6IHByZXZlbnREZWZhdWx0KHRoaXMucHJvcHMub25SZW1vdmUpLCBjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBsaW5rLWhvdmVyLWRhbmdlclwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2xvc2VcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNyLW9ubHlcIn0sIFwiUmVtb3ZlXCIpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJhdmF0YXJcIiwgc3JjOiBhdmF0YXJVcmwodGhpcy5wcm9wcy51c2VyLCA0OCksIHdpZHRoOiAyNCwgaGVpZ2h0OiAyNH0pKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXCJAXCIsIHRoaXMucHJvcHMudXNlci51c2VybmFtZSksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCB2YWx1ZTogdGhpcy5wcm9wcy51c2VyLmlkLCBuYW1lOiBcImNvcmVfdGVhbVtdXCJ9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIiwgb25DbGljazogcHJldmVudERlZmF1bHQodGhpcy5wcm9wcy5vblJlbW92ZSksIGNsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIGxpbmstaG92ZXItZGFuZ2VyXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jbG9zZVwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3Itb25seVwifSwgXCJSZW1vdmVcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb3JlVGVhbTtcbiAgfVxuXG4gIHdpbmRvdy5Db3JlVGVhbSA9IENvcmVUZWFtO1xuXG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIERlc2t0b3BOb3RpZmljYXRpb25zID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRGVza3RvcE5vdGlmaWNhdGlvbnMnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBlbmFibGVkOiBmYWxzZSB9XG4gICAgfSxcblxuICAgIHVwZGF0ZUVuYWJsZWQ6IGZ1bmN0aW9uKGVuYWJsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlbmFibGVkOiBlbmFibGVkfSlcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5zdGF0ZS5lbmFibGVkKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy51cGRhdGVFbmFibGVkKCEoTm90aWZ5LmlzU3VwcG9ydGVkKCkgJiYgTm90aWZ5Lm5lZWRzUGVybWlzc2lvbigpKSlcbiAgICB9LFxuXG4gICAgaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpc1xuICAgICAgTm90aWZ5LnJlcXVlc3RQZXJtaXNzaW9uKGZ1bmN0aW9uKCl7XG4gICAgICAgIF90aGlzLnVwZGF0ZUVuYWJsZWQodHJ1ZSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIGlmKHRoaXMuc3RhdGUuZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4obnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNlbmFibGUtbm90aWZpY2F0aW9uc1wiLCBjbGFzc05hbWU6IFwianMtZW5hYmxlLW5vdGlmaWNhdGlvbnMgdGV4dC1zbWFsbFwiLCAnZGF0YS10b2dnbGUnOiBcInRvb2x0aXBcIiwgJ2RhdGEtcGxhY2VtZW50JzogXCJsZWZ0XCIsIHRpdGxlOiBcIkVuYWJsZcKgZGVza3RvcCBub3RpZmljYXRpb25zIGZvciBAbWVudGlvbnNcIiwgb25DbGljazogdGhpcy5oYW5kbGVDbGlja30sIFxuICAgICAgICAgICAgXCJFbmFibGUgbm90aWZpY2F0aW9uc1wiXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wTm90aWZpY2F0aW9ucztcbiAgfVxuXG4gIHdpbmRvdy5EZXNrdG9wTm90aWZpY2F0aW9ucyA9IERlc2t0b3BOb3RpZmljYXRpb25zO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgRHJhZ0FuZERyb3AgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEcmFnQW5kRHJvcCcsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IGRpc3BsYXk6ICdub25lJywgb3BhY2l0eTogMSB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2lkOiBcImxvZ28tdXBsb2FkXCIsIFxuICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiaW1nLXNoYWRvdyBqcy1kcm9wem9uZS1zZWxlY3RcIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9LCBcbiAgICAgICAgICAgICAgb25Nb3VzZUVudGVyOiB0aGlzLm9uTW91c2VFbnRlciwgXG4gICAgICAgICAgICAgIG9uTW91c2VMZWF2ZTogdGhpcy5vbk1vdXNlTGVhdmV9LCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogdGhpcy5wcm9wcy51cmwsIFxuICAgICAgICAgICAgICBhbHQ6IHRoaXMucHJvcHMuYWx0LCBcbiAgICAgICAgICAgICAgc3R5bGU6IHtvcGFjaXR5OiB0aGlzLnN0YXRlLm9wYWNpdHl9LCBcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImltZy1yb3VuZGVkXCIsIFxuICAgICAgICAgICAgICB3aWR0aDogXCIxMDAlXCJ9KSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7c3R5bGU6IHtcbiAgICAgICAgICAgICAgZGlzcGxheTogdGhpcy5zdGF0ZS5kaXNwbGF5LFxuICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgJ3otaW5kZXgnOiAtMSxcbiAgICAgICAgICAgICAgdG9wOiAnNDAlJyxcbiAgICAgICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICcxMnB4JyxcbiAgICAgICAgICAgICAgJ2ZvbnQtd2VpZ2h0JzogJ2JvbGQnXG4gICAgICAgICAgfX0sIFxuICAgICAgICAgICAgXCJEcmFnIGFuZCBkcm9wIG9yIGNsaWNrIGhlcmVcIiwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYnIobnVsbCksIFxuICAgICAgICAgICAgXCJ0byBjaGFuZ2UgdGhlIGxvZ29cIlxuICAgICAgICAgIClcblxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIFRPRE86IEZpeCB0aGlzIGdvZGF3ZnVsIGhhY2tcbiAgICAgIHZhciBfdGltZW91dCxcbiAgICAgICAgICBub2RlID0gdGhpcy5nZXRET01Ob2RlKCk7XG5cbiAgICAgICQobm9kZSkuYmluZCgnZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vIHByZXZlbnQgaml0dGVyc1xuICAgICAgICBpZiAoX3RpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoX3RpbWVvdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5zZXRTdGF0ZSh7XG4gICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgICBvcGFjaXR5OiAwLjVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgJChub2RlKS5iaW5kKCdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3BsYXk6ICdub25lJyxcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25Nb3VzZUVudGVyOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgb3BhY2l0eTogMC41XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25Nb3VzZUxlYXZlOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZGlzcGxheTogJ25vbmUnLFxuICAgICAgICBvcGFjaXR5OiAxXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gRHJhZ0FuZERyb3A7XG4gIH1cblxuICB3aW5kb3cuRHJhZ0FuZERyb3AgPSBEcmFnQW5kRHJvcDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgTmV3c0ZlZWRNaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9uZXdzX2ZlZWQuanMuanN4Jyk7XG52YXIgTmV3c0ZlZWRTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9uZXdzX2ZlZWRfc3RvcmUnKTtcbnZhciBBdmF0YXIgPSByZXF1aXJlKCcuL2F2YXRhci5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBORiA9IENPTlNUQU5UUy5ORVdTX0ZFRUQ7XG5cbiAgdmFyIERyb3Bkb3duTmV3c0ZlZWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdEcm9wZG93bk5ld3NGZWVkJyxcbiAgICBtaXhpbnM6IFtOZXdzRmVlZE1peGluXSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBOZXdzRmVlZFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3Rvcmllcyk7XG5cbiAgICAgIHRoaXMuZmV0Y2hOZXdzRmVlZCh0aGlzLnByb3BzLnVybCk7XG5cbiAgICAgIHRoaXMub25QdXNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmZldGNoTmV3c0ZlZWQoKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGZldGNoTmV3c0ZlZWQ6IF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiBORi5BQ1RJT05TLkZFVENIX1NUT1JJRVMsXG4gICAgICAgIGV2ZW50OiBORi5FVkVOVFMuU1RPUklFU19GRVRDSEVELFxuICAgICAgICBkYXRhOiB0aGlzLnByb3BzLnVybFxuICAgICAgfSk7XG4gICAgfSwgMTAwMCksXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RvcmllczogbnVsbFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgbWFya0FsbEFzUmVhZDogZnVuY3Rpb24oKSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5SRUFEX0FMTCxcbiAgICAgICAgYWN0aW9uOiBORi5BQ1RJT05TLk1BUktfQUxMX0FTX1JFQUQsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblB1c2g6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICBpZiAod2luZG93LnB1c2hlcikge1xuICAgICAgICBjaGFubmVsID0gd2luZG93LnB1c2hlci5zdWJzY3JpYmUoJ0AnICsgdGhpcy5wcm9wcy51c2VybmFtZSk7XG4gICAgICAgIGNoYW5uZWwuYmluZF9hbGwoZm4pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiZHJvcGRvd24tbWVudVwiLCBzdHlsZTogeyAnbWF4LWhlaWdodCc6ICc1MDBweCcsICdtaW4td2lkdGgnOiAnMzgwcHgnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7c3R5bGU6IHsgJ292ZXJmbG93LXknOiAnc2Nyb2xsJ30sIHJlZjogXCJzcGlubmVyXCJ9LCBcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc3RvcmllcyA/IHRoaXMucm93cyh0aGlzLnN0YXRlLnN0b3JpZXMpIDogbnVsbFxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiZGl2aWRlclwiLCBzdHlsZTogeyAnbWFyZ2luLXRvcCc6ICcwcHgnfX0pLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB0aGlzLnByb3BzLmVkaXRVc2VyUGF0aCwgY2xhc3NOYW1lOiBcInRleHQtc21hbGxcIn0sIFwiU2V0dGluZ3NcIilcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNtYXJrLWFzLXJlYWRcIiwgY2xhc3NOYW1lOiBcInRleHQtc21hbGxcIiwgb25DbGljazogdGhpcy5tYXJrQWxsQXNSZWFkfSwgXCJNYXJrIGFsbCBhcyByZWFkXCIpXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIvbm90aWZpY2F0aW9uc1wiLCBjbGFzc05hbWU6IFwidGV4dC1zbWFsbFwifSwgXCJBbGwgTm90aWZpY2F0aW9uc1wiKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oc3Rvcmllcykge1xuICAgICAgdmFyIHJvd3MgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoaSA+IDkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJvd3MucHVzaChcbiAgICAgICAgICBFbnRyeSh7c3Rvcnk6IHN0b3JpZXNbaV0sIGFjdG9yczogdGhpcy5zdGF0ZS5hY3RvcnMsIGZ1bGxQYWdlOiB0aGlzLnByb3BzLmZ1bGxQYWdlfSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXBcIiwgc3R5bGU6IHsgJ21heC1oZWlnaHQnOiAnMzAwcHgnLCAnbWluLWhlaWdodCc6ICc1MHB4J319LCBcbiAgICAgICAgICByb3dzXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHNwaW5uZXJPcHRpb25zOiB7XG4gICAgICBsaW5lczogMTEsXG4gICAgICB0b3A6ICcyMCUnXG4gICAgfVxuICB9KTtcblxuICB2YXIgRW50cnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdFbnRyeScsXG4gICAgYWN0b3JzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLm1hcChcbiAgICAgICAgdGhpcy5wcm9wcy5zdG9yeS5hY3Rvcl9pZHMsXG4gICAgICAgIGZ1bmN0aW9uKGFjdG9ySWQpIHtcbiAgICAgICAgICByZXR1cm4gXy5maW5kV2hlcmUodGhpcy5wcm9wcy5hY3RvcnMsIHsgaWQ6IGFjdG9ySWQgfSlcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBib2R5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0YXJnZXQgPSB0aGlzLnByb3BzLnN0b3J5LmFjdGl2aXRpZXNbMF0udGFyZ2V0O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCBcbiAgICAgICAgICB0aGlzLnZlcmJNYXBbdGhpcy5wcm9wcy5zdG9yeS52ZXJiXSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcbiAgICAgICAgICAgIHRoaXMuc3ViamVjdE1hcFt0aGlzLnByb3BzLnN0b3J5LnN1YmplY3RfdHlwZV0uY2FsbCh0aGlzLCB0YXJnZXQpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgdGhpcy5wcm9kdWN0KClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucmVmcy5ib2R5KSB7XG4gICAgICAgIHRoaXMucmVmcy5ib2R5LmdldERPTU5vZGUoKS5pbm5lckhUTUwgPSB0aGlzLnByb3BzLnN0b3J5LnN1YmplY3QuYm9keV9odG1sO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBlbGxpcHNpczogZnVuY3Rpb24odGV4dCkge1xuICAgICAgaWYgKHRleHQgJiYgdGV4dC5sZW5ndGggPiA0MCkge1xuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgNDApICsgJ+KApic7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3Rvcnk6IHRoaXMucHJvcHMuc3RvcnlcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGlzUmVhZDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5zdG9yeS5sYXN0X3JlYWRfYXQgIT09IDA7XG4gICAgfSxcblxuICAgIG1hcmtBc1JlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gRklYTUU6IFRoaXMgbWV0aG9kIHNob3VsZG4ndCB3b3JrIHRoaXMgd2F5OyB1c2UgdGhlIERpc3BhdGNoZXJcbiAgICAgIHZhciBzdG9yeSA9IHRoaXMuc3RhdGUuc3Rvcnk7XG4gICAgICBzdG9yeS5sYXN0X3JlYWRfYXQgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzdG9yeTogc3RvcnlcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtYXJrQXNSZWFkQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5pc1JlYWQoKSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tZGlzYyBwdWxsLXJpZ2h0XCIsIG9uQ2xpY2s6IHRoaXMubWFya0FzUmVhZCwgdGl0bGU6ICdNYXJrIGFzIHJlYWQnLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ319KTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogTWFyayBhcyB1bnJlYWRcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1jaXJjbGUgcHVsbC1yaWdodFwiLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ319KVxuICAgIH0sXG5cbiAgICBwcmV2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib2R5X3ByZXZpZXcgPSB0aGlzLnByb3BzLnN0b3J5LmJvZHlfcHJldmlldztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCIsIHN0eWxlOiB7ICd0ZXh0LW92ZXJmbG93JzogJ2VsbGlwc2lzJ319LCBcbiAgICAgICAgICB0aGlzLmVsbGlwc2lzKGJvZHlfcHJldmlldylcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcHJvZHVjdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvZHVjdCA9IHRoaXMucHJvcHMuc3RvcnkucHJvZHVjdDtcblxuICAgICAgcmV0dXJuICcgaW4gJyArIHByb2R1Y3QubmFtZTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhY3RvcnMgPSBfLm1hcCh0aGlzLmFjdG9ycygpLCBmdW5jLmRvdCgndXNlcm5hbWUnKSkuam9pbignLCBAJylcblxuICAgICAgdmFyIGNsYXNzZXMgPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQoe1xuICAgICAgICAnZW50cnktcmVhZCc6IHRoaXMuaXNSZWFkKCksXG4gICAgICAgICdlbnRyeS11bnJlYWQnOiAhdGhpcy5pc1JlYWQoKSxcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiAnbGlzdC1ncm91cC1pdGVtICcgKyBjbGFzc2VzLCBcbiAgICAgICAgICAgIGhyZWY6IHRoaXMucHJvcHMuc3RvcnkudXJsLCBcbiAgICAgICAgICAgIHN0eWxlOiB7ICdmb250LXNpemUnOiAnMTRweCd9LCBcbiAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuc3RhdGUuc3RvcnkubGFzdF9yZWFkX2F0ID8gbnVsbCA6IHRoaXMubWFya0FzUmVhZH0sIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLW1kLTFcIn0sIFxuICAgICAgICAgICAgICBBdmF0YXIoe3VzZXI6IHRoaXMuYWN0b3JzKClbMF0sIHNpemU6IDE4fSksIFwiwqBcIlxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtMTBcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIGFjdG9ycyksIFwiIFwiLCB0aGlzLmJvZHkoKSwgXG4gICAgICAgICAgICAgIHRoaXMucHJldmlldygpXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC0xXCJ9LCBcbiAgICAgICAgICAgICAgdGhpcy5tYXJrQXNSZWFkQnV0dG9uKClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHN1YmplY3RNYXA6IHtcbiAgICAgIFRhc2s6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgcmV0dXJuIFwiI1wiICsgdGFzay5udW1iZXI7XG4gICAgICB9LFxuXG4gICAgICBEaXNjdXNzaW9uOiBmdW5jdGlvbihkaXNjdXNzaW9uKSB7XG4gICAgICAgIHJldHVybiAnZGlzY3Vzc2lvbidcbiAgICAgIH0sXG5cbiAgICAgIFdpcDogZnVuY3Rpb24oYm91bnR5KSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZ1bGxQYWdlKSB7XG4gICAgICAgICAgcmV0dXJuIFwiI1wiICsgYm91bnR5Lm51bWJlciArIFwiIFwiICsgYm91bnR5LnRpdGxlXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gXCIjXCIgKyBib3VudHkubnVtYmVyO1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtb21lbnQodGhpcy5wcm9wcy5zdG9yeS5jcmVhdGVkKS5mb3JtYXQoXCJkZGQsIGhBXCIpXG4gICAgfSxcblxuICAgIHZlcmJNYXA6IHtcbiAgICAgICdDb21tZW50JzogJ2NvbW1lbnRlZCBvbiAnLFxuICAgICAgJ0F3YXJkJzogJ2F3YXJkZWQgJyxcbiAgICAgICdDbG9zZSc6ICdjbG9zZWQgJ1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEcm9wZG93bk5ld3NGZWVkO1xuICB9XG5cbiAgd2luZG93LkRyb3Bkb3duTmV3c0ZlZWQgPSBEcm9wZG93bk5ld3NGZWVkO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRHJvcGRvd25Ub2dnbGVyTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvZHJvcGRvd25fdG9nZ2xlci5qcy5qc3gnKTtcbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBORiA9IENPTlNUQU5UUy5ORVdTX0ZFRUQ7XG5cbiAgdmFyIERyb3Bkb3duTmV3c0ZlZWRUb2dnbGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXInLFxuICAgIG1peGluczogW0Ryb3Bkb3duVG9nZ2xlck1peGluXSxcblxuICAgIGFja25vd2xlZGdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lc3RhbXAgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICAgIGxvY2FsU3RvcmFnZS5uZXdzRmVlZEFjayA9IHRpbWVzdGFtcDtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGFja25vd2xlZGdlZEF0OiB0aW1lc3RhbXBcbiAgICAgIH0pO1xuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5BQ0tOT1dMRURHRUQsXG4gICAgICAgIGFjdGlvbjogTkYuQUNUSU9OUy5BQ0tOT1dMRURHRSxcbiAgICAgICAgZGF0YTogdGltZXN0YW1wLFxuICAgICAgICBzeW5jOiB0cnVlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYmFkZ2U6IGZ1bmN0aW9uKHRvdGFsKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJiYWRnZSBiYWRnZS1ub3RpZmljYXRpb25cIn0sIHRvdGFsKTtcbiAgICB9LFxuXG4gICAgYmFkZ2VDb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5sYXRlc3RTdG9yeVRpbWVzdGFtcCgpID4gdGhpcy5zdGF0ZS5hY2tub3dsZWRnZWRBdCkge1xuICAgICAgICByZXR1cm4gTmV3c0ZlZWRTdG9yZS5nZXRVbnJlYWRDb3VudCh0aGlzLnN0YXRlLmFja25vd2xlZGdlZEF0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIDA7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBOZXdzRmVlZFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3Rvcmllcyk7XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdG9yaWVzOiBudWxsLFxuICAgICAgICBhY2tub3dsZWRnZWRBdDogdGhpcy5zdG9yZWRBY2soKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0U3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc3RvcmllczogTmV3c0ZlZWRTdG9yZS5nZXRTdG9yaWVzKClcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBsYXRlc3RTdG9yeTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3RvcmllcyA9IHRoaXMuc3RhdGUuc3RvcmllcztcblxuICAgICAgaWYgKCFzdG9yaWVzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0b3J5O1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoc3RvcnkgJiYgc3Rvcmllc1tpXS51cGRhdGVkID4gc3RvcnkudXBkYXRlZCkge1xuICAgICAgICAgIHN0b3J5ID0gc3Rvcmllc1tpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3RvcnkpIHtcbiAgICAgICAgICBzdG9yeSA9IHN0b3JpZXNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0b3J5O1xuICAgIH0sXG5cbiAgICBsYXRlc3RTdG9yeVRpbWVzdGFtcDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3RvcnkgPSB0aGlzLmxhdGVzdFN0b3J5KCk7XG5cbiAgICAgIHJldHVybiBzdG9yeSAmJiBzdG9yeS51cGRhdGVkID8gc3RvcnkudXBkYXRlZCA6IDA7XG4gICAgfSxcblxuICAgIHN0b3JlZEFjazogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZXN0YW1wID0gbG9jYWxTdG9yYWdlLm5ld3NGZWVkQWNrO1xuXG4gICAgICBpZiAodGltZXN0YW1wID09IG51bGwgfHwgdGltZXN0YW1wID09PSAnbnVsbCcpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQodGltZXN0YW1wLCAxMCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERyb3Bkb3duTmV3c0ZlZWRUb2dnbGVyO1xuICB9XG5cbiAgd2luZG93LkRyb3Bkb3duTmV3c0ZlZWRUb2dnbGVyID0gRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbi8vIFRPRE86IFRpZHkgdXAgc2hhcmVkIHN0YXRlXG5cbi8qKlxuICogUmlnaHQgbm93LCBib3RoIHRoZSB0YWJsZSBhbmQgdGhlIG1ldGVyIGhhdmVcbiAqIGFsbCBvZiB0aGUgZmluYW5jaWFscyBpbiBzdGF0ZTsgaXQgd291bGQgYmVcbiAqIGJldHRlciB0byBtb3ZlIGFsbCBvZiB0aGlzIHRvIHRoZSBGaW5hbmNpYWxzU3RvcmVcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBGaW5hbmNpYWxzU3RvcmUgPSB7XG4gICAgbW9udGg6ICdKdW5lJyxcbiAgICBnZXRNb250aDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5tb250aDtcbiAgICB9LFxuXG4gICAgc2V0TW9udGg6IGZ1bmN0aW9uKG1vbnRoKSB7XG4gICAgICB0aGlzLm1vbnRoID0gbW9udGg7XG4gICAgfVxuICB9O1xuXG4gIHZhciBGaW5hbmNpYWxzQWN0aW9ucyA9IHtcbiAgICBhZGRDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMgfHwgW107XG4gICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKVxuICAgIH0sXG5cbiAgICBzZW5kQ2hhbmdlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgXy5lYWNoKHRoaXMubGlzdGVuZXJzLCBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIEZpbmFuY2lhbHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGaW5hbmNpYWxzJyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGZpbmFuY2lhbHM6IHtcbiAgICAgICAgICBKYW51YXJ5OiAyNzczMixcbiAgICAgICAgICBGZWJydWFyeTogMjA3MDQsXG4gICAgICAgICAgTWFyY2g6IDM0MDIwLFxuICAgICAgICAgIEFwcmlsOiAzMDA3NCxcbiAgICAgICAgICBNYXk6IDI2NjMyLFxuICAgICAgICAgIEp1bmU6IDI3MzM0XG4gICAgICAgIH0sXG4gICAgICAgIGV4cGVuc2VzOiB7XG4gICAgICAgICAgSmFudWFyeTogMjk5OCxcbiAgICAgICAgICBGZWJydWFyeTogNDAyNCxcbiAgICAgICAgICBNYXJjaDogMzM2MyxcbiAgICAgICAgICBBcHJpbDogMzQzMyxcbiAgICAgICAgICBNYXk6IDM0NzQsXG4gICAgICAgICAgSnVuZTogMzQ4N1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuYW1lID0gdGhpcy5wcm9wcy5wcm9kdWN0Lm5hbWU7XG4gICAgICB2YXIgY29zdHMgPSB0aGlzLnN0YXRlLmV4cGVuc2VzW0ZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpXTtcbiAgICAgIHZhciBhbm51aXR5ID0gXCIxODAwMFwiO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiZmluYW5jaWFsc1wifSwgXG4gICAgICAgICAgRmluYW5jaWFsc0tleSh7XG4gICAgICAgICAgICAgIHByb2R1Y3Q6IHRoaXMucHJvcHMucHJvZHVjdH1cbiAgICAgICAgICApLCBcblxuICAgICAgICAgIEZpbmFuY2lhbHNNZXRlcih7XG4gICAgICAgICAgICAgIHByb2R1Y3Q6IHRoaXMucHJvcHMucHJvZHVjdCwgXG4gICAgICAgICAgICAgIGZpbmFuY2lhbHM6IHRoaXMuc3RhdGUuZmluYW5jaWFscywgXG4gICAgICAgICAgICAgIGNvc3RzOiB0aGlzLnN0YXRlLmV4cGVuc2VzLCBcbiAgICAgICAgICAgICAgYW5udWl0eTogYW5udWl0eX1cbiAgICAgICAgICApLCBcblxuICAgICAgICAgIEZpbmFuY2lhbHNUYWJsZSh7XG4gICAgICAgICAgICAgIHByb2R1Y3Q6IHRoaXMucHJvcHMucHJvZHVjdCwgXG4gICAgICAgICAgICAgIGZpbmFuY2lhbHM6IHRoaXMuc3RhdGUuZmluYW5jaWFscywgXG4gICAgICAgICAgICAgIGNvc3RzOiB0aGlzLnN0YXRlLmV4cGVuc2VzLCBcbiAgICAgICAgICAgICAgYW5udWl0eTogYW5udWl0eX1cbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgRmluYW5jaWFsc0tleSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ZpbmFuY2lhbHNLZXknLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBGaW5hbmNpYWxzQWN0aW9ucy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRPRE86IEJyZWFrIG91dCBkbC1pbmxpbmUgc3R5bGVzIGludG8gcmV1c2FibGUgU0NTUyBjb21wb25lbnRzXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgIFJlYWN0LkRPTS5kbCh7Y2xhc3NOYW1lOiBcInRleHQtc21hbGxcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmR0KHtzdHlsZTogeyd3aWR0aCc6ICcxMHB4JywgJ2hlaWdodCc6ICcxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyM0OGEzZWQnfX0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kZCh7c3R5bGU6IHsnbWFyZ2luLWxlZnQnOiAnNXB4JywgJ21hcmdpbi1yaWdodCc6ICcxNXB4JywgZGlzcGxheTogJ2lubGluZScsIGNsZWFyOiAnbGVmdCd9fSwgdGhpcy5wcm9wcy5wcm9kdWN0Lm5hbWUsIFwiIGFubnVpdHlcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmR0KHtzdHlsZTogeyd3aWR0aCc6ICcxMHB4JywgJ2hlaWdodCc6ICcxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmOTMyMzInfX0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kZCh7c3R5bGU6IHsnbWFyZ2luLWxlZnQnOiAnNXB4JywgJ21hcmdpbi1yaWdodCc6ICcxNXB4JywgZGlzcGxheTogJ2lubGluZScsIGNsZWFyOiAnbGVmdCd9fSwgXCJFeHBlbnNlcyAoaG9zdGluZywgbWFpbnRlbmFuY2UsIGV0Yy4pXCIpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kdCh7c3R5bGU6IHsnd2lkdGgnOiAnMTBweCcsICdoZWlnaHQnOiAnMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCAnYmFja2dyb3VuZC1jb2xvcic6ICcjZmQ2YjJmJ319KSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGQoe3N0eWxlOiB7J21hcmdpbi1sZWZ0JzogJzVweCcsICdtYXJnaW4tcmlnaHQnOiAnMTVweCcsIGRpc3BsYXk6ICdpbmxpbmUnLCBjbGVhcjogJ2xlZnQnfX0sIFwiQXNzZW1ibHlcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmR0KHtzdHlsZTogeyd3aWR0aCc6ICcxMHB4JywgJ2hlaWdodCc6ICcxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNlOWFkMWEnfX0pLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kZCh7c3R5bGU6IHsnbWFyZ2luLWxlZnQnOiAnNXB4JywgJ21hcmdpbi1yaWdodCc6ICcxNXB4JywgZGlzcGxheTogJ2lubGluZScsIGNsZWFyOiAnbGVmdCd9fSwgXCJBcHAgQ29pbiBob2xkZXJzXCIpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCB0aGlzLnN0YXRlLm1vbnRoKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBfb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vbnRoOiBGaW5hbmNpYWxzU3RvcmUuZ2V0TW9udGgoKSB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBGaW5hbmNpYWxzTWV0ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGaW5hbmNpYWxzTWV0ZXInLFxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbW9udGg6IEZpbmFuY2lhbHNTdG9yZS5nZXRNb250aCgpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBGaW5hbmNpYWxzQWN0aW9ucy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZSlcbiAgICB9LFxuXG4gICAgX29uQ2hhbmdlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vbnRoOiBGaW5hbmNpYWxzU3RvcmUuZ2V0TW9udGgoKSB9KVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5hbWUgPSB0aGlzLnByb3BzLnByb2R1Y3QubmFtZTtcbiAgICAgIHZhciB0b3RhbCA9IHRoaXMucHJvcHMuZmluYW5jaWFsc1t0aGlzLnN0YXRlLm1vbnRoXTtcbiAgICAgIHZhciBjb3N0cyA9IHRoaXMucHJvcHMuY29zdHNbdGhpcy5zdGF0ZS5tb250aF07XG5cbiAgICAgIHZhciBhbm51aXR5ID0gY2FsY3VsYXRlQW5udWl0eSh0b3RhbCwgY29zdHMsIHRoaXMucHJvcHMuYW5udWl0eSk7XG4gICAgICB2YXIgZXhwZW5zZXMgPSBjYWxjdWxhdGVFeHBlbnNlcyh0b3RhbCwgY29zdHMpO1xuICAgICAgdmFyIGNvbW11bml0eVNoYXJlID0gY2FsY3VsYXRlQ29tbXVuaXR5U2hhcmUodG90YWwsIGNvc3RzLCB0aGlzLnByb3BzLmFubnVpdHkpO1xuICAgICAgdmFyIGFzc2VtYmx5U2hhcmUgPSBjb21tdW5pdHlTaGFyZSAqIDAuMTtcbiAgICAgIGNvbW11bml0eVNoYXJlID0gY29tbXVuaXR5U2hhcmUgLSBhc3NlbWJseVNoYXJlO1xuXG4gICAgICB2YXIgYW5udWl0eVdpZHRoID0gYW5udWl0eSAvIHRvdGFsICogMTAwO1xuICAgICAgdmFyIGNvc3RzV2lkdGggPSBleHBlbnNlcyAvIHRvdGFsICogMTAwO1xuICAgICAgdmFyIGNvbW11bml0eVdpZHRoID0gY29tbXVuaXR5U2hhcmUgLyB0b3RhbCAqIDEwMDtcbiAgICAgIHZhciBhc3NlbWJseVdpZHRoID0gYXNzZW1ibHlTaGFyZSAvIHRvdGFsICogMTAwIDtcblxuICAgICAgaWYgKGFzc2VtYmx5U2hhcmUgPiAwKSB7XG4gICAgICAgIGFzc2VtYmx5V2lkdGggKz0gNTtcbiAgICAgICAgYW5udWl0eVdpZHRoIC09IDU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwcm9ncmVzc1wifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IG5hbWUgKyAnLW1ldGVyJywgXG4gICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyXCIsIFxuICAgICAgICAgICAgICAgcm9sZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogYW5udWl0eVdpZHRoICsgJyUnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgJyQnICsgbnVtZXJhbChhbm51aXR5KS5mb3JtYXQoJzAsMCcpKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2lkOiBcImNvc3RzLXNoYXJlXCIsIFxuICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItZGFuZ2VyXCIsIFxuICAgICAgICAgICAgICAgcm9sZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogY29zdHNXaWR0aCArICclJ319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsICckJyArIG51bWVyYWwoZXhwZW5zZXMpLmZvcm1hdCgnMCwwJykpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IFwiYXNzZW1ibHktc2hhcmVcIiwgXG4gICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyXCIsIFxuICAgICAgICAgICAgICAgcm9sZTogXCJwcm9ncmVzcy1iYXJcIiwgXG4gICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogYXNzZW1ibHlXaWR0aCArICclJywgJ2JhY2tncm91bmQtY29sb3InOiAnI2ZkNmIyZid9fSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCAnJCcgKyBudW1lcmFsKGFzc2VtYmx5U2hhcmUpLmZvcm1hdCgnMCwwJykpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IFwiY29tbXVuaXR5LW1ldGVyXCIsIFxuICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItd2FybmluZ1wiLCBcbiAgICAgICAgICAgICAgIHJvbGU6IFwicHJvZ3Jlc3MtYmFyXCIsIFxuICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6IGNvbW11bml0eVdpZHRoICsgJyUnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgJyQnICsgbnVtZXJhbChjb21tdW5pdHlTaGFyZSkuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgRmluYW5jaWFsc1RhYmxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRmluYW5jaWFsc1RhYmxlJyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG1vbnRoOiBGaW5hbmNpYWxzU3RvcmUuZ2V0TW9udGgoKVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgRmluYW5jaWFsc0FjdGlvbnMuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5fb25DaGFuZ2UpXG4gICAgfSxcblxuICAgIF9vbkNoYW5nZTogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb250aDogRmluYW5jaWFsc1N0b3JlLmdldE1vbnRoKCkgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuYW1lID0gdGhpcy5wcm9wcy5wcm9kdWN0Lm5hbWU7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0YWJsZS1yZXNwb25zaXZlXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00udGFibGUoe2NsYXNzTmFtZTogXCJ0YWJsZSB0YWJsZS1ob3ZlclwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udGhlYWQobnVsbCwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y2xhc3NOYW1lOiBcInRleHQtbGVmdFwifSwgXG4gICAgICAgICAgICAgICAgICBcIlRvdGFsIHJldmVudWVcIlxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sIFxuICAgICAgICAgICAgICAgICAgXCJFeHBlbnNlc1wiXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgICBuYW1lXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgXG4gICAgICAgICAgICAgICAgICBcIkFzc2VtYmx5XCJcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgoe2NsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiQXBwIENvaW4gaG9sZGVyc1wiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50Ym9keShudWxsLCBcbiAgICAgICAgICAgICAgdGhpcy50Qm9keSgpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB0Qm9keTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgZmluYW5jaWFscyA9IHRoaXMucHJvcHMuZmluYW5jaWFscztcblxuICAgICAgcmV0dXJuIF8ubWFwKE9iamVjdC5rZXlzKGZpbmFuY2lhbHMpLCBmdW5jdGlvbiBtYXBGaW5hbmNpYWxzKG1vbnRoKSB7XG4gICAgICAgIHZhciB0b3RhbCA9IGZpbmFuY2lhbHNbbW9udGhdO1xuICAgICAgICB2YXIgY29zdHMgPSBzZWxmLnByb3BzLmNvc3RzW21vbnRoXTtcblxuICAgICAgICB2YXIgcHJvZml0ID0gY2FsY3VsYXRlUHJvZml0KHRvdGFsLCBjb3N0cyk7XG4gICAgICAgIHZhciBhbm51aXR5ID0gY2FsY3VsYXRlQW5udWl0eSh0b3RhbCwgY29zdHMsIHNlbGYucHJvcHMuYW5udWl0eSk7XG4gICAgICAgIHZhciBleHBlbnNlcyA9IGNhbGN1bGF0ZUV4cGVuc2VzKHRvdGFsLCBjb3N0cyk7XG4gICAgICAgIHZhciBjb21tdW5pdHlTaGFyZSA9IGNhbGN1bGF0ZUNvbW11bml0eVNoYXJlKHRvdGFsLCBjb3N0cywgc2VsZi5wcm9wcy5hbm51aXR5KTtcbiAgICAgICAgdmFyIGFzc2VtYmx5U2hhcmUgPSBjb21tdW5pdHlTaGFyZSAqIDAuMTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIHNlbGYudFJvdyhtb250aCwgdG90YWwsIGFubnVpdHksIGV4cGVuc2VzLCBhc3NlbWJseVNoYXJlLCBjb21tdW5pdHlTaGFyZSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0Um93OiBmdW5jdGlvbihtb250aCwgdG90YWwsIGFubnVpdHksIGNvc3RzLCBhc3NlbWJseSwgY29tbXVuaXR5KSB7XG4gICAgICB2YXIgbXV0ZWQgPSAnJztcbiAgICAgIGlmIChbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5J10uaW5kZXhPZihtb250aCkgPj0gMCkge1xuICAgICAgICBtdXRlZCA9ICcgdGV4dC1tdXRlZCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS50cih7c3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ30sIG9uTW91c2VPdmVyOiB0aGlzLm1vbnRoQ2hhbmdlZChtb250aCksIGtleTogbW9udGh9LCBcbiAgICAgICAgICBSZWFjdC5ET00udGQoe2lkOiAnZmluYW5jaWFscy0nICsgbW9udGh9LCBtb250aCksIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCAnJCcgKyBudW1lcmFsKHRvdGFsKS5mb3JtYXQoJzAsMCcpKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtjbGFzc05hbWU6IFwidGV4dC1yaWdodFwifSwgJyQnICsgbnVtZXJhbChjb3N0cykuZm9ybWF0KCcwLDAnKSksIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIn0sICckJyArIG51bWVyYWwoYW5udWl0eSkuZm9ybWF0KCcwLDAnKSksIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIiArIG11dGVkfSwgJyQnICsgbnVtZXJhbChhc3NlbWJseSkuZm9ybWF0KCcwLDAnKSksIFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIiArIG11dGVkfSwgJyQnICsgbnVtZXJhbChjb21tdW5pdHkgLSBhc3NlbWJseSkuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgbW9udGhDaGFuZ2VkOiBmdW5jdGlvbihtb250aCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgRmluYW5jaWFsc1N0b3JlLnNldE1vbnRoKG1vbnRoKTtcbiAgICAgICAgRmluYW5jaWFsc0FjdGlvbnMuc2VuZENoYW5nZShtb250aCk7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlUHJvZml0KHRvdGFsLCBjb3N0cykge1xuICAgIHRvdGFsID0gcGFyc2VJbnQodG90YWwsIDEwKTtcbiAgICBjb3N0cyA9IHBhcnNlSW50KGNvc3RzLCAxMCk7XG5cbiAgICByZXR1cm4gdG90YWwgLSBjb3N0cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZUV4cGVuc2VzKHRvdGFsLCBjb3N0cykge1xuICAgIHRvdGFsID0gcGFyc2VJbnQodG90YWwsIDEwKTtcbiAgICBjb3N0cyA9IHBhcnNlSW50KGNvc3RzLCAxMCk7XG5cbiAgICByZXR1cm4gY29zdHM7XG4gIH1cblxuICBmdW5jdGlvbiBjYWxjdWxhdGVBbm51aXR5KHRvdGFsLCBjb3N0cywgYW5udWl0eSkge1xuICAgIHRvdGFsID0gcGFyc2VJbnQodG90YWwsIDEwKTtcbiAgICBjb3N0cyA9IGNhbGN1bGF0ZUV4cGVuc2VzKHRvdGFsLCBwYXJzZUludChjb3N0cywgMTApKTtcbiAgICBhbm51aXR5ID0gcGFyc2VJbnQoYW5udWl0eSwgMTApO1xuXG4gICAgdmFyIHByb2ZpdCA9IGNhbGN1bGF0ZVByb2ZpdCh0b3RhbCwgY29zdHMpO1xuXG4gICAgcmV0dXJuIHByb2ZpdCA8IGFubnVpdHkgPyBwcm9maXQgOiBhbm51aXR5O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlQ29tbXVuaXR5U2hhcmUodG90YWwsIGNvc3RzLCBhbm51aXR5KSB7XG4gICAgdG90YWwgPSBwYXJzZUludCh0b3RhbCwgMTApO1xuICAgIGNvc3RzID0gY2FsY3VsYXRlRXhwZW5zZXModG90YWwsIHBhcnNlSW50KGNvc3RzLCAxMCkpO1xuICAgIGFubnVpdHkgPSBwYXJzZUludChhbm51aXR5LCAxMCk7XG5cbiAgICB2YXIgcHJvZml0ID0gY2FsY3VsYXRlUHJvZml0KHRvdGFsLCBjb3N0cyk7XG5cbiAgICByZXR1cm4gcHJvZml0IDwgYW5udWl0eSA/IDAgOiBwcm9maXQgLSBhbm51aXR5O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBGaW5hbmNpYWxzO1xuICB9XG5cbiAgd2luZG93LkZpbmFuY2lhbHMgPSBGaW5hbmNpYWxzO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBGb3JtR3JvdXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGb3JtR3JvdXAnLFxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBlcnJvcjogbnVsbCB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldCh7XG4gICAgICAgICdmb3JtLWdyb3VwJzogdHJ1ZSxcbiAgICAgICAgJ2hhcy1lcnJvcic6IHRoaXMucHJvcHMuZXJyb3IsXG4gICAgICAgICdoYXMtZmVlZGJhY2snOiB0aGlzLnByb3BzLmVycm9yXG4gICAgICB9KVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjbGFzc2VzfSwgXG4gICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlbiwgXG4gICAgICAgICAgdGhpcy5wcm9wcy5lcnJvciA/IHRoaXMuZXJyb3JHbHlwaCgpIDogbnVsbCwgXG4gICAgICAgICAgdGhpcy5wcm9wcy5lcnJvciA/IHRoaXMuZXJyb3JNZXNzYWdlKCkgOiBudWxsXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgZXJyb3JHbHlwaDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZSBmb3JtLWNvbnRyb2wtZmVlZGJhY2tcIn0pXG4gICAgfSxcblxuICAgIGVycm9yTWVzc2FnZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJoZWxwLWJsb2NrXCJ9LCB0aGlzLnByb3BzLmVycm9yKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBGb3JtR3JvdXA7XG4gIH1cblxuICB3aW5kb3cuRm9ybUdyb3VwID0gRm9ybUdyb3VwO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBOZXdzRmVlZE1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL25ld3NfZmVlZC5qcy5qc3gnKTtcbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xudmFyIEF2YXRhciA9IHJlcXVpcmUoJy4vYXZhdGFyLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBORiA9IENPTlNUQU5UUy5ORVdTX0ZFRUQ7XG5cbiAgdmFyIEZ1bGxQYWdlTmV3c0ZlZWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdGdWxsUGFnZU5ld3NGZWVkJyxcbiAgICBtaXhpbnM6IFtOZXdzRmVlZE1peGluXSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBOZXdzRmVlZFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3Rvcmllcyk7XG4gICAgICB0aGlzLmZldGNoTmV3c0ZlZWQoKTtcblxuICAgICAgdGhpcy5vblB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hOZXdzRmVlZCgpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZmV0Y2hOZXdzRmVlZDogXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IE5GLkFDVElPTlMuRkVUQ0hfU1RPUklFUyxcbiAgICAgICAgZXZlbnQ6IE5GLkVWRU5UUy5TVE9SSUVTX0ZFVENIRUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMudXJsXG4gICAgICB9KTtcbiAgICB9LCAxMDAwKSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdG9yaWVzOiBudWxsXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBtb3JlU3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdFN0b3J5ID0gdGhpcy5zdGF0ZS5zdG9yaWVzW3RoaXMuc3RhdGUuc3Rvcmllcy5sZW5ndGggLSAxXTtcblxuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogTkYuQUNUSU9OUy5GRVRDSF9NT1JFX1NUT1JJRVMsXG4gICAgICAgIGV2ZW50OiBORi5FVkVOVFMuU1RPUklFU19GRVRDSEVELFxuICAgICAgICBkYXRhOiB0aGlzLnByb3BzLnVybCArICc/dG9wX2lkPScgKyBsYXN0U3RvcnkuaWRcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblB1c2g6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICBpZiAod2luZG93LnB1c2hlcikge1xuICAgICAgICBjaGFubmVsID0gd2luZG93LnB1c2hlci5zdWJzY3JpYmUoJ0AnICsgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lKTtcbiAgICAgICAgY2hhbm5lbC5iaW5kX2FsbChmbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic2hlZXRcIiwgc3R5bGU6IHsgJ21pbi1oZWlnaHQnOiAnNjAwcHgnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYWdlLWhlYWRlciBzaGVldC1oZWFkZXJcIiwgc3R5bGU6IHsgJ3BhZGRpbmctbGVmdCc6ICcyMHB4J319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMih7Y2xhc3NOYW1lOiBcInBhZ2UtaGVhZGVyLXRpdGxlXCJ9LCBcIllvdXIgbm90aWZpY2F0aW9uc1wiKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAgbGlzdC1ncm91cC1icmVha291dFwiLCByZWY6IFwic3Bpbm5lclwifSwgXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnN0b3JpZXMgPyB0aGlzLnJvd3ModGhpcy5zdGF0ZS5zdG9yaWVzKSA6IG51bGxcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNtb3JlXCIsIGNsYXNzTmFtZTogXCJidG4gYnRuLWJsb2NrXCIsIG9uQ2xpY2s6IHRoaXMubW9yZVN0b3JpZXN9LCBcIk1vcmVcIilcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oc3Rvcmllcykge1xuICAgICAgdmFyIHJvd3MgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICByb3dzLnB1c2goXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAtaXRlbVwiLCBrZXk6IHN0b3JpZXNbaV0ua2V5fSwgXG4gICAgICAgICAgICBFbnRyeSh7c3Rvcnk6IHN0b3JpZXNbaV0sIGFjdG9yczogdGhpcy5zdGF0ZS5hY3RvcnMsIGZ1bGxQYWdlOiB0aGlzLnByb3BzLmZ1bGxQYWdlfSlcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByb3dzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEVudHJ5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRW50cnknLFxuICAgIGFjdG9yczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5tYXAoXG4gICAgICAgIHRoaXMucHJvcHMuc3RvcnkuYWN0b3JfaWRzLFxuICAgICAgICBmdW5jdGlvbihhY3RvcklkKSB7XG4gICAgICAgICAgcmV0dXJuIF8uZmluZFdoZXJlKHRoaXMucHJvcHMuYWN0b3JzLCB7IGlkOiBhY3RvcklkIH0pXG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgYm9keTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gdGhpcy5wcm9wcy5zdG9yeS5hY3Rpdml0aWVzWzBdLnRhcmdldDtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgXG4gICAgICAgICAgdGhpcy52ZXJiTWFwW3RoaXMucHJvcHMuc3RvcnkudmVyYl0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXG4gICAgICAgICAgICB0aGlzLnN1YmplY3RNYXBbdGhpcy5wcm9wcy5zdG9yeS5zdWJqZWN0X3R5cGVdLmNhbGwodGhpcywgdGFyZ2V0KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnN0b3J5Lmxhc3RfcmVhZF9hdCAhPSBudWxsO1xuICAgIH0sXG5cbiAgICBtYXJrQXNSZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBldmVudDogTkYuRVZFTlRTLlJFQUQsXG4gICAgICAgIGFjdGlvbjogTkYuQUNUSU9OUy5NQVJLX0FTX1JFQUQsXG4gICAgICAgIGRhdGE6IHRoaXMucHJvcHMuc3RvcnkuaWRcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtYXJrQXNSZWFkQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5pc1JlYWQoKSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tZGlzY1wiLCBvbkNsaWNrOiB0aGlzLm1hcmtBc1JlYWQsIHRpdGxlOiAnTWFyayBhcyByZWFkJywgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9fSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IE1hcmsgYXMgdW5yZWFkXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tY2lyY2xlXCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfX0pO1xuICAgIH0sXG5cbiAgICBwcmV2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib2R5UHJldmlldyA9IHRoaXMucHJvcHMuc3RvcnkuYm9keV9wcmV2aWV3O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIiwgc3R5bGU6IHsgJ3RleHQtb3ZlcmZsb3cnOiAnZWxsaXBzaXMnfX0sIFxuICAgICAgICAgIGJvZHlQcmV2aWV3XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWN0b3JzID0gXy5tYXAodGhpcy5hY3RvcnMoKSwgZnVuYy5kb3QoJ3VzZXJuYW1lJykpLmpvaW4oJywgQCcpXG5cbiAgICAgIHZhciBjbGFzc2VzID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0KHtcbiAgICAgICAgJ2VudHJ5LXJlYWQnOiB0aGlzLmlzUmVhZCgpLFxuICAgICAgICAnZW50cnktdW5yZWFkJzogIXRoaXMuaXNSZWFkKCksXG4gICAgICB9KTtcblxuICAgICAgdmFyIHByb2R1Y3ROYW1lID0gdGhpcy5wcm9wcy5zdG9yeS5wcm9kdWN0Lm5hbWU7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogY2xhc3Nlc30sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbC1tZC0zXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6ICcvJyArIHRoaXMucHJvcHMuc3RvcnkucHJvZHVjdC5zbHVnfSwgcHJvZHVjdE5hbWUpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmJyKG51bGwpLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIHRleHQtc21hbGxcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMudGltZXN0YW1wKClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtOFwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IGNsYXNzZXMsIGhyZWY6IHRoaXMucHJvcHMuc3RvcnkudXJsLCBvbkNsaWNrOiB0aGlzLm1hcmtBc1JlYWR9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7c3R5bGU6IHsgJ21hcmdpbi1yaWdodCc6ICc1cHgnfX0sIFxuICAgICAgICAgICAgICAgICAgQXZhdGFyKHt1c2VyOiB0aGlzLmFjdG9ycygpWzBdfSlcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIGFjdG9ycyksIFwiIFwiLCB0aGlzLmJvZHkoKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LXNtYWxsIHRleHQtbXV0ZWRcIn0sIFxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlldygpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6ICdjb2wtbWQtMSAnICsgY2xhc3Nlc30sIFxuICAgICAgICAgICAgICB0aGlzLm1hcmtBc1JlYWRCdXR0b24oKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgdGltZXN0YW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtb21lbnQodGhpcy5wcm9wcy5zdG9yeS5jcmVhdGVkKS5mb3JtYXQoXCJkZGQsIGhBXCIpXG4gICAgfSxcblxuICAgIHN1YmplY3RNYXA6IHtcbiAgICAgIFRhc2s6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgcmV0dXJuIFwiI1wiICsgdGFzay5udW1iZXIgKyBcIiBcIiArIHRhc2sudGl0bGU7XG4gICAgICB9LFxuXG4gICAgICBEaXNjdXNzaW9uOiBmdW5jdGlvbihkaXNjdXNzaW9uKSB7XG4gICAgICAgIHJldHVybiAnYSBkaXNjdXNzaW9uJztcbiAgICAgIH0sXG5cbiAgICAgIFdpcDogZnVuY3Rpb24oYm91bnR5KSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZ1bGxQYWdlKSB7XG4gICAgICAgICAgcmV0dXJuIFwiI1wiICsgYm91bnR5Lm51bWJlciArIFwiIFwiICsgYm91bnR5LnRpdGxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFwiI1wiICsgYm91bnR5Lm51bWJlcjtcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHZlcmJNYXA6IHtcbiAgICAgICdDb21tZW50JzogJ2NvbW1lbnRlZCBvbiAnLFxuICAgICAgJ0F3YXJkJzogJ2F3YXJkZWQnLFxuICAgICAgJ0Nsb3NlJzogJ2Nsb3NlZCAnXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEZ1bGxQYWdlTmV3c0ZlZWQ7XG4gIH1cblxuICB3aW5kb3cuRnVsbFBhZ2VOZXdzRmVlZCA9IEZ1bGxQYWdlTmV3c0ZlZWQ7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBGb3JtR3JvdXAgPSByZXF1aXJlKCcuL2Zvcm1fZ3JvdXAuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIElucHV0UHJldmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0lucHV0UHJldmlldycsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlucHV0UHJldmlldzogJycsXG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5wcm9wcy50cmFuc2Zvcm0gfHwgdGhpcy50cmFuc2Zvcm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBGb3JtR3JvdXAobnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwXCIsIHN0eWxlOiB7IHdpZHRoOiAnMzUlJ319LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMucHJvcHMuaW5wdXROYW1lLCBcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sXCIsIFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLmlucHV0UHJldmlldywgXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHRoaXMucHJvcHMucGxhY2Vob2xkZXIsIFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlfSksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cC1idG5cIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHt0eXBlOiBcInN1Ym1pdFwiLCBvblN1Ym1pdDogdGhpcy5vblN1Ym1pdCwgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeVwiLCBkaXNhYmxlZDogdGhpcy5idXR0b25TdGF0ZSgpfSwgdGhpcy5wcm9wcy5idXR0b25UZXh0KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCBvbWVnYVwiLCBzdHlsZTogeyAnbWFyZ2luLXRvcCc6ICc1cHgnLCAnbWFyZ2luLWxlZnQnOiAnMXB4J319LCBcbiAgICAgICAgICAgIFwiUHJldmlldzogXCIsIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgdGhpcy5wcm9wcy5hZGRvblRleHQgKyB0aGlzLnN0YXRlLmlucHV0UHJldmlldylcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdmFsdWUgPSBlLnRhcmdldC52YWx1ZTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlucHV0UHJldmlldzogdGhpcy5zdGF0ZS50cmFuc2Zvcm0odmFsdWUpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYnV0dG9uU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuaW5wdXRQcmV2aWV3Lmxlbmd0aCA+PSAyID8gZmFsc2UgOiB0cnVlO1xuICAgIH0sXG5cbiAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1teXFx3LVxcLl0rL2csICctJykudG9Mb3dlckNhc2UoKTtcbiAgICB9LFxuXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSW5wdXRQcmV2aWV3O1xuICB9XG5cbiAgd2luZG93LklucHV0UHJldmlldyA9IElucHV0UHJldmlldztcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgSW50ZXJlc3RTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9pbnRlcmVzdF9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJUCA9IENPTlNUQU5UUy5JTlRFUkVTVF9QSUNLRVI7XG5cbiAgdmFyIGtleXMgPSB7XG4gICAgZW50ZXI6IDEzLFxuICAgIGVzYzogMjcsXG4gICAgdXA6IDM4LFxuICAgIGRvd246IDQwLFxuICAgIGRlbGV0ZTogOFxuICB9O1xuXG4gIHZhciBJbnRlcmVzdFBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludGVyZXN0UGlja2VyJyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2VsZWN0ZWRJbnRlcmVzdHM6IEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCksXG4gICAgICAgIGhpZ2hsaWdodEluZGV4OiAwLFxuICAgICAgICB2aXNpYmxlSW50ZXJlc3RzOiBbXSxcbiAgICAgICAgdXNlcklucHV0OiAnJ1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLnVzZXJJbnRlcmVzdHMgJiYgdGhpcy5wcm9wcy51c2VySW50ZXJlc3RzLmxlbmd0aCkge1xuICAgICAgICBJbnRlcmVzdFN0b3JlLnNldEludGVyZXN0cyh0aGlzLnByb3BzLnVzZXJJbnRlcmVzdHMpO1xuICAgICAgfVxuXG4gICAgICBJbnRlcmVzdFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMub25TdG9yZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgY3Vyc29yOiAndGV4dCd9fSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnNlbGVjdCh7XG4gICAgICAgICAgICAgIG5hbWU6IHRoaXMucHJvcHMubmFtZSwgXG4gICAgICAgICAgICAgIG11bHRpcGxlOiBcInRydWVcIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJ30sIFxuICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5zZWxlY3RlZEludGVyZXN0c30sIFxuICAgICAgICAgICAgdGhpcy5mb3JtYXRTZWxlY3RlZCgnb3B0aW9uJylcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe1xuICAgICAgICAgICAgICBjbGFzc05hbWU6IFwicGlsbC1saXN0XCIsIFxuICAgICAgICAgICAgICByZWY6IFwiY29udGFpbmVyXCIsIFxuICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmhhbmRsZUNvbnRhaW5lckNsaWNrfSwgXG4gICAgICAgICAgICB0aGlzLmZvcm1hdFNlbGVjdGVkKCdwaWxsJyksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICAgICAgcmVmOiBcInVzZXJJbnB1dFwiLCBcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUNoYW5nZSwgXG4gICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuaGFuZGxlS2V5RG93biwgXG4gICAgICAgICAgICAgICAgICBvbkZvY3VzOiB0aGlzLmhhbmRsZUZvY3VzLCBcbiAgICAgICAgICAgICAgICAgIG9uQmx1cjogdGhpcy5oYW5kbGVCbHVyLCBcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnVzZXJJbnB1dH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgICB0aGlzLnN0YXRlLnZpc2libGVJbnRlcmVzdHMubGVuZ3RoID4gMCAmJiB0aGlzLnN0YXRlLnNob3cgPyB0aGlzLmludGVyZXN0RHJvcGRvd24oKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW50ZXJlc3REcm9wZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBJbnRlcmVzdERyb3Bkb3duKHtcbiAgICAgICAgICAgIGludGVyZXN0czogdGhpcy5zdGF0ZS52aXNpYmxlSW50ZXJlc3RzLCBcbiAgICAgICAgICAgIGhpZ2hsaWdodEluZGV4OiB0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4LCBcbiAgICAgICAgICAgIG9uSW50ZXJlc3RTZWxlY3RlZDogdGhpcy5vbkludGVyZXN0U2VsZWN0ZWR9XG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGhhbmRsZUNvbnRhaW5lckNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLnJlZnMudXNlcklucHV0LmdldERPTU5vZGUoKS5mb2N1cygpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgdmFyIHZpc2libGVJbnRlcmVzdHMgPSB0aGlzLmdldFZpc2libGVJbnRlcmVzdHModmFsdWUpO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgdXNlcklucHV0OiB0aGlzLnRyYW5zZm9ybSh2YWx1ZSksXG4gICAgICAgIHZpc2libGVJbnRlcmVzdHM6IHZpc2libGVJbnRlcmVzdHNcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVLZXlEb3duOiBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlzLnVwKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5tb3ZlSGlnaGxpZ2h0KC0xKTtcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBrZXlzLmRvd24pIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLm1vdmVIaWdobGlnaHQoMSk7XG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0ga2V5cy5kZWxldGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudXNlcklucHV0ID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogSVAuQUNUSU9OUy5QT1AsXG4gICAgICAgICAgICBldmVudDogSVAuRVZFTlRTLlBPUFBFRFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0ga2V5cy5lbnRlcikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2VsZWN0Q3VycmVudEludGVyZXN0KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFZpc2libGVJbnRlcmVzdHM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgaW50ZXJlc3RzID0gXy5maWx0ZXIodGhpcy5wcm9wcy5pbnRlcmVzdHMsIGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIHJldHVybiBpbnRlcmVzdC5pbmRleE9mKHZhbHVlKSA+PSAwICYmIEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCkuaW5kZXhPZihpbnRlcmVzdCkgPT09IC0xO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh2YWx1ZSAmJiBpbnRlcmVzdHMuaW5kZXhPZih2YWx1ZSkgPT09IC0xKSB7XG4gICAgICAgIGludGVyZXN0cy5wdXNoKHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGludGVyZXN0cztcbiAgICB9LFxuXG4gICAgbW92ZUhpZ2hsaWdodDogZnVuY3Rpb24oaW5jKSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmNvbnN0cmFpbkhpZ2hsaWdodCh0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4ICsgaW5jKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGhpZ2hsaWdodEluZGV4OiBpbmRleFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbnN0cmFpbkhpZ2hsaWdodDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgMCwgTWF0aC5taW4odGhpcy5zdGF0ZS52aXNpYmxlSW50ZXJlc3RzLmxlbmd0aCAtIDEsIGluZGV4KVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc2VsZWN0Q3VycmVudEludGVyZXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IElQLkFDVElPTlMuQUREX0lOVEVSRVNULFxuICAgICAgICBldmVudDogSVAuRVZFTlRTLklOVEVSRVNUX0FEREVELFxuICAgICAgICBkYXRhOiB0aGlzLnN0YXRlLnZpc2libGVJbnRlcmVzdHNbdGhpcy5zdGF0ZS5oaWdobGlnaHRJbmRleF1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblN0b3JlQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2aXNpYmxlSW50ZXJlc3RzOiBbXSxcbiAgICAgICAgc2VsZWN0ZWRJbnRlcmVzdHM6IEludGVyZXN0U3RvcmUuZ2V0SW50ZXJlc3RzKCksXG4gICAgICAgIHVzZXJJbnB1dDogJydcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1teXFx3LV0rL2csICctJykudG9Mb3dlckNhc2UoKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlRm9jdXM6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucmVmcy5jb250YWluZXIuZ2V0RE9NTm9kZSgpLnN0eWxlLmNzc1RleHQgPSBcImJvcmRlcjogMXB4IHNvbGlkICM0OGEzZWQ7IGJveC1zaGFkb3c6IDBweCAwcHggM3B4ICM2NmFmZTlcIjtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgIHZpc2libGVJbnRlcmVzdHM6IF8uZGlmZmVyZW5jZSh0aGlzLnByb3BzLmludGVyZXN0cywgSW50ZXJlc3RTdG9yZS5nZXRJbnRlcmVzdHMoKSlcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVCbHVyOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnJlZnMuY29udGFpbmVyLmdldERPTU5vZGUoKS5zdHlsZS5jc3NUZXh0ID0gJyc7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gRklYTUU6IFRoZXJlIGhhcyB0byBiZSBhIGJldHRlciB3YXkgdG8gaGFuZGxlIHRoaXM6XG4gICAgICAvLyAgICAgICAgVGhlIGlzc3VlIGlzIHRoYXQgaGlkaW5nIHRoZSBkcm9wZG93biBvbiBibHVyXG4gICAgICAvLyAgICAgICAgY2F1c2VzIHNlbGVjdGluZyBhbiBpdGVtIHRvIGZhaWwgd2l0aG91dCBhXG4gICAgICAvLyAgICAgICAgdGltZW91dCBvZiB+MjAwIHRvIH4zMDAgbXMuXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICBzaG93OiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH0sIDMwMCk7XG4gICAgfSxcblxuICAgIG9uSW50ZXJlc3RTZWxlY3RlZDogZnVuY3Rpb24oZSkge1xuICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogSVAuRVZFTlRTLkFERF9JTlRFUkVTVCxcbiAgICAgICAgZXZlbnQ6IElQLkVWRU5UUy5JTlRFUkVTVF9BRERFRCxcbiAgICAgICAgZGF0YTogJydcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVSZW1vdmU6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiBJUC5BQ1RJT05TLlJFTU9WRV9JTlRFUkVTVCxcbiAgICAgICAgZXZlbnQ6IElQLkVWRU5UUy5JTlRFUkVTVF9SRU1PVkVELFxuICAgICAgICBkYXRhOiBpbnRlcmVzdFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZvcm1hdFNlbGVjdGVkOiBmdW5jdGlvbihvcHRpb25PclBpbGwpIHtcbiAgICAgIHZhciBpbnRlcmVzdHMgPSBJbnRlcmVzdFN0b3JlLmdldEludGVyZXN0cygpO1xuICAgICAgdmFyIHNlbGVjdGVkSW50ZXJlc3RzID0gXy5tYXAoaW50ZXJlc3RzLCB0aGlzLmludGVyZXN0VG9bb3B0aW9uT3JQaWxsXS5iaW5kKHRoaXMpKTtcblxuICAgICAgcmV0dXJuIHNlbGVjdGVkSW50ZXJlc3RzO1xuICAgIH0sXG5cbiAgICBpbnRlcmVzdFRvOiB7XG4gICAgICBvcHRpb246IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00ub3B0aW9uKHt2YWx1ZTogaW50ZXJlc3QsIGtleTogaW50ZXJlc3R9LCBpbnRlcmVzdClcbiAgICAgIH0sXG5cbiAgICAgIHBpbGw6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiaW50ZXJlc3QtY2hvaWNlXCIsIGtleTogaW50ZXJlc3R9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiaW50ZXJlc3QtY2xvc2VcIiwgb25DbGljazogdGhpcy5oYW5kbGVSZW1vdmUuYmluZCh0aGlzLCBpbnRlcmVzdCl9LCBcIkBcIiwgaW50ZXJlc3QsIFwiIMOXXCIpXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEludGVyZXN0RHJvcGRvd24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnRlcmVzdERyb3Bkb3duJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgJ3otaW5kZXgnOiAxMDAsXG4gICAgICAgIHRvcDogNDUsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgIGRpc3BsYXk6ICdibG9jaydcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duLW1lbnVcIiwgc3R5bGU6IHN0eWxlfSwgXG4gICAgICAgICAgdGhpcy5yb3dzKClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgcm93czogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IC0xO1xuXG4gICAgICB2YXIgaW50ZXJlc3RzID0gXy5tYXAodGhpcy5wcm9wcy5pbnRlcmVzdHMsIGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIGkrKztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIEludGVyZXN0RHJvcGRvd25FbnRyeSh7XG4gICAgICAgICAgICAgIGtleTogaW50ZXJlc3QsIFxuICAgICAgICAgICAgICBpbnRlcmVzdDogaW50ZXJlc3QsIFxuICAgICAgICAgICAgICBzZWxlY3RlZDogaSA9PT0gdGhpcy5wcm9wcy5oaWdobGlnaHRJbmRleH1cbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICByZXR1cm4gaW50ZXJlc3RzO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIEludGVyZXN0RHJvcGRvd25FbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0ludGVyZXN0RHJvcGRvd25FbnRyeScsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbnRlcmVzdCA9IHRoaXMucHJvcHMuaW50ZXJlc3Q7XG4gICAgICB2YXIgY2xhc3NOYW1lID0gJ3RleHRjb21wbGV0ZS1pdGVtJztcblxuICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcbiAgICAgICAgY2xhc3NOYW1lICs9ICcgYWN0aXZlJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IGNsYXNzTmFtZX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiAnI0AnICsgaW50ZXJlc3QsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfSwgb25DbGljazogdGhpcy5oYW5kbGVJbnRlcmVzdFNlbGVjdGVkLmJpbmQodGhpcywgaW50ZXJlc3QpfSwgXG4gICAgICAgICAgICBcIkBcIiwgdGhpcy5wcm9wcy5pbnRlcmVzdFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlSW50ZXJlc3RTZWxlY3RlZDogZnVuY3Rpb24oaW50ZXJlc3QpIHtcbiAgICAgIERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IElQLkFDVElPTlMuQUREX0lOVEVSRVNULFxuICAgICAgICBldmVudDogSVAuRVZFTlRTLklOVEVSRVNUX0FEREVELFxuICAgICAgICBkYXRhOiBpbnRlcmVzdFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludGVyZXN0UGlja2VyO1xuICB9XG5cbiAgd2luZG93LkludGVyZXN0UGlja2VyID0gSW50ZXJlc3RQaWNrZXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBGb3JtR3JvdXAgPSByZXF1aXJlKCcuL2Zvcm1fZ3JvdXAuanMuanN4Jyk7XG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJbnZpdGVCb3VudHlGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW52aXRlQm91bnR5Rm9ybScsXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IG1vZGVsOiAnaW52aXRlJyB9XG4gICAgfSxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgZXJyb3JzOiB7fSB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZm9ybSh7c3R5bGU6IHt3aWR0aDozMDB9LCBvblN1Ym1pdDogdGhpcy5oYW5kbGVTdWJtaXR9LCBcbiAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuLCBcbiAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgIEZvcm1Hcm91cCh7ZXJyb3I6IHRoaXMuc3RhdGUuZXJyb3JzLnVzZXJuYW1lX29yX2VtYWlsfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGFiZWwoe2NsYXNzTmFtZTogXCJjb250cm9sLWxhYmVsXCJ9LCBcIlVzZXJuYW1lIG9yIGVtYWlsIGFkZHJlc3NcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtuYW1lOiBcImludml0ZVt1c2VybmFtZV9vcl9lbWFpbF1cIiwgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcImZyaWVuZEBleGFtcGxlLmNvbVwiLCBjbGFzc05hbWU6IFwiZm9ybS1jb250cm9sXCJ9KVxuICAgICAgICAgICksIFxuICAgICAgICAgIEZvcm1Hcm91cCh7ZXJyb3I6IHRoaXMuc3RhdGUuZXJyb3JzLm5vdGV9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5sYWJlbChudWxsLCBcIlBlcnNvbmFsIG5vdGVcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRleHRhcmVhKHtuYW1lOiBcImludml0ZVtub3RlXVwiLCBwbGFjZWhvbGRlcjogdGhpcy5wcm9wcy5ub3RlUGxhY2Vob2xkZXIsIGNsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2xcIn0pXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgRm9ybUdyb3VwKHtlcnJvcjogdGhpcy5zdGF0ZS5lcnJvcnMudGlwX2NlbnRzfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ubGFiZWwobnVsbCwgXCJMZWF2ZSBhIHRpcFwiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00ucCh7Y2xhc3NOYW1lOiBcImhlbHAtYmxvY2tcIn0sIFwiU3RhcnQgb2ZmIG9uIHRoZSByaWdodCBmb290OyBnZW5lcm9zaXR5IGFsd2F5cyBwYXlzIG9mZi5cIiksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiYnRuLWdyb3VwIHRleHQtY2VudGVyXCIsICdkYXRhLXRvZ2dsZSc6IFwiYnV0dG9uc1wiLCBzdHlsZToge3dpZHRoOicxMDAlJ319LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0IGFjdGl2ZVwiLCBzdHlsZToge3dpZHRoOiczNCUnfX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImludml0ZVt0aXBfY2VudHNdXCIsIHZhbHVlOiBcIjEwMDBcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWV9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW4gdGV4dC1jb2luc1wifSksIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1jb2luc1wifSwgXCIxMFwiKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIHN0eWxlOiB7d2lkdGg6JzMzJSd9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiaW52aXRlW3RpcF9jZW50c11cIiwgdmFsdWU6IFwiMTAwMDBcIn0pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1hcHAtY29pbiB0ZXh0LWNvaW5zXCJ9KSwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LWNvaW5zXCJ9LCBcIjEwMFwiKVxuICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmxhYmVsKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIHN0eWxlOiB7d2lkdGg6JzMzJSd9fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiaW52aXRlW3RpcF9jZW50c11cIiwgdmFsdWU6IFwiNTAwMDBcIn0pLCBcIiBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tYXBwLWNvaW4gdGV4dC1jb2luc1wifSksIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1jb2luc1wifSwgXCI1MDBcIilcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCBuYW1lOiBcImludml0ZVt2aWFfdHlwZV1cIiwgdmFsdWU6IHRoaXMucHJvcHMudmlhX3R5cGV9KSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcImhpZGRlblwiLCBuYW1lOiBcImludml0ZVt2aWFfaWRdXCIsIHZhbHVlOiB0aGlzLnByb3BzLnZpYV9pZH0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9ja1wiLCBzdHlsZToge1wibWFyZ2luLWJvdHRvbVwiOjIwfX0sIFwiU2VuZCBtZXNzYWdlXCIpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgaGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdGhpcy5wcm9wcy51cmwsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgZGF0YTogJChlLnRhcmdldCkuc2VyaWFsaXplKCksXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB0aGlzLnByb3BzLm9uU3VibWl0KGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcbiAgICAgICAgICBpZiAoeGhyLnJlc3BvbnNlSlNPTiAmJiB4aHIucmVzcG9uc2VKU09OLmVycm9ycykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcnMoeGhyLnJlc3BvbnNlSlNPTi5lcnJvcnMpXG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVFcnJvcnM6IGZ1bmN0aW9uKGVycm9ycykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXJyb3JzOiBlcnJvcnN9KVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnZpdGVCb3VudHlGb3JtO1xuICB9XG5cbiAgd2luZG93Lkludml0ZUJvdW50eUZvcm0gPSBJbnZpdGVCb3VudHlGb3JtO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwO1xudmFyIFBvcG92ZXIgPSByZXF1aXJlKCcuL3BvcG92ZXIuanMuanN4Jyk7XG52YXIgSW52aXRlQm91bnR5Rm9ybSA9IHJlcXVpcmUoJy4vaW52aXRlX2JvdW50eV9mb3JtLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJbnZpdGVGcmllbmRCb3VudHkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnZpdGVGcmllbmRCb3VudHknLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBtb2RhbDogZmFsc2UsIGludml0ZXM6IHRoaXMucHJvcHMuaW52aXRlcyB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcImJ0biBidG4tZGVmYXVsdCBidG4tYmxvY2sgYnRuLXNtXCIsIGhyZWY6IFwiI2hlbHAtbWVcIiwgb25DbGljazogdGhpcy5jbGlja30sIFwiSW52aXRlIGEgZnJpZW5kIHRvIGhlbHBcIiksIFxuICAgICAgICAgIHRoaXMuc3RhdGUuaW52aXRlcy5sZW5ndGggPiAwID8gSW52aXRlTGlzdCh7aW52aXRlczogdGhpcy5zdGF0ZS5pbnZpdGVzfSkgOiBudWxsLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLm1vZGFsID8gdGhpcy5wb3BvdmVyKCkgOiBudWxsXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgcG9wb3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBQb3BvdmVyKHtwbGFjZW1lbnQ6IFwibGVmdFwiLCBwb3NpdGlvbkxlZnQ6IC0zMjUsIHBvc2l0aW9uVG9wOiAtMTIwfSwgXG4gICAgICAgICAgSW52aXRlQm91bnR5Rm9ybSh7dXJsOiB0aGlzLnByb3BzLnVybCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlhX3R5cGU6IHRoaXMucHJvcHMudmlhX3R5cGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpYV9pZDogdGhpcy5wcm9wcy52aWFfaWQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VibWl0OiB0aGlzLm9uU3VibWl0LmJpbmQodGhpcyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVQbGFjZWhvbGRlcjogXCJIZXkhIFRoaXMgYm91bnR5IHNlZW1zIHJpZ2h0IHVwIHlvdXIgYWxsZXlcIn0sIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uaDIoe2NsYXNzTmFtZTogXCJhbHBoYVwifSwgXCJBc2sgYSBmcmllbmRcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcIktub3cgc29tZWJvZHkgd2hvIGNvdWxkIGhlbHAgd2l0aCB0aGlzPyBBbnlib2R5IGNhbiBoZWxwIG91dCwgYWxsIHlvdSBuZWVkIHRvIGRvIGlzIGFzay5cIilcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgY2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kYWw6ICF0aGlzLnN0YXRlLm1vZGFsfSlcbiAgICB9LFxuXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKGludml0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgICAgUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB7XG4gICAgICAgICAgaW52aXRlczogeyRwdXNoOiBbaW52aXRlXSB9LFxuICAgICAgICAgIG1vZGFsOiB7JHNldDogZmFsc2UgfVxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnZpdGVGcmllbmRCb3VudHk7XG4gIH1cblxuICB3aW5kb3cuSW52aXRlRnJpZW5kQm91bnR5ID0gSW52aXRlRnJpZW5kQm91bnR5O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwO1xudmFyIFBvcG92ZXIgPSByZXF1aXJlKCcuL3BvcG92ZXIuanMuanN4Jyk7XG52YXIgSW52aXRlQm91bnR5Rm9ybSA9IHJlcXVpcmUoJy4vaW52aXRlX2JvdW50eV9mb3JtLmpzLmpzeCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJbnZpdGVGcmllbmRQcm9kdWN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW52aXRlRnJpZW5kUHJvZHVjdCcsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7IG1vZGFsOiBmYWxzZSwgaW52aXRlczogdGhpcy5wcm9wcy5pbnZpdGVzIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe2NsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIGJ0bi1ibG9ja1wiLCBzdHlsZToge1wibWFyZ2luLWJvdHRvbVwiOjE2fSwgb25DbGljazogdGhpcy5jbGlja30sIFwiSW52aXRlIGEgZnJpZW5kXCIpLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLmludml0ZXMubGVuZ3RoID4gMCA/IEludml0ZUxpc3Qoe2ludml0ZXM6IHRoaXMuc3RhdGUuaW52aXRlc30pIDogbnVsbCwgXG4gICAgICAgICAgdGhpcy5zdGF0ZS5tb2RhbCA/IHRoaXMucG9wb3ZlcigpIDogbnVsbFxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHBvcG92ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUG9wb3Zlcih7cGxhY2VtZW50OiBcImxlZnRcIiwgcG9zaXRpb25MZWZ0OiAtMzI1LCBwb3NpdGlvblRvcDogLTEyOX0sIFxuICAgICAgICAgIEludml0ZUJvdW50eUZvcm0oe3VybDogdGhpcy5wcm9wcy51cmwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpYV90eXBlOiB0aGlzLnByb3BzLnZpYV90eXBlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWFfaWQ6IHRoaXMucHJvcHMudmlhX2lkLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN1Ym1pdDogdGhpcy5vblN1Ym1pdC5iaW5kKHRoaXMpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlUGxhY2Vob2xkZXI6IHRoaXMucHJvcHMubm90ZVBsYWNlaG9sZGVyfSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMih7Y2xhc3M6IFwiYWxwaGFcIn0sIFwiQXNrIGEgZnJpZW5kXCIpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXCJLbm93IHNvbWVib2R5IHdobyBjb3VsZCBoZWxwIHdpdGggdGhpcz8gQW55Ym9keSBjYW4gaGVscCBvdXQsIGFsbCB5b3UgbmVlZCB0byBkbyBpcyBhc2suXCIpXG5cbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgY2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kYWw6ICF0aGlzLnN0YXRlLm1vZGFsfSlcbiAgICB9LFxuXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKGludml0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgICAgUmVhY3QuYWRkb25zLnVwZGF0ZSh0aGlzLnN0YXRlLCB7XG4gICAgICAgICAgaW52aXRlczogeyRwdXNoOiBbaW52aXRlXSB9LFxuICAgICAgICAgIG1vZGFsOiB7JHNldDogZmFsc2UgfVxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBJbnZpdGVGcmllbmRQcm9kdWN0O1xuICB9XG5cbiAgd2luZG93Lkludml0ZUZyaWVuZFByb2R1Y3QgPSBJbnZpdGVGcmllbmRQcm9kdWN0O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3RDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBJbnZpdGVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSW52aXRlTGlzdCcsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbnZpdGVOb2RlcyA9IF8ubWFwKHRoaXMucHJvcHMuaW52aXRlcywgZnVuY3Rpb24oaW52aXRlKSB7XG4gICAgICAgIHJldHVybiBJbnZpdGVFbnRyeSh7a2V5OiBpbnZpdGUuaWQsIGlkOiBpbnZpdGUuaWQsIGludml0ZWVfZW1haWw6IGludml0ZS5pbnZpdGVlX2VtYWlsLCBpbnZpdGVlOiBpbnZpdGUuaW52aXRlZX0pXG4gICAgICB9KVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsIHBhbmVsLWRlZmF1bHRcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAgbGlzdC1ncm91cC1icmVha291dCBzbWFsbCBvbWVnYVwifSwgXG4gICAgICAgICAgICBSZWFjdENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6IFwiaW52aXRlXCJ9LCBcbiAgICAgICAgICAgICAgaW52aXRlTm9kZXNcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuICB9KTtcblxuICB2YXIgSW52aXRlRW50cnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdJbnZpdGVFbnRyeScsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcImxpc3QtZ3JvdXAtaXRlbVwiLCBrZXk6IHRoaXMucHJvcHMuaWR9LCBcbiAgICAgICAgdGhpcy5sYWJlbCgpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgbGFiZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuaW52aXRlZSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4obnVsbCwgXCJJbnZpdGVkIFwiLCBSZWFjdC5ET00uYSh7aHJlZjogdGhpcy5wcm9wcy5pbnZpdGVlLnVybH0sIFwiQFwiLCB0aGlzLnByb3BzLmludml0ZWUudXNlcm5hbWUpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKG51bGwsIFwiRW1haWxlZCBcIiwgdGhpcy5wcm9wcy5pbnZpdGVlX2VtYWlsKVxuICAgICAgfVxuXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEludml0ZUxpc3Q7XG4gIH1cblxuICB3aW5kb3cuSW52aXRlTGlzdCA9IEludml0ZUxpc3Q7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBKb2luVGVhbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0pvaW5UZWFtJyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNvdW50OiB0aGlzLnByb3BzLmNvdW50LFxuICAgICAgICBpc19tZW1iZXI6IHRoaXMucHJvcHMuaXNfbWVtYmVyXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0b2dnbGVyIHRvZ2dsZXItc21cIn0sIFxuICAgICAgICAgIHRoaXMubGFiZWwoKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRvZ2dsZXItYmFkZ2VcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMuam9pbl9wYXRofSwgdGhpcy5zdGF0ZS5jb3VudClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgbGlzdGVuRm9ySm9pbjogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICAgICQobm9kZSkuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoIWFwcC5jdXJyZW50VXNlcigpKSB7XG4gICAgICAgICAgcmV0dXJuIGFwcC5yZWRpcmVjdFRvKCcvbG9naW4nKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAkKGRvY3VtZW50KS5zY3JvbGwoZnVuY3Rpb24oZSkge1xuICAgICAgICAkKG5vZGUpLnBvcG92ZXIoJ2hpZGUnKTtcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGxpc3RlbkZvckNoYW5nZXM6IGZ1bmN0aW9uKGJpb0VkaXRvcikge1xuICAgICAgdmFyIGpvaW5CdXR0b24gPSAkKCcjam9pbi1pbnRyby1idXR0b24nKVxuICAgICAgdmFyIHN0YXJ0aW5nVmFsID0gYmlvRWRpdG9yLnZhbCgpXG5cbiAgICAgIGlmIChzdGFydGluZ1ZhbCAmJiBzdGFydGluZ1ZhbC5sZW5ndGggPj0gMikge1xuICAgICAgICBqb2luQnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpXG4gICAgICB9XG5cbiAgICAgIGJpb0VkaXRvci5vbigna2V5dXAnLCBmdW5jdGlvbiB0ZXh0RW50ZXJlZChlKSB7XG4gICAgICAgIHZhciB2YWwgPSBiaW9FZGl0b3IudmFsKCkudHJpbSgpXG5cbiAgICAgICAgaWYgKHZhbC5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGpvaW5CdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJylcbiAgICAgICAgfSBlbHNlIGlmICh2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICAgIGpvaW5CdXR0b24uYWRkQ2xhc3MoJ2Rpc2FibGVkJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgbGFiZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaXNfbWVtYmVyKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0b2dnbGVyLWJ0biBidG4gYnRuLVwiICsgdGhpcy5idXR0b24oKSwgJ2RhdGEtdG9nZ2xlJzogXCJwb3BvdmVyXCIsIG9uQ2xpY2s6IHRoaXMuY2xpY2soKX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tdXNlci11bmZvbGxvd1wiLCBzdHlsZTogeydtYXJnaW4tcmlnaHQnOiAnNXB4Jyx9fSksIFxuICAgICAgICAgICAgXCJMZWF2ZSBUZWFtXCJcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0b2dnbGVyLWJ0biBidG4gYnRuLVwiICsgdGhpcy5idXR0b24oKSwgJ2RhdGEtdG9nZ2xlJzogXCJwb3BvdmVyXCIsIG9uQ2xpY2s6IHRoaXMuY2xpY2soKSwgXG4gICAgICAgICAgICByb2xlOiBcImJ1dHRvblwiLCBcbiAgICAgICAgICAgIGlkOiBcImpzLWpvaW4tcG9wb3ZlclwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tdXNlci1mb2xsb3dcIiwgc3R5bGU6IHsnbWFyZ2luLXJpZ2h0JzogJzVweCd9fSksIFxuICAgICAgICAgIFwiSm9pbiBUZWFtXCJcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBidXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaXNfbWVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1lbWJlcnNoaXAgJiYgdGhpcy5wcm9wcy5tZW1iZXJzaGlwLmNvcmVfdGVhbSkge1xuICAgICAgICAgIHJldHVybiAnZGVmYXVsdCBkaXNhYmxlZCdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJ2RlZmF1bHQgaW5hY3RpdmUnXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuICdwcmltYXJ5J1xuICAgIH0sXG5cbiAgICBjbGljazogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5pc19tZW1iZXIgPyB0aGlzLm9uTGVhdmUgOiB0aGlzLm9uSm9pblxuICAgIH0sXG5cbiAgICBoYW5kbGVKb2luT3JMZWF2ZTogZnVuY3Rpb24odXJsLCBuZXdTdGF0ZSwgbWV0aG9kLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICB2YXIgY3VycmVudFN0YXRlID0gdGhpcy5zdGF0ZVxuICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSlcblxuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSlcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGpxeGhyLCBzdGF0dXMpIHtcbiAgICAgICAgICBzZWxmLnNldFN0YXRlKGN1cnJlbnRTdGF0ZSlcbiAgICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3Ioc3RhdHVzKSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgb25Kb2luOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLmhhbmRsZUpvaW5PckxlYXZlKFxuICAgICAgICB0aGlzLnByb3BzLmpvaW5fcGF0aCxcbiAgICAgICAgeyBjb3VudDogKHRoaXMuc3RhdGUuY291bnQgKyAxKSwgaXNfbWVtYmVyOiB0cnVlIH0sXG4gICAgICAgICdQT1NUJyxcbiAgICAgICAgZnVuY3Rpb24gam9pbmVkKGVyciwgZGF0YSkge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHByb2R1Y3QgPSBhcHAuY3VycmVudEFuYWx5dGljc1Byb2R1Y3QoKVxuICAgICAgICAgIGFuYWx5dGljcy50cmFjaygncHJvZHVjdC50ZWFtLmpvaW5lZCcsIHByb2R1Y3QpXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgICQoJyNlZGl0LW1lbWJlcnNoaXAtbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiAnYWRkUGVyc29uJyxcbiAgICAgICAgZGF0YTogeyB1c2VyOiB0aGlzLnByb3BzLm1lbWJlcnNoaXAgfSxcbiAgICAgICAgZXZlbnQ6ICdwZW9wbGU6Y2hhbmdlJ1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uTGVhdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm1lbWJlcnNoaXAgJiYgdGhpcy5wcm9wcy5tZW1iZXJzaGlwLmNvcmVfdGVhbSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdGhpcy5oYW5kbGVKb2luT3JMZWF2ZShcbiAgICAgICAgdGhpcy5wcm9wcy5sZWF2ZV9wYXRoLFxuICAgICAgICB7IGNvdW50OiAodGhpcy5zdGF0ZS5jb3VudCAtIDEpICwgaXNfbWVtYmVyOiBmYWxzZSB9LFxuICAgICAgICAnREVMRVRFJyxcbiAgICAgICAgZnVuY3Rpb24gbGVmdChlcnIsIGRhdGEpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBwcm9kdWN0ID0gYXBwLmN1cnJlbnRBbmFseXRpY3NQcm9kdWN0KClcbiAgICAgICAgICBhbmFseXRpY3MudHJhY2soJ3Byb2R1Y3QudGVhbS5sZWZ0JywgcHJvZHVjdClcbiAgICAgICAgfVxuICAgICAgKVxuXG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uOiAncmVtb3ZlUGVyc29uJyxcbiAgICAgICAgZGF0YTogeyB1c2VyOiB0aGlzLnByb3BzLm1lbWJlcnNoaXAudXNlciB9LFxuICAgICAgICBldmVudDogJ3Blb3BsZTpjaGFuZ2UnXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSm9pblRlYW07XG4gIH1cblxuICB3aW5kb3cuSm9pblRlYW0gPSBKb2luVGVhbTtcbn0pKCk7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgaXNNZW1iZXJPbmxpbmUgPSBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICByZXR1cm4gbW9tZW50KG1lbWJlci5sYXN0X29ubGluZSkuaXNBZnRlcihtb21lbnQoKS5zdWJ0cmFjdCgnaG91cicsIDEpKVxuICB9XG5cbiAgdmFyIGlzTWVtYmVyUmVjZW50bHlBY3RpdmUgPSBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICByZXR1cm4gbW9tZW50KG1lbWJlci5sYXN0X29ubGluZSkuaXNBZnRlcihtb21lbnQoKS5zdWJ0cmFjdCgnbW9udGgnLCAxKSlcbiAgfVxuXG4gIHZhciBNRU1CRVJfVklFV19SRUZSRVNIX1BFUklPRCA9IDYwICogMTAwMDsgLy8gMSBtaW51dGVcblxuICB2YXIgTWVtYmVyc1ZpZXcgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdNZW1iZXJzVmlldycsXG5cbiAgICAgbG9hZE1lbWJlcnNGcm9tU2VydmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdGhpcy5wcm9wcy51cmwsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIG1pbWVUeXBlOiAndGV4dFBsYWluJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBtZW1iZXJzID0gXy5yZWR1Y2UoZGF0YSwgZnVuY3Rpb24obWVtbywgbWVtYmVyKSB7XG4gICAgICAgICAgICBtZW1vW21lbWJlci5pZF0gPSBtZW1iZXJcbiAgICAgICAgICAgIG1lbW9bbWVtYmVyLmlkXS5pc1dhdGNoZXIgPSB0cnVlXG4gICAgICAgICAgICByZXR1cm4gbWVtb1xuICAgICAgICAgIH0sIHt9KVxuXG4gICAgICAgICAgdGhpcy5hZGRNZW1iZXJzKG1lbWJlcnMpO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGxvYWRNZW1iZXJzRnJvbUNoYW5uZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5wcm9wcy5jaGFubmVsLmJpbmQoJ3B1c2hlcjpzdWJzY3JpcHRpb25fc3VjY2VlZGVkJyxcbiAgICAgICAgXy5iaW5kKFxuICAgICAgICAgIGZ1bmN0aW9uKG1lbWJlcnMpIHtcbiAgICAgICAgICAgIG1lbWJlcnMuZWFjaChfLmJpbmQoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgICAgICAgIHRoaXMuYWRkTWVtYmVyKG1lbWJlci5pZCwgbWVtYmVyLmluZm8pXG4gICAgICAgICAgICB9LCB0aGlzKSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWVtYmVyczoge31cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5sb2FkTWVtYmVyc0Zyb21DaGFubmVsKClcblxuICAgICAgdGhpcy5wcm9wcy5jaGFubmVsLmJpbmQoXG4gICAgICAgICdwdXNoZXI6bWVtYmVyX2FkZGVkJyxcbiAgICAgICAgXy5iaW5kKHRoaXMuYWRkTWVtYmVyRnJvbVB1c2hlciwgdGhpcylcbiAgICAgIClcblxuICAgICAgdGhpcy5wcm9wcy5jaGFubmVsLmJpbmQoXG4gICAgICAgICdwdXNoZXI6bWVtYmVyX3JlbW92ZWQnLFxuICAgICAgICBfLmJpbmQodGhpcy5yZW1vdmVNZW1iZXJGcm9tUHVzaGVyLCB0aGlzKVxuICAgICAgKVxuXG4gICAgICBldmVyeShNRU1CRVJfVklFV19SRUZSRVNIX1BFUklPRCwgXy5iaW5kKHRoaXMubG9hZE1lbWJlcnNGcm9tU2VydmVyLCB0aGlzKSlcbiAgICB9LFxuXG4gICAgcmVuZGVyTWVtYmVyOiBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgIHZhciBpc09ubGluZSA9IGlzTWVtYmVyT25saW5lKG1lbWJlcilcbiAgICAgIHZhciBjbGFzc2VzID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0KHtcbiAgICAgICAgJ3RleHQtd2VpZ2h0LWJvbGQgdGV4dC1zdWNjZXNzJzogaXNPbmxpbmUsXG4gICAgICAgICd0ZXh0LWVtcGhhc2lzJzogIWlzT25saW5lXG4gICAgICB9KVxuXG4gICAgICB2YXIgbWFya2VyXG4gICAgICBpZihpc09ubGluZSkge1xuICAgICAgICBtYXJrZXIgPSAoUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpbmRpY2F0b3IgaW5kaWNhdG9yLXN1Y2Nlc3NcIn0sIFwiwqBcIikpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXJrZXIgPSAoUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpbmRpY2F0b3IgaW5kaWNhdG9yLWRlZmF1bHRcIn0sIFwiwqBcIikpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2tleTogbWVtYmVyLmlkfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogY2xhc3NlcywgaHJlZjogbWVtYmVyLnVybH0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInB1bGwtcmlnaHRcIn0sIFxuICAgICAgICAgICAgbWFya2VyXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe2NsYXNzTmFtZTogXCJhdmF0YXJcIiwgc3JjOiBtZW1iZXIuYXZhdGFyX3VybCwgd2lkdGg6IFwiMTZcIiwgaGVpZ2h0OiBcIjE2XCIsIGFsdDogbWVtYmVyLnVzZXJuYW1lLCBzdHlsZToge21hcmdpblJpZ2h0OiAxMH19KSwgXG4gICAgICAgICAgICBtZW1iZXIudXNlcm5hbWVcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbC1ncm91cFwiLCBpZDogXCJhY2NvcmRpb25cIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbCBwYW5lbC1kZWZhdWx0XCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbC1oZWFkaW5nXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmg2KHtjbGFzc05hbWU6IFwicGFuZWwtdGl0bGVcIn0sIFwiT25saW5lXCIpXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbC1ib2R5IHNtYWxsXCJ9LCBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXy5tYXAodGhpcy5vbmxpbmVNZW1iZXJzKCksIHRoaXMucmVuZGVyTWVtYmVyKVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsLWhlYWRpbmdcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7J2RhdGEtdG9nZ2xlJzogXCJjb2xsYXBzZVwiLCAnZGF0YS1wYXJlbnQnOiBcIiNhY2NvcmRpb25cIiwgaHJlZjogXCIjY29sbGFwc2VSZWNlbnRcIiwgY2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWNoZXZyb24tdXAgcHVsbC1yaWdodFwifSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oNih7Y2xhc3NOYW1lOiBcInBhbmVsLXRpdGxlXCJ9LCBcIlJlY2VudGx5IEFjdGl2ZVwiKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2lkOiBcImNvbGxhcHNlUmVjZW50XCIsIGNsYXNzTmFtZTogXCJwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZSBpblwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbC1ib2R5IHNtYWxsXCJ9LCBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXy5tYXAodGhpcy5yZWNlbnRseUFjdGl2ZU1lbWJlcnMoKSwgdGhpcy5yZW5kZXJNZW1iZXIpXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGFkZE1lbWJlcnM6IGZ1bmN0aW9uKG1lbWJlcnMpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtZW1iZXJzOiBfLmV4dGVuZCh0aGlzLnN0YXRlLm1lbWJlcnMsIG1lbWJlcnMpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBhZGRNZW1iZXJGcm9tUHVzaGVyOiBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgIG1lbWJlci5pbmZvLmxhc3Rfb25saW5lID0gKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcbiAgICAgIHRoaXMuYWRkTWVtYmVyKG1lbWJlci5pZCwgbWVtYmVyLmluZm8pXG4gICAgfSxcblxuICAgIHJlbW92ZU1lbWJlckZyb21QdXNoZXI6IGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgdGhpcy5tZW1iZXJXZW50T2ZmbGluZShtZW1iZXIuaWQpXG4gICAgfSxcblxuICAgIGFkZE1lbWJlcjogZnVuY3Rpb24oaWQsIG1lbWJlcikge1xuICAgICAgdmFyIHVwZGF0ZSA9IHt9XG4gICAgICB1cGRhdGVbaWRdID0geyckc2V0JzogbWVtYmVyfVxuICAgICAgdGhpcy5zZXRTdGF0ZShSZWFjdC5hZGRvbnMudXBkYXRlKHRoaXMuc3RhdGUsIHttZW1iZXJzOiB1cGRhdGV9KSlcbiAgICB9LFxuXG4gICAgbWVtYmVyV2VudE9mZmxpbmU6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgbWVtYmVyID0gdGhpcy5zdGF0ZS5tZW1iZXJzW2lkXVxuICAgICAgaWYobWVtYmVyLmlzV2F0Y2hlcikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtZW1iZXJzID0gdGhpcy5zdGF0ZS5tZW1iZXJzO1xuICAgICAgICBkZWxldGUgbWVtYmVyc1tpZF1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bWVtYmVyczogbWVtYmVyc30pXG4gICAgICB9XG4gICAgfSxcblxuICAgIG9ubGluZU1lbWJlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8uY2hhaW4odGhpcy5zdGF0ZS5tZW1iZXJzKS52YWx1ZXMoKS5maWx0ZXIoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgIHJldHVybiBpc01lbWJlck9ubGluZShtZW1iZXIpXG4gICAgICB9KS5zb3J0QnkoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgIHJldHVybiBtZW1iZXIudXNlcm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgfSkudmFsdWUoKVxuICAgIH0sXG5cbiAgICByZWNlbnRseUFjdGl2ZU1lbWJlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8uY2hhaW4odGhpcy5zdGF0ZS5tZW1iZXJzKS52YWx1ZXMoKS5maWx0ZXIoZnVuY3Rpb24obWVtYmVyKSB7XG4gICAgICAgIHJldHVybiAhaXNNZW1iZXJPbmxpbmUobWVtYmVyKSAmJiBpc01lbWJlclJlY2VudGx5QWN0aXZlKG1lbWJlcilcbiAgICAgIH0pLnNvcnRCeShmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIG1lbWJlci51c2VybmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICB9KS52YWx1ZSgpXG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1lbWJlcnNWaWV3O1xuICB9XG5cbiAgd2luZG93Lk1lbWJlcnNWaWV3ID0gTWVtYmVyc1ZpZXc7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFRpdGxlTm90aWZpY2F0aW9uc0NvdW50ID0gcmVxdWlyZSgnLi90aXRsZV9ub3RpZmljYXRpb25zX2NvdW50LmpzLmpzeCcpO1xudmFyIERyb3Bkb3duTmV3c0ZlZWRUb2dnbGVyID0gcmVxdWlyZSgnLi9kcm9wZG93bl9uZXdzX2ZlZWRfdG9nZ2xlci5qcy5qc3gnKTtcbnZhciBEcm9wZG93bk5ld3NGZWVkID0gcmVxdWlyZSgnLi9kcm9wZG93bl9uZXdzX2ZlZWQuanMuanN4Jyk7XG52YXIgQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyID0gcmVxdWlyZSgnLi9jaGF0X25vdGlmaWNhdGlvbnNfdG9nZ2xlci5qcy5qc3gnKTtcbnZhciBDaGF0Tm90aWZpY2F0aW9ucyA9IHJlcXVpcmUoJy4vY2hhdF9ub3RpZmljYXRpb25zLmpzLmpzeCcpO1xudmFyIFVzZXJOYXZiYXJEcm9wZG93biA9IHJlcXVpcmUoJy4vdXNlcl9uYXZiYXJfZHJvcGRvd24uanMuanN4Jyk7XG52YXIgQXZhdGFyID0gcmVxdWlyZSgnLi9hdmF0YXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIE5hdmJhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ05hdmJhcicsXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVzZXI6IGFwcC5jdXJyZW50VXNlcigpLmF0dHJpYnV0ZXNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdXNlciA9IHRoaXMucHJvcHMuY3VycmVudFVzZXI7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcIm5hdiBuYXZiYXItbmF2XCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBUaXRsZU5vdGlmaWNhdGlvbnNDb3VudChudWxsKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgRHJvcGRvd25OZXdzRmVlZFRvZ2dsZXIoe1xuICAgICAgICAgICAgICAgIGljb25DbGFzczogXCJpY29uLWJlbGxcIiwgXG4gICAgICAgICAgICAgICAgaHJlZjogXCIjc3Rvcmllc1wiLCBcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJOb3RpZmljYXRpb25zXCJ9KSwgXG5cbiAgICAgICAgICAgIERyb3Bkb3duTmV3c0ZlZWQoe1xuICAgICAgICAgICAgICAgIHVybDogdGhpcy5wcm9wcy5uZXdzRmVlZFBhdGgsIFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLnByb3BzLnVzZXIudXNlcm5hbWUsIFxuICAgICAgICAgICAgICAgIGVkaXRVc2VyUGF0aDogdGhpcy5wcm9wcy5lZGl0VXNlclBhdGh9KVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgQ2hhdE5vdGlmaWNhdGlvbnNUb2dnbGVyKHtcbiAgICAgICAgICAgICAgaWNvbkNsYXNzOiBcImljb24tYnViYmxlc1wiLCBcbiAgICAgICAgICAgICAgaHJlZjogXCIjbm90aWZpY2F0aW9uc1wiLCBcbiAgICAgICAgICAgICAgbGFiZWw6IFwiQ2hhdFwifSksIFxuXG4gICAgICAgICAgICBDaGF0Tm90aWZpY2F0aW9ucyh7XG4gICAgICAgICAgICAgICAgdXJsOiB0aGlzLnByb3BzLmNoYXRQYXRoLCBcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lfVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiZHJvcGRvd25cIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wiLCBjbGFzc05hbWU6IFwiZHJvcGRvd24tdG9nZ2xlXCIsICdkYXRhLXRvZ2dsZSc6IFwiZHJvcGRvd25cIn0sIFxuICAgICAgICAgICAgICBBdmF0YXIoe3VzZXI6IHRoaXMucHJvcHMudXNlcn0pLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ2aXNpYmxlLXhzLWlubGluZVwiLCBzdHlsZTogeyAnbWFyZ2luLWxlZnQnOiAnNXB4J319LCBcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnVzZXIudXNlcm5hbWVcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIHRoaXMudHJhbnNmZXJQcm9wc1RvKFVzZXJOYXZiYXJEcm9wZG93bihudWxsKSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IE5hdmJhcjtcbiAgfVxuXG4gIHdpbmRvdy5OYXZiYXIgPSBOYXZiYXI7XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIE5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd25TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9ub3RpZmljYXRpb25fcHJlZmVyZW5jZXNfZHJvcGRvd25fc3RvcmUnKTtcbnZhciBBdmF0YXIgPSByZXF1aXJlKCcuL2F2YXRhci5qcy5qc3gnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgRCA9IENPTlNUQU5UUy5OT1RJRklDQVRJT05fUFJFRkVSRU5DRVNfRFJPUERPV047XG5cbiAgdmFyIE5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duJyxcbiAgICBjaGV2cm9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmNoZXZyb24pIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWNoZXZyb24tZG93blwifSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3Bhbih7c3R5bGU6IHsgJ21hcmdpbi1yaWdodCc6ICc3cHgnLCAnbWFyZ2luLWxlZnQnOiAnN3B4J319KVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgTm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93blN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuaGFuZGxlVXBkYXRlKTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb2R1Y3RXYXRjaGVyc0NvdW50OiB0aGlzLnByb3BzLnByb2R1Y3RXYXRjaGVyc0NvdW50LFxuICAgICAgICBzZWxlY3RlZDogdGhpcy5wcm9wcy53YXRjaGluZ1N0YXRlLFxuICAgICAgICBjaGV2cm9uOiBmYWxzZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaGlkZUNoZXZyb246IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNoZXZyb246IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0b2dnbGVyIHRvZ2dsZXItc20gYnRuLWdyb3VwXCIsIG9uTW91c2VPdmVyOiB0aGlzLnNob3dDaGV2cm9uLCBvbk1vdXNlT3V0OiB0aGlzLmhpZGVDaGV2cm9ufSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgICBjbGFzc05hbWU6IHRoaXMuYnV0dG9uQ2xhc3Nlcyh0cnVlKSwgXG4gICAgICAgICAgICAgICdkYXRhLXRvZ2dsZSc6IFwiZHJvcGRvd25cIiwgXG4gICAgICAgICAgICAgIHN0eWxlOiB7ICdtYXJnaW4tYm90dG9tJzogJzEzcHgnfX0sIFxuICAgICAgICAgICAgdGhpcy5idXR0b25TdGF0ZSgpLCBcbiAgICAgICAgICAgIHRoaXMuY2hldnJvbigpXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRvZ2dsZXItYmFkZ2VcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsIFxuICAgICAgICAgICAgICAgIGhyZWY6IHRoaXMucHJvcHMucHJvZHVjdFdhdGNoZXJzUGF0aCwgXG4gICAgICAgICAgICAgICAgc3R5bGU6IHsgb3BhY2l0eTogJzAuNScsICdib3JkZXItdG9wLXJpZ2h0LXJhZGl1cyc6ICcycHgnLCAnYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXMnOiAnMnB4J319LCBcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5wcm9kdWN0V2F0Y2hlcnNDb3VudFxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS51bCh7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51IGRyb3Bkb3duLW1lbnUtcmlnaHRcIiwgXG4gICAgICAgICAgICAgIHJvbGU6IFwibWVudVwiLCBcbiAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICdhdXRvJywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzM1cHgnLCAncGFkZGluZy10b3AnOiAwfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtcbiAgICAgICAgICAgICAgICByb2xlOiBcInByZXNlbnRhdGlvblwiLCBcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiZHJvcGRvd24taGVhZGVyXCIsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7IGNvbG9yOiAnI2E2YTZhNicsICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmM2YzZjMnfX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFwiRm9sbG93aW5nIFByZWZlcmVuY2VzXCIpXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtyb2xlOiBcInByZXNlbnRhdGlvblwiLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ30sIGNsYXNzTmFtZTogdGhpcy5zZWxlY3RlZENsYXNzKCdub3Qgd2F0Y2hpbmcnKX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7cm9sZTogXCJtZW51aXRlbVwiLCB0YWJJbmRleDogXCItMVwiLCBvbkNsaWNrOiB0aGlzLnVwZGF0ZVByZWZlcmVuY2UuYmluZCh0aGlzLCAnbm90IHdhdGNoaW5nJywgdGhpcy5wcm9wcy5wcm9kdWN0VW5mb2xsb3dQYXRoKX0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFwiTm90IGZvbGxvd2luZ1wiKVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZFwifSwgXG4gICAgICAgICAgICAgICAgICBcIlJlY2VpdmUgbm90aWZpY2F0aW9ucyB3aGVuIHlvdSBhcmUgQG1lbnRpb25lZFwiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtyb2xlOiBcInByZXNlbnRhdGlvblwiLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ30sIGNsYXNzTmFtZTogdGhpcy5zZWxlY3RlZENsYXNzKCd3YXRjaGluZycpfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtyb2xlOiBcIm1lbnVpdGVtXCIsIHRhYkluZGV4OiBcIi0xXCIsIG9uQ2xpY2s6IHRoaXMudXBkYXRlUHJlZmVyZW5jZS5iaW5kKHRoaXMsICd3YXRjaGluZycsIHRoaXMucHJvcHMucHJvZHVjdEZvbGxvd1BhdGgpfSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zdHJvbmcobnVsbCwgXCJGb2xsb3cgYW5ub3VuY2VtZW50cyBvbmx5XCIpXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRleHQtbXV0ZWRcIn0sIFxuICAgICAgICAgICAgICAgICAgXCJSZWNlaXZlIG5vdGlmaWNhdGlvbnMgd2hlbiB0aGVyZSBhcmUgbmV3IGJsb2cgcG9zdHNcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7cm9sZTogXCJwcmVzZW50YXRpb25cIiwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9LCBjbGFzc05hbWU6IHRoaXMuc2VsZWN0ZWRDbGFzcygnc3Vic2NyaWJlZCcpfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtyb2xlOiBcIm1lbnVpdGVtXCIsIHRhYkluZGV4OiBcIi0xXCIsIG9uQ2xpY2s6IHRoaXMudXBkYXRlUHJlZmVyZW5jZS5iaW5kKHRoaXMsICdzdWJzY3JpYmVkJywgdGhpcy5wcm9wcy5wcm9kdWN0U3Vic2NyaWJlUGF0aCl9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCBcIkZvbGxvd1wiKVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcbiAgICAgICAgICAgICAgICAgIFwiUmVjZWl2ZSBub3RpZmljYXRpb25zIHdoZW4gdGhlcmUgYXJlIG5ldyBibG9nIHBvc3RzLCBkaXNjdXNzaW9ucywgYW5kIGNoYXQgbWVzc2FnZXNcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgc2hvd0NoZXZyb246IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNoZXZyb246IHRydWVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNlbGVjdGVkOiBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duU3RvcmUuZ2V0U2VsZWN0ZWQoKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGJ1dHRvblN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICBjYXNlICdzdWJzY3JpYmVkJzpcbiAgICAgICAgICByZXR1cm4gJ0ZvbGxvd2luZyc7XG4gICAgICAgIGNhc2UgJ3dhdGNoaW5nJzpcbiAgICAgICAgICByZXR1cm4gJ0ZvbGxvd2luZyBhbm5vdW5jZW1lbnRzIG9ubHknO1xuICAgICAgICBjYXNlICdub3Qgd2F0Y2hpbmcnOlxuICAgICAgICAgIHJldHVybiAnRm9sbG93JztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYnV0dG9uQ2xhc3NlczogZnVuY3Rpb24oZHJvcGRvd25Ub2dnbGUpIHtcbiAgICAgIHJldHVybiBSZWFjdC5hZGRvbnMuY2xhc3NTZXQoe1xuICAgICAgICAnYnRuJzogdHJ1ZSxcbiAgICAgICAgJ2J0bi1wcmltYXJ5JzogKHRoaXMuc3RhdGUuc2VsZWN0ZWQgPT09ICdub3Qgd2F0Y2hpbmcnKSxcbiAgICAgICAgJ2J0bi1kZWZhdWx0JzogKHRoaXMuc3RhdGUuc2VsZWN0ZWQgIT09ICdub3Qgd2F0Y2hpbmcnKSxcbiAgICAgICAgJ2J0bi1zbSc6IHRydWUsXG4gICAgICAgICdkcm9wZG93bi10b2dnbGUnOiBkcm9wZG93blRvZ2dsZVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgc2VsZWN0ZWRDbGFzczogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gb3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBcImFjdGl2ZVwiO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVQcmVmZXJlbmNlOiBmdW5jdGlvbihpdGVtLCBwYXRoKSB7XG4gICAgICBEaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgZXZlbnQ6IEQuRVZFTlRTLlNFTEVDVEVEX1VQREFURUQsXG4gICAgICAgIGFjdGlvbjogRC5BQ1RJT05TLlVQREFURV9TRUxFQ1RFRCxcbiAgICAgICAgZGF0YTogeyBpdGVtOiBpdGVtLCBwYXRoOiBwYXRoIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duO1xuICB9XG5cbiAgd2luZG93Lk5vdGlmaWNhdGlvblByZWZlcmVuY2VzRHJvcGRvd24gPSBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBOdW1iZXJJbnB1dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ051bWJlcklucHV0JyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGFtb3VudDogdGhpcy5wcm9wcy5zdGFydGluZ0Ftb3VudCxcbiAgICAgICAgZWRpdGFibGU6IHRoaXMucHJvcHMuYWx3YXlzRWRpdGFibGVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmxpc3RlbkZvckNoYW5nZXModGhpcy5yZWZzLmlucHV0RmllbGQgJiYgdGhpcy5yZWZzLmlucHV0RmllbGQuZ2V0RE9NTm9kZSgpKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50RGlkTW91bnQoKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRhYmxlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVkaXRhYmxlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnVuZWRpdGFibGUoKTtcbiAgICB9LFxuXG4gICAgZWRpdGFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0LWdyb3VwXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe25hbWU6IHRoaXMucHJvcHMubmFtZSwgcmVmOiBcImlucHV0RmllbGRcIiwgdHlwZTogXCJudW1iZXJcIiwgY2xhc3NOYW1lOiBcImZvcm0tY29udHJvbFwiLCBtaW46IFwiMFwiLCBzdGVwOiBcIjAuMVwiLCBkZWZhdWx0VmFsdWU6IHRoaXMuc3RhdGUuYW1vdW50fSksIFxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYWRkb25cIn0sIFwiJVwiKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICB1bmVkaXRhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJCgnI2VkaXQtY29udHJhY3QtJyArIHRoaXMucHJvcHMudXNlci51c2VybmFtZSkuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICAkKHNlbGYucHJvcHMuY29uZmlybUJ1dHRvbikuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICAkKHRoaXMpLnRleHQoKSA9PT0gJ0VkaXQnID8gJCh0aGlzKS50ZXh0KCdDYW5jZWwnKSA6ICQodGhpcykudGV4dCgnRWRpdCcpO1xuICAgICAgICBzZWxmLnNldFN0YXRlKHsgZWRpdGFibGU6ICFzZWxmLnN0YXRlLmVkaXRhYmxlIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoUmVhY3QuRE9NLnNwYW4obnVsbCwgUmVhY3QuRE9NLnN0cm9uZyhudWxsLCB0aGlzLnByb3BzLnN0YXJ0aW5nQW1vdW50ICsgJyUnKSwgXCIgdGlwIHdoZW4gY29pbnMgYXJlIG1pbnRlZFwiKSk7XG4gICAgfSxcblxuICAgIGxpc3RlbkZvckNoYW5nZXM6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICQobm9kZSkub24oJ2NoYW5nZSBrZXlkb3duJywgdGhpcy5oYW5kbGVDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBjb25maXJtTGluayA9ICQodGhpcy5wcm9wcy5jb25maXJtQnV0dG9uKTtcblxuICAgICAgaWYgKCFfLmlzRW1wdHkoY29uZmlybUxpbmspKSB7XG4gICAgICAgIHZhciBub2RlID0gJCh0aGlzLnJlZnMuaW5wdXRGaWVsZC5nZXRET01Ob2RlKCkpO1xuXG4gICAgICAgIGlmIChub2RlICYmIG5vZGUudmFsKCkgIT09IHRoaXMucHJvcHMuc3RhcnRpbmdBbW91bnQpIHtcbiAgICAgICAgICBjb25maXJtTGluay5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICAgIGNvbmZpcm1MaW5rLm9mZignY2xpY2snKTtcbiAgICAgICAgICBjb25maXJtTGluay5vbignY2xpY2snLCB7IG5vZGU6IG5vZGUsIHNlbGY6IHRoaXMgfSwgdGhpcy5jb25maXJtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25maXJtTGluay5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgICAgY29uZmlybUxpbmsub2ZmKCdjbGljaycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbmZpcm06IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBub2RlID0gZS5kYXRhLm5vZGU7XG4gICAgICB2YXIgc2VsZiA9IGUuZGF0YS5zZWxmO1xuICAgICAgdmFyIG9iaiA9IHtcbiAgICAgICAgY29udHJhY3Q6IHtcbiAgICAgICAgICBhbW91bnQ6IG5vZGUudmFsKCksXG4gICAgICAgICAgdXNlcjogdGhpcy5wcm9wcy51c2VyLmlkXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIF8uZGVib3VuY2UoJC5hamF4KHtcbiAgICAgICAgdXJsOiBzZWxmLnByb3BzLnVwZGF0ZVBhdGgsXG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgZGF0YTogb2JqLFxuICAgICAgICBzdWNjZXNzOiBzZWxmLmhhbmRsZVN1Y2Nlc3MsXG4gICAgICAgIGVycm9yOiBzZWxmLmhhbmRsZUVycm9yXG4gICAgICB9KSwgMzAwKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlU3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlRXJyb3I6IGZ1bmN0aW9uKGpxeGhyLCBzdGF0dXMpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3Ioc3RhdHVzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gTnVtYmVySW5wdXQ7XG4gIH1cblxuICB3aW5kb3cuTnVtYmVySW5wdXQgPSBOdW1iZXJJbnB1dDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBlb3BsZVN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3Blb3BsZV9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBQZW9wbGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdQZW9wbGUnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLnByb3BzLmNvcmVPbmx5KSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUGVvcGxlTGlzdCh7XG4gICAgICAgICAgICBtZW1iZXJzaGlwczogdGhpcy5zdGF0ZS5maWx0ZXJlZE1lbWJlcnNoaXBzLCBcbiAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkLCBcbiAgICAgICAgICAgIG9uRmlsdGVyOiB0aGlzLm9uRmlsdGVyLCBcbiAgICAgICAgICAgIGludGVyZXN0RmlsdGVyczogdGhpcy5wcm9wcy5pbnRlcmVzdEZpbHRlcnMsIFxuICAgICAgICAgICAgY3VycmVudFVzZXI6IHRoaXMucHJvcHMuY3VycmVudFVzZXIsIFxuICAgICAgICAgICAgdXBkYXRlUGF0aDogdGhpcy5wcm9wcy51cGRhdGVQYXRoLCBcbiAgICAgICAgICAgIGNvcmVNZW1iZXJzaGlwczogdGhpcy5wcm9wcy5jb3JlTWVtYmVyc2hpcHN9KVxuICAgICAgICApO1xuICAgICAgfVxuXG5cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICBQZW9wbGVGaWx0ZXIoe1xuICAgICAgICAgICAgICBpbnRlcmVzdEZpbHRlcnM6IHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWQsIFxuICAgICAgICAgICAgICBvbkZpbHRlcjogdGhpcy5vbkZpbHRlcn0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbCksIFxuICAgICAgICAgIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwidGV4dC1tdXRlZCB0ZXh0LWNlbnRlclwifSwgXCJUaXA6IFlvdSBjYW4gdXNlIEBtZW50aW9ucyB0byBnZXQgdGhlIGF0dGVudGlvbiBvZiBcIiwgdGhpcy5maWx0ZXJMYWJlbCgpLCBcIiBpbiBjaGF0IG9yIEJvdW50aWVzLlwiKSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpLCBcbiAgICAgICAgICBQZW9wbGVMaXN0KHtcbiAgICAgICAgICAgICAgbWVtYmVyc2hpcHM6IHRoaXMuc3RhdGUuZmlsdGVyZWRNZW1iZXJzaGlwcywgXG4gICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkLCBcbiAgICAgICAgICAgICAgb25GaWx0ZXI6IHRoaXMub25GaWx0ZXIsIFxuICAgICAgICAgICAgICBpbnRlcmVzdEZpbHRlcnM6IHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBcbiAgICAgICAgICAgICAgY3VycmVudFVzZXI6IHRoaXMucHJvcHMuY3VycmVudFVzZXIsIFxuICAgICAgICAgICAgICB1cGRhdGVQYXRoOiB0aGlzLnByb3BzLnVwZGF0ZVBhdGgsIFxuICAgICAgICAgICAgICBjb3JlTWVtYmVyc2hpcHM6IHRoaXMucHJvcHMuY29yZU1lbWJlcnNoaXBzfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgUGVvcGxlU3RvcmUuc2V0UGVvcGxlKHRoaXMucHJvcHMubWVtYmVyc2hpcHMpO1xuICAgICAgdGhpcy5vbkZpbHRlcih0aGlzLnByb3BzLnNlbGVjdGVkKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgUGVvcGxlU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5vbkNoYW5nZSk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub25GaWx0ZXIodGhpcy5zdGF0ZS5zZWxlY3RlZCk7XG4gICAgfSxcblxuICAgIG9uRmlsdGVyOiBmdW5jdGlvbihpbnRlcmVzdCkge1xuICAgICAgdmFyIGZpbHRlcmVkTWVtYmVyc2hpcHMgPSBQZW9wbGVTdG9yZS5nZXRQZW9wbGUoKTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKGludGVyZXN0KSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuc2VsZWN0ZWQgPT09IGludGVyZXN0KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub25GaWx0ZXIoKVxuICAgICAgICB9XG5cbiAgICAgICAgZmlsdGVyZWRNZW1iZXJzaGlwcyA9IF8uZmlsdGVyKGZpbHRlcmVkTWVtYmVyc2hpcHMsIGZ1bmN0aW9uIGZpbHRlck1lbWJlcnNoaXBzKG0pIHtcbiAgICAgICAgICBpZiAoaW50ZXJlc3QgPT09ICdjb3JlJykge1xuICAgICAgICAgICAgcmV0dXJuIG0uY29yZV90ZWFtO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBfLmluY2x1ZGUobS5pbnRlcmVzdHMsIGludGVyZXN0KVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICB2YXIgc29ydGVkTWVtYmVyc2hpcHMgPSBfLnNvcnRCeShmaWx0ZXJlZE1lbWJlcnNoaXBzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgIGlmICghbSkgcmV0dXJuO1xuXG4gICAgICAgIHJldHVybiAoc2VsZi5wcm9wcy5jdXJyZW50VXNlciAmJiBzZWxmLnByb3BzLmN1cnJlbnRVc2VyLmlkID09PSBtLnVzZXIuaWQgP1xuICAgICAgICAgICctMScgOlxuICAgICAgICAgIG0uY29yZV90ZWFtID8gJzAnIDogJzEnKSArXG4gICAgICAgICAgbS51c2VyLnVzZXJuYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZmlsdGVyZWRNZW1iZXJzaGlwczogc29ydGVkTWVtYmVyc2hpcHMsIHNlbGVjdGVkOiBpbnRlcmVzdCB9KTtcbiAgICB9LFxuXG4gICAgZmlsdGVyTGFiZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIChSZWFjdC5ET00uc3BhbihudWxsLCBcIiB0aGUgXCIsIFJlYWN0LkRPTS5hKHtzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfX0sIFwiQFwiLCB0aGlzLnN0YXRlLnNlbGVjdGVkKSwgXCIgdGVhbVwiKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAndGhlc2UgdGVhbXMnXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHZhciBQZW9wbGVGaWx0ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdQZW9wbGVGaWx0ZXInLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgaGlnaGxpZ2h0QWxsID0gc2VsZi5wcm9wcyAmJiAhc2VsZi5wcm9wcy5zZWxlY3RlZCA/ICdwcmltYXJ5JzogJ2RlZmF1bHQnO1xuICAgICAgdmFyIGhpZ2hsaWdodENvcmUgPSBzZWxmLnByb3BzICYmIHNlbGYucHJvcHMuc2VsZWN0ZWQgPT09ICdjb3JlJyA/ICdwcmltYXJ5JzogJ2RlZmF1bHQnO1xuXG4gICAgICB2YXIgdGFncyA9IF8ubWFwKHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBmdW5jdGlvbihpbnRlcmVzdCl7XG4gICAgICAgIGlmIChpbnRlcmVzdCA9PT0gJ2NvcmUnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxhYmVsID0gJ0AnICsgaW50ZXJlc3Q7XG4gICAgICAgIHZhciBoaWdobGlnaHQgPSBzZWxmLnByb3BzICYmIHNlbGYucHJvcHMuc2VsZWN0ZWQgPT09IGludGVyZXN0ID8gJ3ByaW1hcnknIDogJ2RlZmF1bHQnO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogJ2J0biBidG4tJyArIGhpZ2hsaWdodCwgXG4gICAgICAgICAgICAgIGhyZWY6ICcjJyArIGxhYmVsLCBcbiAgICAgICAgICAgICAgb25DbGljazogc2VsZi5maWx0ZXJDaGFuZ2VkKGludGVyZXN0KSwgXG4gICAgICAgICAgICAgIGtleTogaW50ZXJlc3R9LCBcbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLXhzLTJcIn0sIFxuICAgICAgICAgICAgXCJCcm93c2UgYnk6XCJcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLXhzLTEwIGJ0bi1ncm91cCBidG4tZ3JvdXAtc21cIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogJ3RleHQtbXV0ZWQgYnRuIGJ0bi0nICsgaGlnaGxpZ2h0QWxsLCBcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmNsZWFySW50ZXJlc3QsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9fSwgXG4gICAgICAgICAgICAgIFwiQWxsXCJcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogJ3RleHQtbXV0ZWQgYnRuIGJ0bi0nICsgaGlnaGxpZ2h0Q29yZSwgXG4gICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5oaWdobGlnaHRDb3JlLCBcbiAgICAgICAgICAgICAgICBzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfX0sIFxuICAgICAgICAgICAgICBcIkBjb3JlXCJcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgdGFnc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBmaWx0ZXJDaGFuZ2VkOiBmdW5jdGlvbihpbnRlcmVzdCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5wcm9wcy5vbkZpbHRlcihpbnRlcmVzdClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNsZWFySW50ZXJlc3Q6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucHJvcHMub25GaWx0ZXIoKTtcbiAgICB9LFxuXG4gICAgaGlnaGxpZ2h0Q29yZTogZnVuY3Rpb24oZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkZpbHRlcignY29yZScpXG4gICAgfVxuICB9KTtcblxuICB2YXIgUGVvcGxlTGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1Blb3BsZUxpc3QnLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibGlzdC1ncm91cCBsaXN0LWdyb3VwLWJyZWFrb3V0IGxpc3QtZ3JvdXAtcGFkZGVkXCJ9LCBcbiAgICAgICAgICB0aGlzLnJvd3ModGhpcy5wcm9wcy5tZW1iZXJzaGlwcylcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbihtZW1iZXJzaGlwcykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgcm93cyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1lbWJlcnNoaXBzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgbWVtYmVyID0gbWVtYmVyc2hpcHNbaV07XG5cbiAgICAgICAgaWYgKCFtZW1iZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdXNlciA9IG1lbWJlci51c2VyO1xuXG4gICAgICAgIHZhciByb3cgPSAoXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wiLCBcbiAgICAgICAgICAgIGtleTogJ3Jvdy0nICsgdXNlci5pZCwgXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAncGFkZGluZy10b3AnOiAnMTVweCcsXG4gICAgICAgICAgICAgICdwYWRkaW5nLWJvdHRvbSc6ICcxNXB4JyxcbiAgICAgICAgICAgICAgJ2JvcmRlci1ib3R0b20nOiAnMXB4IHNvbGlkICNlYmViZWInXG4gICAgICAgICAgICB9fSwgXG4gICAgICAgICAgICB0aGlzLmF2YXRhcih1c2VyKSwgXG4gICAgICAgICAgICB0aGlzLm1lbWJlcihtZW1iZXIpXG4gICAgICAgICAgKVxuICAgICAgICApXG5cbiAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByb3dzO1xuICAgIH0sXG5cbiAgICBhdmF0YXI6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtc20tMSBjb2wteHMtMSBcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB1c2VyLnVybCwgdGl0bGU6ICdAJyArIHVzZXIudXNlcm5hbWV9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe3NyYzogdXNlci5hdmF0YXJfdXJsLCBcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYXZhdGFyXCIsIFxuICAgICAgICAgICAgICAgIGFsdDogJ0AnICsgdXNlci51c2VybmFtZSwgXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiMzBcIiwgXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjMwXCJ9XG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBtZW1iZXI6IGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgaWYgKCFtZW1iZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgdXNlciA9IG1lbWJlci51c2VyO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLXNtLTExIGNvbC14cy0xMVwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJvbWVnYVwifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJsaXN0LWlubGluZSBvbWVnYSBwdWxsLXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgdGhpcy5za2lsbHMobWVtYmVyKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Ryb25nKG51bGwsIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdXNlci51cmwsIHRpdGxlOiAnQCcgKyB1c2VyLnVzZXJuYW1lfSwgXG4gICAgICAgICAgICAgICAgdXNlci51c2VybmFtZVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgdXNlci5iaW8gPyB0aGlzLmhhc0Jpbyh1c2VyKSA6ICcnLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgQmlvRWRpdG9yKHtcbiAgICAgICAgICAgICAgICBtZW1iZXI6IG1lbWJlciwgXG4gICAgICAgICAgICAgICAgb25GaWx0ZXI6IHRoaXMucHJvcHMub25GaWx0ZXIsIFxuICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyOiB0aGlzLnByb3BzLmN1cnJlbnRVc2VyLCBcbiAgICAgICAgICAgICAgICB1cGRhdGVQYXRoOiB0aGlzLnByb3BzLnVwZGF0ZVBhdGgsIFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQmlvOiBtZW1iZXIuYmlvLCBcbiAgICAgICAgICAgICAgICBpbnRlcmVzdEZpbHRlcnM6IHRoaXMucHJvcHMuaW50ZXJlc3RGaWx0ZXJzLCBcbiAgICAgICAgICAgICAgICB1cGRhdGVTa2lsbHM6IHRoaXMudXBkYXRlU2tpbGxzLCBcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5wcm9wcy5zZWxlY3RlZH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICB0aGlzLmNvcmVUZWFtSW5mbyhtZW1iZXIpXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgY29yZVRlYW1JbmZvOiBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgIHZhciBjb3JlID0gdGhpcy5wcm9wcy5jb3JlTWVtYmVyc2hpcHM7XG5cbiAgICAgIGlmIChjb3JlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gY29yZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB2YXIgYyA9IGNvcmVbaV07XG5cbiAgICAgICAgICBpZiAoYy51c2VyX2lkID09PSBtZW1iZXIudXNlci5pZCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCAnQ29yZSB0ZWFtIHNpbmNlICcgKyBfcGFyc2VEYXRlKGMuY3JlYXRlZF9hdCkpXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhhc0JpbzogZnVuY3Rpb24odXNlcikge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnAoe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkIHRleHQtc21hbGxcIn0sIFxuICAgICAgICAgIHVzZXIuYmlvID8gdXNlci5iaW8gOiAnJ1xuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIHNraWxsczogZnVuY3Rpb24obWVtYmVyc2hpcCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAobWVtYmVyc2hpcC5jb3JlX3RlYW0gJiYgbWVtYmVyc2hpcC5pbnRlcmVzdHMuaW5kZXhPZignY29yZScpIDwgMCkge1xuICAgICAgICBtZW1iZXJzaGlwLmludGVyZXN0cy5wdXNoKCdjb3JlJylcbiAgICAgIH1cblxuICAgICAgbWVtYmVyc2hpcC5pbnRlcmVzdHMuc29ydCgpO1xuXG4gICAgICByZXR1cm4gXy5tYXAobWVtYmVyc2hpcC5pbnRlcmVzdHMsIGZ1bmN0aW9uIG1hcEludGVyZXN0cyhpbnRlcmVzdCkge1xuICAgICAgICB2YXIgbGFiZWwgPSAnQCcgKyBpbnRlcmVzdDtcbiAgICAgICAgdmFyIGhpZ2hsaWdodCA9IHNlbGYucHJvcHMgJiYgc2VsZi5wcm9wcy5zZWxlY3RlZCA9PT0gaW50ZXJlc3QgPyAncHJpbWFyeScgOiAnb3V0bGluZWQnO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogJ2xhYmVsIGxhYmVsLScgKyBoaWdobGlnaHQsIFxuICAgICAgICAgICAgICAgIGtleTogbWVtYmVyc2hpcC51c2VyLmlkICsgJy0nICsgaW50ZXJlc3QsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcid9LCBcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBzZWxmLnByb3BzLm9uRmlsdGVyLmJpbmQobnVsbCwgaW50ZXJlc3QpfSwgXG4gICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgQmlvRWRpdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQmlvRWRpdG9yJyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGN1cnJlbnRVc2VyOiB0aGlzLnByb3BzLmN1cnJlbnRVc2VyLFxuICAgICAgICBtZW1iZXI6IHRoaXMucHJvcHMubWVtYmVyLFxuICAgICAgICBvcmlnaW5hbEJpbzogdGhpcy5wcm9wcy5vcmlnaW5hbEJpbyxcbiAgICAgICAgZWRpdGluZzogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGFyYW1zID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc2xpY2Uod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignPycpICsgMSkuc3BsaXQoJyYnKTtcblxuICAgICAgaWYgKCF0aGlzLmludHJvZHVjZWQgJiYgcGFyYW1zLmluZGV4T2YoJ2ludHJvZHVjdGlvbj10cnVlJykgPj0gMCkge1xuICAgICAgICB0aGlzLmludHJvZHVjZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm1ha2VFZGl0YWJsZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN1cnJlbnRVc2VyID0gdGhpcy5zdGF0ZS5jdXJyZW50VXNlcjtcbiAgICAgIHZhciBtZW1iZXIgPSB0aGlzLnN0YXRlLm1lbWJlcjtcblxuICAgICAgaWYgKCFtZW1iZXIgfHwgIWN1cnJlbnRVc2VyKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KG51bGwpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3VycmVudFVzZXIuaWQgPT09IG1lbWJlci51c2VyLmlkKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJqcy1lZGl0LWJpb1wiLCBrZXk6ICdiLScgKyBjdXJyZW50VXNlci5pZH0sIFxuICAgICAgICAgICAgICBtZW1iZXIuYmlvLCBcbiAgICAgICAgICAgICAgXCLCoFwiLCB0aGlzLnN0YXRlLmVkaXRpbmcgPyB0aGlzLnNhdmVCdXR0b24oKSA6IHRoaXMuZWRpdEJ1dHRvbigpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2tleTogJ2ItJyArIG1lbWJlci51c2VyLmlkfSwgXG4gICAgICAgICAgbWVtYmVyLmJpb1xuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGVkaXRCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJ0ZXh0LXNtYWxsXCIsIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfSwgb25DbGljazogdGhpcy5tYWtlRWRpdGFibGV9LCBcIuKAlMKgVXBkYXRlIEludHJvXCIpXG4gICAgICApXG4gICAgfSxcblxuICAgIHNhdmVCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIiwgc3R5bGU6IHsnbWFyZ2luLXRvcCc6JzE2cHgnfX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbVwiLCBvbkNsaWNrOiB0aGlzLm1ha2VVbmVkaXRhYmxlLCBzdHlsZTogeydtYXJnaW4tcmlnaHQnIDogJzhweCd9fSwgXCJDYW5jZWxcIiksIFxuICAgICAgICAgIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbVwiLCBvbkNsaWNrOiB0aGlzLnVwZGF0ZUJpb30sIFwiU2F2ZVwiKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIG1ha2VFZGl0YWJsZTogZnVuY3Rpb24oZSkge1xuICAgICAgJCgnI2VkaXQtbWVtYmVyc2hpcC1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG5cbiAgICAgICQoJyNtb2RhbC1iaW8tZWRpdG9yJykudmFsKHRoaXMuc3RhdGUub3JpZ2luYWxCaW8pO1xuICAgIH0sXG5cbiAgICBza2lsbHNPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvcHRpb25zID0gXy5tYXAodGhpcy5wcm9wcy5pbnRlcmVzdEZpbHRlcnMsIGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICAgIGlmIChpbnRlcmVzdCA9PT0gJ2NvcmUnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoUmVhY3QuRE9NLm9wdGlvbih7dmFsdWU6IGludGVyZXN0fSwgJ0AnICsgaW50ZXJlc3QpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9LFxuXG4gICAgbWFrZVVuZWRpdGFibGU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBtZW1iZXIgPSB0aGlzLnN0YXRlLm1lbWJlcjtcbiAgICAgIHZhciBiaW8gPSB0aGlzLnN0YXRlLm9yaWdpbmFsQmlvIHx8IHRoaXMucHJvcHMub3JpZ2luYWxCaW87XG5cbiAgICAgIHRoaXMuc2F2ZShtZW1iZXIsIGJpbywgbWVtYmVyLmludGVyZXN0cyk7XG4gICAgfSxcblxuICAgIHVwZGF0ZUJpbzogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGJpbyA9ICQoJy5iaW8tZWRpdG9yJykudmFsKCk7XG4gICAgICB2YXIgaW50ZXJlc3RzID0gJCgnI2pvaW4taW50ZXJlc3RzJykudmFsKCk7XG4gICAgICB2YXIgbWVtYmVyID0gdGhpcy5zdGF0ZS5tZW1iZXI7XG5cbiAgICAgIHRoaXMuc2F2ZShtZW1iZXIsIGJpbywgaW50ZXJlc3RzKTtcbiAgICB9LFxuXG4gICAgc2F2ZTogZnVuY3Rpb24obWVtYmVyLCBiaW8sIGludGVyZXN0cykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHRoaXMucHJvcHMudXBkYXRlUGF0aCxcbiAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbWVtYmVyc2hpcDoge1xuICAgICAgICAgICAgYmlvOiBiaW8sXG4gICAgICAgICAgICBpbnRlcmVzdHM6IGludGVyZXN0c1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIG1lbWJlci5iaW8gPSBkYXRhLmJpb1xuICAgICAgICAgIG1lbWJlci5pbnRlcmVzdHMgPSBkYXRhLmludGVyZXN0c1xuICAgICAgICAgIHNlbGYuc2V0U3RhdGUoeyBtZW1iZXI6IG1lbWJlciwgZWRpdGluZzogZmFsc2UsIG9yaWdpbmFsQmlvOiBkYXRhLmJpbyB9KVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oZGF0YSwgc3RhdHVzKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihzdGF0dXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGVvcGxlO1xuICB9XG5cbiAgd2luZG93LlBlb3BsZSA9IFBlb3BsZTtcblxuICBmdW5jdGlvbiBfcGFyc2VEYXRlKGRhdGUpIHtcbiAgICB2YXIgcGFyc2VkRGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xuXG4gICAgcmV0dXJuIChwYXJzZWREYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpICsgJy0nICsgcGFyc2VkRGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoKSArICctJyArIHBhcnNlZERhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xuICB9XG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBQZXJzb25QaWNrZXJTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9wZXJzb25fcGlja2VyX3N0b3JlJyk7XG52YXIgQXZhdGFyID0gcmVxdWlyZSgnLi9hdmF0YXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcblxuICB2YXIgUFAgPSBDT05TVEFOVFMuUEVSU09OX1BJQ0tFUjtcblxuICB2YXIga2V5cyA9IHtcbiAgICBlbnRlcjogMTMsXG4gICAgZXNjOiAyNyxcbiAgICB1cDogMzgsXG4gICAgZG93bjogNDBcbiAgfVxuXG4gIHZhciBQZXJzb25QaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdQZXJzb25QaWNrZXInLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyB1c2VyczogW10sIGhpZ2hsaWdodEluZGV4OiAwIH1cbiAgICB9LFxuXG4gICAgY2xlYXJUZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVmcy51c2VybmFtZU9yRW1haWwuZ2V0RE9NTm9kZSgpLnZhbHVlID0gJydcbiAgICAgIHRoaXMuc2V0U3RhdGUodGhpcy5nZXRJbml0aWFsU3RhdGUoKSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7c3R5bGU6IHtwb3NpdGlvbjogJ3JlbGF0aXZlJ319LCBcbiAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe2NsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2wgaW5wdXQtc21cIiwgdHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICAgICByZWY6IFwidXNlcm5hbWVPckVtYWlsXCIsIFxuICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5oYW5kbGVDaGFuZ2UsIFxuICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuaGFuZGxlS2V5LCBcbiAgICAgICAgICAgICAgICAgb25CbHVyOiB0aGlzLnNlbGVjdEN1cnJlbnRVc2VyLCBcbiAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IFwiQHVzZXJuYW1lIG9yIGVtYWlsIGFkZHJlc3NcIn0pLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLnVzZXJzLmxlbmd0aCA+IDAgPyB0aGlzLnVzZXJQaWNrZXIoKSA6IG51bGxcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICB1c2VyUGlja2VyOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIFVzZXJQaWNrZXIoe1xuICAgICAgICB1c2VyczogdGhpcy5zdGF0ZS51c2VycywgXG4gICAgICAgIGhpZ2hsaWdodEluZGV4OiB0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4LCBcbiAgICAgICAgb25Vc2VyU2VsZWN0ZWQ6IHRoaXMuaGFuZGxlVXNlclNlbGVjdGVkfSlcbiAgICB9LFxuXG4gICAgaGFuZGxlQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdGV4dCA9IHRoaXMucmVmcy51c2VybmFtZU9yRW1haWwuZ2V0RE9NTm9kZSgpLnZhbHVlXG4gICAgICBpZih0aGlzLmlzRW1haWwodGV4dCkpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVFbWFpbCh0ZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5oYW5kbGVVc2VybmFtZSh0ZXh0KVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBoYW5kbGVVc2VybmFtZTogZnVuY3Rpb24odGV4dCkge1xuICAgICAgdmFyIHBvc3REYXRhID0ge1xuICAgICAgICBzdWdnZXN0X3VzZXJuYW1lOiB7XG4gICAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgICBjb21wbGV0aW9uOiB7XG4gICAgICAgICAgICBmaWVsZDogJ3N1Z2dlc3RfdXNlcm5hbWUnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHRoaXMucHJvcHMudXJsICsgJy91c2Vycy9fc3VnZ2VzdCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocG9zdERhdGEpLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHVzZXJzID0gXy5tYXAoZGF0YS5zdWdnZXN0X3VzZXJuYW1lWzBdLm9wdGlvbnMsIGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKG9wdGlvbi5wYXlsb2FkLCB7IHVzZXJuYW1lOiBvcHRpb24udGV4dCB9KVxuICAgICAgICAgIH0pXG4gICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jb25zdHJhaW5IaWdobGlnaHQodGhpcy5zdGF0ZS5oaWdobGlnaHRJbmRleClcbiAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsaWRVc2VyQ2hhbmdlZCh1c2Vyc1tpbmRleF0pXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dXNlcnM6IHVzZXJzLCBoaWdobGlnaHRJbmRleDogaW5kZXh9KVxuICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignZXJyb3InLCBhcmd1bWVudHMpXG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZUVtYWlsOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICB0aGlzLnByb3BzLm9uVmFsaWRVc2VyQ2hhbmdlZCh7ZW1haWw6IHRleHR9KVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7dXNlcnM6IFtdfSlcbiAgICB9LFxuXG4gICAgaGFuZGxlS2V5OiBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09IGtleXMudXApIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHRoaXMubW92ZUhpZ2hsaWdodCgtMSlcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09IGtleXMuZG93bikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgdGhpcy5tb3ZlSGlnaGxpZ2h0KDEpXG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PSBrZXlzLmVudGVyKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0aGlzLnNlbGVjdEN1cnJlbnRVc2VyKClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbW92ZUhpZ2hsaWdodDogZnVuY3Rpb24oaW5jKSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmNvbnN0cmFpbkhpZ2hsaWdodCh0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4ICsgaW5jKVxuICAgICAgdGhpcy5wcm9wcy5vblZhbGlkVXNlckNoYW5nZWQodGhpcy5zdGF0ZS4gdXNlcnNbaW5kZXhdKVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhpZ2hsaWdodEluZGV4OiBpbmRleCB9KVxuICAgIH0sXG5cbiAgICBzZWxlY3RDdXJyZW50VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGV4dCA9IHRoaXMucmVmcy51c2VybmFtZU9yRW1haWwuZ2V0RE9NTm9kZSgpLnZhbHVlXG4gICAgICB0aGlzLmNsZWFyVGV4dCgpXG5cbiAgICAgIGlmICh0aGlzLnN0YXRlLnVzZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5zZWxlY3RIaWdobGlnaHQoKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRW1haWwodGV4dCkpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RFbWFpbCh0ZXh0KVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZWxlY3RIaWdobGlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oYW5kbGVVc2VyU2VsZWN0ZWQodGhpcy5zdGF0ZS51c2Vyc1t0aGlzLnN0YXRlLmhpZ2hsaWdodEluZGV4XSlcbiAgICB9LFxuXG4gICAgc2VsZWN0RW1haWw6IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVXNlclNlbGVjdGVkKHtlbWFpbDogZW1haWx9KVxuICAgIH0sXG5cbiAgICBoYW5kbGVVc2VyU2VsZWN0ZWQ6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgIHRoaXMuY2xlYXJUZXh0KClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB1c2VyczogW10gfSlcbiAgICAgIHRoaXMucHJvcHMub25Vc2VyU2VsZWN0ZWQodXNlcilcbiAgICB9LFxuXG4gICAgY29uc3RyYWluSGlnaGxpZ2h0OiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICAwLCBNYXRoLm1pbih0aGlzLnN0YXRlLnVzZXJzLmxlbmd0aCAtIDEsIGluZGV4KVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBpc0VtYWlsOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICByZXR1cm4gL15AP1xcdytALy5leGVjKHRleHQpXG4gICAgfVxuICB9KVxuXG4gIHZhciBVc2VyUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVXNlclBpY2tlcicsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzdHlsZSA9IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICd6LWluZGV4JzogMTAwLFxuICAgICAgICB0b3A6IDI3LFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICBkaXNwbGF5OiAnYmxvY2snXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duLW1lbnVcIiwgc3R5bGU6IHN0eWxlfSwgXG4gICAgICAgICAgdGhpcy5yb3dzKClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICByb3dzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gLTFcbiAgICAgIHJldHVybiBfLm1hcCh0aGlzLnByb3BzLnVzZXJzLCBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgaSArPSAxXG4gICAgICAgIHJldHVybiBVc2VyUGlja2VyRW50cnkoe2tleTogdXNlci51c2VybmFtZSwgdXNlcjogdXNlciwgc2VsZWN0ZWQ6IGkgPT09IHRoaXMucHJvcHMuaGlnaGxpZ2h0SW5kZXgsIG9uVXNlclNlbGVjdGVkOiB0aGlzLnByb3BzLm9uVXNlclNlbGVjdGVkfSlcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9XG4gIH0pXG5cbiAgdmFyIFVzZXJQaWNrZXJFbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1VzZXJQaWNrZXJFbnRyeScsXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjbGFzc05hbWUgPSAndGV4dGNvbXBsZXRlLWl0ZW0nXG4gICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgICBjbGFzc05hbWUgKz0gJyBhY3RpdmUnXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBjbGFzc05hbWV9LCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogJyNAJyArIHRoaXMucHJvcHMudXNlci51c2VybmFtZSwgb25DbGljazogdGhpcy5oYW5kbGVVc2VyU2VsZWN0ZWQodGhpcy5wcm9wcy51c2VyKX0sIFxuICAgICAgICAgICAgQXZhdGFyKHt1c2VyOiB0aGlzLnByb3BzLnVzZXIsIFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7J21hcmdpbi1yaWdodCc6ICcxMHB4J319KSwgXG4gICAgICAgICAgICBcIkBcIiwgdGhpcy5wcm9wcy51c2VyLnVzZXJuYW1lLCBcIiBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCB0aGlzLnByb3BzLnVzZXIubmFtZSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgaGFuZGxlVXNlclNlbGVjdGVkOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25Vc2VyU2VsZWN0ZWQodXNlcilcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQZXJzb25QaWNrZXI7XG4gIH1cblxuICB3aW5kb3cuUGVyc29uUGlja2VyID0gUGVyc29uUGlja2VyO1xuXG59KSgpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFBvcG92ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdQb3BvdmVyJyxcbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgIHBsYWNlbWVudDogUmVhY3QuUHJvcFR5cGVzLm9uZU9mKFsndG9wJywncmlnaHQnLCAnYm90dG9tJywgJ2xlZnQnXSksXG4gICAgICBwb3NpdGlvbkxlZnQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgICBwb3NpdGlvblRvcDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIGFycm93T2Zmc2V0TGVmdDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIGFycm93T2Zmc2V0VG9wOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgdGl0bGU6IFJlYWN0LlByb3BUeXBlcy5yZW5kZXJhYmxlXG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcGxhY2VtZW50OiAncmlnaHQnXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjbGFzc2VzID0ge1xuICAgICAgICBwb3BvdmVyOiB0cnVlLFxuICAgICAgICBpbjogdGhpcy5wcm9wcy5wb3NpdGlvbkxlZnQgIT0gbnVsbCB8fCB0aGlzLnByb3BzLnBvc2l0aW9uVG9wICE9IG51bGxcbiAgICAgIH07XG5cbiAgICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5wbGFjZW1lbnRdID0gdHJ1ZTtcblxuICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICBsZWZ0OiB0aGlzLnByb3BzLnBvc2l0aW9uTGVmdCxcbiAgICAgICAgdG9wOiB0aGlzLnByb3BzLnBvc2l0aW9uVG9wLFxuICAgICAgICBkaXNwbGF5OiAnYmxvY2snXG4gICAgICB9O1xuXG4gICAgICB2YXIgYXJyb3dTdHlsZSA9IHtcbiAgICAgICAgbGVmdDogdGhpcy5wcm9wcy5hcnJvd09mZnNldExlZnQsXG4gICAgICAgIHRvcDogdGhpcy5wcm9wcy5hcnJvd09mZnNldFRvcFxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBSZWFjdC5hZGRvbnMuY2xhc3NTZXQoY2xhc3NlcyksIHN0eWxlOiBzdHlsZX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJhcnJvd1wiLCBzdHlsZTogYXJyb3dTdHlsZX0pLCBcbiAgICAgICAgICB0aGlzLnByb3BzLnRpdGxlID8gdGhpcy5yZW5kZXJUaXRsZSgpIDogbnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBvcG92ZXItY29udGVudFwifSwgXG4gICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICByZW5kZXJUaXRsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uaDMoe2NsYXNzTmFtZTogXCJwb3BvdmVyLXRpdGxlXCJ9LCB0aGlzLnByb3BzLnRpdGxlKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUG9wb3ZlcjtcbiAgfVxuXG4gIHdpbmRvdy5Qb3BvdmVyID0gUG9wb3Zlcjtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFBvcG92ZXIgPSByZXF1aXJlKCcuL3BvcG92ZXIuanMuanN4Jyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIFNoYXJlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU2hhcmUnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBtb2RhbDogZmFsc2UgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wiLCBjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbVwiLCBzdHlsZTogeyd2ZXJ0aWNhbC1hbGlnbic6ICdib3R0b20nfSwgb25DbGljazogdGhpcy50b2dnbGVNb2RhbH0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tc2hhcmUtYWx0XCIsIHN0eWxlOiB7XCJtYXJnaW4tcmlnaHRcIjogMn19KSwgXG4gICAgICAgICAgICBcIlNoYXJlXCJcbiAgICAgICAgICApLCBcbiAgICAgICAgICB0aGlzLnN0YXRlLm1vZGFsID8gdGhpcy5wb3BvdmVyKCkgOiBudWxsXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgdG9nZ2xlTW9kYWw6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kYWw6ICF0aGlzLnN0YXRlLm1vZGFsfSlcbiAgICB9LFxuXG4gICAgcG9wb3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBQb3BvdmVyKHtwbGFjZW1lbnQ6IFwiYm90dG9tXCIsIHBvc2l0aW9uTGVmdDogNDQwLCBwb3NpdGlvblRvcDogMzAsIHRpdGxlOiB0aGlzLnByb3BzLnRpdGxlfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibGlzdCBsaXN0LXVuc3R5bGVkXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7c3R5bGU6IHtcIm1hcmdpbi1ib3R0b21cIjogMTB9fSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2wtbWQtNlwifSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcImJ0biBidG4tdHdpdHRlciBidG4tYmxvY2tcIiwgb25DbGljazogdGhpcy5oYW5kbGVUd2l0dGVyQ2xpY2t9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJpY29uIGljb24tdHdpdHRlclwiLCBzdHlsZTogeydtYXJnaW4tcmlnaHQnOiAyfX0pLCBcbiAgICAgICAgICAgICAgICAgICAgXCJUd2l0dGVyXCJcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sLW1kLTZcIn0sIFxuICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJidG4gYnRuLWZhY2Vib29rIGJ0bi1ibG9ja1wiLCBocmVmOiBcIiNcIiwgb25DbGljazogdGhpcy5oYW5kbGVGYWNlYm9va0NsaWNrfSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiaWNvbiBpY29uLWZhY2Vib29rXCIsIHN0eWxlOiB7J21hcmdpbi1yaWdodCc6IDJ9fSksIFxuICAgICAgICAgICAgICAgICAgICBcIkZhY2Vib29rXCJcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgICBDb3B5TGluayh7dXJsOiB0aGlzLnByb3BzLnVybH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGhhbmRsZVR3aXR0ZXJDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cub3BlbignaHR0cDovL3R3aXR0ZXIuY29tL3NoYXJlP3VybD0nICsgdGhpcy5wcm9wcy51cmwgKyAnJnRleHQ9JyArIHRoaXMucHJvcHMuc2hhcmVUZXh0ICsgJyYnLCAndHdpdHRlcndpbmRvdycsICdoZWlnaHQ9NDUwLCB3aWR0aD01NTAsIHRvcD0nKygkKHdpbmRvdykuaGVpZ2h0KCkvMiAtIDIyNSkgKycsIGxlZnQ9JyskKHdpbmRvdykud2lkdGgoKS8yICsnLCB0b29sYmFyPTAsIGxvY2F0aW9uPTAsIG1lbnViYXI9MCwgZGlyZWN0b3JpZXM9MCwgc2Nyb2xsYmFycz0wJyk7XG4gICAgfSxcblxuICAgIGhhbmRsZUZhY2Vib29rQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgRkIudWkoe1xuICAgICAgICBtZXRob2Q6ICdzaGFyZScsXG4gICAgICAgIGhyZWY6IHRoaXMucHJvcHMudXJsLFxuICAgICAgfSwgZnVuY3Rpb24ocmVzcG9uc2Upe30pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIENvcHlMaW5rID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ29weUxpbmsnLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBsYWJlbDogJ0NvcHknIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJpbnB1dC1ncm91cFwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtyZWY6IFwidGV4dFwiLCB0eXBlOiBcInRleHRcIiwgY2xhc3NOYW1lOiBcImZvcm0tY29udHJvbFwiLCBpZDogXCJzaGFyZS11cmxcIiwgdmFsdWU6IHRoaXMucHJvcHMudXJsfSksIFxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXAtYnRuXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe3JlZjogXCJjb3B5XCIsIGNsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgdHlwZTogXCJidXR0b25cIn0sIHRoaXMuc3RhdGUubGFiZWwpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgdmFyIGNsaWVudCA9IG5ldyBaZXJvQ2xpcGJvYXJkKHRoaXMucmVmcy5jb3B5LmdldERPTU5vZGUoKSlcbiAgICAgIGNsaWVudC5vbigncmVhZHknLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjbGllbnQub24oJ2NvcHknLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuc2V0RGF0YSgndGV4dC9wbGFpbicsIHNlbGYucHJvcHMudXJsKVxuICAgICAgICB9KTtcblxuICAgICAgICBjbGllbnQub24oJ2FmdGVyY29weScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7bGFiZWw6ICdDb3BpZWQhJ30pXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuc2V0U3RhdGUoe2xhYmVsOiAnQ29weSd9KVxuICAgICAgICAgIH0sIDEwMDApXG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gU2hhcmU7XG4gIH1cblxuICB3aW5kb3cuU2hhcmUgPSBTaGFyZTtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpO1xudmFyIFRhZ0xpc3RTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy90YWdfbGlzdF9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBUQyA9IENPTlNUQU5UUy5URVhUX0NPTVBMRVRFO1xuICB2YXIgVEFHX0xJU1QgPSBDT05TVEFOVFMuVEFHX0xJU1Q7XG5cbiAgdmFyIFRhZ0xpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdUYWdMaXN0JyxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFnczogdGhpcy5wcm9wcy50YWdzXG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5kZXN0aW5hdGlvbikge1xuICAgICAgICBUYWdMaXN0U3RvcmUuc2V0VGFncyh0aGlzLnByb3BzLnRhZ3MpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibGlzdC1pbmxpbmUgb21lZ2FcIn0sIFxuICAgICAgICAgIHRoaXMudGFncyh0aGlzLnN0YXRlLnRhZ3MpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHRhZ3M6IGZ1bmN0aW9uKHRhZ3MpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBhZGRlZFRhZ3MgPSBUYWdMaXN0U3RvcmUuZ2V0VGFncygpO1xuXG4gICAgICB2YXIgbWFwcGVkVGFncyA9IF8ubWFwKHRhZ3MsIGZ1bmN0aW9uKHRhZykge1xuICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICcxNHB4JyxcbiAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJ1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghc2VsZi5wcm9wcy5kZXN0aW5hdGlvbiAmJiBhZGRlZFRhZ3MuaW5kZXhPZih0YWcpID49IDApIHtcbiAgICAgICAgICBzdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgICAgc3R5bGUuY29sb3IgPSAnI2QzZDNkMyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRhZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLnByb3BzLmFsbG93UmVtb3ZhbCkge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkoe3N0eWxlOiB7J21hcmdpbic6ICcwcHgnfX0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7c3R5bGU6IHN0eWxlfSwgdGFnKSwgUmVhY3QuRE9NLnNwYW4obnVsbCwgUmVhY3QuRE9NLmEoe3N0eWxlOiB7J21hcmdpbi1sZWZ0JzogJzJweCcsICdmb250LXNpemUnOiAnMTBweCcsIGN1cnNvcjogJ3BvaW50ZXInfSwgb25DbGljazogc2VsZi5oYW5kbGVDbGljayh0YWcpfSwgXCLDl1wiKSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00ubGkoe3N0eWxlOiB7J21hcmdpbic6ICcwcHgnfX0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe3N0eWxlOiBzdHlsZSwgaHJlZjogc2VsZi5wcm9wcy5maWx0ZXJVcmwgPyBzZWxmLnByb3BzLmZpbHRlclVybCArICc/dGFnPScgKyB0YWcgOiAnamF2YXNjcmlwdDp2b2lkKDApOycsIG9uQ2xpY2s6IHNlbGYuaGFuZGxlQ2xpY2sodGFnKX0sIHRhZylcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgLy8gRklYTUU6IFdoZW4gdGhlcmUgYXJlIG5vIHRhZ3MsIHRoZSBjbGllbnQganVzdCByZWNlaXZlcyBbXCJcIl0sIHdoaWNoIHJlcXVpcmVzIHdlaXJkIGNoZWNrcyBsaWtlIHRoaXMuXG4gICAgICBpZiAodGhpcy5wcm9wcy5kZXN0aW5hdGlvbiAmJlxuICAgICAgICAgIChfLmlzRW1wdHkobWFwcGVkVGFncykgfHxcbiAgICAgICAgICAgIChtYXBwZWRUYWdzWzBdID09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgIG1hcHBlZFRhZ3NbMV0gPT0gdW5kZWZpbmVkKSkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00ubGkoe3N0eWxlOiB7Y29sb3I6ICcjZDNkM2QzJywgJ2ZvbnQtc2l6ZSc6ICcxM3B4J319LCBcIk5vIHRhZ3MgeWV0IOKAlCB3aHkgbm90IGFkZCBzb21lP1wiKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWFwcGVkVGFncztcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgVGFnTGlzdFN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMub25DaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGFncyA9IFRhZ0xpc3RTdG9yZS5nZXRUYWdzKCk7XG5cbiAgICAgIGlmICh0aGlzLnByb3BzLmRlc3RpbmF0aW9uKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHRhZ3M6IHRhZ3NcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHRhZ0xpc3RIYWNrID0gJCgnI3RhZy1saXN0LWhhY2snKTtcblxuICAgICAgICBpZiAodGFnTGlzdEhhY2subGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKF8uaXNFbXB0eSh0YWdzKSkge1xuICAgICAgICAgICAgdGFnTGlzdEhhY2suZW1wdHkoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0YWdMaXN0SGFjay52YWwoKTtcblxuICAgICAgICAgICQodGFnTGlzdEhhY2spLmFwcGVuZChfLm1hcCh0YWdzLCBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgICAgIGlmICgoc2VsZWN0ZWQgJiYgc2VsZWN0ZWQuaW5kZXhPZih0YWcpID09PSAtMSkgfHwgIXNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnPG9wdGlvbiB2YWx1ZT0nICsgdGFnICsgJyBzZWxlY3RlZD1cInRydWVcIj4nICsgdGFnICsgJzwvb3B0aW9uPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB0YWdzOiB0aGlzLnByb3BzLnRhZ3NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhhbmRsZUNsaWNrOiBmdW5jdGlvbih0YWcpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMucHJvcHMuZGVzdGluYXRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmFsbG93UmVtb3ZhbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IFRBR19MSVNULkFDVElPTlMuUkVNT1ZFX1RBRyxcbiAgICAgICAgICAgIGRhdGE6IHsgdGFnOiB0YWcsIHVybDogc2VsZi5wcm9wcy51cmwgfSxcbiAgICAgICAgICAgIGV2ZW50OiBUQUdfTElTVC5FVkVOVFMuVEFHX1JFTU9WRURcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgRGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgYWN0aW9uOiBUQUdfTElTVC5BQ1RJT05TLkFERF9UQUcsXG4gICAgICAgICAgZGF0YTogeyB0YWc6IHRhZywgdXJsOiBzZWxmLnByb3BzLnVybCB9LFxuICAgICAgICAgIGV2ZW50OiBUQUdfTElTVC5FVkVOVFMuVEFHX0FEREVEICsgJy10cnVlJ1xuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICB0YWdzOiBzZWxmLnN0YXRlLnRhZ3NcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUYWdMaXN0O1xuICB9XG5cbiAgd2luZG93LlRhZ0xpc3QgPSBUYWdMaXN0O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBUaW1lc3RhbXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdUaW1lc3RhbXAnLFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLnRpbWVhZ28oKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkudGltZWFnbygnZGlzcG9zZScpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnRpbWUoe2NsYXNzTmFtZTogXCJ0aW1lc3RhbXBcIiwgZGF0ZVRpbWU6IHRoaXMucHJvcHMudGltZX0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUaW1lc3RhbXA7XG4gIH1cblxuICB3aW5kb3cuVGltZXN0YW1wID0gVGltZXN0YW1wO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgQ09JTl9JTkNSRU1FTlQgPSAxMDBcbiAgREVCT1VOQ0VfVElNRU9VVCA9IDIwMDBcblxuICB2YXIgVGlwc1VpID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVGlwc1VpJyxcbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN1cnJlbnRVc2VyID0gYXBwLmN1cnJlbnRVc2VyKClcbiAgICAgIGlmIChjdXJyZW50VXNlcikge1xuICAgICAgICBjdXJyZW50VXNlciA9IGN1cnJlbnRVc2VyLmF0dHJpYnV0ZXNcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVudFVzZXI6IGN1cnJlbnRVc2VyLFxuICAgICAgICB1cmw6IGFwcC5wcm9kdWN0LmdldCgndXJsJykgKyAnL3RpcHMnXG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXBzOiBfLnJlZHVjZSh0aGlzLnByb3BzLnRpcHMsIGZ1bmN0aW9uKGgsIHRpcCkgeyBoW3RpcC5mcm9tLmlkXSA9IHRpcDsgcmV0dXJuIGggfSwge30pLFxuICAgICAgICB1c2VyQ2VudHM6IGFwcC5jdXJyZW50UHJvZHVjdEJhbGFuY2UoKSxcbiAgICAgICAgcGVuZGluZ0NlbnRzOiAwXG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcy5yZWZzLmJ1dHRvbi5nZXRET01Ob2RlKCkpLnRvb2x0aXAoKVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRvdGFsQ2VudHMgPSB0aGlzLnRvdGFsQ2VudHMoKVxuXG4gICAgICB2YXIgdG9vbHRpcCA9IG51bGxcbiAgICAgIGlmICh0aGlzLnByb3BzLmN1cnJlbnRVc2VyID09IG51bGwpIHtcbiAgICAgICAgdG9vbHRpcCA9ICdZb3UgbmVlZCB0byBzaWduIHVwIGJlZm9yZSB5b3UgY2FuIHRpcCdcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS51c2VyQ2VudHMgPD0gMCkge1xuICAgICAgICB0b29sdGlwID0gJ1lvdSBoYXZlIG5vIGNvaW5zIHRvIHRpcCdcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50VXNlcklzUmVjaXBpZW50KCkpIHtcbiAgICAgICAgdG9vbHRpcCA9IFwiWW91IGNhbid0IHRpcCB5b3Vyc2VsZlwiXG4gICAgICB9XG5cbiAgICAgIHZhciB0aXBwZXJzID0gbnVsbFxuICAgICAgaWYgKHRvdGFsQ2VudHMgPiAwKSB7XG4gICAgICAgIHRpcHBlcnMgPSBUaXBwZXJzKHt0aXBzOiB0aGlzLnRpcHMoKX0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJqcy10aXBzXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IHRvdGFsQ2VudHMgPiAwID8gJ3RleHQtY29pbnMnIDogbnVsbH0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe3JlZjogXCJidXR0b25cIiwgaHJlZjogXCJqYXZhc2NyaXB0OjtcIiwgJ2RhdGEtcGxhY2VtZW50JzogXCJ0b3BcIiwgJ2RhdGEtdG9nZ2xlJzogXCJ0b29sdGlwXCIsIHRpdGxlOiB0b29sdGlwLCBvbkNsaWNrOiB0aGlzLmN1cnJlbnRVc2VyQ2FuVGlwKCkgPyB0aGlzLmhhbmRsZUNsaWNrIDogbnVsbH0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1hcHAtY29pblwifSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCBcIiBcIiwgbnVtZXJhbCh0aGlzLnRvdGFsQ2VudHMoKSAvIDEwMCkuZm9ybWF0KCcwLDAnKSlcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgdGlwcGVyc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBvcHRpbWlzdGljVGlwOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB1cGRhdGUgPSB7IHBlbmRpbmdDZW50czogeyAkc2V0OiB0aGlzLnN0YXRlLnBlbmRpbmdDZW50cyArIENPSU5fSU5DUkVNRU5UIH0sIHRpcHM6IHt9fVxuXG4gICAgICB2YXIgdGlwID0gdGhpcy5zdGF0ZS50aXBzW3RoaXMucHJvcHMuY3VycmVudFVzZXIuaWRdXG4gICAgICBpZiAodGlwKSB7XG4gICAgICAgIHVwZGF0ZS50aXBzW3RoaXMucHJvcHMuY3VycmVudFVzZXIuaWRdID0geyAkbWVyZ2U6IHsgY2VudHM6IHRpcC5jZW50cyArIENPSU5fSU5DUkVNRU5UIH0gfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXBkYXRlLnRpcHNbdGhpcy5wcm9wcy5jdXJyZW50VXNlci5pZF0gPSB7ICRzZXQ6IHsgZnJvbTogdGhpcy5wcm9wcy5jdXJyZW50VXNlciwgY2VudHM6IENPSU5fSU5DUkVNRU5UIH0gfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKFJlYWN0LmFkZG9ucy51cGRhdGUodGhpcy5zdGF0ZSwgdXBkYXRlKSlcbiAgICB9LFxuXG4gICAgc2F2ZTogXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICB1cmw6IHRoaXMucHJvcHMudXJsLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgdGlwOiB7XG4gICAgICAgICAgICBhZGQ6IHRoaXMuc3RhdGUucGVuZGluZ0NlbnRzLFxuICAgICAgICAgICAgdmlhX3R5cGU6IHRoaXMucHJvcHMudmlhVHlwZSxcbiAgICAgICAgICAgIHZpYV9pZDogdGhpcy5wcm9wcy52aWFJZFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3BlbmRpbmdDZW50czogMH0pXG4gICAgICB9LmJpbmQodGhpcyl9KVxuICAgIH0sIERFQk9VTkNFX1RJTUVPVVQpLFxuXG4gICAgaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vcHRpbWlzdGljVGlwKClcbiAgICAgIHRoaXMuc2F2ZSgpXG4gICAgfSxcblxuICAgIGN1cnJlbnRVc2VyQ2FuVGlwOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLnVzZXJDZW50cyA+IDAgJiYgIXRoaXMuY3VycmVudFVzZXJJc1JlY2lwaWVudCgpXG4gICAgfSxcblxuICAgIGN1cnJlbnRVc2VySXNSZWNpcGllbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY3VycmVudFVzZXIuaWQgPT0gdGhpcy5wcm9wcy5yZWNpcGllbnQuaWRcbiAgICB9LFxuXG4gICAgdG90YWxDZW50czogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5yZWR1Y2UoXy5tYXAodGhpcy50aXBzKCksIGZ1bmMuZG90KCdjZW50cycpKSwgZnVuYy5hZGQsIDApXG4gICAgfSxcblxuICAgIHRpcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8udmFsdWVzKHRoaXMuc3RhdGUudGlwcylcbiAgICB9XG4gIH0pXG5cbiAgdmFyIFRpcHBlcnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdUaXBwZXJzJyxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0ZXh0LW11dGVkXCJ9LCBcIuKAlCB0aXBwZWQgYnkgwqBcIiwgXG4gICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibGlzdC1pbmxpbmUtbWVkaWFcIn0sIFxuICAgICAgICAgICAgXy5tYXAodGhpcy5wcm9wcy50aXBzLCB0aGlzLnJvdylcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgcm93OiBmdW5jdGlvbih0aXApIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5saSh7a2V5OiB0aXAuZnJvbS5pZH0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiBcImltZy1jaXJjbGVcIiwgXG4gICAgICAgICAgICBzcmM6IHRpcC5mcm9tLmF2YXRhcl91cmwsIFxuICAgICAgICAgICAgYWx0OiAnQCcgKyB0aXAuZnJvbS51c2VybmFtZSwgXG4gICAgICAgICAgICAnZGF0YS10b2dnbGUnOiBcInRvb2x0aXBcIiwgXG4gICAgICAgICAgICAnZGF0YS1wbGFjZW1lbnQnOiBcInRvcFwiLCBcbiAgICAgICAgICAgIHRpdGxlOiAnQCcgKyB0aXAuZnJvbS51c2VybmFtZSwgXG4gICAgICAgICAgICB3aWR0aDogXCIxNlwiLCBoZWlnaHQ6IFwiMTZcIn0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGlwc1VpO1xuICB9XG4gIFxuICB3aW5kb3cuVGlwc1VpID0gVGlwc1VpO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgQ09OU1RBTlRTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XG52YXIgQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9jaGF0X25vdGlmaWNhdGlvbnNfc3RvcmUnKTtcbnZhciBOZXdzRmVlZFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBUaXRsZU5vdGlmaWNhdGlvbnNDb3VudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1RpdGxlTm90aWZpY2F0aW9uc0NvdW50JyxcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgQ2hhdE5vdGlmaWNhdGlvbnNTdG9yZS5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLnNldFRpdGxlKTtcbiAgICAgIE5ld3NGZWVkU3RvcmUuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5zZXRUaXRsZSk7XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogZG9jdW1lbnQudGl0bGVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb3VudDogMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uc3BhbihudWxsKTtcbiAgICB9LFxuXG4gICAgc2V0VGl0bGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNoYXRDb3VudCA9IENoYXROb3RpZmljYXRpb25zU3RvcmUuZ2V0VW5yZWFkQ291bnQobG9jYWxTdG9yYWdlLmNoYXRBY2spIHx8IDA7XG4gICAgICB2YXIgbmV3c0NvdW50ID0gTmV3c0ZlZWRTdG9yZS5nZXRVbnJlYWRDb3VudChsb2NhbFN0b3JhZ2UubmV3c0ZlZWRBY2spIHx8IDA7XG5cbiAgICAgIHZhciB0b3RhbCA9IGNoYXRDb3VudCArIG5ld3NDb3VudDtcblxuICAgICAgZG9jdW1lbnQudGl0bGUgPSB0b3RhbCA+IDAgP1xuICAgICAgICAnKCcgKyB0b3RhbCArICcpICcgKyB0aGlzLnByb3BzLnRpdGxlIDpcbiAgICAgICAgdGhpcy5wcm9wcy50aXRsZTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVGl0bGVOb3RpZmljYXRpb25zQ291bnQ7XG4gIH1cblxuICB3aW5kb3cuVGl0bGVOb3RpZmljYXRpb25zQ291bnQgPSBUaXRsZU5vdGlmaWNhdGlvbnNDb3VudDtcbn0pKCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgVXJnZW5jeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1VyZ2VuY3knLFxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBsYWJlbDogdGhpcy5wcm9wcy5pbml0aWFsTGFiZWwgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImRyb3Bkb3duXCIsIHN0eWxlOiB7XCJkaXNwbGF5XCI6XCJpbmxpbmUtYmxvY2tcIn19LCBcbiAgICAgICAgICBSZWFjdC5ET00uYSh7J2RhdGEtdG9nZ2xlJzogXCJkcm9wZG93blwiLCBocmVmOiBcIiNcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5sYWJlbENsYXNzKHRoaXMuc3RhdGUubGFiZWwpfSwgdGhpcy5zdGF0ZS5sYWJlbClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51XCJ9LCBcbiAgICAgICAgICAgIHRoaXMubGlzdEl0ZW1zKClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgbGlzdEl0ZW1zOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnVyZ2VuY2llcy5tYXAoZnVuY3Rpb24odSl7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtrZXk6IHV9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtvbkNsaWNrOiB0aGlzLnVwZGF0ZVVyZ2VuY3kodSl9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5sYWJlbENsYXNzKHUpfSwgdSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgdXBkYXRlVXJnZW5jeTogZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bGFiZWw6IGxhYmVsfSlcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICB1cmw6IHRoaXMucHJvcHMudXJsLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgdHlwZTogJ1BBVENIJyxcbiAgICAgICAgICBkYXRhOiB7IHVyZ2VuY3k6IGxhYmVsLnRvTG93ZXJDYXNlKCkgfVxuICAgICAgICB9KTtcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0sXG5cbiAgICBsYWJlbENsYXNzOiBmdW5jdGlvbih1cmdlbmN5KSB7XG4gICAgICByZXR1cm4gXCJsYWJlbCBsYWJlbC1cIiArIHVyZ2VuY3kudG9Mb3dlckNhc2UoKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBVcmdlbmN5O1xuICB9XG5cbiAgd2luZG93LlVyZ2VuY3kgPSBVcmdlbmN5O1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBVc2VyTmF2YmFyRHJvcGRvd24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdVc2VyTmF2YmFyRHJvcGRvd24nLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJkcm9wZG93bi1tZW51XCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdGhpcy5wcm9wcy51c2VyUGF0aH0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi11c2VyIGRyb3Bkb3duLWdseXBoXCJ9KSwgXG4gICAgICAgICAgICAgIFwiUHJvZmlsZVwiXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogdGhpcy5wcm9wcy5lZGl0VXNlclBhdGh9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJpY29uIGljb24tc2V0dGluZ3MgZHJvcGRvd24tZ2x5cGhcIn0pLCBcbiAgICAgICAgICAgICAgXCJTZXR0dGluZ3NcIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiZGl2aWRlclwifSksIFxuXG4gICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IHRoaXMucHJvcHMuZGVzdHJveVVzZXJTZXNzaW9uUGF0aCwgJ2RhdGEtbWV0aG9kJzogXCJkZWxldGVcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImljb24gaWNvbi1sb2dvdXQgZHJvcGRvd24tZ2x5cGhcIn0pLCBcbiAgICAgICAgICAgICAgXCJMb2cgb3V0XCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFVzZXJOYXZiYXJEcm9wZG93bjtcbiAgfVxuICBcbiAgd2luZG93LlVzZXJOYXZiYXJEcm9wZG93biA9IFVzZXJOYXZiYXJEcm9wZG93bjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBDT05TVEFOVFMgPSB7XG4gICAgQ0hBVF9OT1RJRklDQVRJT05TOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFDS05PV0xFREdFOiAnY2hhdDphY2tub3dsZWRnZScsXG4gICAgICAgIEZFVENIX0NIQVRfUk9PTVM6ICdjaGF0OmZldGNoQ2hhdFJvb21zJyxcbiAgICAgICAgTUFSS19ST09NX0FTX1JFQUQ6ICdjaGF0Om1hcmtSb29tQXNSZWFkJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBBQ0tOT1dMRURHRUQ6ICdjaGF0OmFja25vd2xlZGdlZCcsXG4gICAgICAgIENIQVRfUk9PTVNfRkVUQ0hFRDogJ2NoYXQ6Y2hhdFJvb21zRmV0Y2hlZCcsXG4gICAgICAgIENIQVRfUk9PTV9SRUFEOiAnY2hhdDpjaGF0Um9vbVJlYWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIENPSU5fT1dORVJTSElQOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFERF9VU0VSOiAnYWRkVXNlcicsXG4gICAgICAgIFJFTU9WRV9VU0VSOiAncmVtb3ZlVXNlcicsXG4gICAgICAgIFVQREFURV9VU0VSOiAndXBkYXRlVXNlcidcbiAgICAgIH0sXG4gICAgICBFVkVOVFM6IHtcbiAgICAgICAgVVNFUl9BRERFRDogJ2NvaW5Pd25lcnNoaXA6dXNlckFkZGVkJyxcbiAgICAgICAgVVNFUl9SRU1PVkVEOiAnY29pbk93bmVyc2hpcDp1c2VyUmVtb3ZlZCcsXG4gICAgICAgIFVTRVJfVVBEQVRFRDogJ2NvaW5Pd25lcnNoaXA6dXNlclVwZGF0ZWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIElOVEVSRVNUX1BJQ0tFUjoge1xuICAgICAgQUNUSU9OUzoge1xuICAgICAgICBBRERfSU5URVJFU1Q6ICdhZGRJbnRlcmVzdCcsXG4gICAgICAgIFJFTU9WRV9JTlRFUkVTVDogJ3JlbW92ZUludGVyZXN0JyxcbiAgICAgICAgUE9QOiAncG9wJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBJTlRFUkVTVF9BRERFRDogJ2ludGVyZXN0UGlja2VyOmludGVyZXN0QWRkZWQnLFxuICAgICAgICBJTlRFUkVTVF9SRU1PVkVEOiAnaW50ZXJlc3RQaWNrZXI6aW50ZXJlc3RSZW1vdmVkJyxcbiAgICAgICAgUE9QUEVEOiAnaW50ZXJlc3RQaWNrZXI6cG9wcGVkJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBORVdTX0ZFRUQ6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUNLTk9XTEVER0U6ICduZXdzRmVlZDphY2tub3dsZWRnZScsXG4gICAgICAgIEZFVENIX1NUT1JJRVM6ICduZXdzRmVlZDpmZXRjaFN0b3JpZXMnLFxuICAgICAgICBGRVRDSF9NT1JFX1NUT1JJRVM6ICduZXdzRmVlZDpmZXRjaE1vcmVTdG9yaWVzJyxcbiAgICAgICAgTUFSS19BU19SRUFEOiAnbmV3c0ZlZWQ6bWFya0FzUmVhZCcsXG4gICAgICAgIE1BUktfQUxMX0FTX1JFQUQ6ICduZXdzRmVlZDptYXJrQWxsQXNSZWFkJyxcbiAgICAgICAgTUFSS19TVE9SWV9BU19SRUFEOiAnbmV3c0ZlZWQ6bWFya1N0b3J5QXNSZWFkJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBBQ0tOT1dMRURHRUQ6ICduZXdzRmVlZDphY2tub3dsZWRnZWQnLFxuICAgICAgICBSRUFEOiAnbmV3c0ZlZWQ6cmVhZCcsXG4gICAgICAgIFJFQURfQUxMOiAnbmV3c0ZlZWQ6cmVhZEFsbCcsXG4gICAgICAgIFNUT1JJRVNfRkVUQ0hFRDogJ25ld3NGZWVkOnN0b3JpZXNGZXRjaGVkJyxcbiAgICAgICAgU1RPUllfUkVBRDogJ25ld3NGZWVkOnN0b3J5UmVhZCdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgTk9USUZJQ0FUSU9OX1BSRUZFUkVOQ0VTX0RST1BET1dOOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIFVQREFURV9TRUxFQ1RFRDogJ3VwZGF0ZVNlbGVjdGVkJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBTRUxFQ1RFRF9VUERBVEVEOiAnbm90aWZpY2F0aW9uUHJlZmVyZW5jZXNEcm9wZG93bjpzZWxlY3RlZFVwZGF0ZWQnXG4gICAgICB9XG4gICAgfSxcblxuICAgIFBFUlNPTl9QSUNLRVI6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUREX1VTRVI6ICdhZGRQaWNrZWRVc2VyJyxcbiAgICAgICAgUkVNT1ZFX1VTRVI6ICdyZW1vdmVQaWNrZWRVc2VyJyxcbiAgICAgICAgVVBEQVRFX1VTRVI6ICd1cGRhdGVQaWNrZWRVc2VyJ1xuICAgICAgfSxcbiAgICAgIEVWRU5UUzoge1xuICAgICAgICBVU0VSX0FEREVEOiAncGVyc29uUGlja2VyOnVzZXJBZGRlZCcsXG4gICAgICAgIFVTRVJfUkVNT1ZFRDogJ3BlcnNvblBpY2tlcjp1c2VyUmVtb3ZlZCcsXG4gICAgICAgIFVTRVJfVVBEQVRFRDogJ3BlcnNvblBpY2tlcjp1c2VyVXBkYXRlZCdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgVEFHX0xJU1Q6IHtcbiAgICAgIEFDVElPTlM6IHtcbiAgICAgICAgQUREX1RBRzogJ2FkZFRhZycsXG4gICAgICAgIFJFTU9WRV9UQUc6ICdyZW1vdmVUYWcnXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIFRBR19BRERFRDogJ3RleHRDb21wbGV0ZTp0YWdBZGRlZCcsXG4gICAgICAgIFRBR19SRU1PVkVEOiAndGFnTGlzdDp0YWdSZW1vdmVkJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBURVhUX0NPTVBMRVRFOiB7XG4gICAgICBBQ1RJT05TOiB7XG4gICAgICAgIEFERF9UQUc6ICdhZGRUYWcnXG4gICAgICB9LFxuICAgICAgRVZFTlRTOiB7XG4gICAgICAgIERJRF9NT1VOVDogJ3RleHRDb21wbGV0ZTpkaWRNb3VudCcsXG4gICAgICAgIFRBR19BRERFRDogJ3RleHRDb21wbGV0ZTp0YWdBZGRlZCdcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDT05TVEFOVFM7XG4gIH1cblxuICB3aW5kb3cuQ09OU1RBTlRTID0gQ09OU1RBTlRTO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9jYWxsYmFja3MgPSBbXTtcblxuICB2YXIgRGlzcGF0Y2hlciA9IF8uZXh0ZW5kKEZ1bmN0aW9uLnByb3RvdHlwZSwge1xuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgX2NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcblxuICAgICAgLy8gUmV0dXJuaW5nIHRoZSBjYWxsYmFjaydzIGluZGV4IGFsbG93c1xuICAgICAgLy8gZXhwbGljaXQgcmVmZXJlbmNlcyB0byB0aGUgY2FsbGJhY2tcbiAgICAgIC8vIG91dHNpZGUgb2YgdGhlIGRpc3BhdGNoZXJcbiAgICAgIHJldHVybiBfY2FsbGJhY2tzLmxlbmd0aCAtIDE7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoOiBmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgICBpZiAoXy5pc0VtcHR5KF9jYWxsYmFja3MpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBfY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBfY2FsbGJhY2tzW2ldKHBheWxvYWQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICBpZiAoX2NhbGxiYWNrc1tpbmRleF0pIHtcbiAgICAgICAgX2NhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICByZW1vdmVBbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgX2NhbGxiYWNrcyA9IFtdO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEaXNwYXRjaGVyO1xuICB9XG5cbiAgd2luZG93LkRpc3BhdGNoZXIgPSBEaXNwYXRjaGVyO1xufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBEcm9wZG93blRvZ2dsZXJNaXhpbiA9IHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNsYXNzZXMgPSBbJ2ljb24nLCAnbmF2YmFyLWljb24nLCB0aGlzLnByb3BzLmljb25DbGFzc107XG4gICAgICB2YXIgdG90YWwgPSB0aGlzLmJhZGdlQ291bnQoKTtcbiAgICAgIHZhciBiYWRnZSA9IG51bGw7XG5cbiAgICAgIGlmICh0b3RhbCA+IDApIHtcbiAgICAgICAgYmFkZ2UgPSB0aGlzLmJhZGdlKHRvdGFsKTtcbiAgICAgICAgY2xhc3Nlcy5wdXNoKCdnbHlwaGljb24taGlnaGxpZ2h0Jyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiB0aGlzLnByb3BzLmhyZWYsICdkYXRhLXRvZ2dsZSc6IFwiZHJvcGRvd25cIiwgb25DbGljazogdGhpcy5hY2tub3dsZWRnZX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IGNsYXNzZXMuam9pbignICcpfSksIFxuICAgICAgICAgIGJhZGdlLCBcbiAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInZpc2libGUteHMtaW5saW5lXCIsIHN0eWxlOiB7ICdtYXJnaW4tbGVmdCc6ICc1cHgnfX0sIFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5sYWJlbFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBEcm9wZG93blRvZ2dsZXJNaXhpbjtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cuRHJvcGRvd25Ub2dnbGVyTWl4aW4gPSBEcm9wZG93blRvZ2dsZXJNaXhpbjtcbiAgfVxufSkoKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgTmV3c0ZlZWRTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9uZXdzX2ZlZWRfc3RvcmUnKTtcbnZhciBOZXdzRmVlZFVzZXJzU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvbmV3c19mZWVkX3VzZXJzX3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIE5ld3NGZWVkTWl4aW4gPSB7XG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRhcmdldCA9IHRoaXMucmVmcy5zcGlubmVyLmdldERPTU5vZGUoKTtcbiAgICAgIHZhciBvcHRzID0gdGhpcy5zcGlubmVyT3B0aW9ucyB8fCB7XG4gICAgICAgIGxpbmVzOiAxMyxcbiAgICAgICAgbGVuZ3RoOiAzMCxcbiAgICAgICAgcmFkaXVzOiA1NVxuICAgICAgfTtcblxuICAgICAgdmFyIHNwaW5uZXIgPSB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKCk7XG5cbiAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChzcGlubmVyLmVsKTtcbiAgICB9LFxuXG4gICAgZ2V0U3RvcmllczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzdG9yaWVzOiBOZXdzRmVlZFN0b3JlLmdldFN0b3JpZXMoKSxcbiAgICAgICAgYWN0b3JzOiBOZXdzRmVlZFVzZXJzU3RvcmUuZ2V0VXNlcnMoKVxuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzZWxmLnN0YXRlLnN0b3JpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgc2VsZi5zcGlubmVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBOZXdzRmVlZE1peGluO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5OZXdzRmVlZE1peGluID0gTmV3c0ZlZWRNaXhpbjtcbiAgfVxufSkoKTtcbiIsInZhciB4aHIgPSByZXF1aXJlKCcuLi94aHInKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIHJyTWV0YVRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdyZWFkLXJhcHRvci11cmwnKTtcbiAgdmFyIFJFQURfUkFQVE9SX1VSTCA9IHJyTWV0YVRhZyAmJiByck1ldGFUYWdbMF0gJiYgcnJNZXRhVGFnWzBdLmNvbnRlbnQ7XG5cbiAgdmFyIF9jaGF0Um9vbXMgPSB7fTtcbiAgdmFyIF9zb3J0S2V5cyA9IFtdO1xuICB2YXIgX29wdGltaXN0aWNhbGx5VXBkYXRlZENoYXRSb29tcyA9IHt9O1xuICB2YXIgX2RlZmVycmVkID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuICB2YXIgbm9vcCA9IGZ1bmN0aW9uKCkge307XG5cbiAgdmFyIF9ub3RpZmljYXRpb25zU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICAnY2hhdDphY2tub3dsZWRnZSc6IG5vb3AsXG5cbiAgICAnY2hhdDptYXJrUm9vbUFzUmVhZCc6IGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICAgIHdpbmRvdy54aHIubm9Dc3JmR2V0KHBheWxvYWQucmVhZHJhcHRvcl91cmwpO1xuXG4gICAgICBfb3B0aW1pc3RpY2FsbHlVcGRhdGVkQ2hhdFJvb21zW3BheWxvYWQuaWRdID0ge1xuICAgICAgICBsYXN0X3JlYWRfYXQ6IG1vbWVudCgpLnVuaXgoKVxuICAgICAgfTtcblxuICAgICAgdGhpcy5lbWl0KF9kZWZlcnJlZC5wb3AoKSk7XG4gICAgfSxcblxuICAgICdjaGF0OmZldGNoQ2hhdFJvb21zJzogZnVuY3Rpb24odXJsKSB7XG4gICAgICB3aW5kb3cueGhyLmdldCh1cmwsIHRoaXMuaGFuZGxlRmV0Y2hlZENoYXRSb29tcy5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZ2V0VW5yZWFkQ291bnQ6IGZ1bmN0aW9uKGFja25vd2xlZGdlZEF0KSB7XG4gICAgICB2YXIgY291bnQgPSBfLmNvdW50QnkoXG4gICAgICAgIF9jaGF0Um9vbXMsXG4gICAgICAgIGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgICAgaWYgKGFja25vd2xlZGdlZEF0KSB7XG4gICAgICAgICAgICByZXR1cm4gZW50cnkudXBkYXRlZCA+IGFja25vd2xlZGdlZEF0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGNvdW50LnRydWUgfHwgMDtcbiAgICB9LFxuXG4gICAgaGFuZGxlRmV0Y2hlZENoYXRSb29tczogZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNoYXRSb29tcyA9IGRhdGEuY2hhdF9yb29tcztcbiAgICAgIF9zb3J0S2V5cyA9IGRhdGEuc29ydF9rZXlzO1xuXG4gICAgICB2YXIgdXJsID0gUkVBRF9SQVBUT1JfVVJMICtcbiAgICAgICAgJy9yZWFkZXJzLycgK1xuICAgICAgICBhcHAuY3VycmVudFVzZXIoKS5nZXQoJ2lkJykgK1xuICAgICAgICAnL2FydGljbGVzPycgK1xuICAgICAgICBfLm1hcChcbiAgICAgICAgICBjaGF0Um9vbXMsXG4gICAgICAgICAgZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgcmV0dXJuICdrZXk9JyArIHIuaWRcbiAgICAgICAgICB9XG4gICAgICAgICkuam9pbignJicpO1xuXG4gICAgICB3aW5kb3cueGhyLm5vQ3NyZkdldCh1cmwsIHRoaXMuaGFuZGxlUmVhZFJhcHRvcihjaGF0Um9vbXMpKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlUmVhZFJhcHRvcjogZnVuY3Rpb24oY2hhdFJvb21zKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gcmVhZFJhcHRvckNhbGxiYWNrKGVyciwgZGF0YSkge1xuICAgICAgICBpZiAoZXJyKSB7IHJldHVybiBjb25zb2xlLmVycm9yKGVycik7IH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGF0Um9vbXMgPSBfLnJlZHVjZShcbiAgICAgICAgICBjaGF0Um9vbXMsXG4gICAgICAgICAgZnVuY3Rpb24oaCwgY2hhdFJvb20pIHtcbiAgICAgICAgICAgIGhbY2hhdFJvb20uaWRdID0gY2hhdFJvb207XG4gICAgICAgICAgICBoW2NoYXRSb29tLmlkXS5sYXN0X3JlYWRfYXQgPSAwO1xuXG4gICAgICAgICAgICByZXR1cm4gaDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHt9XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5hcHBseVJlYWRUaW1lcyhkYXRhLCBjaGF0Um9vbXMpO1xuICAgICAgICB0aGlzLnNldENoYXRSb29tcyhjaGF0Um9vbXMpO1xuICAgICAgICB0aGlzLmVtaXQoX2RlZmVycmVkLnBvcCgpKTtcbiAgICAgIH0uYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgYXBwbHlSZWFkVGltZXM6IGZ1bmN0aW9uKGRhdGEsIGNoYXRSb29tcykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgZGF0dW0gPSBkYXRhW2ldO1xuXG4gICAgICAgIGlmIChkYXR1bS5sYXN0X3JlYWRfYXQgJiYgY2hhdFJvb21zW2RhdHVtLmtleV0pIHtcbiAgICAgICAgICBjaGF0Um9vbXNbZGF0dW0ua2V5XS5sYXN0X3JlYWRfYXQgPSBkYXR1bS5sYXN0X3JlYWRfYXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0Q2hhdFJvb206IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gX2NoYXRSb29tc1tpZF07XG4gICAgfSxcblxuICAgIGdldENoYXRSb29tczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX2NoYXRSb29tcztcbiAgICB9LFxuXG4gICAgZ2V0U29ydEtleXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9zb3J0S2V5cztcbiAgICB9LFxuXG4gICAgc2V0Q2hhdFJvb21zOiBmdW5jdGlvbihjaGF0Um9vbXMpIHtcbiAgICAgIF9jaGF0Um9vbXMgPSBjaGF0Um9vbXM7XG5cbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKF9vcHRpbWlzdGljYWxseVVwZGF0ZWRDaGF0Um9vbXMpXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKF9jaGF0Um9vbXNba2V5c1tpXV0pIHtcbiAgICAgICAgICBfY2hhdFJvb21zW2tleXNbaV1dID0gXy5leHRlbmQoX2NoYXRSb29tc1trZXlzW2ldXSwgX29wdGltaXN0aWNhbGx5VXBkYXRlZENoYXRSb29tc1trZXlzW2ldXSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBfb3B0aW1pc3RpY2FsbHlVcGRhdGVkQ2hhdFJvb21zID0ge31cbiAgICB9LFxuXG4gICAgcmVtb3ZlQ2hhdFJvb206IGZ1bmN0aW9uKGlkKSB7XG4gICAgICBkZWxldGUgX2NoYXRSb29tc1tpZF1cbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsQ2hhdFJvb21zOiBmdW5jdGlvbigpIHtcbiAgICAgIF9jaGF0Um9vbXMgPSB7fTtcbiAgICB9LFxuXG4gICAgbW9zdFJlY2VudGx5VXBkYXRlZENoYXRSb29tOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChfLmtleXMoX2NoYXRSb29tcykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gXy5tYXgoXy52YWx1ZXMoX2NoYXRSb29tcyksIGZ1bmMuZG90KCd1cGRhdGVkJykpO1xuICAgIH0sXG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG4gICAgdmFyIHN5bmMgPSBwYXlsb2FkLnN5bmM7XG5cbiAgICBpZiAoIV9zdG9yZVthY3Rpb25dKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgX3N0b3JlW2FjdGlvbl0oZGF0YSk7XG5cbiAgICBpZiAoc3luYykge1xuICAgICAgcmV0dXJuIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgICB9XG5cbiAgICBfZGVmZXJyZWQucHVzaChldmVudCk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX25vdGlmaWNhdGlvbnNTdG9yZTtcbiAgfVxuXG4gIHdpbmRvdy5DaGF0Tm90aWZpY2F0aW9uc1N0b3JlID0gX25vdGlmaWNhdGlvbnNTdG9yZTtcbn0pKCk7XG4iLCJ2YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8vIHsgdXNlcjogVXNlciwgY29pbnM6IE51bWJlciB9XG4gIHZhciBfdXNlcnNBbmRDb2lucyA9IFtdO1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcbiAgdmFyIF9jb2luT3duZXJzaGlwU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICBhZGRVc2VyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdXNlckFuZENvaW5zID0gZGF0YS51c2VyQW5kQ29pbnM7XG5cbiAgICAgIGlmIChfc2VhcmNoVXNlcnModXNlckFuZENvaW5zLnVzZXJuYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfdXNlcnNBbmRDb2lucy5wdXNoKHVzZXJBbmRDb2lucyk7XG4gICAgfSxcblxuICAgIGdldFVzZXI6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hVc2VycyhkYXRhLnVzZXJuYW1lKTtcblxuICAgICAgcmV0dXJuIF91c2Vyc0FuZENvaW5zW2luZGV4XTtcbiAgICB9LFxuXG4gICAgZ2V0VXNlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF91c2Vyc0FuZENvaW5zO1xuICAgIH0sXG5cbiAgICB1cGRhdGVVc2VyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdXNlckFuZENvaW5zID0gZGF0YS51c2VyQW5kQ29pbnM7XG4gICAgICB2YXIgaW5kZXggPSBfc2VhcmNoVXNlcnModXNlckFuZENvaW5zLnVzZXJuYW1lKTtcblxuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF91c2Vyc0FuZENvaW5zW2luZGV4XSA9IHVzZXJBbmRDb2lucztcblxuICAgICAgcmV0dXJuIF91c2Vyc0FuZENvaW5zW2luZGV4XTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlVXNlcjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHVzZXJBbmRDb2lucyA9IGRhdGEudXNlckFuZENvaW5zO1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFVzZXJzKHVzZXJBbmRDb2lucy51c2VybmFtZSk7XG5cbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIF91c2Vyc0FuZENvaW5zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldFVzZXJzOiBmdW5jdGlvbih1c2Vycykge1xuICAgICAgX3VzZXJzQW5kQ29pbnMgPSB1c2VycztcbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsVXNlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgX3VzZXJzQW5kQ29pbnMgPSBbXTtcbiAgICB9XG4gIH0pO1xuXG4gIF9zdG9yZS5kaXNwYXRjaEluZGV4ID0gRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uO1xuICAgIHZhciBkYXRhID0gcGF5bG9hZC5kYXRhO1xuICAgIHZhciBldmVudCA9IHBheWxvYWQuZXZlbnQ7XG5cbiAgICBfc3RvcmVbYWN0aW9uXSAmJiBfc3RvcmVbYWN0aW9uXShkYXRhKTtcbiAgICBfc3RvcmUuZW1pdChldmVudCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIF9zZWFyY2hVc2Vycyh1c2VybmFtZSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gX3VzZXJzQW5kQ29pbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgdXNlckFuZENvaW5zID0gX3VzZXJzQW5kQ29pbnNbaV07XG5cbiAgICAgIGlmICh1c2VyQW5kQ29pbnMudXNlcm5hbWUgPT09IHVzZXJuYW1lKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2NvaW5Pd25lcnNoaXBTdG9yZTtcbiAgfVxuXG4gIHdpbmRvdy5Db2luT3duZXJzaGlwU3RvcmUgPSBfY29pbk93bmVyc2hpcFN0b3JlO1xufSkoKTtcbiIsInZhciB4aHIgPSByZXF1aXJlKCcuLi94aHInKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9pbnRlcmVzdHMgPSBbJ2NvZGUnLCAnZGVzaWduJ107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuXG4gIHZhciBfaW50ZXJlc3RTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIGFkZEludGVyZXN0OiBmdW5jdGlvbihpbnRlcmVzdCkge1xuICAgICAgaWYgKCFpbnRlcmVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChfaW50ZXJlc3RzLmluZGV4T2YoaW50ZXJlc3QpICE9PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIF9pbnRlcmVzdHMucHVzaChpbnRlcmVzdCk7XG4gICAgfSxcblxuICAgIGdldEludGVyZXN0czogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX2ludGVyZXN0cztcbiAgICB9LFxuXG4gICAgcmVtb3ZlSW50ZXJlc3Q6IGZ1bmN0aW9uKGludGVyZXN0KSB7XG4gICAgICB2YXIgaW5kZXggPSBfaW50ZXJlc3RzLmluZGV4T2YoaW50ZXJlc3QpO1xuXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBfaW50ZXJlc3RzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHBvcDogZnVuY3Rpb24oKSB7XG4gICAgICBfaW50ZXJlc3RzLnBvcCgpO1xuICAgIH0sXG5cbiAgICBzZXRJbnRlcmVzdHM6IGZ1bmN0aW9uKGludGVyZXN0cykge1xuICAgICAgX2ludGVyZXN0cyA9IGludGVyZXN0cztcbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsSW50ZXJlc3RzOiBmdW5jdGlvbigpIHtcbiAgICAgIF9pbnRlcmVzdHMgPSBbJ2NvZGUnLCAnZGVzaWduJ107XG4gICAgfVxuICB9KTtcblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuXG4gICAgX3N0b3JlW2FjdGlvbl0gJiYgX3N0b3JlW2FjdGlvbl0oZGF0YSk7XG4gICAgX3N0b3JlLmVtaXQoZXZlbnQpO1xuICB9KTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9pbnRlcmVzdFN0b3JlO1xuICB9XG4gIFxuICB3aW5kb3cuSW50ZXJlc3RTdG9yZSA9IF9pbnRlcmVzdFN0b3JlO1xufSkoKTtcbiIsInZhciB4aHIgPSByZXF1aXJlKCcuLi94aHInKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcicpO1xudmFyIFN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL3N0b3JlJyk7XG52YXIgTmV3c0ZlZWRVc2Vyc1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL25ld3NfZmVlZF91c2Vyc19zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciByck1ldGFUYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZSgncmVhZC1yYXB0b3ItdXJsJyk7XG4gIHZhciBSRUFEX1JBUFRPUl9VUkwgPSByck1ldGFUYWcgJiYgcnJNZXRhVGFnWzBdICYmIHJyTWV0YVRhZ1swXS5jb250ZW50O1xuXG4gIHZhciBfc3RvcmllcyA9IHt9O1xuICB2YXIgX29wdGltaXN0aWNTdG9yaWVzID0ge307XG4gIHZhciBfZGVmZXJyZWQgPSBbXTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG5cbiAgdmFyIF9uZXdzRmVlZFN0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgYWRkU3Rvcnk6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBzdG9yeSA9IGRhdGEuc3Rvcnk7XG5cbiAgICAgIF9zdG9yaWVzW3N0b3J5LmtleV0gPSBzdG9yeTtcbiAgICB9LFxuXG4gICAgYWRkU3RvcmllczogZnVuY3Rpb24oc3Rvcmllcykge1xuICAgICAgaWYgKCFzdG9yaWVzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdG9yaWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc3RvcnkgPSBzdG9yaWVzW2ldO1xuXG4gICAgICAgIF9zdG9yaWVzW3N0b3J5LmtleV0gPSBzdG9yeTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYXBwbHlSZWFkVGltZXM6IGZ1bmN0aW9uKGRhdGEsIHN0b3JpZXMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZGF0YS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGRhdHVtID0gZGF0YVtpXTtcblxuICAgICAgICBpZiAoZGF0dW0ubGFzdF9yZWFkX2F0ICYmIHN0b3JpZXNbZGF0dW0ua2V5XSkge1xuICAgICAgICAgIHN0b3JpZXNbZGF0dW0ua2V5XS5sYXN0X3JlYWRfYXQgPSBkYXR1bS5sYXN0X3JlYWRfYXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaGFuZGxlRmV0Y2hlZFN0b3JpZXM6IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVzZXJzID0gZGF0YS51c2VycztcbiAgICAgICAgdmFyIHN0b3JpZXMgPSBkYXRhLnN0b3JpZXM7XG5cbiAgICAgICAgTmV3c0ZlZWRVc2Vyc1N0b3JlLnNldFVzZXJzKHVzZXJzKTtcblxuICAgICAgICB2YXIgdXJsID0gUkVBRF9SQVBUT1JfVVJMICtcbiAgICAgICAgICAnL3JlYWRlcnMvJyArXG4gICAgICAgICAgYXBwLmN1cnJlbnRVc2VyKCkuZ2V0KCdpZCcpICtcbiAgICAgICAgICAnL2FydGljbGVzPycgK1xuICAgICAgICAgIF8ubWFwKFxuICAgICAgICAgICAgc3RvcmllcyxcbiAgICAgICAgICAgIGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdrZXk9U3RvcnlfJyArIHMuaWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApLmpvaW4oJyYnKVxuXG4gICAgICAgIHdpbmRvdy54aHIubm9Dc3JmR2V0KHVybCwgc2VsZi5oYW5kbGVSZWFkUmFwdG9yKHN0b3JpZXMsIG1ldGhvZCkpO1xuICAgICAgfVxuXG4gICAgfSxcblxuICAgIGhhbmRsZVJlYWRSYXB0b3I6IGZ1bmN0aW9uKHN0b3JpZXMsIG1ldGhvZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gcmVhZFJhcHRvckNhbGxiYWNrKGVyciwgZGF0YSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0b3JpZXMgPSBfLnJlZHVjZShcbiAgICAgICAgICBzdG9yaWVzLFxuICAgICAgICAgIGZ1bmN0aW9uKGhhc2gsIHN0b3J5KSB7XG4gICAgICAgICAgICBoYXNoW3N0b3J5LmtleV0gPSBzdG9yeTtcbiAgICAgICAgICAgIGhhc2hbc3Rvcnkua2V5XS5sYXN0X3JlYWRfYXQgPSAwO1xuXG4gICAgICAgICAgICByZXR1cm4gaGFzaDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHt9XG4gICAgICAgICk7XG5cbiAgICAgICAgc2VsZi5hcHBseVJlYWRUaW1lcyhkYXRhLCBzdG9yaWVzKTtcbiAgICAgICAgc2VsZlttZXRob2RdKHN0b3JpZXMpO1xuICAgICAgICBzZWxmLmVtaXQoX2RlZmVycmVkLnBvcCgpKTtcbiAgICAgIH07XG4gICAgfSxcblxuICAgICduZXdzRmVlZDphY2tub3dsZWRnZSc6IGZ1bmN0aW9uKHRpbWVzdGFtcCkge30sXG5cbiAgICAnbmV3c0ZlZWQ6ZmV0Y2hTdG9yaWVzJzogZnVuY3Rpb24odXJsKSB7XG4gICAgICB3aW5kb3cueGhyLmdldCh1cmwsIHRoaXMuaGFuZGxlRmV0Y2hlZFN0b3JpZXMoJ3NldFN0b3JpZXMnKSk7XG4gICAgfSxcblxuICAgICduZXdzRmVlZDpmZXRjaE1vcmVTdG9yaWVzJzogZnVuY3Rpb24odXJsKSB7XG4gICAgICB3aW5kb3cueGhyLmdldCh1cmwsIHRoaXMuaGFuZGxlRmV0Y2hlZFN0b3JpZXMoJ2FkZFN0b3JpZXMnKSk7XG4gICAgfSxcblxuICAgICduZXdzRmVlZDptYXJrQXNSZWFkJzogZnVuY3Rpb24oc3RvcnlJZCkge1xuICAgICAgdmFyIHVybCA9ICcvdXNlci90cmFja2luZy8nICsgc3RvcnlJZDtcblxuICAgICAgd2luZG93Lnhoci5nZXQodXJsLCB0aGlzLm1hcmtlZEFzUmVhZChzdG9yeUlkKSk7XG4gICAgfSxcblxuICAgICduZXdzRmVlZDptYXJrQWxsQXNSZWFkJzogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdW5yZWFkID0gXy5maWx0ZXIoX3N0b3JpZXMsIGZ1bmN0aW9uKHN0b3J5KSB7XG4gICAgICAgIHJldHVybiBzdG9yeS5sYXN0X3JlYWRfYXQgPT0gbnVsbDtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdW5yZWFkLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAoZnVuY3Rpb24oaikge1xuICAgICAgICAgIHZhciBzdG9yeSA9IHVucmVhZFtqXTtcblxuICAgICAgICAgIGlmICghc3RvcnkubGFzdF9yZWFkX2F0KSB7XG4gICAgICAgICAgICAvLyB3ZSBkbyBhY3R1YWxseSB3YW50IHRoZSBpZCBoZXJlLCBub3QgdGhlIGtleVxuICAgICAgICAgICAgdmFyIHN0b3J5SWQgPSBzdG9yeS5pZDtcbiAgICAgICAgICAgIHZhciB1cmwgPSAnL3VzZXIvdHJhY2tpbmcvJyArIHN0b3J5SWQ7XG5cbiAgICAgICAgICAgIHdpbmRvdy54aHIuZ2V0KHVybCwgc2VsZi5tYXJrZWRBc1JlYWQoc3RvcnlJZCwgdHJ1ZSwgKGogKyAxID09PSBsKSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkoaSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgICduZXdzRmVlZDptYXJrU3RvcnlBc1JlYWQnOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgc3RvcnlJZCA9IGRhdGEua2V5O1xuICAgICAgdmFyIHVybCA9IGRhdGEucmVhZHJhcHRvcl91cmw7XG5cbiAgICAgIHdpbmRvdy54aHIubm9Dc3JmR2V0KHVybCk7XG5cbiAgICAgIF9vcHRpbWlzdGljU3Rvcmllc1tzdG9yeUlkXSA9IHtcbiAgICAgICAgbGFzdF9yZWFkX2F0OiBtb21lbnQoKS51bml4KClcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuZW1pdChfZGVmZXJyZWQucG9wKCkpO1xuICAgIH0sXG5cbiAgICBtYXJrZWRBc1JlYWQ6IGZ1bmN0aW9uKHN0b3J5SWQsIHdhaXQsIHJlYWR5KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiBtYXJrZWRBc1JlYWQoZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0b3J5ID0gc2VsZi5nZXRTdG9yeShzdG9yeUlkKTtcblxuICAgICAgICAvLyBGSVhNRTogVXNlIHRoZSB2YWx1ZSBmcm9tIFJlYWRyYXB0b3JcbiAgICAgICAgc3RvcnkubGFzdF9yZWFkX2F0ID0gbW9tZW50KCkudW5peCgpO1xuXG4gICAgICAgIGlmICghd2FpdCkge1xuICAgICAgICAgIHJldHVybiBzZWxmLmVtaXQoX2RlZmVycmVkLnBvcCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZJWE1FOiBXZSByZWFsbHkgbmVlZCBhIHByb3BlciBldmVudCBlbWl0dGVyXG4gICAgICAgIGlmIChyZWFkeSkge1xuICAgICAgICAgIHNlbGYuZW1pdChfZGVmZXJyZWQucG9wKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuZW1pdChfZGVmZXJyZWRbX2RlZmVycmVkLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRTdG9yeTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hTdG9yaWVzKGlkKTtcblxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIF9zdG9yaWVzW2luZGV4XTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIGdldFN0b3JpZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN0b3JpZXMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSBpbiBfc3Rvcmllcykge1xuICAgICAgICBzdG9yaWVzLnB1c2goX3N0b3JpZXNbaV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RvcmllcztcbiAgICB9LFxuXG4gICAgZ2V0VW5yZWFkQ291bnQ6IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgICAgdmFyIGNvdW50ID0gXy5jb3VudEJ5KFxuICAgICAgICBfc3RvcmllcyxcbiAgICAgICAgZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50cnkudXBkYXRlZCA+IHRpbWVzdGFtcFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGNvdW50LnRydWUgfHwgMDtcbiAgICB9LFxuXG4gICAgc2V0U3RvcmllczogZnVuY3Rpb24oc3Rvcmllcykge1xuICAgICAgZm9yICh2YXIgc3RvcnkgaW4gX29wdGltaXN0aWNTdG9yaWVzKSB7XG4gICAgICAgIGlmIChzdG9yaWVzLmhhc093blByb3BlcnR5KHN0b3J5KSkge1xuICAgICAgICAgIHN0b3JpZXNbc3RvcnldLmxhc3RfcmVhZF9hdCA9IF9vcHRpbWlzdGljU3Rvcmllc1tzdG9yeV0ubGFzdF9yZWFkX2F0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIF9vcHRpbWlzdGljU3RvcmllcyA9IHt9O1xuXG4gICAgICBfc3RvcmllcyA9IHN0b3JpZXM7XG4gICAgfSxcblxuICAgIHJlbW92ZVN0b3J5OiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFN0b3JpZXMoaWQpO1xuXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBfc3Rvcmllcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW1vdmVBbGxTdG9yaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIF9zdG9yaWVzID0gW107XG4gICAgfVxuICB9KTtcblxuICBfc2VhcmNoU3RvcmllcyA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBfc3Rvcmllcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChfc3Rvcmllc1tpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcbiAgICB2YXIgc3luYyA9IHBheWxvYWQuc3luYztcblxuICAgIGlmICghX3N0b3JlW2FjdGlvbl0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBfc3RvcmVbYWN0aW9uXShkYXRhKTtcblxuICAgIGlmIChzeW5jKSB7XG4gICAgICByZXR1cm4gX3N0b3JlLmVtaXQoZXZlbnQpO1xuICAgIH1cblxuICAgIF9kZWZlcnJlZC5wdXNoKGV2ZW50KTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfbmV3c0ZlZWRTdG9yZTtcbiAgfVxuICBcbiAgd2luZG93Lk5ld3NGZWVkU3RvcmUgPSBfbmV3c0ZlZWRTdG9yZTtcbn0pKCk7XG4iLCJ2YXIgeGhyID0gcmVxdWlyZSgnLi4veGhyJyk7XG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfdXNlcnMgPSB7fTtcblxuICB2YXIgX3N0b3JlID0gT2JqZWN0LmNyZWF0ZShTdG9yZSk7XG5cbiAgdmFyIF9uZXdzRmVlZFVzZXJzU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICBzZXRVc2VyczogZnVuY3Rpb24odXNlcnMpIHtcbiAgICAgIF91c2VycyA9IHVzZXJzO1xuICAgIH0sXG5cbiAgICBhZGRVc2VyczogZnVuY3Rpb24odXNlcnMpIHtcbiAgICAgIGZvciAodmFyIHVzZXIgaW4gdXNlcnMpIHtcbiAgICAgICAgaWYgKCFfdXNlcnMuaGFzT3duUHJvcGVydHkodXNlcikpIHtcbiAgICAgICAgICBfdXNlcnNbdXNlcl0gPSB1c2Vyc1t1c2VyXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRVc2VyczogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBfdXNlcnM7XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbFVzZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIF91c2VycyA9IFtdO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfbmV3c0ZlZWRVc2Vyc1N0b3JlO1xuICB9XG5cbiAgd2luZG93Lk5ld3NGZWVkVXNlcnNTdG9yZSA9IF9uZXdzRmVlZFVzZXJzU3RvcmU7XG59KSgpO1xuIiwidmFyIHhociA9IHJlcXVpcmUoJy4uL3hocicpO1xudmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX3NlbGVjdGVkO1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcblxuICB2YXIgX2Ryb3Bkb3duU3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICB1cGRhdGVTZWxlY3RlZDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGl0ZW0gPSBkYXRhLml0ZW07XG4gICAgICB2YXIgcGF0aCA9IGRhdGEucGF0aDtcblxuICAgICAgd2luZG93Lnhoci5wb3N0KHBhdGgpO1xuXG4gICAgICBfc2VsZWN0ZWQgPSBpdGVtO1xuICAgIH0sXG5cbiAgICBnZXRTZWxlY3RlZDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX3NlbGVjdGVkO1xuICAgIH0sXG5cbiAgICBzZXRTZWxlY3RlZDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgX3NlbGVjdGVkID0gaXRlbTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlU2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgX3NlbGVjdGVkID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSk7XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcblxuICAgIGlmICghX3N0b3JlW2FjdGlvbl0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBfc3RvcmVbYWN0aW9uXSAmJiBfc3RvcmVbYWN0aW9uXShkYXRhKTtcbiAgICBfc3RvcmUuZW1pdChldmVudCk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2Ryb3Bkb3duU3RvcmU7XG4gIH1cbiAgXG4gIHdpbmRvdy5Ob3RpZmljYXRpb25QcmVmZXJlbmNlc0Ryb3Bkb3duU3RvcmUgPSBfZHJvcGRvd25TdG9yZTtcbn0pKCk7XG4iLCJ2YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfcGVvcGxlID0gW107XG5cbiAgdmFyIF9zdG9yZSA9IE9iamVjdC5jcmVhdGUoU3RvcmUpO1xuICB2YXIgX3Blb3BsZVN0b3JlID0gXy5leHRlbmQoX3N0b3JlLCB7XG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICBEaXNwYXRjaGVyLnJlbW92ZShkaXNwYXRjaEluZGV4KTtcbiAgICB9LFxuXG4gICAgc2V0UGVvcGxlOiBmdW5jdGlvbihwZW9wbGUpIHtcbiAgICAgIF9wZW9wbGUgPSBwZW9wbGU7XG4gICAgfSxcblxuICAgIGdldFBlb3BsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX3Blb3BsZTtcbiAgICB9LFxuXG4gICAgZ2V0UGVyc29uOiBmdW5jdGlvbih1c2VybmFtZSkge1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFBlb3BsZSh1c2VybmFtZSk7XG5cbiAgICAgIHJldHVybiBfcGVvcGxlW2luZGV4XTtcbiAgICB9LFxuXG4gICAgYWRkUGVyc29uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBfcGVvcGxlLnB1c2goZGF0YS51c2VyKTtcblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0UGVvcGxlKCk7XG4gICAgfSxcblxuICAgIHJlbW92ZVBlcnNvbjogZnVuY3Rpb24odXNlcm5hbWUpIHtcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hQZW9wbGUodXNlcm5hbWUpO1xuXG4gICAgICBfcGVvcGxlLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgIHJldHVybiB0aGlzLmdldFBlb3BsZSgpO1xuICAgIH1cbiAgfSk7XG5cbiAgX3N0b3JlLmRpc3BhdGNoSW5kZXggPSBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb247XG4gICAgdmFyIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgdmFyIGV2ZW50ID0gcGF5bG9hZC5ldmVudDtcblxuICAgIF9zdG9yZVthY3Rpb25dICYmIF9zdG9yZVthY3Rpb25dKGRhdGEpO1xuICAgIF9zdG9yZS5lbWl0KGV2ZW50KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gX3NlYXJjaFBlb3BsZSh1c2VybmFtZSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gX3Blb3BsZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChfcGVvcGxlW2ldLnVzZXIudXNlcm5hbWUgPT09IHVzZXJuYW1lKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3Blb3BsZVN0b3JlO1xuICB9XG4gIFxuICB3aW5kb3cuUGVvcGxlU3RvcmUgPSBfcGVvcGxlU3RvcmU7XG59KSgpO1xuIiwidmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVyJyk7XG52YXIgU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvc3RvcmUnKTtcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX3Blb3BsZSA9IFtdO1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcbiAgdmFyIF9wZXJzb25QaWNrZXJTdG9yZSA9IF8uZXh0ZW5kKF9zdG9yZSwge1xuICAgIGFkZFBlcnNvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHVzZXIgPSBkYXRhLnVzZXI7XG4gICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoX3NlYXJjaFBlb3BsZSh1c2VyLnVzZXJuYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBfcGVvcGxlLnB1c2godXNlcik7XG4gICAgfSxcblxuICAgIGdldFBlcnNvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFBlb3BsZShkYXRhLnVzZXIudXNlcm5hbWUpO1xuXG4gICAgICByZXR1cm4gX3Blb3BsZVtpbmRleF07XG4gICAgfSxcblxuICAgIGdldFBlb3BsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX3Blb3BsZTtcbiAgICB9LFxuXG4gICAgdXBkYXRlUGVyc29uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdXNlciA9IGRhdGEudXNlcjtcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hQZW9wbGUodXNlci51c2VybmFtZSk7XG5cbiAgICAgIF9wZW9wbGVbaW5kZXhdID0gdXNlcjtcblxuICAgICAgcmV0dXJuIF9wZW9wbGVbaW5kZXhdO1xuICAgIH0sXG5cbiAgICByZW1vdmVQZXJzb246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB1c2VyID0gZGF0YS51c2VyO1xuICAgICAgdmFyIGluZGV4ID0gX3NlYXJjaFBlb3BsZSh1c2VyLnVzZXJuYW1lKTtcblxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgX3Blb3BsZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXRQZW9wbGU6IGZ1bmN0aW9uKHVzZXJzKSB7XG4gICAgICBfcGVvcGxlID0gdXNlcnM7XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbFBlb3BsZTogZnVuY3Rpb24oKSB7XG4gICAgICBfcGVvcGxlID0gW107XG4gICAgfVxuICB9KTtcblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuXG4gICAgX3N0b3JlW2FjdGlvbl0gJiYgX3N0b3JlW2FjdGlvbl0oZGF0YSk7XG4gICAgX3N0b3JlLmVtaXQoZXZlbnQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBfc2VhcmNoUGVvcGxlKHVzZXJuYW1lKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBfcGVvcGxlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIHVzZXIgPSBfcGVvcGxlW2ldO1xuXG4gICAgICBpZiAodXNlci51c2VybmFtZSA9PT0gdXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfcGVyc29uUGlja2VyU3RvcmU7XG4gIH1cblxuICB3aW5kb3cuUGVyc29uUGlja2VyU3RvcmUgPSBfcGVyc29uUGlja2VyU3RvcmU7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgU3RvcmUgPSBfLmV4dGVuZCh7fSwge1xuICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgY2FsbGJhY2tzID0gdGhpcy5saXN0ZW5lcnM7XG5cbiAgICAgIGlmICghXy5pc0VtcHR5KGNhbGxiYWNrcykpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgY2FsbGJhY2tzW2ldKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRkQ2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzIHx8IFtdO1xuICAgICAgdGhpcy5saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG5cbiAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5sZW5ndGggLSAxO1xuICAgIH0sXG5cbiAgICByZW1vdmVDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oZXZlbnRJbmRleCkge1xuICAgICAgaWYgKHRoaXMubGlzdGVuZXJzICYmIHRoaXMubGlzdGVuZXJzW2V2ZW50SW5kZXhdKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLnNwbGljZShldmVudEluZGV4LCAxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gU3RvcmU7XG4gIH1cblxuICB3aW5kb3cuU3RvcmUgPSBTdG9yZTtcbn0pKCk7XG4iLCJ2YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXInKTtcbnZhciBTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9zdG9yZScpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfdGFncyA9IFtdO1xuXG4gIHZhciBfc3RvcmUgPSBPYmplY3QuY3JlYXRlKFN0b3JlKTtcbiAgdmFyIF90YWdMaXN0U3RvcmUgPSBfLmV4dGVuZChfc3RvcmUsIHtcbiAgICBhZGRUYWc6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB0YWcgPSBkYXRhLnRhZztcbiAgICAgIHZhciB1cmwgPSBkYXRhLnVybDtcblxuICAgICAgLy8gV2UgZG9uJ3Qgd2FudCBkdXBsaWNhdGUgdGFnc1xuICAgICAgaWYgKF9zZWFyY2hUYWdzKHRhZykgIT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgX3RhZ3MucHVzaCh0YWcpO1xuXG4gICAgICB0aGlzLnBlcnNpc3QodXJsKTtcbiAgICB9LFxuXG4gICAgc2V0VGFnczogZnVuY3Rpb24odGFncykge1xuICAgICAgX3RhZ3MgPSB0YWdzO1xuICAgIH0sXG5cbiAgICBnZXRUYWdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfdGFnc1xuICAgIH0sXG5cbiAgICByZW1vdmVUYWc6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB0YWcgPSBkYXRhLnRhZztcbiAgICAgIHZhciB1cmwgPSBkYXRhLnVybDtcbiAgICAgIHZhciBpbmRleCA9IF9zZWFyY2hUYWdzKHRhZyk7XG5cbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIF90YWdzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh1cmwpIHtcbiAgICAgICAgdGhpcy5wZXJzaXN0KHVybCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHBlcnNpc3Q6IGZ1bmN0aW9uKHVybCkge1xuICAgICAgaWYgKCF1cmwpIHJldHVybjtcblxuICAgICAgdmFyIHRhZ3MgPSB0aGlzLmdldFRhZ3MoKTtcblxuICAgICAgaWYgKF8uaXNFbXB0eSh0YWdzKSkge1xuICAgICAgICB0YWdzID0gWycnXTtcbiAgICAgIH1cblxuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHRhc2s6IHtcbiAgICAgICAgICAgIHRhZ19saXN0OiB0YWdzXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgfSxcblxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oanF4aHIsIHN0YXR1cykge1xuICAgICAgICAgIGNvbnNvbGUuZGlyKHN0YXR1cyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW1vdmVBbGxUYWdzOiBmdW5jdGlvbigpIHtcbiAgICAgIF90YWdzID0gW107XG4gICAgfVxuICB9KTtcblxuICBfc3RvcmUuZGlzcGF0Y2hJbmRleCA9IERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvbjtcbiAgICB2YXIgZGF0YSA9IHBheWxvYWQuZGF0YTtcbiAgICB2YXIgZXZlbnQgPSBwYXlsb2FkLmV2ZW50O1xuXG4gICAgX3N0b3JlW2FjdGlvbl0gJiYgX3N0b3JlW2FjdGlvbl0oZGF0YSk7XG4gICAgX3N0b3JlLmVtaXQoZXZlbnQpO1xuICB9KTtcblxuICBmdW5jdGlvbiBfc2VhcmNoVGFncyh0YWcpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IF90YWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKF90YWdzW2ldID09PSB0YWcpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xXG4gIH1cblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90YWdMaXN0U3RvcmU7XG4gIH1cblxuICB3aW5kb3cuVGFnTGlzdFN0b3JlID0gX3RhZ0xpc3RTdG9yZTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciB4aHIgPSB7XG4gICAgZ2V0OiBmdW5jdGlvbihwYXRoLCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5yZXF1ZXN0KCdHRVQnLCBwYXRoLCBudWxsLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIG5vQ3NyZkdldDogZnVuY3Rpb24ocGF0aCwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMubm9Dc3JmUmVxdWVzdCgnR0VUJywgcGF0aCwgbnVsbCwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICBwb3N0OiBmdW5jdGlvbihwYXRoLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5yZXF1ZXN0KCdQT1NUJywgcGF0aCwgZGF0YSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICByZXF1ZXN0OiBmdW5jdGlvbihtZXRob2QsIHBhdGgsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgcGF0aCwgdHJ1ZSk7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ1gtQ1NSRi1Ub2tlbicsIGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdjc3JmLXRva2VuJylbMF0uY29udGVudCk7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXF1ZXN0LnNlbmQoZGF0YSk7XG5cbiAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG5vQ3NyZlJlcXVlc3Q6IGZ1bmN0aW9uKG1ldGhvZCwgcGF0aCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBwYXRoLCB0cnVlKTtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHJlcXVlc3Quc2VuZChkYXRhKTtcblxuICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB4aHI7XG4gIH1cblxuICB3aW5kb3cueGhyID0geGhyO1xufSkoKTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQgRmVsaXggR25hc3NcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuXG4gIC8qIENvbW1vbkpTICovXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JykgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpXG5cbiAgLyogQU1EIG1vZHVsZSAqL1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZhY3RvcnkpXG5cbiAgLyogQnJvd3NlciBnbG9iYWwgKi9cbiAgZWxzZSByb290LlNwaW5uZXIgPSBmYWN0b3J5KClcbn1cbih0aGlzLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIHByZWZpeGVzID0gWyd3ZWJraXQnLCAnTW96JywgJ21zJywgJ08nXSAvKiBWZW5kb3IgcHJlZml4ZXMgKi9cbiAgICAsIGFuaW1hdGlvbnMgPSB7fSAvKiBBbmltYXRpb24gcnVsZXMga2V5ZWQgYnkgdGhlaXIgbmFtZSAqL1xuICAgICwgdXNlQ3NzQW5pbWF0aW9ucyAvKiBXaGV0aGVyIHRvIHVzZSBDU1MgYW5pbWF0aW9ucyBvciBzZXRUaW1lb3V0ICovXG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGVsZW1lbnRzLiBJZiBubyB0YWcgbmFtZSBpcyBnaXZlbixcbiAgICogYSBESVYgaXMgY3JlYXRlZC4gT3B0aW9uYWxseSBwcm9wZXJ0aWVzIGNhbiBiZSBwYXNzZWQuXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVFbCh0YWcsIHByb3ApIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyB8fCAnZGl2JylcbiAgICAgICwgblxuXG4gICAgZm9yKG4gaW4gcHJvcCkgZWxbbl0gPSBwcm9wW25dXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBjaGlsZHJlbiBhbmQgcmV0dXJucyB0aGUgcGFyZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gaW5zKHBhcmVudCAvKiBjaGlsZDEsIGNoaWxkMiwgLi4uKi8pIHtcbiAgICBmb3IgKHZhciBpPTEsIG49YXJndW1lbnRzLmxlbmd0aDsgaTxuOyBpKyspXG4gICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoYXJndW1lbnRzW2ldKVxuXG4gICAgcmV0dXJuIHBhcmVudFxuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhIG5ldyBzdHlsZXNoZWV0IHRvIGhvbGQgdGhlIEBrZXlmcmFtZSBvciBWTUwgcnVsZXMuXG4gICAqL1xuICB2YXIgc2hlZXQgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsID0gY3JlYXRlRWwoJ3N0eWxlJywge3R5cGUgOiAndGV4dC9jc3MnfSlcbiAgICBpbnMoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSwgZWwpXG4gICAgcmV0dXJuIGVsLnNoZWV0IHx8IGVsLnN0eWxlU2hlZXRcbiAgfSgpKVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG9wYWNpdHkga2V5ZnJhbWUgYW5pbWF0aW9uIHJ1bGUgYW5kIHJldHVybnMgaXRzIG5hbWUuXG4gICAqIFNpbmNlIG1vc3QgbW9iaWxlIFdlYmtpdHMgaGF2ZSB0aW1pbmcgaXNzdWVzIHdpdGggYW5pbWF0aW9uLWRlbGF5LFxuICAgKiB3ZSBjcmVhdGUgc2VwYXJhdGUgcnVsZXMgZm9yIGVhY2ggbGluZS9zZWdtZW50LlxuICAgKi9cbiAgZnVuY3Rpb24gYWRkQW5pbWF0aW9uKGFscGhhLCB0cmFpbCwgaSwgbGluZXMpIHtcbiAgICB2YXIgbmFtZSA9IFsnb3BhY2l0eScsIHRyYWlsLCB+fihhbHBoYSoxMDApLCBpLCBsaW5lc10uam9pbignLScpXG4gICAgICAsIHN0YXJ0ID0gMC4wMSArIGkvbGluZXMgKiAxMDBcbiAgICAgICwgeiA9IE1hdGgubWF4KDEgLSAoMS1hbHBoYSkgLyB0cmFpbCAqICgxMDAtc3RhcnQpLCBhbHBoYSlcbiAgICAgICwgcHJlZml4ID0gdXNlQ3NzQW5pbWF0aW9ucy5zdWJzdHJpbmcoMCwgdXNlQ3NzQW5pbWF0aW9ucy5pbmRleE9mKCdBbmltYXRpb24nKSkudG9Mb3dlckNhc2UoKVxuICAgICAgLCBwcmUgPSBwcmVmaXggJiYgJy0nICsgcHJlZml4ICsgJy0nIHx8ICcnXG5cbiAgICBpZiAoIWFuaW1hdGlvbnNbbmFtZV0pIHtcbiAgICAgIHNoZWV0Lmluc2VydFJ1bGUoXG4gICAgICAgICdAJyArIHByZSArICdrZXlmcmFtZXMgJyArIG5hbWUgKyAneycgK1xuICAgICAgICAnMCV7b3BhY2l0eTonICsgeiArICd9JyArXG4gICAgICAgIHN0YXJ0ICsgJyV7b3BhY2l0eTonICsgYWxwaGEgKyAnfScgK1xuICAgICAgICAoc3RhcnQrMC4wMSkgKyAnJXtvcGFjaXR5OjF9JyArXG4gICAgICAgIChzdGFydCt0cmFpbCkgJSAxMDAgKyAnJXtvcGFjaXR5OicgKyBhbHBoYSArICd9JyArXG4gICAgICAgICcxMDAle29wYWNpdHk6JyArIHogKyAnfScgK1xuICAgICAgICAnfScsIHNoZWV0LmNzc1J1bGVzLmxlbmd0aClcblxuICAgICAgYW5pbWF0aW9uc1tuYW1lXSA9IDFcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWVzIHZhcmlvdXMgdmVuZG9yIHByZWZpeGVzIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBzdXBwb3J0ZWQgcHJvcGVydHkuXG4gICAqL1xuICBmdW5jdGlvbiB2ZW5kb3IoZWwsIHByb3ApIHtcbiAgICB2YXIgcyA9IGVsLnN0eWxlXG4gICAgICAsIHBwXG4gICAgICAsIGlcblxuICAgIHByb3AgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKVxuICAgIGZvcihpPTA7IGk8cHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHBwID0gcHJlZml4ZXNbaV0rcHJvcFxuICAgICAgaWYoc1twcF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHBwXG4gICAgfVxuICAgIGlmKHNbcHJvcF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3BcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIG11bHRpcGxlIHN0eWxlIHByb3BlcnRpZXMgYXQgb25jZS5cbiAgICovXG4gIGZ1bmN0aW9uIGNzcyhlbCwgcHJvcCkge1xuICAgIGZvciAodmFyIG4gaW4gcHJvcClcbiAgICAgIGVsLnN0eWxlW3ZlbmRvcihlbCwgbil8fG5dID0gcHJvcFtuXVxuXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvKipcbiAgICogRmlsbHMgaW4gZGVmYXVsdCB2YWx1ZXMuXG4gICAqL1xuICBmdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgICBmb3IgKHZhciBpPTE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZWYgPSBhcmd1bWVudHNbaV1cbiAgICAgIGZvciAodmFyIG4gaW4gZGVmKVxuICAgICAgICBpZiAob2JqW25dID09PSB1bmRlZmluZWQpIG9ialtuXSA9IGRlZltuXVxuICAgIH1cbiAgICByZXR1cm4gb2JqXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWJzb2x1dGUgcGFnZS1vZmZzZXQgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqL1xuICBmdW5jdGlvbiBwb3MoZWwpIHtcbiAgICB2YXIgbyA9IHsgeDplbC5vZmZzZXRMZWZ0LCB5OmVsLm9mZnNldFRvcCB9XG4gICAgd2hpbGUoKGVsID0gZWwub2Zmc2V0UGFyZW50KSlcbiAgICAgIG8ueCs9ZWwub2Zmc2V0TGVmdCwgby55Kz1lbC5vZmZzZXRUb3BcblxuICAgIHJldHVybiBvXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGluZSBjb2xvciBmcm9tIHRoZSBnaXZlbiBzdHJpbmcgb3IgYXJyYXkuXG4gICAqL1xuICBmdW5jdGlvbiBnZXRDb2xvcihjb2xvciwgaWR4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBjb2xvciA9PSAnc3RyaW5nJyA/IGNvbG9yIDogY29sb3JbaWR4ICUgY29sb3IubGVuZ3RoXVxuICB9XG5cbiAgLy8gQnVpbHQtaW4gZGVmYXVsdHNcblxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgbGluZXM6IDEyLCAgICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xuICAgIGxlbmd0aDogNywgICAgICAgICAgICAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxuICAgIHdpZHRoOiA1LCAgICAgICAgICAgICAvLyBUaGUgbGluZSB0aGlja25lc3NcbiAgICByYWRpdXM6IDEwLCAgICAgICAgICAgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgcm90YXRlOiAwLCAgICAgICAgICAgIC8vIFJvdGF0aW9uIG9mZnNldFxuICAgIGNvcm5lcnM6IDEsICAgICAgICAgICAvLyBSb3VuZG5lc3MgKDAuLjEpXG4gICAgY29sb3I6ICcjMDAwJywgICAgICAgIC8vICNyZ2Igb3IgI3JyZ2diYlxuICAgIGRpcmVjdGlvbjogMSwgICAgICAgICAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXG4gICAgc3BlZWQ6IDEsICAgICAgICAgICAgIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICAgdHJhaWw6IDEwMCwgICAgICAgICAgIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXG4gICAgb3BhY2l0eTogMS80LCAgICAgICAgIC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXG4gICAgZnBzOiAyMCwgICAgICAgICAgICAgIC8vIEZyYW1lcyBwZXIgc2Vjb25kIHdoZW4gdXNpbmcgc2V0VGltZW91dCgpXG4gICAgekluZGV4OiAyZTksICAgICAgICAgIC8vIFVzZSBhIGhpZ2ggei1pbmRleCBieSBkZWZhdWx0XG4gICAgY2xhc3NOYW1lOiAnc3Bpbm5lcicsIC8vIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIGVsZW1lbnRcbiAgICB0b3A6ICc1MCUnLCAgICAgICAgICAgLy8gY2VudGVyIHZlcnRpY2FsbHlcbiAgICBsZWZ0OiAnNTAlJywgICAgICAgICAgLy8gY2VudGVyIGhvcml6b250YWxseVxuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnICAvLyBlbGVtZW50IHBvc2l0aW9uXG4gIH1cblxuICAvKiogVGhlIGNvbnN0cnVjdG9yICovXG4gIGZ1bmN0aW9uIFNwaW5uZXIobykge1xuICAgIHRoaXMub3B0cyA9IG1lcmdlKG8gfHwge30sIFNwaW5uZXIuZGVmYXVsdHMsIGRlZmF1bHRzKVxuICB9XG5cbiAgLy8gR2xvYmFsIGRlZmF1bHRzIHRoYXQgb3ZlcnJpZGUgdGhlIGJ1aWx0LWluczpcbiAgU3Bpbm5lci5kZWZhdWx0cyA9IHt9XG5cbiAgbWVyZ2UoU3Bpbm5lci5wcm90b3R5cGUsIHtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHNwaW5uZXIgdG8gdGhlIGdpdmVuIHRhcmdldCBlbGVtZW50LiBJZiB0aGlzIGluc3RhbmNlIGlzIGFscmVhZHlcbiAgICAgKiBzcGlubmluZywgaXQgaXMgYXV0b21hdGljYWxseSByZW1vdmVkIGZyb20gaXRzIHByZXZpb3VzIHRhcmdldCBiIGNhbGxpbmdcbiAgICAgKiBzdG9wKCkgaW50ZXJuYWxseS5cbiAgICAgKi9cbiAgICBzcGluOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIHRoaXMuc3RvcCgpXG5cbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAsIG8gPSBzZWxmLm9wdHNcbiAgICAgICAgLCBlbCA9IHNlbGYuZWwgPSBjc3MoY3JlYXRlRWwoMCwge2NsYXNzTmFtZTogby5jbGFzc05hbWV9KSwge3Bvc2l0aW9uOiBvLnBvc2l0aW9uLCB3aWR0aDogMCwgekluZGV4OiBvLnpJbmRleH0pXG4gICAgICAgICwgbWlkID0gby5yYWRpdXMrby5sZW5ndGgrby53aWR0aFxuXG4gICAgICBjc3MoZWwsIHtcbiAgICAgICAgbGVmdDogby5sZWZ0LFxuICAgICAgICB0b3A6IG8udG9wXG4gICAgICB9KVxuICAgICAgICBcbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0LmZpcnN0Q2hpbGR8fG51bGwpXG4gICAgICB9XG5cbiAgICAgIGVsLnNldEF0dHJpYnV0ZSgncm9sZScsICdwcm9ncmVzc2JhcicpXG4gICAgICBzZWxmLmxpbmVzKGVsLCBzZWxmLm9wdHMpXG5cbiAgICAgIGlmICghdXNlQ3NzQW5pbWF0aW9ucykge1xuICAgICAgICAvLyBObyBDU1MgYW5pbWF0aW9uIHN1cHBvcnQsIHVzZSBzZXRUaW1lb3V0KCkgaW5zdGVhZFxuICAgICAgICB2YXIgaSA9IDBcbiAgICAgICAgICAsIHN0YXJ0ID0gKG8ubGluZXMgLSAxKSAqICgxIC0gby5kaXJlY3Rpb24pIC8gMlxuICAgICAgICAgICwgYWxwaGFcbiAgICAgICAgICAsIGZwcyA9IG8uZnBzXG4gICAgICAgICAgLCBmID0gZnBzL28uc3BlZWRcbiAgICAgICAgICAsIG9zdGVwID0gKDEtby5vcGFjaXR5KSAvIChmKm8udHJhaWwgLyAxMDApXG4gICAgICAgICAgLCBhc3RlcCA9IGYvby5saW5lc1xuXG4gICAgICAgIDsoZnVuY3Rpb24gYW5pbSgpIHtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBvLmxpbmVzOyBqKyspIHtcbiAgICAgICAgICAgIGFscGhhID0gTWF0aC5tYXgoMSAtIChpICsgKG8ubGluZXMgLSBqKSAqIGFzdGVwKSAlIGYgKiBvc3RlcCwgby5vcGFjaXR5KVxuXG4gICAgICAgICAgICBzZWxmLm9wYWNpdHkoZWwsIGogKiBvLmRpcmVjdGlvbiArIHN0YXJ0LCBhbHBoYSwgbylcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsZi50aW1lb3V0ID0gc2VsZi5lbCAmJiBzZXRUaW1lb3V0KGFuaW0sIH5+KDEwMDAvZnBzKSlcbiAgICAgICAgfSkoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNlbGZcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgYW5kIHJlbW92ZXMgdGhlIFNwaW5uZXIuXG4gICAgICovXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzLmVsXG4gICAgICBpZiAoZWwpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgICAgaWYgKGVsLnBhcmVudE5vZGUpIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXG4gICAgICAgIHRoaXMuZWwgPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IGRyYXdzIHRoZSBpbmRpdmlkdWFsIGxpbmVzLiBXaWxsIGJlIG92ZXJ3cml0dGVuXG4gICAgICogaW4gVk1MIGZhbGxiYWNrIG1vZGUgYmVsb3cuXG4gICAgICovXG4gICAgbGluZXM6IGZ1bmN0aW9uKGVsLCBvKSB7XG4gICAgICB2YXIgaSA9IDBcbiAgICAgICAgLCBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDJcbiAgICAgICAgLCBzZWdcblxuICAgICAgZnVuY3Rpb24gZmlsbChjb2xvciwgc2hhZG93KSB7XG4gICAgICAgIHJldHVybiBjc3MoY3JlYXRlRWwoKSwge1xuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIHdpZHRoOiAoby5sZW5ndGgrby53aWR0aCkgKyAncHgnLFxuICAgICAgICAgIGhlaWdodDogby53aWR0aCArICdweCcsXG4gICAgICAgICAgYmFja2dyb3VuZDogY29sb3IsXG4gICAgICAgICAgYm94U2hhZG93OiBzaGFkb3csXG4gICAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAnbGVmdCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiAncm90YXRlKCcgKyB+figzNjAvby5saW5lcyppK28ucm90YXRlKSArICdkZWcpIHRyYW5zbGF0ZSgnICsgby5yYWRpdXMrJ3B4JyArJywwKScsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAoby5jb3JuZXJzICogby53aWR0aD4+MSkgKyAncHgnXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGZvciAoOyBpIDwgby5saW5lczsgaSsrKSB7XG4gICAgICAgIHNlZyA9IGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgdG9wOiAxK34oby53aWR0aC8yKSArICdweCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiBvLmh3YWNjZWwgPyAndHJhbnNsYXRlM2QoMCwwLDApJyA6ICcnLFxuICAgICAgICAgIG9wYWNpdHk6IG8ub3BhY2l0eSxcbiAgICAgICAgICBhbmltYXRpb246IHVzZUNzc0FuaW1hdGlvbnMgJiYgYWRkQW5pbWF0aW9uKG8ub3BhY2l0eSwgby50cmFpbCwgc3RhcnQgKyBpICogby5kaXJlY3Rpb24sIG8ubGluZXMpICsgJyAnICsgMS9vLnNwZWVkICsgJ3MgbGluZWFyIGluZmluaXRlJ1xuICAgICAgICB9KVxuXG4gICAgICAgIGlmIChvLnNoYWRvdykgaW5zKHNlZywgY3NzKGZpbGwoJyMwMDAnLCAnMCAwIDRweCAnICsgJyMwMDAnKSwge3RvcDogMisncHgnfSkpXG4gICAgICAgIGlucyhlbCwgaW5zKHNlZywgZmlsbChnZXRDb2xvcihvLmNvbG9yLCBpKSwgJzAgMCAxcHggcmdiYSgwLDAsMCwuMSknKSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gZWxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgYWRqdXN0cyB0aGUgb3BhY2l0eSBvZiBhIHNpbmdsZSBsaW5lLlxuICAgICAqIFdpbGwgYmUgb3ZlcndyaXR0ZW4gaW4gVk1MIGZhbGxiYWNrIG1vZGUgYmVsb3cuXG4gICAgICovXG4gICAgb3BhY2l0eTogZnVuY3Rpb24oZWwsIGksIHZhbCkge1xuICAgICAgaWYgKGkgPCBlbC5jaGlsZE5vZGVzLmxlbmd0aCkgZWwuY2hpbGROb2Rlc1tpXS5zdHlsZS5vcGFjaXR5ID0gdmFsXG4gICAgfVxuXG4gIH0pXG5cblxuICBmdW5jdGlvbiBpbml0Vk1MKCkge1xuXG4gICAgLyogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBWTUwgdGFnICovXG4gICAgZnVuY3Rpb24gdm1sKHRhZywgYXR0cikge1xuICAgICAgcmV0dXJuIGNyZWF0ZUVsKCc8JyArIHRhZyArICcgeG1sbnM9XCJ1cm46c2NoZW1hcy1taWNyb3NvZnQuY29tOnZtbFwiIGNsYXNzPVwic3Bpbi12bWxcIj4nLCBhdHRyKVxuICAgIH1cblxuICAgIC8vIE5vIENTUyB0cmFuc2Zvcm1zIGJ1dCBWTUwgc3VwcG9ydCwgYWRkIGEgQ1NTIHJ1bGUgZm9yIFZNTCBlbGVtZW50czpcbiAgICBzaGVldC5hZGRSdWxlKCcuc3Bpbi12bWwnLCAnYmVoYXZpb3I6dXJsKCNkZWZhdWx0I1ZNTCknKVxuXG4gICAgU3Bpbm5lci5wcm90b3R5cGUubGluZXMgPSBmdW5jdGlvbihlbCwgbykge1xuICAgICAgdmFyIHIgPSBvLmxlbmd0aCtvLndpZHRoXG4gICAgICAgICwgcyA9IDIqclxuXG4gICAgICBmdW5jdGlvbiBncnAoKSB7XG4gICAgICAgIHJldHVybiBjc3MoXG4gICAgICAgICAgdm1sKCdncm91cCcsIHtcbiAgICAgICAgICAgIGNvb3Jkc2l6ZTogcyArICcgJyArIHMsXG4gICAgICAgICAgICBjb29yZG9yaWdpbjogLXIgKyAnICcgKyAtclxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHsgd2lkdGg6IHMsIGhlaWdodDogcyB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgdmFyIG1hcmdpbiA9IC0oby53aWR0aCtvLmxlbmd0aCkqMiArICdweCdcbiAgICAgICAgLCBnID0gY3NzKGdycCgpLCB7cG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogbWFyZ2luLCBsZWZ0OiBtYXJnaW59KVxuICAgICAgICAsIGlcblxuICAgICAgZnVuY3Rpb24gc2VnKGksIGR4LCBmaWx0ZXIpIHtcbiAgICAgICAgaW5zKGcsXG4gICAgICAgICAgaW5zKGNzcyhncnAoKSwge3JvdGF0aW9uOiAzNjAgLyBvLmxpbmVzICogaSArICdkZWcnLCBsZWZ0OiB+fmR4fSksXG4gICAgICAgICAgICBpbnMoY3NzKHZtbCgncm91bmRyZWN0Jywge2FyY3NpemU6IG8uY29ybmVyc30pLCB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHIsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBvLndpZHRoLFxuICAgICAgICAgICAgICAgIGxlZnQ6IG8ucmFkaXVzLFxuICAgICAgICAgICAgICAgIHRvcDogLW8ud2lkdGg+PjEsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmaWx0ZXJcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIHZtbCgnZmlsbCcsIHtjb2xvcjogZ2V0Q29sb3Ioby5jb2xvciwgaSksIG9wYWNpdHk6IG8ub3BhY2l0eX0pLFxuICAgICAgICAgICAgICB2bWwoJ3N0cm9rZScsIHtvcGFjaXR5OiAwfSkgLy8gdHJhbnNwYXJlbnQgc3Ryb2tlIHRvIGZpeCBjb2xvciBibGVlZGluZyB1cG9uIG9wYWNpdHkgY2hhbmdlXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIGlmIChvLnNoYWRvdylcbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSBvLmxpbmVzOyBpKyspXG4gICAgICAgICAgc2VnKGksIC0yLCAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkJsdXIocGl4ZWxyYWRpdXM9MixtYWtlc2hhZG93PTEsc2hhZG93b3BhY2l0eT0uMyknKVxuXG4gICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKykgc2VnKGkpXG4gICAgICByZXR1cm4gaW5zKGVsLCBnKVxuICAgIH1cblxuICAgIFNwaW5uZXIucHJvdG90eXBlLm9wYWNpdHkgPSBmdW5jdGlvbihlbCwgaSwgdmFsLCBvKSB7XG4gICAgICB2YXIgYyA9IGVsLmZpcnN0Q2hpbGRcbiAgICAgIG8gPSBvLnNoYWRvdyAmJiBvLmxpbmVzIHx8IDBcbiAgICAgIGlmIChjICYmIGkrbyA8IGMuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgYyA9IGMuY2hpbGROb2Rlc1tpK29dOyBjID0gYyAmJiBjLmZpcnN0Q2hpbGQ7IGMgPSBjICYmIGMuZmlyc3RDaGlsZFxuICAgICAgICBpZiAoYykgYy5vcGFjaXR5ID0gdmFsXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb2JlID0gY3NzKGNyZWF0ZUVsKCdncm91cCcpLCB7YmVoYXZpb3I6ICd1cmwoI2RlZmF1bHQjVk1MKSd9KVxuXG4gIGlmICghdmVuZG9yKHByb2JlLCAndHJhbnNmb3JtJykgJiYgcHJvYmUuYWRqKSBpbml0Vk1MKClcbiAgZWxzZSB1c2VDc3NBbmltYXRpb25zID0gdmVuZG9yKHByb2JlLCAnYW5pbWF0aW9uJylcblxuICByZXR1cm4gU3Bpbm5lclxuXG59KSk7XG4iLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjYuMFxuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gRXN0YWJsaXNoIHRoZSBvYmplY3QgdGhhdCBnZXRzIHJldHVybmVkIHRvIGJyZWFrIG91dCBvZiBhIGxvb3AgaXRlcmF0aW9uLlxuICB2YXIgYnJlYWtlciA9IHt9O1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyXG4gICAgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICBjb25jYXQgICAgICAgICAgID0gQXJyYXlQcm90by5jb25jYXQsXG4gICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUZvckVhY2ggICAgICA9IEFycmF5UHJvdG8uZm9yRWFjaCxcbiAgICBuYXRpdmVNYXAgICAgICAgICAgPSBBcnJheVByb3RvLm1hcCxcbiAgICBuYXRpdmVSZWR1Y2UgICAgICAgPSBBcnJheVByb3RvLnJlZHVjZSxcbiAgICBuYXRpdmVSZWR1Y2VSaWdodCAgPSBBcnJheVByb3RvLnJlZHVjZVJpZ2h0LFxuICAgIG5hdGl2ZUZpbHRlciAgICAgICA9IEFycmF5UHJvdG8uZmlsdGVyLFxuICAgIG5hdGl2ZUV2ZXJ5ICAgICAgICA9IEFycmF5UHJvdG8uZXZlcnksXG4gICAgbmF0aXZlU29tZSAgICAgICAgID0gQXJyYXlQcm90by5zb21lLFxuICAgIG5hdGl2ZUluZGV4T2YgICAgICA9IEFycmF5UHJvdG8uaW5kZXhPZixcbiAgICBuYXRpdmVMYXN0SW5kZXhPZiAgPSBBcnJheVByb3RvLmxhc3RJbmRleE9mLFxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQ7XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0IHZpYSBhIHN0cmluZyBpZGVudGlmaWVyLFxuICAvLyBmb3IgQ2xvc3VyZSBDb21waWxlciBcImFkdmFuY2VkXCIgbW9kZS5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS42LjAnO1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgb2JqZWN0cyB3aXRoIHRoZSBidWlsdC1pbiBgZm9yRWFjaGAsIGFycmF5cywgYW5kIHJhdyBvYmplY3RzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZm9yRWFjaGAgaWYgYXZhaWxhYmxlLlxuICB2YXIgZWFjaCA9IF8uZWFjaCA9IF8uZm9yRWFjaCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgaWYgKG5hdGl2ZUZvckVhY2ggJiYgb2JqLmZvckVhY2ggPT09IG5hdGl2ZUZvckVhY2gpIHtcbiAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRvciB0byBlYWNoIGVsZW1lbnQuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBtYXBgIGlmIGF2YWlsYWJsZS5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVNYXAgJiYgb2JqLm1hcCA9PT0gbmF0aXZlTWFwKSByZXR1cm4gb2JqLm1hcChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgdmFyIHJlZHVjZUVycm9yID0gJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZWAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZSAmJiBvYmoucmVkdWNlID09PSBuYXRpdmVSZWR1Y2UpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2UoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZShpdGVyYXRvcik7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gdmFsdWU7XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlUmlnaHRgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2VSaWdodCAmJiBvYmoucmVkdWNlUmlnaHQgPT09IG5hdGl2ZVJlZHVjZVJpZ2h0KSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCAhPT0gK2xlbmd0aCkge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpbmRleCA9IGtleXMgPyBrZXlzWy0tbGVuZ3RoXSA6IC0tbGVuZ3RoO1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSBvYmpbaW5kZXhdO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIG9ialtpbmRleF0sIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgYW55KG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZmlsdGVyYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlRmlsdGVyICYmIG9iai5maWx0ZXIgPT09IG5hdGl2ZUZpbHRlcikgcmV0dXJuIG9iai5maWx0ZXIocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgfSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBldmVyeWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSB8fCAocHJlZGljYXRlID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVFdmVyeSAmJiBvYmouZXZlcnkgPT09IG5hdGl2ZUV2ZXJ5KSByZXR1cm4gb2JqLmV2ZXJ5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCEocmVzdWx0ID0gcmVzdWx0ICYmIHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBzb21lYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIHZhciBhbnkgPSBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlIHx8IChwcmVkaWNhdGUgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVTb21lICYmIG9iai5zb21lID09PSBuYXRpdmVTb21lKSByZXR1cm4gb2JqLnNvbWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocmVzdWx0IHx8IChyZXN1bHQgPSBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gdmFsdWUgKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIG9iai5pbmRleE9mID09PSBuYXRpdmVJbmRleE9mKSByZXR1cm4gb2JqLmluZGV4T2YodGFyZ2V0KSAhPSAtMTtcbiAgICByZXR1cm4gYW55KG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gdGFyZ2V0O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF0pLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCBvciAoZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIC8vIENhbid0IG9wdGltaXplIGFycmF5cyBvZiBpbnRlZ2VycyBsb25nZXIgdGhhbiA2NSw1MzUgZWxlbWVudHMuXG4gIC8vIFNlZSBbV2ViS2l0IEJ1ZyA4MDc5N10oaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTgwNzk3KVxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNBcnJheShvYmopICYmIG9ialswXSA9PT0gK29ialswXSAmJiBvYmoubGVuZ3RoIDwgNjU1MzUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCBvYmopO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGFuIGFycmF5LCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJhbmQ7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc2h1ZmZsZWQgPSBbXTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJhbmQgPSBfLnJhbmRvbShpbmRleCsrKTtcbiAgICAgIHNodWZmbGVkW2luZGV4IC0gMV0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgbG9va3VwIGl0ZXJhdG9ycy5cbiAgdmFyIGxvb2t1cEl0ZXJhdG9yID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdG9yLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICB2YXIga2V5ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwga2V5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICBfLmhhcyhyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XS5wdXNoKHZhbHVlKSA6IHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgIF8uaGFzKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldKysgOiByZXN1bHRba2V5XSA9IDE7XG4gIH0pO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iaik7XG4gICAgdmFyIGxvdyA9IDAsIGhpZ2ggPSBhcnJheS5sZW5ndGg7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSAobG93ICsgaGlnaCkgPj4+IDE7XG4gICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W21pZF0pIDwgdmFsdWUgPyBsb3cgPSBtaWQgKyAxIDogaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBTYWZlbHkgY3JlYXRlIGEgcmVhbCwgbGl2ZSBhcnJheSBmcm9tIGFueXRoaW5nIGl0ZXJhYmxlLlxuICBfLnRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkgcmV0dXJuIHNsaWNlLmNhbGwob2JqKTtcbiAgICBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiA9PSBudWxsKSB8fCBndWFyZCkgcmV0dXJuIGFycmF5WzBdO1xuICAgIGlmIChuIDwgMCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoXG4gIC8vIGBfLm1hcGAuXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBhcnJheS5sZW5ndGggLSAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbikpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiA9PSBudWxsKSB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBNYXRoLm1heChhcnJheS5sZW5ndGggLSBuLCAwKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5LiBBbGlhc2VkIGFzIGB0YWlsYCBhbmQgYGRyb3BgLlxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxuICAvLyB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKipcbiAgLy8gY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbik7XG4gIH07XG5cbiAgLy8gVHJpbSBvdXQgYWxsIGZhbHN5IHZhbHVlcyBmcm9tIGFuIGFycmF5LlxuICBfLmNvbXBhY3QgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgXy5pZGVudGl0eSk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYSByZWN1cnNpdmUgYGZsYXR0ZW5gIGZ1bmN0aW9uLlxuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGlucHV0LCBzaGFsbG93LCBvdXRwdXQpIHtcbiAgICBpZiAoc2hhbGxvdyAmJiBfLmV2ZXJ5KGlucHV0LCBfLmlzQXJyYXkpKSB7XG4gICAgICByZXR1cm4gY29uY2F0LmFwcGx5KG91dHB1dCwgaW5wdXQpO1xuICAgIH1cbiAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKF8uaXNBcnJheSh2YWx1ZSkgfHwgXy5pc0FyZ3VtZW50cyh2YWx1ZSkpIHtcbiAgICAgICAgc2hhbGxvdyA/IHB1c2guYXBwbHkob3V0cHV0LCB2YWx1ZSkgOiBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBvdXRwdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBbXSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBTcGxpdCBhbiBhcnJheSBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgICB2YXIgcGFzcyA9IFtdLCBmYWlsID0gW107XG4gICAgZWFjaChhcnJheSwgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgKHByZWRpY2F0ZShlbGVtKSA/IHBhc3MgOiBmYWlsKS5wdXNoKGVsZW0pO1xuICAgIH0pO1xuICAgIHJldHVybiBbcGFzcywgZmFpbF07XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdG9yO1xuICAgICAgaXRlcmF0b3IgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBpbml0aWFsID0gaXRlcmF0b3IgPyBfLm1hcChhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIDogYXJyYXk7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGVhY2goaW5pdGlhbCwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICBpZiAoaXNTb3J0ZWQgPyAoIWluZGV4IHx8IHNlZW5bc2Vlbi5sZW5ndGggLSAxXSAhPT0gdmFsdWUpIDogIV8uY29udGFpbnMoc2VlbiwgdmFsdWUpKSB7XG4gICAgICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhcnJheVtpbmRleF0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxuICAvLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbiAgXy51bmlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuaXEoXy5mbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihfLnVuaXEoYXJyYXkpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gXy5ldmVyeShyZXN0LCBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gXy5jb250YWlucyhvdGhlciwgaXRlbSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXsgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTsgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVuZ3RoID0gXy5tYXgoXy5wbHVjayhhcmd1bWVudHMsICdsZW5ndGgnKS5jb25jYXQoMCkpO1xuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJndW1lbnRzLCAnJyArIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgaWYgKGxpc3QgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIElmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcGx5IHVzIHdpdGggaW5kZXhPZiAoSSdtIGxvb2tpbmcgYXQgeW91LCAqKk1TSUUqKiksXG4gIC8vIHdlIG5lZWQgdGhpcyBmdW5jdGlvbi4gUmV0dXJuIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhblxuICAvLyBpdGVtIGluIGFuIGFycmF5LCBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgaW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcbiAgLy8gZm9yICoqaXNTb3J0ZWQqKiB0byB1c2UgYmluYXJ5IHNlYXJjaC5cbiAgXy5pbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGlzU29ydGVkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNTb3J0ZWQgPT0gJ251bWJlcicpIHtcbiAgICAgICAgaSA9IChpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsZW5ndGggKyBpc1NvcnRlZCkgOiBpc1NvcnRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gXy5zb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpXSA9PT0gaXRlbSA/IGkgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgYXJyYXkuaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSwgaXNTb3J0ZWQpO1xuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBsYXN0SW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICBfLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBoYXNJbmRleCA9IGZyb20gIT0gbnVsbDtcbiAgICBpZiAobmF0aXZlTGFzdEluZGV4T2YgJiYgYXJyYXkubGFzdEluZGV4T2YgPT09IG5hdGl2ZUxhc3RJbmRleE9mKSB7XG4gICAgICByZXR1cm4gaGFzSW5kZXggPyBhcnJheS5sYXN0SW5kZXhPZihpdGVtLCBmcm9tKSA6IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0pO1xuICAgIH1cbiAgICB2YXIgaSA9IChoYXNJbmRleCA/IGZyb20gOiBhcnJheS5sZW5ndGgpO1xuICAgIHdoaWxlIChpLS0pIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBhcmd1bWVudHNbMl0gfHwgMTtcblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIGlkeCA9IDA7XG4gICAgdmFyIHJhbmdlID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZShpZHggPCBsZW5ndGgpIHtcbiAgICAgIHJhbmdlW2lkeCsrXSA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXVzYWJsZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgcHJvdG90eXBlIHNldHRpbmcuXG4gIHZhciBjdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIHZhciBhcmdzLCBib3VuZDtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkpIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBzZWxmID0gbmV3IGN0b3I7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGlmIChPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0KSByZXR1cm4gcmVzdWx0O1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LiBfIGFjdHNcbiAgLy8gYXMgYSBwbGFjZWhvbGRlciwgYWxsb3dpbmcgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyB0byBiZSBwcmUtZmlsbGVkLlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgICAgdmFyIGFyZ3MgPSBib3VuZEFyZ3Muc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmdzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcmdzW2ldID09PSBfKSBhcmdzW2ldID0gYXJndW1lbnRzW3Bvc2l0aW9uKytdO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEJpbmQgYSBudW1iZXIgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gUmVtYWluaW5nIGFyZ3VtZW50c1xuICAvLyBhcmUgdGhlIG1ldGhvZCBuYW1lcyB0byBiZSBib3VuZC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0IGFsbCBjYWxsYmFja3NcbiAgLy8gZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgZnVuY3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzJyk7XG4gICAgZWFjaChmdW5jcywgZnVuY3Rpb24oZikgeyBvYmpbZl0gPSBfLmJpbmQob2JqW2ZdLCBvYmopOyB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIE1lbW9pemUgYW4gZXhwZW5zaXZlIGZ1bmN0aW9uIGJ5IHN0b3JpbmcgaXRzIHJlc3VsdHMuXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xuICAgIHZhciBtZW1vID0ge307XG4gICAgaGFzaGVyIHx8IChoYXNoZXIgPSBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gXy5oYXMobWVtbywga2V5KSA/IG1lbW9ba2V5XSA6IChtZW1vW2tleV0gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gRGVsYXlzIGEgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBhbmQgdGhlbiBjYWxsc1xuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXG4gIF8uZGVsYXkgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7IH0sIHdhaXQpO1xuICB9O1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHJldHVybiBfLmRlbGF5LmFwcGx5KF8sIFtmdW5jLCAxXS5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCBhcmdzLCBjb250ZXh0LCB0aW1lc3RhbXAsIHJlc3VsdDtcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3QgPSBfLm5vdygpIC0gdGltZXN0YW1wO1xuICAgICAgaWYgKGxhc3QgPCB3YWl0KSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgcmFuID0gZmFsc2UsIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHJhbikgcmV0dXJuIG1lbW87XG4gICAgICByYW4gPSB0cnVlO1xuICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIF8ucGFydGlhbCh3cmFwcGVyLCBmdW5jKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnVuY3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBmb3IgKHZhciBpID0gZnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgYXJncyA9IFtmdW5jc1tpXS5hcHBseSh0aGlzLCBhcmdzKV07XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnc1swXTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBhZnRlciBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBPYmplY3QgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYE9iamVjdC5rZXlzYFxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvYmpba2V5c1tpXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoa2V5IGluIG9iaikgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKCFfLmNvbnRhaW5zKGtleXMsIGtleSkpIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIGlmIChvYmpbcHJvcF0gPT09IHZvaWQgMCkgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gYSA9PSBTdHJpbmcoYik7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLiBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yXG4gICAgICAgIC8vIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gYSAhPSArYSA/IGIgIT0gK2IgOiAoYSA9PSAwID8gMSAvIGEgPT0gMSAvIGIgOiBhID09ICtiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PSArYjtcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyIHNvdXJjZSBwYXR0ZXJucyBhbmQgZmxhZ3MuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgICByZXR1cm4gYS5zb3VyY2UgPT0gYi5zb3VyY2UgJiZcbiAgICAgICAgICAgICAgIGEuZ2xvYmFsID09IGIuZ2xvYmFsICYmXG4gICAgICAgICAgICAgICBhLm11bHRpbGluZSA9PSBiLm11bHRpbGluZSAmJlxuICAgICAgICAgICAgICAgYS5pZ25vcmVDYXNlID09IGIuaWdub3JlQ2FzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09IGI7XG4gICAgfVxuICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3Rgc1xuICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIChhQ3RvciBpbnN0YW5jZW9mIGFDdG9yKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIChiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICYmICgnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG4gICAgdmFyIHNpemUgPSAwLCByZXN1bHQgPSB0cnVlO1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChjbGFzc05hbWUgPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgLy8gQ29tcGFyZSBhcnJheSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkuXG4gICAgICBzaXplID0gYS5sZW5ndGg7XG4gICAgICByZXN1bHQgPSBzaXplID09IGIubGVuZ3RoO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gZXEoYVtzaXplXSwgYltzaXplXSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYSkge1xuICAgICAgICBpZiAoXy5oYXMoYSwga2V5KSkge1xuICAgICAgICAgIC8vIENvdW50IHRoZSBleHBlY3RlZCBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyLlxuICAgICAgICAgIGlmICghKHJlc3VsdCA9IF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gYikge1xuICAgICAgICAgIGlmIChfLmhhcyhiLCBrZXkpICYmICEoc2l6ZS0tKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gIXNpemU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3Qgb2JqZWN0IGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wb3AoKTtcbiAgICBiU3RhY2sucG9wKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiLCBbXSwgW10pO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAuXG4gIGVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSksIHdoZXJlXG4gIC8vIHRoZXJlIGlzbid0IGFueSBpbnNwZWN0YWJsZSBcIkFyZ3VtZW50c1wiIHR5cGUuXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gICAgXy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICEhKG9iaiAmJiBfLmhhcyhvYmosICdjYWxsZWUnKSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS5cbiAgaWYgKHR5cGVvZiAoLy4vKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xuICB9O1xuXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cbiAgXy5pc05hTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzTnVtYmVyKG9iaikgJiYgb2JqICE9ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0b3JzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ucHJvcGVydHkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PT0gYXR0cnMpIHJldHVybiB0cnVlOyAvL2F2b2lkIGNvbXBhcmluZyBhbiBvYmplY3QgdG8gaXRzZWxmLlxuICAgICAgZm9yICh2YXIga2V5IGluIGF0dHJzKSB7XG4gICAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZW50aXR5TWFwID0ge1xuICAgIGVzY2FwZToge1xuICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgXCInXCI6ICcmI3gyNzsnXG4gICAgfVxuICB9O1xuICBlbnRpdHlNYXAudW5lc2NhcGUgPSBfLmludmVydChlbnRpdHlNYXAuZXNjYXBlKTtcblxuICAvLyBSZWdleGVzIGNvbnRhaW5pbmcgdGhlIGtleXMgYW5kIHZhbHVlcyBsaXN0ZWQgaW1tZWRpYXRlbHkgYWJvdmUuXG4gIHZhciBlbnRpdHlSZWdleGVzID0ge1xuICAgIGVzY2FwZTogICBuZXcgUmVnRXhwKCdbJyArIF8ua2V5cyhlbnRpdHlNYXAuZXNjYXBlKS5qb2luKCcnKSArICddJywgJ2cnKSxcbiAgICB1bmVzY2FwZTogbmV3IFJlZ0V4cCgnKCcgKyBfLmtleXMoZW50aXR5TWFwLnVuZXNjYXBlKS5qb2luKCd8JykgKyAnKScsICdnJylcbiAgfTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIF8uZWFjaChbJ2VzY2FwZScsICd1bmVzY2FwZSddLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBfW21ldGhvZF0gPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIGlmIChzdHJpbmcgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgICAgcmV0dXJuICgnJyArIHN0cmluZykucmVwbGFjZShlbnRpdHlSZWdleGVzW21ldGhvZF0sIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBlbnRpdHlNYXBbbWV0aG9kXVttYXRjaF07XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIGBwcm9wZXJ0eWAgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdCB3aXRoIHRoZVxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKG9iamVjdCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBmdW5jLmFwcGx5KF8sIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgaW50ZWdlciBpZCAodW5pcXVlIHdpdGhpbiB0aGUgZW50aXJlIGNsaWVudCBzZXNzaW9uKS5cbiAgLy8gVXNlZnVsIGZvciB0ZW1wb3JhcnkgRE9NIGlkcy5cbiAgdmFyIGlkQ291bnRlciA9IDA7XG4gIF8udW5pcXVlSWQgPSBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xuICB9O1xuXG4gIC8vIEJ5IGRlZmF1bHQsIFVuZGVyc2NvcmUgdXNlcyBFUkItc3R5bGUgdGVtcGxhdGUgZGVsaW1pdGVycywgY2hhbmdlIHRoZVxuICAvLyBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICBldmFsdWF0ZSAgICA6IC88JShbXFxzXFxTXSs/KSU+L2csXG4gICAgaW50ZXJwb2xhdGUgOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGUgICAgICA6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6ICAgICAgXCInXCIsXG4gICAgJ1xcXFwnOiAgICAgJ1xcXFwnLFxuICAgICdcXHInOiAgICAgJ3InLFxuICAgICdcXG4nOiAgICAgJ24nLFxuICAgICdcXHQnOiAgICAgJ3QnLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICB2YXIgZXNjYXBlciA9IC9cXFxcfCd8XFxyfFxcbnxcXHR8XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIGRhdGEsIHNldHRpbmdzKSB7XG4gICAgdmFyIHJlbmRlcjtcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KVxuICAgICAgICAucmVwbGFjZShlc2NhcGVyLCBmdW5jdGlvbihtYXRjaCkgeyByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07IH0pO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoaW50ZXJwb2xhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBpbnRlcnBvbGF0ZSArIFwiKSk9PW51bGw/Jyc6X190KStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgXCJyZXR1cm4gX19wO1xcblwiO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSkgcmV0dXJuIHJlbmRlcihkYXRhLCBfKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIChzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJykgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbiwgd2hpY2ggd2lsbCBkZWxlZ2F0ZSB0byB0aGUgd3JhcHBlci5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfKG9iaikuY2hhaW4oKTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgcmVzdWx0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICBfLm1peGluKF8pO1xuXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT0gJ3NoaWZ0JyB8fCBuYW1lID09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgXy5leHRlbmQoXy5wcm90b3R5cGUsIHtcblxuICAgIC8vIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgICBjaGFpbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9jaGFpbiA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
