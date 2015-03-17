var Icon = require('../ui/icon.js.jsx');

var CircleIcon = React.createClass({
  propTypes: {
    diameter: React.PropTypes.number,
    icon: React.PropTypes.string.isRequired,
    margin: React.PropTypes.number,
    muted: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      diameter: 25,
      margin: 10,
      muted: false
    };
  },

  render() {
    var backgroundColor = _determineColor(this.props.icon, this.props.muted);
    var diameter = this.props.diameter;
    var style = {
      backgroundColor: backgroundColor,
      borderRadius: '100%',
      color: '#fff',
      display: 'inline-block',
      fontSize: 16,
      height: diameter,
      margin: this.props.margin,
      textAlign: 'center',
      width: diameter
    };
    return (
      <span style={style}>
        <Icon icon={this.props.icon} />
      </span>
    );
  }
});

module.exports = CircleIcon;

function _determineColor(icon, muted) {
  if (muted) {
    return '#8B909A';
  } else {
    switch (icon) {
      case 'facebook':
        return '#3b5998';
      case 'google-plus':
        return '#d34836';
      case 'twitter':
        return '#4099ff';
      default:
        return '#333';
    }
  }
}
