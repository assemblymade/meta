var Markdown = require('./markdown.js.jsx');

var ActivityFeedComment = React.createClass({
  displayName: 'ActivityFeedComment',

  propTypes: {
    author: React.PropTypes.object.isRequired,
    body: React.PropTypes.string.isRequired,
    heartable: React.PropTypes.bool
  },

  render: function() {
    var author = this.props.author;
    var body = this.props.body;

    return (
      <div className="clearfix py2">
        <div className="left mr2 mt1">
          <Avatar user={author} size={18} />
        </div>
        <div className="overflow-hidden gray-2">
          <a className="bold black" href={author.url}>{author.username}</a>

          <div className="activity-body">
            <Markdown content={body} normalized={true} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ActivityFeedComment;
