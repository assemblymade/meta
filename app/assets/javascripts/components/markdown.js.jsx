var Markdown = React.createClass({

  propTypes: {
    content: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]).isRequired,
    normalized: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.string
    ]),
    safelySetHtml: React.PropTypes.bool,
    wideQuotes: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      normalized: false,
      safelySetHtml: false,
      wideQuotes: false
    }
  },

  componentDidMount: function() {
    // render internal react_ujs components
    var node = $(this.getDOMNode()).find('[data-react-class]')
    ReactUjs.mountReactComponents(node)
  },

  render: function() {
    var cs = React.addons.classSet({
      'markdown': true,
      'markdown-normalized': !!this.props.normalized,
      'markdown-wide-quotes': this.props.wideQuotes
    })

    if (this.props.safelySetHtml) {
      return (
        <div className={cs}>
          {this.props.content}
        </div>
      )
    }

    return (
      <div className={cs} dangerouslySetInnerHTML={{ __html: this.props.content }} />
    )
  }
});

window.Markdown = module.exports = Markdown
