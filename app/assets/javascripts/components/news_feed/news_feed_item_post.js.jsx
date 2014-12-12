var Markdown = require('../markdown.js.jsx');
var NewsFeedItemModalMixin = require('../../mixins/news_feed_item_modal_mixin');

module.exports = React.createClass({
  displayName: 'NewsFeedItemPost',

  propTypes: {
    title: React.PropTypes.string.isRequired,
    body: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired
  },

  mixins: [NewsFeedItemModalMixin],

  render: function() {
    var target = this.props.target;

    return (
      <div className="p3 clickable" onClick={this.handleClick}>
        <a className="h3 block mt0 mb1 black" href={this.props.url}>{this.props.title}</a>
        {this.renderSummary()}

        <div className="mt3 gray-darker" style={{ fontSize: 16 }}>
          <Markdown content={this.props.body} normalized={true} />
        </div>
      </div>
    );
  },

  renderSummary: function() {
    if (this.props.target && this.props.target.summary) {
      return (
        <div className="gray">
          <Markdown content={this.props.target.summary} normalized={true} />
        </div>
      );
    }
  }
});
