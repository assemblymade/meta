(function() {

  var Avatar = require('../avatar.js.jsx')

  module.exports = React.createClass({
    displayName: 'NewsFeedItemIntroduction',

    propTypes: {
      introduction: React.PropTypes.object.isRequired
    },

    render: function() {
      var introduction = this.props.introduction
      var user = this.props.user

      return (
        <div className="p3 clearfix">
          <a className="left block mr3">
            <Avatar user={user} size={48} />
          </a>

          <div className="overflow-hidden">
            <a className="block" href={user.url}>{user.username}</a>
            <div className="h4 mt0 mb0">{introduction.bio}</div>
          </div>
        </div>
      )
    }
  })

})()
