// TODO asset pipelined (chrislloyd)
// var marked = require('marked')

var Avatar = require('./ui/avatar.js.jsx');
var CommentActionCreators = require('../actions/comment_action_creators');
var CommentStore = require('../stores/comment_store');
var Icon = require('./ui/icon.js.jsx');
var Heart = require('./heart.js.jsx');
var Lovers = require('./lovers.js.jsx');
var Markdown = require('./markdown.js.jsx');
var NewComment = require('./news_feed/new_comment.js.jsx');
var NewCommentActionCreators = require('../actions/new_comment_action_creators');
var ProductStore = require('../stores/product_store');
var Routes = require('../routes');
var Tips = require('./tips_ui.js.jsx');
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
      <div id={this.props.id} className="timeline-item">
        <div className="left activity-avatar _inline-block">
          <a href={Routes.user_path({ id: this.props.author.username })}>
            <Avatar user={author} size={30} />
          </a>
        </div>

        <div className="left _inline-block" style={{ position: 'relative', left: '-8px', top: '-6px' }}>
          {this.renderCoreTeamIcon()}
        </div>

        {this.renderComment()}
      </div>
    );
  },

  renderAwardOption: function() {
    if (this.currentUserIsCore() && this.props.awardUrl) {
      var id = this.props.id;
      var username = this.props.author.username;
      var awardUrl = this.props.awardUrl;

      return (
        <a className="_pl0_75 _pr0_75 _border-left1px border-gray-4 gray-2 _h6"
            href={awardUrl + '?event_id=' + id}
            key={'award-' + id}
            data-method="patch"
            data-confirm={'Are you sure you want to award this task to @' + username + '?'}>
          Award
        </a>
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
      'gray-2': this.isOptimistic()
    });

    return (
      <div className="px4 visible-hover-wrapper">
        <div className="h6 mt0 mb1">
          <a className="bold black black-hover" href={author.url}>{author.username}</a>
          {' '}
          <a href={this.props.url} className="gray-2 gray-2-hover visible-hover">commented {moment(this.props.timestamp).fromNow()}</a>
        </div>

        <div className={classes}>
          <Markdown content={body} normalized={true} wideQuotes={true} />
        </div>

        <div className="inline-block _pt0_5">
          {this.renderTips()}
          {this.renderLove()}
          {this.renderEditOption()}
          {this.renderReply()}
          {this.renderAwardOption()}
        </div>
      </div>
    );
  },

  renderCoreTeamIcon: function() {
    var author = this.props.author;

    if (_(ProductStore.getCoreTeamIds()).contains(author.id)) {
      return <img src="/assets/core_icon.svg"
          width="12"
          ref="coreIndicator"
          data-toggle="tooltip"
          title={'@' + author.username + ' is a member of the ' + ProductStore.getName() + ' core team'} />;
    }
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
      return [
        <div className="_inline-block _mb0_25 _h6 mr1 gray-2">
          <Heart size="small" heartable_id={this.props.id} heartable_type='NewsFeedItemComment' />
        </div>,

        <div className="_inline-block _h6">
          <Lovers heartable_id={this.props.id} />
        </div>
      ];
    }
  },

  renderReply: function() {
    if (this.props.author.id === UserStore.getId()) {
      return;
    }

    return (
      <a className="_pl0_75 _pr0_75 _border-left1px border-gray-4 gray-2 _h6"
          href="javascript:void(0);"
          onClick={this.reply.bind(this, this.props.author)}>
        Reply
      </a>
    );
  },

  renderTips: function() {
    if (this.props.author.id === UserStore.getId() ||
        _.isEmpty(ProductStore.getProduct())) {
      return;
    }

    // TipsUi is causing display issues :(
    return (
      <span className="_pr0_75 _inline-block _h6" style={{height: '1.5rem'}}>
        <Tips
            viaType="NewsFeedItemComment"
            viaId={this.props.id}
            recipient={this.props.author} />
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
    return ProductStore.isCoreTeam(UserStore.getUser());
  }
});
