var ActionTypes = window.CONSTANTS.ActionTypes;
var BountyActionCreators = require('../../actions/bounty_action_creators');
var CommentActionCreators = require('../../actions/comment_action_creators');
var DropzoneMixin = require('../../mixins/dropzone_mixin');
var NewCommentActionCreators = require('../../actions/new_comment_action_creators');
var NewCommentStore = require('../../stores/new_comment_store');
var TypeaheadUserTextArea = require('../typeahead_user_textarea.js.jsx');
var UserStore = require('../../stores/user_store');
var xhr = require('../../xhr');
var ENTER = 13;
var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/

/**
 * TODO: Rethink how this component interacts with its parents and children.
 * Right now, it breaks the one-way flow of data -- is there a better
 * way to pass data in?
 */

var NewsFeedItemNewComment = React.createClass({
  displayName: 'NewComment',

  propTypes: {
    canContainWork: React.PropTypes.bool,
    commentId: _dependsOn('initialText', 'string'),
    hideAvatar: React.PropTypes.bool,
    hideButtons: React.PropTypes.bool,
    initialText: _dependsOn('commentId', 'string'),
    thread: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    user: React.PropTypes.object
  },

  mixins: [DropzoneMixin],

  buttonClasses: function(btnClass) {
    var classes = {
      disabled: this.state.text.length < 2,
      'pill-button': true,
      'pill-button-theme-white': true,
      'pill-button-border': true,
      'pill-button-shadow': true,
      right: true
    };

    return React.addons.classSet(classes);
  },

  componentDidMount: function() {
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

    var domNode = this.getDOMNode();

    domNode.addEventListener('dragenter', this.onDragEnter, false);
    domNode.addEventListener('dragleave', this.onDragLeave, false);
    domNode.addEventListener('drop', this.onDragLeave, false);

    NewCommentStore.addChangeListener(this.getCommentFromStore);
  },

  componentWillUnmount: function() {
    window.removeEventListener("dragenter", this.onDragEnter);
    window.removeEventListener("dragleave", this.onDragLeave);
    window.removeEventListener("drop",      this.onDragLeave);

    var domNode = this.getDOMNode();

    domNode.removeEventListener('dragenter', this.onDragEnter, false);
    domNode.removeEventListener('dragleave', this.onDragLeave, false);
    domNode.removeEventListener('drop', this.onDragLeave, false);

    NewCommentStore.removeChangeListener(this.getCommentFromStore);
  },

  getCommentFromStore: function() {
    this.setState({
      text: NewCommentStore.getComment(this.props.thread)
    });
  },

  getDefaultProps: function() {
    return {
      initialRows: 3,
      user: UserStore.getUser()
    };
  },

  getInitialState: function() {
    return {
      dragging: false,
      rows: this.props.initialRows,
      text: this.props.initialText || ''
    };
  },

  onChange: function(e) {
    NewCommentActionCreators.updateComment(this.props.thread, e.target.value);
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

  onKeyDown: function(e) {
    if (this.props.hideButtons) {
      return;
    }

    if ((e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) && e.which === ENTER) {
      e.preventDefault();
      e.stopPropagation();

      this.submitComment(e);
    }
  },

  onKeyPress: function(e) {
    if (this.props.hideButtons) {
      return;
    }

    if ((e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) && e.which === ENTER) {
      e.preventDefault();
      e.stopPropagation();

      this.submitComment(e);
    }
  },

  render: function() {
    if (!this.props.user) {
      return (
        <span>
          I'm afraid I can't let you comment. You'll have to
          {' '}<a href="/signup">sign up</a>{' '}
          to do that.
        </span>
      );
    }

    var dropzoneClasses = React.addons.classSet({
      'dropzone': true,
      'markdown-editor-control': this.state.rows > 1
    });

    var textareaClasses = React.addons.classSet({
      'bg-gray-4': this.state.dragging,
      'bg-gray-6': !this.state.dragging,
      '_ht14_5': true,
      '_w100p': true,
      '_px1_5': true,
      '_pt1': true,
      '_pb3': true,
      '_border-none': true,
      '_border-rad0_5': true
    });

    return (
      <div className="clearfix" style={{ paddingBottom: '2.5rem' }}>
        {this.renderAvatar()}
        <div className={this.props.hideAvatar ? null : "_pl3_5"}>
          <div className={dropzoneClasses}>
            <div style={{ position: 'relative' }}>
              <TypeaheadUserTextArea
                  {...this.props}
                  id="event_comment_body"
                  ref="textarea"
                  type="text"
                  className={textareaClasses}
                  onChange={this.onChange}
                  onKeyDown={this.onKeyDown}
                  onKeyPress={this.onKeyPress}
                  rows={this.state.rows}
                  defaultValue={this.state.text}
                  placeholder="Leave your comments" />
            </div>
            {this.renderDropzoneInner()}
          </div>
        </div>
        {this.renderButtons()}
      </div>
    );
  },

  renderAvatar: function() {
    if (this.props.hideAvatar) {
      return;
    }

    if (!this.props.initialText) {
      return (
        <div className="left">
          <Avatar user={window.app.currentUser().attributes} size={30} />
        </div>
      );
    }
  },

  renderButtons: function() {
    if (this.props.hideButtons) {
      return;
    }

    var classes = this.buttonClasses('btn-primary');

    return (
      <div className="clearfix mt3 mr3 px3">
        <button className={classes}
            href="javascript:void(0);"
            onClick={this.submitComment}>
          <span className="_fs1_1 _lh2">Leave a comment</span>
        </button>
        {this.renderSubmitWorkButton()}
      </div>
    );
  },

  renderDropzoneInner: function() {
    if (this.state.rows > 1) {
      return (
        <div className="dropzone-inner">
          To attach files, drag & drop here or
          {' '}<a href="javascript:void(0);" ref="clickable">select files from your computer</a>&hellip;
        </div>
      );
    }
  },

  renderSubmitWorkButton: function() {
    if (this.props.canContainWork) {
      var classes = this.buttonClasses('btn-default');

      return (
        <button className={classes + ' mr2'}
            href="javascript:void(0);"
            style={{ color: '#5cb85c !important' }}
            onClick={this.submitWork}>
          <span className="icon icon-document icon-left"></span>
          <span className="title _fs1_1 _lh2">Submit work</span>
        </button>
      );
    }
  },

  submitComment: function(e) {
    e && e.stopPropagation();

    if (this.props.initialText) {
      this._updateComment();
    } else {
      this._submitNewComment();
    }
  },

  submitWork: function(e) {
    this.submitComment(e);

    var url = _reach(this.props, 'item.target.url');

    if (url) {
      BountyActionCreators.submitWork(url + '/review');
    }
  },

  _submitNewComment: function() {
    var comment = this.state.text;
    var thread = this.props.thread;

    if (comment.length >= 2) {
      CommentActionCreators.submitComment(thread, comment, this.props.url);
    }
  },

  _updateComment: function() {
    var comment = this.state.text;
    var commentId = this.props.commentId;
    var url = this.props.url;

    if (comment.length >= 2) {
      CommentActionCreators.updateComment(commentId, comment, url);
    }
  }
});

module.exports = NewsFeedItemNewComment;
window.NewComment = NewsFeedItemNewComment;

function _dependsOn(dependency, type) {
  return function (props, propName, componentName) {
    var thisProp = props[propName];

    if (thisProp) {
      if (!props.hasOwnProperty(dependency)) {
        return new Error(propName + ' provided without ' + dependency + '.');
      }

      if (typeof thisProp !== type) {
        return new Error(
          'Expected ' + propName + ' to be a ' + type + ', but it was a ' +
          typeof thisProp +
          '.'
        );
      }
    }
  };
}

function _reach(obj, prop) {
  var props = prop.split('.');

  while (props.length) {
    var p = props.shift();

    if (obj && obj.hasOwnProperty(p)) {
      obj = obj[p]
    } else {
      obj = undefined;
      break;
    }
  }

  return obj;
}
