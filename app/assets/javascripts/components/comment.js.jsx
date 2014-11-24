/** @jsx React.DOM */

// TODO asset pipelined (chrislloyd)
// var marked = require('marked')

var Avatar = require('./avatar.js.jsx')
var Markdown = require('./markdown.js.jsx')

module.exports = React.createClass({
  displayName: 'Comment',

  propTypes: {
    author: React.PropTypes.object.isRequired,
    body: React.PropTypes.string.isRequired,
    timestamp: React.PropTypes.string
  },

  getInitialState: function() {
    var body = this.props.body;
    var shownBody = body && body.length > 200 ? this.truncate(body) : body

    return {
      shownBody: shownBody
    };
  },

  isOptimistic: function() {
    return !!this.props.optimistic;
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
      body = window.marked(this.state.shownBody)
    } else {
      body = this.state.shownBody
    }

    // because we're asking the Markdown component to safely render
    // the `content` prop that we pass it, we need to handle the danger
    // here in case the body is a string
    if (typeof body === 'string') {
      body = <span dangerouslySetInnerHTML={{ __html: body }} />;
    }

    return (
      <div className="clearfix">
        <div className="left mr2">
          <Avatar user={author} size={18} />
        </div>
        <div className="overflow-hidden">
          <div className="gray-2">
            <a className="bold black" href={author.url}>{author.username}</a>
            {timestamp}
          </div>

          <div className={cs}>
            <Markdown content={body} normalized={true} safelySetHtml={true} />
          </div>
        </div>
      </div>
    )
  },

  showEntireBody: function() {
    this.setState({
      shownBody: this.props.body
    });
  },

  truncate: function(body) {
    body = body.substring(0, 200);
    body = body.substring(0, body.lastIndexOf(' '));

    return (
      <span>
        <span dangerouslySetInnerHTML={{ __html: body }} />
        {' '}<a href="javascript:void(0);" className="bold" onClick={this.showEntireBody}>&hellip;</a>
      </span>
    );
  }
})
