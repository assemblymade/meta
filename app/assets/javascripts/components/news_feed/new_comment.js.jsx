var CONSTANTS = window.CONSTANTS.NEWS_FEED_ITEM;
var DropzoneMixin = require('../../mixins/dropzone_mixin');
var TypeaheadUserTextArea = require('../typeahead_user_textarea.js.jsx');
var xhr = require('../../xhr');
var ENTER = 13;
var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/

var NewsFeedItemNewComment = React.createClass({

  propTypes: {
    url: React.PropTypes.string.isRequired,
    user: React.PropTypes.object
  },

  mixins: [DropzoneMixin],

  componentDidMount: function() {
    this.initializeDropzone();

    // based on Ben Alpert's (@spicyj) work at
    // https://github.com/Khan/react-components/blob/master/js/window-drag.jsx

    // `this._dragCollection` looks weird, but there's a bug in React that
    // causes 'dragenter' to fire twice. By keeping track of elements where the
    // event has fired (instead of the event itself -- see l. 60), we can
    // correctly determine drag behavior.
    this._dragCollection = [];

    window.addEventListener("dragenter", this.onDragEnter);
    window.addEventListener("dragleave", this.onDragLeave);
    window.addEventListener("drop",      this.onDragLeave);
  },

  componentWillUnmount: function() {
    window.removeEventListener("dragenter", this.onDragEnter);
    window.removeEventListener("dragleave", this.onDragLeave);
    window.removeEventListener("drop",      this.onDragLeave);
  },

  getInitialState: function() {
    return {
      dragging: false,
      rows: this.props.rows || 1,
      text: ''
    };
  },

  onChange: function(e) {
    this.setState({
      text: e.target.value
    });
  },

  onDragEnter: function(e) {
    if (this._dragCollection.length === 0) {
      this.setState({
        dragging: true
      });
    }

    this._dragCollection = _(this._dragCollection).union([e.target]);
  },

  onDragLeave: function(e) {
    this._dragCollection = _(this._dragCollection).without(e.target);

    if (this._dragCollection.length === 0) {
      this.setState({
        dragging: false
      });
    }
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

    var textareaClasses = React.addons.classSet({
      'form-control': true,
      'bg-gray-lighter': this.state.dragging
    });

    var placeholder = this.state.dragging ?
      'Drag and drop here to upload' :
      'Press <enter> to comment';

    return (
      <div className="clearfix">
        <div className="left mr2">
          <Avatar user={window.app.currentUser().attributes} size={18} />
        </div>
        <div className="overflow-hidden dropzone">
          <textarea type="text"
              className={textareaClasses}
              rows={this.state.rows}
              onChange={this.onChange}
              onKeyPress={this.onKeyPress}
              value={this.state.text}
              placeholder={placeholder} />
        </div>
      </div>
    );
  },

  submitComment: function() {
    var comment = this.state.text;
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
        text: ''
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
      console.error(e);
    }

    Dispatcher.dispatch({
      action: CONSTANTS.ACTIONS.CONFIRM_COMMENT,
      data: {
        thread: thread,
        timestamp: timestamp,
        comment: data
      }
    });
  };
}
