/** @jsx React.DOM */

(function() {
  var NewsFeedItem = React.createClass({
    body: function() {
      return this.props.target ? this.renderWithTarget() : this.renderWithoutTarget();
    },

    header: function() {
      return (
        <div>
          <Avatar user={this.props.user} size={36} />
          {this.username()}
          {this.timestamp()}
        </div>
      );
    },

    render: function() {
      return (
        <div>
          <div className="card">
            {this.body()}
          </div>
          
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
      return (
        <span style={{ 'margin': '10px' }}>
          <strong>
            {this.props.user.username}
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
