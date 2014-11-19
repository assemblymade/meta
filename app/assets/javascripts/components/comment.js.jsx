/** @jsx React.DOM */

// TODO asset pipelined (chrislloyd)
// var marked = require('marked')

var Avatar = require('./avatar.js.jsx')
var Markdown = require('./markdown.js.jsx')

module.exports = React.createClass({
  displayName: 'Comment',

  propTypes: {
    author: React.PropTypes.object.isRequired,
    body:   React.PropTypes.string.isRequired,
    timestamp: React.PropTypes.string
  },

  render: function() {
    var author = this.props.author
    var timestamp = null
    var body = null

    var cs = React.addons.classSet({
      'gray-dark': this.isOptimistic(),
    })

    if (this.props.timestamp) {
      timestamp = (
        <span>
          {' '} <time>{$.timeago(this.props.timestamp)}</time>
        </span>
      )
    }

    if (this.isOptimistic()) {
      body = window.marked(this.props.body)
    } else {
      body = this.props.body
    }


    return (
      <div className="clearfix">
        <div className="left mr2">
          <Avatar user={author} size={24} />
        </div>
        <div className="overflow-hidden">
          <div className="gray-3">
            <a className="bold black" href={author.url}>{author.username}</a>
            {timestamp}
          </div>

          <div className={cs}>
            <Markdown content={body} normalized="true" />
          </div>
        </div>
      </div>
    )
  },

  isOptimistic: function() {
    return !!this.props.optimistic;
  }
})
