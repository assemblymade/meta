var IdeaContainer = require('./idea_container.js.jsx');
var IdeaStore = require('../../stores/idea_store');

var TOPICS = [
  "Productivity & Tools",
  "SaaS",
  "Mobile",
  "Social",
  "Entertainment & Games",
  "Family & Lifestyle",
  "Art & Design",
  "Education"
];

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
    IdeaStore.addChangeListener(this.onIdeaChange);
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onIdeaChange);
  },

  getInitialState() {
    return {
      idea: IdeaStore.getIdea()
    };
  },

  handleTopicSelected(topic, e) {
    var idea = this.state.idea;

    idea.topics[topic] = !idea.topics[topic];

    this.setState({
      idea: idea
    });
  },

  onIdeaChange() {
    this.setState({
      idea: IdeaStore.getIdea()
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
          </div>
        </div>
      </IdeaContainer>
    );
  },

  renderTopics() {
    var idea = this.state.idea;
    var ideaTopics = idea.topics;

    return TOPICS.map((topic) => {
      return (
        <div className="form-group gray-1 mb0">
          <label>
            <input type="checkbox"
                checked={idea[topic]}
                onChange={this.handleTopicSelected.bind(this, topic)} />
            {' ' + topic}
          </label>
        </div>
      );
    });
  }
});

module.exports = IdeaAdmin;
