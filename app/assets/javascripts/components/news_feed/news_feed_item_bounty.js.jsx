(function() {

  var AppCoins = require('../app_coins.js.jsx')
  var Avatar = require('../avatar.js.jsx')
  var Markdown = require('../markdown.js.jsx')
  var NewsFeedItemBountyModal = require('./news_feed_item_bounty_modal.js.jsx')
  var Thumbnail = require('../thumbnail.js.jsx')

  module.exports = React.createClass({
    displayName: 'NewsFeedItemBounty',

    propTypes: {
      coins: React.PropTypes.number.isRequired,
      title: React.PropTypes.string.isRequired,
      bounty: React.PropTypes.object.isRequired,
      item: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
      return {
        modalShown: false
      };
    },

    modal: function() {
      if (this.state.modalShown) {
        return NewsFeedItemBountyModal(_.extend({}, this.props, { onHidden: this.onModalHidden }));
      }

      return null;
    },

    onModalHidden: function() {
      this.setState({
        modalShown: false
      });
    },

    render: function() {
      var bounty = this.props.bounty;
      var product = this.props.product;
      var user = this.props.user;

      var urgencies = ['Urgent', 'Now', 'Someday'];

      return (
        <div className="p3" style={{ cursor: 'pointer', 'background-color': '#fcfcfc' }} onClick={this.showBounty}>
          <a className="h3 bold mt0 mb2 blue" href="javascript:void(0);" onClick={this.showBounty} key="bounty-link">
            {bounty.title}
          </a>
          <div className="yellow mb3" key="bounty-value">
            <span className="mr2">
              <AppCoins n={bounty.value} />
            </span>
            <Urgency
              initialLabel={bounty.urgency.label}
              urgencies={urgencies}
              state={bounty.state}
              url={bounty.urgency_url} />
          </div>
          <div className="gray-darker">
            <Markdown content={bounty.short_description} normalized={true} />
            {this.thumbnails()}
          </div>
          <div key="nfib-modal" style={{ cursor: 'default', width: '80%' }}>
            {this.modal()}
          </div>
        </div>
      )
    },

    showBounty: function(e) {
      e.stopPropagation();

      var width = window.innerWidth;

      if (width > 480) {
        this.setState({
          modalShown: true
        });
      } else {
        window.location = this.props.bounty.url;
      }
    },

    tags: function() {
      var bounty = this.props.bounty;
      var product = this.props.product;

      return _.map(bounty.tags, function(tag) {
        var name = tag.name;

        return (
          <a className="mr1"
              href={product.url + '/bounties?state=open&tag=' + name}
              style={{ color: '#6e6e6e' }}>
            {name}
          </a>
        );
      }.bind(this));
    },

    thumbnails: function() {
      var thumbnails = this.props.bounty.thumbnails;

      if (thumbnails.length) {
        var thumbs = _.map(thumbnails, function(thumb) {
          return (
            <span className="px2">
              <Thumbnail src={thumb} size={100} />
            </span>
          );
        });

        thumbs.append

        return (
          <div className="clearfix">
            <div className="gray py1">Images</div>
            {thumbs}
          </div>
        );
      }
    },
  })

})()
