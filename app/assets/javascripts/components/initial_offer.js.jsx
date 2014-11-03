/** @jsx React.DOM */

(function() {
  var InitialOffer = React.createClass({
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
        return this.transferPropsTo(<SimpleNewBountyOffer />)
      } else {
        return this.transferPropsTo(<AdvancedNewBountyOffer />)
      }
    },

    render: function() {
      return (
        <div className="form-group">
          <div className="btn-group right">
            <a onClick={this.handleToggleClick} href="#">{this.state.toggle == 'simple' ? 'Advanced' : 'Simple'}</a>
          </div>

          <label className="control-label">
            Value
          </label>

          <div style={{ height: 200 }}>
            {this.renderValueControl()}
          </div>
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InitialOffer;
  }

  window.InitialOffer = InitialOffer;
})();
