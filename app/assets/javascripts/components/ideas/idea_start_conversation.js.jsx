var Button = require('../ui/button.js.jsx');
var CommentActionCreators = require('../../actions/comment_action_creators');
var Drawer = require('../ui/drawer.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var IdeaActionCreators = require('../../actions/idea_action_creators');
var IdeaContainer = require('./idea_container.js.jsx');
var IdeaStore = require('../../stores/idea_store');
var Lightbox = require('../lightbox.js.jsx');
var NewComment = require('../news_feed/new_comment.js.jsx');
var NewCommentStore = require('../../stores/new_comment_store');
var Routes = require('../../routes');
var UserStore = require('../../stores/user_store');

var IdeaStartConversation = React.createClass({
  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
      ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    IdeaStore.addChangeListener(this.onIdeaChange);
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onIdeaChange);
  },

  getInitialState() {
    return {
      idea: IdeaStore.getIdea(),
      isDrawerOpen: false,
      question: '',
      showWarning: false
    };
  },

  handleHowItWorksClick(e) {
    e.preventDefault();

    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen
    });
  },

  onBackClick(e) {
    e.preventDefault();

    IdeaActionCreators.showEditIdea(this.state.idea);
  },

  onIdeaChange() {
    this.setState(this.getInitialState());
  },

  onPostQuestionClick(e) {
    var idea = this.state.idea;
    var question = this.state.question;
    var url = Routes.discussion_comments_path({
      discussion_id: idea.news_feed_item.id
    });

    if (question) {
      CommentActionCreators.submitComment(idea.news_feed_item.id, question, url);
    }

    IdeaActionCreators.submitFirstQuestionClicked(idea);
  },

  render() {
    var idea = this.state.idea;
    var item = idea.news_feed_item;
    var placeholder = "";
    var url = Routes.discussion_comments_path({
      discussion_id: item.id
    });

    return (
      <IdeaContainer showRelatedIdeas={false}>
        <div className="clearfix py2">
          <div className="left ml4">
            <h4 className="mb0 mt0">Asking a first question gets things going.</h4>
          </div>

          <div className="right px4">
            <small className="mt2">
              <a href="javascript:void(0);" onClick={this.handleHowItWorksClick}>
                How it works{' '}
                <span style={{ color: '#fe8100' }}>
                  <Icon icon="question-circle" />
                </span>
              </a>
            </small>
          </div>
        </div>

        <hr className="mt0" style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

        <form>
          <div className="form-group px4 mb0">
            <Drawer open={this.state.isDrawerOpen}>
              <div className="px3 gray-1">
                <p className="px3">
                  After you submit your idea, you'll hash out the specifics of your
                  project with the Assembly community. Gain enough traction (through
                  hearts on your idea), and you'll be ready to launch!
                </p>
              </div>

              <hr className="mb0 mt0" style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />
            </Drawer>

            <div className="mb3">
              <p>
                Examples:
              </p>
              <ol>
                <li>What's the best name for the product?</li>
                <li>What competing products are out there?</li>
                <li>What would you change about the idea?</li>
              </ol>
            </div>
            <NewComment canContainWork={false}
              dropzoneInnerText={false}
              hideAvatar={true}
              hideButtons={true}
              onChange={this.validateQuestion}
              placeholder={placeholder}
              thread={item.id}
              url={url}
              user={UserStore.getUser()} />
            {this.renderQuestionWarning()}
          </div>

          <hr className="mb0 mt0" style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

          <div className="clearfix px4 py3">
            <div className="left mt1">
              <a href="javscript:void(0);" onClick={this.onBackClick}>
                <Icon icon="arrow-left" /> Back
              </a>
            </div>

            <div className="right">
              <Button type="primary"
                  action={
                    !this.state.showWarning &&
                    this.state.question &&
                    this.onPostQuestionClick
              }>
                <span className="title">Submit idea</span>
              </Button>
            </div>
          </div>
        </form>
      </IdeaContainer>
    );
  },

  renderQuestionWarning() {
    if (this.state.showWarning) {
      return (
        <div className="inline-block mt0 m1">
          <span className="mr2" style={{ color: '#eb0000' }}><Icon icon="warning" /></span>
          <span className="gray-2">Oops! That doesn't look like a question.</span>
        </div>
      );
    }

    return <div className="inline-block mt0 m1"><span style={{ height: '100%' }} />&nbsp;</div>;
  },

  validateQuestion(e) {
    var question = e.target.value;

    if (question) {
      this.setState({
        question: question,
        showWarning: question.indexOf('?') < 0
      });
    }
  }
});

module.exports = IdeaStartConversation;
