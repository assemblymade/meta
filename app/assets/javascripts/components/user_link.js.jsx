

(function() {
  var UserLink = React.createClass({
    render: function() {
      return <a href={this.props.url} title={'@' + this.props.username} className={this.props.className}>
        {this.props.children}
      </a>
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = UserLink;
  }

  window.UserLink = UserLink;
})();
