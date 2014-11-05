(function() {

  var Avatar = require('../avatar.js.jsx')
  var Markdown = require('../markdown.js.jsx')
  var AppCoins = require('../app_coins.js.jsx')

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
            <Markdown content={bounty.markdown_description} normalized={true} />
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
    }
  })

})()
