/** @jsx React.DOM */

(function() {
  var CONSTANTS = window.CONSTANTS.NEWS_FEED_ITEM
  var TypeaheadUserTextArea = require('../typeahead_user_textarea.js.jsx');
  var xhr = require('../../xhr');
  var ENTER = 13;
  var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/

  var NewIdeaComment = React.createClass({
    getInitialState: function() {
      return {
        comment: '',
        disabled: 'disabled'
      };
    },

    onChange: function(e) {
      this.setState({
        comment: e.target.value
      });

      if(this.state.comment.length >= 2){
        this.setState({
          disabled: ''
        });
      } else {
        this.setState({
          disabled: 'disabled'
        });
      }
    },

    submitForm: function(e) {
      e.preventDefault();
      e.stopPropagation();

      this.submitComment();
    },

    render: function() {
      if (!window.app.currentUser()) {
        return (
          <div className="border p3 center rounded">
            <strong><a href={this.props.signup_path}>Sign up</a> to join the discussion.</strong>
            &nbsp;Already have an account? <a href={this.props.login_path}>Sign in</a>
          </div>
        )
      }

      return (
        <div id="activity">
          <div className="pull-left mr3">
            <Avatar user={window.app.currentUser().attributes} size={24} />
          </div>
          <div className="media-body">
            <form action={this.props.url} className="form" onSubmit={this.submitForm}>
              <div className="markdown-editor-control js-markdown-editor js-dropzone">
                <textarea type="text"
                  className="form-control" 
                  onChange={this.onChange}
                  placeholder="Add to the discussion"
                  value={this.state.comment}
                  rows="3">
                </textarea>

                <div className="dropzone-inner js-dropzone-select">
                  To attach files drag &amp; drop here or
                  &nbsp;<a href="#">select files from your computer</a>...
                </div>
              </div>

              <div className="form-actions">
                <ul className="list-inline pull-right">
                  <li>
                <div className={'btn-group ' + this.state.disabled}>
                  <button className="btn btn-primary" type="submit" disabled={this.state.disabled}>Comment</button>
                </div>
                </li></ul>
              </div>
            </form>
          </div>
        </div>
      );
    },

    submitComment: function() {
      var comment = this.state.comment;
      var url = this.props.url;
      var createdAt = Date.now();

      if (comment.length >= 2) {
        xhr.post(this.props.url, { body: comment }, _confirmComment(createdAt));

        Dispatcher.dispatch({
          action: CONSTANTS.ACTIONS.OPTIMISTICALLY_ADD_COMMENT,
          data: {
            body: comment,
            created_at: createdAt,
            user: window.app.currentUser().attributes
          }
        });

        this.setState({
          comment: '',
          disabled: 'disabled'
        });

        window.analytics.track(
          'idea.commented'
        );
      }
    }
  });

  module.exports = NewIdeaComment;

  function _confirmComment(timestamp) {
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
        data: { timestamp: timestamp, comment: data }
      });
    };
  }
})();


