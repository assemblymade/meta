var AppIcon = require('../app_icon.js.jsx');
var Avatar = require('../ui/avatar.js.jsx');
var Bounty = require('../bounty.js.jsx');
var Lightbox = require('../lightbox.js.jsx');
var MarkdownEditor = require('../markdown_editor.js.jsx');
var NewsFeedItemBountyClose = require('./news_feed_item_bounty_close.js.jsx');
var NewsFeedItemBountyCommentReference = require('./news_feed_item_bounty_comment_reference.js.jsx');
var NewsFeedItemBountyReviewReady = require('./news_feed_item_bounty_review_ready.js.jsx');
var NewsFeedItemBountyTagChange = require('./news_feed_item_bounty_tag_change.js.jsx');
var NewsFeedItemBountyTimelineItem = require('./news_feed_item_bounty_timeline_item.js.jsx');
var NewsFeedItemBountyTitleChange = require('./news_feed_item_bounty_title_change.js.jsx');
var NewsFeedItemBountyWin = require('./news_feed_item_bounty_win.js.jsx');
var NewsFeedItemComments = require('./news_feed_item_comments.js.jsx');
var ReadReceipts = require('../read_receipts.js.jsx');
var Spinner = require('../spinner.js.jsx');

module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyModal',

  propTypes: {
    item: React.PropTypes.object.isRequired,
    onHidden: React.PropTypes.func.isRequired
  },

  componentDidMount: function() {
    var modal = $(this.getDOMNode()).modal({ show: true });

    modal.on('hidden.bs.modal', this.props.onHidden);

    window.app.setCurrentAnalyticsProduct(this.props.item.product);

    this.fetchBounty();
  },

  componentWillUnmount: function() {
    $(this.getDOMNode()).off('hidden.bs.modal');
  },

  fetchBounty: function(target) {
    target = target || this.props.item.target;

    var url = target.url + '.json';

    $.get(url, function(response) {
      this.setState({
        bounty: response.bounty,
        events: response.events,
        analytics: response.analytics,
        ready: true
      });
    }.bind(this));
  },

  getDefaultProps: function() {
    var csrfTokenElement = document.getElementsByName('csrf-token')[0];

    if (csrfTokenElement) {
      return {
        csrf: csrfTokenElement.content
      };
    }

    console.warn('No CSRF token was found. Changes might fail to post.');

    return {};
  },

  getInitialState: function() {
    return {
      ready: false,
      events: []
    };
  },

  render: function() {
    // (pletcher) This is bad, but the WipSerializer needs to stay relatively
    // lightweight, and the TaskSerializer breaks on weird things (e.g.,
    // #contracts)

    var item = this.props.item;
    var bounty = _.extend((this.state.bounty || {}), item.target);
    var product = item.product;

    // TODO: (pletcher) Don't render the bounty in a modal; use a slide out
    //       (or something that doesn't barf on random clicks and can support
    //       inner click events)

    var title = <div className="clearfix">
      <div className="left mr2">
        <AppIcon app={product} />
      </div>
      <a href={bounty.url}>{product.name}</a>
    </div>;

    return (
      <Lightbox size="modal-lg" title={title}>
        {this.renderBounty()}
      </Lightbox>
    );
  },

  renderBounty: function() {
    var item = this.props.item;
    var bounty = _.extend((this.state.bounty || {}), item.target);
    var product = item.product;

    bounty.product = product;
    bounty.user = bounty.user || item.user;

    if (this.state.ready) {
      return (
        <Bounty
            analytics={this.state.analytics}
            key={bounty.id}
            bounty={bounty}
            noInvites={true}
            item={this.props.item}
            valuation={{
              product: { name: product.name },
              url: '/' + product.slug + '/bounties',
              maxOffer: (6 * product.average_bounty),
              averageBounty: product.average_bounty,
              coinsMinted: product.coins_minted,
              profitLastMonth: product.profit_last_month
            }} />
      );
    }

    return <Spinner />;
  }
});
