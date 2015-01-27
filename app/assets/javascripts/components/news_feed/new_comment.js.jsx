var ActionTypes = window.CONSTANTS.ActionTypes;
var BountyActionCreators = require('../../actions/bounty_action_creators');
var Button = require('../ui/button.js.jsx')
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

var NewComment = React.createClass({
  displayName: 'NewComment',

  propTypes: {
    canContainWork: React.PropTypes.bool,
    commentId: _dependsOn('initialText', 'string'),
    dropzoneInnerText: React.PropTypes.oneOfType([
      React.PropTypes.bool, // `false` turns off the inner div
      React.PropTypes.element,
      React.PropTypes.string
    ]),
    hideAvatar: React.PropTypes.bool,
    hideButtons: React.PropTypes.bool,
    initialText: _dependsOn('commentId', 'string'),
    placeholder: React.PropTypes.string,
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
      dropzoneInnerText: <span>To attach files, drag & drop here or <a href="javascript:void(0);" id="clickable">select files from your computer</a>&hellip;</span>,
      initialRows: 4,
      placeholder: 'Leave your comments',
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

  onKeyboardInteraction: function(e) {
    if (this.props.hideButtons) {
      return;
    }

    _handleKeyboardInteraction(e, this.submitComment);
  },

  render: function() {
    if (!this.props.user) {
      return (
        <div className="p3">
          You need to <a href="/signup">sign up</a> before you can comment.
        </div>
      );
    }

    var dropzoneClasses = React.addons.classSet({
      'dropzone': true,
      'markdown-editor-control': this.state.rows > 1
    });

    var textareaClasses = React.addons.classSet({
      'bg-gray-4': this.state.dragging,
      'full-width': true,
      '_px1_5': true,
      '_pt1': true,
      '_pb3': true,
      '_border-rad0_5': true,
      'h5 mt0 mb0': true
    });

    return (
      <div className="clearfix">
        {this.renderAvatar()}
        <div className={this.props.hideAvatar ? "" : "_pl3_5"}>
          <div className={dropzoneClasses}>
            <div style={{ position: 'relative' }}>
              <TypeaheadUserTextArea
                  {...this.props}
                  id={this.props.id || "event_comment_body"}
                  type="text"
                  className={textareaClasses}
                  onKeyDown={this.onKeyboardInteraction}
                  onKeyPress={this.onKeyboardInteraction}
                  rows={this.state.rows}
                  defaultValue={this.state.text}
                  placeholder={this.props.placeholder}
                  style={{ minHeight: 150 }} />
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
          <Avatar user={UserStore.getUser()} size={30} />
        </div>
      );
    }
  },

  renderButtons: function() {
    if (this.props.hideButtons) {
      return
    }

    return (
      <div className="right-align">
        <Button action={this.submitComment} submit>Leave a comment</Button>
      </div>
    )
  },

  renderDropzoneInner: function() {
    if (this.state.rows > 1 && this.props.dropzoneInnerText) {
      return (
        <div className="dropzone-inner" ref="clickable">
          {this.props.dropzoneInnerText}
        </div>
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

module.exports = window.NewComment = NewComment;

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

function _handleKeyboardInteraction(e, callback) {
  if ((e.metaKey || e.ctrlKey || e.altKey) && e.which === ENTER) {
    e.preventDefault();
    e.stopPropagation();

    callback(e);
  }
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
