var DropdownMixin = require('../../mixins/dropdown_mixin.js.jsx')
var DropdownMenu = require('./dropdown_menu.js.jsx')
var Icon = require('./icon.js.jsx')

var NavItem = React.createClass({

  mixins: [
    DropdownMixin
  ],

  propTypes: {
    active: React.PropTypes.bool,
    href: React.PropTypes.string,
    onClick: React.PropTypes.func,
    label: React.PropTypes.string,
    small: React.PropTypes.bool,
    dropdownMenu: React.PropTypes.instanceOf(DropdownMenu)
  },

  getDefaultProps() {
    return {
      active: false,
      href: '#',
      onClick: function() {},
      small: false
    }
  },

  render() {
    var dropdownMenu
    var chevron
    var label = this.props.label
    var href = this.props.href
    var onClick = this.props.onClick

    var classes = React.addons.classSet({
      'new-nav-item': true,
      'new-nav-item--small': this.props.small,
      'new-nav-item--active': this.props.active,
      'new-nav-item--hover':  this.isDropdownOpen(),
      'relative': !!this.props.dropdownMenu
    })

    if (this.props.dropdownMenu) {
      href = "javascript:;"
      onClick = this.toggleDropdown
      chevron = <Icon icon="chevron-down" />
    }

    if (this.isDropdownOpen()) {
      dropdownMenu = this.props.dropdownMenu
    }

    return (
      <li className={classes}>
        <a href={href} onClick={onClick}>{label} {chevron}</a>
        {dropdownMenu}
      </li>
    )
  }
})

var NavDivider = React.createClass({
  render() {
    return <li className="new-nav-divider">{' '}</li>
  }
})

var Nav = React.createClass({

  statics: {
    Item: NavItem,
    Divider: NavDivider
  },

  propTypes: {
    orientation: React.PropTypes.oneOf(['horizontal', 'stacked']).isRequired
  },

  getDefaultProps: function() {
    return {
      orientation: 'horizontal'
    }
  },

  render() {
    var orientation = this.props.orientation

    var cs = React.addons.classSet({
      'new-nav': true,
      'new-nav--horizontal': orientation === 'horizontal',
      'new-nav--stacked': orientation === 'stacked',
    })

    return <ul className={cs}>{this.props.children}</ul>
  }
})

module.exports = window.Nav = Nav
