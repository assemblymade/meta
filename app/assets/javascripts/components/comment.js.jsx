'use strict'

// TODO asset pipelined (chrislloyd)
// var marked = require('marked')

const Avatar = require('./ui/avatar.js.jsx');
const CommentActionCreators = require('../actions/comment_action_creators');
const CommentStore = require('../stores/comment_store');
const Heart = require('./heart.js.jsx');
const Icon = require('./ui/icon.js.jsx');
const List = require('./ui/list.js.jsx')
const Lovers = require('./lovers.js.jsx');
const Markdown = require('./markdown.js.jsx');
const NewComment = require('./news_feed/new_comment.js.jsx');
const NewCommentActionCreators = require('../actions/new_comment_action_creators');
const Partner = require('./partner.js.jsx');
const ProductStore = require('../stores/product_store');
const Routes = require('../routes');
const Tips = require('./tips_ui.js.jsx');
const UserStore = require('../stores/user_store');

module.exports = React.createClass({
  displayName: 'Comment',

  propTypes: {
    author: React.PropTypes.object.isRequired,
    awardUrl: React.PropTypes.string,
    body: React.PropTypes.string.isRequired,
    editUrl: React.PropTypes.string,
    heartable: React.PropTypes.bool,
    id: React.PropTypes.string,
    timestamp: React.PropTypes.string,
    rawBody: React.PropTypes.string
  },

  componentDidMount: function() {
    if (this.refs.coreIndicator) {
      $(this.refs.coreIndicator.getDOMNode()).tooltip({
        container: 'body',
        placement: 'top'
      });
    }

    CommentStore.addChangeListener(this.getUpdatedComment);
  },

  componentWillUnmount: function() {
    CommentStore.removeChangeListener(this.getUpdatedComment);
  },

  getInitialState: function() {
    return {
      body: this.props.body,
      editing: false,
      rawBody: this.props.rawBody
    };
  },

  getUpdatedComment: function() {
    var updatedComment = CommentStore.getComment(this.props.id);

    if (updatedComment) {
      this.setState({
        editing: false,
        body: updatedComment.markdown_body,
        rawBody: updatedComment.body
      });

      CommentActionCreators.confirmUpdateReceived(updatedComment.id);
    }
  },

  isOptimistic: function() {
    return !!this.props.optimistic;
  },

  render: function() {
    var author = this.props.author;

    return (
      <div id={this.props.id}>
        <div className="left activity-avatar inline-block">
          <a href={Routes.user_path({ id: this.props.author.username })}>
            <Partner user={author} size={30} product={this.props.product} />
          </a>
        </div>

        {this.renderComment()}
      </div>
    );
  },

  renderAwardOption: function() {
    if (this.currentUserIsCore()) {
      var id = this.props.id;
      var username = this.props.author.username;
      var awardUrl = this.props.awardUrl;

      return (
        <List.Item>
          <a className="gray-2 black-hover"
              href={awardUrl + '?event_id=' + id}
              data-method="patch"
              data-confirm={'Are you sure you want to award this task to @' + username + '?'}>
            Award
          </a>
        </List.Item>
      );
    }
  },

  renderAwardAndCloseOption: function() {
    var bounty = this.props.bounty
    if (this.currentUserIsCore()) {
      var id = this.props.id;
      var username = this.props.author.username;
      var awardUrl = this.props.awardUrl;

      return (
        <List.Item>
          <a className="gray-2 black-hover"
             href={awardUrl + '?event_id=' + id + '&close=true'}
             data-method="patch"
             data-confirm={'Are you sure you want to award this task to @' + username + '?'}>
            Award and close
          </a>
        </List.Item>
      );
    }
  },

  renderComment: function() {
    if (this.state.editing) {
      return this.renderEditableComment();
    }

    var author = this.props.author;
    var body;

    if (this.isOptimistic()) {
      body = window.marked(this.state.body);
    } else {
      body = this.state.body;
    }

    var classes = React.addons.classSet({
      'mb1': true,
      'gray-2': this.isOptimistic()
    });

    return (
      <div className="ml4 visible-hover-wrapper">
        <div className="h6 mt0 mb1">
          <a className="bold black black-hover" href={author.url}>{author.username}</a>
          {' '}
          <a href={this.props.url} className="right gray-2 gray-2-hover visible-hover">
            {moment(this.props.timestamp).fromNow()}
          </a>
        </div>

        <div className={classes}>
          <Markdown content={body} normalized={true} color="gray-1" />
        </div>

        <div className="h6">
          <List type="piped">
            {this.renderTips()}
            {this.renderLove()}
            {this.renderEditOption()}
            {this.renderReply()}
            {this.renderAwardOption()}
            {this.renderAwardAndCloseOption()}
          </List>
        </div>
      </div>
    );
  },

  renderEditableComment: function() {
    var id = this.props.id;

    return (
      <NewComment
          commentId={this.props.id}
          initialText={this.state.rawBody}
          thread={id}
          url={this.props.editUrl}
          user={this.props.author} />
    );
  },

  renderEditOption: function() {
    var editUrl = this.props.editUrl;

    if (UserStore.getId() === this.props.author.id) {
      return (
        <List.Item>
          <a className="gray-2 black-hover" href="javascript:void(0);" onClick={this.triggerEditMode}>
            Edit
          </a>
        </List.Item>
      );
    }
  },

  renderLove: function() {
    if (this.props.heartable) {
      return (
        <List.Item>
          <div className="inline-block">
            <Heart size="small" heartable_id={this.props.id} heartable_type='NewsFeedItemComment' />
          </div>
          {' '}
          <div className="inline-block">
            <Lovers heartable_id={this.props.id} />
          </div>
        </List.Item>
      )
    }
  },

  renderReply: function() {
    if (this.props.author.id === UserStore.getId()) {
      return;
    }

    return (
      <List.Item>
        <a className="gray-2 black-hover"
            href="javascript:void(0);"
            onClick={this.reply.bind(this, this.props.author)}>
          Reply
        </a>
      </List.Item>
    );
  },

  renderTips: function() {
    if (_.isEmpty(ProductStore.getProduct())) {
      return;
    }

    // TipsUi is causing display issues :(
    return (
      <List.Item>
        <Tips
            viaType="NewsFeedItemComment"
            viaId={this.props.id}
            recipient={this.props.author} />
      </List.Item>
    );
  },

  reply: function(user, e) {
    e.preventDefault();

    NewCommentActionCreators.updateComment(this.props.news_feed_item_id, '@' + user.username);

    var el = document.getElementById('event_comment_body');
    $('html, body').animate({
      scrollTop: $(el).offset().top
    }, 600);

    el.focus();
  },

  triggerEditMode: function(e) {
    e.preventDefault();

    this.setState({
      editing: true
    });
  },

  currentUserIsCore: function() {
    return ProductStore.isCoreTeam(UserStore.getUser());
  }
});
