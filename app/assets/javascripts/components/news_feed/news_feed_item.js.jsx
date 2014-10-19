/** @jsx React.DOM */

(function() {
  var Avatar = require('../avatar.js.jsx');
  var NewsFeedItemComments = require('./news_feed_item_comments.js.jsx');

  var NewsFeedItem = React.createClass({
    avatar: function() {
      return (
        <span style={{ 'margin-right': '10px' }}>
          <Avatar user={this.props.user} size={36} />
        </span>
      );
    },

    body: function() {
      return this.props.target ? this.renderWithTarget() : this.renderWithoutTarget();
    },

    header: function() {
      return (
        <div>
          {this.avatar()}
          {this.username()}
          {this.timestamp()}
        </div>
      );
    },

    render: function() {
      return (
        <div>
          <div className="card" style={{ 'margin-bottom': '0px', 'border-radius': '0px' }}>
            {this.body()}
          </div>
          <NewsFeedItemComments
            url={this.props.url}
            comments={this.props.news_feed_item_comments} />
        </div>
      );
    },

    renderWithTarget: function() {
      var target = this.props.target;
      return (
        <div className="card-body">
          {this.header()}
          <div className="row">
            <a href={target.url}>
              <div className="col-md-12 card" style={{ 'margin-top': '20px', 'margin-bottom': '0px', border: '1px solid #ececec' }}>
                <h5 style={{ color: '#333' }}>{target.title}</h5>
                <p style={{ color: '#333' }}>{target.body_preview}</p>
              </div>
            </a>
          </div>
        </div>
      );
    },

    renderWithoutTarget: function() {
      console.log(this.props);
      return (
        <div className="card-body">
          {this.header()}
          <div className="row">
            <div className="col-md-12" style={{ 'margin-top': '20px' }}>
              <p style={{ 'font-size': '24px' }}>{this.props.message}</p>
            </div>
          </div>
        </div>
      );
    },

    timestamp: function() {
      return (
        <span className="text-muted" style={{ 'margin-top': '5px' }}>
          {$.timeago(new Date(this.props.created))}
        </span>
      );
    },

    username: function() {
      var user = this.props.user;

      return (
        <span style={{ 'margin-right': '10px' }}>
          <strong>
            <a href={"/users/" + user.username}>{user.username}</a>
          </strong>
        </span>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItem;
  }

  window.NewsFeedItem = NewsFeedItem;
})();
