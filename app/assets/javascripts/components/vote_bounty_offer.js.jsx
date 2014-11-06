/** @jsx React.DOM */

(function() {
  var VoteBountyOffer = React.createClass({
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
        toggle: this.state.toggle == 'simple' ? 'custom' : 'simple'
      })
    },

    handleClick: function(toggle) {
      return function() {
        this.setState({
          toggle: toggle
        })
      }.bind(this)
    },

    renderValueControl: function() {
      if(this.state.toggle === 'simple') {
        return (
          <div className="mt4">
            {this.transferPropsTo(<SimpleBountyOffer />)}
          </div>
        )
      } else {
        return (
          <div className="mt2">
            {this.transferPropsTo(<CustomBountyOffer />)}
          </div>
        )
      }
    },

    render: function() {
      return (
        <div>
          <ul className="nav nav-tabs">
            <li style={{ 'margin-left': 30 }} className={this.state.toggle == 'simple' ? 'active' : null}>
              <a onClick={this.handleClick('simple')} href="#">
                Simple
              </a>
            </li>
            <li className={this.state.toggle == 'custom' ? 'active' : null}>
              <a onClick={this.handleClick('custom')} href="#">
                Custom
              </a>
            </li>
          </ul>

          <div style={{ padding: '6px 30px' }}>
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
