/** @jsx React.DOM */

(function() {
  window.DropdownTogglerMixin = {
    render: function() {
      var classes = ['icon', 'navbar-icon', this.props.iconClass];
      var total = this.badgeCount();
      var badge = null;

      if (total > 0) {
        badge = this.badge(total);
        classes.push('glyphicon-highlight');
      }

      return (
        <a href={this.props.href} data-toggle='dropdown' onClick={this.acknowledge}>
          <span className={classes.join(' ')}></span>
          {badge}
          <span className='visible-xs-inline' style={{ 'margin-left': '5px' }}>
            {this.props.label}
          </span>
        </a>
      );
    }
  };
})();
