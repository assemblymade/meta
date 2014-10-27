(function() {

  var Avatar = require('../avatar.js.jsx')

  module.exports = React.createClass({
    displayName: 'NewsFeedItemBounty',

    propTypes: {
      bounty: React.PropTypes.object.isRequired
    },

    render: function() {
      var bounty = this.props.bounty
      var user = this.props.user

      return (
        <div className="p3">
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

          <div className="clearfix gray h6 mt0 mb2">
            <div className="left mr1">
              <Avatar user={user} size={18} />
            </div>
            <div className="overflow-hidden">
              Created by
              {' '}
              <a className="gray" href={user.url}>{user.username}</a>
            </div>
          </div>

          <div className="gray-darker" dangerouslySetInnerHTML={{__html: bounty.markdown_description}} />

          <a className="btn btn-pill btn-sm" href={bounty.url}>Read more</a>
        </div>
      )
    }
  })

})()
