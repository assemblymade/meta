

(function() {
  var Popover = React.createClass({
    propTypes: {
      placement: React.PropTypes.oneOf(['top','right', 'bottom', 'left']),
      positionLeft: React.PropTypes.number,
      positionTop: React.PropTypes.number,
      arrowOffsetLeft: React.PropTypes.number,
      arrowOffsetTop: React.PropTypes.number,
      title: React.PropTypes.node,
      onClick: React.PropTypes.func
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
          <span style={{ position: 'absolute', right: 5, cursor: 'pointer' }}  onClick={this.props.onClick ? this.props.onClick : function() {}}>
            <Icon icon="close" />
          </span>
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
        <h5 className="popover-title">{this.props.title}</h5>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Popover;
  }

  window.Popover = Popover;
})();
