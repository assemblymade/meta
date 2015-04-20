// TODO This lib is in application.js (chrislloyd)
// var marked = require('marked')

var ActivityFeedComment = require('../activity_feed_comment.js.jsx');
var BountyStore = require('../../stores/bounty_store');
var Comment = require('../comment.js.jsx');
var DiscussionActions = require('../../actions/discussion_action_creators');
var DiscussionStore = require('../../stores/discussion_store');
var Drawer = require('../ui/drawer.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var IdeaSharePanel = require('../ideas/idea_share_panel.js.jsx');
var NewComment = require('./new_comment.js.jsx');
var NewCommentActionCreators = require('../../actions/new_comment_action_creators');
var NewsFeedItemEvent = require('./news_feed_item_event.js.jsx');
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
var SvgIcon = require('../ui/svg_icon.js.jsx');
var Timeline = require('../ui/timeline.js.jsx')
var UserStore = require('../../stores/user_store');

var NewsFeedItemComments = React.createClass({
  propTypes: {
    commentable: React.PropTypes.bool,
    item: React.PropTypes.object.isRequired,
    showAllComments: React.PropTypes.bool,
    showQuestionButtons: React.PropTypes.bool
  },

  componentDidMount: function() {
    if (_reach(this.props, 'item.target.type') === 'task') {
      BountyStore.addChangeListener(this.getBountyState);
    }

    DiscussionStore.addChangeListener(this.getDiscussionState);
    console.log('props', this.props.item)
    console.log('subscribing', this.props.item.id)
    DiscussionActions.discussionSelected(this.props.item.id)
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (this.props.item.id != prevProps.item.id) {
      debugger
    }

    if (window.location.hash) {
      if (this.state.comments.length > prevState.comments.length) {
        $(document.body).animate({
          'scrollTop':   ($('#' + window.location.hash.substring(1)).offset() || {}).top
        }, 500);
      }
    }
  },

  componentWillUnmount: function() {
    if (_reach(this.props, 'item.target.type') === 'task') {
      BountyStore.removeChangeListener(this.getBountyState);
    }

    DiscussionStore.removeChangeListener(this.getDiscussionState);
    console.log('unsubscribing', this.props.item.id)
    DiscussionActions.discussionClosed(this.props.item.id)
  },

  fetchCommentsFromServer: function(e) {
    e && e.stopPropagation();

    if (this.isMounted()) {
      this.setState({ loading: true });
    }

    DiscussionActions.fetchCommentsFromServer(
      this.props.item.id
    );
  },

  getBountyState: function() {
    var state = BountyStore.getState();
    var comments = this.state.comments;

    // FIXME: (pletcher) We should probably not mutate the instance of
    // NFIComments' state. Instead, we should request the new comments from the
    // server and render them.
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

  getDefaultProps: function() {
    return {
      commentable: false,
      showQuestionButtons: false
    };
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

    // FIXME (pletcher): comments are taking too long to render, which makes for
    // a weird 1-second-ish jump between when the spinner stops and when
    // comments appear
    this.setState({
      comment: '',
      comments: comments.confirmed,
      events: events,
      loading: false,
      numberOfComments: this.state.numberOfComments + comments.confirmed.length,
      optimisticComments: comments.optimistic
    });
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
      comments: showAllComments ? [] : (lastComment ? [lastComment] : []),
      events: [],
      numberOfComments: item.comments_count,
      optimisticComments: [],
      showCommentsAfter: showCommentsAfter,
      showSharePanel: false,
      url: Routes.discussion_comments_path({discussion_id: this.props.item.id})
    };
  },

  handleAnswerQuestionClick: function(username, e) {
    e.stopPropagation();

    var $commentBox = $(this.refs['new-comment'].getDOMNode());

    $('html, body').animate({
      scrollTop: $commentBox.offset().top
    }, 'fast');

    $('#event_comment_body').focus();

    var item = this.props.item;
    var thread = item.id;
    var text = '@' + username + ', ';

    NewCommentActionCreators.updateComment(thread, text);
  },

  handleShareQuestionClick: function(e) {
    e.stopPropagation();

    this.setState({
      showSharePanel: !this.state.showSharePanel
    });
  },

  render: function() {
    console.log('render props', this.props.item)

    return (
      <div>
        {this.renderComments()}
        <div className="py3 border-top">
          {this.renderNewCommentForm()}
        </div>
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

    return (
      <div>
        {this.renderLoadMoreButton()}
        <Timeline>
          {confirmedComments}
          {optimisticComments}
        </Timeline>
      </div>
    );
  },

  renderConfirmedComments: function() {
    var showAllComments = this.props.showAllComments;
    var renderIfAfter = this.state.showCommentsAfter;
    var comments = this.state.comments.concat(this.state.events).sort(_sort);
    var awardUrl;

    // Sometimes a type of 'task_decorator' is found; the indexOf() check
    // accounts for that case as well as just plain 'task'.
    if ((_reach(this.props, 'item.target.type') || '').indexOf('task') > -1) {
      awardUrl = _reach(this.props, 'item.target.url') + '/award';
    }

    var self = this;
    var renderedComments = comments.map(function(comment, i) {
      if (!showAllComments) {
        if (comment.type !== 'news_feed_item_comment') {
          return null;
        }

        return <ActivityFeedComment
            author={comment.user}
            body={comment.markdown_body}
            heartable={true}
            heartableId={comment.id} />
      }

      if (new Date(comment.created_at) >= renderIfAfter) {
        var editUrl = Routes.discussion_comment_path({
          discussion_id: self.props.item.id,
          id: comment.id
        });

        return parseEvent(comment, awardUrl, editUrl);
      }
    });

    if (showAllComments &&
        this.props.showQuestionButtons &&
        comments.length === 1 &&
        comments[0].body.indexOf('?') > -1) {
      var comment = comments[0];
      var questionButtons = (
        <div className="clearfix mb3 ml4">
          <div className="left">
            <button className="pill-button pill-button-theme-white pill-button-border pill-button-shadow mr3"
                onClick={this.handleAnswerQuestionClick.bind(this, comment.user.username)}>
              <span style={{ fontSize: '1.2rem', lineHeight: '2rem' }}>Answer this question</span>
            </button>
          </div>
        </div>
      );

      renderedComments.push(questionButtons);
    }

    return renderedComments;
  },

  renderLoadMoreButton: function() {
    if (this.props.showAllComments) {
      return;
    }

    var numberOfComments = this.state.numberOfComments;

    if (numberOfComments > this.state.comments.length) {
      return (
        <a className="block mt2 fs3 gray-2 clickable"
            onClick={this.triggerModal}>
          <span className="pr2 gray-2 fs5">
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
      // FIXME: (pletcher) We shouldn't be passing the url in as a prop
      var url = Routes.discussion_comments_path({
        discussion_id: item.id
      });

      return <NewComment
          {...this.props}
          canContainWork={item.target && item.target.type.indexOf('task') > -1}
          url={url}
          thread={item.id}
          ref="new-comment" />
    }
  },

  renderOptimisticComments: function() {
    return this.state.optimisticComments.map(function(comment) {
      return (
        <Timeline.Item key={comment.id}>
          <Comment author={comment.user} body={marked(comment.body)} optimistic={true} key={comment.id} />
        </Timeline.Item>
      )
    });
  },

  renderOptimisticClosedEvent: function() {
    return this.renderOptimisticEvent('Event::Close');
  },

  renderOptimisticEvent: function(type) {
    var created_at = new Date(Date.now() + 500);

    // when we get the event back in the confirmation, set the award_url
    // so that the buttons show up
    return {
      type: type,
      actor: UserStore.getUser(),
      // award_url: this.props.url + '/award',
      created_at: created_at,
      id: created_at.toISOString()
    }
  },

  renderOptimisticReopenedEvent: function() {
    return this.renderOptimisticEvent('Event::Reopen');
  },

  renderOptimisticReviewReadyEvent: function() {
    return this.renderOptimisticEvent('Event::ReviewReady');
  },

  renderRuler: function() {
    if (this.state.comments.length > 0) {
      var classes = React.addons.classSet({
        mb0: true,
        mt3: true,
        'border-gray-5': true,
        _mrn4: true,
        _mln4: true,
      });
      return <hr className={classes} />;
    }
  },

  triggerModal: function(e) {
    e.stopPropagation();

    this.props.triggerModal();
  }
});

module.exports = window.NewsFeedItemComments = NewsFeedItemComments;

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
    renderedEvent = <NewsFeedItemEvent timestamp={event.timestamp}>
      <NewsFeedItemBountyWin {...event} />
    </NewsFeedItemEvent>
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
      <Timeline.Item key={event.id}>
        {renderedEvent}
      </Timeline.Item>
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
