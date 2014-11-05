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
      var className = 'gray-darker';
      if (optimistic) {
        className = 'gray-light';
      }

      var user = comment.user

      // TODO The line-height=18 is a hack. The `h6` should set the LH.

      return (
        <div className="h6 mt0 mb3 clearfix" key={comment.id}>
          <div className="left mr2">
            <Avatar user={user} size={24} />
          </div>
          <div className="overflow-hidden">
            <a className="block" style={{'line-height': 18}} href={user.url}>{user.username}</a>
            <div className={className} dangerouslySetInnerHTML={{ __html: comment.markdown_body || window.marked(comment.body) }}></div>
          </div>
        </div>
      );
    },

    comments: function() {
      var confirmedComments = this.confirmedComments();
      var optimisticComments = this.optimisticComments();
      var comments = confirmedComments.concat(optimisticComments);
      var numberOfComments = comments.length;
      var numberOfCommentsToShow = this.state.numberOfCommentsToShow;

      if (numberOfComments > numberOfCommentsToShow) {
        return (
          <div>
            <a className="block h6 blue clearfix mt0 mb3" href="javascript:void(0);" onClick={this.showMoreComments(numberOfComments)}>
              <span className="icon icon-bubble"></span>
              &nbsp;View all {numberOfComments} comments
            </a>

            {_.last(comments, numberOfCommentsToShow)}
          </div>
        );
      }

      return comments;
    },

    confirmedComments: function() {
      return this.state.comments.map(function(comment) {
        return this.comment(comment);
      }.bind(this));
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
        numberOfCommentsToShow: 1,
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
        <div className="p3">
          {this.comments()}
          <NewComment url={this.state.url} thread={this.props.item.id} />
        </div>
      );
    },

    showMoreComments: function(total) {
      return function(e) {
        this.setState({
          numberOfCommentsToShow: total
        });
      }.bind(this);
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItemComments;
  }

  window.NewsFeedItemComments = NewsFeedItemComments
})();
