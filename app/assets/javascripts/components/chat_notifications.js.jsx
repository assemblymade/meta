/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var LocalStorageMixin = require('../mixins/local_storage.js');
var ChatNotificationStore = require('../stores/chat_notifications_store');
var DesktopNotifications = require('./desktop_notifications.js.jsx');

(function() {
  var ICON_URL = 'https://d8izdk6bl4gbi.cloudfront.net/80x/http://f.cl.ly/items/1I2a1j0M0w0V2p3C3Q0M/Assembly-Twitter-Avatar.png';
  var N = CONSTANTS.CHAT_NOTIFICATIONS;

  function dynamicSort(property) {
    var sortOrder = 1;

    if (property[0] === "-") {
     sortOrder = -1;
     property = property.substr(1);
    }

    return function (a, b) {
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

  var ChatNotifications = React.createClass({
    mixins: [LocalStorageMixin],

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
        acknowledgedAt: this.storedAck('chatAck'),
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

    markAllAsRead: function() {
      _.each(_.values(this.state.data), function(entry) {
        ChatNotificationsStore['chat:markRoomAsRead'](entry);
      });

      this.handleChatRoomsChanged();
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
      var productsPath = '/users/' + this.props.username;

      var desktopNotifications = null;
      if (!this.state.desktopNotificationsEnabled) {
        desktopNotifications = <li>
          <DesktopNotifications onChange={this.handleDesktopNotificationsStateChange} />
        </li>;
      }
      return (
        <ul className="dropdown-menu" style={{'min-width': '380px' }}>
          <li ref="spinner" style={{'min-height': 120}}>
            <NotificationsList data={_.first(this.sortByLastReadAt(this.state.data), 7)} />
          </li>
          <li className="divider"></li>
          <li>
            <a href="#" onClick={this.markAllAsRead} className="text-small list-group-item" style={{'border': 'none'}}>
              Mark all as read
            </a>
          </li>
          {desktopNotifications}
        </ul>
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

    storedAckChanged: function() {
      this.setState({
        acknowledgedAt: this.storedAck('chatAck')
      });
    },

    sortByLastReadAt: function(data) {
      if (data === null) {
        return [];
      }

      var values = _.values(data);
      for (var i = 0; i < values.length; i++) {
        var entry = values[i];
        entry.readState = entry.updated > entry.last_read_at ? 'A' : 'Z';
        entry.lastUpdated = - entry.updated
        entry.sortIndex = this.state.sortKeys.indexOf(entry.id);
        if (entry.sortIndex === -1) {
          entry.sortIndex = values.length
        }
      }
      values.sort(dynamicSortMultiple("readState", "lastUpdated", "sortIndex"));

      return values || [];
    }
  });

  var NotificationsList = React.createClass({
    render: function() {
      var productNodes = this.props.data.map(function(entry){
        var badge = null;

        if (entry.updated > entry.last_read_at) {
          badge = <span
              className="indicator indicator-danger pull-right"
              style={{ 'position': 'relative', 'top': '10px' }} />;
        }

        return (
          <a href={entry.url} key={entry.id} className="list-group-item" style={{'border': 'none'}}>
            {badge} {entry.label}
          </a>
        );
      });

      return (
        <div style={{'max-height': 400, 'overflow-y': 'scroll'}}>
          {productNodes}
        </div>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ChatNotifications;
  }

  window.ChatNotifications = ChatNotifications;
})();
