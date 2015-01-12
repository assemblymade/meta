var ProgressBar = React.createClass({
  displayName: 'ProgressBar',

  propTypes: {
    progress: React.PropTypes.number.isRequired
  },

  getDefaultProps: function() {
    return {
      progress: 0
    }
  },

  render: function() {
    var progress = this.props.progress;

    return (
      <div className="progress-group">
        <div className="item">
          <progress max="100" value={progress} title={progress} />
        </div>
      </div>
    );
  }
});

module.exports = ProgressBar;
