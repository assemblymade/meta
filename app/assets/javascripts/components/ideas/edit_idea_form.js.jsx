var Button = require('../ui/button.js.jsx');
var FormGroup = require('../form_group.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var IdeaActionCreators = require('../../actions/idea_action_creators');
var NewComment = require('../news_feed/new_comment.js.jsx');
var NewCommentStore = require('../../stores/new_comment_store');
var UserStore = require('../../stores/user_store');

var EditIdeaForm = React.createClass({
  propTypes: {
    idea: React.PropTypes.shape({
      founder_preference: React.PropTypes.bool,
      name: React.PropTypes.string.isRequired,
      raw_body: React.PropTypes.string.isRequired
    }).isRequired
  },

  componentDidMount() {
    NewCommentStore.addChangeListener(this.updateBody);
  },

  componentWillUnmount() {
    NewCommentStore.removeChangeListener(this.updateBody);
  },

  getInitialState() {
    var idea = this.props.idea;
    return {
      isFounder: idea.founder_preference,
      ideaBody: idea.raw_body,
      ideaName: idea.name
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

  onUpdateClick(e) {
    e.preventDefault();

    var idea = this.props.idea;
    var item = idea.news_feed_item;

    var idea = {
      body: this.state.ideaBody,
      id: idea.name,
      name: this.state.ideaName,
      founder_preference: this.state.isFounder
    };

    IdeaActionCreators.updateIdeaClicked(idea);
  },

  render() {
    var idea = this.props.idea;
    var item = idea.news_feed_item;

    return (
      <form>
        <div className="px4 mt3 form-group">
          <label>What's the elevator pitch?</label>
          <input type="text"
            className="form-control"
            limit={60}
            value={this.state.ideaName}
            onChange={this.handleIdeaNameChange} />
        </div>

        <div className="px4 form-group">
          <label>Describe it in more detail</label>
          <NewComment canContainWork={false}
              commentId={item.id}
              dropzoneInnerText={false}
              initialText={idea.raw_body}
              hideAvatar={true}
              hideButtons={true}
              placeholder={''}
              thread={item.id}
              url="/ideas" />
        </div>

        <div className="px4 form-group">
          <fieldset>
            <label>What do you want to do with this idea? (You can change your mind later.)</label>
            <div className="radio">
              <label key="founder-option">
                <input type="radio"
                  ref="founder"
                  checked={this.state.isFounder}
                  onChange={this.onFounderOptionClick} />
                I want to be the founder.
                <p className="gray-2">
                  As a founder, you determine the course of the app. If you
                  decide Assembly is not for you, you can remove the idea before
                  you start building it here.
                </p>
              </label>

              <label key="non-founder-option">
                <input type="radio"
                  ref="non-founder"
                  checked={!this.state.isFounder}
                  onChange={this.onFounderOptionClick} />
                I just want to share the idea and let someone else be a founder.
                <p className="gray-2">
                  You don't have to be a founder of the app, you can just drop
                  it off, or even work on it but leave the founding role to
                  someone else.
                </p>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="clearfix px4 py2">
          <div className="right">
            <Button type="primary" action={this.onUpdateClick}>
              <span className="title">Update</span>
            </Button>
          </div>
        </div>
      </form>
    );
  },

  updateBody() {
    var item = this.props.idea.news_feed_item;

    this.setState({
      body: NewCommentStore.getComment(item.id)
    });
  }
});

module.exports = EditIdeaForm;
