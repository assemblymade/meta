/** @jsx React.DOM */

(function() {
  var DropdownTogglerMixin = {
    render: function() {
      var classes = ['icon', this.props.iconClass];
      var total = this.badgeCount();
      var badgeTotal = null;
      var badgeClasses = ['badge', 'badge-navbar'];

      if (total > 0) {
        badgeTotal = this.badge && this.badge();
        badgeClasses.push('active');

        if (window.fluid) {
          window.fluid.dockBadge = total;
        }
      }

      return (
        <a href={this.props.href} data-toggle='dropdown' onClick={this.acknowledge}  style={{ padding: '13px 6px 12px' }}>
          <span className={badgeClasses.join(' ')}>
            <span className={classes.join(' ')}></span>
            {badgeTotal}
          </span>
          <span className='visible-xs-inline' style={{ 'margin-left': '5px' }}>
            {this.props.label}
          </span>
        </a>
      );
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = DropdownTogglerMixin;
  }

  window.DropdownTogglerMixin = DropdownTogglerMixin;
})();
