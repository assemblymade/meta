var Icon = require('../icon.js.jsx');

var CircleIcon = React.createClass({
  propTypes: {
    diamter: React.PropTypes.number,
    icon: React.PropTypes.string.isRequired,
    margin: React.PropTypes.number
  },

  getDefaultProps() {
    return {
      diameter: 25,
      margin: 10
    };
  },

  render() {
    var backgroundColor = _determineColor(this.props.icon);
    var diameter = this.props.diameter;
    var style = {
      backgroundColor: backgroundColor,
      borderRadius: '100%',
      color: '#fff',
      display: 'inline-block',
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

function _determineColor(icon) {
  switch (icon) {
    case 'facebook':
      return '#3b5998';
    case 'google-plus':
      return '#d34836';
    case 'twitter':
      return '#4099FF';
    default:
      return '#333';
  }
}
