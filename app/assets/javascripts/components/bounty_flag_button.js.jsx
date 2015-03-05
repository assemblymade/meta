

(function() {
  var xhr = require('../xhr')

  var BountyFlagButton = React.createClass({
    getInitialState: function() {
      return { flagged: false }
    },

    render: function() {
      if (this.state.flagged) {
        return <div className="pull-right">
          <span className="btn btn-xs" disabled>
            <span className="glyphicon glyphicon-flag"></span>
            &nbsp;Flagged
          </span>
        </div>
      } else {
        return <div className="pull-right">
          <a href="javascript:;" onClick={this.handleClick} className="btn btn-xs btn-danger">
            <span className="glyphicon glyphicon-flag"></span>
            &nbsp;Flag
          </a>
        </div>
      }
    },

    handleClick: function() {
      xhr.patch(this.props.url)
      this.setState({ flagged: true })
    }
  })


  if (typeof module !== 'undefined') {
    module.exports = BountyFlagButton;
  }

  window.BountyFlagButton = BountyFlagButton;
})();
