var Markdown = require('../markdown.js.jsx');
var NewsFeedItemModalMixin = require('../../mixins/news_feed_item_modal_mixin');
var UserStore = require('../../stores/user_store');

module.exports = React.createClass({
  displayName: 'NewsFeedItemPost',

  propTypes: {
    title: React.PropTypes.string.isRequired,
    body: React.PropTypes.string.isRequired,
    target: React.PropTypes.object,
    url: React.PropTypes.string.isRequired
  },

  mixins: [NewsFeedItemModalMixin],

  getInitialState: function() {
    return {
      archived: this.props.target && this.props.target.archived
    };
  },

  render: function() {
    var target = this.props.target;

    return (
      <div className="table mb0">
        <div className="table-cell">
          <div className="px3 pt3 pb3" onClick={this.handleClick}>
            <div className="mt0 mb1 mtn1 h4 bold clickable">
              <a href={this.props.url}>
                {this.props.title}
              </a>
            </div>
            <div>
              {this.renderSummary()}
            </div>
            <div className="mt1 gray-1 h3">
              <Markdown content={this.props.body} normalized={true} />
              {this.renderReadMore()}
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderReadMore: function() {
    if (this.props.enableModal) {
      return <a className="text-small mt3" href={this.props.url}>Read more</a>;
    }
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
