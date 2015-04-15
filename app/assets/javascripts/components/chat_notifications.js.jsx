'use strict';

const ActionTypes = require('../constants').ActionTypes;
const ChatNotificationsActions = require('../actions/chat_notifications_actions');
const ChatNotificationsStore = require('../stores/chat_notifications_store');
const DesktopNotifications = require('./desktop_notifications.js.jsx');
const Dispatcher = require('../dispatcher');
const LocalStorageMixin = require('../mixins/local_storage.js');
const Spinner = require('./spinner.js.jsx');
const UserStore = require('../stores/user_store.js');

const NotificationsList = React.createClass({
  render: function() {
    var productNodes = this.props.chatRooms.map(function(entry) {
      var label = entry.product_name ? entry.product_name : `#${entry.label}`;
      var badge = null;

      if (entry.updated > entry.last_read_at) {
        badge = <span
            className="indicator indicator-danger pull-right"
            style={{ 'position': 'relative', 'top': '10px' }} />;
      }

      return (
        <a href={entry.url} key={entry.id} className="list-group-item" style={{ border: 'none'}}>
          {badge} {label}
        </a>
      );
    });

    return (
      <div style={{ maxHeight: 400, overflowY: 'scroll'}}>
        {productNodes}
      </div>
    );
  }
});

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

const ChatNotifications = React.createClass({
  mixins: [LocalStorageMixin],

  articles: function() {
    return _.flatten(_.map(this.state.chatRooms, function(a){
      return a.entities;
    }));
  },

  componentDidMount: function() {
    this.onPush((event, msg) => {
      if (event === ActionTypes.USER_MENTIONED) {
        this.desktopNotify(msg);
      }

      this.fetchChatRooms(this.props.url);
    });

    window.visibility((visible) => {
      if (visible) {
        this.fetchChatRooms(this.props.url);
      }
    });

    ChatNotificationsStore.addChangeListener(this.handleChatRoomsChanged);
    this.fetchChatRooms(this.props.url);
  },

  componentWillUnmount: function() {
    ChatNotificationsStore.removeChangeListener(
      this.handleChatRoomsChanged
    )
  },

  desktopNotify: function(event) {
    var options = {
      body: event.body,
      tag: event.tag,
      icon: (event.icon || '/assets/asm-logo-flag-2x.png'),
      timeout: 15,

      notifyClick: function() {
        $(window).focus();
        if (window.location.href.indexOf(event.url) == -1) {
            window.location = event.url
        }
      }
    }
    var n = new Notify(event.title, options);

    return n.show();
  },

  fetchChatRooms: _.debounce(ChatNotificationsActions.fetchChatRooms, 1000),

  getDefaultProps: function() {
    return {
      title: document.title
    };
  },

  getInitialState: function() {
    return {
      chatRooms: ChatNotificationsStore.getChatRooms(),
      sortKeys: [],
      acknowledgedAt: this.storedAck('chatAck'),
      desktopNotificationsEnabled: false
    };
  },

  handleChatRoomsChanged: function() {
    var chatRooms = ChatNotificationsStore.getChatRooms();

    this.setState({
      chatRooms: chatRooms,
      sortKeys: ChatNotificationsStore.getSortKeys(),
      spin: _.isEmpty(chatRooms)
    });
  },

  handleDesktopNotificationsStateChange: function(isEnabled) {
    this.setState({
      desktopNotificationsEnabled: isEnabled
    });
  },

  onPush: function(fn) {
    if (window.pusher) {
      var channel = window.pusher.subscribe('user.' + UserStore.getId())
      channel.bind_all(fn)
    }
  },

  markAllAsRead: function() {
    _.each(_.values(this.state.chatRooms), function(chatRoom) {
      ChatNotificationsActions.markRoomAsRead(chatRoom.id, chatRoom.readraptor_url);
    });
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
      <ul className="dropdown-menu" style={{ minWidth: '380px' }}>
        <li style={{ minHeight: '120px' }}>
          {this.renderList()}
        </li>

        <li className="divider"></li>

        <li>
          <a href="javascript:void(0);" onClick={this.markAllAsRead} className="text-small list-group-item" style={{'border': 'none'}}>
            Mark all as read
          </a>
        </li>

        {desktopNotifications}
      </ul>
    );
  },

  renderList: function() {
    if (this.state.spin) {
      return <Spinner />;
    }

    if (_.isEmpty(this.state.chatRooms)) {
      return (
        <a href="/chat/general" className="list-group-item" style={{ border: 'none' }}>
          Community chat
        </a>
      );
    }

    return <NotificationsList chatRooms={this.sortByLastReadAt(this.state.chatRooms)} />;
  },

  storedAckChanged: function() {
    this.setState({
      acknowledgedAt: this.storedAck('chatAck')
    });
  },

  sortByLastReadAt: function(chatRooms) {
    if (chatRooms === null) {
      return [];
    }

    var values = _.values(chatRooms);
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

module.exports = window.ChatNotifications = ChatNotifications;
