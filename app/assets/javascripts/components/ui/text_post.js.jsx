import _ from 'underscore'
import moment from 'moment'
import Markdown from '../markdown.js.jsx'
import Label from './label.js.jsx'
import AvatarWithUsername from './avatar_with_username.js.jsx'
import SingleLineList from './single_line_list.js.jsx'
import User from './../user.js.jsx'

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
        <div className="clearfix mb3">
          <div className="left mr1">
            <User user={this.props.author} />
          </div>
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

export default TextPost
