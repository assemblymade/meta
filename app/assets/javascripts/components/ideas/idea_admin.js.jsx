var Button = require('../ui/button.js.jsx');
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
      availableCategories: IdeaAdminStore.getAvailableCategories(),
      availableTopics: IdeaAdminStore.getAvailableTopics(),
      idea: IdeaStore.getIdea()
    };
  },

  handleCategorySelected(category, e) {
    var idea = this.state.idea;
    var index = idea.categories.indexOf(category);

    if (index === -1) {
      idea.categories.push(category);
    } else {
      idea.categories.splice(index, 1);
    }

    if (idea.categories.length === 0) {
      idea.categories = [""]
    }

    this.setState({
      idea: idea
    });

    var updateIdea = {
      idea: {
        categories: idea.categories
      },
      id: idea.id
    };

    IdeaAdminActionCreators.updateIdea(updateIdea);
  },

  handleFlagClick(e) {
    e.stopPropagation();

    var idea = this.state.idea;

    if (idea.flagged_at) {
      idea.flagged_at = null
    } else {
      idea.flagged_at = new Date()
    }

    this.setState({
      idea: idea
    });

    var updateIdea = {
      idea: {
        flagged_at: idea.flagged_at
      },
      id: idea.id
    };

    IdeaAdminActionCreators.updateIdea(updateIdea);
  },

  handleTopicSelected(topic, e) {
    var idea = this.state.idea;

    idea.topics = [topic];

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
      availableTopics: IdeaAdminStore.getAvailableTopics(),
      availableCategories: IdeaAdminStore.getAvailableCategories()
    });
  },

  render() {
    var idea = this.state.idea;

    return (
      <IdeaContainer navigate={this.props.navigate} showRelatedIdeas={false}>
        <div className="px4 py2">
          <h5>Topics</h5>
          {this.renderTopics()}

          <h5>Categories</h5>
          {this.renderCategories()}

          <div className="py2 clearfix">
            {this.renderFlag()}
            {this.renderSave()}
          </div>
        </div>
      </IdeaContainer>
    );
  },

  renderCategories() {
    var idea = this.state.idea;
    var ideaCategories = idea.categories;

    return this.state.availableCategories.map((category) => {
      return (
        <div className="form-group gray-1 mb0">
          <label>
            <input type="checkbox"
              checked={ideaCategories.indexOf(category.slug) > -1}
              onChange={this.handleCategorySelected.bind(this, category.slug)} />
            {' ' + category.name}
          </label>
        </div>
      );
    });
  },


  renderFlag() {
    var idea = this.state.idea;

    return (
      <div className="form-group left">
        <Button type="default" action={this.handleFlagClick}>
          {idea.flagged_at ? 'Unflag' : 'Flag'}
        </Button>
      </div>
    );
  },

  renderSave() {
    var idea = this.state.idea;

    return (
      <div className="form-group right">
        <a href={idea.path}>
          <Button type="primary" action={function() {}}>
            Save
          </Button>
        </a>
      </div>
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
                checked={ideaTopics.indexOf(topic.slug) > -1}
                onChange={this.handleTopicSelected.bind(this, topic.slug)} />
            {' ' + topic.name}
          </label>
        </div>
      );
    });
  },
});

module.exports = IdeaAdmin;
