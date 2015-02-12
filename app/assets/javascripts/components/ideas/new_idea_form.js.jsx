var Button = require('../ui/button.js.jsx');
var FormGroup = require('../form_group.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var IdeaActionCreators = require('../../actions/idea_action_creators');
var NewComment = require('../news_feed/new_comment.js.jsx');
var NewCommentStore = require('../../stores/new_comment_store');
var UserStore = require('../../stores/user_store');
var CharacterLimiter = require('../character_limiter.js.jsx')

var IDEA_BODY_ID = 'new_idea';

var NewIdeaForm = React.createClass({
  getInitialState() {
    return {
      firstQuestion: '',
      ideaName: '',
      isFounder: true,
      showWarning: false
    };
  },

  handleIdeaNameChange(e) {
    this.setState({
      ideaName: e.target.value
    });
  },

  onFounderOptionClick(e) {
    this.setState({
      isFounder: !this.state.isFounder
    });
  },

  onNextClick(e) {
    e.preventDefault();

    var idea = {
      name: this.state.ideaName,
      body: NewCommentStore.getComment(IDEA_BODY_ID),
      founder_preference: this.state.isFounder
    };

    IdeaActionCreators.submitIdeaClicked(idea);
  },

  render() {
    return (
      <form>
        <div className="form-group mb3">
          <label className="control-label">What's the quick pitch?</label>

          <p className="mb2 h6 gray-2">If you had 30 seconds to describe your product to a friend, what would you say? Use simple, direct words.</p>
          <CharacterLimiter limit={60} control={<input type="text" className="form-control input-lg"
          value={this.state.ideaName}
          onChange={this.handleIdeaNameChange} />} />
        </div>

        <div className="form-group mb3">
          <label className="control-label">Fill in the details</label>
          <p className="mb2 h6 gray-2">
            How did you come up with the idea? What makes it great? Describe your vision, the problem it's solving and your advantage over the competition.
          </p>

          <NewComment canContainWork={false}
              dropzoneInnerText={false}
              hideAvatar={true}
              hideButtons={true}
              placeholder={''}
              thread={IDEA_BODY_ID}
              url="/ideas" />
        </div>

        <div className="clearfix mt3">
          <div className="right ml4">
            <Button type="primary" action={this.onNextClick}>
              Next
            </Button>
          </div>

          <p className="overflow-hidden h6 gray-2">
            You're not commiting to building this idea, however you will be in control if you do decide to build it. You can always remove your idea from Assembly. <a href="mailto:austin.smith@assembly.com" target="_blank">More questions?</a>
          </p>
        </div>

      </form>
    );
  }
});

module.exports = NewIdeaForm;
