

(function() {
  var VoteBountyOffer = React.createClass({
    getInitialState: function() {
      return {
        toggle: 'simple'
      }
    },

    handleToggleClick: function() {
      this.setState({
        toggle: this.state.toggle == 'simple' ? 'custom' : 'simple'
      })
    },

    handleClick: function(toggle) {
      return function(e) {
        e.preventDefault()
        this.setState({
          toggle: toggle
        })
      }.bind(this)
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
        <div>
          <ul className="px3 nav nav-tabs nav-slim h6 mt0 mb0">
            <li className={this.state.toggle == 'simple' ? 'active' : null}>
              <a onClick={this.handleClick('simple')} href="#" style={{ lineHeight: '1.5rem', paddingTop: 12, paddingBottom: 9 }}>
                Suggested
              </a>
            </li>
            <li className={this.state.toggle == 'custom' ? 'active' : null}>
              <a onClick={this.handleClick('custom')} href="#" style={{ lineHeight: '1.5rem', paddingTop: 12, paddingBottom: 9 }}>
                Custom
              </a>
            </li>
          </ul>

          <div className="p3">
            {this.renderValueControl()}
          </div>
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = VoteBountyOffer;
  }

  window.VoteBountyOffer = VoteBountyOffer;
})();
