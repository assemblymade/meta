/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var NewsFeedMixin = require('../mixins/news_feed.js.jsx');
var NewsFeedStore = require('../stores/news_feed_store');
var Avatar = require('./avatar.js.jsx');

(function() {
  var NF = CONSTANTS.NEWS_FEED;

  var DropdownNewsFeed = React.createClass({
    mixins: [NewsFeedMixin],

    markAllAsRead: function() {
      Dispatcher.dispatch({
        event: NF.EVENTS.READ_ALL,
        action: NF.ACTIONS.MARK_ALL_AS_READ,
        data: null
      });
    },

    render: function() {
      return (
        <ul className="dropdown-menu" style={{ 'max-height': '500px', 'min-width': '380px' }}>
          <li style={{ 'overflow-y': 'scroll' }} ref="spinner">
            {this.state.stories ? this.rows(this.state.stories) : null}
          </li>

          <li className="divider" style={{ 'margin-top': '0px' }} />

          <li>
            <a href={this.props.editUserPath} className="text-small">Settings</a>
          </li>

          <li>
            <a href="#mark-as-read" className="text-small" onClick={this.markAllAsRead}>Mark all as read</a>
          </li>

          <li>
            <a href='/notifications' className="text-small">All Notifications</a>
          </li>

        </ul>
      );
    },

    rows: function(stories) {
      var self = this;

      stories.sort(function(a, b) {
        return (b.updated - a.updated);
      });

      return (
        <div className="list-group" style={{ 'max-height': '300px', 'min-height': '50px' }}>
          { _.map(this.state.stories, function(story) {
            return <Entry key={story.id} story={story} actors={self.state.actors} fullPage={false} />;
          }) }
        </div>
      );
    },

    spinnerOptions: {
      lines: 11,
      top: '20%'
    }
  });

  var Entry = React.createClass({
    actors: function() {
      return _.map(
        this.state.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    body: function() {
      var target = this.state.story.activities[0].target;

      return (
        <span>
          {this.verbMap[this.state.story.verb]}
          <strong>
            {this.subjectMap[this.state.story.subject_type].call(this, target)}
          </strong>
          {this.product()}
        </span>
      );
    },

    componentDidMount: function() {
      if (this.refs.body) {
        this.refs.body.getDOMNode().innerHTML = this.state.story.subject.body_html;
      }
    },

    ellipsis: function(text) {
      if (text && text.length > 40) {
        text = text.substring(0, 40) + '…';
      }

      return text;
    },

    getInitialState: function() {
      return {
        story: this.props.story
      };
    },

    isRead: function() {
      return this.state.story.last_read_at !== 0;
    },

    markAsRead: function() {
      Dispatcher.dispatch({
        event: NF.EVENTS.READ,
        action: NF.ACTIONS.MARK_AS_READ,
        data: this.props.story.id
      });
    },

    markAsReadButton: function() {
      if (!this.isRead()) {
        return <span className="icon icon-disc pull-right" onClick={this.markAsRead} title={'Mark as read'} style={{ cursor: 'pointer' }} />;
      }

      // TODO: Mark as unread
      return <span className="icon icon-circle pull-right" style={{ cursor: 'pointer' }} />
    },

    preview: function() {
      var body_preview = this.state.story.body_preview;

      return (
        <p className='text-muted' style={{ 'text-overflow': 'ellipsis' }}>
          {this.ellipsis(body_preview)}
        </p>
      );
    },

    product: function() {
      var product = this.state.story.product;

      return ' in ' + product.name;
    },

    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead()
      });

      return (
        <a className={'list-group-item ' + classes}
            href={this.state.story.url}
            style={{ 'font-size': '14px' }}
            onClick={this.state.story.last_read_at ? null : this.markAsRead}>

          <div className="row">
            <div className="col-md-1">
              <Avatar user={this.actors()[0]} size={18} />&nbsp;
            </div>

            <div className="col-md-10">
              <strong>{actors}</strong> {this.body()}
              {this.preview()}
            </div>

            <div className="col-md-1">
              {this.markAsReadButton()}
            </div>
          </div>
        </a>
      );
    },

    subjectMap: {
      Task: function(task) {
        return "#" + task.number;
      },

      Discussion: function(discussion) {
        return 'discussion'
      },

      Wip: function(bounty) {
        if (this.props.fullPage) {
          return "#" + bounty.number + " " + bounty.title
        }

        return "#" + bounty.number;
      },
    },

    timestamp: function() {
      return moment(this.state.story.created).format("ddd, hA")
    },

    verbMap: {
      'Comment': 'commented on ',
      'Award': 'awarded ',
      'Close': 'closed '
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DropdownNewsFeed;
  }

  window.DropdownNewsFeed = DropdownNewsFeed;
})();
