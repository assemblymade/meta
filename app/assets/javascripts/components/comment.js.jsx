// TODO asset pipelined (chrislloyd)
// var marked = require('marked')

var Avatar = require('./avatar.js.jsx');
var Love = require('./love.js.jsx');
var Markdown = require('./markdown.js.jsx');

module.exports = React.createClass({
  displayName: 'Comment',

  propTypes: {
    author: React.PropTypes.object.isRequired,
    awardUrl: React.PropTypes.string,
    body: React.PropTypes.string.isRequired,
    timestamp: React.PropTypes.string,
    heartable: React.PropTypes.bool,
    heartableId: React.PropTypes.string
  },

  isOptimistic: function() {
    return !!this.props.optimistic;
  },

  render: function() {
    var author = this.props.author
    var timestamp = null
    var body = null
    var hearts = null

    var cs = React.addons.classSet({
      'activity-body': true,
      'gray-dark': this.isOptimistic()
    })

    if (this.props.timestamp) {
      timestamp = (
        <span>
          {' '} <time>{$.timeago(this.props.timestamp)}</time>
        </span>
      )
    }

    if (this.isOptimistic()) {
      body = window.marked(this.props.body);
    } else {
      body = this.props.body;
    }

    return (
      <div className="timeline-item">
        <div className="left activity-avatar">
          <Avatar user={author} size={30} />
        </div>
        <div className="overflow-hidden activity-body px3">
          <div className="gray-2" style={{ display: 'inline-block' }}>
            <a className="bold black" href={author.url}>{author.username}</a>
            {this.renderLove()}
          </div>
          {this.renderEllipsisMenu()}

          <div className={cs}>
            <Markdown content={body} normalized={true} />
          </div>
        </div>
      </div>
    )
  },

  renderEllipsisMenu: function() {
    if (this.props.awardUrl) {
      return [
        <a href="javascript:void(0);"
            className="dropdown-toggle"
            id={"dropdown-" + this.props.heartableId}
            data-toggle="dropdown">
          <span className="icon icon-ellipsis" style={{ fontSize: 18 }} />
        </a>,

        <ul className="dropdown-menu right text-small"
            role="menu"
            aria-labelledby={"dropdown-" + this.props.heartableId}>
          <li>
            <a class="event-award"
                href={this.props.awardUrl + '?event_id=' + this.props.heartableId}
                data-method="patch"
                data-confirm={'Are you sure you want to award this task to ' + this.props.author.username + '?'}>
              {'Award bounty to ' + this.props.author.username + ' and keep it open'}
            </a>
          </li>

          <li>
            <a class="event-award"
                href={this.props.awardUrl + '?event_id=' + this.props.heartableId + '&close=true'}
                data-method="patch"
                data-confirm={'Are you sure you want to award this task to ' + this.props.author.username + '?'}>
              {'Award bounty to ' + this.props.author.username + ' and close it'}
            </a>
          </li>
        </ul>
      ];
    }
  },

  renderLove: function() {
    if (this.props.heartable) {
      return (
        <div className="ml2 right" style={{ display: 'inline-block' }}>
          <Love heartable_id={this.props.heartableId} heartable_type='NewsFeedItemComment' />
        </div>
      );
    }
  }
});
