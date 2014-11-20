var Tag = React.createClass({
  displayName: 'Tag',

  propTypes: {
    tag: React.PropTypes.object.isRequired
  },

  render: function() {
    var tag = this.props.tag;
    return (
      <div className="inline-block h6 mt0 mb0 caps bold gray-3">{this.props.tag.name}</div>
    );
  }

});

window.Tag = module.exports = Tag;
