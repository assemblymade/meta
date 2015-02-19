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

    IdeaActionCreators.updateIdea(idea);
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
          <span className="gray-2 h6 mt2">Accepts <a href="//daringfireball.net/projects/markdown/" target="_blank">Markdown</a> and file uploads (just drag and drop)</span>
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
