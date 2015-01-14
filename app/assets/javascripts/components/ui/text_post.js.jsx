var Markdown = require('../markdown.js.jsx')
var Label = require('./label.js.jsx')
var AvatarWithUsername = require('./avatar_with_username.js.jsx')
var SingleLineList = require('./single_line_list.js.jsx')

module.exports = React.createClass({
  displayName: 'TextPost',

  propTypes: {
    author: React.PropTypes.object.isRequired,
    title:  React.PropTypes.string.isRequired,
    labels: React.PropTypes.array.isRequired,
    body:   React.PropTypes.string.isRequired
  },

  getDefaultProps: function() {
    return {
      labels: []
    }
  },

  render: function() {
    var body = null

    if (this.props.body) {
      body = <Markdown content={this.props.body} normalized="true" />
    } else {
      body = <div className="gray-3">No description yet</div>
    }

    return (
      <div className="visible-hover-wrapper">
        <div className="mb3 h6 mt0 mb0">
          <AvatarWithUsername user={this.props.author} size={18} />
          {' '}
          <span className="gray-2 visible-hover">posted {moment(this.props.timestamp).fromNow()}</span>
        </div>

        <h1 className="mt0 mb0" style={{ lineHeight: '36px' }}>
          {this.props.title}
        </h1>

        <div className="py1 mb2">
          <SingleLineList items={_.map(this.props.labels, function(label) {
            return <Label name={label.name} />
          })} />
        </div>

        {body}
      </div>
    )
  }
})
