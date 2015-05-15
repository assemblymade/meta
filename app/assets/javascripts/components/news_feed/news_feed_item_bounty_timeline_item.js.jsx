var Avatar = require('../ui/avatar.js.jsx');
var Heart = require('../heart.js.jsx');

module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyTimelineItem',
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    anchor: React.PropTypes.string.isRequired,
    award_url: React.PropTypes.string,
    body_html: React.PropTypes.string.isRequired,
    edit_url: React.PropTypes.string.isRequired,
    id: React.PropTypes.string.isRequired,
    readraptor_track_id: React.PropTypes.string.isRequired,
  },

  addTipsToWipEvents: function() {
    return;
    var comments = app.wipEvents.filter(function(e) { return e.get('type') == 'Event::Comment' })

    _.each(comments, function(e){
      $('.js-insert-tips', $('#' + e.get('anchor'))).each(function() {
        React.render(TipsUi({
          viaType: 'Event',
          viaId: e.id,
          recipient: e.get('actor'),
          tips: e.get('tips')
        }), this)
      })
    })
  },

  componentDidMount: function() {
    this.addTipsToWipEvents();
  },

  render: function() {
    var actor = this.props.actor;
    var anchor = this.props.anchor;
    var bodyHtml = this.props.body_html;
    var editUrl = this.props.edit_url;
    var id = this.props.id;
    var readraptorTrackId = this.props.readraptor_track_id;

    if (!actor) {
      return <span />;
    }

    return (
      <div className="timeline-item" id={this.props.id}>
        <div className="activity" id={anchor} data-readraptor-track={readraptorTrackId} key={id}>
          <div className="pull-left activity-avatar">
            <a href={actor.url} title={'@' + actor.username}>
              <img className="media-object img-circle" src={actor.avatar_url} alt={"@" + actor.username} width="30" height="30" />
            </a>
          </div>

          <div className="activity-body" key={'activity-body-' + id}>

            <div className="activity-actions">

              <ul className="list-inline pull-right mb0">
                <li>
                  <div className="dropdown">
                    <a href="#" className="dropdown-toggle" id={"dropdown-" + id} data-toggle="dropdown">
                      <i className="icon icon-ellipsis" style={{ fontSize: "18px" }}></i>
                    </a>
                    <ul className="dropdown-menu pull-right text-small" role="menu" aria-labelledby={"dropdown-" + id}>

                      {this.renderAwardOption()}

                      <li>
                        <a href={editUrl} role="menuitem">
                          <i className="icon icon-pencil dropdown-glyph"></i>
                          Edit comment
                        </a>
                      </li>

                      <li>
                        <a href={'#' + anchor} role="menuitem">
                          <i className="icon icon-link dropdown-glyph"></i>
                          Permalink
                        </a>
                      </li>

                    </ul>

                  </div>
                </li>
              </ul>

              <ul className="list-reset clearfix mb0" key={'list-inline-' + id}>
                <li className="left mr1">
                  <a href={actor.url} title={'@' + actor.username} className="chat-actor">
                    {actor.username}
                  </a>
                </li>

                <li className="left mr1 js-insert-tips">
                </li>

                <li className="left mr1">
                  <Heart size="small" heartable_type='NewsFeedItemComment' heartable_id={this.props.news_feed_item_comment_id} />
                </li>
              </ul>

            </div>

            <div className="activity-content markdown markdown-normalized shrink-images"
                dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          </div>

        </div>
        <img className="hidden" src={readraptorTrackId} width="0" height="0" key={'rr-image-' + id} />
      </div>
    );
  },

  renderAwardOption: function() {
    var awardUrl = this.props.award_url;

    if (awardUrl) {
      var actor = this.props.actor;
      var id = this.props.id;

      return [
        <li>
          <a className="event-award" href={awardUrl + '?event_id=' + id} data-method="patch" data-confirm={"Are you sure you want to award this task to " + actor.username + "?"}>
            <i className="glyphicon glyphicon-star-empty dropdown-glyph"></i>
            Award bounty to {actor.username} and keep it open
          </a>
        </li>,

        <li>
          <a className="event-award" href={awardUrl + '?event_id=' + id + '&close=true'} data-method="patch" data-confirm={"Are you sure you want to award this task to " + actor.username + "?"}>
            <i className="glyphicon glyphicon-star dropdown-glyph"></i>
            Award bounty to {actor.username} and close it
          </a>
        </li>
      ];
    }
  }
});
