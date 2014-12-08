var Comment = require('./idea_comment.js.jsx')
var NewComment = require('./new_idea_comment.js.jsx');
var IdeaCommentsStore = require('../../stores/idea_comments_store');

module.exports = React.createClass({
  displayName: 'IdeaDiscussion',

  componentWillMount: function() {
    IdeaCommentsStore.addChangeListener(this.getComments);
  },

  getComments: function(e) {
    var comments = IdeaCommentsStore.getComments();
    this.setState({
      comment: '',
      comments: this.state.comments.concat(comments.confirmed),
      optimisticComments: comments.optimistic
    });
  },

  getInitialState: function() {
    return {
      comments: this.props.comments,
      optimisticComments: [],
      url: this.props.url
    }
  },
  render: function() {
    return (
      <div className="px3">
        {this.renderComments()}
        {this.renderNewCommentForm()}
      </div>
    );
  },
  renderNewCommentForm: function(){
    return (
      <NewComment url={this.state.url}
                  key="new-comment-form"
                  signup_path={this.props.signup_path}
                  login_path={this.props.login_path} />
    )
  },
  renderComments: function() {
    var comments = this.state.comments.map(function(comment){
      return (
        <Comment author={comment.user} body={comment.markdown_body} key={comment.id} id={comment.id}/>
      );
    });
    return (
      <div className="timeline">
        {comments}
      </div>
    );
  }
})

window.IdeaDiscussion = module.exports
