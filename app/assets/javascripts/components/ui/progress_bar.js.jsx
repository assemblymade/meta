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
    return (
      <div className="progress-group">
        <div className="item">
          <progress max="100" value={this.props.progress} />
        </div>
        <div className="item">
          <div className="progress-count">
            322
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProgressBar;
