var CommentActionCreators = require('../../actions/comment_action_creators');
var Icon = require('../icon.js.jsx');
var Lightbox = require('../lightbox.js.jsx');
var NewComment = require('../news_feed/new_comment.js.jsx');
var NewCommentStore = require('../../stores/new_comment_store');
var StartConversationModalActionCreators = require('../../actions/start_conversation_modal_action_creators');
var Routes = require('../../routes');
var UserStore = require('../../stores/user_store');

var StartConversationModal = React.createClass({
  displayName: 'StartConversationModal',

  propTypes: {
    idea: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired
    }).isRequired,
    modalShown: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      question: '',
      showWarning: false
    };
  },

  validateQuestion(e) {
    var question = e.target.value;

    if (question) {
      this.setState({
        question: question,
        showWarning: question.indexOf('?') < 0
      });
    }
  },

  onModalHidden() {
    StartConversationModalActionCreators.hideModal();
  },

  onPostQuestion(e) {
    var idea = this.props.idea;
    var url = Routes.idea_comments_path({
      idea_id: idea.id
    });

    CommentActionCreators.submitComment(idea.news_feed_item.id, this.state.question, url);
    this.onModalHidden();
  },

  render() {
    var idea = this.props.idea;
    var item = idea.news_feed_item;
    var placeholder = "Examples: What's the best name for the product?";
    var url = Routes.idea_comments_path({
      idea_id: idea.id
    });

    var textareaClasses = React.addons.classSet({
      'bg-gray-6': true,
      '_ht14_5': true,
      '_w100p': true,
      '_px1_5': true,
      '_pt1': true,
      '_pb3': true,
      '_border-none': true,
      '_border-rad0_5': true
    });

    var buttonClasses = React.addons.classSet({
      disabled: this.state.showWarning,
      _button: true,
      pill: true,
      'theme-green': true,
      shadow: true,
      'text-shadow': true,
      border: true
    });

    if (this.props.modalShown) {
      return (
        <Lightbox onHidden={this.onModalHidden}>
          <div className="clearfix px4 py2">
            <div className="left">
              <h5 className="mb0 mt0">Get some traction!</h5>
            </div>
          </div>

          <hr style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

          <form>
            <div className="form-group px4 mb0">
              <label>Ask a question to kick things off.</label>
              <NewComment canContainWork={false}
                  hideAvatar={true}
                  hideButtons={true}
                  onChange={this.validateQuestion}
                  thread={item.id}
                  url={url}
                  user={UserStore.getUser()} />
            </div>

            {this.renderQuestionWarning()}

            <hr style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

            <div className="clearfix px4 mb3">
              <div className="right">
                <button type="button" className={buttonClasses} onClick={this.onPostQuestion}>
                  <span className="title">Post the question</span>
                </button>
              </div>
            </div>
          </form>
        </Lightbox>
      );
    }

    return null;
  },

  renderQuestionWarning() {
    if (this.state.showWarning) {
      return (
        <div className="inline-block px4">
          <span className="mr2" style={{ color: '#eb0000' }}><Icon icon="warning" /></span>
          <span className="gray-2">Oops! That doesn't look like a question.</span>
        </div>
      );
    }
  }
});

module.exports = StartConversationModal;
