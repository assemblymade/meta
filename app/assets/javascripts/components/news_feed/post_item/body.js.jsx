(function() {
  var NewsFeedPostItemBody = React.createClass({
    propTypes: {
      post: React.PropTypes.object.isRequired
    },

    render: function() {
      var post = this.props.post;

      return (
        <div className="p3">
          <span dangerouslySetInnerHTML={{__html: post.markdown_body}} />
          <a href={post.url} className="pull-right">more</a>
        </div>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedPostItemBody;
  }
})();
