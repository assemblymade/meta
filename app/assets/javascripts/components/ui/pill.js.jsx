var Pill = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['success', 'default'])
  },

  getDefaultProps() {
    return {
      type: 'default'
    };
  },

  render() {
    var type = this.props.type;

    var classes = React.addons.classSet({
      'bg-gray-2': type === 'default',
      'bg-green': type === 'success',
      bold: true,
      px3: true,
      // py1: true,
      white: true
    });

    return (
      <span className={classes} style={{ borderRadius: 20, paddingTop: '0.3rem', paddingBottom: '0.3rem' }}>
        {this.props.children}
      </span>
    );
  }
});

module.exports = Pill;
