/** @jsx React.DOM */

/* displays a stream of activities as a discussion */

(function() {

window.Discussion = React.createClass({
  getInitialState: function() {
    return { activities: this.props.activities }
  },

  render: function() {
    var rows = _.map(this.state.activities, function(e) {
      var component = _components[e.type]
      if (component) {
        console.log('render', e)
        return component(e)
      } else {
        console.log('ignore', e)
        return null
      }
    })

    return <div className="timeline omega">{rows}</div>
  }
})

/* TODO: (whatupdave) move comment to using the MediaItem */
var Comment = React.createClass({
  componentDidMount: function() {
    this.refs.body.getDOMNode().innerHTML = this.props.subject.body_html
  },

  render: function() {
    return (
      <div className="timeline-item">
        <div className="activity" id={this.props.subject.anchor} data-readraptor-track={this.props.subject.readraptor_track_id}>

          <div className="pull-left activity-avatar">
            <AvatarLink user={this.props.actor} size={30} />
          </div>

          <div className="activity-body">
            <div className="activity-actions">
              {ActivityMenu(this.props)}
              <ul className="list-inline omega">
                <li>
                  <a href={this.props.actor.url} title={'@' + this.props.actor.username} className="chat-actor">{this.props.actor.username}</a>
                </li>

                <li>
                  <TipsUI viaType="Activity" viaId={this.props.id} recipient={this.props.actor} tips={this.props.tips} />
                </li>
              </ul>
            </div>
          </div>

          <div className="activity-content markdown-normalized" style={{padding: 0}} ref="body">
          </div>
        </div>
      </div>
    )
  }
})

var ActivityMenu = React.createClass({
  render: function() {
    return (
      <ul className="list-inline pull-right omega">
        <li>
          <div className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown">
              <span className="icon icon-ellipsis" style={{"font-size": "18px"}}></span>
            </a>
            <ul className="dropdown-menu pull-right text-small">
              {this.props.canAward ? this.awardButton() : null}
              {this.props.canEdit ? this.editButton() : null}

              <li>
                <a href={"#" + this.props.subject.anchor}>
                  <span className="icon-link dropdown-glyph"></span>
                  Permalink
                </a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    )
  },

  awardButton: function() {
    <li>
      <a className="event-award" onClick={this.handleAward} href="javascript:;">
        <span className="icon-star dropdown-glyph"></span>
        Award bounty to @{this.props.actor.username}
      </a>
    </li>
  },

  editButton: function() {
    <li>
      <a href={this.editUrl()}>
        <span className="icon-pencil dropdown-glyph"></span>
        Edit comment
      </a>
    </li>
  },

  handleAward: function() {
    if (confirm("Are you sure you want to award this task to @"+ this.props.actor.username + "?")) {
      $.ajax({
        type: 'PATCH',
        dataType: 'json',
        url: this.awardUrl(),
        complete: function() {
          window.location.reload()
        }
      })
    }
  },

  awardUrl: function() {
    return app.wip.get('url') + '/award?event_id=' + this.props.subject.id
  },

  editUrl: function() {
    return app.wip.get('url') + '/comments/' + this.props.subject.number + '/edit'
  }
})

var Post = React.createClass({
  render: function() {
    var icon = _postIcons[this.props.subject.type]
    return (
      <MediaItem id={this.props.subject.anchor} color={icon[0]} icon={icon[1]}>
        <div className="media-heading omega">
          <a href={this.props.actor.url}>@{this.props.actor.username}</a>
          {this.subjectComponent()}
        </div>
        {this.body()}
      </MediaItem>
    )
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

  subjectComponent: function() {
    var component = _postSubjects[this.props.subject.type]
    return component(this.props.subject)
  },

  componentDidMount: function() {
    if (this.refs.body) {
      this.refs.body.getDOMNode().innerHTML = this.props.subject.body_html
    }
  }
})

var MediaItem = React.createClass({
  render: function() {
    return (
      <div className="timeline-item">
        <div className="media" id={this.props.id}>

          <div className="pull-left">
            <div className={"marker marker-" + this.props.color}>
              <span className={"icon icon-" + this.props.icon}></span>
            </div>
          </div>

          <div className="media-body">
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
})

var CloseSubject = React.createClass({
  render: function() {
    return <span> closed this</span>
  }
})

var ReopenSubject = React.createClass({
  render: function() {
    return <span> re-opened this</span>
  }
})

var ReviewReady = React.createClass({
  render: function() {
    return <span> submitted work for review</span>
  }
})

var CodeAdded = React.createClass({
  render: function() {
    return <span> added a <a href={this.props.deliverable.url}>pull request</a></span>
  }
})

var Reference = React.createClass({
  render: function(){
    return <span> mentioned this in {this.props.target_type} <a href={this.props.target_url}>{this.props.target_title}</a></span>
  }
})

var TitleChange = React.createClass({
  render: function(){
    return <span> renamed this from {this.props.body}</span>
  }
})

var DesignDeliverable = React.createClass({
  render: function(){
    return <span> added a design</span>
  }
})

var _components = {
  "activities/close": Post,
  "activities/comment": Comment,
  "activities/open": Post,
  "activities/post": Post,
  "activities/reference": Post
}

var _postSubjects = {
  "event/code_added": CodeAdded,
  "event/close": CloseSubject,
  "event/comment_reference": Reference,
  "event/commit_reference": Reference,
  "event/design_deliverable": DesignDeliverable,
  "event/reopen": ReopenSubject,
  "event/review_ready": ReviewReady,
  "event/title_change": TitleChange
}

var _postIcons = {
  "event/code_added":         ['blue', 'pull-request'],
  "event/comment_reference":  ['blue', 'arrow-right'],
  "event/commit_reference":   ['blue', 'arrow-right'],
  "event/close":              ['gray', 'disc'],
  "event/design_deliverable": ['blue', 'document'],
  "event/reopen":             ['green', 'disc'],
  "event/review_ready":       ['blue', 'document'],
  "event/title_change":       ['yellow', 'pencil']
}

})()