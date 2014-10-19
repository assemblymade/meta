/** @jsx React.DOM */

(function() {
  var NewComment = require('./new_comment.js.jsx');

  var NewsFeedItemComments = React.createClass({
    comment: function (comment) {
      return (
        <div className="row comment" style={{ 'margin-bottom': '10px' }}>
          <div className="col-md-1 hidden-sm hidden-xs">
            <Avatar user={comment.user} size={32} />
          </div>
          <div className="col-md-11">
            <div className="row">
              <div className="col-md-12">
                {this.username(comment.user)}
                {this.timestamp(comment.created_at)}
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <span>{comment.body}</span>
              </div>
            </div>
          </div>
        </div>
      );
    },

    comments: function() {
      return this.props.comments.map(function(comment) {
        return this.comment(comment);
      }.bind(this))
    },

    render: function() {
      return (
        <div className="well" style={{ 'border-radius': '0px' }}>
          {this.comments()}
          <hr />
          <NewComment url={this.props.url} />
        </div>
      );
    },

    timestamp: function(created_at) {
      return (
        <span className="text-muted" style={{ 'margin-top': '5px' }}>
          {$.timeago(new Date(created_at))}
        </span>
      );
    },

    username: function(user) {
      return (
        <span style={{ 'margin-right': '10px' }}>
          <strong>
            <a href={user.url}>{user.username}</a>
          </strong>
        </span>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItemComments;
  }

  window.NewsFeedItemComments = NewsFeedItemComments
})();
