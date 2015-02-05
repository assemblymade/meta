/**
 * See drawer.scss for transitions
 */

var PureRenderMixin = React.addons.PureRenderMixin;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Drawer = React.createClass({
  mixins: [PureRenderMixin],

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
      <ReactCSSTransitionGroup component="div" transitionName="drawer">
        {
          this.props.open &&
          <div className="drawer-inner" key="drawer-inner">
            {this.props.children}
          </div>
        }
      </ReactCSSTransitionGroup>
    );
  }
});

module.exports = Drawer;
