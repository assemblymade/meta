/** @jsx React.DOM */

var Notifications = React.createClass({
  getInitialState: function() {
    return { data: null, acknowledgedAt: this.storedAck() }
  },

  total: function() {
    var count = _.countBy(this.state.data, function(entry){ return entry.count > 0 });
    return count.true;
  },

  sortByCount: function() {
    return _.sortBy(this.state.data, function(entry){ return -entry.count; });
  },

  fetchNotifications: _.debounce(function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }, 1000),

  componentWillMount: function() {
    this.props.title = document.title
    var _this = this;
    $(document).bind('readraptor.tracked', this.fetchNotifications);
    this.onPush(function(event, msg) {
      if (_.contains(msg.mentions, _this.props.username)) {
        _this.desktopNotify(msg);
      }
      _this.fetchNotifications();
    });
    window.visibility(function(visible) {
      if (visible) { _this.fetchNotifications(); }
    });
    _this.fetchNotifications();
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
      icon: 'https://d8izdk6bl4gbi.cloudfront.net/80x/http://f.cl.ly/items/1I2a1j0M0w0V2p3C3Q0M/Assembly-Twitter-Avatar.png',
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
      return a.timestamp;
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
      return (<span />);
    }
    badge = null;
    var classes = "icon-bell";
    var total = this.badgeCount();
    if (total > 0) {
      badge = <span className="badge badge-notification">{total}</span>
      classes += " glyphicon-highlight";
    }

    this.setTitle(total)

    var sorted = this.sortByCount(this.state.data)
    return (
      <li>
        <a href="#notifications" data-toggle="dropdown" onClick={this.onClick}>
          <span className={classes}></span>
          {badge}
        </a>
        <NotificationsList data={sorted} username={this.props.username} />
      </li>
    );
  },

  onClick: function() {
    this.acknowledge()
  },

  acknowledge: function() {
    var timestamp = Math.floor(Date.now() / 1000)
    localStorage.notificationsAck = timestamp
    this.setState({acknowledgedAt: timestamp})
  },

  storedAck: function() {
    timestamp = localStorage.notificationsAck
    if (timestamp == null || timestamp == "null"){
      return 0
    } else {
      return parseInt(timestamp)
    }
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
    return { desktopNotificationsEnabled: false }
  },
  componentDidMount: function() {
    $('[data-toggle]', this.getDOMNode()).tooltip()
  },
  handleDesktopNotificationsStateChange: function(isEnabled) {
    this.setState({desktopNotificationsEnabled: isEnabled})
  },
  render: function() {
    var productNodes = this.props.data.map(function(entry){
      badge = null;
      if (entry.count > 0) {
        badge = <span className="badge pull-right">{entry.count}</span>
      }

      var url = entry.product.url + '/discuss';

      return <li key={entry.product.slug}>
        <a href={url}>{badge} {entry.product.name}</a>
      </li>
    });

    var productsPath = '/users/'+this.props.username;
    var separator = null;
    if (!this.state.desktopNotificationsEnabled) {
      separator = (<li className="divider" />)
    }

    return (
      <ul className="dropdown-menu" style={{"margin-top": 4}}>
        {productNodes}
        <li className="divider" />
        <li><a href={productsPath}>All Products</a></li>
        {separator}
        <li><DesktopNotifications onChange={this.handleDesktopNotificationsStateChange} /></li>
      </ul>
    );
  }
});
