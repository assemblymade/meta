var StoryStore = require('../stores/story_store');

var TitleNotificationsCount = React.createClass({

  componentDidMount: function() {
    StoryStore.addChangeListener(this.setTitle);
  },

  componentWillUnmount: function() {
    StoryStore.removeChangeListener(this.setTitle);
  },

  getDefaultProps: function() {
    return {
      title: document.title
    };
  },

  getInitialState: function() {
    return {
      count: 0
    };
  },

  render: function() {
    return <span />;
  },

  setTitle: function() {
    var storyCount = StoryStore.getUnviewedCount() || 0;

    document.title = storyCount > 0 ?
      '(' + storyCount + ') ' + this.props.title :
      this.props.title;
  }
});

module.exports = TitleNotificationsCount;
