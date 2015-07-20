'use strict'

const Classnames = require('classnames');

// components that get mounted after dangerously inserting html
window.TaskListItem = require('./task_list_item.js.jsx')

var Markdown = React.createClass({

  propTypes: {
    color: React.PropTypes.string,
    content: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]).isRequired,
    normalized: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.string
    ]),
    safelySetHtml: React.PropTypes.bool,
    lead: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      color: "gray-1",
      normalized: false,
      safelySetHtml: false,
      lead: false
    }
  },

  componentDidMount: function() {
    // render internal react_ujs components
    var node = $(this.getDOMNode())
    node = node && node.find('[data-react-class]')
    ReactUjs.mountReactComponents(node)
  },

  render: function() {
    var cs = Classnames('markdown', this.props.color, {
      'markdown--normalized': !!this.props.normalized,
      'markdown--lead': this.props.lead,
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
