var Markdown = React.createClass({
  displayName: 'Markdown',

  propTypes: {
    content: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]).isRequired,
    normalized: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.string
    ]),
    safelySetHtml: React.PropTypes.bool
  },

  componentDidMount: function() {
    // render internal react_ujs components
    ReactUjs.mountReactComponents($(this.getDOMNode()).find('[data-react-class]'));
  },

  render: function() {
    var normalized = this.props.normalized

    var cs = React.addons.classSet({
      'markdown': true,
      'markdown-normalized': !!normalized
    });

    if (this.props.safelySetHtml) {
      return (
        <div className={cs}>
          {this.props.content}
        </div>
      );
    }

    return (
      <div className={cs} dangerouslySetInnerHTML={{ __html: this.props.content }} />
    )
  }
});

window.Markdown = module.exports = Markdown
