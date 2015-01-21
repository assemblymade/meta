var ProgressBar = React.createClass({
  displayName: 'ProgressBar',

  propTypes: {
    percent: React.PropTypes.number,
    style: React.PropTypes.oneOf(['progress-info', 'progress-success', 'progress-warning', 'progress-danger'])
  },

  render: function() {

    return (
      <div className="progress">
        <div className="progress-bar" role="progressbar" aria-valuenow= {this.props.percent.toString().concat("%")} aria-valuemin="0" aria-valuemax="100" style= {{width: this.props.percent.toString().concat("%")}}>
          <span className="sr-only"></span>
        </div>
      </div>
    )
  }
})

module.exports = window.ProgressBar = ProgressBar
