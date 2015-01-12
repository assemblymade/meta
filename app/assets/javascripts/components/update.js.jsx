var ArchivedNewsFeedItemsStore = require('../stores/archived_news_feed_items_store')
var NewsFeedItemActionCreators = require('../actions/news_feed_item_action_creators')
var SubscriptionsStore = require('../stores/subscriptions_store')
var TextPost = require('./ui/text_post.js.jsx')
var UserStore = require('../stores/user_store')


window.UserStore = UserStore

var Update = React.createClass({

  propTypes: {
    update: React.PropTypes.element,
    newsFeedItem: React.PropTypes.element,
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
    console.log(this.props)
    console.log(this.props.newsFeedItem.heartable_id)

    return (
      <div>
        <div className="p4">
          <TextPost author={this.props.update.user} timestamp={this.props.update.created} title={this.props.update.title} body={this.props.update.markdown_body} labels={this.props.update.marks} />
        </div>

        <div className="px3 py2 border-top border-bottom">
          <Love heartable_id={this.props.newsFeedItem.heartable_id} heartable_type="NewsFeedItem" />
        </div>

        {this.renderFooter()}
      </div>
    )
  },

  renderFooter: function() {
    return (
      <div className="card-footer px3 py2 clearfix">
        <ul className="list-inline mt0 mb0 py1 right">
          {this.renderArchiveButton()}
          {this.renderSubscribeButton()}
          {this.renderEditButton()}
        </ul>
      </div>
    )
  },

  renderArchiveButton: function() {
    if (!UserStore.isCoreTeam()) {
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
    if (UserStore.isCoreTeam() || this.props.user.id === UserStore.getId()) {
      var update = this.props.update;

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
  },

})

module.exports = window.Update = Update
