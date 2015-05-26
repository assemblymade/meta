'use strict';

const Button = require('../ui/button.js.jsx');
const CharacterLimitedInput = require('../ui/character_limited_input.js.jsx');
const FormGroup = require('../form_group.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const IdeaActionCreators = require('../../actions/idea_action_creators');
const NewComment = require('../news_feed/new_comment.js.jsx');
const NewCommentStore = require('../../stores/new_comment_store');
const TypeaheadUserTextarea = require('../typeahead_user_textarea.js.jsx');
const UserStore = require('../../stores/user_store');

const IDEA_BODY_ID = 'new_idea';

let NewIdeaForm = React.createClass({
  propTypes: {
    idea: React.PropTypes.shape({
      founder_preference: React.PropTypes.bool,
      name: React.PropTypes.string.isRequired,
      raw_body: React.PropTypes.string.isRequired
    })
  },

  componentDidMount() {
    NewCommentStore.addChangeListener(this.onIdeaBodyChange);
  },

  componentWillUnmount() {
    NewCommentStore.removeChangeListener(this.onIdeaBodyChange);
  },

  getDefaultProps() {
    return {
      initialIdea: {}
    };
  },

  getInitialState() {
    let idea = this.props.initialIdea;

    return {
      firstQuestion: '',
      ideaBody: idea.raw_body || '',
      ideaName: idea.name || '',
      isFounder: true,
      showWarning: false,
      buttonValid: true
    };
  },

  handleIdeaNameChange(e) {
    this.setState({
      ideaName: e.target.value
    });
  },

  isValidIdea() {
    return this.state.ideaName.length >= 2 &&
      this.state.ideaBody.length >= 2;
  },

  onFounderOptionClick(e) {
    this.setState({
      isFounder: !this.state.isFounder
    });
  },

  onIdeaBodyChange() {
    this.setState({
      ideaBody: NewCommentStore.getComment(IDEA_BODY_ID)
    });
  },

  buttonValid() {
    return this.state.buttonValid || !_.isEmpty(this.props.initialIdea);
  },

  onNextClick(e) {
    e.preventDefault();
    this.setState({buttonValid: false});

    if (_.isEmpty(this.props.initialIdea)) {
      let idea = {
        name: this.state.ideaName,
        body: this.state.ideaBody,
        founder_preference: this.state.isFounder
      };

      IdeaActionCreators.submitIdeaClicked(idea);

    } else {
      let slug = this.props.initialIdea.slug;

      let idea = {
        body: this.state.ideaBody,
        id: slug,
        name: this.state.ideaName,
        founder_preference: this.state.isFounder
      };

      IdeaActionCreators.updateIdea(idea);
    }
  },

  render() {
    let idea = this.props.initialIdea;

    return (
      <form>
        <div className="form-group mb3">
          <label className="control-label">What's the 5 word pitch?</label>

          <p className="mb2 h6 gray-2">If you had 30 seconds to describe your idea to a friend, what would you say? Small, direct words are best.</p>
          <CharacterLimitedInput limit={60}
              value={this.state.ideaName}
              onChange={this.handleIdeaNameChange}
              size="large" />
        </div>

        <div className="form-group mb3">
          <label className="control-label">Now describe the details</label>
          <p className="mb2 h6 gray-2">
            How will this product work? What technology might it use? Who will use it? What problem does it solve for them? How will you monetize?
          </p>

          <NewComment canContainWork={false}
              commentId={idea.news_feed_item && idea.news_feed_item.id}
              dropzoneInnerText={false}
              hideAvatar={true}
              hideButtons={true}
              initialText={this.state.ideaBody}
              placeholder={''}
              thread={IDEA_BODY_ID}
              url="/ideas" />
            <span className="gray-2 h6 mt2">Accepts <a href="//daringfireball.net/projects/markdown/" target="_blank">Markdown</a> and file uploads (just drag and drop)</span>
        </div>

        <div className="clearfix mt3">
          <div className="right ml4">
            <Button type="primary" action={this.isValidIdea() && this.buttonValid() && this.onNextClick}>
              {_.isEmpty(idea) ? 'Next' : 'Update'}
            </Button>
          </div>

          <p className="overflow-hidden h6 gray-2">
            When you share this on Assembly you're not committed to building this idea, however you will be the initial leader if you do decide to build it here. You can always remove your idea from Assembly. <a href="http://assembly.com/start">More questions?</a>
          </p>
        </div>

      </form>
    );
  }
});

module.exports = NewIdeaForm;
