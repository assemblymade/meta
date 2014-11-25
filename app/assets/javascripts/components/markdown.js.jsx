/** @jsx React.DOM */

var Markdown = React.createClass({
  displayName: 'Markdown',

  propTypes: {
    content: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]).isRequired,
    normalized: React.PropTypes.bool,
    safelySetHtml: React.PropTypes.bool
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
      <div className={cs} dangerouslySetInnerHTML={{__html: this.props.content}} />
    )
  }
})

window.Markdown = module.exports = Markdown
