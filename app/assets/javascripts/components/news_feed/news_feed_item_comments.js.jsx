/** @jsx React.DOM */

// TODO This lib is in application.js (chrislloyd)
// var marked = require('marked')

var CONSTANTS = require('../../constants').NEWS_FEED_ITEM;
var NewComment = require('./new_comment.js.jsx');
var NewsFeedItemStore = require('../../stores/news_feed_item_store');
var Comment = require('../comment.js.jsx')


module.exports = React.createClass({
  displayName: 'NewsFeedItemComments',

  propTypes: {
    item: React.PropTypes.object.isRequired
  },

  componentWillMount: function() {
    // If there are a lot of NewsFeedItems, `addChangeListener()`
    // will throw a warning. It seems safe to ignore: it's a bug
    // in Node's EventEmitter implementation. :(
    NewsFeedItemStore.addChangeListener(this.getComments);
  },

  getComments: function() {
    var comments = NewsFeedItemStore.getComments(this.props.item.id);

    this.setState({
      comment: '',
      comments: this.state.comments.concat(comments.confirmed),
      optimisticComments: comments.optimistic,
      // This is pretty hacky (chrislloyd)
      numberOfCommentsToShow: (comments.optimistic.length ? this.state.numberOfCommentsToShow : this.state.numberOfCommentsToShow + 1)
    });
  },

  getInitialState: function() {
    var item = this.props.item;

    return {
      comments: item.news_feed_item_comments,
      optimisticComments: [],
      numberOfCommentsToShow: 1,
      url: item.url
    };
  },

  render: function() {
    return (
      <div>
        {this.renderComments()}
        <div className="border-top px3 py2">
          <NewComment url={this.state.url} thread={this.props.item.id} />
        </div>
      </div>
    );
  },

  renderComment: function(comment, optimistic) {
    var className = 'gray-darker';
    if (optimistic) {
      className = 'gray-light';
    }

    var user = comment.user

    // TODO The line-height=18 is a hack. The `h6` should set the LH.

    return (
      <div className="clearfix px3 py2" key={comment.id}>
        <div className="left mr2">
          <Avatar user={user} size={24} />
        </div>
        <div className="overflow-hidden">
          <a className="block bold black" style={{'line-height': 18}} href={user.url}>{user.username}</a>

          <div className={className}>
            <Markdown content={comment.markdown_body || window.marked(comment.body)} normalize={true} />
          </div>
        </div>
      </div>
    );
  },

  renderComments: function() {
    var confirmedComments = this.renderConfirmedComments();
    var optimisticComments = this.renderOptimisticComments();
    var comments = confirmedComments.concat(optimisticComments);
    var numberOfComments = comments.length;
    var numberOfCommentsToShow = this.state.numberOfCommentsToShow;

    if (numberOfComments > numberOfCommentsToShow) {
      return (
        <div>
          <a className="block h6 blue clearfix mt0 mb0 px3 py2" href="javascript:void(0);" onClick={this.showMoreComments(numberOfComments)}>
            &nbsp;View all {numberOfComments} comments
          </a>

          {_.last(confirmedComments, numberOfCommentsToShow)}
          {optimisticComments}
        </div>
      );
    }

    return comments;
  },

  renderConfirmedComments: function() {
    return this.state.comments.map(function(comment) {
      return (
        <div className="px3 py2" key={comment.id}>
          <Comment author={comment.user} body={comment.markdown_body} />
        </div>
      )
    })
  },

  renderOptimisticComments: function() {
    return this.state.optimisticComments.map(function(comment) {
      return (
        <div className="px3 py2" key={comment.id}>
          <Comment author={comment.user} body={comment.body} optimistic="true" />
        </div>
      )
    });
  },

  showMoreComments: function(total) {
    return function(e) {
      this.setState({
        numberOfCommentsToShow: total
      });
    }.bind(this);
  }
})

window.NewsFeedItemComments = module.exports
