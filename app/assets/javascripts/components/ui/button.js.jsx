module.exports = React.createClass({
  displayName: 'Button',

  propTypes: {
    action: React.PropTypes.func
  },

  render: function() {
    var cs = React.addons.classSet({
      'button': true,
      'button-primary': true,
      'button-is-disabled': !this.props.action
    })

    return (
      <button className={cs} onClick={this.props.action} type="button" disabled={!this.props.action}>
        {this.props.children}
      </button>
    )
  }
})
