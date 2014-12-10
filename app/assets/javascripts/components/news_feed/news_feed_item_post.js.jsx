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
    return (
      <div className="p3">
        <a className="h3 block mt0 mb3" href={this.props.url} onClick={this.handleClick}>
          {this.props.title}
        </a>
        <div className="gray-darker">
          <Markdown content={this.props.body} normalized={true} />
        </div>
      </div>
    )
  }
});
