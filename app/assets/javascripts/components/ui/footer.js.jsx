var Footer = React.createClass({
  displayName: 'Footer',

  render: function() {
    return (
      <div className="footer">
        {this.props.children}
      </div>
    );
  }
});

module.exports = Footer;
