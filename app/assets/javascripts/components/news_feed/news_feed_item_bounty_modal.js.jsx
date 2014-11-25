/** @jsx React.DOM */

var AppIcon = require('../app_icon.js.jsx');
var Avatar = require('../avatar.js.jsx');
var Bounty = require('../bounty.js.jsx');
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

    analytics.track('product.wip.viewed', { bounty: this.props.item.target, news_feed: true });

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

    bounty.product = product;
    bounty.user = item.user;

    // TODO: (pletcher) Don't render the bounty in a modal

    var title = <div className="clearfix">
      <div className="left mr2">
        <AppIcon app={product} />
      </div>
      <a href={bounty.url}>{product.name}</a>
    </div>;

    return (
      <Lightbox size="modal-lg" title={title}>
        {this.state.ready ?
          [<Bounty
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
              }}
              showCoins={product.slug !== 'meta'} />,

          <div className="discussion" id="discussion-view-el" key={'discussion-' + bounty.id}>
            <div className="timeline omega">
              {this.renderDiscussion()}
            </div>
            {this.renderNewEventForm()}
          </div>] : <Spinner />}
      </Lightbox>
    );
  },

  renderCloseActions: function() {
    var bounty = this.state.bounty;

    if (bounty.can_close) {
      if (bounty.state === 'resolved') {
        return (
          <a className="btn btn-default" name="event_comment[type]" value="Event::Reopen" type="submit">
            Comment {' & '} Reopen
          </a>
        );
      }

      return (
        <a className="btn btn-default" name="event_comment[type]" value="Event::Close" type="submit">
          Comment {' & '} Close
        </a>
      );
    }
  },

  renderDiscussion: function() {
    var bounty = this.state.bounty;
    var product = this.props.item.product;
    var productSlug = product.slug;

    app.product = new Product(product);
    app.wip = new Wip(bounty);
    app.wipEvents = new WipEvents(this.state.events, {
      url: '/' + productSlug + '/bounties/' + bounty.number + '/comments'
    });

    app.discussionView = new DiscussionView({
      el: $('#discussion-view-el'),
      tipsPath: '/' + productSlug + '/tips',
      model: app.wip
    });

    var events = this.state.events.sort(function(a, b) {
      var aDate = new Date(a.timestamp);
      var bDate = new Date(b.timestamp);

      return aDate > bDate ? 1 : bDate > aDate ? -1 : 0;
    });

    return _.map(events, function(event, i) {
      var type = event.type;
      var renderedEvent;

      switch(event.type) {
      case 'Event::Allocation':
        renderedEvent = null;
        break;
      case 'Event::Close':
        renderedEvent = <NewsFeedItemBountyClose {...event} />;
        break;
      case 'Event::CommentReference':
        renderedEvent = <NewsFeedItemBountyCommentReference {...event} />;
        break;
      case 'Event::ReviewReady':
        renderedEvent = <NewsFeedItemBountyReviewReady {...event} />;
        break;
      case 'Event::Win':
        renderedEvent = <NewsFeedItemBountyWin {...event} />;
        break;
      case 'Event::TagChange':
        // don't render tag change events
        // renderedEvent = <NewsFeedItemBountyTagChange {...event} />;
        // See TODO in NewsFeedItemBountyTagChange
        renderedEvent = <span />;
        break;
      case 'Event::TitleChange':
        renderedEvent = <NewsFeedItemBountyTitleChange {...event} />;
        break;
      default:
        renderedEvent = <NewsFeedItemBountyTimelineItem {...event} />;
        break;
      }

      if (i + 1 === events.length ) {
        var bounty = this.props.item.target;

        if (bounty) {
          var timestamp = (
            <div className="timeline-insert js-timestamp" key={'timestamp-' + bounty.id}>
              <time className="timestamp" dateTime={event.timestamp}>{$.timeago(event.timestamp)}</time>
              <ReadReceipts url={'/_rr/articles/' + bounty.id} track_url={event.readraptor_track_id} />
            </div>
          );
          return [timestamp, renderedEvent];
        }
      }

      return renderedEvent;
    }.bind(this));
  },

  renderNewEventForm: function() {
    var currentUser = window.app.currentUser();
    var item = this.props.item;
    var bounty = item.target;
    var product = item.product;

    if (currentUser) {
      return (
        <div className="media new-event js-new-event alpha">

          <div className="pull-left">
            <Avatar user={currentUser.attributes} size={30} />
          </div>

          <div className="media-body" id="comment">
            <form action={'/' + product.slug + '/bounties/' + bounty.number + '/comments'} method="post" className="form">
              <input name="authenticity_token" type="hidden" value={this.props.csrf} />
              <MarkdownEditor id="event_comment_body" name="event_comment[body]" required={true} />

              <div className="form-actions mb3">
                <div className="btn-group">
                  <button name="event_comment[type]" value="Event::Comment" type="submit" className="btn btn-primary">Comment</button>
                  {this.renderCloseActions()}
                </div>
              </div>
            </form>
          </div>

        </div>
      );
    }
  }
});
