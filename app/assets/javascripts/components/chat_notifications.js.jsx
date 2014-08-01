/** @jsx React.DOM */

//= require constants
//= require dispatcher
//= require stores/chat_notifications_store

(function() {
  var ICON_URL = 'https://d8izdk6bl4gbi.cloudfront.net/80x/http://f.cl.ly/items/1I2a1j0M0w0V2p3C3Q0M/Assembly-Twitter-Avatar.png';
  var N = CONSTANTS.CHAT_NOTIFICATIONS;

  window.ChatNotifications = React.createClass({
    articles: function() {
      return _.flatten(_.map(this.state.data, function(a){
        return a.entities;
      }));
    },

    getInitialState: function() {
      return {
        data: null,
        acknowledgedAt: this.storedAck()
      }
    },

    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    sortByLastReadAt: function() {
      return _.sortBy(this.state.data, function(entry){
        return (entry.updated > entry.last_read_at ? 'A' : 'Z') + entry.label;
      });
    },

    fetchNotifications: _.debounce(function() {
      Dispatcher.dispatch({
        action: N.ACTIONS.FETCH_CHAT_ROOMS,
        event: N.EVENTS.CHAT_ROOMS_FETCHED,
        data: this.props.url
      });
    }, 1000),

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

    handleChatRoomsChanged: function() {
      this.setState({
        data: ChatNotificationsStore.getChatRooms()
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
      if (!this.state.data) {
        return <span />;
      }

      var sorted = this.sortByLastReadAt(this.state.data);

      return (
        <NotificationsList data={sorted} username={this.props.username} />
      );
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
    },

    setBadge: function(total) {
      if (window.fluid) {
        window.fluid.dockBadge = total
      }
    }
  });

  var NotificationsList = React.createClass({
    getInitialState: function() {
      return {
        desktopNotificationsEnabled: false
      };
    },

    componentDidMount: function() {
      $('[data-toggle]', this.getDOMNode()).tooltip();
    },

    handleDesktopNotificationsStateChange: function(isEnabled) {
      this.setState({
        desktopNotificationsEnabled: isEnabled
      });
    },

    render: function() {
      var productNodes = this.props.data.map(function(entry){
        var badge = null;

        if (entry.updated > entry.last_read_at) {
          badge = <span
              className="indicator indicator-danger pull-right"
              style={{ 'position': 'relative', 'top': '10px' }} />;
        }

        return <a href={entry.url} key={entry.id} className="list-group-item">
          {badge} {entry.label}
        </a>
      });

      var productsPath = '/users/' + this.props.username;
      var separator = null;

      return (
        <ul className="dropdown-menu" style={{ 'max-height': '400px', 'min-width': '380px' }}>
          <li style={{ height: '300px', 'overflow-y': 'scroll' }}>
            <div className="list-group">
              {productNodes}
            </div>
          </li>
          <li className="divider" style={{ 'margin-top': '0px' }} />
          <li>
            <a href={productsPath}>All Products</a>
          </li>
          <li>
            {!this.state.desktopNotificationsEnabled ? <DesktopNotifications onChange={this.handleDesktopNotificationsStateChange} /> : null}
          </li>
        </ul>
      );
    }
  });
})();
