/** @jsx React.DOM */

(function() {

  window.NewsFeed = React.createClass({
  getInitialState: function() {
    return { stories: this.props.stories }
  },

  render: function() {
    var rows = _.map(this.state.stories, function(story){
      return <Entry story={story} actors={this.props.actors} />
    }.bind(this))
    return <div>{rows}</div>
  }
})

var Entry = React.createClass({
  render: function() {
    console.log(this.props)
    var actors = _.map(this.actors(), func.dot('username')).join(' ,')
    return <div className="row">@{actors} {this.body()}</div>
  },

  body: function() {
    return this.props.story.verb + ' on a ' + this.props.story.subject_type

    // if (this.props.activity.subject.body_html) {
    //   return <div className="markdown-normalized" ref="body"></div>
    // } else if (this.props.activity.subject.attachment) {
    //   var href = this.props.activity.subject.attachment.href
    //   var src = this.props.activity.subject.attachment.firesize_url + '/300x225/frame_0/g_center/' + href
    //   return (
    //     <a href={href}>
    //       <img className="gallery-thumb" src={src} />
    //     </a>
    //   )
    // }
  },

  actors: function() {
    return _.map(this.props.story.actor_ids, function(actorId){ return this.props.actors[actorId] }.bind(this))
  },

  componentDidMount: function() {
    if (this.refs.body) {
      this.refs.body.getDOMNode().innerHTML = this.props.story.subject.body_html
    }
  }
})

})()