/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var NewsFeedMixin = require('../mixins/news_feed.js.jsx');
var NewsFeedStore = require('../stores/news_feed_store');
var Avatar = require('./avatar.js.jsx');

(function() {
  var NF = CONSTANTS.NEWS_FEED;

  var FullPageNewsFeed = React.createClass({
    mixins: [NewsFeedMixin],

    moreButton: function() {
      if (this.state.showMore) {
        return <a href="#more" className="btn btn-block" onClick={this.moreStories}>More</a>;
      }

      return null;
    },

    render: function() {
      return (
        <div className="sheet" style={{ 'min-height': '600px' }}>
          <div className="page-header sheet-header" style={{ 'padding-left': '20px' }}>
            <h2 className="page-header-title">Your notifications</h2>
          </div>

          <div className="list-group list-group-breakout" ref="spinner">
            {this.state.stories ? this.rows(this.state.stories) : null}
          </div>

          {this.moreButton()}
        </div>
      );
    },

    rows: function(stories) {
      var self = this;

      var entries = _.map(stories, function(story) {
        return <Entry key={story.id + 'f'} story={story} actors={self.state.actors} />;
      });

      return (
        <div className="list-group-item" style={{ 'padding-top': '0px', 'padding-bottom': '0px' }}>
          {entries}
        </div>
      );
    }
  });

  var Entry = React.createClass({
    actors: function() {
      return _.map(
        this.props.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    body: function() {
      var target = this.props.story.activities[0].target;

      return (
        <span>
          {this.verbMap[this.props.story.verb]}
          <strong>
            {this.subjectMap[this.props.story.subject_type].call(this, target)}
          </strong>
        </span>
      );
    },

    isRead: function() {
      return this.props.story.last_read_at !== 0;
    },

    markAsRead: function() {
      Dispatcher.dispatch({
        event: NF.EVENTS.READ,
        action: NF.ACTIONS.MARK_AS_READ,
        data: this.props.story.key
      });
    },

    markAsReadButton: function() {
      if (!this.isRead()) {
        return <span className="icon icon-disc" onClick={this.markAsRead} title={'Mark as read'} style={{ cursor: 'pointer' }} />;
      }

      // TODO: Mark as unread
      return <span className="icon icon-circle" style={{ cursor: 'pointer' }} />;
    },

    preview: function() {
      var bodyPreview = this.props.story.body_preview;

      return (
        <p className='text-muted' style={{ 'text-overflow': 'ellipsis' }}>
          {bodyPreview}
        </p>
      );
    },

    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead(),
      });

      var productName = this.props.story.product.name;

      return (
        <div className={classes + ' row'}>
          <div className='col-md-3'>
            <a href={'/' + this.props.story.product.slug}>{productName}</a>
            <br />
            <span className='text-muted text-small'>
              {this.timestamp()}
            </span>
          </div>

          <div className='col-md-8'>
            <a className={classes} href={this.props.story.url} onClick={this.markAsRead}>
              <span style={{ 'margin-right': '5px' }}>
                <Avatar user={this.actors()[0]} />
              </span>
              <strong>{actors}</strong> {this.body()}
            </a>
            <span className='text-small text-muted'>
              {this.preview()}
            </span>
          </div>

          <div className={'col-md-1 ' + classes}>
            {this.markAsReadButton()}
          </div>
        </div>
      );
    },

    timestamp: function() {
      return moment(this.props.story.created).format("ddd, hA")
    },

    subjectMap: {
      Task: function(task) {
        return "#" + task.number + " " + task.title;
      },

      Discussion: function(discussion) {
        return 'a discussion';
      },

      Wip: function(bounty) {
        if (this.props.fullPage) {
          return "#" + bounty.number + " " + bounty.title;
        }

        return "#" + bounty.number;
      },
    },

    verbMap: {
      'Comment': 'commented on ',
      'Award': 'awarded',
      'Close': 'closed '
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = FullPageNewsFeed;
  }

  window.FullPageNewsFeed = FullPageNewsFeed;
})();
