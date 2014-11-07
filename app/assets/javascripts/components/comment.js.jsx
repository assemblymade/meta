/** @jsx React.DOM */

// TODO asset pipelined (chrislloyd)
// var marked = require('marked')

var Avatar = require('./avatar.js.jsx')
var Markdown = require('./markdown.js.jsx')

module.exports = React.createClass({
  displayName: 'Comment',

  propTypes: {
    author: React.PropTypes.object.isRequired,
    body:   React.PropTypes.string.isRequired
  },

  render: function() {
    var author = this.props.author
    var body = null

    var cs = React.addons.classSet({
      'gray-dark': this.isOptimistic(),
    })

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
          <a className="block bold black" style={{'line-height': '1.5rem'}} href={author.url}>{author.username}</a>

          <div className={cs}>
            <Markdown content={body} normalized="true" />
          </div>
        </div>
      </div>
    )
  },

  isOptimistic: function() {
    return this.props.optimistic != null;
  }
})
