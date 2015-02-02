var Button = require('./button.js.jsx')

var ConfirmActionButton = React.createClass({
  propTypes: {
    action: React.PropTypes.string.isRequired,
    buttonLabel: React.PropTypes.string.isRequired,
    promptText: React.PropTypes.string.isRequired,
    requireText: React.PropTypes.string.isRequired
  },

  render: function() {
    return <Button type="default" action={this.handleClick}>{this.props.buttonLabel}</Button>
  },

  handleClick: function(e) {
    if (window.prompt(this.props.promptText) != this.props.requireText) {
      alert('Cancelled')
    } else {
      $.ajax({
        url: this.props.action,
        method: 'PATCH',
        success: function() {
          window.location.reload()
        },
        error: function() {
          alert('Something went wrong')
        }
      })
    }

  }
})

module.exports = window.ConfirmActionButton = ConfirmActionButton
