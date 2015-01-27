var AppCoins = require('../app_coins.js.jsx')
var Avatar = require('../ui/avatar.js.jsx')
var Markdown = require('../markdown.js.jsx')
var NewsFeedItemBountyModal = require('./news_feed_item_bounty_modal.js.jsx')
var NewsFeedItemModalMixin = require('../../mixins/news_feed_item_modal_mixin');
var Thumbnail = require('../thumbnail.js.jsx')

module.exports = React.createClass({
  displayName: 'NewsFeedItemBounty',

  propTypes: {
    item: React.PropTypes.object.isRequired,
    triggerModal: React.PropTypes.func.isRequired
  },

  mixins: [NewsFeedItemModalMixin],

  render: function() {
    var bounty = this.props.item.target;
    var key = 'nfbi-' + bounty.id;

    var title = this.renderTitle();
    var body = this.renderBody();

    return (
      <div className="p3" onClick={this.handleClick} key={key}>
        {title}
        {body}
      </div>
    );
  },

  renderTitle: function() {
    var bounty = this.props.item.target;

    return (
      <a className="h4 mt0 mb0 blue bold" href={bounty.url}>
        {bounty.title}
      </a>
    )
  },

  renderBody: function() {
    var bounty = this.props.item.target;

    var thumbnails = this.renderThumbnails();

    return (
      <div className="mt2">
        <Markdown content={bounty.short_description} normalized={true} />
        {thumbnails}
      </div>
    )
  },

  renderThumbnails: function() {
    var item = this.props.item;
    var bounty = item.target;
    var thumbnails = bounty.thumbnails;

    if (thumbnails.length) {
      var thumbs = _.map(thumbnails, function(thumb, i) {
        return (
          <span className="px2" key={'thumb-' + i}>
            <Thumbnail src={thumb} width={100} height={100} />
          </span>
        );
      });

      return (
        <div className="clearfix" key={'thumbs-container-' + bounty.id}>
          <div className="gray-2 py1">Images</div>
          {thumbs}
        </div>
      );
    }
  }
});
