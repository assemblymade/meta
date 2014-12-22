// TODO asset pipelined (chrislloyd)
// var marked = require('marked')

var Avatar = require('./avatar.js.jsx');
var CommentActionCreators = require('../actions/comment_action_creators');
var CommentStore = require('../stores/comment_store');
var Icon = require('./icon.js.jsx');
var Love = require('./love.js.jsx');
var Markdown = require('./markdown.js.jsx');
var NewComment = require('./news_feed/new_comment.js.jsx');
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

        {this.renderEllipsisMenu()}
        {this.renderComment()}
      </div>
    )
  },

  renderAwardOptions: function() {
    if (this.currentUserIsCore() && this.props.awardUrl) {
      var id = this.props.id;
      var username = this.props.author.username;
      var awardUrl = this.props.awardUrl;

      return [
        <li key={'award-' + id}>
          <a className="event-award"
              href={awardUrl + '?event_id=' + id}
              data-method="patch"
              data-confirm={'Are you sure you want to award this task to @' + username + '?'}>
            <span className="ml0 mr2">
              <Icon icon="star-o" />
            </span>
            {'Award bounty to @' + username + ' and keep it open'}
          </a>
        </li>,

        <li key={'award-and-close-' + id}>
          <a className="event-award"
              href={awardUrl + '?event_id=' + id + '&close=true'}
              data-method="patch"
              data-confirm={'Are you sure you want to award this task to @' + username + '?'}>
            <span className="ml0 mr2">
              <Icon icon="star" />
            </span>
            {'Award bounty to @' + username + ' and close it'}
          </a>
        </li>
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
      'activity-content': true,
      'gray-dark': this.isOptimistic()
    });

    return (
      <div className="overflow-hidden activity-body px3">
        <div className="inline-block gray-2">
          <a className="inline-block bold black" href={author.url}>{author.username}</a>
          {this.renderLove()}
          {this.renderTips()}
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
        <li key={'edit-options-' + this.props.id}>
          <a href="javascript:void(0);" onClick={this.triggerEditMode}>
            <span className="ml0 mr2">
              <Icon icon="pencil" />
            </span>
            Edit comment
          </a>
        </li>
      );
    }
  },

  renderEllipsisMenu: function() {
    if (this.state.editing) {
      return;
    }

    var id = this.props.id;

    return (
      <div className="activity-actions clearfix right">
        <ul className="list-inline right">
          <li>

            <div className="dropdown">
              <a href="javascript:void(0);"
                  className="dropdown-toggle"
                  id={"dropdown-" + id}
                  data-toggle="dropdown">
                <span className="icon icon-ellipsis" style={{ fontSize: 18 }} />
              </a>

              <ul className="dropdown-menu dropdown-menu-right text-small"
                  role="menu"
                  aria-labelledby={"dropdown-" + id}
                  key={'ul-' + id}>

                <li>
                  <a href={this.props.url} role="menuitem">
                    <i className="icon icon-link dropdown-glyph"></i>
                      Permalink
                  </a>
                </li>

                {this.renderAwardOptions()}
                {this.renderEditOption()}
              </ul>

            </div>
          </li>
        </ul>
      </div>
    );
  },

  renderLove: function() {
    if (this.props.heartable) {
      return (
        <div className="inline-block ml2">
          <Love heartable_id={this.props.id} heartable_type='NewsFeedItemComment' />
        </div>
      );
    }
  },

  renderTips: function() {
    return (
      <div className="inline-block ml2">
        <TipsUi
            viaType="NewsFeedItemComment"
            viaId={this.props.id}
            recipient={this.props.author}
            tips={this.props.tips} />
      </div>
    );
  },

  triggerEditMode: function(e) {
    e.preventDefault();

    this.setState({
      editing: true
    });
  },

  currentUserIsCore: function() {
    return _(ProductStore.getCoreTeamIds()).contains(UserStore.getId())
  }
});
