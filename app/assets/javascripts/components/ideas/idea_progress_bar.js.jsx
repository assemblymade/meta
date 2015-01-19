var IdeaProgressStore = require('../../stores/idea_progress_store');
var ProgressBar = require('../ui/progress_bar.js.jsx');

var TILTING_THRESHOLD = 75;

var IdeaProgressBar = React.createClass({
  propTypes: {
    idea: React.PropTypes.shape({
      greenlit_at: React.PropTypes.any.isRequired,
      news_feed_item: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      }).isRequired,
      temperature: React.PropTypes.number.isRequired
    }).isRequired
  },

  componentDidMount() {
    IdeaProgressStore.addChangeListener(this.updateProgress);
  },

  componentWillUnmount() {
    IdeaProgressStore.removeChangeListener(this.updateProgress);
  },

  getInitialState() {
    return {
      progress: this.props.idea.temperature
    };
  },

  render() {
    var idea = this.props.idea;
    var progress = this.state.progress;

    return (
      <ProgressBar progress={progress}
          threshold={TILTING_THRESHOLD}
          type={(progress > TILTING_THRESHOLD || idea.greenlit_at) ? 'success' : 'gray'} />
    );
  },

  updateProgress() {
    this.setState({
      progress: IdeaProgressStore.getProgress(this.props.idea.news_feed_item.id)
    });
  }
});

module.exports = IdeaProgressBar;
