(function() {

  var AppCoins = require('../app_coins.js.jsx')
  var Avatar = require('../avatar.js.jsx')
  var Markdown = require('../markdown.js.jsx')
  var NewsFeedItemBountyModal = require('./news_feed_item_bounty_modal.js.jsx')
  var Thumbnail = require('../thumbnail.js.jsx')

  var URGENCIES = ['Urgent', 'Now', 'Someday'];

  module.exports = React.createClass({
    displayName: 'NewsFeedItemBounty',

    propTypes: {
      item: React.PropTypes.object.isRequired
    },

    clickedBountyLink: function(e) {
      var item = this.props.item;
      var bounty = item.target;

      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();

        this.showBounty(e);
      }
    },

    getInitialState: function() {
      return {
        modalShown: false
      };
    },

    modal: function() {
      if (this.state.modalShown) {
        return <NewsFeedItemBountyModal {...this.props} onHidden={this.onModalHidden} />
      }

      return null;
    },

    onModalHidden: function() {
      this.setState({
        modalShown: false
      });
    },

    render: function() {
      var item = this.props.item;
      var bounty = item.target;
      var product = item.product;
      var user = item.user;

      return (
        <div className="p3"
              key={'nfbi-' + bounty.id}
              style={{ cursor: 'pointer' }}>
          <div>
            <a className="h3 block mt0 mb1 black"
                href={bounty.url}
                onClick={this.clickedBountyLink}
                key={"bounty-link-" + bounty.id}>
              {bounty.title}
              {' '}
              <span className="gray">#{bounty.number}</span>
            </a>
            <div className="yellow mb3" key={"bounty-value-" + bounty.id}>
              <span className="mr2" key={'mr2' + bounty.id}>
                <AppCoins n={bounty.contracts.earnable} />
              </span>
              <Urgency
                 initialLabel={bounty.urgency.label}
                 urgencies={URGENCIES}
                 state={bounty.state}
                 url={bounty.urgency_url} />
            </div>
          </div>
          <div className="gray-darker"
                key={'nfbi-body-' + bounty.id}
                onClick={this.showBounty}>
            <Markdown content={bounty.short_description} normalized={true} />
            {this.thumbnails()}
          </div>
          <div key={"nfib-modal-" + bounty.id} style={{ cursor: 'default', width: '80%' }}>
            {this.modal()}
          </div>
        </div>
      );
    },

    showBounty: function(e) {
      var item = this.props.item;
      var bounty = item.target;

      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        return window.open(bounty.url, '_blank');
      }

      e.preventDefault();
      e.stopPropagation();

      var width = window.innerWidth;

      if (width > 480) {
        this.setState({
          modalShown: true
        });
      } else {
        window.location = bounty.url;
      }
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
})();
