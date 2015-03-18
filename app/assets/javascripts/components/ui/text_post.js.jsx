'use strict'

const _ = require('underscore')
const moment  = require('moment')
const Markdown  = require('../markdown.js.jsx')
const Label = require('./label.js.jsx')
const AvatarWithUsername  = require( './avatar_with_username.js.jsx')
const SingleLineList  = require( './single_line_list.js.jsx')
const User  = require( './../user.js.jsx')

const TextPost = React.createClass({

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
    let body, labels
    let author = this.props.author

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
        <div className="clearfix gray-2 mb3">
          <div className="left mr1">
            <User user={author} />
          </div>
          {' '}
          {author.username}
          {' '}
          <span className="visible-hover">posted {moment(this.props.timestamp).fromNow()}</span>
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

module.exports = TextPost
