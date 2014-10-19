/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var EventMixin = require('../mixins/event.js.jsx');
var NotificationsMixin = require('../mixins/notifications.js.jsx');
var NotificationsStore = require('../stores/notifications_store');
var Avatar = require('./avatar.js.jsx');

(function() {
  var NF = CONSTANTS.NOTIFICATIONS;

  var FullPageNotifications = React.createClass({
    mixins: [NotificationsMixin],

    getDefaultProps: function() {
      return {
        fullPage: true
      };
    },

    moreButton: function() {
      if (this.state.stories && this.state.showMore) {
        return <a href="#more" className="btn btn-block" onClick={this.moreStories}>More</a>;
      }

      return null;
    },

    render: function() {
      return (
        <div>
          <div className="list-group list-group-breakout" ref="spinner">
            {this.renderStories()}
          </div>

          {this.moreButton()}
        </div>
      );
    },

    renderStories: function() {
      if (!this.state.stories) {
        return null;
      }

      if (this.state.stories.length > 0) {
        return this.rows(this.state.stories);
      } else {
        this.getStories = function() {};

        return this.emptyRow();
      }
    },

    rows: function(stories) {
      var self = this;

      return _.map(stories, function(story) {
        return <Entry key={story.id + 'f'} story={story} actors={self.state.actors} digest={self.props.digest} />;
      });
    },

    emptyRow: function() {
      if (this.props.digest) {
        return (
          <div className="row">
            <div className="col-md-8 col-md-offset-2 col-xs-10 col-xs-1">
              <div className="well well-lg omega">
                <h3 className="alpha">
                  <strong>Get notified about products you follow</strong>
                </h3>

                <p className="text-muted omega">
                  Looks like you don't have any notifications yet. Get involved
                  with the rest of our community. Follow some products,
                  start a discussion, leave a comment or submit some work.
                  You'll be notified next time someone responds.
                </p>

                <div className="text-center">
                  <a className="btn btn-primary text-center" href="/discover" style={{ 'margin-top': 12 }}>
                    Find products to follow
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="list-group-item">
          <div className="list-group-item-heading">
            Get notified about products you follow
          </div>

          <div className='list-group-item-text'>
            <p className="text-muted omega">
              Looks like you don't have any notifications yet. Get involved
              with the rest of our community. Follow some products,
              start a discussion, leave a comment or submit some work.
              You'll be notified next time someone responds.
            </p>

            <div className="text-center">
              <a className="btn btn-primary text-center" href="/discover" style={{ 'margin-top': 12 }}>
                Find products to follow
              </a>
            </div>
          </div>
        </div>
      );
    }
  });

  var Entry = React.createClass({
    mixins: [EventMixin],

    actors: function() {
      return _.map(
        this.props.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    body: function() {
      var story = this.props.story;
      var task = story.verb === 'Start' ? story.subjects[0] : story.target;

      return (
        <span>
          {this.verbMap[story.verb]}
          <strong>
            {this.subjectMap[story.subject_type].call(this, task)}
          </strong>
        </span>
      );
    },

    isRead: function() {
      return this.props.story.last_read_at !== 0;
    },

    markAsRead: function() {
      Dispatcher.dispatch({
        action: NF.ACTIONS.MARK_AS_READ,
        data: this.props.story.key
      });
    },

    markAsReadButton: function() {
      if (this.props.digest) {
        return;
      }

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
        'entry-read': !this.props.digest && this.isRead(),
        'entry-unread': !this.props.digest && !this.isRead(),
      });

      var productName = this.props.story.product_name;

      return (
        <div className={classes + ' list-group-item'}>
          <div className='list-group-item-heading'>
            <div className='row'>
              <div className='col-sm-11 col-sm-offset-1 col-xs-10 col-xs-offset-2'>
                <div className='pull-right'>
                  {this.markAsReadButton()}
                </div>

                <a href={'/' + this.props.story.product_slug}>
                  {productName}
                </a>

                &nbsp;

                <span className='text-muted text-small'>
                  {this.timestamp()}
                </span>
              </div>
            </div>
          </div>

          <div className='list-group-item-text'>
            <div className='row'>
              <div className='col-sm-1 col-xs-2'>
                <Avatar user={this.actors()[0]} />
              </div>

              <div className='col-sm-11 col-xs-10'>
                <a href={this.props.story.url} onClick={this.markAsRead} style={{ 'display': 'block', 'padding-bottom': '5px' }}>
                  <strong>{actors}</strong> {this.body()}
                </a>

                <span className='text-small text-muted'>
                  {this.preview()}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = FullPageNotifications;
  }

  window.FullPageNotifications = FullPageNotifications;
})();
