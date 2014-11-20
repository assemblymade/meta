/** @jsx React.DOM */

(function() {
  var Icon = require('../components/icon.js.jsx');

  var DropdownTogglerMixin = {
    render: function() {
      var classes = ['icon', this.props.icon];
      var total = this.badgeCount();
      var badgeTotal = null;
      var badgeClasses = ['badge', 'badge-navbar', 'block'];

      if (total > 0) {
        badgeTotal = this.badge && this.badge();
        badgeClasses.push('active');
        badgeClasses.push('bg-red');
        badgeClasses.push('white');


        if (window.fluid) {
          window.fluid.dockBadge = total;
        }
      }

      return (
        <a className="block dropdown-toggle py2 px1" href={this.props.href} data-toggle="dropdown" onClick={this.acknowledge}>
          <span className={badgeClasses.join(' ')}>
            <Icon icon={this.props.icon} />
            {badgeTotal}
          </span>
          <span className='visible-xs-inline' style={{ marginLeft: '5px' }}>
            {this.props.label}
          </span>
        </a>
      );
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = DropdownTogglerMixin;
  }
})();
