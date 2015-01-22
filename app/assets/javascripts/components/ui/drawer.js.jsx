/**
 * See drawer.scss for transitions
 */

var Drawer = React.createClass({
  propTypes: {
    height: React.PropTypes.number,
    open: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      height: 50,
      open: false
    }
  },

  render() {
    var open = this.props.open;
    var classes = React.addons.classSet({
      drawer: true,
      'drawer-open': open
    });

    return (
      <div className={classes} style={{ height: open ? this.props.height : 0 }}>
        <div className="drawer-inner">
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = Drawer;
