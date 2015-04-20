const Avatar = require('../ui/avatar.js.jsx');
var Thumbnail = require('../thumbnail.js.jsx')
var Vignette = require('../ui/vignette.js.jsx')

const Story = React.createClass({

  propTypes: {
    story: React.PropTypes.object.isRequired,
    i: React.PropTypes.number.isRequired,
    product: React.PropTypes.object
  },

  renderLogo: function(logoUrl) {
    var size = 18
    return (
      <Vignette shape="rounded" width={size} height={size}>
        <Thumbnail src={logoUrl} width={size} height={size} />
      </Vignette>
    )
  },

  renderStory: function(story, i) {
    var owner = story.verb == 'awarded' ? story.owner.username : ''
    var recentActor = story.actors[story.actors.length-1]

    var cs = React.addons.classSet({
      'clearfix px2 py2': true,
      'border-top': i > 0
    })

    var productName = this.props.product ? this.props.product.name : ''
    var logo = this.props.product ? this.renderLogo(this.props.product.logo_url) : ''

    return (
      <div className={cs} key={i}>
        <div className="clearfix mb1">
          <div className="left mr2">
            {logo}
          </div>
          {productName}
        </div>
        <a href={story.url}>
          <div className="left mr2 mt1">
            <Avatar user={recentActor} size={18} />
          </div>
          <div className="overflow-hidden">
            <div className="activity-body">
              <p className="gray-2 mb0 h6 right mr2">
                {moment(story.created_at).fromNow()}
              </p>
              <p className="mb0 gray-2">
                <span className="bold">
                  {` ${recentActor.username}`}
                </span>
                <span className="">
                  {story.actors.length > 1 ?
                    ` and ${story.actors.length-1} other${story.actors.length == 2 ? '' : 's'} ` : null}
                </span>
                {' ' + story.verb} <strong>{owner}</strong>
              </p>
              <p className="mb0">
                {story.subject}
              </p>
            </div>
          </div>
        </a>
      </div>
    )
  },

  render: function() {
    return (
      <div>
        {this.renderStory(this.props.story, this.props.i)}
      </div>
    )
  }
})

module.exports = Story;
