// TODO For webpack, requires font-awesome

var CustomIcons = [
  'app-coin',
  'chevron-down'
]

module.exports = React.createClass({
  displayName: 'Icon',

  render: function() {
    var cs = null
    if (CustomIcons.indexOf(this.props.icon) != -1) {
      cs = React.addons.classSet('icon', 'icon-' + this.props.icon)
    } else {
      cs = React.addons.classSet('fa', 'fa-' + this.props.icon)
    }
    return <span className={cs}></span>
  }
})
