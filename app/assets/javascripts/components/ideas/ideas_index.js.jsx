var Idea = require('./idea.js.jsx');
var IdeasStore = require('../../stores/ideas_store');
var Pagination = require('../pagination/pagination.js.jsx');

var IdeasIndex = React.createClass({
  displayName: 'IdeasIndex',

  propTypes: {
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount: function() {
    IdeasStore.addChangeListener(this.getIdeas);
  },

  componentWillUnmount: function() {
    IdeasStore.removeChangeListener(this.getIdeas);
  },

  getIdeas: function() {
    this.setState({
      ideas: IdeasStore.getIdeas()
    });
  },

  getInitialState: function() {
    return {
      ideas: IdeasStore.getIdeas()
    }
  },

  render: function() {
    return (
      <div className="main">
        <div className="grid fixed-small">
          {this.renderIdeas()}
        </div>
      </div>
    );
  },

  renderIdeas: function() {
    var ideas = this.state.ideas;
    var IdeaFactory = React.createFactory(Idea);

    if (ideas.length) {
      return ideas.map(function(idea) {
        return IdeaFactory({ idea: idea });
      });
    }
  }
});

module.exports = IdeasIndex;
