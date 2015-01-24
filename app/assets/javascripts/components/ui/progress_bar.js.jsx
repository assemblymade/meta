var ProgressBar = React.createClass({
  displayName: 'ProgressBar',

  propTypes: {
    progress: React.PropTypes.number.isRequired,
    threshold: React.PropTypes.number,
    type: React.PropTypes.oneOf([
      'danger',
      'primary',
      'gray',
      'success',
      'warning'
    ])
  },

  getDefaultProps() {
    return {
      progress: 0,
      type: 'default'
    }
  },

  render() {
    var progress = this.props.progress;
    var progressBarClasses = {
      'progress-bar': true
    };

    progressBarClasses['progress-bar-' + this.props.type] = true;
    progressBarClasses = React.addons.classSet(progressBarClasses);

    return (
      <div className="progress mb0" style={{ position: 'relative' }}>
        <div className={progressBarClasses}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemax="100"
            style={{ width: progress + '%' }}>
          <span className="sr-only">{progress + '%'}</span>
          {this.renderThreshold()}
        </div>
      </div>
    );
  },

  renderThreshold() {
    if (this.props.threshold) {
      return <div className="progress-threshold" style={{ left: this.props.threshold + '%'}} />
    }
  }
});

module.exports = ProgressBar;
