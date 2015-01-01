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
var NewsFeedItemBountyReopen = require('./news_feed_item_bounty_reopen.js.jsx');
var NewsFeedItemBountyReviewReady = require('./news_feed_item_bounty_review_ready.js.jsx');
var NewsFeedItemBountyTagChange = require('./news_feed_item_bounty_tag_change.js.jsx');
var NewsFeedItemBountyTimelineItem = require('./news_feed_item_bounty_timeline_item.js.jsx');
var NewsFeedItemBountyTitleChange = require('./news_feed_item_bounty_title_change.js.jsx');
var NewsFeedItemBountyWin = require('./news_feed_item_bounty_win.js.jsx');
var ProductStore = require('../../stores/product_store');
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
    var comments = this.state.comments;

    switch (state) {
      case 'closed':
        var closedEvent = this.renderOptimisticClosedEvent();

        if (!closedEvent) {
          return;
        }

        comments.push(closedEvent);
        break;
      case 'open':
        var reopenedEvent = this.renderOptimisticReopenedEvent();

        if (!reopenedEvent) {
          return;
        }

        comments.push(reopenedEvent);
        break;
      case 'reviewing':
        var reviewReadyEvent = this.renderOptimisticReviewReadyEvent();

        if (!reviewReadyEvent) {
          return;
        }

        comments.push(reviewReadyEvent);
        break;
    }

    this.setState({
      comments: comments
    });
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

    var slug = _reach(this.props, 'item.product.slug') || ProductStore.getSlug();

    var url = Routes.product_update_comments_path({
      product_id: slug,
      update_id: _reach(this.props, 'item.id'),
    });

    return {
      comments: lastComment ? [lastComment] : [],
      events: [],
      numberOfComments: item.comments_count,
      optimisticComments: [],
      showCommentsAfter: showCommentsAfter,
      url: url
    };
  },

  render: function() {
    return (
      <div className="_mq-600_px3 px2">
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
          <hr className="my0 mt3 border-gray-5 _mrn3 _mln3" />
        </div>
      </div>
    );
  },

  renderConfirmedComments: function() {
    var renderIfAfter = this.state.showCommentsAfter;
    var comments = this.state.comments.concat(this.state.events).sort(_sort);
    var awardUrl;

    // Sometimes a type of 'task_decorator' is found; the indexOf() check
    // accounts for that case as well as just plain 'task'.
    if ((_reach(this.props, 'item.target.type') || '').indexOf('task') > -1) {
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

        return parseEvent(comment, awardUrl, editUrl);
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
        <a className="block mt2 fs3 gray-dark clickable"
            onClick={this.triggerModal}>
          <span className="pr2 gray fs5">
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
      if (UserStore.getUser()) {
        return <NewComment
            {...this.props}
            canContainWork={item.target && item.target.type.indexOf('task') > -1}
            url={url}
            thread={item.id}
            user={window.app.currentUser()} />
      }

      return (
        <div className="well centered text-center">
          I'm afraid I can't let you comment. You'll have to
          {' '}<a href="/signup">sign up</a>{' '}
          to do that.
        </div>
      );
    }
  },

  renderOptimisticComments: function() {
    return this.state.optimisticComments.map(function(comment) {
      return (
        <div className="_py1_25" key={comment.id}>
          <Comment author={comment.user} body={marked(comment.body)} optimistic={true} key={comment.id} />
        </div>
      )
    });
  },

  renderOptimisticClosedEvent: function() {
    return this.renderOptimisticEvent('Event::Close');
  },

  renderOptimisticEvent: function(type) {
    var createdAt = new Date(Date.now() + 500);

    // when we get the event back in the confirmation, set the award_url
    // so that the buttons show up
    return {
      type: type,
      actor: UserStore.getUser(),
      // award_url: this.props.url + '/award',
      created_at: createdAt,
      id: createdAt.toISOString()
    }
  },

  renderOptimisticReopenedEvent: function() {
    return this.renderOptimisticEvent('Event::Reopen');
  },

  renderOptimisticReviewReadyEvent: function() {
    return this.renderOptimisticEvent('Event::ReviewReady');
  },

  triggerModal: function(e) {
    e.stopPropagation();

    this.props.triggerModal();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (window.location.hash) {
      if (this.state.comments.length > prevState.comments.length) {
        $(document.body).animate({
          'scrollTop':   $('#' + window.location.hash.substring(1)).offset().top
        }, 500);
      }
    }
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
  case 'Event::Reopen':
    renderedEvent = <NewsFeedItemBountyReopen {...event} />;
    break;
  case 'Event::ReviewReady':
    renderedEvent = <NewsFeedItemBountyReviewReady {...event} />;
    break;
  case 'Event::TagChange':
    // don't render tag change events
    // renderedEvent = <NewsFeedItemBountyTagChange {...event} />;
    // See TODO in NewsFeedItemBountyTagChange
    break;
  case 'Event::TitleChange':
    renderedEvent = <NewsFeedItemBountyTitleChange {...event} />;
    break;
  case 'Event::Unallocation':
    renderedEvent = null
    break;
  case 'Event::Win':
    renderedEvent = <NewsFeedItemBountyWin {...event} />;
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
      <div className="_py1_25" key={event.id}>
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
