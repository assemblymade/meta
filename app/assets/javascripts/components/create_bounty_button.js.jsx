/** @jsx React.DOM */

(function() {
  var CreateBountyButton = React.createClass({
    getInitialState: function() {
      return {
        createBountyShown: false
      }
    },

    render: function() {
      return <span>
        <a className="btn btn-default btn-sm" onClick={this.handleClick}>Create a Bounty</a>
        {this.state.createBountyShown ? <CreateBounty onHidden={this.handleCreateBountyHidden} /> : null }
      </span>
    },

    handleCreateBountyHidden: function() {
      this.setState({ createBountyShown: false })
    },

    handleClick: function() {
      this.setState({ createBountyShown: true })
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = CreateBountyButton
  }

  window.CreateBountyButton = CreateBountyButton
})()
