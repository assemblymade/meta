var AppCoins = require('../app_coins.js.jsx')
var Avatar = require('../avatar.js.jsx')
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
    var item = this.props.item;
    var bounty = item.target;
    var product = item.product;
    var user = item.user;

    return (
      <div className="table mb0">
        <div className="table-cell">
          <div className="px3 pt3 pb3" onClick={this.handleClick} key={'nfbi-' + bounty.id}>
            <div className="mt0 mb1 mtn1 h4 fw-500 clickable">
              <a href={bounty.url} key={"bounty-link-" + bounty.id}>
                {bounty.title}
                {' '} <span className="gray-dark fs4">#{bounty.number}</span>
              </a>
            </div>
            <div className="lh0_9 pb2">
              <div key={"bounty-value-" + bounty.id}>
                <span className="mr2 fs2" key={'mr2' + bounty.id}>
                  <AppCoins n={bounty.contracts.earnable} />
                </span>
              </div>
            </div>
            <div className="mt1 gray-darker fs4" key={'nfbi-body-' + bounty.id} onClick={this.showBounty}>
              <Markdown content={bounty.short_description} normalized={true} />
              {this.thumbnails()}
            </div>
          </div>
        </div>
      </div>
    );
  },

tags: function() {
  var item = this.props.item;
  var bounty = item.target;
  var product = item.product;

  return _.map(bounty.tags, function(tag) {
    var name = tag.name;

    return (
      <a className="mr1"
        href={product.url + '/bounties?state=open&tag=' + name}
        style={{ color: '#6e6e6e' }}
        key={bounty.id + '-' + key}>
      {name}
    </a>
  );
}.bind(this));
},

thumbnails: function() {
  var item = this.props.item;
  var bounty = item.target;
  var thumbnails = bounty.thumbnails;

  if (thumbnails.length) {
    var thumbs = _.map(thumbnails, function(thumb, i) {
      return (
        <span className="px2" key={'thumb-' + i}>
        <Thumbnail src={thumb} size={100} />
        </span>
      );
    });

    return (
      <div className="clearfix" key={'thumbs-container-' + bounty.id}>
      <div className="gray py1">Images</div>
    {thumbs}
    </div>
  );
}
}
});
