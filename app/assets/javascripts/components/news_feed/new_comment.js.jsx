/** @jsx React.DOM */

(function() {
  var CONSTANTS = require('../../constants').NEWS_FEED_ITEM;
  var NewsFeedItemStore = require('../../stores/news_feed_item_store');
  var xhr = require('../../xhr');
  var ENTER = 13;

  var NewsFeedItemNewComment = React.createClass({
    componentDidMount: function() {
      NewsFeedItemStore.addChangeListener(this.getNewsFeedItemComments);
    },

    getInitialState: function() {
      return {
        comment: ''
      }
    },

    getNewsFeedItemComments: function() {
      var comments = NewsFeedItemStore.getComments();

      console.log(comments);
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
        <div className="row new-comment">
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

      if (comment.length >= 2) {
        xhr.post(this.props.url, { body: comment }, _confirmComment);

        Dispatcher.dispatch({
          action: CONSTANTS.ACTIONS.OPTIMISTICALLY_ADD_COMMENT,
          data: comment
        });
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItemNewComment;
  }

  function _confirmComment(err, data) {
    if (err) {
      return console.error(err);
    }

    console.log(data);
  }
})();
