/** @jsx React.DOM */

(function() {
  var CONSTANTS = window.CONSTANTS.NEWS_FEED_ITEM;
  var TypeaheadUserTextArea = require('../typeahead_user_textarea.js.jsx');
  var xhr = require('../../xhr');
  var ENTER = 13;
  var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/

  var NewsFeedItemNewComment = React.createClass({

    propTypes: {
      user: React.PropTypes.object
    },

    getInitialState: function() {
      return {
        comment: ''
      };
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
      if (!this.props.user) {
        return <span />;
      }

      return (
        <div className="clearfix">
          <div className="left mr2">
            <Avatar user={window.app.currentUser().attributes} size={18} />
          </div>
          <div className="overflow-hidden">
            <textarea type="text"
                className="form-control"
                rows="1"
                onChange={this.onChange}
                onKeyPress={this.onKeyPress}
                value={this.state.comment}
                placeholder="Press <enter> to comment" />
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

        window.analytics.track(
          'news_feed_item.commented', {
            product: (window.app.currentAnalyticsProduct())
          }
        );
      }
    }
  });

  module.exports = NewsFeedItemNewComment;

  function _confirmComment(thread, timestamp) {
    return function (err, data) {
      if (err) {
        return console.error(err);
      }

      try {
        data = JSON.parse(data);
      } catch (e) {
        console.log(e);
      }

      Dispatcher.dispatch({
        action: CONSTANTS.ACTIONS.CONFIRM_COMMENT,
        data: { thread: thread, timestamp: timestamp, comment: data }
      });
    };
  }
})();
