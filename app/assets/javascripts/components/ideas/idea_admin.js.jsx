var IdeaContainer = require('./idea_container.js.jsx');
var IdeaAdminActionCreators = require('../../actions/idea_admin_action_creators.js');
var IdeaAdminStore = require('../../stores/idea_admin_store');
var IdeaStore = require('../../stores/idea_store');


var IdeaAdmin = React.createClass({
  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    IdeaAdminStore.addChangeListener(this.onIdeaAdminChange);
    IdeaStore.addChangeListener(this.onIdeaChange);
  },

  componentWillUnmount() {
    IdeaAdminStore.removeChangeListener(this.onIdeaAdminChange);
    IdeaStore.removeChangeListener(this.onIdeaChange);
  },

  getInitialState() {
    return {
      idea: IdeaStore.getIdea(),
      availableTopics: IdeaAdminStore.getAvailableTopics()
    };
  },

  handleTopicSelected(topic, e) {
    var idea = this.state.idea;
    var topics = idea.topics;

    for (var t in topics) {
      if (topics.hasOwnProperty(t) && t !== topic) {
        topics[t] = false;
      }
    }

    topics[topic] = true;
    idea.topics = topics;

    this.setState({
      idea: idea
    });

    var updateIdea = {
      idea: {
        topics: idea.topics
      },
      id: idea.id
    };

    IdeaAdminActionCreators.updateIdea(updateIdea);
  },

  onIdeaChange() {
    this.setState({
      idea: IdeaStore.getIdea()
    });
  },

  onIdeaAdminChange() {
    this.setState({
      availableTopics: IdeaAdminStore.getAvailableTopics()
    });
  },

  render() {
    var idea = this.state.idea;

    return (
      <IdeaContainer navigate={this.props.navigate} showRelatedIdeas={false}>
        <div className="px3">
          <h5>Topics</h5>
          <div className="clearfix">
            {this.renderTopics()}
            {this.renderFlag()}
          </div>
        </div>
      </IdeaContainer>
    );
  },

  renderTopics() {
    var idea = this.state.idea;
    var ideaTopics = idea.topics;

    return this.state.availableTopics.map((topic) => {
      return (
        <div className="form-group gray-1 mb0">
          <label>
            <input type="radio"
                checked={ideaTopics[topic.slug]}
                onChange={this.handleTopicSelected.bind(this, topic.slug)} />
            {' ' + topic.name}
          </label>
        </div>
      );
    });
  },

  renderFlag() {
    var idea = this.state.idea;

    var click = function(event) {
      event.stopPropagation();
      event.preventDefault();

      if (idea.flagged_at) {
        idea.flagged_at = null
      } else {
        idea.flagged_at = new Date()
      }

      IdeaAdminActionCreators.updateIdea(idea);
    }

    return (
      <div className="form-group mt2">
        <button className="button button-default" onClick={click}>
          {idea.flagged_at ? 'Unflag' : 'Flag'}
        </button>
      </div>
    )
  }
});

module.exports = IdeaAdmin;
