/** @jsx React.DOM */

// TODO This could be used for Wip/Task/Bounty comments also (bshyong)

var Avatar = require('../avatar.js.jsx')
var Markdown = require('../markdown.js.jsx')
var Love = require('../love.js.jsx')

module.exports = React.createClass({
  displayName: 'IdeaComment',

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
      <div className="timeline-item">
        <div className="activity">
          <div className="pull-left activity-avatar">
            <Avatar user={author} size={24} />
          </div>
          <div className="activity-body">
            <div className="activity-actions">
              <ul className="list-inline omega">
                <li>
                  <a className="chat-actor" href={author.url}>
                    {author.username}
                  </a>
                </li>
                <li>
                  <Love heartable_id={this.props.id} heartable_type="NewsFeedItemComment" />
                </li>
              </ul>
            </div>
            <div className="activity-content markdown markdown-normalized shrink-images"  dangerouslySetInnerHTML={{__html: body}}>
            </div>
          </div>
        </div>
      </div>
    )
  },

  isOptimistic: function() {
    return !!this.props.optimistic;
  }
})
