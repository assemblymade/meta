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
    var body, labels

    if (this.props.body) {
      body = <Markdown content={this.props.body} normalized="true" />
    } else {
      body = <div className="gray-3">No description yet</div>
    }

    if (!_.isEmpty(this.props.labels)) {
      labels = <ul className="list-reset clearfix mxn1 py1 mb2">
        {_.map(this.props.labels, function(label) {
          return <li className="left px1" key={label.name}>
            <Label name={label.name} />
          </li>
        })}
      </ul>
    }

    return (
      <div className="visible-hover-wrapper">
        <div className="mb3 h6 mt0 mb0">
          <AvatarWithUsername user={this.props.author} size={18} />
          {' '}
          <span className="gray-2 visible-hover">posted {moment(this.props.timestamp).fromNow()}</span>
        </div>

        <h2 className="mt0 mb2" style={{ lineHeight: '36px' }}>
          {this.props.title}
        </h2>

        {labels}

        {body}
      </div>
    )
  }
})
