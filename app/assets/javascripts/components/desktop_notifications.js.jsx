

(function() {
  var DesktopNotifications = React.createClass({
    getInitialState: function() {
      return { enabled: false }
    },

    updateEnabled: function(enabled) {
      this.setState({ enabled: enabled})
      this.props.onChange(this.state.enabled);
    },

    componentDidMount: function() {
      this.updateEnabled(!(Notify.isSupported() && Notify.needsPermission()))
    },

    handleClick: function() {
      var _this = this
      Notify.requestPermission(function(){
        _this.updateEnabled(true)
      })
    },

    render: function(){
      if(this.state.enabled) {
        return <span />;
      } else {
        return (
          <a href="#enable-notifications" className="js-enable-notifications text-small" data-toggle="tooltip" data-placement="left" title="Enable&nbsp;desktop notifications for @mentions" onClick={this.handleClick}>
            Enable notifications
          </a>
        );
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DesktopNotifications;
  }

  window.DesktopNotifications = DesktopNotifications;
})();
