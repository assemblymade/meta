// TODO This lib is in application.js (chrislloyd)
// var marked = require('marked')

var CONSTANTS = window.CONSTANTS.NEWS_FEED_ITEM;
var ActivityFeedComment = require('../activity_feed_comment.js.jsx');
var BountyStore = require('../../stores/bounty_store');
var Comment = require('../comment.js.jsx');
var DiscussionActionCreators = require('../../actions/discussion_action_creators');
var DiscussionStore = require('../../stores/discussion_store');
var Dispatcher = window.Dispatcher;
var Icon = require('../icon.js.jsx');
var NewComment = require('./new_comment.js.jsx');
var NewsFeedItemBountyClose = require('./news_feed_item_bounty_close.js.jsx');
var NewsFeedItemBountyCommentReference = require('./news_feed_item_bounty_comment_reference.js.jsx');
var NewsFeedItemBountyReviewReady = require('./news_feed_item_bounty_review_ready.js.jsx');
var NewsFeedItemBountyTagChange = require('./news_feed_item_bounty_tag_change.js.jsx');
var NewsFeedItemBountyTimelineItem = require('./news_feed_item_bounty_timeline_item.js.jsx');
var NewsFeedItemBountyTitleChange = require('./news_feed_item_bounty_title_change.js.jsx');
var NewsFeedItemBountyWin = require('./news_feed_item_bounty_win.js.jsx');
var ReadReceipts = require('../read_receipts.js.jsx');
var Routes = require('../../routes');
var Spinner = require('../spinner.js.jsx');
var UserStore = require('../../stores/user_store');

var NewsFeedItemComments = React.createClass({
  displayName: 'NewsFeedItemComments',

  propTypes: {
    commentable: React.PropTypes.bool,
    item: React.PropTypes.object.isRequired,
    showAllComments: React.PropTypes.bool
  },

  componentDidMount: function() {
    if (this.props.showAllComments) {
      this.fetchCommentsFromServer({ stopPropagation: function() {} });
    }

    if (_reach(this.props, 'item.target.type') === 'task') {
      BountyStore.addChangeListener(this.getBountyState);
    }

    DiscussionStore.addChangeListener(this.getDiscussionState);
  },

  componentWillUnmount: function() {
    if (_reach(this.props, 'item.target.type') === 'task') {
      BountyStore.removeChangeListener(this.getBountyState);
    }

    DiscussionStore.removeChangeListener(this.getDiscussionState);
  },

  fetchCommentsFromServer: function(e) {
    e.stopPropagation();

    this.setState({ loading: true });

    DiscussionActionCreators.fetchCommentsFromServer(
      this.state.url,
      this.props.item.id
    );
  },

  getBountyState: function() {
    var state = BountyStore.getState();

    if (state === 'reviewing') {
      var comments = this.state.comments;

      comments.push(this.renderOptimisticReviewReady());

      this.setState({
        comments: comments
      });
    }
  },

  getDiscussionState: function(e) {
    var itemId = this.props.item.id;
    var comments = DiscussionStore.getComments(itemId);
    var events = DiscussionStore.getEvents(itemId);

    // FIXME: When `last_comment` is no longer serialized on each item
    // but set in the store, remove this check
    if (!this.props.showAllComments) {
      return;
    }

    this.setState({
      comment: '',
      comments: comments.confirmed,
      events: events,
      loading: false,
      numberOfComments: this.state.numberOfComments + comments.confirmed.length,
      optimisticComments: comments.optimistic
    });
  },

  getDefaultProps: function() {
    return {
      commentable: false
    };
  },

  getInitialState: function() {
    var item = this.props.item;
    var showAllComments = this.props.showAllComments;
    var lastComment = item.last_comment;

    var showCommentsAfter;
    if (!showAllComments) {
      showCommentsAfter = +(lastComment ? new Date(lastComment.created_at) : Date.now());
    } else {
      showCommentsAfter = 0;
    }

    return {
      comments: lastComment ? [lastComment] : [],
      events: [],
      numberOfComments: item.comments_count,
      optimisticComments: [],
      showCommentsAfter: showCommentsAfter,
      url: item.url + '/comments'
    };
  },

  render: function() {
    return (
      <div className="px3">
        {this.renderComments()}
        {this.renderNewCommentForm()}
      </div>
    );
  },

  renderComments: function() {
    if (this.state.loading) {
      return <Spinner />;
    }

    var confirmedComments = this.renderConfirmedComments();
    var optimisticComments = this.renderOptimisticComments();
    var comments = confirmedComments.concat(optimisticComments);

    if (!comments.length && this.props.showAllComments) {
      return <div className="py2" />;
    }

    var classes = React.addons.classSet({
      timeline: this.props.showAllComments
    });

    return (
      <div>
        {this.renderLoadMoreButton()}
        <div className={classes}>
          {confirmedComments}
          {optimisticComments}
        </div>
      </div>
    );
  },

  renderConfirmedComments: function() {
    var renderIfAfter = this.state.showCommentsAfter;
    var comments = this.state.comments.concat(this.state.events).sort(_sort);
    var awardUrl;
    if (_reach(this.props, 'item.target.type') === 'task') {
      awardUrl = _reach(this.props, 'item.target.url') + '/award';
    }

    var self = this;

    return comments.map(function(comment, i) {
      if (!self.props.showAllComments) {
        if (comment.type !== 'news_feed_item_comment') {
          return null;
        } else {
          return <ActivityFeedComment
              author={comment.user}
              body={comment.markdown_body}
              heartable={true}
              heartableId={comment.id} />
        }
      }

      if (new Date(comment.created_at) >= renderIfAfter) {
        var editUrl = Routes.product_update_comment_path({
          product_id: _reach(self.props, 'item.product.id'),
          update_id: _reach(self.props, 'item.id'),
          id: comment.id
        });

        var renderedEvent = parseEvent(comment, awardUrl, editUrl);

        if (i + 1 === comments.length) {
          var timestamp = (
            <div className="timeline-insert js-timestamp clearfix" key={'timestamp-' + comment.id}>
              <time className="timestamp left" dateTime={comment.timestamp}>{moment(comment.created_at).fromNow()}</time>
              <ReadReceipts url={'/_rr/articles/' + comment.id} track_url={comment.readraptor_track_id} />
            </div>
          );

          return [
            timestamp,
            renderedEvent
          ];
        }

        return renderedEvent;
      }
    });
  },

  renderLoadMoreButton: function() {
    if (this.props.showAllComments) {
      return;
    }

    var numberOfComments = this.state.numberOfComments;
    var target = this.props.item.target;

    if (numberOfComments > this.state.comments.length) {
      return (
        <a className="block text-small mt2 gray-dark clickable"
            onClick={this.triggerModal}
            style={{textDecoration: 'underline'}}>
          <span className="mr1">
            <Icon icon="comment" />
          </span>
          View all {numberOfComments} comments
        </a>
      );
    }
  },

  renderNewCommentForm: function() {
    var item = this.props.item;

    if (this.props.commentable) {
      var url = this.state.url;

      if (window.app.currentUser()) {
        return <NewComment
            {...this.props}
            canContainWork={item.target && item.target.type === 'task'}
            url={url}
            thread={item.id}
            user={window.app.currentUser()} />
      }
    }
  },

  renderOptimisticComments: function() {
    return this.state.optimisticComments.map(function(comment) {
      return (
        <div className="py2" key={comment.id}>
          <Comment author={comment.user} body={marked(comment.body)} optimistic={true} key={comment.id} />
        </div>
      )
    });
  },

  renderOptimisticReviewReady: function() {
    // when we get the event back in the confirmation, set the award_url
    // so that the buttons show up
    if (UserStore.isCoreTeam()) {
      return {
        type: 'Event::ReviewReady',
        actor: UserStore.getUser(),
        // award_url: this.props.url + '/award',
        created_at: new Date(),
        id: 'FIXME'
      };
    }
  },

  triggerModal: function(e) {
    e.stopPropagation();

    this.props.triggerModal();
  }
});

if (typeof module !== 'undefined') {
  module.exports = NewsFeedItemComments;
}

window.NewsFeedItemComments = module.exports;

function parseEvent(event, awardUrl, editUrl) {
  var renderedEvent;

  switch(event.type) {
  case 'Event::Allocation':
    renderedEvent = null;
    break;
  case 'Event::Close':
    renderedEvent = <NewsFeedItemBountyClose {...event} />;
    break;
  case 'Event::CommentReference':
    renderedEvent = <NewsFeedItemBountyCommentReference {...event} />;
    break;
  case 'Event::ReviewReady':
    renderedEvent = <NewsFeedItemBountyReviewReady {...event} />;
    break;
  case 'Event::Win':
    renderedEvent = <NewsFeedItemBountyWin {...event} />;
    break;
  case 'Event::TagChange':
    // don't render tag change events
    // renderedEvent = <NewsFeedItemBountyTagChange {...event} />;
    // See TODO in NewsFeedItemBountyTagChange
    break;
  case 'Event::TitleChange':
    renderedEvent = <NewsFeedItemBountyTitleChange {...event} />;
    break;
  case 'news_feed_item_comment':
    renderedEvent = <Comment
        {...event}
        author={event.user}
        awardUrl={awardUrl}
        body={event.markdown_body}
        editUrl={editUrl}
        rawBody={event.body}
        timestamp={event.created_at}
        heartable={true} />;
    break;
  default:
    if (!event.actor) {
      break;
    }

    renderedEvent = <NewsFeedItemBountyTimelineItem {...event} />;
    break;
  }

  if (renderedEvent) {
    return (
      <div className="py2" key={event.id}>
        {renderedEvent}
      </div>
    );
  }
}

function _reach(obj, prop) {
  var props = prop.split('.');

  while (props.length) {
    var p = props.shift();

    if (obj && obj.hasOwnProperty(p)) {
      obj = obj[p]
    } else {
      obj = undefined;
      break;
    }
  }

  return obj;
}

function _sort(a, b) {
  var aDate = +new Date(a.created_at);
  var bDate = +new Date(b.created_at);

  return aDate > bDate ? 1 : bDate > aDate ? -1 : 0;
}
