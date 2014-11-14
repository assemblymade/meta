/** @jsx React.DOM */

var Markdown = React.createClass({
  displayName: 'Markdown',

  propTypes: {
    content: React.PropTypes.string.isRequired
  },

  render: function() {
    var normalized = this.props.normalized

    var cs = React.addons.classSet({
      'markdown': true,
      'markdown-normalized': (typeof normalized !== "undefined" && normalized !== null)
    })

    return (
      <div className={cs} dangerouslySetInnerHTML={{__html: this.props.content}} />
    )
  }
})

window.Markdown = module.exports = Markdown
