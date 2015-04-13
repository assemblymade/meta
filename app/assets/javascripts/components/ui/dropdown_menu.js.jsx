var Icon = require('./icon.js.jsx')

var DropdownMenuItem = React.createClass({

  propTypes: {
    label: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string,
    action: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.string,
    ]),
  },

  render: function() {
    var icon = null
    if (this.props.icon) {
      icon = (
        <div className="left gray-3 mr1">
          <Icon icon={this.props.icon} fw={true} />
        </div>
      )
    }

    return (
      <li className="new-dropdown-menu-item">
        <a href={this.props.action} data-method={this.props.method}>{icon} {this.props.label}</a>
      </li>
    )
  }
})

var DropdownMenuDivider = React.createClass({
  render: function() {
    return <li className="new-dropdown-menu-divider"></li>
  }
})

var DropdownMenu = React.createClass({

  propTypes: {
    position: React.PropTypes.oneOf(['left', 'right'])
  },

  getDefaultProps: function() {
    return {
      position: 'left'
    }
  },

  statics: {
    Item: DropdownMenuItem,
    Divider: DropdownMenuDivider
  },

  render: function() {
    var cs = React.addons.classSet({
      'new-dropdown-menu': true,
      'new-dropdown-menu--left': this.props.position === 'left',
      'new-dropdown-menu--right': this.props.position === 'right'
    })

    return (
      <ul className={cs}>
        {this.props.children}
      </ul>
    )
  }
})

module.exports = window.DropdownMenu = DropdownMenu
