/** @jsx React.DOM */

(function() {
  var CONSTANTS = require('../../constants').NEWS_FEED_ITEM;
  var NewComment = require('./new_comment.js.jsx');
  var NewsFeedItemStore = require('../../stores/news_feed_item_store');

  var NewsFeedItemComments = React.createClass({
    componentWillMount: function() {
      // If there are a lot of NewsFeedItems, `addChangeListener()`
      // will throw a warning. It seems safe to ignore: it's a bug
      // in Node's EventEmitter implementation. :(
      NewsFeedItemStore.addChangeListener(this.getComments);
    },

    comment: function(comment, optimistic) {
      var style = {
        'margin-bottom': '10px'
      };

      if (optimistic) {
        style.opacity = 0.5;
      }

      return (
        <div className="row comment p2" style={style} key={comment.id}>
          <div className="left mr2">
            <Avatar user={comment.user} size={32} />
          </div>
          <div className="overflow-hidden">
            <div>
                {this.username(comment.user)}
                {this.timestamp(comment.created_at)}
            </div>
            <div>{comment.body}</div>
          </div>
        </div>
      );
    },

    comments: function() {
      return this.state.comments.map(function(comment) {
        return this.comment(comment);
      }.bind(this))
    },

    getComments: function() {
      var comments = NewsFeedItemStore.getComments(this.props.item.id);

      this.setState({
        comment: '',
        comments: this.state.comments.concat(comments.confirmed),
        optimisticComments: comments.optimistic
      });
    },

    getInitialState: function() {
      var item = this.props.item;

      return {
        comments: item.news_feed_item_comments,
        optimisticComments: [],
        url: item.url
      };
    },

    optimisticComments: function() {
      return this.state.optimisticComments.map(function(comment) {
        return this.comment(comment, true);
      }.bind(this));
    },

    render: function() {
      return (
        <div className="well" style={{ 'border-radius': '0px' }}>
          {this.comments()}
          {this.optimisticComments()}
          <hr style={{ 'margin-top': '0px' }}/>
          <NewComment url={this.state.url} thread={this.props.item.id} />
        </div>
      );
    },

    timestamp: function(created_at) {
      return (
        <span className="text-muted mt1">
          {$.timeago(new Date(created_at))}
        </span>
      );
    },

    username: function(user) {
      return (
        <span className="mr2">
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
