/** @jsx React.DOM */

(function() {
  window.DropdownToggler = React.createClass({
    render: function() {
      return (
        <li>
          <a href={this.props.linkHref} data-toggle="dropdown" onClick={this.props.onClick}>
            <span className={this.props.iconClass}></span>
            {this.props.badge}
          </a>
          {this.props.children}
        </li>
      );
    }
  });
})();
