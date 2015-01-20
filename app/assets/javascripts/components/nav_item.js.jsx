var NavItem = React.createClass({
  displayName: 'NavItem',

  propTypes: {
    active: React.PropTypes.bool,
    divider: React.PropTypes.bool,
    href: React.PropTypes.string,
    onClick: React.PropTypes.func,
    label: React.PropTypes.string,
    small: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      active: false,
      divider: false,
      href: '#',
      onClick: function() {},
      small: false
    }
  },

  renderBadge: function() {
    var hasBadge = this.props.badge

    if (hasBadge) {
      return <span className="new-nav-item-badge" />
    }
  },

  render: function() {
    var divider = this.props.divider

    if (divider) {
      return (
        <li className="new-nav-item new-nav-item-divider"></li>
      )
    }

    var label = this.props.label
    var isActive = this.props.active
    var isSmall = this.props.small
    var href = this.props.href
    var onClick = this.props.onClick

    var badge = this.renderBadge()

    var classes = React.addons.classSet({
      'new-nav-item': true,
      'new-nav-item-small': isSmall,
      'new-nav-item-is-active': isActive
    })

    return (
      <li className={classes}>
        <a href={href} onClick={onClick}>
          {label}
          {badge}
        </a>
      </li>
    )
  }
})

window.NavItem = module.exports = NavItem
