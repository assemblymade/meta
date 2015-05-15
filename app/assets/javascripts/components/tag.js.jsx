var Tag = React.createClass({
  displayName: 'Tag',

  propTypes: {
    tag: React.PropTypes.object.isRequired
  },

  render: function() {
    var tag = this.props.tag;
    return (
      <a className="h5 caps gray-2 mr2 pointer" href={this.props.tag.url}>
        #{this.props.tag.name}
      </a>
    );
  }

});

window.Tag = module.exports = Tag;
