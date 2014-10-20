/** @jsx React.DOM */

(function() {
  var CONSTANTS = require('../../constants').NEWS_FEED_ITEM;
  var xhr = require('../../xhr');
  var ENTER = 13;

  var NewsFeedItemNewComment = React.createClass({
    getInitialState: function() {
      return {
        comment: ''
      }
    },

    onChange: function(e) {
      this.setState({
        comment: e.target.value
      });
    },

    onKeyPress: function(e) {
      if (!e.shiftKey && e.which === ENTER) {
        e.preventDefault();
        e.stopPropagation();

        this.submitComment();
      }
    },

    render: function() {
      return (
        <div className="row">
          <div className="col-md-1 hidden-sm hidden-xs">
            <Avatar user={window.app.currentUser().attributes} size={32} />
          </div>
          <div className="col-md-11">
            <textarea type="text"
                rows="1"
                value={this.state.comment}
                onKeyPress={this.onKeyPress}
                onChange={this.onChange}
                placeholder="Press <enter> to comment"
                style={{ width: '100%', padding: '5px' }} />
          </div>
        </div>
      );
    },

    submitComment: function() {
      var comment = this.state.comment;
      var thread = this.props.thread;
      var createdAt = Date.now();

      if (comment.length >= 2) {
        xhr.post(this.props.url, { body: comment }, _confirmComment(thread, createdAt));

        Dispatcher.dispatch({
          action: CONSTANTS.ACTIONS.OPTIMISTICALLY_ADD_COMMENT,
          data: {
            body: comment,
            created_at: createdAt,
            news_feed_item_id: thread,
            user: window.app.currentUser().attributes
          }
        });

        this.setState({
          comment: ''
        });
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItemNewComment;
  }

  function _confirmComment(thread, timestamp) {
    return function (err, data) {
      if (err) {
        return console.error(err);
      }

      Dispatcher.dispatch({
        action: CONSTANTS.ACTIONS.CONFIRM_COMMENT,
        data: { thread: thread, timestamp: timestamp }
      });
    };
  }
})();
