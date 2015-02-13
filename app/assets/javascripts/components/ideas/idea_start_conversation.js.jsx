'use strict';

const Button = require('../ui/button.js.jsx');
const CommentActionCreators = require('../../actions/comment_action_creators');
const Drawer = require('../ui/drawer.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const IdeaActionCreators = require('../../actions/idea_action_creators');
const IdeaContainer = require('./idea_container.js.jsx');
const IdeaStore = require('../../stores/idea_store');
const Lightbox = require('../lightbox.js.jsx');
const NewComment = require('../news_feed/new_comment.js.jsx');
const NewCommentStore = require('../../stores/new_comment_store');
const Routes = require('../../routes');
const UserStore = require('../../stores/user_store');

let IdeaStartConversation = React.createClass({
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
    NewCommentStore.addChangeListener(this.validateQuestion);
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onIdeaChange);
    NewCommentStore.removeChangeListener(this.validateQuestion);
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
    let idea = this.state.idea;
    let question = this.state.question;
    let url = Routes.discussion_comments_path({
      discussion_id: idea.news_feed_item.id
    });

    if (question) {
      CommentActionCreators.submitComment(idea.news_feed_item.id, question, url);
    }

    IdeaActionCreators.submitFirstQuestionClicked(idea);
  },

  render() {
    let idea = this.state.idea;
    let item = idea.news_feed_item;
    let placeholder = "";
    let url = Routes.discussion_comments_path({
      discussion_id: item.id
    });

    return (
      <IdeaContainer showRelatedIdeas={false}>
        <div className="clearfix py2 border-bottom border-gray">
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

        <form>
          <div className="form-group px4 mb0">
            <Drawer open={this.state.isDrawerOpen}>
              <div className="px3 gray-1">
                <p className="px3">
                  After you submit your idea, you'll hash out the specifics of your{' '}
                  project with the Assembly community. Gain enough traction (through{' '}
                  hearts on your idea), and you'll be ready to launch! Others{' '}
                  will jump in and help shape your idea &mdash; you'll be building{' '}
                  alongside an awesome community of talented folks from all over.
                </p>
              </div>
            </Drawer>

            <div className="py3">
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
                placeholder={placeholder}
                thread={item.id}
                url={url}
                user={UserStore.getUser()} />
            {this.renderQuestionWarning()}
          </div>

          <div className="clearfix px4 mb3">
            <div className="left mt1">
              <a href="javscript:void(0);" onClick={this.onBackClick}>
                <Icon icon="chevron-left" /> Back
              </a>
            </div>

            <div className="right">
              <Button type="primary"
                  action={
                    !this.state.showWarning &&
                    this.state.question.length > 0 &&
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

  validateQuestion() {
    let question = NewCommentStore.getComment(this.state.idea.news_feed_item.id) || '';

    this.setState({
      question: question,
      showWarning: question.indexOf('?') < 0
    });
  }
});

module.exports = IdeaStartConversation;
