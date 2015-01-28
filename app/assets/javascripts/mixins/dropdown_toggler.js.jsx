var Jewel = require('../components/ui/jewel.js.jsx')

var DropdownTogglerMixin = {
  render: function() {
    var total = this.badgeCount();

    if (total > 0) {
      if (window.fluid) {
        window.fluid.dockBadge = total;
      }
    }

    return (
      <a className="block dropdown-toggle py2"
          href={this.props.href}
          data-toggle="dropdown"
          onClick={this.acknowledge}>
        <Jewel icon={this.props.icon} n={total} />
      </a>
    )
  }
}

module.exports = DropdownTogglerMixin
