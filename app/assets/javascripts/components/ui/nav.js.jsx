var NavItem = React.createClass({

  propTypes: {
    active: React.PropTypes.bool,
    href: React.PropTypes.string,
    onClick: React.PropTypes.func,
    label: React.PropTypes.string,
    small: React.PropTypes.bool
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
    var label = this.props.label
    var href = this.props.href
    var onClick = this.props.onClick

    var classes = React.addons.classSet({
      'new-nav-item': true,
      'new-nav-item--small': this.props.small,
      'new-nav-item--active': this.props.active
    })

    return (
      <li className={classes}>
        <a href={href} onClick={onClick}>{label}</a>
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
    direction: React.PropTypes.oneOf(['horizontal', 'stacked']).isRequired
  },

  getDefaultProps: function() {
    return {
      direction: 'horizontal'
    }
  },

  render() {
    var direction = this.props.direction

    var cs = React.addons.classSet({
      'new-nav': true,
      'new-nav--horizontal': direction === 'horizontal',
      'new-nav--stacked': direction === 'stacked',
    })

    return <ul className={cs}>{this.props.children}</ul>
  }
})

module.exports = window.Nav = Nav
