module.exports = React.createClass({
  displayName: 'Button',

  propTypes: {
    action: React.PropTypes.func,
    type:   React.PropTypes.oneOf(['default', 'primary'])
  },

  getDefaultProps: function() {
    return {
      type: 'default'
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
      <button className={cs} onClick={this.props.action} type="button" disabled={!this.props.action}>
        {this.props.children}
      </button>
    )
  }
})
