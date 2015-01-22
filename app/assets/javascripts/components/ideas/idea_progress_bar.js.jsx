var IdeaProgressStore = require('../../stores/idea_progress_store');
var ProgressBar = require('../ui/progress_bar.js.jsx');

var IdeaProgressBar = React.createClass({
  propTypes: {
    idea: React.PropTypes.shape({
      greenlit_at: React.PropTypes.string,
      hearts_count: React.PropTypes.number.isRequired,
      news_feed_item: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      }).isRequired,
      tilting_threshold: React.PropTypes.number.isRequired
    }).isRequired
  },

  calculateProgress(heartsIncOrDec) {
    var idea = this.props.idea;
    var heartsCount = idea.hearts_count + (heartsIncOrDec || 0);
    var threshold = idea.tilting_threshold;
    // the threshold is to the 80% percentile;
    // we want to show the meter up to the 100% percentile
    var max = parseInt(threshold * 1.25, 10);

    return (heartsCount / max) * 100;
  },

  componentDidMount() {
    IdeaProgressStore.addChangeListener(this.updateProgress);
  },

  componentWillReceiveProps() {
    this.setState({
      progress: this.calculateProgress()
    });
  },

  componentWillUnmount() {
    IdeaProgressStore.removeChangeListener(this.updateProgress);
  },

  getInitialState() {
    return {
      progress: this.calculateProgress()
    };
  },

  render() {
    var idea = this.props.idea;
    var progress = this.state.progress;

    return (
      <ProgressBar progress={progress}
          threshold={80}
          type={(this.state.heartsCount > idea.tilting_threshold || idea.greenlit_at) ? 'success' : 'gray'} />
    );
  },

  updateProgress() {
    var heartsIncOrDec = IdeaProgressStore.getProgress(
      this.props.idea.news_feed_item.id
    );

    this.setState({
      progress: this.calculateProgress(heartsIncOrDec)
    });
  }
});

module.exports = IdeaProgressBar;
