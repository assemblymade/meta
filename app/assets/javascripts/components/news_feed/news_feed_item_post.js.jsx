(function() {
  var d3 = require('d3');
  var PieChart = require('../pie_chart.js.jsx');
  // TODO: Fix these colors, they're hideous
  var COLORS = ["#0b64a0","#f4b425",  "#fcedd6", "#f7e3bf", "#fcce65", "#fec92d", "#f4b425"];
  module.exports = React.createClass({
    displayName: 'NewsFeedItemPost',

    propTypes: {
      post: React.PropTypes.object.isRequired,
      user: React.PropTypes.object.isRequired,
      product: React.PropTypes.object.isRequired
    },

    body: function(post) {
      if (post.markdown_body) {
        return <div className="gray-darker" dangerouslySetInnerHTML={{__html: (post.markdown_body)}} />;
      }

      return this.transform(post.description);
    },

    render: function() {
      var post = this.props.post
      var user = this.props.user
      var product = this.props.product

      if (!post) {
        return <div />;
      }

      return (
        <div className="p3">
          <a href={post.url} className="block h4 mt0 mb2 black">
            {post.title}
          </a>

          <div className="clearfix gray h6 mt0 mb2">
            <div className="left mr1">
              <Avatar user={user} size={18} />
            </div>
            <div className="overflow-hidden">
              Created by
              {' '}
              <a className="gray" href={user.url}>{user.username}</a>
            </div>
          </div>

          <div id={post.id}>
            {this.body(post)}
          </div>

          <a className="btn btn-pill btn-sm" href={post.url}>Read more</a>
        </div>
      )
    },

    transform: function(description) {
      var parsed = (/^```(\S*)\n([\s\S]*)```/).exec(description);

      if (!parsed) {
        return description;
      }

      var type = parsed[1];
      var values = parsed[2].split('\n');

      var columns = values.map(function(value) {
        value = value.split(',');

        if (value[1]) {
          return { text: value[0], quantity: parseInt(value[1]) };
        }

        return false;
      });

      return <PieChart data={columns} colorRange={COLORS} width={400} height={320} />;
    }
  });

})()
