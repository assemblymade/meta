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

    renderCreateBounty: function() {
      if(!this.state.createBountyShown) {
        return
      }

      return this.transferPropsTo(
        <CreateBounty onHidden={this.handleCreateBountyHidden} />
      )
    },

    render: function() {
      return (
        <span>
          <a className={this.props.classes} onClick={this.handleClick}>{this.props.label}</a>
          {this.renderCreateBounty()}
        </span>
      )
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
