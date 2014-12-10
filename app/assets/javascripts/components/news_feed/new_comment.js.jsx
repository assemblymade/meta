var CONSTANTS = window.CONSTANTS.NEWS_FEED_ITEM;
var DropzoneMixin = require('../../mixins/dropzone_mixin');
var TypeaheadUserTextArea = require('../typeahead_user_textarea.js.jsx');
var xhr = require('../../xhr');
var ENTER = 13;
var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/

var NewsFeedItemNewComment = React.createClass({

  propTypes: {
    thread: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    user: React.PropTypes.object
  },

  mixins: [DropzoneMixin],

  calculateRows: function(value) {
    var rows = this.state.rows;
    var scrollHeight = this.refs.textarea.getDOMNode().scrollHeight;

    if (scrollHeight > this.previousScrollHeight) {
      this.previousScrollHeight = scrollHeight;
      this.textLength = value.length;

      rows++;
    }

    if (rows - this.props.initialRows === 1) {
      this.rowTextLength = value.length;
    }

    // FIXME: this.rowTextLength can be off if, e.g., the user has copypasted
    //        text in. We should find a more robust way of figuring out the row
    //        height.
    if (value.length < this.textLength) {
      if (value.length === 0) {
        rows = this.props.initialRows;
      } else {
        rows = this.props.initialRows + Math.ceil(value.length / this.rowTextLength);
      }
    }

    return rows;
  },

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

    // autoresize
    this.previousScrollHeight = this.refs.textarea.getDOMNode().scrollHeight;
    this.textLength = 0;
  },

  componentWillUnmount: function() {
    window.removeEventListener("dragenter", this.onDragEnter);
    window.removeEventListener("dragleave", this.onDragLeave);
    window.removeEventListener("drop",      this.onDragLeave);
  },

  getDefaultProps: function() {
    return {
      initialRows: 2
    };
  },

  getInitialState: function() {
    return {
      dragging: false,
      rows: this.props.initialRows,
      text: ''
    };
  },

  onChange: function(e) {
    var value = e.target.value;
    var rows = this.calculateRows(value);

    this.setState({
      rows: rows,
      text: value
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

    var dropzoneClasses = React.addons.classSet({
      'dropzone': true,
      'markdown-editor-control': this.state.rows > 1,
      'ml1': true
    });

    var textareaClasses = React.addons.classSet({
      'form-control': true,
      'bg-gray-lighter': this.state.dragging
    });

    var placeholder = this.state.dragging ?
      'Drag and drop here to upload' :
      '';

    return (
      <div className="clearfix">
        <div className="left">
          <Avatar user={window.app.currentUser().attributes} size={30} />
        </div>
        <div className="px4">
          <div className={dropzoneClasses}>
            <div style={{ position: 'relative' }}>
              <textarea
                  ref="textarea"
                  type="text"
                  className={textareaClasses}
                  rows={this.state.rows}
                  onChange={this.onChange}
                  onKeyPress={this.onKeyPress}
                  value={this.state.text}
                  placeholder={placeholder} />
            </div>
            {this.renderDropzoneInner()}
          </div>
        </div>
      </div>
    );
  },

  renderDropzoneInner: function() {
    if (this.props.rows > 1) {
      return (
        <div className="dropzone-inner">
          To attach files, drag & drop here or
          {' '}<a href="javascript:void(0);" ref="clickable">select files form your computer</a>&hellip;
        </div>
      );
    }
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
        rows: this.props.initialRows,
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
