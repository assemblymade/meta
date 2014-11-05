/** @jsx React.DOM */

(function() {
  var CreateBountyOffer = React.createClass({
    getDefaultProps: function() {
      return {
        user: app.currentUser()
      }
    },

    getInitialState: function() {
      return {
        toggle: 'simple'
      }
    },

    handleToggleClick: function() {
      this.setState({
        toggle: this.state.toggle == 'simple' ? 'advanced' : 'simple'
      })
    },

    renderValueControl: function() {
      if(this.state.toggle === 'simple') {
        return (
          <div className="p3">
            {this.transferPropsTo(<SimpleBountyOffer />)}
          </div>
        )
      } else {
        return (
          <div className="py3">
            {this.transferPropsTo(<CustomBountyOffer />)}
          </div>
        )
      }
    },

    render: function() {
      return (
        <div className="form-group">
          <div className="btn-group right">
            <a onClick={this.handleToggleClick} href="#">{this.state.toggle == 'simple' ? 'Custom' : 'Simple'}</a>
          </div>

          <label className="control-label">
            Value
          </label>

          {this.renderValueControl()}
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = CreateBountyOffer;
  }

  window.CreateBountyOffer = CreateBountyOffer;
})();
