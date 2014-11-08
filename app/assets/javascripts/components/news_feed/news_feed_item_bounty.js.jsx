(function() {

  var Avatar = require('../avatar.js.jsx')
  var Markdown = require('../markdown.js.jsx')
  var AppCoins = require('../app_coins.js.jsx')
  var Thumbnail = require('../thumbnail.js.jsx')

  module.exports = React.createClass({
    displayName: 'NewsFeedItemBounty',

    propTypes: {
      coins: React.PropTypes.number.isRequired,
      title: React.PropTypes.string.isRequired,
      bounty: React.PropTypes.object.isRequired
    },

    render: function() {
      var bounty = this.props.bounty
      var product = this.props.product
      var user = this.props.user

      return (
        <div className="p3">
          <a className="h3 bold mt0 mb2 blue" href={bounty.url}>{bounty.title}</a>
          <div className="yellow mb3">
            <AppCoins n={bounty.value} />
          </div>
          <div className="gray-darker">
            <Markdown content={bounty.short_description} normalized={true} />
            {this.thumbnails()}
          </div>
        </div>
      )
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
