/** @jsx React.DOM */
$(document).ready(function() {

var NotificationsList = React.createClass({
  render: function() {
    var productNodes = this.props.data.map(function(entry){
      badge = null;
      if (entry.messages > 0) {
        badge = <span className="badge pull-right">{entry.messages}</span>
      }

      var url = entry.product.url + '/discuss';

      return <li key={entry.product.slug}>
        <a href={url}>{badge} {entry.product.name}</a>
      </li>
    });

    var productsPath = '/users/'+this.props.username;
    return (
      <ul className="dropdown-menu">
        {productNodes}
        <li className="divider" />
        <li><a href={productsPath}>All Products</a></li>
      </ul>
    );
  }
});

var Notifications = React.createClass({
  getInitialState: function() {
    return { data: [] }
  },
  total: function() {
    var count = _.countBy(this.state.data, function(entry){ return entry.messages > 0 });
    return count.true;
  },
  sortByCount: function() {
    return _.sortBy(this.state.data, function(entry){ return -entry.messages; });
  },
  fetchNotifications: function() {
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
  },
  componentWillMount: function() {
    var debouncedFetch = _.debounce(this.fetchNotifications, 1000);

    $(document).bind('readraptor.tracked', debouncedFetch);
    if (window.pusher) {
      channel = window.pusher.subscribe('@'+this.props.username);
      channel.bind('chat', debouncedFetch);
    }
    window.visibility(function(visible) {
      if (visible) { debouncedFetch(); }
    });
    debouncedFetch();
  },
  render: function() {
    badge = null;
    var classes = "glyphicon glyphicon-bell";
    var total = this.total();
    if (total > 0) {
      badge = <span className="badge">{total}</span>
      classes += " glyphicon-highlight";
    }

    var sorted = this.sortByCount(this.state.data)
    return (
      <ul className="nav navbar-nav navbar-notifications js-notifications">
        <li>
          <a href="#notifications" data-toggle="dropdown">
            <span className={classes}></span>
            {badge}
          </a>
          <NotificationsList data={sorted} username={this.props.username} />
        </li>
      </ul>
    );
  }
});

var url = $('meta[name=unread-url]').attr('content');
var username = $('meta[name=user-username]').attr('content');
React.renderComponent(
  <Notifications url={url} username={username} />,
  document.getElementById('js-notifications')
)
});
