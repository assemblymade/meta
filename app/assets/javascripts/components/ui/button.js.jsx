module.exports = React.createClass({
  displayName: 'Button',

  propTypes: {
    action: React.PropTypes.func,
    type:   React.PropTypes.oneOf(['default', 'primary'])
  },

  getDefaultProps: function() {
    return {
      type: 'default',
      submit: false
    }
  },

  render: function() {
    var cs = React.addons.classSet({
      'button': true,
      'button-default': this.props.type === 'default',
      'button-primary': this.props.type === 'primary',
      'button-is-disabled': !this.props.action
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
