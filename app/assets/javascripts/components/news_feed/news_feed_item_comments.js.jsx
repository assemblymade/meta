// TODO This lib is in application.js (chrislloyd)
// var marked = require('marked')

var CONSTANTS = window.CONSTANTS.NEWS_FEED_ITEM;
var Comment = require('../comment.js.jsx');
var Dispatcher = window.Dispatcher;
var Icon = require('../icon.js.jsx');
var NewComment = require('./new_comment.js.jsx');
var NewsFeedItemStore = require('../../stores/news_feed_item_store');

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
  },

  componentWillMount: function() {
    NewsFeedItemStore.addChangeListener(this.getComments);
  },

  componentWillUnmount: function() {
    NewsFeedItemStore.removeChangeListener(this.getComments);
  },

  // unused for now
  fetchCommentsFromServer: function(e) {
    e.stopPropagation();

    var url = this.state.url;

    $.get(url, function(response) {
      this.setState({
        comments: response,
        showCommentsAfter: 0
      });
    }.bind(this));
  },

  getComments: function(e) {
    var comments = NewsFeedItemStore.getComments(this.props.item.id);

    this.setState({
      comment: '',
      comments: this.state.comments.concat(comments.confirmed),
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
    var confirmedComments = this.renderConfirmedComments();
    var optimisticComments = this.renderOptimisticComments();
    var comments = confirmedComments.concat(optimisticComments);

    if (!comments.length) {
      return;
    }

    return (
      <div>
        {this.renderLoadMoreButton()}
        <div className={this.props.showAllComments ? "timeline" : ""}>
          {confirmedComments}
        </div>
        {optimisticComments}
      </div>
    );
  },

  renderConfirmedComments: function() {
    var renderIfAfter = this.state.showCommentsAfter;

    return this.state.comments.map(function(comment) {
      if (new Date(comment.created_at) >= renderIfAfter) {
        return (
          <div className="timeline-item" key={comment.id}>
            <Comment author={comment.user} body={comment.markdown_body} timestamp={comment.created_at} />
          </div>
        );
      }
    });
  },

  renderLoadMoreButton: function() {
    var numberOfComments = this.state.numberOfComments;
    var target = this.props.item.target;

    if (numberOfComments > this.state.comments.length) {
      return (
        <a className="block text-small py2 gray-dark clickable"
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
    if (this.props.commentable) {
      var url = this.state.url;

      if (window.app.currentUser()) {
        return <NewComment {...this.props} url={url} thread={this.props.item.id} user={window.app.currentUser()} />
      }
    }
  },

  renderOptimisticComments: function() {
    return this.state.optimisticComments.map(function(comment) {
      return (
        <div className="h6 mt0 mb2 px3" key={comment.id}>
          <Comment author={comment.user} body={marked(comment.body)} optimistic={true} />
        </div>
      )
    });
  },

  triggerModal: function(e) {
    e.stopPropagation();

    this.props.triggerModal();
  }
});

if (typeof module !== 'undefined') {
  module.exports = NewsFeedItemComments;
}

window.NewsFeedItemComments = module.exports
