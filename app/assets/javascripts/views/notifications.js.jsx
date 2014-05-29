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

      return <li>
        <a href={url}>{badge} {entry.product.name}</a>
      </li>
    });
    return (
      <ul className="dropdown-menu">
        {productNodes}
        <li className="divider" />
        <li><a href={this.props.userPath}>All Products</a></li>
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
    this.fetchNotifications();
    setInterval(this.fetchNotifications, this.props.pollInterval)
  },
  render: function() {
    badge = null;
    var classes = "glyphicon glyphicon-globe";
    var total = this.total();
    if (total > 0) {
      badge = <span className="badge">{total}</span>
      classes += " glyphicon-highlight";
    }

    var sorted = this.sortByCount(this.state.data)
    return (
      <ul className="nav navbar-nav js-notifications">
        <li>
          <a href="#notifications" data-toggle="dropdown">
            <span className={classes}></span>
            {badge}
          </a>
          <NotificationsList data={sorted} userPath={this.props.userPath} />
        </li>
      </ul>
    );
  }
});

var url = $('meta[name=unread-url]').attr('content');
var userPath = $('meta[name=user-url]').attr('content');
React.renderComponent(
  <Notifications url={url} userPath={userPath} pollInterval={5000} />,
  document.getElementById('js-notifications')
)
});
