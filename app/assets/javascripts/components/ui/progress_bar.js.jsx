var ProgressBar = React.createClass({
  displayName: 'ProgressBar',

  propTypes: {
    progress: React.PropTypes.number.isRequired,
    threshold: React.PropTypes.number,
    type: React.PropTypes.oneOf([
      'default',
      'success',
      'warning',
      'danger'
    ])
  },

  getDefaultProps: function() {
    return {
      progress: 0,
      type: 'default'
    }
  },

  render: function() {
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

  renderThreshold: function() {
    if (this.props.threshold) {
      return <div style={{
          position: 'absolute',
          top: 0,
          left: this.props.threshold + '%',
          backgroundColor: 'gray',
          height: '100%',
          width: 3 }} />
    }
  }
});

module.exports = ProgressBar;
