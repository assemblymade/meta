/** @jsx React.DOM */

(function() {

window.ActivityFeed = React.createClass({
  getInitialState: function() {
    return { activities: this.props.activities }
  },

  render: function() {
    return <div>{_.map(this.state.activities, Entry)}</div>
  }
})

var Entry = React.createClass({
  render: function() {
    return <div className="row">@{this.props.actor.username} {this.props.verb} {this.body()}</div>
  },

  body: function() {
    if (this.props.subject.body_html) {
      return <div className="markdown-normalized" ref="body"></div>
    } else if (this.props.subject.attachment) {
      var href = this.props.subject.attachment.href
      var src = this.props.subject.attachment.firesize_url + '/300x225/frame_0/g_center/' + href
      return (
        <a href={href}>
          <img className="gallery-thumb" src={src} />
        </a>
      )
    }
  },

  componentDidMount: function() {
    if (this.refs.body) {
      this.refs.body.getDOMNode().innerHTML = this.props.subject.body_html
    }
  }
})

})()