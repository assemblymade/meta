var Icon = require('./icon.js.jsx')

var IconToggler = React.createClass({

  propTypes: {
    on: React.PropTypes.bool,

    icon: React.PropTypes.object.isRequired,
    action: React.PropTypes.func.isRequired,

    color: React.PropTypes.string.isRequired
  },

  getDefaultProps: function() {
    return {
      on: false
    }
  },

  render: function() {
    var cs = React.addons.classSet(
      "icon-toggler",
      this.props.color + "-hover",
      (this.props.on ? this.props.color : "gray-3")
    )

    return <button className={cs} onClick={this.toggle} type="button">{this.props.icon}</button>
  },

  toggle: function(e) {
    this.props.action(this.props.on)
  }
})

module.exports = IconToggler
