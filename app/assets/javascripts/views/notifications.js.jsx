/** @jsx React.DOM */

//= require constants
//= require dispatcher
//= require stores/notifications_store

(function() {
  var ICON_URL = 'https://d8izdk6bl4gbi.cloudfront.net/80x/http://f.cl.ly/items/1I2a1j0M0w0V2p3C3Q0M/Assembly-Twitter-Avatar.png';
  var N = CONSTANTS.NOTIFICATIONS;

  window.Notifications = React.createClass({
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

    total: function() {
      var count = _.countBy(this.state.data, function(entry){ return entry.count > 0 });

      return count.true;
    },

    sortByCount: function() {
      return _.sortBy(this.state.data, function(entry){ return -entry.count; });
    },

    fetchNotifications: _.debounce(function() {
      Dispatcher.dispatch({
        action: N.ACTIONS.FETCH_STORIES,
        event: N.EVENTS.STORIES_FETCHED,
        data: this.props.url
      });
    }, 1000),

    componentWillMount: function() {
      var _this = this;

      $(document).bind('readraptor.tracked', this.fetchNotifications);
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

      NotificationsStore.addChangeListener(N.EVENTS.STORIES_FETCHED, this.getStories);
      this.fetchNotifications();
    },

    getStories: function() {
      this.setState({
        data: NotificationsStore.getStories()
      });
    },

    onPush: function(fn) {
      if (window.pusher) {
        channel = window.pusher.subscribe('@'+this.props.username);
        channel.bind_all(fn);
      }
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

    articles: function() {
      return _.flatten(_.map(this.state.data, function(a){
        return a.entities;
      }));
    },

    latestArticle: function() {
      return _.max(this.articles(), function(a) {
        return a && a.timestamp;
      })
    },

    latestArticleTimestamp: function() {
      var article = this.latestArticle()

      if (article) {
        return article.timestamp
      } else {
        return 0
      }
    },

    badgeCount: function() {
      if (this.latestArticleTimestamp() > this.state.acknowledgedAt) {
        return this.total()
      }
    },

    render: function() {
      if (!this.state.data) {
        return <span />
      }

      var total = this.badgeCount();

      this.setTitle(total)

      var sorted = this.sortByCount(this.state.data);

      return (
        <NotificationsList data={sorted} username={this.props.username} />
      );
    },

    onClick: function() {
      this.acknowledge()
    },

    acknowledge: function() {
      var timestamp = Math.floor(Date.now() / 1000);

      localStorage.notificationsAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });

      this.setTitle(0);
    },

    storedAck: function() {
      timestamp = localStorage.notificationsAck;

      if (timestamp == null || timestamp === "null") {
        return 0
      } else {
        return parseInt(timestamp)
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
    },

    setTitle: function(total) {
      if (total > 0) {
        document.title = '(' + total + ') ' + this.props.title
        this.setBadge(total)
      } else {
        document.title = this.props.title
        this.setBadge('')
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
      $('[data-toggle]', this.getDOMNode()).tooltip()
    },

    handleDesktopNotificationsStateChange: function(isEnabled) {
      this.setState({
        desktopNotificationsEnabled: isEnabled
      });
    },

    render: function() {
      var productNodes = this.props.data.map(function(entry){
        badge = null;

        if (entry.count > 0) {
          badge = <span className="indicator indicator-success pull-right" style={{ 'position': 'relative', 'top': '10px' }}></span>
        }

        var url = entry.product.url + '/chat';

        return <li key={entry.product.slug}>
          <a href={url}>{badge} {entry.product.name}</a>
        </li>
      });

      var productsPath = '/users/' + this.props.username;
      var separator = null;

      if (!this.state.desktopNotificationsEnabled) {
        separator = (<li className="divider" />)
      }

      return (
        <ul className="dropdown-menu">
          {productNodes}
          <li className="divider" />
          <li>
            <a href={productsPath}>All Products</a>
          </li>
          {separator}
          <li>
            <DesktopNotifications onChange={this.handleDesktopNotificationsStateChange} />
          </li>
        </ul>
      );
    }
  });
})();
