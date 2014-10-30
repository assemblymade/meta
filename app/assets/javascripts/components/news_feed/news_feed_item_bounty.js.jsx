(function() {

  var Avatar = require('../avatar.js.jsx')

  module.exports = React.createClass({
    displayName: 'NewsFeedItemBounty',

    propTypes: {
      bounty: React.PropTypes.object.isRequired
    },

    render: function() {
      var bounty = this.props.bounty
      var product = this.props.product
      var user = this.props.user

      return (
        <div className="p3">

          <div className="left">
            <AppIcon app={this.props.product} size={42} />
          </div>
          <div className="overflow-hidden p2">
            <a href={product.url}>{product.name}</a>
            <span className="gray-dark pull-right">{this.tags()}</span>
          </div>

          <a href={bounty.url} className="h4 mt0 mb2 block" style={{ color: '#333' }}>
            <strong className="text-coins">
              <span className="icon icon-app-coin"></span>
              {' '}
              <span>{numeral(bounty.value).format('0,0')}</span>
            </strong>
            {' '}
            {bounty.title}
            {' '}
            <span className="gray-dark">#{bounty.number}</span>
          </a>
          <div className="gray-darker" dangerouslySetInnerHTML={{__html: bounty.markdown_description}} />

          <div className="clearfix gray h6 mt0 mb2">
            <div className="left mr1">
              <Avatar user={user} size={18} />
            </div>
            <div className="overflow-hidden">
              <a className="gray" href={user.url}>{user.username}</a>
            </div>
          </div>

          <a className="text-small" href={bounty.url}>Read more</a>
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
