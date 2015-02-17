'use strict';

const Button = require('../ui/button.js.jsx');
const IdeaContainer = require('./idea_container.js.jsx');
const IdeaAdminActionCreators = require('../../actions/idea_admin_action_creators.js');
const IdeaAdminStore = require('../../stores/idea_admin_store');
const IdeaStore = require('../../stores/idea_store');
const TagList = require('../tag_list.js.jsx');

let IdeaAdmin = React.createClass({
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
    let idea = this.state.idea;
    let index = idea.categories.indexOf(category);

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

    let updateIdea = {
      idea: {
        categories: idea.categories
      },
      id: idea.id
    };

    IdeaAdminActionCreators.updateIdea(updateIdea);
  },

  handleFlagClick(e) {
    e.stopPropagation();

    let idea = this.state.idea;

    if (idea.flagged_at) {
      idea.flagged_at = null
    } else {
      idea.flagged_at = new Date()
    }

    this.setState({
      idea: idea
    });

    let updateIdea = {
      idea: {
        flagged_at: idea.flagged_at
      },
      id: idea.id
    };

    IdeaAdminActionCreators.updateIdea(updateIdea);
  },

  handleTopicSelected(topic, e) {
    let idea = this.state.idea;

    idea.topics = [topic];

    this.setState({
      idea: idea
    });

    let updateIdea = {
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
    let idea = this.state.idea;

    return (
      <IdeaContainer showRelatedIdeas={false}>
        <div className="px4 py2">
          <h5>Topics</h5>
          {this.renderTopics()}

          <h5>Categories</h5>
          {this.renderCategories()}

          <div className="py2 clearfix">
            {this.renderFlag()}
            {this.renderSave()}
          </div>

          <h5>Tags</h5>
          <TagList destination={true} newBounty={true} tags={idea.mark_names || []} url={idea.url} />

          <TextInput width="125px" size="small" label="Add tag" prepend="#" prompt="Add" />

          <h5>Suggested tags</h5>
          <TagList tags={window.app.suggestedTags()} destination={false} url={idea.url}  />
        </div>
      </IdeaContainer>
    );
  },

  renderCategories() {
    let idea = this.state.idea;
    let ideaCategories = idea.categories;

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
    let idea = this.state.idea;

    return (
      <div className="form-group left">
        <Button type="default" action={this.handleFlagClick}>
          {idea.flagged_at ? 'Unflag' : 'Flag'}
        </Button>
      </div>
    );
  },

  renderSave() {
    let idea = this.state.idea;

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
    let idea = this.state.idea;
    let ideaTopics = idea.topics;

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
