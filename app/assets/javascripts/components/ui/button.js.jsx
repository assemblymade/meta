var Button = React.createClass({

  propTypes: {
    action: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.func,
      React.PropTypes.string
    ]),
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
    var action = this.props.action
    var cs = React.addons.classSet({
      'button': true,
      'button--default': this.props.type === 'default',
      'button--primary': this.props.type === 'primary',
      'button--disabled': !this.props.action,
      'active': this.props.active,
      'button--block': this.props.block
    })

    if (_.isString(action)) {
      return <a className={cs} href={action}>{this.props.children}</a>
    }

    return (
      <button className={cs} onClick={action} type={this.buttonType()} disabled={!this.props.action}>
        {this.props.children}
      </button>
    )
  },

  // --

  buttonType: function() {
    return this.props.submit ? "submit" : "button"
  }
})

module.exports = Button
