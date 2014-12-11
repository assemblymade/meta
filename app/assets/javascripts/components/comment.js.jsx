// TODO asset pipelined (chrislloyd)
// var marked = require('marked')

var Avatar = require('./avatar.js.jsx')
var Markdown = require('./markdown.js.jsx')

module.exports = React.createClass({
  displayName: 'Comment',

  propTypes: {
    author: React.PropTypes.object.isRequired,
    body: React.PropTypes.string.isRequired,
    timestamp: React.PropTypes.string,
    heartable: React.PropTypes.bool
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
          <div className="gray-2">
            <a className="bold black" href={author.url}>{author.username}</a>
            {timestamp}
          </div>

          <div className={cs}>
            <Markdown content={body} normalized={true} />
          </div>
        </div>
      </div>
    )
  }
});
