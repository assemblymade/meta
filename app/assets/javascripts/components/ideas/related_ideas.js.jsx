var RelatedIdeaTile = require('./related_idea_tile.js.jsx');
var RelatedIdeasStore = require('../../stores/related_ideas_store');

var RelatedIdeas = React.createClass({
  displayName: 'RelatedIdeas',

  componentDidMount: function() {
    RelatedIdeasStore.addChangeListener(this.onRelatedIdeasChange);
  },

  componentWillUnmount: function () {
    RelatedIdeasStore.removeChangeListener(this.onRelatedIdeasChange);
  },

  getInitialState: function() {
    return {
      ideas: RelatedIdeasStore.getRelatedIdeas()
    };
  },

  onRelatedIdeasChange: function() {
    this.setState({
      ideas: RelatedIdeasStore.getRelatedIdeas()
    });
  },

  render: function() {
    return (
      <div>
        {this.renderIdeaTiles()}
      </div>
    );
  },

  renderIdeaTiles: function() {
    return this.state.ideas.map((idea) => {
      return (
        <div className="mb2" key={idea.id}>
          <RelatedIdeaTile idea={idea} />
        </div>
      );
    });
  }
});

module.exports = RelatedIdeas;
