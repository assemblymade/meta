/** @jsx React.DOM */

(function() {
  var Popover = React.createClass({
    propTypes: {
      placement: React.PropTypes.oneOf(['top','right', 'bottom', 'left']),
      positionLeft: React.PropTypes.number,
      positionTop: React.PropTypes.number,
      arrowOffsetLeft: React.PropTypes.number,
      arrowOffsetTop: React.PropTypes.number,
      title: React.PropTypes.renderable
    },

    getDefaultProps: function () {
      return {
        placement: 'right'
      };
    },

    render: function () {
      var classes = {
        popover: true,
        in: this.props.positionLeft !== null ||
            this.props.positionTop !== null  ||
            this.props.positionLeft !== undefined ||
            this.props.positionTop !== undefined
      };

      classes[this.props.placement] = true;

      var style = {
        left: this.props.positionLeft,
        top: this.props.positionTop,
        display: 'block'
      };

      var arrowStyle = {
        left: this.props.arrowOffsetLeft,
        top: this.props.arrowOffsetTop
      };

      return (
        <div className={React.addons.classSet(classes)} style={style}>
          <div className="arrow" style={arrowStyle} />
          {this.props.title ? this.renderTitle() : null}
          <div className="popover-content">
            {this.props.children}
          </div>
        </div>
      );
    },

    renderTitle: function() {
      return (
        <h3 className="popover-title">{this.props.title}</h3>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Popover;
  }

  window.Popover = Popover;
})();
