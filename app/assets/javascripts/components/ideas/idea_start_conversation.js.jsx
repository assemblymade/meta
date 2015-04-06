'use strict';

const Button = require('../ui/button.js.jsx');
const CommentActionCreators = require('../../actions/comment_action_creators');
const Drawer = require('../ui/drawer.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const IdeaActionCreators = require('../../actions/idea_action_creators');
const IdeaHowItWorks = require('./idea_how_it_works.js.jsx');
const IdeaStore = require('../../stores/idea_store');
const Lightbox = require('../lightbox.js.jsx');
const NewComment = require('../news_feed/new_comment.js.jsx');
const NewCommentStore = require('../../stores/new_comment_store');
const Routes = require('../../routes');
const UserStore = require('../../stores/user_store');
const Tile = require('../ui/tile.js.jsx');

let IdeaStartConversation = React.createClass({
  propTypes: {
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
      <div className="container">
        <div className="clearfix mt4 mb4">
          <div className="col-8 mx-auto">
            <Tile>

              <div className="p4">

                <div className="mb4 h1 yellow center">
                  <Icon icon="lightbulb-o" />
                </div>

                <div className="clearfix mb1">
                  <h4 className="center mt0 mb2">Kick off the discussion. <br /> What questions would you like answered about your idea?</h4>
                </div>

                <form>
                  <Drawer open={this.state.isDrawerOpen}>
                    <IdeaHowItWorks />
                  </Drawer>

                  <div className="mb0">
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

                  <div className="clearfix">
                    <a className="left py1 gray-2" href={idea.path + '/edit'}>
                      <Icon icon="chevron-left" /> Edit your idea
                    </a>

                    <div className="right">
                      <Button type="primary"
                          action={
                            !this.state.showWarning &&
                            this.state.question.length > 0 &&
                            this.onPostQuestionClick
                      }>
                        <span className="title">Done! Let's get started</span>
                      </Button>
                    </div>
                  </div>
                </form>

              </div>

            </Tile>
          </div>
        </div>
      </div>
    );
  },

  renderQuestionWarning() {
    if (this.state.showWarning) {
      return (
        <div className="inline-block mt0 m1">
          <span className="mr2" style={{ color: '#eb0000' }}><Icon icon="warning" /></span>
          <span className="gray-2">Opps, that doesn't look like a question. It needs to end with a question mark.</span>
        </div>
      );
    }

    return <div className="inline-block mt0 m1"><span style={{ height: '100%' }} />&nbsp;</div>;
  },

  validateQuestion() {
    let question = NewCommentStore.getComment(this.state.idea.news_feed_item.id) || '';

    this.setState({
      question: question,
      showWarning: false
    });
  }
});

module.exports = IdeaStartConversation;
