/** @jsx React.DOM */

module.exports = React.createClass({
  displayName: 'Thumbnail',
  propTypes: {
    src: React.PropTypes.string.isRequired,
    size: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      size: 100
    };
  },

  render: function() {
    var size = this.props.size;

    return (
      <img src={'https://firesize.com/' + size + 'x' + size + '/g_center/' + this.props.src} />
    );
  }
});
