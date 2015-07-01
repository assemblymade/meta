var ArchivedNewsFeedItemsStore = require('../stores/archived_news_feed_items_store');
var Heart = require('./heart.js.jsx');
var NewsFeedItemActionCreators = require('../actions/news_feed_item_action_creators');
var ProductStore = require('../stores/product_store');
var SubscriptionsStore = require('../stores/subscriptions_store');
var TextPost = require('./ui/text_post.js.jsx');
var UserStore = require('../stores/user_store');

var Update = React.createClass({

  propTypes: {
    update: React.PropTypes.shape({
      created_at: React.PropTypes.string,
      markdown_body: React.PropTypes.string,
      marks: React.PropTypes.array,
      title: React.PropTypes.string,
      user: React.PropTypes.object
    }),
    newsFeedItem: React.PropTypes.object,
    productSlug: React.PropTypes.string
  },

  componentDidMount: function() {
    ArchivedNewsFeedItemsStore.addChangeListener(this.getStateFromStore);
    SubscriptionsStore.addChangeListener(this.getStateFromStore);
  },

  componentWillUnmount: function() {
    ArchivedNewsFeedItemsStore.removeChangeListener(this.getStateFromStore);
    SubscriptionsStore.removeChangeListener(this.getStateFromStore);
  },

  getStateFromStore: function() {
    var id = this.props.newsFeedItem.id

    this.setState({
      isArchived: ArchivedNewsFeedItemsStore.isArchived(id),
      isSubscribed: SubscriptionsStore.isSubscribed(id)
    })
  },

  getInitialState: function() {
    var id = this.props.newsFeedItem.id

    return {
      isArchived: ArchivedNewsFeedItemsStore.isArchived(id),
      isSubscribed: SubscriptionsStore.isSubscribed(id)
    }
  },

  render: function() {
    const update = this.props.update
    var footer

    if (UserStore.getUser()) {
      footer = <div className="bg-gray-5 py2 px3 clearfix">
        <ul className="list-inline mt0 mb0 py1 right">
          {this.renderArchiveButton()}
          {this.renderSubscribeButton()}
          {this.renderEditButton()}
        </ul>
      </div>
    }

    return (
      <div>
        <div className="p4">
          <TextPost author={update.user}
              timestamp={update.created_at}
              title={update.title}
              body={update.markdown_body}
              labels={update.marks} />
        </div>
        {footer}
      </div>
    )
  },

  renderArchiveButton: function() {
    if (!ProductStore.isCoreTeam(UserStore.getUser())) {
      return;
    }

    var text = 'Archive';
    if (this.state.isArchived) {
      text = 'Unarchive'
    }

    return (
      <li>
        <a href="javascript:void(0);" onClick={this.handleArchive}>{text}</a>
      </li>
    );
  },

  renderSubscribeButton: function() {
    var user = UserStore.getUser();

    if (!user) {
      return (
        <li>
          <a href="/signup">Sign up</a>
        </li>
      );
    }

    var text = 'Subscribe'
    if (this.state.isSubscribed) {
      text = 'Unsubscribe'
    }

    return (
      <li>
        <a href="javascript:void(0);" onClick={this.handleSubscribe}>{text}</a>
      </li>
    )
  },

  renderEditButton: function() {
    var update = this.props.update
    if (UserStore.isStaff() || update.user.id === UserStore.getId()) {
      return (
        <li>
          <a href={update.url + '/edit'}>Edit</a>
        </li>
      )
    }
  },

  handleArchive: function() {
    var productSlug = this.props.productSlug;
    var itemId = this.props.newsFeedItem.id;

    if (this.state.isArchived) {
      NewsFeedItemActionCreators.unarchive(productSlug, itemId);
    } else {
      NewsFeedItemActionCreators.archive(productSlug, itemId);
    }
  },

  handleSubscribe: function() {
    var productSlug = this.props.productSlug;
    var itemId = this.props.newsFeedItem.id;

    if (this.state.isSubscribed) {
      NewsFeedItemActionCreators.unsubscribe(productSlug, itemId);
    } else {
      NewsFeedItemActionCreators.subscribe(productSlug, itemId);
    }
  }

})

module.exports = window.Update = Update
