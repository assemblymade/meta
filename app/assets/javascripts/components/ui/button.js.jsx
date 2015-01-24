var Button = React.createClass({

  propTypes: {
    action: React.PropTypes.func,
    type:   React.PropTypes.oneOf(['default', 'primary']),
    block:  React.PropTypes.bool,
    active: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      active: false,
      block: false,
      type: 'default',
      submit: false
    }
  },

  render: function() {
    var cs = React.addons.classSet({
      'button': true,
      'button-default': this.props.type === 'default',
      'button-primary': this.props.type === 'primary',
      'button-is-disabled': !this.props.action,
      'active': this.props.active,
      'button-block': this.props.block
    })

    return (
      <button className={cs} onClick={this.props.action} type={this.submitType()} disabled={!this.props.action}>
        {this.props.children}
      </button>
    )
  },

  // --

  submitType: function() {
    return this.props.submit ? "submit" : "button"
  }
})

module.exports = Button
