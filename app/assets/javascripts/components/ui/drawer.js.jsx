/**
 * See drawer.scss for transitions
 */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Drawer = React.createClass({
  propTypes: {
    open: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      open: false
    };
  },

  render() {
    return (
      <div className="drawer">
        <ReactCSSTransitionGroup component="div" transitionName="drawer">
          {
            this.props.open &&
            <div className="drawer-inner" key="drawer-inner">
              {this.props.children}
            </div>
          }
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});

module.exports = Drawer;
