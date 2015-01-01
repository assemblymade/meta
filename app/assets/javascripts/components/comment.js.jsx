// TODO asset pipelined (chrislloyd)
// var marked = require('marked')

var Avatar = require('./avatar.js.jsx');
var CommentActionCreators = require('../actions/comment_action_creators');
var CommentStore = require('../stores/comment_store');
var Icon = require('./icon.js.jsx');
var Love = require('./love.js.jsx');
var Markdown = require('./markdown.js.jsx');
var NewComment = require('./news_feed/new_comment.js.jsx');
var NewCommentActionCreators = require('../actions/new_comment_action_creators');
var ProductStore = require('../stores/product_store')
var TipsUi = require('./tips_ui.js.jsx');
var UserStore = require('../stores/user_store');

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
      <div id={this.props.id} className="timeline-item">
        <div className="left activity-avatar">
          <Avatar user={author} size={30} />
        </div>

        {this.renderComment()}
      </div>
    );
  },

  renderAwardOptions: function() {
    if (this.currentUserIsCore() && this.props.awardUrl) {
      var id = this.props.id;
      var username = this.props.author.username;
      var awardUrl = this.props.awardUrl;

      return [
        <a className="_pl0_75 _pr0_75 _border-left1px border-gray-4 gray-2 _h6"
            href={awardUrl + '?event_id=' + id}
            key={'award-' + id}
            data-method="patch"
            data-confirm={'Are you sure you want to award this task to @' + username + '?'}>
          Award
        </a>,
        <a className="_pl0_75 _pr0_75 _border-left1px border-gray-4 gray-2 _h6"
            href={awardUrl + '?event_id=' + id + '&close=true'}
            key={'award-and-close-' + id}
            data-method="patch"
            data-confirm={'Are you sure you want to award this task to @' + username + '?'}>
          Award & close
        </a>
      ];
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
      'gray-dark': this.isOptimistic()
    });

    return (
      <div className="px4 _hover-toggle" style={{ top: -5, position: 'relative' }}>
        <div className="inline-block">
          <a className="inline-block bold h6 mt0 mb0 _mr0_5 black" href={author.url}>{author.username}</a>
          {this.renderLove()}
          {this.renderReply()}
          {this.renderEditOption()}
          {this.renderAwardOptions()}
          {this.renderTips()}
        </div>

        {this.renderTimestamp()}

        <div className="h6 gray-1 mt0 mb0 overflow-hidden">
          {this.renderLovers()}
        </div>

        <div className={classes}>
          <Markdown content={body} normalized={true} />
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
        <a className="_pl0_75 _pr0_75 _border-left1px border-gray-4 gray-2 _h6" href="javascript:void(0);" onClick={this.triggerEditMode}>
          Edit
        </a>
      );
    }
  },

  renderLove: function() {
    if (this.props.heartable) {
      return (
        <div className="inline-block _mb0_25 _h6 gray-2">
          <Love heartable_id={this.props.id} heartable_type='NewsFeedItemComment' />
        </div>
      );
    }
  },

  renderLovers: function() {
    if (this.props.heartable) {
      return <Lovers heartable_id={this.props.id} />
    }
  },

  renderPermalink: function() {
    return (
      <a className="_ml0_75 _pl0_75 _pr0_75 _border-left1px border-gray-4 h6 gray-2" href={this.props.url} role="menuitem">
        <Icon icon="link" />
      </a>
    );
  },

  renderReply: function() {
    return (
      <a className="_pl0_75 _pr0_75 _border-left1px border-gray-4 gray-2 _h6"
          href="javascript:void(0);"
          onClick={this.reply.bind(this, this.props.author)}>
        Reply
      </a>
    );
  },

  renderTimestamp: function() {
    return (
      <div className="_h6 _text-align-right inline-block _clearfix right">
        <div className="_none gray-2 _hover-toggle-item-block _pr0_75">
          {moment(this.props.timestamp).fromNow()}
          {this.renderPermalink()}
        </div>
      </div>
    );
  },

  renderTips: function() {
    // TipsUi is causing display issues :(
    return (
      <span className="_pl0_75 _inline-block _ht1_5 _border-left1px border-gray-4 _h6">
        <TipsUi
            viaType="NewsFeedItemComment"
            viaId={this.props.id}
            recipient={this.props.author}
            tips={this.props.tips} />
      </span>
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
    return UserStore.isCoreTeam();
  }
});
