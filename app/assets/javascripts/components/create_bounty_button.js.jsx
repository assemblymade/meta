/** @jsx React.DOM */

(function() {
  var CreateBountyButton = React.createClass({
    getDefaultProps: function() {
      return {
        label: 'Create a Bounty',
        classes: 'btn btn-default btn-sm'
      }
    },

    getInitialState: function() {
      return {
        createBountyShown: this.props.createBountyShown
      }
    },

    render: function() {
      return <span>
        <a className={this.props.classes} onClick={this.handleClick}>{this.props.label}</a>
        {this.state.createBountyShown ? <CreateBounty
            onHidden={this.handleCreateBountyHidden}
            product={this.props.product}
            maxOffer={this.props.maxOffer}
            averageBounty={this.props.averageBounty} /> : null }
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
