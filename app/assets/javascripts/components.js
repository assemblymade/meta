(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/activity_feed.js.jsx":[function(require,module,exports){
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
      return React.DOM.div({className: "row", key: this.props.actor.id}, "@", this.props.actor.username, " ", this.props.verb, " ", this.body())
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/avatar.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/chat_notifications.js.jsx":[function(require,module,exports){
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
      // $('[data-toggle]', this.getDOMNode()).tooltip();
      var target = this.refs.spinner.getDOMNode();
      var opts = this.spinnerOptions || {
        lines: 11,
        length: 30,
        radius: 55
      };

      var spinner = this.spinner = new Spinner(opts).spin();
      target.appendChild(spinner.el);
    },

    componentWillMount: function() {
      var _this = this;

      // // TODO: Remove this and use the Dispatcher
      // $(window).bind('storage', this.storedAckChanged);

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
        data: ChatNotificationsStore.getChatRooms(),
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

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/chat_notifications_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/chat_notifications_store.js","./desktop_notifications.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/desktop_notifications.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/chat_notifications_toggler.js.jsx":[function(require,module,exports){
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

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../mixins/dropdown_toggler.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/mixins/dropdown_toggler.js.jsx","../stores/chat_notifications_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/chat_notifications_store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/coin_ownership.js.jsx":[function(require,module,exports){
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

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/coin_ownership_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/coin_ownership_store.js","./avatar.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/avatar.js.jsx","./person_picker.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/person_picker.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/core_team.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/desktop_notifications.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/drag_and_drop_view.js.jsx":[function(require,module,exports){
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

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/dropdown_news_feed.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var EventMixin = require('../mixins/event.js.jsx');
var NewsFeedMixin = require('../mixins/news_feed.js.jsx');
var NewsFeedStore = require('../stores/news_feed_store');
var Avatar = require('./avatar.js.jsx');

(function() {
  var NF = CONSTANTS.NEWS_FEED;

  var DropdownNewsFeed = React.createClass({displayName: 'DropdownNewsFeed',
    mixins: [NewsFeedMixin],

    markAllAsRead: function() {
      Dispatcher.dispatch({
        event: NF.EVENTS.READ_ALL,
        action: NF.ACTIONS.MARK_ALL_AS_READ,
        data: null
      });
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
      var self = this;

      var firstTen = _.first(stories, 10);

      return (
        React.DOM.div({className: "list-group", style: { 'max-height': '300px', 'min-height': '50px'}}, 
           _.map(firstTen, function(story) {
            return Entry({key: story.id, story: story, actors: self.state.actors, fullPage: false});
          }) 
        )
      );
    },

    spinnerOptions: {
      lines: 11,
      top: '20%'
    }
  });

  var Entry = React.createClass({displayName: 'Entry',
    mixins: [EventMixin],

    actors: function() {
      return _.map(
        this.state.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    body: function() {
      var story = this.props.story;
      var task = story.verb === 'Start' ? story.subjects[0] : story.target;

      return (
        React.DOM.span(null, 
          this.verbMap[story.verb], 
          React.DOM.strong(null, 
            this.subjectMap[story.subject_type].call(this, task)
          ), 
          this.product()
        )
      );
    },

    componentDidMount: function() {
      if (this.refs.body) {
        this.refs.body.getDOMNode().innerHTML = this.state.story.subject.body_html;
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
      Dispatcher.dispatch({
        event: NF.EVENTS.READ,
        action: NF.ACTIONS.MARK_AS_READ,
        data: this.props.story.id
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
      var body_preview = this.state.story.body_preview;

      return (
        React.DOM.p({className: "text-muted", style: { 'text-overflow': 'ellipsis'}}, 
          this.ellipsis(body_preview)
        )
      );
    },

    product: function() {
      var story = this.state.story;

      return ' in ' + story.product_name;
    },

    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead()
      });

      return (
        React.DOM.a({className: 'list-group-item ' + classes, 
            href: this.state.story.url, 
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
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DropdownNewsFeed;
  }

  window.DropdownNewsFeed = DropdownNewsFeed;
})();

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../mixins/event.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/mixins/event.js.jsx","../mixins/news_feed.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/mixins/news_feed.js.jsx","../stores/news_feed_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/news_feed_store.js","./avatar.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/avatar.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/dropdown_news_feed_toggler.js.jsx":[function(require,module,exports){
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
      return NewsFeedStore.getUnreadCount(this.state.acknowledgedAt);
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

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../mixins/dropdown_toggler.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/mixins/dropdown_toggler.js.jsx","../stores/news_feed_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/news_feed_store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/financials_view.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

// TODO: Tidy up shared state

/**
 * Right now, both the table and the meter have
 * all of the financials in state; it would be
 * better to move all of this to the FinancialsStore
 */

(function() {
  var FinancialsStore = {
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
      FinancialsStore.setMonth(this.props.reports[0].end_at)
    },

    render: function() {
      var groupedReports = _.reduce(this.props.reports, function(h, r){ h[r.end_at] = r; return h }, {});

      return (
        React.DOM.div({className: "financials"}, 
          FinancialsKey({product: this.props.product}), 

          FinancialsMeter({product: this.props.product, reports: groupedReports}), 
          FinancialsTable({product: this.props.product, reports: groupedReports})
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
          React.DOM.strong(null, moment(this.state.month).format('MMM YYYY'))
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
      var report = this.props.reports[this.state.month];

      var total = report.revenue;
      var costs = report.expenses;

      var annuity = calculateAnnuity(total, costs, report.annuity);
      var expenses = calculateExpenses(total, costs);
      var communityShare = calculateCommunityShare(total, costs, report.annuity);
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
            React.DOM.span(null, '$' + numeral(annuity / 100).format('0,0'))
          ), 
          React.DOM.div({id: "costs-share", 
               className: "progress-bar progress-bar-danger", 
               role: "progress-bar", 
               style: { width: costsWidth + '%'}}, 
            React.DOM.span(null, '$' + numeral(expenses / 100).format('0,0'))
          ), 
          React.DOM.div({id: "assembly-share", 
               className: "progress-bar", 
               role: "progress-bar", 
               style: { width: assemblyWidth + '%', 'background-color': '#fd6b2f'}}, 
            React.DOM.span(null, '$' + numeral(assemblyShare / 100).format('0,0'))
          ), 
          React.DOM.div({id: "community-meter", 
               className: "progress-bar progress-bar-warning", 
               role: "progress-bar", 
               style: { width: communityWidth + '%'}}, 
            React.DOM.span(null, '$' + numeral(communityShare / 100).format('0,0'))
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
      var financials = this.props.reports;

      return _.map(Object.keys(financials), function mapFinancials(month) {
        var report = financials[month];
        var total = report.revenue;
        var costs = report.expenses;

        var profit = calculateProfit(total, costs);
        var annuity = calculateAnnuity(total, costs, report.annuity);
        var expenses = calculateExpenses(total, costs);
        var communityShare = calculateCommunityShare(total, costs, report.annuity);
        var assemblyShare = communityShare * 0.1;

        return (
          self.tRow(month, total, annuity, expenses, assemblyShare, communityShare)
        );
      });
    },

    tRow: function(month, total, annuity, costs, assembly, community) {
      return (
        React.DOM.tr({style: {cursor: 'pointer'}, onMouseOver: this.monthChanged(month), key: month}, 
          React.DOM.td({id: 'financials-' + month}, moment(month).format('MMM YYYY')), 
          React.DOM.td(null, '$' + numeral(total / 100.0).format('0,0')), 
          React.DOM.td({className: "text-right"}, '$' + numeral(costs / 100.0).format('0,0')), 
          React.DOM.td({className: "text-right"}, '$' + numeral(annuity / 100.0).format('0,0')), 
          React.DOM.td({className: "text-right"}, '$' + numeral(assembly / 100.0).format('0,0')), 
          React.DOM.td({className: "text-right"}, '$' + numeral((community - assembly) / 100.0).format('0,0'))
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/form_group.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/full_page_news_feed.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var EventMixin = require('../mixins/event.js.jsx');
var NewsFeedMixin = require('../mixins/news_feed.js.jsx');
var NewsFeedStore = require('../stores/news_feed_store');
var Avatar = require('./avatar.js.jsx');

(function() {
  var NF = CONSTANTS.NEWS_FEED;

  var FullPageNewsFeed = React.createClass({displayName: 'FullPageNewsFeed',
    mixins: [NewsFeedMixin],

    moreButton: function() {
      if (this.state.showMore) {
        return React.DOM.a({href: "#more", className: "btn btn-block", onClick: this.moreStories}, "More");
      }

      return null;
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

          this.moreButton()
        )
      );
    },

    rows: function(stories) {
      var self = this;

      var entries = _.map(stories, function(story) {
        return Entry({key: story.id + 'f', story: story, actors: self.state.actors});
      });

      return (
        React.DOM.div({className: "list-group-item", style: { 'padding-top': '0px', 'padding-bottom': '0px'}}, 
          entries
        )
      );
    }
  });

  var Entry = React.createClass({displayName: 'Entry',
    mixins: [EventMixin],

    actors: function() {
      return _.map(
        this.props.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    body: function() {
      var story = this.props.story;
      var task = story.verb === 'Start' ? story.subjects[0] : story.target;

      return (
        React.DOM.span(null, 
          this.verbMap[story.verb], 
          React.DOM.strong(null, 
            this.subjectMap[story.subject_type].call(this, task)
          )
        )
      );
    },

    isRead: function() {
      return this.props.story.last_read_at !== 0;
    },

    markAsRead: function() {
      Dispatcher.dispatch({
        event: NF.EVENTS.READ,
        action: NF.ACTIONS.MARK_AS_READ,
        data: this.props.story.key
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

      var productName = this.props.story.product_name;

      return (
        React.DOM.div({className: classes + ' row'}, 
          React.DOM.div({className: "col-md-3"}, 
            React.DOM.a({href: '/' + this.props.story.product_slug}, productName), 
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
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = FullPageNewsFeed;
  }

  window.FullPageNewsFeed = FullPageNewsFeed;
})();

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../mixins/event.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/mixins/event.js.jsx","../mixins/news_feed.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/mixins/news_feed.js.jsx","../stores/news_feed_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/news_feed_store.js","./avatar.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/avatar.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/input_preview.js.jsx":[function(require,module,exports){
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

},{"./form_group.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/form_group.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/interest_picker.js.jsx":[function(require,module,exports){
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

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/interest_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/interest_store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_bounty_form.js.jsx":[function(require,module,exports){
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

},{"./form_group.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/form_group.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_friend_bounty.js.jsx":[function(require,module,exports){
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

},{"./invite_bounty_form.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_bounty_form.js.jsx","./popover.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/popover.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_friend_product.js.jsx":[function(require,module,exports){
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

},{"./invite_bounty_form.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_bounty_form.js.jsx","./popover.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/popover.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_list.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/members_view.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/navbar.js.jsx":[function(require,module,exports){
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
            React.DOM.a({href: "#", className: "dropdown-toggle", 'data-toggle': "dropdown", key: 'navbar dropdown'}, 
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

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","./avatar.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/avatar.js.jsx","./chat_notifications.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/chat_notifications.js.jsx","./chat_notifications_toggler.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/chat_notifications_toggler.js.jsx","./dropdown_news_feed.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/dropdown_news_feed.js.jsx","./dropdown_news_feed_toggler.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/dropdown_news_feed_toggler.js.jsx","./title_notifications_count.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/title_notifications_count.js.jsx","./user_navbar_dropdown.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/user_navbar_dropdown.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/notification_preferences_dropdown.js.jsx":[function(require,module,exports){
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

            React.DOM.li({role: "presentation", style: { cursor: 'pointer'}, className: this.selectedClass('announcements')}, 
              React.DOM.a({role: "menuitem", tabIndex: "-1", onClick: this.updatePreference.bind(this, 'announcements', this.props.productAnnouncementsPath)}, 
                React.DOM.div(null, 
                  React.DOM.strong(null, "Follow announcements only")
                ), 
                React.DOM.div({className: "text-muted"}, 
                  "Receive notifications when there are new blog posts"
                )
              )
            ), 

            React.DOM.li({role: "presentation", style: { cursor: 'pointer'}, className: this.selectedClass('following')}, 
              React.DOM.a({role: "menuitem", tabIndex: "-1", onClick: this.updatePreference.bind(this, 'following', this.props.productFollowPath)}, 
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
        case 'following':
          return 'Following';
        case 'announcements':
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
        data: { item: item, path: path, redirectTo: (item == 'following' ? this.props.afterFollowPath : null) }
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NotificationPreferencesDropdown;
  }

  window.NotificationPreferencesDropdown = NotificationPreferencesDropdown;
})();

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/notification_preferences_dropdown_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/notification_preferences_dropdown_store.js","./avatar.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/avatar.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/number_input_view.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/people_view.js.jsx":[function(require,module,exports){
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

},{"../stores/people_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/people_store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/person_picker.js.jsx":[function(require,module,exports){
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

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../stores/person_picker_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/person_picker_store.js","./avatar.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/avatar.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/popover.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/share.js.jsx":[function(require,module,exports){
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

},{"./popover.js.jsx":"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/popover.js.jsx"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/tag_list_view.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var TagListStore = require('../stores/tag_list_store');

(function() {
  var TC = CONSTANTS.TYPEAHEAD;
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

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../stores/tag_list_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/tag_list_store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/text_complete_view.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');

(function() {
  var TC = CONSTANTS.TEXT_COMPLETE;

  var TextComplete = React.createClass({displayName: 'TextComplete',
    mixins: [React.addons.LinkedStateMixin],

    getInitialState: function() {
      return { inputValue: '', transform: (this.props.transform || this.transform) };
    },

    render: function() {
      return (
        React.DOM.div({role: "form", className: "form-inline"}, 
          React.DOM.div({className: "form-group"}, 
            React.DOM.label({className: "sr-only"}, this.props.label), 
            React.DOM.input({type: "text", 
                   className: "form-control input-" + this.size(), 
                   valueLink: this.linkState('inputValue'), 
                   style: {width: this.props.width, 'padding-left': '5px'}}
            )
          ), 
          React.DOM.button({type: "button", 
                  className: "btn btn-default btn-" + this.size() + ' ' + this.active(), 
                  onClick: this.handleClick}, 
            this.props.prompt
          )
        )
      );
    },

    size: function(prefix) {
      switch (this.props.size) {
      case 'small':
        return 'sm';
      case 'medium':
        return 'md';
      case 'large':
        return 'lg';
      }
    },

    active: function() {
      return this.state.inputValue.length >= 2 ? '' : 'disabled';
    },

    componentDidMount: function() {
      Dispatcher.dispatch({
        action: TC.ACTIONS.SETUP,
        data: this.getDOMNode(),
        event: TC.EVENTS.DID_MOUNT
      });
    },

    handleClick: function(e) {
      Dispatcher.dispatch({
        action: TC.ACTIONS.ADD_TAG,
        data: { tag: this.state.transform(this.state.inputValue), url: this.props.url },
        event: TC.EVENTS.TAG_ADDED + '-true'
      });

      this.setState({
        inputValue: ''
      });
    },

    transform: function(text) {
      return text.replace(/[^\w-]+/g, '-').toLowerCase()
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = TextComplete;
  }

  window.TextComplete = TextComplete;
})();
},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/timestamp.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/tips_ui.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/title_notifications_count.js.jsx":[function(require,module,exports){
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

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../stores/chat_notifications_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/chat_notifications_store.js","../stores/news_feed_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/news_feed_store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/toggle_button.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var ButtonStore = require('../stores/toggle_button_store');

(function() {
  var B = CONSTANTS.TOGGLE_BUTTON;

  var ToggleButton = React.createClass({displayName: 'ToggleButton',
    propTypes: {
      text: React.PropTypes.object.isRequired,
      classes: React.PropTypes.object.isRequired,
      href: React.PropTypes.object.isRequired
    },

    buttonText: function() {
      return this.props.text[this.state.bool];
    },

    classes: function() {
      return "btn btn-block " + this.props.classes[this.state.bool];
    },

    getInitialState: function() {
      return {
        bool: !!this.props.bool
      };
    },

    onClick: function(e) {
      e.preventDefault();

      Dispatcher.dispatch({
        action: B.ACTIONS.CLICK,
        event: B.EVENTS.CLICKED,
        data: this.props.href[this.state.bool]
      });

      // For now, optimistically changing the button's state
      // is probably fine. We might want to add error handling
      // in at some point along the lines of FormGroup
      this.setState({
        bool: !this.state.bool
      });
    },

    render: function() {
      return React.DOM.a({className: this.classes(), onClick: this.onClick}, this.buttonText())
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ToggleButton;
  }

  window.ToggleButton = ToggleButton;
})();

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../stores/toggle_button_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/toggle_button_store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/typeahead.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');

(function() {
  var TC = CONSTANTS.TYPEAHEAD;

  var Typeahead = React.createClass({displayName: 'Typeahead',
    mixins: [React.addons.LinkedStateMixin],

    getInitialState: function() {
      return { inputValue: '', transform: (this.props.transform || this.transform) };
    },

    render: function() {
      return (
        React.DOM.div({role: "form", className: "form-inline"}, 
          React.DOM.div({className: "form-group"}, 
            React.DOM.label({className: "sr-only"}, this.props.label), 
            React.DOM.input({type: "text", 
                   className: "form-control input-" + this.size(), 
                   valueLink: this.linkState('inputValue'), 
                   style: {width: this.props.width, 'padding-left': '5px'}}
            )
          ), 
          React.DOM.button({type: "button", 
                  className: "btn btn-default btn-" + this.size() + ' ' + this.active(), 
                  onClick: this.handleClick}, 
            this.props.prompt
          )
        )
      );
    },

    size: function(prefix) {
      switch (this.props.size) {
      case 'small':
        return 'sm';
      case 'medium':
        return 'md';
      case 'large':
        return 'lg';
      }
    },

    active: function() {
      return this.state.inputValue.length >= 2 ? '' : 'disabled';
    },

    componentDidMount: function() {
      Dispatcher.dispatch({
        action: TC.ACTIONS.SETUP,
        data: this.getDOMNode(),
        event: TC.EVENTS.DID_MOUNT
      });
    },

    handleClick: function(e) {
      Dispatcher.dispatch({
        action: TC.ACTIONS.ADD_TAG,
        data: { tag: this.state.transform(this.state.inputValue), url: this.props.url },
        event: TC.EVENTS.TAG_ADDED + '-true'
      });

      this.setState({
        inputValue: ''
      });
    },

    transform: function(text) {
      return text.replace(/[^\w-]+/g, '-').toLowerCase()
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Typeahead;
  }

  window.Typeahead = Typeahead;
})();

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/urgency.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/components/user_navbar_dropdown.js.jsx":[function(require,module,exports){
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
            React.DOM.a({href: this.props.balancePath}, 
              React.DOM.span({className: "icon icon-wallet dropdown-glyph"}), 
              "Balance"
            )
          ), 

          React.DOM.li(null, 
            React.DOM.a({href: this.props.editUserPath}, 
              React.DOM.span({className: "icon icon-settings dropdown-glyph"}), 
              "Settings"
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js":[function(require,module,exports){
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
      },
      MORE_STORIES_LENGTH: 20
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
        SETUP: 'SETUP',
      },
      EVENTS: {
        DID_MOUNT: 'DID_MOUNT',
      }
    },

    TOGGLE_BUTTON: {
      ACTIONS: {
        CLICK: 'toggleButton:click'
      },
      EVENTS: {
        CLICKED: 'toggleButton:clicked'
      }
    },

    TYPEAHEAD: {
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/mixins/dropdown_toggler.js.jsx":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/mixins/event.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */(function() {
  var EventMixin = {
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
      'Close': 'closed ',
      'Start': 'started '
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = EventMixin;
  }

  window.EventMixin = EventMixin;
})();

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/mixins/news_feed.js.jsx":[function(require,module,exports){
/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var NewsFeedStore = require('../stores/news_feed_store');
var NewsFeedUsersStore = require('../stores/news_feed_users_store');
var update = require('react/lib/update');

(function() {
  var NF = CONSTANTS.NEWS_FEED;

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
        stories: null,
        showMore: true
      };
    },

    getStories: function() {
      var self = this;

      var oldStoriesCount = this.state.stories && this.state.stories.length;
      var newStories = NewsFeedStore.getStories();

      this.setState({
        stories: newStories,
        actors: NewsFeedUsersStore.getUsers(),
        showMore: (newStories.length - oldStoriesCount >= NF.MORE_STORIES_LENGTH)
      }, function() {
        if (self.state.stories.length) {
          self.spinner.stop();
        }
      });
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
        channel = window.pusher.subscribe('@' + this.props.username);
        channel.bind_all(fn);
      }
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedMixin;
  }

  window.NewsFeedMixin = NewsFeedMixin;
})();

},{"../constants":"/Users/dave/code/asm/asm-web/app/assets/javascripts/constants.js","../stores/news_feed_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/news_feed_store.js","../stores/news_feed_users_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/news_feed_users_store.js","react/lib/update":"/Users/dave/code/asm/asm-web/node_modules/react/lib/update.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/chat_notifications_store.js":[function(require,module,exports){
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
    },

    'chat:fetchChatRooms': function(url) {
      window.xhr.get(url, this.handleFetchedChatRooms.bind(this));
    },

    getUnreadCount: function(acknowledgedAt) {
      var count = _.countBy(
        _chatRooms,
        function(entry) {
          var updated = entry.updated > entry.last_read_at;

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
          _chatRooms[keys[i]].last_read_at = _optimisticallyUpdatedChatRooms[keys[i]].last_read_at;
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

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js","../xhr":"/Users/dave/code/asm/asm-web/app/assets/javascripts/xhr.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/coin_ownership_store.js":[function(require,module,exports){
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

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/interest_store.js":[function(require,module,exports){
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

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js","../xhr":"/Users/dave/code/asm/asm-web/app/assets/javascripts/xhr.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/news_feed_store.js":[function(require,module,exports){
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

    applyReadTimes: function(data, stories) {
      for (var i = 0, l = data.length; i < l; i++) {
        var datum = data[i];

        if (datum.last_read_at && stories[datum.key]) {
          stories[datum.key].last_read_at = datum.last_read_at;
        }
      }
    },

    handleFetchedStories: function(err, data) {
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

      if (!_.isEmpty(users)) {
        NewsFeedUsersStore.setUsers(users);
      }

      var url = READ_RAPTOR_URL +
        '/readers/' +
        app.currentUser().get('id') +
        '/articles?' +
        _.map(
          stories,
          function(s) {
            return 'key=' + s.key
          }
        ).join('&')

      window.xhr.noCsrfGet(url, this.handleReadRaptor(stories));
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
        self.setStories(stories);
        self.emit(_deferred.pop());
      };
    },

    'newsFeed:acknowledge': function(timestamp) {},

    'newsFeed:fetchStories': function(url) {
      window.xhr.get(url, this.handleFetchedStories.bind(this));
    },

    'newsFeed:fetchMoreStories': function(url) {
      window.xhr.get(url, this.handleFetchedStories.bind(this));
    },

    'newsFeed:markAsRead': function(storyId) {
      var url = '/user/tracking/' + storyId;

      window.xhr.get(url, this.markedAsRead(storyId));
    },

    'newsFeed:markAllAsRead': function() {
      var unread = _.filter(_stories, function(story) {
        return story.last_read_at === 0;
      });

      var self = this;

      for (var i = 0, l = unread.length; i < l; i++) {
        var story = unread[i];
        var url = story.url;

        window.xhr.get(url, self.markedAsRead(story.key, true, (i + 1 === l)));
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

    markedAsRead: function(storyKey, wait, ready) {
      var self = this;

      return function markedAsRead(err, data) {
        if (err) {
          return console.error(err);
        }

        var story = self.getStory(storyKey);

        // FIXME: Use the value from Readraptor
        story.last_read_at = moment().unix();

        self.setStory(story);

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

    getStory: function(key) {
      return _stories[key];
    },

    getStories: function() {
      var stories = [];

      for (var i in _stories) {
        stories.push(_stories[i]);
      }

      stories.sort(function(a, b) {
        return (b.updated - a.updated);
      });

      return stories;
    },

    getUnreadCount: function(timestamp) {
      var count = _.countBy(
        _stories,
        function(entry) {
          if (timestamp) {
            return entry.updated > entry.last_read_at && entry.updated > timestamp;
          }
        }
      );

      return count.true || 0;
    },

    setStory: function(story) {
      _stories[story.key] = story;
    },

    setStories: function(stories) {
      for (var story in _optimisticStories) {
        if (stories.hasOwnProperty(story)) {
          stories[story].last_read_at = _optimisticStories[story].last_read_at;
        }
      }

      _optimisticStories = {};

      for (var s in stories) {
        _stories[s] = stories[s];
      }
    },

    removeStory: function(key) {
      delete _stories[key];
    },

    removeAllStories: function() {
      _stories = [];
    }
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
    module.exports = _newsFeedStore;
  }

  window.NewsFeedStore = _newsFeedStore;
})();

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/news_feed_users_store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/news_feed_users_store.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js","../xhr":"/Users/dave/code/asm/asm-web/app/assets/javascripts/xhr.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/news_feed_users_store.js":[function(require,module,exports){
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

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js","../xhr":"/Users/dave/code/asm/asm-web/app/assets/javascripts/xhr.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/notification_preferences_dropdown_store.js":[function(require,module,exports){
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

      window.xhr.post(path, {}, function(){
        if (data.redirectTo) {
          app.redirectTo(data.redirectTo)
        }
      });

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

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js","../xhr":"/Users/dave/code/asm/asm-web/app/assets/javascripts/xhr.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/people_store.js":[function(require,module,exports){
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

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/person_picker_store.js":[function(require,module,exports){
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

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js":[function(require,module,exports){
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

},{}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/tag_list_store.js":[function(require,module,exports){
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

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/toggle_button_store.js":[function(require,module,exports){
var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var _store = Object.create(Store);

  var _buttonStore = _.extend(_store, {
    'toggleButton:click': function(url) {
      xhr.patch(url);
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
    module.exports = _buttonStore;
  }

  window.ButtonStore = _buttonStore;
})();

},{"../dispatcher":"/Users/dave/code/asm/asm-web/app/assets/javascripts/dispatcher.js","../stores/store":"/Users/dave/code/asm/asm-web/app/assets/javascripts/stores/store.js","../xhr":"/Users/dave/code/asm/asm-web/app/assets/javascripts/xhr.js"}],"/Users/dave/code/asm/asm-web/app/assets/javascripts/xhr.js":[function(require,module,exports){
(function() {
  var xhr = {
    get: function(path, callback) {
      this.request('GET', path, null, callback);
    },

    noCsrfGet: function(path, callback) {
      this.noCsrfRequest('GET', path, null, callback);
    },

    patch: function(path, data, callback) {
      this.request('PATCH', path, data, callback);
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

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          return callback(null, request.responseText);
        }

        callback(new Error(request.responseText));
      };

      // bypass the browser's cache: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
      request.open(method, path + ((/\?/).test(path) ? "&" : "?") + (new Date()).getTime(), true);
      request.send(data);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = xhr;
  }

  window.xhr = xhr;
})();

},{}],"/Users/dave/code/asm/asm-web/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"/Users/dave/code/asm/asm-web/node_modules/react/lib/copyProperties.js":[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule copyProperties
 */

/**
 * Copy properties from one or more objects (up to 5) into the first object.
 * This is a shallow copy. It mutates the first object and also returns it.
 *
 * NOTE: `arguments` has a very significant performance penalty, which is why
 * we don't support unlimited arguments.
 */
function copyProperties(obj, a, b, c, d, e, f) {
  obj = obj || {};

  if ("production" !== process.env.NODE_ENV) {
    if (f) {
      throw new Error('Too many arguments passed to copyProperties');
    }
  }

  var args = [a, b, c, d, e];
  var ii = 0, v;
  while (args[ii]) {
    v = args[ii++];
    for (var k in v) {
      obj[k] = v[k];
    }

    // IE ignores toString in object iteration.. See:
    // webreflection.blogspot.com/2007/07/quick-fix-internet-explorer-and.html
    if (v.hasOwnProperty && v.hasOwnProperty('toString') &&
        (typeof v.toString != 'undefined') && (obj.toString !== v.toString)) {
      obj.toString = v.toString;
    }
  }

  return obj;
}

module.exports = copyProperties;

}).call(this,require('_process'))
},{"_process":"/Users/dave/code/asm/asm-web/node_modules/browserify/node_modules/process/browser.js"}],"/Users/dave/code/asm/asm-web/node_modules/react/lib/invariant.js":[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))
},{"_process":"/Users/dave/code/asm/asm-web/node_modules/browserify/node_modules/process/browser.js"}],"/Users/dave/code/asm/asm-web/node_modules/react/lib/keyOf.js":[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule keyOf
 */

/**
 * Allows extraction of a minified key. Let's the build system minify keys
 * without loosing the ability to dynamically use key strings as values
 * themselves. Pass in an object with a single key/val pair and it will return
 * you the string key of that single record. Suppose you want to grab the
 * value for a key 'className' inside of an object. Key/val minification may
 * have aliased that key to be 'xa12'. keyOf({className: null}) will return
 * 'xa12' in that case. Resolve keys you want to use once at startup time, then
 * reuse those resolutions.
 */
var keyOf = function(oneKeyObj) {
  var key;
  for (key in oneKeyObj) {
    if (!oneKeyObj.hasOwnProperty(key)) {
      continue;
    }
    return key;
  }
  return null;
};


module.exports = keyOf;

},{}],"/Users/dave/code/asm/asm-web/node_modules/react/lib/update.js":[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule update
 */

"use strict";

var copyProperties = require("./copyProperties");
var keyOf = require("./keyOf");
var invariant = require("./invariant");

function shallowCopy(x) {
  if (Array.isArray(x)) {
    return x.concat();
  } else if (x && typeof x === 'object') {
    return copyProperties(new x.constructor(), x);
  } else {
    return x;
  }
}

var COMMAND_PUSH = keyOf({$push: null});
var COMMAND_UNSHIFT = keyOf({$unshift: null});
var COMMAND_SPLICE = keyOf({$splice: null});
var COMMAND_SET = keyOf({$set: null});
var COMMAND_MERGE = keyOf({$merge: null});
var COMMAND_APPLY = keyOf({$apply: null});

var ALL_COMMANDS_LIST = [
  COMMAND_PUSH,
  COMMAND_UNSHIFT,
  COMMAND_SPLICE,
  COMMAND_SET,
  COMMAND_MERGE,
  COMMAND_APPLY
];

var ALL_COMMANDS_SET = {};

ALL_COMMANDS_LIST.forEach(function(command) {
  ALL_COMMANDS_SET[command] = true;
});

function invariantArrayCase(value, spec, command) {
  ("production" !== process.env.NODE_ENV ? invariant(
    Array.isArray(value),
    'update(): expected target of %s to be an array; got %s.',
    command,
    value
  ) : invariant(Array.isArray(value)));
  var specValue = spec[command];
  ("production" !== process.env.NODE_ENV ? invariant(
    Array.isArray(specValue),
    'update(): expected spec of %s to be an array; got %s. ' +
    'Did you forget to wrap your parameter in an array?',
    command,
    specValue
  ) : invariant(Array.isArray(specValue)));
}

function update(value, spec) {
  ("production" !== process.env.NODE_ENV ? invariant(
    typeof spec === 'object',
    'update(): You provided a key path to update() that did not contain one ' +
    'of %s. Did you forget to include {%s: ...}?',
    ALL_COMMANDS_LIST.join(', '),
    COMMAND_SET
  ) : invariant(typeof spec === 'object'));

  if (spec.hasOwnProperty(COMMAND_SET)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      Object.keys(spec).length === 1,
      'Cannot have more than one key in an object with %s',
      COMMAND_SET
    ) : invariant(Object.keys(spec).length === 1));

    return spec[COMMAND_SET];
  }

  var nextValue = shallowCopy(value);

  if (spec.hasOwnProperty(COMMAND_MERGE)) {
    var mergeObj = spec[COMMAND_MERGE];
    ("production" !== process.env.NODE_ENV ? invariant(
      mergeObj && typeof mergeObj === 'object',
      'update(): %s expects a spec of type \'object\'; got %s',
      COMMAND_MERGE,
      mergeObj
    ) : invariant(mergeObj && typeof mergeObj === 'object'));
    ("production" !== process.env.NODE_ENV ? invariant(
      nextValue && typeof nextValue === 'object',
      'update(): %s expects a target of type \'object\'; got %s',
      COMMAND_MERGE,
      nextValue
    ) : invariant(nextValue && typeof nextValue === 'object'));
    copyProperties(nextValue, spec[COMMAND_MERGE]);
  }

  if (spec.hasOwnProperty(COMMAND_PUSH)) {
    invariantArrayCase(value, spec, COMMAND_PUSH);
    spec[COMMAND_PUSH].forEach(function(item) {
      nextValue.push(item);
    });
  }

  if (spec.hasOwnProperty(COMMAND_UNSHIFT)) {
    invariantArrayCase(value, spec, COMMAND_UNSHIFT);
    spec[COMMAND_UNSHIFT].forEach(function(item) {
      nextValue.unshift(item);
    });
  }

  if (spec.hasOwnProperty(COMMAND_SPLICE)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      Array.isArray(value),
      'Expected %s target to be an array; got %s',
      COMMAND_SPLICE,
      value
    ) : invariant(Array.isArray(value)));
    ("production" !== process.env.NODE_ENV ? invariant(
      Array.isArray(spec[COMMAND_SPLICE]),
      'update(): expected spec of %s to be an array of arrays; got %s. ' +
      'Did you forget to wrap your parameters in an array?',
      COMMAND_SPLICE,
      spec[COMMAND_SPLICE]
    ) : invariant(Array.isArray(spec[COMMAND_SPLICE])));
    spec[COMMAND_SPLICE].forEach(function(args) {
      ("production" !== process.env.NODE_ENV ? invariant(
        Array.isArray(args),
        'update(): expected spec of %s to be an array of arrays; got %s. ' +
        'Did you forget to wrap your parameters in an array?',
        COMMAND_SPLICE,
        spec[COMMAND_SPLICE]
      ) : invariant(Array.isArray(args)));
      nextValue.splice.apply(nextValue, args);
    });
  }

  if (spec.hasOwnProperty(COMMAND_APPLY)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof spec[COMMAND_APPLY] === 'function',
      'update(): expected spec of %s to be a function; got %s.',
      COMMAND_APPLY,
      spec[COMMAND_APPLY]
    ) : invariant(typeof spec[COMMAND_APPLY] === 'function'));
    nextValue = spec[COMMAND_APPLY](nextValue);
  }

  for (var k in spec) {
    if (!(ALL_COMMANDS_SET.hasOwnProperty(k) && ALL_COMMANDS_SET[k])) {
      nextValue[k] = update(value[k], spec[k]);
    }
  }

  return nextValue;
}

module.exports = update;

}).call(this,require('_process'))
},{"./copyProperties":"/Users/dave/code/asm/asm-web/node_modules/react/lib/copyProperties.js","./invariant":"/Users/dave/code/asm/asm-web/node_modules/react/lib/invariant.js","./keyOf":"/Users/dave/code/asm/asm-web/node_modules/react/lib/keyOf.js","_process":"/Users/dave/code/asm/asm-web/node_modules/browserify/node_modules/process/browser.js"}],"spin.js":[function(require,module,exports){
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

},{}]},{},["/Users/dave/code/asm/asm-web/app/assets/javascripts/components/activity_feed.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/avatar.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/chat_notifications.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/chat_notifications_toggler.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/coin_ownership.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/core_team.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/desktop_notifications.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/drag_and_drop_view.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/dropdown_news_feed.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/dropdown_news_feed_toggler.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/financials_view.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/form_group.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/full_page_news_feed.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/input_preview.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/interest_picker.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_bounty_form.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_friend_bounty.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_friend_product.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/invite_list.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/members_view.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/navbar.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/notification_preferences_dropdown.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/number_input_view.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/people_view.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/person_picker.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/popover.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/share.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/tag_list_view.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/text_complete_view.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/timestamp.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/tips_ui.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/title_notifications_count.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/toggle_button.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/typeahead.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/urgency.js.jsx","/Users/dave/code/asm/asm-web/app/assets/javascripts/components/user_navbar_dropdown.js.jsx"]);
