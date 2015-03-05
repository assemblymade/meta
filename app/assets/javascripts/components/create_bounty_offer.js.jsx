

(function() {
  var CreateBountyOffer = React.createClass({
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
      var currentUser = window.app.currentUser();

      if(this.state.toggle === 'simple') {
        return <SimpleBountyOffer {...this.props} user={currentUser} />
      } else {
        return <CustomBountyOffer {...this.props} user={currentUser} />
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

          <div className="py3">
            {this.renderValueControl()}
          </div>
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = CreateBountyOffer;
  }

  window.CreateBountyOffer = CreateBountyOffer;
})();
